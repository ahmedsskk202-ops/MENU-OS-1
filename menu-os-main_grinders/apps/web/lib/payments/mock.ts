import { randomBytes } from "node:crypto";
import { sameAmount, type OnlineProviderId, type PaymentProvider, type VerifyOutcome } from "./types";

/**
 * LOCAL TEST SIMULATOR — stands in for a provider whose credentials aren't configured,
 * so the checkout → hosted page → return → verification path can be exercised end to
 * end on a development machine. config.ts refuses to build it when NODE_ENV is
 * "production", and its page is labelled as a test on every screen.
 *
 * It plays the provider's *server* too: the outcome the tester picks on the simulated
 * page is stored as provider-side state (providerMeta.mockOutcome), and verify() reads
 * it from there — so the return URL alone still proves nothing, exactly like the real
 * providers.
 */
export function mockProvider(id: OnlineProviderId, origin: () => string): PaymentProvider {
  return {
    id,
    method: "ONLINE",
    simulated: true,
    supportsCurrency: (c) => /^[A-Z]{3}$/.test(c),

    async createCheckout(req) {
      return {
        gatewayRef: `mock_${randomBytes(9).toString("hex")}`,
        launch: { kind: "redirect", url: `${origin()}/api/payments/online/mock/${req.paymentId}` },
        secretMeta: { returnUrl: req.returnUrl },
        expiresAt: new Date(Date.now() + 30 * 60_000),
      };
    },

    async verify(req): Promise<VerifyOutcome> {
      const outcome = req.secretMeta.mockOutcome as { status: string; amount: string; currency: string } | undefined;
      if (!outcome) {
        if (req.returnParams?.get("cancelled") === "1") return { state: "FAILED", reason: "CANCELLED", providerStatus: "MOCK_NO_ATTEMPT" };
        if (req.expiresAt && Date.now() > req.expiresAt.getTime()) return { state: "FAILED", reason: "EXPIRED", providerStatus: "MOCK_NO_ATTEMPT" };
        return { state: "PENDING", providerStatus: "MOCK_NO_ATTEMPT" };
      }
      if (outcome.status === "SUCCESS") {
        if (outcome.currency !== req.currency || !sameAmount(outcome.amount, req.amount)) return { state: "FAILED", reason: "MISMATCH", providerStatus: "MOCK_SUCCESS" };
        return { state: "PAID", amount: outcome.amount, currency: outcome.currency, providerStatus: "MOCK_SUCCESS" };
      }
      if (outcome.status === "CANCELLED") return { state: "FAILED", reason: "CANCELLED", providerStatus: "MOCK_CANCELLED" };
      if (outcome.status === "PENDING") return { state: "PENDING", providerStatus: "MOCK_PENDING" };
      return { state: "FAILED", reason: "DECLINED", providerStatus: "MOCK_DECLINED" };
    },
  };
}
