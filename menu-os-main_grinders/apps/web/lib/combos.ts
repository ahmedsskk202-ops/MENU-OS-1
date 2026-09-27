import { prisma } from "./db";
import { Prisma, readStrArray, readIntArray } from "@menu-os/db";
import type { DiscountableLine } from "./discounts";
import { isScheduleAndLimitEligible, claimPerCustomerLimit } from "./promo-scheduling";

/**
 * Fixed-price combo/bundle — a DIFFERENT pricing mechanism from the Promotion engine
 * (lib/promotions.ts): a bundle-price OVERRIDE for a set of slots ("Burger + Fries +
 * Drink = 15,000"), not a per-unit percentage/fixed/free benefit. Deliberately kept as
 * its own small evaluator rather than forced into evaluateBenefit's shape — but reuses
 * the same schedule/branch/limit gate (promo-scheduling.ts), the same cheapest-unit
 * fairness rule, the same race-safe claim pattern, and plugs into the exact same
 * priority-based, non-stacking candidate resolution in lib/pricing.ts.
 */
export interface ComboBenefitResult {
  comboDealId: string;
  comboDealName: string;
  priority: number;
  amountApplied: Prisma.Decimal; // total savings vs. buying every matched item separately
  setsApplied: number;
  fixedPricePerSet: Prisma.Decimal;
  maxUsesTotal: number | null;
  maxUsesPerCustomer: number | null;
}

type ComboDealRow = Prisma.ComboDealGetPayload<{ include: { slots: true } }>;

/** A slot whose product/category id lists have been decoded from their JSON text. */
export interface DecodedComboSlot {
  label: string;
  productIds: string[];
  categoryIds: string[];
  quantity: number;
  sortOrder: number;
}

/**
 * A ComboDeal with its SQLite-encoded columns turned back into real arrays — the same
 * decode-at-the-boundary pattern as `decodePromotion` in lib/promotions.ts. The deal's
 * own `branchIds`/`daysOfWeek` and each slot's `productIds`/`categoryIds` are all JSON
 * text since the move off PostgreSQL.
 */
export interface ComboDealRecord extends Omit<ComboDealRow, "branchIds" | "daysOfWeek" | "slots"> {
  branchIds: string[];
  daysOfWeek: number[];
  slots: DecodedComboSlot[];
}

export function decodeComboDeal(row: ComboDealRow): ComboDealRecord {
  return {
    ...row,
    branchIds: readStrArray(row.branchIds),
    daysOfWeek: readIntArray(row.daysOfWeek),
    slots: row.slots.map((s) => ({
      label: s.label,
      productIds: readStrArray(s.productIds),
      categoryIds: readStrArray(s.categoryIds),
      quantity: s.quantity,
      sortOrder: s.sortOrder,
    })),
  };
}

function round0(d: Prisma.Decimal): Prisma.Decimal {
  return d.toDecimalPlaces(0);
}

function matchesSlot(line: DiscountableLine, slot: { productIds: string[]; categoryIds: string[] }): boolean {
  return slot.productIds.includes(line.productId) || slot.categoryIds.includes(line.categoryId);
}

/** How many complete sets the cart can form, and what those specific items originally cost. */
function evaluateCombo(combo: ComboDealRecord, lines: DiscountableLine[]): ComboBenefitResult | null {
  if (combo.slots.length === 0) return null;

  // Bottlenecked by whichever slot the cart can fill the fewest times — same logic as
  // a recipe needing every ingredient present before it can be made even once.
  let setsQualified = Infinity;
  for (const slot of combo.slots) {
    const matchingQty = lines.filter((l) => matchesSlot(l, slot)).reduce((s, l) => s + l.quantity, 0);
    setsQualified = Math.min(setsQualified, Math.floor(matchingQty / slot.quantity));
  }
  if (setsQualified <= 0) return null;
  if (!combo.allowMultiplePerOrder) setsQualified = Math.min(setsQualified, 1);

  // The CHEAPEST matching units per slot count toward "original value" — not the
  // customer's pick — so ordering the priciest match in a slot can't inflate the
  // displayed savings or the recorded discount cost.
  let originalSum = new Prisma.Decimal(0);
  for (const slot of combo.slots) {
    let remaining = slot.quantity * setsQualified;
    const matchingLines = [...lines.filter((l) => matchesSlot(l, slot))].sort((a, b) => a.unitPriceSnapshot.cmp(b.unitPriceSnapshot));
    for (const line of matchingLines) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, line.quantity);
      originalSum = originalSum.add(line.unitPriceSnapshot.mul(take));
      remaining -= take;
    }
  }

  const bundleCost = combo.fixedPrice.mul(setsQualified);
  let amount = originalSum.sub(bundleCost);
  if (amount.lte(0)) return null; // misconfigured (bundle costs more than buying separately) — grant nothing rather than a negative discount
  amount = round0(amount);
  if (amount.isZero()) return null;

  return {
    comboDealId: combo.id,
    comboDealName: combo.name,
    priority: combo.priority,
    amountApplied: amount,
    setsApplied: setsQualified,
    fixedPricePerSet: combo.fixedPrice,
    maxUsesTotal: combo.maxUsesTotal,
    maxUsesPerCustomer: combo.maxUsesPerCustomer,
  };
}

