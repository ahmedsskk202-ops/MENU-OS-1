import type { NextRequest } from "next/server";
import { Prisma } from "@menu-os/db";
import { prisma } from "../db";
import { withPaymentLock, LockTimeoutError } from "./db-lock";
import { writeOutboxEvent } from "../outbox";
import { writeAuditLog } from "../audit";
import { notify } from "../notifications";
import { emitToBranch, emitToTableSession, emitToCustomerSession } from "../realtime";
import { verifyCustomerSession, verifyGuestSession, CUSTOMER_SESSION_COOKIE, GUEST_SESSION_COOKIE } from "../customer-session";
import { cardNotificationUrl, enabledProviders, isProduction, returnOrigin } from "./config";
import { mockProvider } from "./mock";
import { settleIfFullyPaid, broadcastPaid } from "./settle";
import { ProviderUnavailableError, type OnlineProviderId, type PaymentProvider, type VerifyOutcome } from "./types";

/**
 * Online payment lifecycle: start a hosted checkout for an order, then — only from
 * provider-verified facts — move the Payment from PENDING to VERIFIED or FAILED.
 *
 * Invariants this file keeps:
 *  - The amount is always the order's outstanding balance, computed here from the
 *    database. Nothing about amount, currency or status is taken from the browser.
 *  - Everything for one order runs under one database lease (db-lock.ts) — shared by
 *    every server process on this database — so double clicks, a second tab, a replayed
 *    return URL, a gateway webhook and the reconciler arriving together are handled one
 *    at a time.
 *  - A payment only leaves PENDING through a conditional update (`where status =
 *    PENDING`), so the same provider result applied twice changes nothing the second time.
 *    The one exception is a late capture: a FAILED card payment the gateway later shows as
 *    captured becomes VERIFIED (never the other way round).
 *  - Stock is never touched here: it is consumed when the order is placed.
 */

export const CUSTOMER_PAYMENT_SELECT = {
  id: true,
  orderId: true,
  method: true,
  amount: true,
  tipAmount: true,
  currency: true,
  status: true,
  isPartial: true,
  provider: true,
  failureReason: true,
  createdAt: true,
  refunds: true,
} satisfies Prisma.PaymentSelect;

/** What staff screens get: the customer view plus the provider reference to reconcile with. */
export const STAFF_PAYMENT_SELECT = {
  ...CUSTOMER_PAYMENT_SELECT,
  gatewayRef: true,
  providerStatus: true,
  verifiedById: true,
  shiftId: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

export class PaymentRequestError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
  }
}

interface StoredMeta {
  launch?: { kind: "redirect"; url: string } | { kind: "card-hosted"; sessionId: string; scriptUrl: string };
  secret?: Record<string, unknown>;
  expiresAt?: string;
  simulated?: boolean;
  returnUrl?: string;
}

export function readMeta(raw: string | null): StoredMeta {
  try {
    return raw ? (JSON.parse(raw) as StoredMeta) : {};
  } catch {
    return {};
  }
}

