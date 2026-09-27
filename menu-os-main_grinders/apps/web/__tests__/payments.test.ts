import { afterEach, describe, expect, it, vi } from "vitest";
import { cardMpgsProvider } from "../lib/payments/card-mpgs";
import { cardNotificationUrl, enabledProviders, publicBaseUrl } from "../lib/payments/config";
import { sameAmount } from "../lib/payments/types";

// Gateway responses are stubbed: these tests pin down how we *judge* the gateway's
// answer (amount, currency, reference, errors), not the gateway itself.
function stubFetch(...responses: { status?: number; body: unknown }[]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const queue = [...responses];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    const next = queue.shift() ?? { status: 500, body: {} };
    return new Response(JSON.stringify(next.body), { status: next.status ?? 200 });
  });
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

const base = { paymentId: "pay_1", orderId: "ord_1", gatewayRef: "SESSION0001", amount: "25000", currency: "IQD", secretMeta: {}, expiresAt: new Date(Date.now() + 600_000) };
const noOrder = { status: 400, body: { result: "ERROR", error: { cause: "INVALID_REQUEST", explanation: "Unable to find order" } } };

describe("card (Mastercard Gateway hosted checkout)", () => {
  const card = cardMpgsProvider({ baseUrl: "https://gw.example", merchantId: "M1", apiPassword: "pw", apiVersion: "100", merchantName: "Cafe" });
  const meta = { successIndicator: "abc123abc123abc1" };

  it("opens a PURCHASE session for the server amount and keeps the success indicator server-side", async () => {
    const calls = stubFetch({ body: { session: { id: "SESSION0001" }, successIndicator: meta.successIndicator } });
    const s = await card.createCheckout({ paymentId: "pay_1", orderId: "ord_1", amount: "25000", currency: "IQD", returnUrl: "https://shop.example/r/pay_1", language: "en", description: "x" });
    const body = JSON.parse(String(calls[0].init?.body));
    expect(calls[0].url).toBe("https://gw.example/api/rest/version/100/merchant/M1/session");
    expect((calls[0].init?.headers as Record<string, string>).Authorization).toBe("Basic " + Buffer.from("merchant.M1:pw").toString("base64"));
    expect(body.apiOperation).toBe("INITIATE_CHECKOUT");
    expect(body.interaction.operation).toBe("PURCHASE");
    expect(body.interaction.cancelUrl).toBe("https://shop.example/r/pay_1?cancelled=1");
    expect(body.order).toMatchObject({ id: "pay_1", amount: "25000", currency: "IQD" });
    expect(s.secretMeta).toEqual(meta);
    expect(s.launch).toEqual({ kind: "card-hosted", sessionId: "SESSION0001", scriptUrl: "https://gw.example/static/checkout/checkout.min.js" });
  });

  it("asks for webhooks at our notification URL only when one is given", async () => {
    const calls = stubFetch(
      { body: { session: { id: "S1" }, successIndicator: meta.successIndicator } },
      { body: { session: { id: "S2" }, successIndicator: meta.successIndicator } }
    );
    const req = { paymentId: "pay_1", orderId: "ord_1", amount: "25000", currency: "IQD", returnUrl: "https://shop.example/r/pay_1", language: "en" as const, description: "x" };
    await card.createCheckout({ ...req, notificationUrl: "https://shop.example/api/payments/online/webhook/card" });
    await card.createCheckout(req);
    expect(JSON.parse(String(calls[0].init?.body)).order.notificationUrl).toBe("https://shop.example/api/payments/online/webhook/card");
    expect("notificationUrl" in JSON.parse(String(calls[1].init?.body)).order).toBe(false);
  });

  it("is PAID only when the gateway reports the full amount captured in the right currency", async () => {
    stubFetch({ body: { id: "pay_1", result: "SUCCESS", status: "CAPTURED", totalCapturedAmount: 25000, currency: "IQD" } });
    expect((await card.verify({ ...base, secretMeta: meta, returnParams: new URLSearchParams({ resultIndicator: meta.successIndicator }) })).state).toBe("PAID");
  });

  it("rejects a captured amount, currency or order id that differs from ours", async () => {
    stubFetch({ body: { id: "pay_1", result: "SUCCESS", totalCapturedAmount: 1, currency: "IQD" } });
    expect(await card.verify({ ...base, secretMeta: meta })).toMatchObject({ state: "FAILED", reason: "MISMATCH" });
    stubFetch({ body: { id: "pay_1", result: "SUCCESS", totalCapturedAmount: 25000, currency: "USD" } });
    expect(await card.verify({ ...base, secretMeta: meta })).toMatchObject({ state: "FAILED", reason: "MISMATCH" });
    stubFetch({ body: { id: "someone_else", result: "SUCCESS", totalCapturedAmount: 25000, currency: "IQD" } });
    expect(await card.verify({ ...base, secretMeta: meta })).toMatchObject({ state: "FAILED", reason: "MISMATCH" });
  });

  it("the gateway's order record decides: an edited resultIndicator neither pays nor un-pays", async () => {
    stubFetch(noOrder);
    expect((await card.verify({ ...base, secretMeta: meta, returnParams: new URLSearchParams({ resultIndicator: meta.successIndicator }) })).state).toBe("PENDING");
    stubFetch({ body: { id: "pay_1", result: "SUCCESS", totalCapturedAmount: 25000, currency: "IQD" } });
    expect((await card.verify({ ...base, secretMeta: meta, returnParams: new URLSearchParams({ resultIndicator: "forged" }) })).state).toBe("PAID");
  });

  it("no gateway order: pending, or cancelled/expired once the payer is back or time is up", async () => {
    stubFetch(noOrder);
    expect(await card.verify({ ...base, secretMeta: meta, returnParams: new URLSearchParams({ cancelled: "1" }) })).toMatchObject({ state: "FAILED", reason: "CANCELLED" });
    stubFetch(noOrder);
    expect(await card.verify({ ...base, secretMeta: meta, expiresAt: new Date(Date.now() - 1000) })).toMatchObject({ state: "FAILED", reason: "EXPIRED" });
  });

  it("a decline is final only once the payer is back (they may still retry on the hosted page)", async () => {
    stubFetch({ body: { id: "pay_1", result: "FAILURE", status: "FAILED", totalCapturedAmount: 0, currency: "IQD" } });
    expect((await card.verify({ ...base, secretMeta: meta })).state).toBe("PENDING");
    stubFetch({ body: { id: "pay_1", result: "FAILURE", status: "FAILED", totalCapturedAmount: 0, currency: "IQD" } });
    expect(await card.verify({ ...base, secretMeta: meta, returnParams: new URLSearchParams() })).toMatchObject({ state: "FAILED", reason: "DECLINED" });
  });

  it("credential, firewall and gateway errors are 'unavailable' — never read as 'no payment'", async () => {
    for (const r of [
      { status: 401, body: { result: "ERROR", error: { cause: "INVALID_REQUEST", explanation: "Invalid credentials." } } },
      { status: 400, body: { result: "ERROR", error: { cause: "REQUEST_REJECTED" } } },
      { status: 503, body: { result: "ERROR", error: { cause: "SERVER_BUSY" } } },
      { status: 500, body: {} },
    ]) {
      stubFetch(r);
      await expect(card.verify({ ...base, secretMeta: meta, returnParams: new URLSearchParams({ cancelled: "1" }) })).rejects.toThrow();
    }
  });
});

