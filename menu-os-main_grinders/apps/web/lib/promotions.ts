import { prisma } from "./db";
import { Prisma, readStrArray, readIntArray, type PromotionBenefitType } from "@menu-os/db";
import type { DiscountableLine } from "./discounts";
import { isScheduleAndLimitEligible, claimPerCustomerLimit } from "./promo-scheduling";

const HIGH_PRIORITY_SENTINEL = 1_000_000; // a standalone (non-promotion-linked) coupon wins by default

export interface PromotionBenefitResult {
  promotionId: string;
  promotionName: string;
  priority: number;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_ITEM" | "DISCOUNTED_ITEM";
  amountApplied: Prisma.Decimal;
  freeProductId?: string;
  freeProductName?: string;
  benefitUnits?: number;
  maxUsesTotal: number | null;
  maxUsesPerCustomer: number | null;
  firstOrderOnly: boolean;
}

type PromotionRow = Prisma.PromotionGetPayload<Record<string, never>>;

/**
 * A Promotion with its SQLite-encoded columns turned back into real arrays.
 *
 * Since the move off PostgreSQL, `eligibleProductIds` / `eligibleCategoryIds` /
 * `benefitProductIds` / `benefitCategoryIds` / `branchIds` are JSON text and
 * `daysOfWeek` is JSON text too. Decoding once at the boundary means the rules
 * engine below is written against plain arrays and never has to remember which
 * fields used to be native Prisma lists.
 */
export interface PromotionRecord extends Omit<
  PromotionRow,
  "eligibleProductIds" | "eligibleCategoryIds" | "benefitProductIds" | "benefitCategoryIds" | "branchIds" | "daysOfWeek"
> {
  eligibleProductIds: string[];
  eligibleCategoryIds: string[];
  benefitProductIds: string[];
  benefitCategoryIds: string[];
  branchIds: string[];
  daysOfWeek: number[];
}

export function decodePromotion(row: PromotionRow): PromotionRecord {
  return {
    ...row,
    eligibleProductIds: readStrArray(row.eligibleProductIds),
    eligibleCategoryIds: readStrArray(row.eligibleCategoryIds),
    benefitProductIds: readStrArray(row.benefitProductIds),
    benefitCategoryIds: readStrArray(row.benefitCategoryIds),
    branchIds: readStrArray(row.branchIds),
    daysOfWeek: readIntArray(row.daysOfWeek),
  };
}

const BENEFIT_TYPES: readonly PromotionBenefitType[] = ["PERCENTAGE_OFF", "FIXED_OFF", "FREE_ITEM", "DISCOUNTED_ITEM"];

/**
 * Narrows a `benefitType` read back from the database.
 *
 * The column is plain `String` on SQLite, and nothing in the schema stops a bad write —
 * a hand-run `UPDATE`, a future migration, a restored dump. A benefit type we don't
 * recognise would otherwise flow into the pricing engine and be silently treated as
 * "no benefit", which is a discount that quietly disappears. Falling back to
 * `PERCENTAGE_OFF` keeps a mistyped row *visible* (it produces a percentage
 * calculation) rather than invisible, and every writer in the app is already
 * type-checked against the union, so reaching this with a bad value is a data problem
 * worth surfacing rather than a normal case.
 */
export function asBenefitType(value: string): PromotionBenefitType {
  return (BENEFIT_TYPES as readonly string[]).includes(value) ? (value as PromotionBenefitType) : "PERCENTAGE_OFF";
}

/**
 * A promotion's `benefitType` names the *rule*; the discount ledger and the receipt
 * name the *arithmetic*. `PERCENTAGE_OFF` and `PERCENTAGE` are the same thing, and the
 * receipt/gift-card/discount-apply screens have always spoken the shorter vocabulary
 * (it matches `Coupon.discountType`), so the two `_OFF` variants collapse here. This
 * is the one place that translation happens.
 */
export function toAppliedDiscountType(benefitType: string): PromotionBenefitResult["discountType"] {
  const t = asBenefitType(benefitType);
  if (t === "PERCENTAGE_OFF") return "PERCENTAGE";
  if (t === "FIXED_OFF") return "FIXED";
  return t;
}

function round0(d: Prisma.Decimal): Prisma.Decimal {
  return d.toDecimalPlaces(0);
}