/** The guest identities a request carries (table QR session and/or pickup-delivery session). */
export function customerIdentity(req: NextRequest) {
  const table = verifyCustomerSession(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  const guest = verifyGuestSession(req.cookies.get(GUEST_SESSION_COOKIE)?.value);
  return { tableSessionId: table?.tableSessionId ?? null, customerSessionId: guest?.customerSessionId ?? null };
}

export function ownsOrder(identity: ReturnType<typeof customerIdentity>, order: { tableSessionId: string | null; customerSessionId: string | null }) {
  return (
    (!!identity.tableSessionId && order.tableSessionId === identity.tableSessionId) ||
    (!!identity.customerSessionId && order.customerSessionId === identity.customerSessionId)
  );
}

/** Where the payer lands after the provider: the orders screen of the flow they ordered from. */
export function ordersPagePath(order: { tableSessionId: string | null; branchId: string }) {
  return order.tableSessionId ? `/t/${order.tableSessionId}/orders` : `/m/${order.branchId}/orders`;
}

/** The provider a stored payment must be verified with — the simulator only for simulated rows, never in production. */
function providerForPayment(payment: { provider: string | null; providerMeta: string | null }, requestOrigin: string): PaymentProvider | null {
  const id = payment.provider as OnlineProviderId | null;
  if (id !== "CARD") return null;
  const meta = readMeta(payment.providerMeta);
  if (meta.simulated) return isProduction() ? null : mockProvider(id, () => requestOrigin);
  const real = enabledProviders(undefined).get(id);
  return real && !real.simulated ? real : null;
}

function outstanding(order: { total: Prisma.Decimal; payments: { status: string; amount: Prisma.Decimal }[] }) {
  const paid = order.payments.filter((p) => p.status === "VERIFIED").reduce((s, p) => s.plus(p.amount), new Prisma.Decimal(0));
  return order.total.minus(paid);
}

const CLOSED_ORDER = ["PAID", "CLOSED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"];

/**
 * Opens (or re-opens) a hosted checkout for the order's outstanding balance.
 * Returns a same-origin URL the browser navigates to; the provider details stay here.
 */
export async function startOnlinePayment(params: { orderId: string; providerId: OnlineProviderId; requestOrigin: string; language: "en" | "ar" }) {
  const provider = enabledProviders(params.requestOrigin).get(params.providerId);
  if (!provider) throw new PaymentRequestError("This payment method is not available", 400, "PROVIDER_DISABLED");
  const origin = returnOrigin(provider, params.requestOrigin);
  if (!origin) throw new PaymentRequestError("Online payments are not configured", 503, "NOT_CONFIGURED");

  return startLocked(`online-pay:${params.orderId}`, async () => {
    const order = await prisma.order.findUnique({ where: { id: params.orderId }, include: { payments: true, branch: { include: { brand: true } } } });
    if (!order) throw new PaymentRequestError("Order not found", 404, "NOT_FOUND");
    if (CLOSED_ORDER.includes(order.status)) throw new PaymentRequestError("This order can no longer be paid online", 409, "ORDER_CLOSED");

    const due = outstanding(order).toDecimalPlaces(3);
    if (due.lte(0)) throw new PaymentRequestError("This order is already paid", 409, "ALREADY_PAID");
    if (!provider.supportsCurrency(order.currency)) throw new PaymentRequestError("This payment method does not support the order currency", 400, "CURRENCY");
    const amount = due.toString();

    // A double click, a refresh or a second tab reuses the checkout already open for the
    // same amount instead of opening another one the payer could also complete.
    const reusable = order.payments.find((p) => {
      if (p.status !== "PENDING" || p.provider !== provider.id || !p.amount.equals(due)) return false;
      const meta = readMeta(p.providerMeta);
      return !!meta.launch && !!meta.expiresAt && Date.parse(meta.expiresAt) > Date.now() + 2 * 60_000 && !!meta.simulated === provider.simulated;
    });
    if (reusable) return { paymentId: reusable.id, launchPath: `/api/payments/online/${reusable.id}/go`, reused: true };

    const payment = await prisma.payment.create({
      data: { orderId: order.id, method: provider.method, provider: provider.id, amount: due, currency: order.currency, status: "PENDING", updatedAt: new Date() },
    });
    const returnUrl = `${origin}/api/payments/online/return/${payment.id}`;
    try {
      const session = await provider.createCheckout({
        paymentId: payment.id,
        orderId: order.id,
        amount,
        currency: order.currency,
        returnUrl,
        notificationUrl: provider.simulated ? undefined : cardNotificationUrl() ?? undefined,
        language: params.language,
        description: `${order.branch.brand.name} #${order.id.slice(-6).toUpperCase()}`,
      });
      const meta: StoredMeta = {
        launch: session.launch,
        secret: session.secretMeta,
        expiresAt: session.expiresAt.toISOString(),
        simulated: provider.simulated,
        returnUrl,
      };
      await prisma.payment.update({ where: { id: payment.id }, data: { gatewayRef: session.gatewayRef, providerMeta: JSON.stringify(meta), providerStatus: "INITIATED", updatedAt: new Date() } });
      return { paymentId: payment.id, launchPath: `/api/payments/online/${payment.id}/go`, reused: false };
    } catch (err) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: "PROVIDER_ERROR", providerStatus: "INIT_FAILED", updatedAt: new Date() } });
      console.warn(`[payments] ${provider.id} checkout could not be opened for payment ${payment.id}: ${err instanceof Error ? err.message : "error"}`);
      if (err instanceof ProviderUnavailableError) throw new PaymentRequestError("The payment provider is unavailable. Please try again.", 502, "PROVIDER_UNAVAILABLE");
      throw new PaymentRequestError(err instanceof Error ? err.message : "Could not start payment", 400, "PROVIDER_REJECTED");
    }
  });
}

