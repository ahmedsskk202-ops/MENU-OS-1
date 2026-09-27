import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cardNotificationSecret } from "@/lib/payments/config";
import { refreshPayment } from "@/lib/payments/service";
import { requestOrigin } from "@/lib/payments/http";

export const dynamic = "force-dynamic";

// Mastercard Gateway webhook notifications (Merchant Administration → Admin → Webhook
// Notifications). Per the gateway's documentation:
//  - it authenticates itself with the merchant's notification secret in the
//    X-Notification-Secret header (https targets only);
//  - it re-delivers (up to 20 times over 3 days) until it gets a 2xx, and expects one
//    within 2 seconds; a re-delivery carries the same X-Notification-ID;
//  - the body is the transaction response, whose `order.id` is our Payment.id.
// Mastercard itself says not to rely on webhooks for payment status, so the body's result
// is never used: a notification only tells us which payment to look at, and the status
// comes from RETRIEVE ORDER through the same locked, idempotent path as every other check.
// Replays and duplicates therefore just repeat a check whose answer is already recorded.
export async function POST(req: NextRequest) {
  const secret = cardNotificationSecret();
  if (!secret) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const given = req.headers.get("x-notification-secret") ?? "";
  if (!safeEqual(given, secret)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const paymentId = typeof body?.order?.id === "string" ? body.order.id : null;
  const payment = paymentId
    ? await prisma.payment.findFirst({ where: { id: paymentId, provider: "CARD" }, select: { id: true } })
    : null;

  // Verified in the background so the gateway gets its 2xx inside its 2-second window;
  // if this process dies first, the reconciler performs the same check within minutes.
  if (payment) {
    refreshPayment(payment.id, { requestOrigin: requestOrigin(req), source: "webhook" }).catch((err) =>
      console.warn(`[payments] webhook check for ${payment.id} failed: ${err instanceof Error ? err.message : "error"}`)
    );
  }
  // Unknown orders (someone else's, or not ours) are acknowledged too, so they aren't retried for 3 days.
  return NextResponse.json({ received: true });
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
