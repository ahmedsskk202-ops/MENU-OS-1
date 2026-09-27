import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inventoryAccess, VIEW_ANY } from "@/lib/inventory-access";
import { dayRange, isDate, localDate } from "@/lib/hr";

/**
 * "What came in and what went out" per item for a date range — the store book in one
 * table: opening balance, in, out (split by why), closing balance.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const access = await inventoryAccess(VIEW_ANY, sp.get("branchId"));
  if ("error" in access) return access.error;
  const today = localDate();
  const fromDate = isDate(sp.get("from")) ? sp.get("from")! : `${today.slice(0, 7)}-01`;
  const toDate = isDate(sp.get("to")) ? sp.get("to")! : today;
  const from = dayRange(fromDate).from;
  const to = dayRange(toDate).to;
  const branchId = access.branch.id;

  const [ingredients, before, during] = await Promise.all([
    prisma.ingredient.findMany({ where: { brandId: access.branch.brandId }, orderBy: { name: "asc" } }),
    prisma.stockMovement.groupBy({ by: ["ingredientId"], where: { branchId, createdAt: { lt: from } }, _sum: { quantity: true } }),
    prisma.stockMovement.groupBy({ by: ["ingredientId", "type"], where: { branchId, createdAt: { gte: from, lt: to } }, _sum: { quantity: true } }),
  ]);
  const opening = new Map(before.map((b) => [b.ingredientId, b._sum.quantity?.toNumber() ?? 0]));

  const rows = ingredients
    .map((ing) => {
      const mine = during.filter((d) => d.ingredientId === ing.id);
      const by = (types: string[]) => mine.filter((d) => types.includes(d.type)).reduce((s, d) => s + (d._sum.quantity?.toNumber() ?? 0), 0);
      const plus = mine.filter((d) => (d._sum.quantity?.toNumber() ?? 0) > 0).reduce((s, d) => s + d._sum.quantity!.toNumber(), 0);
      const minus = -mine.filter((d) => (d._sum.quantity?.toNumber() ?? 0) < 0).reduce((s, d) => s + d._sum.quantity!.toNumber(), 0);
      const open = opening.get(ing.id) ?? 0;
      const r = (n: number) => Math.round(n * 1000) / 1000;
      return {
        ingredientId: ing.id,
        name: ing.name,
        unit: ing.unit,
        opening: r(open),
        in: r(plus),
        out: r(minus),
        sold: r(-by(["SALE", "SALE_REVERSAL"])),
        issued: r(-by(["ISSUE"])),
        wasted: r(-by(["WASTE", "EXPIRED"])),
        received: r(by(["RECEIVE"])),
        closing: r(open + plus - minus),
      };
    })
    .filter((r) => r.opening !== 0 || r.in !== 0 || r.out !== 0);

  return NextResponse.json({ from: fromDate, to: toDate, rows });
}