/** Every schedule/window/branch/order-size gate a promotion can have, checked once. */
function isEligibleContext(promo: PromotionRecord, params: { now: Date; branchId: string; subtotal: Prisma.Decimal }): boolean {
  if (!isScheduleAndLimitEligible(promo, params)) return false;
  if (promo.minOrderAmount && params.subtotal.lt(promo.minOrderAmount)) return false;
  return true;
}

async function passesFirstOrderAndPerCustomerLimits(
  promo: PromotionRecord,
  customerSessionId: string | undefined
): Promise<boolean> {
  if (promo.firstOrderOnly && customerSessionId) {
    const priorOrder = await prisma.order.findFirst({ where: { customerSessionId } });
    if (priorOrder) return false;
  }
  if (promo.maxUsesPerCustomer !== null && customerSessionId) {
    const priorRedemptions = await prisma.promotionRedemption.count({
      where: { promotionId: promo.id, customerSessionId },
    });
    if (priorRedemptions >= promo.maxUsesPerCustomer) return false;
  }
  return true;
}

/**
 * The actual eligibility→benefit calculation. One function covers every named offer
 * type in the spec except fixed-price combo/bundle pricing (see docs note in
 * OFFLINE_ARCHITECTURE-adjacent status doc) — percentage/fixed off, product- or
 * category-scoped, BOGO-style quantity tiers (self- or cross-referential), free item,
 * and discounted item are all just different field values on the same Promotion row.
 */
