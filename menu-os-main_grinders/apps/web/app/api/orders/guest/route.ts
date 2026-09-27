import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createOrder } from "@/lib/orders";
import { signGuestSession, GUEST_SESSION_COOKIE } from "@/lib/customer-session";
import { ensureGuestCustomerSession } from "@/lib/guest-session";
import { formatApiError } from "@/lib/request-id";

// Self-service pickup/delivery ordering — the table-less counterpart to
// POST /api/orders. No QR scan/table required: the guest session is established
// lazily, right here, on the first order. Reuses the exact same createOrder pricing/
// kitchen-routing/outbox path as the table flow and staff-entered orders —
// only the identity mechanism (GuestSessionToken vs CustomerSessionToken) differs.
const bodySchema = z.object({
  branchId: z.string(),
  type: z.enum(["PICKUP", "DELIVERY"]),
  customerName: z.string().min(1).max(120),
  // Only a delivery needs a number to call; pickup, table and counter guests are not asked.
  phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
  clientRequestId: z.string().min(1).max(200).optional(),
  couponCode: z.string().min(1).max(40).optional(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(50),
        notes: z.string().max(300).optional(),
        modifierOptionIds: z.array(z.string()).default([]),
      })
    )
    .min(1),
  delivery: z.object({ address: z.string().min(1).max(300), zoneId: z.string().optional() }).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: formatApiError(parsed.error.flatten(), "Invalid order payload") }, { status: 400 });
  const data = parsed.data;

  if (data.type === "DELIVERY" && !data.delivery) {
    return NextResponse.json({ error: "Delivery orders require an address" }, { status: 400 });
  }
  if (data.type === "DELIVERY" && (data.phone?.trim().length ?? 0) < 3) {
    return NextResponse.json({ error: "Delivery orders require a phone number" }, { status: 400 });
  }

  const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 404 });

  const customerSessionId = await ensureGuestCustomerSession(data.branchId, req.cookies.get(GUEST_SESSION_COOKIE)?.value);
  // Fold in the name given at checkout — the placeholder "Guest" from an earlier
  // eager session-establish (e.g. the cart page's automatic-offer preview) shouldn't
  // stick once the guest actually tells us who they are.
  await prisma.customerSession.update({ where: { id: customerSessionId }, data: { displayName: data.customerName } });

  let deliveryFee = 0;
  if (data.type === "DELIVERY" && data.delivery?.zoneId) {
    const zone = await prisma.deliveryZone.findUnique({ where: { id: data.delivery.zoneId } });
    if (zone) deliveryFee = zone.feeAmount.toNumber();
  }

  try {
    const order = await createOrder({
      branchId: data.branchId,
      customerSessionId,
      type: data.type,
      lines: data.lines,
      notes: data.notes,
      clientRequestId: data.clientRequestId,
      couponCode: data.couponCode,
      delivery:
        data.type === "DELIVERY" && data.delivery
          ? { customerName: data.customerName, phone: data.phone!.trim(), address: data.delivery.address, zoneId: data.delivery.zoneId, deliveryFee }
          : undefined,
    });

    const res = NextResponse.json({ order }, { status: 201 });
    res.cookies.set(GUEST_SESSION_COOKIE, signGuestSession({ customerSessionId, branchId: data.branchId }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not place order" }, { status: 400 });
  }
}
