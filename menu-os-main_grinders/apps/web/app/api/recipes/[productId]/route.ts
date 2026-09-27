import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { getAnyBranchIdForBrand } from "@/lib/brand-routing";
import { checkBrandAccess } from "@/lib/brand-access";

async function getProductBrandId(productId: string): Promise<string | null> {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { category: { include: { menu: true } } } });
  return product?.category.menu.brandId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.INVENTORY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const brandId = await getProductBrandId(params.productId);
  if (!brandId) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, brandId);
  if (denied) return denied;

  const recipe = await prisma.recipe.findUnique({
    where: { productId: params.productId },
    include: { lines: { include: { ingredient: true } } },
  });
  return NextResponse.json({ recipe });
}

// Replaces the whole line list in one call — a recipe builder form, not an incremental
// line editor, so "save" always reflects exactly what's on screen.
const putSchema = z.object({
  notes: z.string().max(500).optional(),
  lines: z.array(
    z.object({
      ingredientId: z.string(),
      quantity: z.number().positive(),
      unit: z.string().min(1).max(20),
      costPerUnitSnapshot: z.number().min(0).optional(),
    })
  ),
});

export async function PUT(req: NextRequest, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.INVENTORY_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = putSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const brandId = await getProductBrandId(params.productId);
  if (!brandId) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const denied = await checkBrandAccess(user, brandId);
  if (denied) return denied;

  const recipe = await prisma.$transaction(async (tx) => {
    const r = await tx.recipe.upsert({
      where: { productId: params.productId },
      create: { productId: params.productId, notes: parsed.data.notes },
      update: { notes: parsed.data.notes },
    });
    await tx.recipeIngredient.deleteMany({ where: { recipeId: r.id } });
    if (parsed.data.lines.length > 0) {
      await tx.recipeIngredient.createMany({
        data: parsed.data.lines.map((l) => ({
          recipeId: r.id,
          ingredientId: l.ingredientId,
          quantity: l.quantity,
          unit: l.unit,
          costPerUnitSnapshot: l.costPerUnitSnapshot,
        })),
      });
    }
    const full = await tx.recipe.findUniqueOrThrow({ where: { id: r.id }, include: { lines: { include: { ingredient: true } } } });

    const product = await tx.product.findUniqueOrThrow({ where: { id: params.productId }, include: { category: { include: { menu: true } } } });
    const branchId = await getAnyBranchIdForBrand(product.category.menu.brandId);
    await writeOutboxEvent(tx, {
      branchId,
      aggregateType: "Recipe",
      aggregateId: full.id,
      eventType: "recipe.replaced",
      payload: {
        productId: params.productId,
        lines: full.lines.map((l) => ({
          id: l.id,
          ingredientId: l.ingredientId,
          quantity: l.quantity.toNumber(),
          unit: l.unit,
          costPerUnitSnapshot: l.costPerUnitSnapshot?.toNumber() ?? null,
        })),
      },
      occurredAt: new Date(),
    });

    return full;
  });

  return NextResponse.json({ recipe });
}