async function passesPerCustomerPreCheck(combo: { id: string; maxUsesPerCustomer: number | null }, customerSessionId?: string): Promise<boolean> {
  if (combo.maxUsesPerCustomer === null || !customerSessionId) return true;
  const priorRedemptions = await prisma.comboRedemption.count({
    where: { comboDealId: combo.id, customerSessionId },
  });
  return priorRedemptions < combo.maxUsesPerCustomer;
}

/** All active combos that actually form at least one complete, cheaper-than-separate set right now. */
export async function findComboCandidates(params: {
  brandId: string;
  branchId: string;
  lines: DiscountableLine[];
  customerSessionId?: string;
  now?: Date;
}): Promise<ComboBenefitResult[]> {
  const now = params.now ?? new Date();
  const rows = await prisma.comboDeal.findMany({ where: { brandId: params.brandId, status: "ACTIVE" }, include: { slots: true } });
  const results: ComboBenefitResult[] = [];
  for (const row of rows) {
    const combo = decodeComboDeal(row);
    if (!isScheduleAndLimitEligible(combo, { now, branchId: params.branchId })) continue;
    if (!(await passesPerCustomerPreCheck(combo, params.customerSessionId))) continue;
    const result = evaluateCombo(combo, params.lines);
    if (result) results.push(result);
  }
  return results;
}

/** Race-safe global usage claim — identical pattern to claimPromotionUse/claimCouponUse. */
export async function claimComboUse(tx: Prisma.TransactionClient, comboDealId: string, maxUsesTotal: number | null): Promise<boolean> {
  const result = await tx.comboDeal.updateMany({
    where: maxUsesTotal === null ? { id: comboDealId } : { id: comboDealId, usesCount: { lt: maxUsesTotal } },
    data: { usesCount: { increment: 1 } },
  });
  return result.count > 0;
}

/** Race-safe per-guest-limit claim — same guarantee as claimPromotionPerCustomerLimit. */
export async function claimComboPerCustomerLimit(
  tx: Prisma.TransactionClient,
  params: { comboDealId: string; maxUsesPerCustomer: number | null; customerSessionId?: string; currentOrderId: string }
): Promise<boolean> {
  return claimPerCustomerLimit(tx, {
    lockNamespace: "combo",
    recordId: params.comboDealId,
    maxUsesPerCustomer: params.maxUsesPerCustomer,
    customerSessionId: params.customerSessionId,
    currentOrderId: params.currentOrderId,
    countPriorRedemptions: () =>
      tx.comboRedemption.count({
        where: { comboDealId: params.comboDealId, customerSessionId: params.customerSessionId },
      }),
  });
}

export interface ActiveComboOffer {
  comboDealId: string;
  name: string;
  description: string | null;
  fixedPrice: number;
  slots: DecodedComboSlot[];
}

/** Menu-level combo listing — schedule/branch-eligible right now, independent of any cart. */
export async function getActiveComboOffers(brandId: string, branchId: string, now: Date = new Date()): Promise<ActiveComboOffer[]> {
  const rows = await prisma.comboDeal.findMany({ where: { brandId, status: "ACTIVE" }, include: { slots: { orderBy: { sortOrder: "asc" } } } });
  return rows
    .map(decodeComboDeal)
    .filter((c) => isScheduleAndLimitEligible(c, { now, branchId }))
    .map((c) => ({
      comboDealId: c.id,
      name: c.name,
      description: c.description,
      fixedPrice: c.fixedPrice.toNumber(),
      slots: c.slots,
    }));
}

/** Real, database-derived per-combo dashboard — no estimates, no placeholders. */
export async function getComboAnalytics(comboDealId: string) {
  const comboRow = await prisma.comboDeal.findUniqueOrThrow({ where: { id: comboDealId }, include: { slots: true } });
  const combo = decodeComboDeal(comboRow);
  const redemptions = await prisma.comboRedemption.findMany({ where: { comboDealId }, include: { order: true } });

  const ordersUsingOffer = redemptions.length;
  const totalSavings = redemptions.reduce((s, r) => s + r.savedAmount.toNumber(), 0);
  const revenueGenerated = redemptions.reduce((s, r) => s + r.order.total.toNumber(), 0);
  const avgOrderValue = ordersUsingOffer > 0 ? revenueGenerated / ordersUsingOffer : 0;
  const totalSetsSold = redemptions.reduce((s, r) => s + r.setsApplied, 0);

  const branchTotals = new Map<string, { orders: number; revenue: number }>();
  for (const r of redemptions) {
    const entry = branchTotals.get(r.order.branchId) ?? { orders: 0, revenue: 0 };
    entry.orders++;
    entry.revenue += r.order.total.toNumber();
    branchTotals.set(r.order.branchId, entry);
  }
  const branches = await prisma.branch.findMany({ where: { id: { in: [...branchTotals.keys()] } } });
  const branchPerformance = [...branchTotals.entries()].map(([branchId, v]) => ({
    branchId,
    branchName: branches.find((b) => b.id === branchId)?.name ?? branchId,
    ...v,
  }));

  return {
    combo,
    ordersUsingOffer,
    totalSavings,
    revenueGenerated,
    avgOrderValue,
    totalSetsSold,
    branchPerformance,
    usageRemaining: combo.maxUsesTotal !== null ? Math.max(0, combo.maxUsesTotal - combo.usesCount) : null,
  };
}
