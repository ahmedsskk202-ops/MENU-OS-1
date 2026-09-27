import { timingSafeEqual } from "node:crypto";
import { ProviderUnavailableError, providerFetch, sameAmount, type PaymentProvider, type VerifyOutcome } from "./types";

/**
 * Visa / Mastercard through Mastercard Gateway (MPGS) Hosted Checkout — the gateway the
 * card acquirer provides. The payer types card details on the gateway's own page; we
 * only ever see a session id and, afterwards, the order result from the gateway's API.
 *
 * Official reference (API version 100):
 *   INITIATE_CHECKOUT  POST {base}/api/rest/version/{v}/merchant/{id}/session
 *   RETRIEVE ORDER     GET  {base}/api/rest/version/{v}/merchant/{id}/order/{orderId}
 *   Payment page       {base}/static/checkout/checkout.min.js → Checkout.showPaymentPage()
 * The returnUrl gets `resultIndicator`; it equals the `successIndicator` from
 * INITIATE_CHECKOUT only for a successful payment. That match is checked, but the
 * decision is made on RETRIEVE ORDER (result + captured amount + currency).
 */
export interface CardGatewayConfig {
  baseUrl: string;
  merchantId: string;
  apiPassword: string;
  apiVersion: string;
  merchantName: string;
}

export function cardMpgsProvider(cfg: CardGatewayConfig): PaymentProvider {
  const api = `${cfg.baseUrl}/api/rest/version/${encodeURIComponent(cfg.apiVersion)}/merchant/${encodeURIComponent(cfg.merchantId)}`;
  const auth = "Basic " + Buffer.from(`merchant.${cfg.merchantId}:${cfg.apiPassword}`).toString("base64");

  return {
    id: "CARD",
    method: "ONLINE",
    simulated: false,
    supportsCurrency: (c) => /^[A-Z]{3}$/.test(c),

    async createCheckout(req) {
      const res = await providerFetch(`${api}/session`, {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          apiOperation: "INITIATE_CHECKOUT",
          interaction: {
            operation: "PURCHASE",
            merchant: { name: cfg.merchantName },
            returnUrl: req.returnUrl,
            cancelUrl: withParam(req.returnUrl, "cancelled", "1"),
            timeoutUrl: withParam(req.returnUrl, "timeout", "1"),
            timeout: 1800,
            locale: req.language === "ar" ? "ar" : "en_US",
          },
          order: {
            id: req.paymentId,
            amount: req.amount,
            currency: req.currency,
            description: req.description,
            // Per-order webhook target; only honoured when webhooks are enabled in Merchant Administration.
            ...(req.notificationUrl ? { notificationUrl: req.notificationUrl } : {}),
          },
        }),
      });
      const json = await res.json().catch(() => null);
      const sessionId = json?.session?.id;
      const successIndicator = json?.successIndicator;
      if (!res.ok || typeof sessionId !== "string" || typeof successIndicator !== "string") {
        throw new ProviderUnavailableError(`card gateway session failed (${res.status} ${json?.error?.cause ?? ""})`);
      }
      return {
        gatewayRef: sessionId,
        launch: { kind: "card-hosted", sessionId, scriptUrl: `${cfg.baseUrl}/static/checkout/checkout.min.js` },
        secretMeta: { successIndicator },
        expiresAt: new Date(Date.now() + 30 * 60_000),
      };
    },

    async verify(req): Promise<VerifyOutcome> {
      const res = await providerFetch(`${api}/order/${encodeURIComponent(req.paymentId)}`, { headers: { Authorization: auth } });
      const json = await res.json().catch(() => null);
      const expired = req.expiresAt ? Date.now() > req.expiresAt.getTime() : false;
      const cancelled = req.returnParams?.get("cancelled") === "1";
      const timedOut = req.returnParams?.get("timeout") === "1";

      // Credentials, firewall or gateway trouble (401/403, REQUEST_REJECTED, SERVER_BUSY,
      // SERVER_FAILED) says nothing about the payment — it must never read as "no payment".
      if (!res.ok && (res.status === 401 || res.status === 403 || res.status >= 500 || json?.error?.cause !== "INVALID_REQUEST")) {
        throw new ProviderUnavailableError(`card gateway order lookup failed (${res.status} ${json?.error?.cause ?? ""})`);
      }
      // No order at the gateway yet = the payer never submitted a card.
      if (!res.ok) {
        if (cancelled) return { state: "FAILED", reason: "CANCELLED", providerStatus: "NO_ORDER" };
        if (timedOut || expired) return { state: "FAILED", reason: "EXPIRED", providerStatus: "NO_ORDER" };
        return { state: "PENDING", providerStatus: "NO_ORDER" };
      }
      if (!json) throw new ProviderUnavailableError(`card gateway order lookup failed (${res.status})`);

      const result = String(json.result ?? "UNKNOWN");
      const status = String(json.status ?? result);
      if (json.id !== undefined && String(json.id) !== req.paymentId) return { state: "FAILED", reason: "MISMATCH", providerStatus: status };

      if (result === "SUCCESS" && Number(json.totalCapturedAmount) > 0) {
        if (json.currency !== req.currency || !sameAmount(json.totalCapturedAmount, req.amount)) {
          return { state: "FAILED", reason: "MISMATCH", providerStatus: status };
        }
        // RETRIEVE ORDER is the authority: the money is captured. A resultIndicator that
        // doesn't match this session's successIndicator (stale tab, edited URL) is only
        // worth a log line — it must not turn a captured payment into a failed one.
        const indicator = req.returnParams?.get("resultIndicator");
        if (indicator && !safeEqual(indicator, String(req.secretMeta.successIndicator ?? ""))) {
          console.warn(`[payments] card return for ${req.paymentId} carried a resultIndicator that does not match its session`);
        }
        return { state: "PAID", amount: String(json.totalCapturedAmount), currency: json.currency, providerStatus: status };
      }
      // The hosted page lets the payer retry a declined card, so a failure is only final
      // once they have come back to us (or the session is over).
      if (result === "FAILURE" && (req.returnParams || expired)) return { state: "FAILED", reason: cancelled ? "CANCELLED" : "DECLINED", providerStatus: status };
      if (cancelled) return { state: "FAILED", reason: "CANCELLED", providerStatus: status };
      if (timedOut || expired) return { state: "FAILED", reason: "EXPIRED", providerStatus: status };
      return { state: "PENDING", providerStatus: status };
    },
  };
}

function withParam(url: string, key: string, value: string) {
  const u = new URL(url);
  u.searchParams.set(key, value);
  return u.toString();
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}