function evaluateBenefit(promo: PromotionRecord, lines: DiscountableLine[], subtotal: Prisma.Decimal): PromotionBenefitResult | null {
  const isWholeCartScope = promo.eligibleProductIds.length === 0 && promo.eligibleCategoryIds.length === 0;

  // Whole-cart percentage/fixed — identical math to a standalone Coupon, just sourced
  // from Promotion fields (Happy Hour with no product scope, Weekend Offer, etc.).
  if (isWholeCartScope) {
    if (promo.benefitType !== "PERCENTAGE_OFF" && promo.benefitType !== "FIXED_OFF") return null;
    if (subtotal.isZero()) return null;
    let amount = promo.benefitType === "PERCENTAGE_OFF" ? subtotal.mul(promo.benefitValue ?? 0).div(100) : new Prisma.Decimal(promo.benefitValue ?? 0);
    if (promo.maxDiscountAmount && amount.gt(promo.maxDiscountAmount)) amount = promo.maxDiscountAmount;
    if (amount.gt(subtotal)) amount = subtotal;
    amount = round0(amount);
    if (amount.isZero()) return null;
    return {
      promotionId: promo.id,
      promotionName: promo.name,
      priority: promo.priority,
      discountType: promo.benefitType === "PERCENTAGE_OFF" ? "PERCENTAGE" : "FIXED",
      amountApplied: amount,
      maxUsesTotal: promo.maxUsesTotal,
      maxUsesPerCustomer: promo.maxUsesPerCustomer,
      firstOrderOnly: promo.firstOrderOnly,
    };
  }

  const eligibleLines = lines.filter((l) => promo.eligibleProductIds.includes(l.productId) || promo.eligibleCategoryIds.includes(l.categoryId));
  const eligibleQty = eligibleLines.reduce((s, l) => s + l.quantity, 0);
  if (eligibleQty < promo.eligibleMinQuantity) return null;

  // Scoped percentage/fixed (e.g. "20% off all coffee") — no BOGO grouping, applies to
  // the whole matching subset once the minimum quantity is met.
  if (promo.benefitType === "PERCENTAGE_OFF" || promo.benefitType === "FIXED_OFF") {
    const discountableBase = eligibleLines.reduce((s, l) => s.add(l.lineTotal), new Prisma.Decimal(0));
    if (discountableBase.isZero()) return null;
    let amount = promo.benefitType === "PERCENTAGE_OFF" ? discountableBase.mul(promo.benefitValue ?? 0).div(100) : new Prisma.Decimal(promo.benefitValue ?? 0);
    if (promo.maxDiscountAmount && amount.gt(promo.maxDiscountAmount)) amount = promo.maxDiscountAmount;
    if (amount.gt(discountableBase)) amount = discountableBase;
    amount = round0(amount);
    if (amount.isZero()) return null;
    return {
      promotionId: promo.id,
      promotionName: promo.name,
      priority: promo.priority,
      discountType: promo.benefitType === "PERCENTAGE_OFF" ? "PERCENTAGE" : "FIXED",
      amountApplied: amount,
      maxUsesTotal: promo.maxUsesTotal,
      maxUsesPerCustomer: promo.maxUsesPerCustomer,
      firstOrderOnly: promo.firstOrderOnly,
    };
  }

  // FREE_ITEM / DISCOUNTED_ITEM — inherently a per-unit grant, so it's always
  // group-based: "buy N (get M free|discounted)", repeating unless capped.
  const selfReferential = promo.benefitProductIds.length === 0 && promo.benefitCategoryIds.length === 0;
  const groupSize = selfReferential ? promo.eligibleMinQuantity + promo.benefitQuantity : promo.eligibleMinQuantity;
  const rawGroups = Math.floor(eligibleQty / groupSize);
  const groupsQualified = promo.allowMultiplePerOrder ? rawGroups : Math.min(rawGroups, 1);
  if (groupsQualified <= 0) return null;
  const benefitUnitsWanted = groupsQualified * promo.benefitQuantity;

  const benefitLines = selfReferential
    ? eligibleLines
    : lines.filter((l) => promo.benefitProductIds.includes(l.productId) || promo.benefitCategoryIds.includes(l.categoryId));
  const benefitPoolQty = benefitLines.reduce((s, l) => s + l.quantity, 0);
  const benefitUnitsActual = Math.min(benefitUnitsWanted, benefitPoolQty);
  if (benefitUnitsActual <= 0) return null;

  // The cheapest matching units get the benefit — not the customer's pick — so
  // ordering pricier matches can't be used to give away the most expensive one.
  const sortedByPrice = [...benefitLines].sort((a, b) => a.unitPriceSnapshot.cmp(b.unitPriceSnapshot));
  let remaining = benefitUnitsActual;
  let amount = new Prisma.Decimal(0);
  let cheapestLine: DiscountableLine | null = null;
  for (const line of sortedByPrice) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, line.quantity);
    if (!cheapestLine) cheapestLine = line;
    if (promo.benefitType === "FREE_ITEM") {
      amount = amount.add(line.unitPriceSnapshot.mul(take));
    } else {
      const perUnitOff = promo.benefitValue ?? 0;
      // DISCOUNTED_ITEM: benefitValue is treated as a percentage of that unit's price.
      const perUnitAmount = line.unitPriceSnapshot.mul(perUnitOff).div(100);
      amount = amount.add(perUnitAmount.mul(take));
    }
    remaining -= take;
  }
  if (promo.maxDiscountAmount && amount.gt(promo.maxDiscountAmount)) amount = promo.maxDiscountAmount;
  amount = round0(amount);
  if (amount.isZero()) return null;

  return {
    promotionId: promo.id,
    promotionName: promo.name,
    priority: promo.priority,
    discountType: toAppliedDiscountType(promo.benefitType),
    amountApplied: amount,
    freeProductId: promo.benefitType === "FREE_ITEM" ? cheapestLine?.productId : undefined,
    freeProductName: promo.benefitType === "FREE_ITEM" ? cheapestLine?.nameSnapshot : undefined,
    benefitUnits: benefitUnitsActual,
    maxUsesTotal: promo.maxUsesTotal,
    maxUsesPerCustomer: promo.maxUsesPerCustomer,
    firstOrderOnly: promo.firstOrderOnly,
  };
}

/** All active, automatic (no-code) promotions that actually produce a benefit for this cart right now. */
export async function findAutomaticPromotionCandidates(params: {
  brandId: string;
  branchId: string;
  lines: DiscountableLine[];
  subtotal: Prisma.Decimal;
  customerSessionId?: string;
  now?: Date;
}): Promise<PromotionBenefitResult[]> {
  const now = params.now ?? new Date();
  const rows = await prisma.promotion.findMany({
    where: { brandId: params.brandId, status: "ACTIVE", requiresCouponCode: false },
  });

  const results: PromotionBenefitResult[] = [];
  for (const row of rows) {
    const promo = decodePromotion(row);
    if (!isEligibleContext(promo, { now, branchId: params.branchId, subtotal: params.subtotal })) continue;
    if (!(await passesFirstOrderAndPerCustomerLimits(promo, params.customerSessionId))) continue;
    const result = evaluateBenefit(promo, params.lines, params.subtotal);
    if (result) results.push(result);
  }
  return results;
}

