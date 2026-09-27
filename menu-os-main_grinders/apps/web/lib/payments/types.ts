/**
 * Online payments — the contract every hosted-checkout provider implements.
 *
 * A provider only ever does two things: open a checkout on its own hosted page, and
 * later say — from its own server, never from the browser — what happened to it.
 * Deciding what that means for our Payment/Order rows is lib/payments/service.ts's job,
 * so provider files stay a thin, replaceable translation of one vendor's API.
 */

export type OnlineProviderId = "CARD";

export interface CheckoutRequest {
  /** Our Payment.id — also the reference we give the provider, unique per attempt. */
  paymentId: string;
  orderId: string;
  /** Exact amount to charge, as a decimal string, already computed server-side. */
  amount: string;
  currency: string;
  /** Absolute URL the provider sends the payer back to (success, failure and cancel). */
  returnUrl: string;
  /** Absolute https URL for the gateway's webhook notifications, when they are configured. */
  notificationUrl?: string;
  language: "en" | "ar";
  description: string;
}

export interface CheckoutSession {
  /** The provider's transaction / session id (stored as Payment.gatewayRef). */
  gatewayRef: string;
  /** How the payer's browser reaches the hosted page. */
  launch: { kind: "redirect"; url: string } | { kind: "card-hosted"; sessionId: string; scriptUrl: string };
  /** Server-only data needed to verify later (e.g. a success indicator). Never sent to the browser. */
  secretMeta?: Record<string, unknown>;
  expiresAt: Date;
}

export type VerifyOutcome =
  | { state: "PAID"; amount: string; currency: string; providerStatus: string }
  | { state: "FAILED"; reason: "DECLINED" | "CANCELLED" | "EXPIRED" | "MISMATCH"; providerStatus: string }
  | { state: "PENDING"; providerStatus: string };

export interface VerifyRequest {
  paymentId: string;
  orderId: string;
  gatewayRef: string;
  amount: string;
  currency: string;
  secretMeta: Record<string, unknown>;
  expiresAt: Date | null;
  /** Query string the payer came back with, if this check was triggered by the return. */
  returnParams?: URLSearchParams;
}

export interface PaymentProvider {
  id: OnlineProviderId;
  /** Payment.method the row is recorded under — reports already group by it. */
  method: "ONLINE";
  /** True for the local simulator; it must never be reachable in production. */
  simulated: boolean;
  supportsCurrency(currency: string): boolean;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  verify(req: VerifyRequest): Promise<VerifyOutcome>;
}

/** Raised when the provider can't be reached or answers with an error — never "declined". */
export class ProviderUnavailableError extends Error {}

/** Same number, allowing only for how a provider formats decimals ("25000" vs "25000.000"). */
export function sameAmount(a: string | number, b: string | number): boolean {
  const x = Number(a);
  const y = Number(b);
  return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) < 0.0005;
}

/** fetch with a hard timeout, so a hung provider becomes "unavailable" instead of a hung request. */
export async function providerFetch(url: string, init: RequestInit, timeoutMs = 15000): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  } catch (err) {
    throw new ProviderUnavailableError(err instanceof Error ? err.name : "network error");
  }
}
