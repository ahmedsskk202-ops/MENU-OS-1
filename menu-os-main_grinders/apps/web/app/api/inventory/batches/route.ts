import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inventoryAccess, VIEW_ANY } from "@/lib/inventory-access";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const access = await inventoryAccess(VIEW_ANY, sp.get("branchId"));
  if ("error" in access) return access.error;
  const ingredientId = sp.get("ingredientId");
  const includeEmpty = sp.get("all") === "1";

  const batches = await prisma.stockBatch.findMany({
    where: {
      branchId: access.branch.id,
      ...(ingredientId ? { ingredientId } : {}),
      ...(includeEmpty ? {} : { quantityRemaining: { gt: 0 } }),
    },
    orderBy: { receivedAt: "asc" },
    take: 300,
    include: { ingredient: { select: { name: true, unit: true } }, receivedBy: { select: { name: true } } },
  });
  return NextResponse.json({
    batches: batches.map((b) => ({
      id: b.id,
      ingredientId: b.ingredientId,
      ingredient: b.ingredient,
      batchCode: b.batchCode,
      supplier: b.supplier,
      quantityReceived: b.quantityReceived.toNumber(),
      quantityRemaining: b.quantityRemaining.toNumber(),
      receivedAt: b.receivedAt,
      expiresAt: b.expiresAt,
      status: b.status,
      receivedBy: b.receivedBy?.name ?? null,
      ...(access.canSeeCost ? { unitCost: b.unitCost.toNumber() } : {}),
    })),
  });
}