/** Evaluates a coupon-linked promotion (the "coupon-based offer" type) — same engine, entered via a code. */
export async function evaluateCouponLinkedPromotion(
  promo: PromotionRecord,
  params: { branchId: string; lines: DiscountableLine[]; subtotal: Prisma.Decimal; customerSessionId?: string; now?: Date }
): Promise<PromotionBenefitResult> {
  const now = params.now ?? new Date();
  if (!isEligibleContext(promo, { now, branchId: params.branchId, subtotal: params.subtotal })) {
    throw new Error("This offer is not currently available");
  }
  if (!(await passesFirstOrderAndPerCustomerLimits(promo, params.customerSessionId))) {
    throw new Error("This offer has already been used");
  }
  const result = evaluateBenefit(promo, params.lines, params.subtotal);
  if (!result) throw new Error("This discount code does not apply to any items in your cart");
  return result;
}

/** Picks a single winner among everything that qualified — no stacking, by design. */
export function pickWinningDiscount<T extends { priority: number; amountApplied: Prisma.Decimal }>(candidates: T[]): T | null {
  if (candidates.length === 0) return null;
  return candidates.reduce((best, c) => {
    if (c.priority > best.priority) return c;
    if (c.priority === best.priority && c.amountApplied.gt(best.amountApplied)) return c;
    return best;
  });
}

export const STANDALONE_COUPON_PRIORITY = HIGH_PRIORITY_SENTINEL;

/** Race-safe global usage claim — identical pattern to claimCouponUse, applied to Promotion. */
export async function claimPromotionUse(tx: Prisma.TransactionClient, promotionId: string, maxUsesTotal: number | null): Promise<boolean> {
  const result = await tx.promotion.updateMany({
    where: maxUsesTotal === null ? { id: promotionId } : { id: promotionId, usesCount: { lt: maxUsesTotal } },
    data: { usesCount: { increment: 1 } },
  });
  return result.count > 0;
}

/**
 * Race-safe per-customer-limit / first-order-only claim for a Promotion. The pre-check
 * in `passesFirstOrderAndPerCustomerLimits` above runs at pricing time (before any order
 * exists) purely as a fast-path — it can't close the race by itself, since two requests
 * from the same customer can both read "0 prior uses" before either commits. This is the
 * actual guarantee: called inside the order-creation transaction, after the order row
 * itself exists (so `currentOrderId` can be excluded from the firstOrderOnly check).
 */
export async function claimPromotionPerCustomerLimit(
  tx: Prisma.TransactionClient,
  params: { promotionId: string; maxUsesPerCustomer: number | null; firstOrderOnly: boolean; customerSessionId?: string; currentOrderId: string }
): Promise<boolean> {
  return claimPerCustomerLimit(tx, {
    lockNamespace: "promo",
    recordId: params.promotionId,
    maxUsesPerCustomer: params.maxUsesPerCustomer,
    firstOrderOnly: params.firstOrderOnly,
    customerSessionId: params.customerSessionId,
    currentOrderId: params.currentOrderId,
    countPriorRedemptions: () =>
      tx.promotionRedemption.count({
        where: { promotionId: params.promotionId, customerSessionId: params.customerSessionId },
      }),
  });
}

/** Real, database-derived per-promotion dashboard — no estimates, no placeholders. */
export async function getPromotionAnalytics(promotionId: string) {
  const promotion = await prisma.promotion.findUniqueOrThrow({ where: { id: promotionId } });
  const redemptions = await prisma.promotionRedemption.findMany({
    where: { promotionId },
    include: { order: true },
  });

  const ordersUsingOffer = redemptions.length;
  const totalDiscountValue = redemptions.reduce((s, r) => s + r.discountAmount.toNumber(), 0);
  const revenueGenerated = redemptions.reduce((s, r) => s + r.order.total.toNumber(), 0);
  const avgOrderValue = ordersUsingOffer > 0 ? revenueGenerated / ordersUsingOffer : 0;

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

  const decoded = decodePromotion(promotion);
  const productsAffected = [...new Set([...decoded.eligibleProductIds, ...decoded.benefitProductIds])];

  return {
    promotion,
    ordersUsingOffer,
    totalDiscountValue,
    revenueGenerated,
    avgOrderValue,
    productsAffected,
    branchPerformance,
    usageRemaining: promotion.maxUsesTotal !== null ? Math.max(0, promotion.maxUsesTotal - promotion.usesCount) : null,
  };
}

