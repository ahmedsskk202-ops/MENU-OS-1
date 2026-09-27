import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isProduction } from "@/lib/payments/config";
import { customerIdentity, ownsOrder, ordersPagePath, readMeta, recordMockOutcome } from "@/lib/payments/service";
import { htmlPage, htmlEscape, requestOrigin } from "@/lib/payments/http";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

// LOCAL TEST SIMULATOR of a provider's hosted page (see lib/payments/mock.ts). It does
// not exist in production, only serves simulated payment rows, and says TEST on screen.
async function load(req: NextRequest, paymentId: string) {
  if (isProduction()) return null;
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { select: { branchId: true, tableSessionId: true, customerSessionId: true } } },
  });
  if (!payment || !readMeta(payment.providerMeta).simulated || !ownsOrder(customerIdentity(req), payment.order)) return null;
  return payment;
}

export async function GET(req: NextRequest, { params }: { params: { paymentId: string } }) {
  const payment = await load(req, params.paymentId);
  if (!payment) return new NextResponse("Not found", { status: 404 });
  const label = "Visa / Mastercard";
  const done = payment.status === "VERIFIED";
  return htmlPage(
    `TEST ${label}`,
    `<span class="tag">TEST MODE — NO REAL MONEY</span>
<h1 style="font-size:20px;margin:18px 0 4px">${htmlEscape(label)} (simulator)</h1>
<p style="color:#6b6258;margin:0 0 18px">Stands in for the provider's hosted page on this development server.</p>
<p style="font-size:28px;font-weight:700;margin:0 0 18px">${htmlEscape(formatMoney(payment.amount.toString(), payment.currency))}</p>
${
  done
    ? `<p>This payment is already ${htmlEscape(payment.status.toLowerCase())}.</p>`
    : `<form method="post"><input type="hidden" name="outcome" value="SUCCESS"><button class="primary" data-outcome="SUCCESS">Approve payment</button></form>
<form method="post"><input type="hidden" name="outcome" value="DECLINED"><button data-outcome="DECLINED">Decline (insufficient funds)</button></form>
<form method="post"><input type="hidden" name="outcome" value="CANCELLED"><button data-outcome="CANCELLED">Cancel and go back</button></form>
<form method="post"><input type="hidden" name="outcome" value="PENDING"><button data-outcome="PENDING">Close without finishing</button></form>
<form method="post"><input type="hidden" name="outcome" value="WRONG_AMOUNT"><button data-outcome="WRONG_AMOUNT">Approve a different amount (tamper test)</button></form>`
}`
  );
}

export async function POST(req: NextRequest, { params }: { params: { paymentId: string } }) {
  const payment = await load(req, params.paymentId);
  if (!payment) return new NextResponse("Not found", { status: 404 });
  const form = await req.formData();
  const outcome = String(form.get("outcome") ?? "");
  const returnUrl = readMeta(payment.providerMeta).returnUrl ?? "/";

  if (outcome === "WRONG_AMOUNT") await recordMockOutcome(payment.id, "SUCCESS", "1");
  else if (outcome === "SUCCESS" || outcome === "DECLINED" || outcome === "CANCELLED" || outcome === "PENDING") await recordMockOutcome(payment.id, outcome);
  else return new NextResponse("Bad request", { status: 400 });

  // "Close without finishing" = the payer abandons the provider page and goes back to
  // the menu by hand: no return URL is ever hit.
  if (outcome === "PENDING") return NextResponse.redirect(new URL(ordersPagePath(payment.order), requestOrigin(req)), 303);
  const url = new URL(returnUrl);
  if (outcome === "CANCELLED") url.searchParams.set("cancelled", "1");
  return NextResponse.redirect(url, 303);
}
