import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { customerIdentity, ownsOrder, refreshPayment, publicPayment } from "@/lib/payments/service";
import { requestOrigin } from "@/lib/payments/http";

export const dynamic = "force-dynamic";

// "What happened to my payment?" — used by the orders screen when it still shows a
// payment as pending (the payer closed the provider tab, the network dropped on the way
// back…). Re-checks with the provider, server-side, and returns the stored result.
export async function POST(req: NextRequest, { params }: { params: { paymentId: string } }) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { order: { select: { tableSessionId: true, customerSessionId: true } } },
  });
  if (!payment || !payment.provider || !ownsOrder(customerIdentity(req), payment.order)) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }
  const fresh = await refreshPayment(payment.id, { requestOrigin: requestOrigin(req), source: "customer-check" });
  return NextResponse.json({ payment: publicPayment(fresh ?? payment) });
}
