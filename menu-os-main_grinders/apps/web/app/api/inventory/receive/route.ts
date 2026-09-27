import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@menu-os/db";
import { addStock, runStockOperation } from "@/lib/inventory";
import { inventoryAccess, MANAGE_ONLY } from "@/lib/inventory-access";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

// A goods receipt: one delivery, one or more lines, each becoming its own batch.
const schema = z.object({
  branchId: z.string(),
  supplier: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  lines: z
    .array(
      z.object({
        ingredientId: z.string(),
        quantity: z.number().positive(),
        unitCost: z.number().min(0).default(0),
        expiresAt: z.string().optional().nullable(),
        batchCode: z.string().trim().max(60).optional().nullable(),
      })
    )
    .min(1)
    .max(100),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  const access = await inventoryAccess(MANAGE_ONLY, parsed.data.branchId);
  if ("error" in access) return access.error;
  const { user, branch } = access;

  const ids = [...new Set(parsed.data.lines.map((l) => l.ingredientId))];
  const ingredients = await prisma.ingredient.findMany({ where: { id: { in: ids }, brandId: branch.brandId } });
  if (ingredients.length !== ids.length) return NextResponse.json({ error: "unknown_ingredient" }, { status: 400 });
  const byId = new Map(ingredients.map((i) => [i.id, i]));

  for (const l of parsed.data.lines) {
    if (l.expiresAt && Number.isNaN(Date.parse(l.expiresAt))) return NextResponse.json({ error: "bad_expiry" }, { status: 400 });
  }

  const batches = await runStockOperation([branch.id], user.id, async (tx, ctx) => {
    const created = [];
    for (const l of parsed.data.lines) {
      created.push(
        await addStock(tx, ctx, {
          branchId: branch.id,
          ingredient: byId.get(l.ingredientId)!,
          quantity: new Prisma.Decimal(l.quantity),
          unitCost: new Prisma.Decimal(l.unitCost),
          type: "RECEIVE",
          expiresAt: l.expiresAt ? new Date(l.expiresAt) : null,
          batchCode: l.batchCode ?? null,
          supplier: parsed.data.supplier ?? null,
          notes: parsed.data.notes ?? null,
          reason: parsed.data.supplier ? `Received from ${parsed.data.supplier}` : "Received",
        })
      );
    }
    await writeAuditLog(tx, {
      tenantId: user.tenantId,
      branchId: branch.id,
      userId: user.id,
      action: "inventory.received",
      entityType: "StockBatch",
      entityId: created[0].id,
      after: { supplier: parsed.data.supplier ?? null, lines: parsed.data.lines },
    });
    return created;
  });

  return NextResponse.json({ batches }, { status: 201 });
}
