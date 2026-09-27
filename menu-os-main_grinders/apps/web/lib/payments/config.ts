import { cardMpgsProvider } from "./card-mpgs";
import { mockProvider } from "./mock";
import type { OnlineProviderId, PaymentProvider } from "./types";

/**
 * Which online payment methods this server offers, read from the environment only.
 * Nothing is enabled unless its credentials are set, so a branch without a gateway
 * contract keeps the exact checkout it had before (pay at the till).
 *
 *   PAYMENTS_PUBLIC_BASE_URL   https origin the gateway sends the payer back to
 *
 *   CARD_GATEWAY_BASE_URL      e.g. https://test-gateway.mastercard.com (from the acquirer)
 *   CARD_GATEWAY_MERCHANT_ID / CARD_GATEWAY_API_PASSWORD
 *   CARD_GATEWAY_API_VERSION   default 100
 *   CARD_GATEWAY_MERCHANT_NAME shown on the hosted page
 *   CARD_GATEWAY_NOTIFICATION_SECRET  the webhook "Notification Secret" from Merchant
 *                              Administration → Admin → Webhook Notifications (optional)
 *
 *   PAYMENTS_MOCK_PROVIDERS    "CARD" — local simulator when the card gateway has no
 *                              credentials. Ignored when NODE_ENV=production.
 */
type Env = Record<string, string | undefined>;

const trim = (v: string | undefined) => (v ?? "").trim();
const stripSlash = (v: string) => v.replace(/\/+$/, "");

export function isProduction(env: Env = process.env) {
  return env.NODE_ENV === "production";
}

/** The absolute origin used in return URLs. Required for the real gateway. */
export function publicBaseUrl(env: Env = process.env): string | null {
  const v = stripSlash(trim(env.PAYMENTS_PUBLIC_BASE_URL));
  if (!v) return null;
  try {
    const u = new URL(v);
    if (isProduction(env) && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Builds the providers that are usable right now. `requestOrigin` is only used by the
 * local simulator (the real gateway always uses PAYMENTS_PUBLIC_BASE_URL — a Host header
 * is not something to build a payment return URL from).
 */
export function enabledProviders(requestOrigin?: string, env: Env = process.env): Map<OnlineProviderId, PaymentProvider> {
  const out = new Map<OnlineProviderId, PaymentProvider>();
  const base = publicBaseUrl(env);

  const card = {
    baseUrl: stripSlash(trim(env.CARD_GATEWAY_BASE_URL)),
    merchantId: trim(env.CARD_GATEWAY_MERCHANT_ID),
    apiPassword: trim(env.CARD_GATEWAY_API_PASSWORD),
    apiVersion: trim(env.CARD_GATEWAY_API_VERSION) || "100",
    merchantName: trim(env.CARD_GATEWAY_MERCHANT_NAME) || "Merchant",
  };
  if (base && card.baseUrl.startsWith("https://") && card.merchantId && card.apiPassword) {
    out.set("CARD", cardMpgsProvider(card));
  }

  // The simulator: development only, only when the real gateway isn't configured.
  if (!isProduction(env) && requestOrigin && !out.has("CARD")) {
    const mocked = trim(env.PAYMENTS_MOCK_PROVIDERS).toUpperCase().split(/[\s,]+/).filter(Boolean);
    if (mocked.includes("CARD")) out.set("CARD", mockProvider("CARD", () => base ?? requestOrigin));
  }
  return out;
}

/** The gateway's webhook secret, or null when webhooks aren't set up. */
export function cardNotificationSecret(env: Env = process.env): string | null {
  return trim(env.CARD_GATEWAY_NOTIFICATION_SECRET) || null;
}

/**
 * Where the gateway should POST webhook notifications for an order. The gateway only
 * delivers to https, so there is none without an https public base URL and a secret.
 */
export function cardNotificationUrl(env: Env = process.env): string | null {
  const base = publicBaseUrl(env);
  if (!base || !base.startsWith("https://") || !cardNotificationSecret(env)) return null;
  return `${base}/api/payments/online/webhook/card`;
}

/** The return URL origin for a given provider: the configured base, or (simulator only) the request's. */
export function returnOrigin(provider: PaymentProvider, requestOrigin: string, env: Env = process.env): string | null {
  return publicBaseUrl(env) ?? (provider.simulated ? requestOrigin : null);
}