/** The order's lease, with "someone else is still working on it" reported as a retryable 503. */
async function startLocked<T>(key: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await withPaymentLock(key, fn);
  } catch (err) {
    if (err instanceof LockTimeoutError) throw new PaymentRequestError("This payment is being processed. Please try again.", 503, "BUSY");
    throw err;
  }
}

const lastChecked = new Map<string, number>();

/**
 * Asks the provider what happened to a PENDING payment and records the answer.
 * Safe to call any number of times, from the return URL, a webhook, or the orders page.
 */
export async function refreshPayment(paymentId: string, opts: { requestOrigin: string; returnParams?: URLSearchParams; source: string }) {
  const head = await prisma.payment.findUnique({ where: { id: paymentId }, select: { orderId: true } });
  if (!head) return null;

  try {
    return await withPaymentLock(`online-pay:${head.orderId}`, () => checkWithProvider(paymentId, opts));
  } catch (err) {
    // Someone else has held this order's lease for too long: nothing is decided here; the
    // reconciler (or the holder) finishes the job. Report what is stored.
    if (err instanceof LockTimeoutError) return prisma.payment.findUnique({ where: { id: paymentId } });
    throw err;
  }
}

async function checkWithProvider(paymentId: string, opts: { requestOrigin: string; returnParams?: URLSearchParams; source: string }) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || !payment.provider) return payment;
  if (!payment.gatewayRef) return payment;
  // Already decided: duplicate callbacks stop here — except a failure that the payer can
  // still turn into a capture by going back into the same hosted session (see isRecheckable).
  // A gateway webhook may arrive days later (retries run for 3 days), so it may re-open
  // any declined/cancelled/expired payment; the gateway's own order record still decides.
  const lateCaptureCheck =
    payment.status === "FAILED" && (isRecheckable(payment) || (opts.source === "webhook" && RECHECKABLE_REASONS.includes(payment.failureReason ?? "")));
  if (payment.status !== "PENDING" && !lateCaptureCheck) return payment;

  // Re-checks are throttled so a hammered return URL or orders page can't hammer the
  // provider; a returning payer gets a fresh answer after a much shorter wait.
  const now = Date.now();
  if (now - (lastChecked.get(paymentId) ?? 0) < (opts.returnParams || opts.source === "webhook" ? 1000 : 3000)) return payment;
  lastChecked.set(paymentId, now);

  const provider = providerForPayment(payment, opts.requestOrigin);
  if (!provider) return payment;
  const meta = readMeta(payment.providerMeta);

  let outcome: VerifyOutcome;
  try {
    outcome = await provider.verify({
      paymentId: payment.id,
      orderId: payment.orderId,
      gatewayRef: payment.gatewayRef,
      amount: payment.amount.toString(),
      currency: payment.currency,
      secretMeta: meta.secret ?? {},
      expiresAt: meta.expiresAt ? new Date(meta.expiresAt) : null,
      returnParams: opts.returnParams,
    });
  } catch (err) {
    // Provider down or network cut: nothing is decided, the payment stays PENDING and is re-checked later.
    console.warn(`[payments] verify ${payment.id} via ${opts.source} failed: ${err instanceof Error ? err.message : "error"}`);
    return payment;
  }
  // A re-check of a failed payment can only ever record a capture, never re-fail it.
  if (lateCaptureCheck && outcome.state !== "PAID") return payment;
  return applyOutcome(payment.id, outcome, opts.source);
}

