import { prisma } from "./db";
import { Prisma } from "@menu-os/db";
import { validateAndComputeCoupon, type DiscountComputation } from "./discounts";
import { findAutomaticPromotionCandidates, evaluateCouponLinkedPromotion, pickWinningDiscount, decodePromotion, STANDALONE_COUPON_PRIORITY, type PromotionBenefitResult } from "./promotions";
import { findComboCandidates, type ComboBenefitResult } from "./combos";

export interface AppliedPromotion {
  promotionId: string;
  promotionName: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_ITEM" | "DISCOUNTED_ITEM";
  amountApplied: Prisma.Decimal;
  freeProductId?: string;
  freeProductName?: string;
  maxUsesTotal: number | null;
  maxUsesPerCustomer: number | null;
  firstOrderOnly: boolean;
  viaCouponId?: string;
  viaCouponCode?: string;
}

export interface AppliedCombo {
  comboDealId: string;
  comboDealName: string;
  amountApplied: Prisma.Decimal;
  setsApplied: number;
  fixedPricePerSet: Prisma.Decimal;
  maxUsesTotal: number | null;
  maxUsesPerCustomer: number | null;
}

export interface CartLineInput {
  productId: string;
  quantity: number;
  notes?: string;
  modifierOptionIds: string[];
}

export interface PricedLine {
  productId: string;
  categoryId: string;
  nameSnapshot: string;
  unitPriceSnapshot: Prisma.Decimal;
  quantity: number;
  notes?: string;
  lineTotal: Prisma.Decimal;
  modifiers: { modifierOptionId: string; nameSnapshot: string; priceDeltaSnapshot: Prisma.Decimal }[];
}

export interface PricedCart {
  lines: PricedLine[];
  subtotal: Prisma.Decimal;
  taxTotal: Prisma.Decimal;
  serviceFeeTotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  total: Prisma.Decimal;
  coupon?: DiscountComputation;
  promotion?: AppliedPromotion;
  combo?: AppliedCombo;
}

/**
 * Server-side pricing is the only source of truth for money — the client cart
 * is a UI convenience, never trusted for totals (spec §15). A coupon code is looked
 * up and validated here too; the client only ever sends the code, never an amount.
 * Throws if a product/modifier is unavailable, inactive, sold out, or the coupon
 * (when given) fails any rule.
 */
