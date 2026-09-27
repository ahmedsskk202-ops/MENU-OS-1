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
import { addStock, onHand, runStockOperation, takeStock } from "@/lib/inventory";
import { ingredientFields } from "@/lib/inventory-access";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  unit: z.string().trim().min(1).max(20).optional(),
  ...ingredientFields,
  // Kept for older clients: setting a stock figure is a stock count for one branch, and
  // is booked through the ledger like one.
  currentStock: z.number().min(0).optional(),
  branchId: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.INVENTORY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.ingredient.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, existing.brandId);
  if (denied) return denied;

  const { currentStock, branchId: countBranchId, ...fields } = parsed.data;
  // A unit change would silently re-scale every quantity already on the books.
  if (fields.unit && fields.unit !== existing.unit) {
    const used = await prisma.stockMovement.count({ where: { ingredientId: existing.id } });
    if (used > 0) return NextResponse.json({ error: "unit_locked" }, { status: 409 });
  }

  const ingredient = await prisma.$transaction(async (tx) => {
    const updated = await tx.ingredient.update({ where: { id: params.id }, data: fields });
    const branchId = await getAnyBranchIdForBrand(updated.brandId);
    await writeOutboxEvent(tx, {
      branchId,
      aggregateType: "Ingredient",
      aggregateId: updated.id,
      eventType: "ingredient.updated",
      payload: {
        brandId: updated.brandId,
        name: updated.name,
        unit: updated.unit,
        currentStock: updated.currentStock?.toNumber() ?? null,
        lowStockThreshold: updated.lowStockThreshold?.toNumber() ?? null,
      },
      occurredAt: new Date(),
    });
    return updated;
  });

  if (currentStock !== undefined) {
    const branchId = countBranchId ?? (await getAnyBranchIdForBrand(existing.brandId));
    const branchDenied = await checkBranchAccess(user, branchId);
    if (branchDenied) return branchDenied;
    await runStockOperation([branchId], user.id, async (tx, ctx) => {
      const before = await onHand(tx, branchId, ingredient.id);
      const diff = new Prisma.Decimal(currentStock).sub(before);
      if (diff.lt(0)) await takeStock(tx, ctx, { branchId, ingredient, quantity: diff.neg(), type: "ADJUSTMENT", reason: "Stock count" });
      else if (diff.gt(0)) {
        await addStock(tx, ctx, { branchId, ingredient, quantity: diff, unitCost: ingredient.lastUnitCost ?? new Prisma.Decimal(0), type: "ADJUSTMENT", reason: "Stock count" });
      }
    });
  }

  return NextResponse.json({ ingredient: await prisma.ingredient.findUnique({ where: { id: params.id } }) });
}