export interface ProductPromoBadge {
  promotionId: string;
  promotionName: string;
  kind: "PERCENTAGE_OFF" | "FIXED_OFF" | "FREE_ITEM" | "DISCOUNTED_ITEM";
  value: number | null; // percent, or a fixed/per-unit amount in the branch's currency
  buyQty: number;
  getQty: number;
  isHappyHour: boolean;
}

export interface WholeOrderPromoBadge {
  promotionId: string;
  promotionName: string;
  kind: "PERCENTAGE_OFF" | "FIXED_OFF";
  value: number;
  isHappyHour: boolean;
}

/**
 * Menu-level promotion badges — "Buy 2 Get 1 Free", "Happy Hour", "-10%" — computed
 * server-side so the customer app never re-implements eligibility logic (the server
 * stays the single source of truth for what a promotion means; this is a cosmetic
 * preview, the actual amount is still only ever computed by priceCart at order time).
 * Cart-dependent rules (minOrderAmount, eligibleMinQuantity already being met) aren't
 * evaluated here — there's no cart yet — so a badge is a "this offer exists and could
 * apply", not a guarantee; `/api/coupons/validate` is still the authoritative preview
 * once there's an actual cart.
 *
 * Category-scoped promotions are returned keyed by categoryId — the caller (the menu
 * route) is the one with the category→products tree needed to expand that.
 */
export async function getMenuPromotionBadges(
  brandId: string,
  branchId: string,
  now: Date = new Date()
): Promise<{
  productBadges: Record<string, ProductPromoBadge>;
  categoryBadges: Record<string, ProductPromoBadge>;
  wholeOrderOffers: WholeOrderPromoBadge[];
}> {
  const rows = await prisma.promotion.findMany({ where: { brandId, status: "ACTIVE", requiresCouponCode: false } });
  // Highest priority first — if two automatic offers target the same product, show the
  // one that would actually win at checkout, not an arbitrary one.
  const sorted = [...rows].sort((a, b) => b.priority - a.priority);

  const productBadges: Record<string, ProductPromoBadge> = {};
  const categoryBadges: Record<string, ProductPromoBadge> = {};
  const wholeOrderOffers: WholeOrderPromoBadge[] = [];

  for (const row of sorted) {
    const promo = decodePromotion(row);
    if (!isScheduleAndLimitEligible(promo, { now, branchId })) continue;
    const isHappyHour = promo.startTimeMinutes != null || promo.endTimeMinutes != null;
    const isWholeCart = promo.eligibleProductIds.length === 0 && promo.eligibleCategoryIds.length === 0;

    if (isWholeCart) {
      // Narrow the free-text column first, then gate on the two whole-cart benefit
      // types. Only these two can discount a whole order, so the other two are
      // meaningless here and are skipped rather than shown as a broken offer.
      const wholeKind = asBenefitType(promo.benefitType);
      if (wholeKind !== "PERCENTAGE_OFF" && wholeKind !== "FIXED_OFF") continue;
      wholeOrderOffers.push({
        promotionId: promo.id,
        promotionName: promo.name,
        kind: wholeKind,
        value: promo.benefitValue?.toNumber() ?? 0,
        isHappyHour,
      });
      continue;
    }

    const badge: ProductPromoBadge = {
      promotionId: promo.id,
      promotionName: promo.name,
      kind: asBenefitType(promo.benefitType),
      value: promo.benefitValue?.toNumber() ?? null,
      buyQty: promo.eligibleMinQuantity,
      getQty: promo.benefitQuantity,
      isHappyHour,
    };
    for (const pid of promo.eligibleProductIds) if (!productBadges[pid]) productBadges[pid] = badge;
    for (const cid of promo.eligibleCategoryIds) if (!categoryBadges[cid]) categoryBadges[cid] = badge;
  }

  return { productBadges, categoryBadges, wholeOrderOffers };
}