export async function priceCart(
  branchId: string,
  lines: CartLineInput[],
  options?: { couponCode?: string; customerSessionId?: string }
): Promise<PricedCart> {
  const couponCode = options?.couponCode;
  if (lines.length === 0) throw new Error("Cart is empty");

  const pricedLines: PricedLine[] = [];
  let subtotal = new Prisma.Decimal(0);

  for (const line of lines) {
    const product = await prisma.product.findUnique({
      where: { id: line.productId },
      include: {
        availability: { where: { branchId } },
        modifierGroups: { include: { group: { include: { options: true } } } },
      },
    });
    if (!product || !product.isActive) throw new Error(`Product ${line.productId} is not available`);

    const availability = product.availability[0];
    if (availability?.status === "SOLD_OUT") throw new Error(`${product.name} is sold out`);

    let unitPrice = new Prisma.Decimal(product.basePrice);
    const modifierLines: PricedLine["modifiers"] = [];

    for (const optionId of line.modifierOptionIds) {
      const group = product.modifierGroups.find((pmg) => pmg.group.options.some((o) => o.id === optionId));
      const option = group?.group.options.find((o) => o.id === optionId);
      if (!option) throw new Error(`Modifier option ${optionId} does not belong to ${product.name}`);
      if (!option.isActive || option.stockStatus === "SOLD_OUT") {
        throw new Error(`${option.name} is unavailable`);
      }
      unitPrice = unitPrice.add(option.priceDelta);
      modifierLines.push({
        modifierOptionId: option.id,
        nameSnapshot: option.name,
        priceDeltaSnapshot: option.priceDelta,
      });
    }

    // Enforce required groups have at least one selection.
    for (const pmg of product.modifierGroups) {
      if (!pmg.group.isRequired) continue;
      const selectedInGroup = pmg.group.options.filter((o) => line.modifierOptionIds.includes(o.id));
      if (selectedInGroup.length < pmg.group.minSelect) {
        throw new Error(`${product.name}: "${pmg.group.name}" requires at least ${pmg.group.minSelect} selection(s)`);
      }
    }

    const lineTotal = unitPrice.mul(line.quantity);
    subtotal = subtotal.add(lineTotal);

    pricedLines.push({
      productId: product.id,
      categoryId: product.categoryId,
      nameSnapshot: product.name,
      unitPriceSnapshot: unitPrice,
      quantity: line.quantity,
      notes: line.notes,
      lineTotal,
      modifiers: modifierLines,
    });
  }

  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: branchId } });

  // Resolve every candidate discount source, then pick exactly one winner — no
  // stacking, by design (spec: "أولوية العروض عند التعارض"). A bare coupon code
  // (no linked Promotion) always wins over automatic promotions by default, via
  // STANDALONE_COUPON_PRIORITY; a coupon linked to a Promotion competes on that
  // Promotion's own configured priority, same as any automatic offer.
  let coupon: DiscountComputation | undefined;
  let promotion: AppliedPromotion | undefined;
  let combo: AppliedCombo | undefined;
  let discountTotal = new Prisma.Decimal(0);

  type Candidate = {
    priority: number;
    amountApplied: Prisma.Decimal;
    kind: "coupon" | "promotion" | "combo";
    ref: DiscountComputation | PromotionBenefitResult | ComboBenefitResult;
    viaCoupon?: { id: string; code: string };
  };
  const candidates: Candidate[] = [];

  if (couponCode) {
    const couponRecord = await prisma.coupon.findUnique({
      where: { brandId_code: { brandId: branch.brandId, code: couponCode.trim().toUpperCase() } },
    });
    if (!couponRecord || !couponRecord.isActive) throw new Error("Invalid discount code");

    if (couponRecord.promotionId) {
      const linkedRow = await prisma.promotion.findUnique({ where: { id: couponRecord.promotionId } });
      if (!linkedRow) throw new Error("Invalid discount code");
      const result = await evaluateCouponLinkedPromotion(decodePromotion(linkedRow), {
        branchId,
        lines: pricedLines,
        subtotal,
        customerSessionId: options?.customerSessionId,
      });
      candidates.push({ priority: result.priority, amountApplied: result.amountApplied, kind: "promotion", ref: result, viaCoupon: { id: couponRecord.id, code: couponRecord.code } });
    } else {
      const result = await validateAndComputeCoupon({ brandId: branch.brandId, branchId, code: couponCode, subtotal, lines: pricedLines });
      candidates.push({ priority: STANDALONE_COUPON_PRIORITY, amountApplied: result.amountApplied, kind: "coupon", ref: result });
    }
  }

  const autoCandidates = await findAutomaticPromotionCandidates({
    brandId: branch.brandId,
    branchId,
    lines: pricedLines,
    subtotal,
    customerSessionId: options?.customerSessionId,
  });
  for (const auto of autoCandidates) candidates.push({ priority: auto.priority, amountApplied: auto.amountApplied, kind: "promotion", ref: auto });

  // Combos compete in the exact same priority-based, non-stacking pool — a customer's
  // cart can qualify for a combo AND an automatic promotion at once, but only one
  // discount source ever wins, same rule as coupon-vs-promotion.
  const comboCandidates = await findComboCandidates({
    brandId: branch.brandId,
    branchId,
    lines: pricedLines,
    customerSessionId: options?.customerSessionId,
  });
  for (const c of comboCandidates) candidates.push({ priority: c.priority, amountApplied: c.amountApplied, kind: "combo", ref: c });

  const winner = pickWinningDiscount(candidates);
  if (winner) {
    discountTotal = winner.amountApplied;
    if (winner.kind === "coupon") {
      coupon = winner.ref as DiscountComputation;
    } else if (winner.kind === "combo") {
      const r = winner.ref as ComboBenefitResult;
      combo = {
        comboDealId: r.comboDealId,
        comboDealName: r.comboDealName,
        amountApplied: r.amountApplied,
        setsApplied: r.setsApplied,
        fixedPricePerSet: r.fixedPricePerSet,
        maxUsesTotal: r.maxUsesTotal,
        maxUsesPerCustomer: r.maxUsesPerCustomer,
      };
    } else {
      const r = winner.ref as PromotionBenefitResult;
      promotion = {
        promotionId: r.promotionId,
        promotionName: r.promotionName,
        type: r.discountType,
        amountApplied: r.amountApplied,
        freeProductId: r.freeProductId,
        freeProductName: r.freeProductName,
        maxUsesTotal: r.maxUsesTotal,
        maxUsesPerCustomer: r.maxUsesPerCustomer,
        firstOrderOnly: r.firstOrderOnly,
        viaCouponId: winner.viaCoupon?.id,
        viaCouponCode: winner.viaCoupon?.code,
      };
    }
  }

  // Tax and service fee are computed on the post-discount amount, not the raw
  // subtotal — the common real-world convention, and the reason discount must be
  // resolved before tax/fee rather than as a final subtraction at the end.
  const taxableBase = subtotal.sub(discountTotal);
  // Rounded to whole currency units — matches IQD having no minor unit in practice,
  // and avoids fractional-cent totals for any currency this branch might use.
  const taxTotal = taxableBase.mul(branch.taxRatePercent).div(100).toDecimalPlaces(0);
  const serviceFeeTotal = taxableBase.mul(branch.serviceFeeRatePercent).div(100).toDecimalPlaces(0);
  const total = taxableBase.add(taxTotal).add(serviceFeeTotal);

  return { lines: pricedLines, subtotal, taxTotal, serviceFeeTotal, discountTotal, total, coupon, promotion, combo };
}