describe("configuration", () => {
  it("enables nothing without credentials, and never the simulator in production", () => {
    expect(enabledProviders("http://x", { NODE_ENV: "development" }).size).toBe(0);
    expect(enabledProviders("http://x", { NODE_ENV: "production", PAYMENTS_MOCK_PROVIDERS: "CARD" }).size).toBe(0);
    const dev = enabledProviders("http://x", { NODE_ENV: "development", PAYMENTS_MOCK_PROVIDERS: "CARD" });
    expect([...dev.values()].map((p) => [p.id, p.simulated])).toEqual([["CARD", true]]);
  });

  it("uses the real gateway, not the simulator, once credentials are set", () => {
    const env = { NODE_ENV: "development", PAYMENTS_MOCK_PROVIDERS: "CARD", PAYMENTS_PUBLIC_BASE_URL: "https://cafe.example", CARD_GATEWAY_BASE_URL: "https://gw.example", CARD_GATEWAY_MERCHANT_ID: "M1", CARD_GATEWAY_API_PASSWORD: "pw" };
    expect(enabledProviders("http://x", env).get("CARD")?.simulated).toBe(false);
    expect(enabledProviders("http://x", { ...env, CARD_GATEWAY_BASE_URL: "http://gw.example" }).get("CARD")?.simulated).toBe(true);
  });

  it("offers a webhook URL only with a notification secret and an https base (the gateway sends to https only)", () => {
    expect(cardNotificationUrl({ PAYMENTS_PUBLIC_BASE_URL: "https://cafe.example" })).toBeNull();
    expect(cardNotificationUrl({ PAYMENTS_PUBLIC_BASE_URL: "http://cafe.example", CARD_GATEWAY_NOTIFICATION_SECRET: "s" })).toBeNull();
    expect(cardNotificationUrl({ PAYMENTS_PUBLIC_BASE_URL: "https://cafe.example/", CARD_GATEWAY_NOTIFICATION_SECRET: "s" })).toBe("https://cafe.example/api/payments/online/webhook/card");
  });

  it("needs an https public base URL in production", () => {
    expect(publicBaseUrl({ NODE_ENV: "production", PAYMENTS_PUBLIC_BASE_URL: "http://cafe.example" })).toBeNull();
    expect(publicBaseUrl({ NODE_ENV: "production", PAYMENTS_PUBLIC_BASE_URL: "https://cafe.example/" })).toBe("https://cafe.example");
  });

  it("compares money without float noise", () => {
    expect(sameAmount("25000.000", 25000)).toBe(true);
    expect(sameAmount("25000", "25001")).toBe(false);
  });
});
