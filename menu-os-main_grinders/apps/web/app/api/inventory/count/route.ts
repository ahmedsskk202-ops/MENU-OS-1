import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@menu-os/db";
import { addStock, onHand, runStockOperation, takeStock } from "@/lib/inventory";
import { inventoryAccess, MANAGE_ONLY } from "@/lib/inventory-access";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

// A stock count (stocktake): what is physically on the shelf. The difference from the
// system figure is booked as an ADJUSTMENT — a shortfall comes out FIFO like any other
// use, a surplus goes in as a new batch at the last known cost.
const schema = z.object({
  branchId: z.string(),
  reason: z.string().trim().max(200).optional(),
  counts: z.array(z.object({ ingredientId: z.string(), counted: z.number().min(0) })).min(1).max(500),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  const access = await inventoryAccess(MANAGE_ONLY, parsed.data.branchId);
  if ("error" in access) return access.error;
  const { user, branch } = access;

  const ids = [...new Set(parsed.data.counts.map((c) => c.ingredientId))];
  const ingredients = await prisma.ingredient.findMany({ where: { id: { in: ids }, brandId: branch.brandId } });
  if (ingredients.length !== ids.length) return NextResponse.json({ error: "unknown_ingredient" }, { status: 400 });
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const reason = parsed.data.reason || "Stock count";

  const adjustments = await runStockOperation([branch.id], user.id, async (tx, ctx) => {
    const out: { ingredientId: string; before: number; counted: number; difference: number }[] = [];
    for (const c of parsed.data.counts) {
      const ingredient = byId.get(c.ingredientId)!;
      const before = await onHand(tx, branch.id, ingredient.id);
      const diff = new Prisma.Decimal(c.counted).sub(before);
      const tracked = (await tx.stockMovement.count({ where: { branchId: branch.id, ingredientId: ingredient.id } })) > 0;
      if (diff.isZero() && tracked) continue;
      if (diff.lt(0)) {
        await takeStock(tx, ctx, { branchId: branch.id, ingredient, quantity: diff.neg(), type: "ADJUSTMENT", reason });
      } else {
        // A zero count on an ingredient never stocked here still starts tracking it.
        await addStock(tx, ctx, {
          branchId: branch.id,
          ingredient,
          quantity: diff,
          unitCost: ingredient.lastUnitCost ?? new Prisma.Decimal(0),
          type: "ADJUSTMENT",
          reason,
        });
      }
      out.push({ ingredientId: ingredient.id, before: before.toNumber(), counted: c.counted, difference: diff.toNumber() });
    }
    if (out.length > 0) {
      await writeAuditLog(tx, {
        tenantId: user.tenantId,
        branchId: branch.id,
        userId: user.id,
        action: "inventory.counted",
        entityType: "Branch",
        entityId: branch.id,
        after: { reason, adjustments: out },
      });
    }
    return out;
  });

  return NextResponse.json({ adjustments });
}