/**
 * A declined / cancelled / expired card payment whose hosted session could still be
 * completed: the payer can press Back from our site into the gateway's page and pay.
 * Those stay re-checkable (return URL, reconciler) for a while, so captured money is
 * never left recorded as failed. Mismatches and provider errors are not re-opened.
 */
const LATE_CAPTURE_WINDOW_MS = 2 * 60 * 60_000;
const RECHECKABLE_REASONS = ["DECLINED", "CANCELLED", "EXPIRED"];
function isRecheckable(p: { status: string; failureReason: string | null; createdAt: Date }) {
  return p.status === "FAILED" && RECHECKABLE_REASONS.includes(p.failureReason ?? "") && Date.now() - p.createdAt.getTime() < LATE_CAPTURE_WINDOW_MS;
}

/**
 * Background safety net for payers who pay and never come back to the site (tab closed,
 * phone died): re-checks recent card payments that are still open with the gateway.
 * Started once from instrumentation.ts.
 */
export function startPaymentReconciler(intervalMs = 120_000) {
  const g = globalThis as unknown as { __menuOsPaymentReconciler?: NodeJS.Timeout };
  if (g.__menuOsPaymentReconciler) return;
  const tick = async () => {
    try {
      const since = new Date(Date.now() - LATE_CAPTURE_WINDOW_MS);
      const settleDelay = new Date(Date.now() - 60_000);
      const open = await prisma.payment.findMany({
        where: {
          provider: { not: null },
          gatewayRef: { not: null },
          createdAt: { gte: since, lte: settleDelay },
          OR: [{ status: "PENDING" }, { status: "FAILED", failureReason: { in: ["DECLINED", "CANCELLED", "EXPIRED"] } }],
        },
        select: { id: true },
        take: 50,
      });
      for (const p of open) await refreshPayment(p.id, { requestOrigin: "", source: "reconcile" });
    } catch (err) {
      console.warn(`[payments] reconcile pass failed: ${err instanceof Error ? err.message : "error"}`);
    }
  };
  g.__menuOsPaymentReconciler = setInterval(tick, intervalMs);
}

