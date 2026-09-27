import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@menu-os/db";
import { addStock, onHand, runStockOperation, takeStock } from "@/lib/inventory";
import { ingredientForBranch, inventoryAccess, MANAGE_ONLY } from "@/lib/inventory-access";
import { checkBranchAccess } from "@/lib/branch-access";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

// Moves stock between two branches of the same brand. The batches taken on one side
// (FIFO) are rebuilt on the other with the same cost and expiry, so a transfer never
// makes old stock look new.
const schema = z.object({
  fromBranchId: z.string(),
  toBranchId: z.string(),
  ingredientId: z.string(),
  quantity: z.number().positive(),
  notes: z.string().trim().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.fromBranchId === parsed.data.toBranchId) return NextResponse.json({ error: "same_branch" }, { status: 400 });
  const access = await inventoryAccess(MANAGE_ONLY, parsed.data.fromBranchId);
  if ("error" in access) return access.error;
  const { user, branch: from } = access;
  const denied = await checkBranchAccess(user, parsed.data.toBranchId);
  if (denied) return denied;
  const to = await prisma.branch.findUnique({ where: { id: parsed.data.toBranchId } });
  if (!to || to.brandId !== from.brandId) return NextResponse.json({ error: "different_brand" }, { status: 400 });
  const ingredient = await ingredientForBranch(parsed.data.ingredientId, from.brandId);
  if (!ingredient) return NextResponse.json({ error: "unknown_ingredient" }, { status: 400 });

  const qty = new Prisma.Decimal(parsed.data.quantity);
  const result = await runStockOperation([from.id, to.id], user.id, async (tx, ctx) => {
    const available = await onHand(tx, from.id, ingredient.id);
    if (available.lt(qty)) return { error: "insufficient", available: available.toNumber() } as const;
    const suffix = parsed.data.notes ? ` — ${parsed.data.notes}` : "";
    const { taken } = await takeStock(tx, ctx, { branchId: from.id, ingredient, quantity: qty, type: "TRANSFER_OUT", reason: `Transfer to ${to.name}${suffix}` });
    for (const t of taken) {
      await addStock(tx, ctx, {
        branchId: to.id,
        ingredient,
        quantity: t.quantity,
        unitCost: t.batch.unitCost,
        type: "TRANSFER_IN",
        expiresAt: t.batch.expiresAt,
        receivedAt: t.batch.receivedAt,
        batchCode: t.batch.batchCode,
        supplier: t.batch.supplier,
        reason: `Transfer from ${from.name}${suffix}`,
      });
    }
    await writeAuditLog(tx, {
      tenantId: user.tenantId,
      branchId: from.id,
      userId: user.id,
      action: "inventory.transferred",
      entityType: "Ingredient",
      entityId: ingredient.id,
      after: { from: from.name, to: to.name, quantity: parsed.data.quantity, unit: ingredient.unit },
    });
    return { ok: true } as const;
  });

  if ("error" in result) return NextResponse.json(result, { status: 409 });
  return NextResponse.json(result, { status: 201 });
}
