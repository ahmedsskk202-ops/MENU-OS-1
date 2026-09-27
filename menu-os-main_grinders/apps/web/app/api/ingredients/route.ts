import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@menu-os/db";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { getAnyBranchIdForBrand } from "@/lib/brand-routing";
import { checkBrandAccess } from "@/lib/brand-access";
import { checkBranchAccess } from "@/lib/branch-access";
import { addStock, runStockOperation } from "@/lib/inventory";
import { ingredientFields } from "@/lib/inventory-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !(user.permissions.includes(PERMISSIONS.INVENTORY_VIEW) || user.permissions.includes(PERMISSIONS.INVENTORY_MANAGE))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const brandId = req.nextUrl.searchParams.get("brandId");
  if (!brandId) return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  const denied = await checkBrandAccess(user, brandId);
  if (denied) return denied;

  const ingredients = await prisma.ingredient.findMany({ where: { brandId }, orderBy: { name: "asc" } });
  const canSeeCost = user.permissions.includes(PERMISSIONS.INVENTORY_MANAGE);
  return NextResponse.json({ ingredients: canSeeCost ? ingredients : ingredients.map(({ lastUnitCost: _c, ...rest }) => rest) });
}


const createSchema = z.object({
  brandId: z.string(),
  name: z.string().trim().min(1).max(120),
  unit: z.string().trim().min(1).max(20),
  ...ingredientFields,
  // Opening stock goes in as the first batch of the given branch, through the ledger —
  // never straight into a stock column, or the history could not explain the number.
  currentStock: z.number().min(0).optional(),
  openingBranchId: z.string().optional(),
  openingUnitCost: z.number().min(0).optional(),
  openingExpiresAt: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.INVENTORY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const denied = await checkBrandAccess(user, parsed.data.brandId);
  if (denied) return denied;

  const { currentStock, openingBranchId, openingUnitCost, openingExpiresAt, ...fields } = parsed.data;
  const duplicate = await prisma.ingredient.findFirst({ where: { brandId: fields.brandId, name: fields.name } });
  if (duplicate) return NextResponse.json({ error: "duplicate" }, { status: 409 });

  let openingBranch: string | null = null;
  if (currentStock && currentStock > 0) {
    openingBranch = openingBranchId ?? (await getAnyBranchIdForBrand(fields.brandId));
    const branchDenied = await checkBranchAccess(user, openingBranch);
    if (branchDenied) return branchDenied;
    const branch = await prisma.branch.findUnique({ where: { id: openingBranch } });
    if (!branch || branch.brandId !== fields.brandId) return NextResponse.json({ error: "bad_branch" }, { status: 400 });
  }

  const ingredient = await prisma.$transaction(async (tx) => {
    const created = await tx.ingredient.create({
      data: { ...fields, lastUnitCost: openingUnitCost && openingUnitCost > 0 ? openingUnitCost : undefined },
    });
    const branchId = await getAnyBranchIdForBrand(created.brandId);
    await writeOutboxEvent(tx, {
      branchId,
      aggregateType: "Ingredient",
      aggregateId: created.id,
      eventType: "ingredient.created",
      payload: {
        brandId: created.brandId,
        name: created.name,
        unit: created.unit,
        currentStock: created.currentStock?.toNumber() ?? null,
        lowStockThreshold: created.lowStockThreshold?.toNumber() ?? null,
      },
      occurredAt: new Date(),
    });
    return created;
  });

  if (openingBranch && currentStock) {
    await runStockOperation([openingBranch], user.id, (tx, ctx) =>
      addStock(tx, ctx, {
        branchId: openingBranch!,
        ingredient,
        quantity: new Prisma.Decimal(currentStock),
        unitCost: new Prisma.Decimal(openingUnitCost ?? 0),
        type: "ADJUSTMENT",
        expiresAt: openingExpiresAt ? new Date(openingExpiresAt) : null,
        reason: "Opening stock",
      })
    );
  }

  return NextResponse.json({ ingredient }, { status: 201 });
}
