import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@menu-os/db";
import { runStockOperation, takeStock } from "@/lib/inventory";
import { inventoryAccess, WASTE_ANY } from "@/lib/inventory-access";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

// Goods leaving the store other than through a sale: sent to the kitchen or bar, used
// for staff meals, cleaning, a catering job… Taken oldest-first like everything else.
const schema = z.object({
  branchId: z.string(),
  reason: z.string().trim().min(1).max(200),
  lines: z.array(z.object({ ingredientId: z.string(), quantity: z.number().positive() })).min(1).max(100),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const access = await inventoryAccess(WASTE_ANY, parsed.data.branchId);
  if ("error" in access) return access.error;
  const { user, branch } = access;
  const ids = [...new Set(parsed.data.lines.map((l) => l.ingredientId))];
  const ingredients = await prisma.ingredient.findMany({ where: { id: { in: ids }, brandId: branch.brandId } });
  if (ingredients.length !== ids.length) return NextResponse.json({ error: "unknown_ingredient" }, { status: 400 });
  const byId = new Map(ingredients.map((i) => [i.id, i]));

  const shortfalls = await runStockOperation([branch.id], user.id, async (tx, ctx) => {
    const out: { ingredientId: string; shortfall: number }[] = [];
    for (const l of parsed.data.lines) {
      const r = await takeStock(tx, ctx, { branchId: branch.id, ingredient: byId.get(l.ingredientId)!, quantity: new Prisma.Decimal(l.quantity), type: "ISSUE", reason: parsed.data.reason });
      if (r.shortfall.gt(0)) out.push({ ingredientId: l.ingredientId, shortfall: r.shortfall.toNumber() });
    }
    await writeAuditLog(tx, {
      tenantId: user.tenantId,
      branchId: branch.id,
      userId: user.id,
      action: "inventory.issued",
      entityType: "Branch",
      entityId: branch.id,
      after: { reason: parsed.data.reason, lines: parsed.data.lines },
    });
    return out;
  });
  return NextResponse.json({ ok: true, shortfalls }, { status: 201 });
}
