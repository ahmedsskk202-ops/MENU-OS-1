import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { enabledProviders } from "@/lib/payments/config";
import { customerIdentity, ownsOrder, startOnlinePayment, PaymentRequestError } from "@/lib/payments/service";
import { requestOrigin } from "@/lib/payments/http";

export const dynamic = "force-dynamic";

// Which online methods the checkout may offer. No providers configured → empty list →
// the customer screens look exactly as they did before.
export async function GET(req: NextRequest) {
  const providers = [...enabledProviders(requestOrigin(req)).values()].map((p) => ({ id: p.id, test: p.simulated }));
  return NextResponse.json({ providers }, { headers: { "Cache-Control": "no-store" } });
}

const bodySchema = z.object({
  orderId: z.string().min(1).max(64),
  provider: z.enum(["CARD"]),
  language: z.enum(["en", "ar"]).optional(),
});

// Starts a hosted checkout for one of the caller's own orders. Only the order id and
// the chosen provider come from the browser — the amount is the order's outstanding
// balance, computed on the server.
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, select: { id: true, tableSessionId: true, customerSessionId: true } });
  // Same answer for "no such order" and "not yours", so order ids can't be probed.
  if (!order || !ownsOrder(customerIdentity(req), order)) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    const started = await startOnlinePayment({
      orderId: order.id,
      providerId: parsed.data.provider,
      requestOrigin: requestOrigin(req),
      language: parsed.data.language ?? "en",
    });
    return NextResponse.json({ paymentId: started.paymentId, redirectUrl: started.launchPath }, { status: started.reused ? 200 : 201 });
  } catch (err) {
    if (err instanceof PaymentRequestError) return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
    console.error("[payments] start failed", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Could not start payment", code: "ERROR" }, { status: 500 });
  }
}
