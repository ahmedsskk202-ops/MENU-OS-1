import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inventoryAccess, VIEW_ANY } from "@/lib/inventory-access";

const TYPES = ["RECEIVE", "SALE", "SALE_REVERSAL", "WASTE", "EXPIRED", "ADJUSTMENT", "TRANSFER_IN", "TRANSFER_OUT", "ISSUE"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const access = await inventoryAccess(VIEW_ANY, sp.get("branchId"));
  if ("error" in access) return access.error;
  const ingredientId = sp.get("ingredientId");
  const type = sp.get("type");
  const days = Math.min(Math.max(parseInt(sp.get("days") ?? "30", 10) || 30, 1), 365);
  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? "200", 10) || 200, 1), 1000);

  const movements = await prisma.stockMovement.findMany({
    where: {
      branchId: access.branch.id,
      createdAt: { gte: new Date(Date.now() - days * 86_400_000) },
      ...(ingredientId ? { ingredientId } : {}),
      ...(type && TYPES.includes(type) ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { ingredient: { select: { name: true, unit: true } }, user: { select: { name: true } }, batch: { select: { batchCode: true } } },
  });
  return NextResponse.json({
    movements: movements.map((m) => ({
      id: m.id,
      ingredientId: m.ingredientId,
      ingredient: m.ingredient,
      type: m.type,
      quantity: m.quantity.toNumber(),
      reason: m.reason,
      orderId: m.orderId,
      user: m.user?.name ?? null,
      batchCode: m.batch?.batchCode ?? null,
      createdAt: m.createdAt,
      ...(access.canSeeCost ? { unitCost: m.unitCost.toNumber(), value: Math.round(m.quantity.toNumber() * m.unitCost.toNumber() * 100) / 100 } : {}),
    })),
  });
}
