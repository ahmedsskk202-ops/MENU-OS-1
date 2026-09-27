import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@menu-os/db";
import { runStockOperation, takeStock } from "@/lib/inventory";
import { ingredientForBranch, inventoryAccess, WASTE_ANY } from "@/lib/inventory-access";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  branchId: z.string(),
  ingredientId: z.string(),
  quantity: z.number().positive(),
  reason: z.string().trim().min(1).max(200),
  batchId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  const access = await inventoryAccess(WASTE_ANY, parsed.data.branchId);
  if ("error" in access) return access.error;
  const { user, branch } = access;
  const ingredient = await ingredientForBranch(parsed.data.ingredientId, branch.brandId);
  if (!ingredient) return NextResponse.json({ error: "unknown_ingredient" }, { status: 400 });

  const result = await runStockOperation([branch.id], user.id, async (tx, ctx) => {
    const r = await takeStock(tx, ctx, {
      branchId: branch.id,
      ingredient,
      quantity: new Prisma.Decimal(parsed.data.quantity),
      type: "WASTE",
      reason: parsed.data.reason,
      preferBatchId: parsed.data.batchId ?? null,
    });
    await writeAuditLog(tx, {
      tenantId: user.tenantId,
      branchId: branch.id,
      userId: user.id,
      action: "inventory.waste",
      entityType: "Ingredient",
      entityId: ingredient.id,
      after: { quantity: parsed.data.quantity, unit: ingredient.unit, reason: parsed.data.reason, cost: r.cost.toNumber() },
    });
    return r;
  });

  return NextResponse.json({ ok: true, shortfall: result.shortfall.toNumber() }, { status: 201 });
}
