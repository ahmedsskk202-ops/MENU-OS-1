import { prisma } from "./db";
import { Prisma, readStrArray } from "@menu-os/db";

/** A coupon row with its JSON-text id lists decoded into real arrays. */
export function decodeCoupon<T extends { branchIds: string; applicableProductIds: string; applicableCategoryIds: string }>(row: T) {
  return {
    ...row,
    branchIds: readStrArray(row.branchIds),
    applicableProductIds: readStrArray(row.applicableProductIds),
    applicableCategoryIds: readStrArray(row.applicableCategoryIds),
  };
}

export interface DiscountableLine {
  productId: string;
  categoryId: string;
  nameSnapshot: string;
  unitPriceSnapshot: Prisma.Decimal;
  quantity: number;
  lineTotal: Prisma.Decimal;
}

export interface DiscountComputation {
  couponId: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_ITEM";
  value: Prisma.Decimal;
  amountApplied: Prisma.Decimal;
  maxUses: number | null;
  // Only set for FREE_ITEM — which line in *this* cart was picked, for display and
  // for the Discount record (spec: "show the free product clearly in cart/order/admin").
  freeProductId?: string;
  freeProductName?: string;
}

/**
 * Validates a coupon code against every server-side rule (active, validity window,
 * usage limit, branch, minimum order, product/category scope) and computes exactly
 * how much it's worth — never trusting anything the client claims about the discount.
 * Throws a user-facing message on the first rule that fails.
 */
export async function validateAndComputeCoupon(params: {
  brandId: string;
  branchId: string;
  code: string;
  subtotal: Prisma.Decimal;
  lines: DiscountableLine[];
}): Promise<DiscountComputation> {
  const row = await prisma.coupon.findUnique({
    where: { brandId_code: { brandId: params.brandId, code: params.code.trim().toUpperCase() } },
  });
  if (!row || !row.isActive) throw new Error("Invalid discount code");
  // The id lists are JSON text in SQLite. Read raw, `"[]".length` is 2 and
  // `.includes()` is a substring test — which refused every coupon at every branch.
  const coupon = decodeCoupon(row);

  // Rules shared by every discount type — validity window, usage limit, branch,
  // minimum order — checked once, identically, regardless of PERCENTAGE/FIXED/FREE_ITEM.
  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) throw new Error("This discount code is not active yet");
  if (coupon.expiresAt && now > coupon.expiresAt) throw new Error("This discount code has expired");
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) throw new Error("This discount code has reached its usage limit");
  if (coupon.branchIds.length > 0 && !coupon.branchIds.includes(params.branchId)) {
    throw new Error("This discount code is not valid at this branch");
  }
  if (coupon.minOrderAmount && params.subtotal.lt(coupon.minOrderAmount)) {
    throw new Error(`This discount requires a minimum order of ${coupon.minOrderAmount.toString()}`);
  }

  const eligibleLines = params.lines.filter(
    (l) => coupon.applicableProductIds.includes(l.productId) || coupon.applicableCategoryIds.includes(l.categoryId)
  );

  if (coupon.discountType === "FREE_ITEM") {
    // Creation-time validation already requires a non-empty scope for FREE_ITEM
    // (see POST /api/coupons), so an empty scope here means a data problem, not a
    // customer error — but the customer-facing message stays the same either way:
    // there's nothing in this cart the coupon can apply to.
    if (eligibleLines.length === 0) throw new Error("This discount code does not apply to any items in your cart");
    // The CHEAPEST eligible unit is the one made free — not the customer's pick —
    // so ordering several matching items can't be used to give away the priciest one.
    const cheapest = eligibleLines.reduce((min, l) => (l.unitPriceSnapshot.lt(min.unitPriceSnapshot) ? l : min));
    const amountApplied = cheapest.unitPriceSnapshot.toDecimalPlaces(0);
    return {
      couponId: coupon.id,
      code: coupon.code,
      type: "FREE_ITEM",
      value: coupon.value,
      amountApplied,
      maxUses: coupon.maxUses,
      freeProductId: cheapest.productId,
      freeProductName: cheapest.nameSnapshot,
    };
  }

  let discountableBase = params.subtotal;
  if (coupon.applicableProductIds.length > 0 || coupon.applicableCategoryIds.length > 0) {
    discountableBase = eligibleLines.reduce((sum, l) => sum.add(l.lineTotal), new Prisma.Decimal(0));
    if (discountableBase.isZero()) throw new Error("This discount code does not apply to any items in your cart");
  }

  let amountApplied =
    coupon.discountType === "PERCENTAGE" ? discountableBase.mul(coupon.value).div(100) : coupon.value;
  if (coupon.discountType === "PERCENTAGE" && coupon.maxDiscountAmount && amountApplied.gt(coupon.maxDiscountAmount)) {
    amountApplied = coupon.maxDiscountAmount;
  }
  // A fixed discount (or a capped percentage one) can never exceed what it's scoped to.
  if (amountApplied.gt(discountableBase)) amountApplied = discountableBase;
  amountApplied = amountApplied.toDecimalPlaces(0);

  // Only PERCENTAGE/FIXED reach here (FREE_ITEM returned above); DISCOUNTED_ITEM is a
  // Promotion-only benefit type and is rejected by the standalone coupon creation
  // route's own schema, so it can never actually be stored on a bare Coupon.
  return { couponId: coupon.id, code: coupon.code, type: coupon.discountType as "PERCENTAGE" | "FIXED", value: coupon.value, amountApplied, maxUses: coupon.maxUses };
}

/**
 * Atomically claims one use of a coupon inside the caller's transaction — a
 * conditional UPDATE (`usedCount < maxUses`), not read-then-write, so two concurrent
 * checkouts racing the last remaining use can't both succeed. `maxUses` is passed in
 * from the same read that already validated the coupon, since Prisma's fluent API
 * can't compare one column against another directly in a WHERE clause.
 */
export async function claimCouponUse(tx: Prisma.TransactionClient, couponId: string, maxUses: number | null): Promise<boolean> {
  const result = await tx.coupon.updateMany({
    where: maxUses === null ? { id: couponId } : { id: couponId, usedCount: { lt: maxUses } },
    data: { usedCount: { increment: 1 } },
  });
  return result.count > 0;
}
