import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { customerIdentity, ownsOrder, ordersPagePath, readMeta } from "@/lib/payments/service";
import { requestOrigin, htmlPage, htmlEscape } from "@/lib/payments/http";

export const dynamic = "force-dynamic";

// The hand-off to the provider's hosted page. Kept behind our own URL so the browser
// never holds provider details, and so a refresh / back button on this step reopens the
// same checkout rather than creating another.
export async function GET(req: NextRequest, { params }: { params: { paymentId: string } }) {
  const origin = requestOrigin(req);
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { order: { select: { id: true, branchId: true, tableSessionId: true, customerSessionId: true } } },
  });
  if (!payment || !ownsOrder(customerIdentity(req), payment.order)) return NextResponse.redirect(new URL("/", origin), 303);

  const back = new URL(`${ordersPagePath(payment.order)}?payment=${payment.id}`, origin);
  const meta = readMeta(payment.providerMeta);
  const open = payment.status === "PENDING" && meta.launch && meta.expiresAt && Date.parse(meta.expiresAt) > Date.now();
  if (!open || !meta.launch) return NextResponse.redirect(back, 303);

  if (meta.launch.kind === "redirect") return NextResponse.redirect(meta.launch.url, 303);

  // Mastercard Hosted Checkout: the gateway's own script shows its payment page.
  const errorUrl = `${meta.returnUrl}?error=1`;
  return htmlPage(
    "Secure payment",
    `<p>Opening secure card payment…</p><noscript><p>JavaScript is required for card payment.</p></noscript><p><a href="${htmlEscape(back.toString())}">Back to your order</a></p>`,
    `<script src="${htmlEscape(meta.launch.scriptUrl)}" data-error="payError"></script>
<script>
function payError(){ window.location.replace(${js(errorUrl)}); }
Checkout.configure({ session: { id: ${js(meta.launch.sessionId)} } });
Checkout.showPaymentPage();
</script>`
  );
}

/** A string literal safe to drop inside <script>. */
function js(v: string) {
  return JSON.stringify(v).replace(/</g, String.fromCharCode(92) + "u003c");
}
