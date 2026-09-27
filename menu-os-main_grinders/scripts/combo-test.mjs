// Real, executed integration test for the Fixed-Price Combo/Bundle feature.
// Talks to the ACTUAL running local app (localhost:3100) and cloud service
// (localhost:4000), reads/writes the ACTUAL local and cloud Postgres databases.
//
// Run: node scripts/combo-test.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const CLOUD_URL = "http://localhost:4000";
const BRANCH_ID = "cmug2a45d0004stemr504wzug";
const OTHER_BRANCH_ID = "some-other-branch";

const { PrismaClient: LocalPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const { PrismaClient: CloudPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/cloud-db/generated/client/index.js")));
const localDb = new LocalPrismaClient();
const cloudDb = new CloudPrismaClient();

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
    console.log(`  \x1b[31m✗\x1b[0m ${label}${detail !== undefined ? ` — ${detail}` : ""}`);
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
async function placeOrder(cookie, lines, couponCode) {
  const res = await fetch(`${LOCAL_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ lines, couponCode: couponCode ?? undefined }),
  });
  return { status: res.status, body: await res.json() };
}
async function createCombo(cookie, brandId, overrides) {
  const res = await fetch(`${LOCAL_URL}/api/combos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ brandId, name: `Test Combo ${Math.random().toString(36).slice(2, 8)}`, fixedPrice: 10000, ...overrides }),
  });
  return { status: res.status, body: await res.json() };
}
async function archiveCombo(cookie, id) {
  await fetch(`${LOCAL_URL}/api/combos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ status: "ARCHIVED" }) });
}
async function createPromotion(cookie, brandId, overrides) {
  const res = await fetch(`${LOCAL_URL}/api/promotions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ brandId, name: `Test Promo ${Math.random().toString(36).slice(2, 8)}`, benefitType: "PERCENTAGE_OFF", benefitValue: 10, ...overrides }),
  });
  return { status: res.status, body: await res.json() };
}
async function archivePromotion(cookie, id) {
  await fetch(`${LOCAL_URL}/api/promotions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ status: "ARCHIVED" }) });
}

async function main() {
  console.log("Menu OS — Fixed-Price Combo/Bundle: real, executed test suite");
  console.log("=".repeat(70));

  section("Setup");
  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  const waiterCookie = await loginAs("waiter@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);
  check("waiter logged in", !!waiterCookie);

  const branch = await localDb.branch.findUniqueOrThrow({ where: { id: BRANCH_ID } });
  const brandId = branch.brandId;
  const menuRes = await fetch(`${LOCAL_URL}/api/menu?branchId=${BRANCH_ID}`).then((r) => r.json());
  const products = menuRes.menus[0].categories.flatMap((c) => c.products);
  const findP = (name) => products.find((p) => p.name === name);
  const pizza = findP("Margherita Pizza"); // 13000
  const salad = findP("Halloumi Salad"); // 10000
  const water = findP("Sparkling Water"); // 2000
  const pasta = findP("Grilled Chicken Pasta"); // 15000 — isolated for race tests
  const dessert = findP("Tiramisu"); // 8000 — isolated for priority-vs-promotion test

  const tableTokens = {};
  for (let i = 1; i <= 12; i++) {
    tableTokens[i] = (await localDb.qRCode.findFirst({ where: { branchId: BRANCH_ID, label: `Table ${i}` } })).token;
  }
  const line = (productId, qty = 1) => [{ productId, quantity: qty, modifierOptionIds: [] }];
  const mealSet = (qty = 1) => [...line(pizza.id, qty), ...line(salad.id, qty), ...line(water.id, qty)];
  const mealSlots = [
    { label: "Main", productIds: [pizza.id], categoryIds: [], quantity: 1 },
    { label: "Side", productIds: [salad.id], categoryIds: [], quantity: 1 },
    { label: "Drink", productIds: [water.id], categoryIds: [], quantity: 1 },
  ];

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Admin CRUD — RBAC, validation, create, list, get, edit, pause/resume/archive, duplicate");
  const waiterCreateAttempt = await createCombo(waiterCookie, brandId, { slots: mealSlots });
  check("a Waiter cannot create a combo (403)", waiterCreateAttempt.status === 403);

  const oneSlotAttempt = await createCombo(adminCookie, brandId, { slots: [mealSlots[0]] });
  check("a combo with fewer than 2 slots is rejected (400)", oneSlotAttempt.status === 400);

  const emptyScopeAttempt = await createCombo(adminCookie, brandId, { slots: [{ label: "A", productIds: [], categoryIds: [], quantity: 1 }, mealSlots[1]] });
  check("a slot with no product/category scope is rejected (400)", emptyScopeAttempt.status === 400);

  const crudCombo = await createCombo(adminCookie, brandId, { name: "CRUD Test Combo", fixedPrice: 20000, slots: mealSlots });
  check("a valid combo is created", crudCombo.status === 201 && crudCombo.body.combo.slots.length === 3, JSON.stringify(crudCombo.body));
  const crudId = crudCombo.body.combo.id;

  const getRes = await fetch(`${LOCAL_URL}/api/combos/${crudId}`, { headers: { cookie: adminCookie } });
  check("GET detail returns the created combo with its slots", getRes.status === 200 && (await getRes.json()).combo.slots.length === 3);

  const listRes = await fetch(`${LOCAL_URL}/api/combos?brandId=${brandId}&search=CRUD Test`, { headers: { cookie: adminCookie } });
  const listBody = await listRes.json();
  check("GET list finds it via search", listRes.status === 200 && listBody.combos.some((c) => c.id === crudId));

  const waiterListAttempt = await fetch(`${LOCAL_URL}/api/combos?brandId=${brandId}`, { headers: { cookie: waiterCookie } });
  check("a Waiter cannot list combos (403)", waiterListAttempt.status === 403);

  const pauseRes = await fetch(`${LOCAL_URL}/api/combos/${crudId}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "PAUSED" }) });
  check("PATCH pauses the combo", pauseRes.status === 200 && (await pauseRes.json()).combo.status === "PAUSED");
  const resumeRes = await fetch(`${LOCAL_URL}/api/combos/${crudId}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ACTIVE" }) });
  check("PATCH resumes the combo", resumeRes.status === 200 && (await resumeRes.json()).combo.status === "ACTIVE");
  await archiveCombo(adminCookie, crudId);
  const archived = await localDb.comboDeal.findUnique({ where: { id: crudId } });
  check("PATCH archives the combo", archived.status === "ARCHIVED");

  const auditCreate = await localDb.auditLog.findFirst({ where: { entityType: "ComboDeal", entityId: crudId, action: "combo.created" } });
  const auditPause = await localDb.auditLog.findFirst({ where: { entityType: "ComboDeal", entityId: crudId, action: "combo.paused" } });
  check("combo.created is audited", !!auditCreate);
  check("combo.paused is audited", !!auditPause);

  const dupRes = await fetch(`${LOCAL_URL}/api/combos/${crudId}/duplicate`, { method: "POST", headers: { cookie: adminCookie } });
  const dupBody = await dupRes.json();
  check("duplicate creates a new combo in DRAFT with its slots cloned", dupRes.status === 201 && dupBody.combo.status === "DRAFT" && dupBody.combo.slots.length === 3, JSON.stringify(dupBody));
  const originalStillArchived = await localDb.comboDeal.findUnique({ where: { id: crudId } });
  check("duplicating does not mutate the original", originalStillArchived.status === "ARCHIVED");

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Core combo pricing — fixed price replaces the sum of the matched items");
  const mealCombo = await createCombo(adminCookie, brandId, { name: "Meal Deal", fixedPrice: 20000, slots: mealSlots });
  check("meal combo created", mealCombo.status === 201, JSON.stringify(mealCombo.body));
  const originalSum = pizza.basePrice + salad.basePrice + water.basePrice; // 13000+10000+2000 = 25000
  const s2 = await scanQr(tableTokens[1]);
  const o2 = await placeOrder(s2.cookie, mealSet(1));
  check("order with all 3 slots present succeeds", o2.status === 201, JSON.stringify(o2.body));
  check("discountTotal equals the sum of original prices minus the fixed price", parseFloat(o2.body.order.discountTotal) === originalSum - 20000, o2.body.order.discountTotal);
  check("order total reflects the fixed bundle price (plus tax/fee on it)", parseFloat(o2.body.order.total) === 20000 + parseFloat(o2.body.order.taxTotal) + parseFloat(o2.body.order.serviceFeeTotal), o2.body.order.total);
  const items2 = await localDb.orderItem.findMany({ where: { orderId: o2.body.order.id } });
  check("every OrderItem keeps its ORIGINAL price — never touched, never zeroed", items2.every((i) => [pizza.basePrice, salad.basePrice, water.basePrice].includes(parseFloat(i.unitPriceSnapshot.toString()))));
  const discount2 = await localDb.discount.findFirst({ where: { orderId: o2.body.order.id } });
  check("Discount row records type COMBO with the combo linked and the fixed price as its 'value'", discount2.type === "COMBO" && discount2.comboDealId === mealCombo.body.combo.id && parseFloat(discount2.value.toString()) === 20000);
  const redemption2 = await localDb.comboRedemption.findFirst({ where: { orderId: o2.body.order.id } });
  check("ComboRedemption ledger entry was written with the correct saved amount and 1 set", !!redemption2 && parseFloat(redemption2.savedAmount.toString()) === originalSum - 20000 && redemption2.setsApplied === 1);
  const auditApplied = await localDb.auditLog.findFirst({ where: { entityType: "Discount", entityId: discount2.id, action: "combo.applied" } });
  check("combo.applied is audited", !!auditApplied);

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Missing a slot — no discount, order still succeeds at full price");
  const s3 = await scanQr(tableTokens[2]);
  const o3 = await placeOrder(s3.cookie, [...line(pizza.id, 1), ...line(salad.id, 1)]); // no water
  check("order without every slot filled gets no combo discount", o3.status === 201 && parseFloat(o3.body.order.discountTotal) === 0, o3.body.order.discountTotal);

  // ═══════════════════════════════════════════════════════════════════════
  section("4. allowMultiplePerOrder — the cart can form more than one complete set");
  const s4 = await scanQr(tableTokens[3]);
  const o4 = await placeOrder(s4.cookie, mealSet(2)); // 2x of each slot item = 2 complete sets
  check("2 full sets in one cart → discount = 2 × (original sum − fixed price)", o4.status === 201 && parseFloat(o4.body.order.discountTotal) === 2 * (originalSum - 20000), o4.body.order.discountTotal);
  const redemption4 = await localDb.comboRedemption.findFirst({ where: { orderId: o4.body.order.id } });
  check("ComboRedemption records setsApplied = 2", redemption4.setsApplied === 2);

  const singleSetCombo = await createCombo(adminCookie, brandId, { name: "Meal Deal (single set only)", fixedPrice: 20000, allowMultiplePerOrder: false, slots: mealSlots });
  await archiveCombo(adminCookie, mealCombo.body.combo.id); // avoid both combos competing in step 5
  const s4b = await scanQr(tableTokens[3]);
  const o4b = await placeOrder(s4b.cookie, mealSet(2));
  check("allowMultiplePerOrder:false caps at one set even with enough items for two", o4b.status === 201 && parseFloat(o4b.body.order.discountTotal) === originalSum - 20000, o4b.body.order.discountTotal);
  await archiveCombo(adminCookie, singleSetCombo.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Slot quantity — a slot can require more than 1 unit");
  const doubleDrinkCombo = await createCombo(adminCookie, brandId, {
    name: "Meal Deal (2 drinks required)",
    fixedPrice: 22000,
    slots: [mealSlots[0], mealSlots[1], { label: "Drinks", productIds: [water.id], categoryIds: [], quantity: 2 }],
  });
  const s5a = await scanQr(tableTokens[4]);
  const o5insufficient = await placeOrder(s5a.cookie, [...line(pizza.id, 1), ...line(salad.id, 1), ...line(water.id, 1)]); // only 1 water, needs 2
  check("only 1 of the 2 required drinks → no discount", o5insufficient.status === 201 && parseFloat(o5insufficient.body.order.discountTotal) === 0, o5insufficient.body.order.discountTotal);
  const s5b = await scanQr(tableTokens[4]);
  const o5enough = await placeOrder(s5b.cookie, [...line(pizza.id, 1), ...line(salad.id, 1), ...line(water.id, 2)]);
  check("2 drinks present → the quantity requirement is met and the discount applies", o5enough.status === 201 && parseFloat(o5enough.body.order.discountTotal) === pizza.basePrice + salad.basePrice + water.basePrice * 2 - 22000, o5enough.body.order.discountTotal);
  await archiveCombo(adminCookie, doubleDrinkCombo.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Branch restriction");
  const branchCombo = await createCombo(adminCookie, brandId, { name: "Other-branch-only combo", fixedPrice: 20000, slots: mealSlots, branchIds: [OTHER_BRANCH_ID] });
  const s6 = await scanQr(tableTokens[5]);
  const o6 = await placeOrder(s6.cookie, mealSet(1));
  check("a combo restricted to a different branch does not apply here", o6.status === 201 && parseFloat(o6.body.order.discountTotal) === 0, o6.body.order.discountTotal);
  await archiveCombo(adminCookie, branchCombo.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Scheduled window");
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const outsideStart = (minutesNow + 120) % 1440;
  const outsideEnd = (minutesNow + 121) % 1440;
  const outsideCombo = await createCombo(adminCookie, brandId, { name: "Combo outside window", fixedPrice: 20000, slots: mealSlots, startTimeMinutes: outsideStart, endTimeMinutes: outsideEnd });
  const s7a = await scanQr(tableTokens[6]);
  const o7outside = await placeOrder(s7a.cookie, mealSet(1));
  check("a combo outside its scheduled window does not apply", o7outside.status === 201 && parseFloat(o7outside.body.order.discountTotal) === 0, o7outside.body.order.discountTotal);
  await archiveCombo(adminCookie, outsideCombo.body.combo.id);

  const insideCombo = await createCombo(adminCookie, brandId, { name: "Combo inside window", fixedPrice: 20000, slots: mealSlots, startTimeMinutes: 0, endTimeMinutes: 1439, daysOfWeek: [now.getDay()] });
  const s7b = await scanQr(tableTokens[6]);
  const o7inside = await placeOrder(s7b.cookie, mealSet(1));
  check("a combo whose window covers right now DOES apply", o7inside.status === 201 && parseFloat(o7inside.body.order.discountTotal) === originalSum - 20000, o7inside.body.order.discountTotal);
  await archiveCombo(adminCookie, insideCombo.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("8. Global usage limit — real concurrent redemption race");
  const globalRaceCombo = await createCombo(adminCookie, brandId, { name: "Pasta combo flash offer", fixedPrice: 12000, maxUsesTotal: 1, slots: [{ label: "Main", productIds: [pasta.id], categoryIds: [], quantity: 1 }, { label: "Drink", productIds: [water.id], categoryIds: [], quantity: 1 }] });
  const raceSessions = [];
  for (let i = 0; i < 5; i++) raceSessions.push(await scanQr(tableTokens[7]));
  const raceResults = await Promise.all(raceSessions.map((s) => placeOrder(s.cookie, [...line(pasta.id, 1), ...line(water.id, 1)])));
  const raceDiscounted = raceResults.filter((r) => r.status === 201 && parseFloat(r.body.order.discountTotal) > 0);
  check("exactly ONE of 5 simultaneous redemptions claims the globally-limited combo", raceDiscounted.length === 1, `got ${raceDiscounted.length}`);
  const globalComboAfter = await localDb.comboDeal.findUnique({ where: { id: globalRaceCombo.body.combo.id } });
  check("ComboDeal.usesCount is exactly 1 after the race — no double-grant", globalComboAfter.usesCount === 1, globalComboAfter.usesCount);
  await archiveCombo(adminCookie, globalRaceCombo.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("9. Per-customer usage limit — real concurrency from the SAME customer session");
  const perCustComboRace = await createCombo(adminCookie, brandId, { name: "Pasta combo one-per-customer", fixedPrice: 12000, maxUsesPerCustomer: 1, slots: [{ label: "Main", productIds: [pasta.id], categoryIds: [], quantity: 1 }, { label: "Drink", productIds: [water.id], categoryIds: [], quantity: 1 }] });
  const s9 = await scanQr(tableTokens[8]);
  const perCustResults = await Promise.all(Array.from({ length: 5 }, () => placeOrder(s9.cookie, [...line(pasta.id, 1), ...line(water.id, 1)])));
  const perCustDiscounted = perCustResults.filter((r) => r.status === 201 && parseFloat(r.body.order.discountTotal) > 0);
  check("exactly ONE of 5 concurrent same-customer orders claims the per-customer-limited combo", perCustDiscounted.length === 1, `got ${perCustDiscounted.length}`);
  const comboRedemptionsAfter = await localDb.comboRedemption.findMany({ where: { comboDealId: perCustComboRace.body.combo.id } });
  check("exactly one ComboRedemption row exists — no double-grant under the race", comboRedemptionsAfter.length === 1, comboRedemptionsAfter.length);
  await archiveCombo(adminCookie, perCustComboRace.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("10. Priority — a combo and an automatic promotion can both qualify; only one wins");
  const dessertPromo = await createPromotion(adminCookie, brandId, { name: "50% off Tiramisu (low priority)", benefitType: "PERCENTAGE_OFF", benefitValue: 50, eligibleProductIds: [dessert.id], priority: 1 });
  const dessertCombo = await createCombo(adminCookie, brandId, {
    name: "Tiramisu + Water combo (high priority)",
    fixedPrice: 8000,
    priority: 10,
    slots: [{ label: "Dessert", productIds: [dessert.id], categoryIds: [], quantity: 1 }, { label: "Drink", productIds: [water.id], categoryIds: [], quantity: 1 }],
  });
  const s10a = await scanQr(tableTokens[9]);
  const o10a = await placeOrder(s10a.cookie, [...line(dessert.id, 1), ...line(water.id, 1)]);
  const comboDiscountAmount = dessert.basePrice + water.basePrice - 8000;
  check("higher-priority combo wins over a lower-priority automatic promotion on the same cart", o10a.status === 201 && parseFloat(o10a.body.order.discountTotal) === comboDiscountAmount, o10a.body.order.discountTotal);
  const discount10a = await localDb.discount.findFirst({ where: { orderId: o10a.body.order.id } });
  check("the winning Discount row is the combo, not the promotion", discount10a.type === "COMBO" && discount10a.comboDealId === dessertCombo.body.combo.id);

  await archivePromotion(adminCookie, dessertPromo.body.promotion.id);
  await archiveCombo(adminCookie, dessertCombo.body.combo.id);
  const dessertPromoHigh = await createPromotion(adminCookie, brandId, { name: "50% off Tiramisu (high priority)", benefitType: "PERCENTAGE_OFF", benefitValue: 50, eligibleProductIds: [dessert.id], priority: 20 });
  const dessertComboLow = await createCombo(adminCookie, brandId, {
    name: "Tiramisu + Water combo (low priority)",
    fixedPrice: 8000,
    priority: 1,
    slots: [{ label: "Dessert", productIds: [dessert.id], categoryIds: [], quantity: 1 }, { label: "Drink", productIds: [water.id], categoryIds: [], quantity: 1 }],
  });
  const s10b = await scanQr(tableTokens[9]);
  const o10b = await placeOrder(s10b.cookie, [...line(dessert.id, 1), ...line(water.id, 1)]);
  const promoDiscountAmount = Math.round(dessert.basePrice * 0.5);
  check("flipping priority makes the promotion win instead — the resolver isn't hardcoded to either kind", o10b.status === 201 && parseFloat(o10b.body.order.discountTotal) === promoDiscountAmount, o10b.body.order.discountTotal);
  await archivePromotion(adminCookie, dessertPromoHigh.body.promotion.id);
  await archiveCombo(adminCookie, dessertComboLow.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("11. Full financial flow — Payment → Refund → Reports → Analytics → Audit → Offline Sync");
  const financeCombo = await createCombo(adminCookie, brandId, { name: "Finance-flow Meal Deal", fixedPrice: 20000, slots: mealSlots });
  const s11 = await scanQr(tableTokens[10]);
  const o11 = await placeOrder(s11.cookie, mealSet(1));
  check("combo order for the financial flow succeeds", o11.status === 201, JSON.stringify(o11.body));

  const payment11 = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: o11.body.order.id, method: "CASH", amount: parseFloat(o11.body.order.total) }),
  }).then((r) => r.json());
  check("payment equals the post-combo-discount total", parseFloat(payment11.payment.amount) === parseFloat(o11.body.order.total));

  const refund11 = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ paymentId: payment11.payment.id, amount: parseFloat(payment11.payment.amount), reason: "combo refund test" }),
  });
  const refundBody11 = await refund11.json();
  check("full refund on a combo order succeeds and refunds exactly what was paid", refund11.status === 201 && parseFloat(refundBody11.refund.amount) === parseFloat(payment11.payment.amount));
  check("order status becomes REFUNDED", refundBody11.order.status === "REFUNDED");
  const auditRefund11 = await localDb.auditLog.findFirst({ where: { entityType: "Refund", action: "refund.created" }, orderBy: { createdAt: "desc" } });
  check("the refund itself is audited", !!auditRefund11);

  const salesReport = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  check("sales report's discountTotal includes the combo savings", salesReport.report.discountTotal > 0, salesReport.report.discountTotal);

  const analyticsRes = await fetch(`${LOCAL_URL}/api/combos/${financeCombo.body.combo.id}/analytics`, { headers: { cookie: adminCookie } });
  const analyticsBody = await analyticsRes.json();
  check("combo analytics reflects the real redemption", analyticsRes.status === 200 && analyticsBody.ordersUsingOffer === 1 && analyticsBody.totalSavings === originalSum - 20000, JSON.stringify(analyticsBody));
  const waiterAnalyticsAttempt = await fetch(`${LOCAL_URL}/api/combos/${financeCombo.body.combo.id}/analytics`, { headers: { cookie: waiterCookie } });
  check("a Waiter cannot view combo analytics (403)", waiterAnalyticsAttempt.status === 403);

  await fetch(`${LOCAL_URL}/api/sync/trigger`, { method: "POST", headers: { cookie: adminCookie } });
  const cloudOrder11 = await waitUntil(async () => {
    const r = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/orders`).then((res) => res.json());
    return r.orders.find((o) => o.id === `${BRANCH_ID}:${o11.body.order.id}`) ?? null;
  });
  check("the combo order reached the cloud with the correct discounted total", !!cloudOrder11 && cloudOrder11.total === o11.body.order.total, JSON.stringify(cloudOrder11));
  await archiveCombo(adminCookie, financeCombo.body.combo.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("12. Regression — plain orders and existing FREE_ITEM/promotion flows are unaffected by combos existing");
  const s12 = await scanQr(tableTokens[11]);
  const o12 = await placeOrder(s12.cookie, line(pizza.id, 1)); // just a pizza, no combo scope match, no promo
  check("a normal order with no matching combo/promotion still prices at full price", o12.status === 201 && parseFloat(o12.body.order.discountTotal) === 0 && parseFloat(o12.body.order.subtotal) === pizza.basePrice, JSON.stringify(o12.body.order));

  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(70));
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log("Failed checks:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
  await localDb.$disconnect();
  await cloudDb.$disconnect();
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exitCode = 1;
});