async function applyOutcome(paymentId: string, outcome: VerifyOutcome, source: string) {
  const now = new Date();
  if (outcome.state === "PENDING") {
    return prisma.payment.update({ where: { id: paymentId }, data: { providerStatus: outcome.providerStatus, updatedAt: now } });
  }

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    const order = await tx.order.findUniqueOrThrow({ where: { id: payment.orderId }, include: { branch: { include: { brand: true } } } });
    const tenantId = order.branch.brand.tenantId;

    const changed = await tx.payment.updateMany({
      // PENDING → decided; FAILED → VERIFIED only for a late capture (refreshPayment guards that).
      where: { id: paymentId, status: outcome.state === "PAID" ? { in: ["PENDING", "FAILED"] } : "PENDING" },
      data:
        outcome.state === "PAID"
          ? { status: "VERIFIED", providerStatus: outcome.providerStatus, failureReason: null, updatedAt: now }
          : { status: "FAILED", providerStatus: outcome.providerStatus, failureReason: outcome.reason, updatedAt: now },
    });
    if (changed.count !== 1) return { payment, order, settled: null, changed: false };
    const updated = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });

    await writeOutboxEvent(tx, {
      branchId: order.branchId,
      aggregateType: "Payment",
      aggregateId: updated.id,
      eventType: "payment.recorded",
      payload: { orderId: order.id, method: updated.method, amount: updated.amount.toNumber(), tipAmount: 0, currency: updated.currency, status: updated.status },
    });
    await writeAuditLog(tx, {
      tenantId,
      branchId: order.branchId,
      action: outcome.state === "PAID" ? "payment.online_verified" : "payment.online_failed",
      entityType: "Payment",
      entityId: updated.id,
      before: { status: payment.status, reason: payment.failureReason ?? undefined },
      after: { status: updated.status, provider: updated.provider, reference: updated.gatewayRef, providerStatus: outcome.providerStatus, reason: outcome.state === "FAILED" ? outcome.reason : undefined, source },
    });

    let settled = null;
    if (outcome.state === "PAID") {
      const others = await tx.payment.aggregate({ where: { orderId: order.id, status: "VERIFIED", id: { not: updated.id } }, _sum: { amount: true } });
      const alreadyPaid = (others._sum.amount?.toNumber() ?? 0) >= order.total.toNumber() - 0.01;
      if (alreadyPaid) {
        // Money arrived for an order that was already settled (e.g. cash taken while the
        // guest was on the provider page). It is recorded as received — it was — and staff
        // are told to refund it.
        await notify(tx, {
          tenantId,
          branchId: order.branchId,
          type: "PAYMENT",
          title: `Order #${order.id.slice(-6).toUpperCase()} was paid twice — refund the online payment`,
          body: `${updated.provider} ${updated.gatewayRef ?? ""} · ${updated.amount.toString()} ${updated.currency}`,
          data: { orderId: order.id, paymentId: updated.id },
        });
      } else {
        settled = await settleIfFullyPaid(tx, order.id);
      }
    } else if (outcome.reason === "MISMATCH") {
      await notify(tx, {
        tenantId,
        branchId: order.branchId,
        type: "PAYMENT",
        title: `Online payment for order #${order.id.slice(-6).toUpperCase()} failed verification`,
        body: `${updated.provider} ${updated.gatewayRef ?? ""} — check it in the provider portal before accepting it`,
        data: { orderId: order.id, paymentId: updated.id },
      });
    }
    return { payment: updated, order, settled, changed: true };
  });

  if (result.changed) {
    const { order } = result;
    const payment = publicPayment(result.payment);
    emitToBranch(order.branchId, { type: "payment.updated", branchId: order.branchId, orderId: order.id, payment });
    if (order.tableSessionId) emitToTableSession(order.tableSessionId, { type: "payment.updated", branchId: order.branchId, orderId: order.id, payment });
    if (order.customerSessionId) emitToCustomerSession(order.customerSessionId, { type: "payment.updated", branchId: order.branchId, orderId: order.id, payment });
    if (result.settled) broadcastPaid(order);
  }
  return result.payment;
}

/** Stores the simulator's "provider-side" outcome. Simulated rows only, never in production. */
export async function recordMockOutcome(paymentId: string, status: "SUCCESS" | "DECLINED" | "CANCELLED" | "PENDING", amountOverride?: string) {
  if (isProduction()) return null;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  // FAILED too: the tester went Back into a declined/cancelled session and paid there.
  if (!payment || (payment.status !== "PENDING" && payment.status !== "FAILED")) return payment;
  const meta = readMeta(payment.providerMeta);
  if (!meta.simulated) return null;
  const mockOutcome = { status, amount: amountOverride ?? payment.amount.toString(), currency: payment.currency };
  await prisma.payment.update({ where: { id: paymentId }, data: { providerMeta: JSON.stringify({ ...meta, secret: { ...meta.secret, mockOutcome } }) } });
  return payment;
}

/** A payment row with nothing server-only on it — what realtime events carry. */
export function publicPayment(p: Record<string, any>) {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(CUSTOMER_PAYMENT_SELECT)) if (k in p) out[k] = p[k];
  return out;
}
