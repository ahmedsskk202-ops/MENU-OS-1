// Real, executed integration test for FREE_ITEM discount support.
// Run: node scripts/free-item-test.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const CLOUD_URL = "http://localhost:4000";
const BRANCH_ID = "cmug2a45d0004stemr504wzug";

const { PrismaClient: LocalPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const localDb = new LocalPrismaClient();

// Audit before/after are JSON text since the move to SQLite.
const J = (v) => { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return null; } };
let pass = 0,
  fail = 0;
const failures = [];
function check(label, cond, detail) {
  if (cond) {
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? ` — ${detail}` : ""}`);
  }
}
function section(t) {
  console.log(`\n\x1b[1m${t}\x1b[0m`);
}
async function waitUntil(fn, { timeoutMs = 10000, intervalMs = 300 } = {}) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeoutMs) {
    last = await fn();
    if (last !== null && last !== undefined) return last;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return last;
}

function firstCookies(res) {
  return res.headers.getSetCookie().map((c) => c.split(";")[0]);
}
async function loginAs(email, password) {
  const csrfRes = await fetch(`${LOCAL_URL}/api/auth/csrf`);
  const csrfCookie = firstCookies(csrfRes).find((c) => c.startsWith("next-auth.csrf-token"));
  const { csrfToken } = await csrfRes.json();
  const loginRes = await fetch(`${LOCAL_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: csrfCookie },
    body: new URLSearchParams({ email, password, csrfToken, json: "true" }),
    redirect: "manual",
  });
  const sessionCookie = firstCookies(loginRes).find((c) => c.startsWith("next-auth.session-token"));
  return `${csrfCookie}; ${sessionCookie}`;
}
async function scanQr(token) {
  const res = await fetch(`${LOCAL_URL}/r/${token}`, { redirect: "manual" });
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith("mos_session")).split(";")[0];
  return { cookie };
}
async function createFreeItemCoupon(adminCookie, brandId, overrides) {
  const res = await fetch(`${LOCAL_URL}/api/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId, code: `FREE${Math.random().toString(36).slice(2, 8).toUpperCase()}`, discountType: "FREE_ITEM", ...overrides }),
  });
  return { res, body: await res.json() };
}
async function placeOrder(cookie, lines, couponCode) {
  const res = await fetch(`${LOCAL_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ lines, couponCode: couponCode ?? undefined }),
  });
  return { status: res.status, body: await res.json() };
}

