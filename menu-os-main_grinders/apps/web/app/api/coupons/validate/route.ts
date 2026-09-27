import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { priceCart } from "@/lib/pricing";
import { verifyCustomerSession, CUSTOMER_SESSION_COOKIE, verifyGuestSession, GUEST_SESSION_COOKIE } from "@/lib/customer-session";

const bodySchema = z.object({
  code: z.string().min(1).max(40).optional(), // omit to just preview automatic promotions
  lines: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(50), modifierOptionIds: z.array(z.string()).default([]) }))
    .min(1),
});

// A preview only — reuses the exact same pricing/validation path checkout will use,
// so what the guest sees here is guaranteed to match what they're actually charged.
// It never claims usage; only creating the order does that. With no code, this also
// doubles as the automatic-promotion preview the cart polls on every change (spec:
// "no code needed for automatic offers").
export async function POST(req: NextRequest) {
  const tableClaims = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  const guestClaims = tableClaims ? null : verifyGuestSession(req.cookies.get(GUEST_SESSION_COOKIE)?.value);
  const claims = tableClaims ?? guestClaims;
  if (!claims) return NextResponse.json({ error: "No active session" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const priced = await priceCart(claims.branchId, parsed.data.lines, {
      couponCode: parsed.data.code,
      customerSessionId: tableClaims?.customerSessionId ?? guestClaims?.customerSessionId,
    });
    const type = priced.coupon?.type ?? priced.promotion?.type ?? (priced.combo ? "COMBO" : null);
    return NextResponse.json({
      valid: true,
      type,
      source: priced.coupon ? "coupon" : priced.promotion ? "promotion" : priced.combo ? "combo" : null,
      promotionName: priced.promotion?.promotionName ?? null,
      comboDealName: priced.combo?.comboDealName ?? null,
      comboSetsApplied: priced.combo?.setsApplied ?? null,
      comboFixedPricePerSet: priced.combo?.fixedPricePerSet.toNumber() ?? null,
      discountTotal: priced.discountTotal.toNumber(),
      subtotal: priced.subtotal.toNumber(),
      taxTotal: priced.taxTotal.toNumber(),
      serviceFeeTotal: priced.serviceFeeTotal.toNumber(),
      total: priced.total.toNumber(),
      freeProductId: priced.coupon?.freeProductId ?? priced.promotion?.freeProductId ?? null,
      freeProductName: priced.coupon?.freeProductName ?? priced.promotion?.freeProductName ?? null,
    });
  } catch (err) {
    return NextResponse.json({ valid: false, error: err instanceof Error ? err.message : "Invalid discount code" }, { status: 422 });
  }
}
