// Real, executed integration test for discount/coupon application.
// Run: node scripts/discount-test.mjs
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
async function createCoupon(adminCookie, brandId, overrides) {
  const res = await fetch(`${LOCAL_URL}/api/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId, code: `T${Math.random().toString(36).slice(2, 8).toUpperCase()}`, discountType: "PERCENTAGE", value: 10, ...overrides }),
  });
  const body = await res.json();
  return { res, body };
}
async function placeOrder(cookie, lines, couponCode) {
  // JSON.stringify drops keys whose value is `undefined` but keeps `null` as the
  // literal — and the API's zod schema only accepts a string or an absent key, so
  // "no coupon" must be undefined, never null.
  const res = await fetch(`${LOCAL_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ lines, couponCode: couponCode ?? undefined }),
  });
  return { status: res.status, body: await res.json() };
}

async function main() {
  console.log("Menu OS — Discount/Coupon module: real, executed test suite");
  console.log("=".repeat(70));

  section("Setup");
  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  const waiterCookie = await loginAs("waiter@aurum.demo", "Password123!");
  const cashierCookie = await loginAs("cashier@aurum.demo", "Password123!");
  const managerCookie = await loginAs("manager@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);

  const branch = await localDb.branch.findUniqueOrThrow({ where: { id: BRANCH_ID } });
  const brandId = branch.brandId;
  const menuRes = await fetch(`${LOCAL_URL}/api/menu?branchId=${BRANCH_ID}`).then((r) => r.json());
  const products = menuRes.menus[0].categories.flatMap((c) => c.products);
  const burger = products.find((p) => p.name.includes("Burger"));
  const burgerSize = burger.modifierGroups.find((g) => g.name === "Size").options[0].id;
  const latte = products.find((p) => p.name === "Spanish Latte");
  const latteSize = latte.modifierGroups.find((g) => g.name === "Size").options[0].id;
  const qrTables = { a: "Table 1", b: "Table 2", c: "Table 3", d: "Table 4", e: "Table 5", f: "Table 6", g: "Table 7", h: "Table 8", i: "Table 9", j: "Table 10", k: "Table 11", l: "Table 12" };
  const qrTokens = {};
  for (const [key, label] of Object.entries(qrTables)) {
    qrTokens[key] = (await localDb.qRCode.findFirst({ where: { branchId: BRANCH_ID, label } })).token;
  }

  const burgerLine = (qty = 1) => [{ productId: burger.id, quantity: qty, modifierOptionIds: [burgerSize] }];
  const latteLine = () => [{ productId: latte.id, quantity: 1, modifierOptionIds: [latteSize] }];

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Valid percentage discount — full recalculation is correct");
  const { body: pctCoupon } = await createCoupon(adminCookie, brandId, { discountType: "PERCENTAGE", value: 10 });
  check("coupon created", !!pctCoupon.coupon?.id, JSON.stringify(pctCoupon));

  const s1 = await scanQr(qrTokens.a);
  const o1 = await placeOrder(s1.cookie, burgerLine(), pctCoupon.coupon.code);
  check("order with valid coupon succeeds", o1.status === 201, JSON.stringify(o1.body));
  const subtotal1 = parseFloat(o1.body.order.subtotal);
  const expectedDiscount1 = Math.round(subtotal1 * 0.1);
  check("discountTotal is exactly 10% of subtotal", parseFloat(o1.body.order.discountTotal) === expectedDiscount1, `${o1.body.order.discountTotal} vs ${expectedDiscount1}`);
  check("total = (subtotal - discount) + tax + fee, not subtotal - discount alone", parseFloat(o1.body.order.total) === subtotal1 - expectedDiscount1 + parseFloat(o1.body.order.taxTotal) + parseFloat(o1.body.order.serviceFeeTotal));
  const discountRow1 = await localDb.discount.findFirst({ where: { orderId: o1.body.order.id } });
  check("Discount record persisted with the coupon reason", !!discountRow1 && discountRow1.reason === pctCoupon.coupon.code);
  const couponAfter1 = await localDb.coupon.findUnique({ where: { id: pctCoupon.coupon.id } });
  check("coupon usedCount incremented", couponAfter1.usedCount === 1);

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Invalid / expired / not-yet-active codes are rejected — no order created");
  const s2 = await scanQr(qrTokens.b);
  const invalidRes = await placeOrder(s2.cookie, burgerLine(), "NOT-A-REAL-CODE");
  check("nonexistent code is rejected (422)", invalidRes.status === 422 && /invalid discount code/i.test(invalidRes.body.error));

  const { body: expiredCoupon } = await createCoupon(adminCookie, brandId, { expiresAt: new Date(Date.now() - 86400000).toISOString() });
  const expiredRes = await placeOrder(s2.cookie, burgerLine(), expiredCoupon.coupon.code);
  check("expired code is rejected (422)", expiredRes.status === 422 && /expired/i.test(expiredRes.body.error), expiredRes.body.error);

  const { body: futureCoupon } = await createCoupon(adminCookie, brandId, { startsAt: new Date(Date.now() + 86400000).toISOString() });
  const futureRes = await placeOrder(s2.cookie, burgerLine(), futureCoupon.coupon.code);
  check("not-yet-active code is rejected (422)", futureRes.status === 422 && /not active yet/i.test(futureRes.body.error), futureRes.body.error);

  const { body: inactiveCoupon } = await createCoupon(adminCookie, brandId, {});
  await fetch(`${LOCAL_URL}/api/coupons/${inactiveCoupon.coupon.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ isActive: false }) });
  const inactiveRes = await placeOrder(s2.cookie, burgerLine(), inactiveCoupon.coupon.code);
  check("a deactivated code is rejected (422)", inactiveRes.status === 422);

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Minimum order amount is enforced");
  const { body: minCoupon } = await createCoupon(adminCookie, brandId, { discountType: "FIXED", value: 5000, minOrderAmount: 999999 });
  const s3 = await scanQr(qrTokens.c);
  const minRes = await placeOrder(s3.cookie, burgerLine(), minCoupon.coupon.code);
  check("order below the minimum is rejected (422)", minRes.status === 422 && /minimum order/i.test(minRes.body.error), minRes.body.error);
  const minOkRes = await placeOrder(s3.cookie, burgerLine(), null);
  check("(control) the same cart succeeds with no coupon at all", minOkRes.status === 201);

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Excessive discount is capped, never produces a negative total");
  const { body: hugeFixed } = await createCoupon(adminCookie, brandId, { discountType: "FIXED", value: 99999999 });
  const s4 = await scanQr(qrTokens.d);
  const o4 = await placeOrder(s4.cookie, burgerLine(), hugeFixed.coupon.code);
  check("order succeeds with an oversized fixed discount", o4.status === 201, JSON.stringify(o4.body));
  check("discount is capped at the subtotal, not the coupon's raw value", parseFloat(o4.body.order.discountTotal) === parseFloat(o4.body.order.subtotal));
  check("total never goes negative", parseFloat(o4.body.order.total) >= 0, o4.body.order.total);

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Usage limit — sequential and concurrent (real race)");
  const { body: singleUse } = await createCoupon(adminCookie, brandId, { maxUses: 1 });
  const s5a = await scanQr(qrTokens.e);
  const firstUse = await placeOrder(s5a.cookie, burgerLine(), singleUse.coupon.code);
  check("first use of a single-use coupon succeeds", firstUse.status === 201);
  const s5b = await scanQr(qrTokens.e);
  const secondUse = await placeOrder(s5b.cookie, burgerLine(), singleUse.coupon.code);
  check("second use of the same single-use coupon is rejected (422)", secondUse.status === 422 && /usage limit/i.test(secondUse.body.error));

  const { body: raceCoupon } = await createCoupon(adminCookie, brandId, { maxUses: 1 });
  // Scan sequentially (each QR scan is itself a read-then-create on the table's
  // session, unrelated to what we're testing here) so only the coupon claim below is
  // actually concurrent — five real, simultaneous checkout requests for one seat.
  const raceSessions = [];
  for (let i = 0; i < 5; i++) raceSessions.push(await scanQr(qrTokens.f));
  const raceResults = await Promise.all(raceSessions.map((s) => placeOrder(s.cookie, burgerLine(), raceCoupon.coupon.code)));
  const raceSuccesses = raceResults.filter((r) => r.status === 201);
  check("under real concurrency, exactly ONE of 5 simultaneous redemptions of a single-use coupon succeeds", raceSuccesses.length === 1, `got ${raceSuccesses.length}`);
  const raceCouponAfter = await localDb.coupon.findUnique({ where: { id: raceCoupon.coupon.id } });
  check("coupon usedCount is exactly 1 after the race, not overcounted", raceCouponAfter.usedCount === 1, raceCouponAfter.usedCount);

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Branch applicability");
  const { body: otherBranchCoupon } = await createCoupon(adminCookie, brandId, { branchIds: ["some-other-branch-id-not-this-one"] });
  const s6 = await scanQr(qrTokens.g);
  const wrongBranchRes = await placeOrder(s6.cookie, burgerLine(), otherBranchCoupon.coupon.code);
  check("a coupon restricted to a different branch is rejected here (422)", wrongBranchRes.status === 422 && /not valid at this branch/i.test(wrongBranchRes.body.error));

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Product/category-specific discounts");
  const { body: productCoupon } = await createCoupon(adminCookie, brandId, { applicableProductIds: [burger.id] });
  const s7a = await scanQr(qrTokens.h);
  const onScopeRes = await placeOrder(s7a.cookie, burgerLine(), productCoupon.coupon.code);
  check("a product-scoped coupon applies when that product is in the cart", onScopeRes.status === 201 && parseFloat(onScopeRes.body.order.discountTotal) > 0);
  const s7b = await scanQr(qrTokens.i);
  const offScopeRes = await placeOrder(s7b.cookie, latteLine(), productCoupon.coupon.code);
  check("the same coupon is rejected when the cart has none of the scoped products", offScopeRes.status === 422 && /does not apply/i.test(offScopeRes.body.error), offScopeRes.body.error);

  // ═══════════════════════════════════════════════════════════════════════
  section("8. Client cannot manipulate the discount amount — only a code is ever accepted");
  const s8 = await scanQr(qrTokens.j);
  const manipulateRes = await fetch(`${LOCAL_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: s8.cookie },
    body: JSON.stringify({ lines: burgerLine(), discountTotal: 999999999, total: 1, couponCode: pctCoupon.coupon.code }),
  });
  const manipulateBody = await manipulateRes.json();
  check("extra client-supplied discountTotal/total fields are ignored entirely", manipulateRes.status === 201 && parseFloat(manipulateBody.order.total) > 1000, JSON.stringify(manipulateBody.order?.total));

  // ═══════════════════════════════════════════════════════════════════════
  section("9. Staff manual discount — RBAC for apply vs. approve");
  const s9 = await scanQr(qrTokens.k);
  const orderForManualDiscount = await placeOrder(s9.cookie, burgerLine(2), null);

  const waiterAttempt = await fetch(`${LOCAL_URL}/api/orders/${orderForManualDiscount.body.order.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: waiterCookie },
    body: JSON.stringify({ type: "PERCENTAGE", value: 5, reason: "test" }),
  });
  check("a Waiter (no discounts.apply) cannot apply any manual discount (403)", waiterAttempt.status === 403);

  const cashierSmallAttempt = await fetch(`${LOCAL_URL}/api/orders/${orderForManualDiscount.body.order.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: cashierCookie },
    body: JSON.stringify({ type: "PERCENTAGE", value: 10, reason: "loyal customer" }),
  });
  check("a Cashier can apply a small discount under the approval threshold", cashierSmallAttempt.status === 201, JSON.stringify(await cashierSmallAttempt.clone().json()));

  const s9b = await scanQr(qrTokens.l);
  const orderForBigDiscount = await placeOrder(s9b.cookie, burgerLine(2), null);
  const cashierBigAttempt = await fetch(`${LOCAL_URL}/api/orders/${orderForBigDiscount.body.order.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: cashierCookie },
    body: JSON.stringify({ type: "PERCENTAGE", value: 50, reason: "manager said ok verbally" }),
  });
  check("a Cashier CANNOT apply a discount above the approval threshold (403)", cashierBigAttempt.status === 403, JSON.stringify(await cashierBigAttempt.clone().json()));

  const managerBigAttempt = await fetch(`${LOCAL_URL}/api/orders/${orderForBigDiscount.body.order.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: managerCookie },
    body: JSON.stringify({ type: "PERCENTAGE", value: 50, reason: "manager-approved goodwill discount" }),
  });
  const managerBigBody = await managerBigAttempt.json();
  check("a Branch Manager (has discounts.approve) CAN apply the same large discount", managerBigAttempt.status === 201, JSON.stringify(managerBigBody));
  check("the approval is recorded on the Discount row", managerBigBody.discount?.approvedByUserId != null);

  const doubleDiscountAttempt = await fetch(`${LOCAL_URL}/api/orders/${orderForBigDiscount.body.order.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: managerCookie },
    body: JSON.stringify({ type: "FIXED", value: 100, reason: "second one" }),
  });
  check("a second discount on the same order is rejected (409)", doubleDiscountAttempt.status === 409);

  // Pay and close the order, then confirm a discount can no longer be added.
  await fetch(`${LOCAL_URL}/api/orders/${orderForManualDiscount.body.order.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "CONFIRMED" }) });
  const freshOrder = await localDb.order.findUnique({ where: { id: orderForManualDiscount.body.order.id } });
  await fetch(`${LOCAL_URL}/api/payments`, { method: "POST", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ orderId: freshOrder.id, method: "CASH", amount: parseFloat(freshOrder.total) }) });
  const postPaidDiscountAttempt = await fetch(`${LOCAL_URL}/api/orders/${freshOrder.id}/discount`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: managerCookie },
    body: JSON.stringify({ type: "FIXED", value: 100, reason: "too late" }),
  });
  check("a paid order can no longer receive a discount (409)", postPaidDiscountAttempt.status === 409);

  // ═══════════════════════════════════════════════════════════════════════
  section("10. Audit log captures who applied and who approved");
  const selfServiceAudit = await localDb.auditLog.findFirst({ where: { entityType: "Discount", entityId: discountRow1.id } });
  check("self-service coupon redemption is audited", !!selfServiceAudit && selfServiceAudit.action === "discount.applied");
  const managerDiscountRow = await localDb.discount.findFirst({ where: { orderId: orderForBigDiscount.body.order.id } });
  const approvalAudit = await localDb.auditLog.findFirst({ where: { entityType: "Discount", entityId: managerDiscountRow.id } });
  check("the manager-approved discount's audit entry records approval", !!approvalAudit && J(approvalAudit.afterJson)?.requiresApproval === true && J(approvalAudit.afterJson)?.approvedByUserId != null);

  // ═══════════════════════════════════════════════════════════════════════
  section("11. Reports reflect real applied discounts");
  const salesReport = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  check("today's sales report discountTotal is greater than zero", salesReport.report.discountTotal > 0, salesReport.report.discountTotal);

  // ═══════════════════════════════════════════════════════════════════════
  section("12. Offline-first — a discounted order still syncs correctly");
  await fetch(`${LOCAL_URL}/api/sync/trigger`, { method: "POST", headers: { cookie: adminCookie } });
  await new Promise((r) => setTimeout(r, 1000));
  const cloudCheck = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/orders`).then((r) => r.json());
  const cloudOrder1 = cloudCheck.orders.find((o) => o.id === `${BRANCH_ID}:${o1.body.order.id}`);
  check("the discounted order reached the cloud with the correct post-discount total", !!cloudOrder1 && cloudOrder1.total === o1.body.order.total, JSON.stringify(cloudOrder1));

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
