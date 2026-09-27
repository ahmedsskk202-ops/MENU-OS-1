import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { refreshPayment, ordersPagePath } from "@/lib/payments/service";
import { requestOrigin } from "@/lib/payments/http";

export const dynamic = "force-dynamic";

// Where the card gateway sends the payer back (success, failure, cancel, timeout). Nothing
// in this URL is believed: it only triggers a server-to-server check with the provider,
// then the payer lands on their orders screen, which shows whatever the database now says.
// Hitting it again (refresh, back button, replayed link) re-reads the same decided state.
async function handle(req: NextRequest, paymentId: string) {
  const origin = requestOrigin(req);
  const head = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { provider: true, order: { select: { branchId: true, tableSessionId: true } } },
  });
  if (!head?.provider) return NextResponse.redirect(new URL("/", origin), 303);

  const params = new URLSearchParams(req.nextUrl.searchParams);

  await refreshPayment(paymentId, { requestOrigin: origin, returnParams: params, source: "return" });
  return NextResponse.redirect(new URL(`${ordersPagePath(head.order)}?payment=${encodeURIComponent(paymentId)}`, origin), 303);
}

export async function GET(req: NextRequest, { params }: { params: { paymentId: string } }) {
  return handle(req, params.paymentId);
}