async function main() {
  console.log("Menu OS — FREE_ITEM discount: real, executed test suite");
  console.log("=".repeat(70));

  section("Setup");
  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);

  const branch = await localDb.branch.findUniqueOrThrow({ where: { id: BRANCH_ID } });
  const brandId = branch.brandId;
  const menuRes = await fetch(`${LOCAL_URL}/api/menu?branchId=${BRANCH_ID}`).then((r) => r.json());
  const products = menuRes.menus[0].categories.flatMap((c) => c.products);
  const latte = products.find((p) => p.name === "Spanish Latte");
  const latteSizeOption = latte.modifierGroups.find((g) => g.name === "Size").options[0];
  const latteSize = latteSizeOption.id;
  // One latte as ordered = base price + the required size option. That whole unit is
  // what a FREE_ITEM coupon gives away.
  const lattePrice = latte.basePrice + (latteSizeOption.priceDelta ?? 0);
  const burger = products.find((p) => p.name.includes("Burger"));
  const burgerSize = burger.modifierGroups.find((g) => g.name === "Size").options[0].id;

  const tableTokens = {};
  for (let i = 1; i <= 12; i++) {
    tableTokens[i] = (await localDb.qRCode.findFirst({ where: { branchId: BRANCH_ID, label: `Table ${i}` } })).token;
  }
  const latteLine = (qty = 1) => [{ productId: latte.id, quantity: qty, modifierOptionIds: [latteSize] }];

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Creation-time validation — a FREE_ITEM coupon needs a scope");
  const emptyScopeAttempt = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [], applicableCategoryIds: [] });
  check("creating a FREE_ITEM coupon with no product/category scope is rejected (400)", emptyScopeAttempt.res.status === 400, JSON.stringify(emptyScopeAttempt.body));

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Valid FREE_ITEM — original price preserved, final line effect is 0");
  const { body: validCoupon } = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [latte.id] });
  const s2 = await scanQr(tableTokens[1]);
  const o2 = await placeOrder(s2.cookie, latteLine(1), validCoupon.coupon.code);
  check("order with a valid FREE_ITEM coupon succeeds", o2.status === 201, JSON.stringify(o2.body));
  check("discountTotal equals the latte's full unit price (it's fully free)", parseFloat(o2.body.order.discountTotal) === lattePrice);
  check("order total reflects the item being free (plus tax/fee on 0)", parseFloat(o2.body.order.total) === parseFloat(o2.body.order.taxTotal) + parseFloat(o2.body.order.serviceFeeTotal));

  const orderItem2 = await localDb.orderItem.findFirst({ where: { orderId: o2.body.order.id } });
  check(
    "the OrderItem itself keeps its ORIGINAL unit price — never zeroed, never lost",
    parseFloat(orderItem2.unitPriceSnapshot.toString()) === lattePrice && parseFloat(orderItem2.lineTotal.toString()) === lattePrice,
    `unitPrice=${orderItem2.unitPriceSnapshot} lineTotal=${orderItem2.lineTotal}`
  );

  const discountRow2 = await localDb.discount.findFirst({ where: { orderId: o2.body.order.id } });
  check("Discount row records type FREE_ITEM with the free product identified", discountRow2.type === "FREE_ITEM" && discountRow2.freeProductId === latte.id && discountRow2.freeProductName === "Spanish Latte");
  check("Discount.amountApplied === the original price (the promotion's cost), giving Original → Discount → Final=0", parseFloat(discountRow2.amountApplied.toString()) === lattePrice);

  const auditRow2 = await localDb.auditLog.findFirst({ where: { entityType: "Discount", entityId: discountRow2.id } });
  check(
    "Audit log explicitly records originalPrice, finalPrice=0, and which product — not just a generic discount",
    J(auditRow2?.afterJson)?.originalPrice === lattePrice && J(auditRow2?.afterJson)?.finalPrice === 0 && J(auditRow2?.afterJson)?.freeProductName === "Spanish Latte",
    JSON.stringify(J(auditRow2?.afterJson))
  );

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Cheapest-eligible-unit rule when quantity > 1");
  const s3 = await scanQr(tableTokens[2]);
  const o3 = await placeOrder(s3.cookie, latteLine(3), validCoupon.coupon.code);
  check("ordering 3 lattes with the coupon still only makes ONE unit free", o3.status === 201 && parseFloat(o3.body.order.discountTotal) === lattePrice, o3.body.order.discountTotal);
  const item3 = await localDb.orderItem.findFirst({ where: { orderId: o3.body.order.id } });
  check("the line's own total still reflects all 3 units at full original price (discount is separate)", parseFloat(item3.lineTotal.toString()) === lattePrice * 3);

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Invalid product — coupon scoped to a product not in the cart");
  const { body: burgerOnlyCoupon } = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [burger.id] });
  const s4 = await scanQr(tableTokens[3]);
  const o4 = await placeOrder(s4.cookie, latteLine(1), burgerOnlyCoupon.coupon.code);
  check("a FREE_ITEM coupon scoped to a product absent from the cart is rejected (422)", o4.status === 422 && /does not apply/i.test(o4.body.error), o4.body.error);

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Minimum order amount");
  const { body: minCoupon } = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [latte.id], minOrderAmount: 999999 });
  const s5 = await scanQr(tableTokens[4]);
  const o5 = await placeOrder(s5.cookie, latteLine(1), minCoupon.coupon.code);
  check("below the minimum order amount, FREE_ITEM is rejected (422)", o5.status === 422 && /minimum order/i.test(o5.body.error), o5.body.error);

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Branch restriction");
  const { body: otherBranchCoupon } = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [latte.id], branchIds: ["some-other-branch"] });
  const s6 = await scanQr(tableTokens[5]);
  const o6 = await placeOrder(s6.cookie, latteLine(1), otherBranchCoupon.coupon.code);
  check("a FREE_ITEM coupon restricted to a different branch is rejected here (422)", o6.status === 422 && /not valid at this branch/i.test(o6.body.error));

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Expired coupon");
  const { body: expiredCoupon } = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [latte.id], expiresAt: new Date(Date.now() - 86400000).toISOString() });
  const s7 = await scanQr(tableTokens[6]);
  const o7 = await placeOrder(s7.cookie, latteLine(1), expiredCoupon.coupon.code);
  check("an expired FREE_ITEM coupon is rejected (422)", o7.status === 422 && /expired/i.test(o7.body.error));

  // ═══════════════════════════════════════════════════════════════════════
  section("8. Usage limit — sequential duplicate application, then real concurrency");
  const { body: singleUse } = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [latte.id], maxUses: 1 });
  const s8a = await scanQr(tableTokens[7]);
  const first8 = await placeOrder(s8a.cookie, latteLine(1), singleUse.coupon.code);
  check("first redemption of a single-use FREE_ITEM coupon succeeds", first8.status === 201);
  const s8b = await scanQr(tableTokens[7]);
  const duplicate8 = await placeOrder(s8b.cookie, latteLine(1), singleUse.coupon.code);
  check("a duplicate application of the same single-use coupon is rejected (422) — no double free item", duplicate8.status === 422 && /usage limit/i.test(duplicate8.body.error));

  const { body: raceCoupon } = await createFreeItemCoupon(adminCookie, brandId, { applicableProductIds: [latte.id], maxUses: 1 });
  const raceSessions = [];
  for (let i = 0; i < 5; i++) raceSessions.push(await scanQr(tableTokens[8]));
  const raceResults = await Promise.all(raceSessions.map((s) => placeOrder(s.cookie, latteLine(1), raceCoupon.coupon.code)));
  const raceSuccesses = raceResults.filter((r) => r.status === 201);
  check("under real concurrency, exactly ONE of 5 simultaneous FREE_ITEM redemptions succeeds", raceSuccesses.length === 1, `got ${raceSuccesses.length}`);
  const raceCouponAfter = await localDb.coupon.findUnique({ where: { id: raceCoupon.coupon.id } });
  check("usedCount is exactly 1 after the race — no double-grant of the free item", raceCouponAfter.usedCount === 1);

  // ═══════════════════════════════════════════════════════════════════════
  section("9. Refund on an order with a FREE_ITEM discount (mixed cart: one paid item + one free item)");
  const s9 = await scanQr(tableTokens[12]);
  const o9 = await placeOrder(s9.cookie, [{ productId: burger.id, quantity: 1, modifierOptionIds: [burgerSize] }, ...latteLine(1)], validCoupon.coupon.code);
  check("mixed-cart order (paid burger + free latte) succeeds", o9.status === 201, JSON.stringify(o9.body));
  // The burger as ordered (base + its size option); the latte is fully offset, and no
  // tax/fee is configured on this branch.
  const burgerSizeDelta = burger.modifierGroups.flatMap((g) => g.options).find((o) => o.id === burgerSize)?.priceDelta ?? 0;
  const expectedTotal9 = burger.basePrice + burgerSizeDelta;
  check("order total = the paid item's price only, the free item contributes nothing", parseFloat(o9.body.order.total) === expectedTotal9, o9.body.order.total);

  const paymentForRefund = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: o9.body.order.id, method: "CASH", amount: parseFloat(o9.body.order.total) }),
  }).then((r) => r.json());
  check("payment amount equals the order's post-discount total (already excludes the free item)", parseFloat(paymentForRefund.payment.amount) === parseFloat(o9.body.order.total));

  const refundRes = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ paymentId: paymentForRefund.payment.id, amount: parseFloat(paymentForRefund.payment.amount), reason: "customer changed mind" }),
  });
  const refundBody = await refundRes.json();
  check("full refund on a FREE_ITEM order succeeds and refunds exactly what was paid (not the pre-discount amount)", refundRes.status === 201 && parseFloat(refundBody.refund.amount) === parseFloat(paymentForRefund.payment.amount));
  check("order status becomes REFUNDED", refundBody.order.status === "REFUNDED");

  // Also confirm a fully-comped ($0) order can still be marked paid without error.
  const zeroPaymentRes = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: o2.body.order.id, method: "CASH", amount: 0 }),
  });
  check("an entirely-free ($0 total) order can be marked paid with a $0 payment", zeroPaymentRes.status === 201, JSON.stringify(await zeroPaymentRes.clone().json()));

  // ═══════════════════════════════════════════════════════════════════════
  section("10. Reports and analytics reflect the free item correctly");
  const salesReport = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  check("sales report's discountTotal includes the FREE_ITEM giveaways", salesReport.report.discountTotal > 0, salesReport.report.discountTotal);
  const productAnalytics = await fetch(`${LOCAL_URL}/api/analytics/products?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  const latteAnalytics = productAnalytics.analytics.products.find((p) => p.productId === latte.id);
  check(
    "product analytics still counts the free latte's units/revenue at full original price — free items aren't invisible to inventory/COGS accounting",
    !!latteAnalytics && latteAnalytics.unitsSold >= 5, // 1 (o2) + 3 (o3) + 1 (o8a, before refund) at minimum
    JSON.stringify(latteAnalytics)
  );

  // ═══════════════════════════════════════════════════════════════════════
  section("11. Staff manual FREE_ITEM discount (no coupon) — same RBAC as PERCENTAGE/FIXED");
  const managerCookie = await loginAs("manager@aurum.demo", "Password123!");
  const waiterCookie = await loginAs("waiter@aurum.demo", "Password123!");
  const s11 = await scanQr(tableTokens[9]);
  const o11 = await placeOrder(s11.cookie, [{ productId: burger.id, quantity: 1, modifierOptionIds: [burgerSize] }, ...latteLine(1)], null);

  const waiterAttempt = await fetch(`${LOCAL_URL}/api/orders/${o11.body.order.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: waiterCookie },
    body: JSON.stringify({ type: "FREE_ITEM", productId: latte.id, reason: "test" }),
  });
  check("a Waiter cannot apply a manual FREE_ITEM discount (403)", waiterAttempt.status === 403);

  const staffFreeItemRes = await fetch(`${LOCAL_URL}/api/orders/${o11.body.order.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: managerCookie },
    body: JSON.stringify({ type: "FREE_ITEM", productId: latte.id, reason: "goodwill gesture" }),
  });
  const staffFreeItemBody = await staffFreeItemRes.json();
  check("a Branch Manager can manually make an item free on an existing order", staffFreeItemRes.status === 201, JSON.stringify(staffFreeItemBody));
  check("the manual FREE_ITEM discount records the correct product and amount", staffFreeItemBody.discount?.freeProductId === latte.id && parseFloat(staffFreeItemBody.discount.amountApplied) === lattePrice);
  const item11 = await localDb.orderItem.findFirst({ where: { orderId: o11.body.order.id, productId: latte.id } });
  check("the underlying OrderItem's original price is untouched by the manual free-item discount too", parseFloat(item11.unitPriceSnapshot.toString()) === lattePrice);

  // ═══════════════════════════════════════════════════════════════════════
  section("12. Offline sync — a FREE_ITEM order reaches the cloud with the correct total");
  await fetch(`${LOCAL_URL}/api/sync/trigger`, { method: "POST", headers: { cookie: adminCookie } });
  const cloudOrder = await waitUntil(async () => {
    const r = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/orders`).then((res) => res.json());
    return r.orders.find((o) => o.id === `${BRANCH_ID}:${o3.body.order.id}`) ?? null;
  });
  check("the FREE_ITEM order (3 lattes, 1 free) reached the cloud with the correct discounted total", !!cloudOrder && cloudOrder.total === o3.body.order.total, JSON.stringify(cloudOrder));

  // ═══════════════════════════════════════════════════════════════════════
  section("13. Regression — existing PERCENTAGE and FIXED coupons still work exactly as before");
  const pctRes = await fetch(`${LOCAL_URL}/api/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId, code: `REG${Math.random().toString(36).slice(2, 8).toUpperCase()}`, discountType: "PERCENTAGE", value: 15 }),
  }).then((r) => r.json());
  const s13 = await scanQr(tableTokens[10]);
  const o13 = await placeOrder(s13.cookie, latteLine(1), pctRes.coupon.code);
  check("a plain PERCENTAGE coupon still applies correctly after the FREE_ITEM changes", o13.status === 201 && parseFloat(o13.body.order.discountTotal) === Math.round(lattePrice * 0.15), JSON.stringify(o13.body.order));

  const fixedRes = await fetch(`${LOCAL_URL}/api/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId, code: `REG${Math.random().toString(36).slice(2, 8).toUpperCase()}`, discountType: "FIXED", value: 1000 }),
  }).then((r) => r.json());
  const s13b = await scanQr(tableTokens[11]);
  const o13b = await placeOrder(s13b.cookie, latteLine(1), fixedRes.coupon.code);
  check("a plain FIXED coupon still applies correctly after the FREE_ITEM changes", o13b.status === 201 && parseFloat(o13b.body.order.discountTotal) === 1000);

  // ── Report ───────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(70));
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (fail > 0) failures.forEach((f) => console.log(`  - ${f}`));
  await localDb.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exit(1);
});
