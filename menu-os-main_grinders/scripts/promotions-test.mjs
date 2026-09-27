// Real, executed integration test for the Promotions & Offers Engine.
// Talks to the ACTUAL running local app (localhost:3100) and cloud service
// (localhost:4000), reads/writes the ACTUAL local and cloud Postgres databases.
//
// Run: node scripts/promotions-test.mjs
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
async function createPromotion(cookie, brandId, overrides) {
  const res = await fetch(`${LOCAL_URL}/api/promotions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ brandId, name: `Test Promo ${Math.random().toString(36).slice(2, 8)}`, benefitType: "PERCENTAGE_OFF", benefitValue: 10, ...overrides }),
  });
  return { status: res.status, body: await res.json() };
}

async function main() {
  console.log("Menu OS — Promotions & Offers Engine: real, executed test suite");
  console.log("=".repeat(70));

  section("Setup");
  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  const managerCookie = await loginAs("manager@aurum.demo", "Password123!");
  const waiterCookie = await loginAs("waiter@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);
  check("manager logged in", !!managerCookie);
  check("waiter logged in", !!waiterCookie);

  const branch = await localDb.branch.findUniqueOrThrow({ where: { id: BRANCH_ID } });
  const brandId = branch.brandId;
  const menuRes = await fetch(`${LOCAL_URL}/api/menu?branchId=${BRANCH_ID}`).then((r) => r.json());
  const products = menuRes.menus[0].categories.flatMap((c) => c.products);
  const findP = (name) => products.find((p) => p.name === name);
  const tea = findP("Iced Tea"); // 3500, Beverages — isolated for the automatic-category-promo test
  const smoothie = findP("Mango Smoothie"); // 6000 — isolated for BOGO self-referential test
  const burger = findP("Aurum Signature Burger"); // 16000
  const kunafa = findP("Kunafa"); // 7500 — cross-referential benefit product
  const baklava = findP("Baklava Plate"); // 6500, Desserts — isolated for category-scoped % off
  const cheesecake = findP("New York Cheesecake"); // 8500 — isolated for min-order test
  const sparklingWater = findP("Sparkling Water"); // 2000 — isolated for branch-restriction test
  const turkishCoffee = findP("Turkish Coffee"); // 4500 — isolated for schedule test
  const pancake = findP("Pancake Stack"); // 10000 — isolated for per-customer-limit test
  const wrap = findP("Chicken Shawarma Wrap"); // 8500 — isolated for global-usage-limit/race test
  const salad = findP("Caesar Salad"); // 9500 — isolated for priority/non-stacking test
  const juice = findP("Fresh Orange Juice"); // 4500 — isolated for coupon-linked promotion test
  const pasta = findP("Grilled Chicken Pasta"); // 15000 — isolated for the per-customer race-fix test

  const beveragesCategoryId = tea.categoryId ?? (await localDb.category.findFirstOrThrow({ where: { name: "Beverages" } })).id;
  const dessertsCategoryId = baklava.categoryId ?? (await localDb.category.findFirstOrThrow({ where: { name: "Desserts" } })).id;

  const tableTokens = {};
  for (let i = 1; i <= 12; i++) {
    tableTokens[i] = (await localDb.qRCode.findFirst({ where: { branchId: BRANCH_ID, label: `Table ${i}` } })).token;
  }
  const burgerSize = burger.modifierGroups.find((g) => g.name === "Size").options[0].id; // Burger has a required Size group
  const line = (productId, qty = 1) => [{ productId, quantity: qty, modifierOptionIds: productId === burger.id ? [burgerSize] : [] }];

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Admin CRUD — RBAC, create, list, get, edit, pause/resume/archive");
  const waiterCreateAttempt = await createPromotion(waiterCookie, brandId, {});
  check("a Waiter cannot create a promotion (403)", waiterCreateAttempt.status === 403);

  const crudPromo = await createPromotion(managerCookie, brandId, {
    name: "CRUD Test Promotion",
    benefitType: "PERCENTAGE_OFF",
    benefitValue: 5,
  });
  check("a Branch Manager (promotions.manage) can create a promotion", crudPromo.status === 201, JSON.stringify(crudPromo.body));
  const crudId = crudPromo.body.promotion.id;

  const getRes = await fetch(`${LOCAL_URL}/api/promotions/${crudId}`, { headers: { cookie: managerCookie } });
  const getBody = await getRes.json();
  check("GET detail returns the created promotion", getRes.status === 200 && getBody.promotion.id === crudId);

  const listRes = await fetch(`${LOCAL_URL}/api/promotions?brandId=${brandId}&search=CRUD Test`, { headers: { cookie: managerCookie } });
  const listBody = await listRes.json();
  check("GET list finds it via search", listRes.status === 200 && listBody.promotions.some((p) => p.id === crudId));

  const waiterListAttempt = await fetch(`${LOCAL_URL}/api/promotions?brandId=${brandId}`, { headers: { cookie: waiterCookie } });
  check("a Waiter cannot list promotions (403)", waiterListAttempt.status === 403);

  const pauseRes = await fetch(`${LOCAL_URL}/api/promotions/${crudId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: managerCookie },
    body: JSON.stringify({ status: "PAUSED" }),
  });
  const pauseBody = await pauseRes.json();
  check("PATCH pauses the promotion", pauseRes.status === 200 && pauseBody.promotion.status === "PAUSED" && pauseBody.promotion.isActive === false);

  const resumeRes = await fetch(`${LOCAL_URL}/api/promotions/${crudId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: managerCookie },
    body: JSON.stringify({ status: "ACTIVE" }),
  });
  const resumeBody = await resumeRes.json();
  check("PATCH resumes the promotion", resumeRes.status === 200 && resumeBody.promotion.status === "ACTIVE" && resumeBody.promotion.isActive === true);

  const archiveRes = await fetch(`${LOCAL_URL}/api/promotions/${crudId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: managerCookie },
    body: JSON.stringify({ status: "ARCHIVED" }),
  });
  check("PATCH archives the promotion", archiveRes.status === 200 && (await archiveRes.json()).promotion.status === "ARCHIVED");

  const auditPromoCreate = await localDb.auditLog.findFirst({ where: { entityType: "Promotion", entityId: crudId, action: "promotion.created" } });
  const auditPromoPause = await localDb.auditLog.findFirst({ where: { entityType: "Promotion", entityId: crudId, action: "promotion.paused" } });
  check("promotion.created is audited", !!auditPromoCreate);
  check("promotion.paused is audited", !!auditPromoPause);

  const dupRes = await fetch(`${LOCAL_URL}/api/promotions/${crudId}/duplicate`, { method: "POST", headers: { cookie: managerCookie } });
  const dupBody = await dupRes.json();
  check("duplicate creates a new promotion in DRAFT (not silently live)", dupRes.status === 201 && dupBody.promotion.status === "DRAFT" && dupBody.promotion.id !== crudId, JSON.stringify(dupBody));
  check("duplicate's name references the original", dupBody.promotion.name.includes("CRUD Test Promotion"));
  const originalStillArchived = await localDb.promotion.findUnique({ where: { id: crudId } });
  check("duplicating does not mutate the original", originalStillArchived.status === "ARCHIVED");
  const auditDup = await localDb.auditLog.findFirst({ where: { entityType: "Promotion", entityId: dupBody.promotion.id, action: "promotion.duplicated" } });
  check("promotion.duplicated is audited", !!auditDup);

  const creationValidation = await createPromotion(managerCookie, brandId, { benefitType: "FREE_ITEM", eligibleProductIds: [], eligibleCategoryIds: [] });
  check("creating FREE_ITEM/DISCOUNTED_ITEM with no eligible scope is rejected (400)", creationValidation.status === 400);

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Automatic promotion — applied with NO code, category-scoped");
  const autoPromo = await createPromotion(adminCookie, brandId, {
    name: "10% off Beverages (auto)",
    benefitType: "PERCENTAGE_OFF",
    benefitValue: 10,
    eligibleCategoryIds: [beveragesCategoryId],
  });
  check("automatic category-scoped promotion created", autoPromo.status === 201, JSON.stringify(autoPromo.body));
  const s2 = await scanQr(tableTokens[1]);
  const o2 = await placeOrder(s2.cookie, line(tea.id, 1));
  check("order with no coupon code still succeeds", o2.status === 201, JSON.stringify(o2.body));
  check("10% automatic discount applied with zero customer action", parseFloat(o2.body.order.discountTotal) === Math.round(tea.basePrice * 0.1), o2.body.order.discountTotal);
  const discount2 = await localDb.discount.findFirst({ where: { orderId: o2.body.order.id } });
  check("Discount row links back to the Promotion (not a Coupon)", discount2.promotionId === autoPromo.body.promotion.id && discount2.couponId === null);
  const redemption2 = await localDb.promotionRedemption.findFirst({ where: { orderId: o2.body.order.id } });
  check("PromotionRedemption ledger entry was written", !!redemption2 && parseFloat(redemption2.discountAmount.toString()) === parseFloat(discount2.amountApplied.toString()));

  // Preview endpoint (what the customer's cart UI polls) shows the same automatic offer without a code.
  const previewRes = await fetch(`${LOCAL_URL}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: s2.cookie },
    body: JSON.stringify({ lines: line(tea.id, 1) }),
  });
  const previewBody = await previewRes.json();
  check("cart preview (no code) surfaces the automatic promotion by name", previewRes.status === 200 && previewBody.source === "promotion" && previewBody.promotionName === autoPromo.body.promotion.name, JSON.stringify(previewBody));

  await fetch(`${LOCAL_URL}/api/promotions/${autoPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Coupon-based promotion — requires a code, uses the same engine");
  const couponPromo = await createPromotion(adminCookie, brandId, {
    name: "Juice Lovers Code",
    benefitType: "FIXED_OFF",
    benefitValue: 1000,
    eligibleProductIds: [juice.id],
    requiresCouponCode: true,
    couponCode: `JUICE${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  });
  check("coupon-linked promotion created with its coupon", couponPromo.status === 201 && couponPromo.body.promotion.requiresCouponCode === true, JSON.stringify(couponPromo.body));
  const linkedCoupon = await localDb.coupon.findFirst({ where: { promotionId: couponPromo.body.promotion.id } });
  check("a real Coupon row was created and linked to the Promotion", !!linkedCoupon && linkedCoupon.promotionId === couponPromo.body.promotion.id);

  const s3a = await scanQr(tableTokens[2]);
  const o3NoCode = await placeOrder(s3a.cookie, line(juice.id, 1));
  check("without the code, the coupon-required promotion does NOT apply automatically", o3NoCode.status === 201 && parseFloat(o3NoCode.body.order.discountTotal) === 0, o3NoCode.body.order.discountTotal);

  const s3b = await scanQr(tableTokens[2]);
  const o3WithCode = await placeOrder(s3b.cookie, line(juice.id, 1), linkedCoupon.code);
  check("with the code, the promotion applies via the standard coupon field", o3WithCode.status === 201 && parseFloat(o3WithCode.body.order.discountTotal) === 1000, JSON.stringify(o3WithCode.body.order));
  const redemption3 = await localDb.promotionRedemption.findFirst({ where: { orderId: o3WithCode.body.order.id } });
  check("redemption ledger records the coupon-driven promotion use", !!redemption3);

  const s3c = await scanQr(tableTokens[2]);
  const o3badCode = await placeOrder(s3c.cookie, line(burger.id, 1), linkedCoupon.code);
  check("the same code is rejected when the cart has none of the scoped products (422)", o3badCode.status === 422, JSON.stringify(o3badCode.body));
  await fetch(`${LOCAL_URL}/api/promotions/${couponPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("4. BOGO self-referential — buy 2 get 3rd free, worked example verified exactly");
  const bogoPromo = await createPromotion(adminCookie, brandId, {
    name: "Buy 2 Get 1 Free Smoothie",
    benefitType: "FREE_ITEM",
    eligibleProductIds: [smoothie.id],
    eligibleMinQuantity: 2,
    benefitQuantity: 1,
    allowMultiplePerOrder: true,
  });
  check("BOGO promotion created", bogoPromo.status === 201, JSON.stringify(bogoPromo.body));
  const s4a = await scanQr(tableTokens[3]);
  const o4six = await placeOrder(s4a.cookie, line(smoothie.id, 6));
  check("6 bought → exactly 2 free (2 groups of 3)", o4six.status === 201 && parseFloat(o4six.body.order.discountTotal) === smoothie.basePrice * 2, o4six.body.order.discountTotal);
  const s4b = await scanQr(tableTokens[3]);
  const o4seven = await placeOrder(s4b.cookie, line(smoothie.id, 7));
  check("7 bought → still exactly 2 free (6 counted in groups, 1 at full price)", o4seven.status === 201 && parseFloat(o4seven.body.order.discountTotal) === smoothie.basePrice * 2, o4seven.body.order.discountTotal);
  const item4 = await localDb.orderItem.findFirst({ where: { orderId: o4seven.body.order.id } });
  check("the line item itself still totals 7 units at full original price (discount kept separate)", parseFloat(item4.lineTotal.toString()) === smoothie.basePrice * 7);
  await fetch(`${LOCAL_URL}/api/promotions/${bogoPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Cross-referential Buy X Get Y — different eligible vs. benefit product");
  const crossPromo = await createPromotion(adminCookie, brandId, {
    name: "Buy 2 Burgers Get Free Kunafa",
    benefitType: "FREE_ITEM",
    eligibleProductIds: [burger.id],
    eligibleMinQuantity: 2,
    benefitProductIds: [kunafa.id],
    benefitQuantity: 1,
  });
  check("cross-referential promotion created", crossPromo.status === 201, JSON.stringify(crossPromo.body));
  const s5a = await scanQr(tableTokens[4]);
  const o5with = await placeOrder(s5a.cookie, [...line(burger.id, 2), ...line(kunafa.id, 1)]);
  check("2 burgers + 1 kunafa in cart → the kunafa becomes free", o5with.status === 201 && parseFloat(o5with.body.order.discountTotal) === kunafa.basePrice, o5with.body.order.discountTotal);
  const s5b = await scanQr(tableTokens[4]);
  const o5without = await placeOrder(s5b.cookie, line(burger.id, 2));
  check("2 burgers with NO kunafa in cart → no benefit to grant, order still succeeds with zero discount", o5without.status === 201 && parseFloat(o5without.body.order.discountTotal) === 0, o5without.body.order.discountTotal);
  await fetch(`${LOCAL_URL}/api/promotions/${crossPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Category-scoped percentage off (no BOGO grouping)");
  const catPromo = await createPromotion(adminCookie, brandId, {
    name: "20% off Desserts",
    benefitType: "PERCENTAGE_OFF",
    benefitValue: 20,
    eligibleCategoryIds: [dessertsCategoryId],
  });
  const s6 = await scanQr(tableTokens[5]);
  const o6 = await placeOrder(s6.cookie, line(baklava.id, 1));
  check("20% off applies to the whole matching line, not per-unit grouping", o6.status === 201 && parseFloat(o6.body.order.discountTotal) === Math.round(baklava.basePrice * 0.2), o6.body.order.discountTotal);
  await fetch(`${LOCAL_URL}/api/promotions/${catPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Minimum order amount — automatic promotion silently withholds itself below threshold");
  const minPromo = await createPromotion(adminCookie, brandId, {
    name: "Cheesecake min-order offer",
    benefitType: "FIXED_OFF",
    benefitValue: 2000,
    eligibleProductIds: [cheesecake.id],
    minOrderAmount: 20000,
  });
  const s7a = await scanQr(tableTokens[6]);
  const o7below = await placeOrder(s7a.cookie, line(cheesecake.id, 1));
  check("below minOrderAmount → no discount, order still succeeds normally", o7below.status === 201 && parseFloat(o7below.body.order.discountTotal) === 0, o7below.body.order.discountTotal);
  const s7b = await scanQr(tableTokens[6]);
  const o7above = await placeOrder(s7b.cookie, [...line(cheesecake.id, 1), ...line(burger.id, 1)]);
  check("above minOrderAmount → discount applies", o7above.status === 201 && parseFloat(o7above.body.order.discountTotal) === 2000, o7above.body.order.discountTotal);
  await fetch(`${LOCAL_URL}/api/promotions/${minPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("8. Branch restriction");
  const branchPromo = await createPromotion(adminCookie, brandId, {
    name: "Other-branch-only water offer",
    benefitType: "FIXED_OFF",
    benefitValue: 500,
    eligibleProductIds: [sparklingWater.id],
    branchIds: [OTHER_BRANCH_ID],
  });
  const s8 = await scanQr(tableTokens[7]);
  const o8 = await placeOrder(s8.cookie, line(sparklingWater.id, 1));
  check("a promotion restricted to a different branch does not apply here", o8.status === 201 && parseFloat(o8.body.order.discountTotal) === 0, o8.body.order.discountTotal);
  await fetch(`${LOCAL_URL}/api/promotions/${branchPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("9. Scheduled / Happy Hour window");
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const outsideStart = (minutesNow + 120) % 1440;
  const outsideEnd = (minutesNow + 121) % 1440;
  const happyHourOutside = await createPromotion(adminCookie, brandId, {
    name: "Happy Hour (outside window right now)",
    benefitType: "FIXED_OFF",
    benefitValue: 500,
    eligibleProductIds: [turkishCoffee.id],
    startTimeMinutes: outsideStart,
    endTimeMinutes: outsideEnd,
  });
  const s9a = await scanQr(tableTokens[8]);
  const o9outside = await placeOrder(s9a.cookie, line(turkishCoffee.id, 1));
  check("a Happy Hour promotion outside its time window does not apply", o9outside.status === 201 && parseFloat(o9outside.body.order.discountTotal) === 0, o9outside.body.order.discountTotal);
  await fetch(`${LOCAL_URL}/api/promotions/${happyHourOutside.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  const happyHourInside = await createPromotion(adminCookie, brandId, {
    name: "Happy Hour (all day, applies now)",
    benefitType: "FIXED_OFF",
    benefitValue: 500,
    eligibleProductIds: [turkishCoffee.id],
    startTimeMinutes: 0,
    endTimeMinutes: 1439,
    daysOfWeek: [now.getDay()],
  });
  const s9b = await scanQr(tableTokens[8]);
  const o9inside = await placeOrder(s9b.cookie, line(turkishCoffee.id, 1));
  check("a Happy Hour promotion whose window covers right now DOES apply", o9inside.status === 201 && parseFloat(o9inside.body.order.discountTotal) === 500, o9inside.body.order.discountTotal);
  await fetch(`${LOCAL_URL}/api/promotions/${happyHourInside.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("10. Per-customer usage limit");
  const perCustPromo = await createPromotion(adminCookie, brandId, {
    name: "Pancake one-time offer",
    benefitType: "FIXED_OFF",
    benefitValue: 1000,
    eligibleProductIds: [pancake.id],
    maxUsesPerCustomer: 1,
  });
  const s10 = await scanQr(tableTokens[9]);
  const o10first = await placeOrder(s10.cookie, line(pancake.id, 1));
  check("first order from this customer session gets the one-time offer", o10first.status === 201 && parseFloat(o10first.body.order.discountTotal) === 1000, o10first.body.order.discountTotal);
  const o10second = await placeOrder(s10.cookie, line(pancake.id, 1)); // same session, same cookie
  check("second order from the SAME customer session does not get it again", o10second.status === 201 && parseFloat(o10second.body.order.discountTotal) === 0, o10second.body.order.discountTotal);
  await fetch(`${LOCAL_URL}/api/promotions/${perCustPromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("11. Global usage limit — real concurrent redemption race");
  const raceePromo = await createPromotion(adminCookie, brandId, {
    name: "Wrap flash offer (1 use total)",
    benefitType: "FIXED_OFF",
    benefitValue: 1000,
    eligibleProductIds: [wrap.id],
    maxUsesTotal: 1,
  });
  const raceSessions = [];
  for (let i = 0; i < 5; i++) raceSessions.push(await scanQr(tableTokens[10]));
  const raceResults = await Promise.all(raceSessions.map((s) => placeOrder(s.cookie, line(wrap.id, 1))));
  const raceOrderSuccesses = raceResults.filter((r) => r.status === 201);
  const raceDiscounted = raceOrderSuccesses.filter((r) => parseFloat(r.body.order.discountTotal) === 1000);
  check("exactly ONE of 5 simultaneous redemptions actually claims the limited automatic offer", raceDiscounted.length === 1, `got ${raceDiscounted.length} of ${raceOrderSuccesses.length} successful orders`);
  const racePromoAfter = await localDb.promotion.findUnique({ where: { id: raceePromo.body.promotion.id } });
  check("Promotion.usesCount is exactly 1 after the race — no double-grant", racePromoAfter.usesCount === 1, racePromoAfter.usesCount);
  await fetch(`${LOCAL_URL}/api/promotions/${raceePromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("12. Priority / non-stacking — only one promotion ever wins per order");
  const lowPriority = await createPromotion(adminCookie, brandId, {
    name: "Low priority 5% off salad",
    benefitType: "PERCENTAGE_OFF",
    benefitValue: 5,
    eligibleProductIds: [salad.id],
    priority: 1,
  });
  const highPriority = await createPromotion(adminCookie, brandId, {
    name: "High priority 15% off salad",
    benefitType: "PERCENTAGE_OFF",
    benefitValue: 15,
    eligibleProductIds: [salad.id],
    priority: 10,
  });
  const s12a = await scanQr(tableTokens[11]);
  const o12 = await placeOrder(s12a.cookie, line(salad.id, 1));
  check("two conflicting automatic promotions both qualify, but only the higher-priority one applies (no stacking)", o12.status === 201 && parseFloat(o12.body.order.discountTotal) === Math.round(salad.basePrice * 0.15), o12.body.order.discountTotal);
  const discount12 = await localDb.discount.findFirst({ where: { orderId: o12.body.order.id } });
  check("the winning Discount row is the high-priority promotion, not the low one", discount12.promotionId === highPriority.body.promotion.id);

  // A bare (non-promotion) coupon should win over an automatic promotion by default,
  // even one with a larger raw discount — STANDALONE_COUPON_PRIORITY sentinel.
  const standaloneCoupon = await fetch(`${LOCAL_URL}/api/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId, code: `STANDALONE${Math.random().toString(36).slice(2, 6).toUpperCase()}`, discountType: "FIXED", value: 100 }),
  }).then((r) => r.json());
  const s12b = await scanQr(tableTokens[11]);
  const o12coupon = await placeOrder(s12b.cookie, line(salad.id, 1), standaloneCoupon.coupon.code);
  check(
    "a bare coupon code (small amount) still beats a larger automatic promotion by default priority",
    o12coupon.status === 201 && parseFloat(o12coupon.body.order.discountTotal) === 100,
    o12coupon.body.order.discountTotal
  );
  await fetch(`${LOCAL_URL}/api/promotions/${lowPriority.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });
  await fetch(`${LOCAL_URL}/api/promotions/${highPriority.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

  // ═══════════════════════════════════════════════════════════════════════
  section("13. Refund on a promotion-discounted order");
  const paymentForRefund = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: o4six.body.order.id, method: "CASH", amount: parseFloat(o4six.body.order.total) }),
  }).then((r) => r.json());
  const refundRes = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ paymentId: paymentForRefund.payment.id, amount: parseFloat(paymentForRefund.payment.amount), reason: "test refund on promo order" }),
  });
  const refundBody = await refundRes.json();
  check("full refund on a BOGO-discounted order succeeds and refunds exactly the post-discount total", refundRes.status === 201 && parseFloat(refundBody.refund.amount) === parseFloat(o4six.body.order.total));
  check("order status becomes REFUNDED", refundBody.order.status === "REFUNDED");
  const item13 = await localDb.orderItem.findMany({ where: { orderId: o4six.body.order.id } });
  check("the underlying order items still carry their full original prices after refund (nothing was ever zeroed)", item13.every((i) => parseFloat(i.unitPriceSnapshot.toString()) === smoothie.basePrice));

  // ═══════════════════════════════════════════════════════════════════════
  section("14. Offline sync — a promotion-discounted order reaches the cloud correctly");
  await fetch(`${LOCAL_URL}/api/sync/trigger`, { method: "POST", headers: { cookie: adminCookie } });
  const cloudOrder = await waitUntil(async () => {
    const r = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/orders`).then((res) => res.json());
    return r.orders.find((o) => o.id === `${BRANCH_ID}:${o5with.body.order.id}`) ?? null;
  });
  check("the cross-referential promotion order reached the cloud with the correct discounted total", !!cloudOrder && cloudOrder.total === o5with.body.order.total, JSON.stringify(cloudOrder));

  // ═══════════════════════════════════════════════════════════════════════
  section("15. Promotion analytics — real numbers from the DB, not placeholders");
  const analyticsRes = await fetch(`${LOCAL_URL}/api/promotions/${bogoPromo.body.promotion.id}/analytics`, { headers: { cookie: adminCookie } });
  const analyticsBody = await analyticsRes.json();
  check("analytics endpoint responds with real aggregates", analyticsRes.status === 200, JSON.stringify(analyticsBody));
  check("ordersUsingOffer counts the two BOGO orders placed earlier", analyticsBody.ordersUsingOffer === 2, analyticsBody.ordersUsingOffer);
  check("totalDiscountValue equals 2x2 free smoothies' worth (both orders)", analyticsBody.totalDiscountValue === smoothie.basePrice * 2 * 2, analyticsBody.totalDiscountValue);
  check("productsAffected includes the smoothie", analyticsBody.productsAffected.includes(smoothie.id));
  check("branchPerformance reports this branch", analyticsBody.branchPerformance.some((b) => b.branchId === BRANCH_ID));

  const waiterAnalyticsAttempt = await fetch(`${LOCAL_URL}/api/promotions/${bogoPromo.body.promotion.id}/analytics`, { headers: { cookie: waiterCookie } });
  check("a Waiter cannot view promotion analytics (403)", waiterAnalyticsAttempt.status === 403);

  // ═══════════════════════════════════════════════════════════════════════
  section("16. Regression — a plain, non-promotion coupon still works exactly as before");
  const plainCoupon = await fetch(`${LOCAL_URL}/api/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId, code: `PLAIN${Math.random().toString(36).slice(2, 6).toUpperCase()}`, discountType: "PERCENTAGE", value: 15 }),
  }).then((r) => r.json());
  const s16 = await scanQr(tableTokens[1]);
  const o16 = await placeOrder(s16.cookie, line(turkishCoffee.id, 1), plainCoupon.coupon.code);
  check("a plain PERCENTAGE coupon (no linked promotion) still applies correctly", o16.status === 201 && parseFloat(o16.body.order.discountTotal) === Math.round(turkishCoffee.basePrice * 0.15), JSON.stringify(o16.body.order));

  // ═══════════════════════════════════════════════════════════════════════
  section("17. maxUsesPerCustomer race fix — real concurrency from the SAME customer session");
  // Before the fix, two simultaneous requests from the same guest could both read
  // "0 prior uses" and both succeed, exceeding a maxUsesPerCustomer:1 limit. This
  // fires 5 truly concurrent requests from ONE session (one scanQr, one cookie) to
  // prove the advisory-lock claim in claimPromotionPerCustomerLimit actually holds.
  const perCustRacePromo = await createPromotion(adminCookie, brandId, {
    name: "Pasta one-per-customer race test",
    benefitType: "FIXED_OFF",
    benefitValue: 1500,
    eligibleProductIds: [pasta.id],
    maxUsesPerCustomer: 1,
  });
  const s17 = await scanQr(tableTokens[2]);
  const raceResults17 = await Promise.all(Array.from({ length: 5 }, () => placeOrder(s17.cookie, line(pasta.id, 1))));
  const discounted17 = raceResults17.filter((r) => r.status === 201 && parseFloat(r.body.order.discountTotal) === 1500);
  check(
    "exactly ONE of 5 concurrent same-customer orders actually claims the per-customer-limited offer",
    discounted17.length === 1,
    `got ${discounted17.length} discounted of ${raceResults17.filter((r) => r.status === 201).length} successful orders`
  );
  const allRedemptions17 = await localDb.promotionRedemption.findMany({ where: { promotionId: perCustRacePromo.body.promotion.id } });
  check("exactly one PromotionRedemption row exists for this promotion — no double-grant under the race", allRedemptions17.length === 1, allRedemptions17.length);
  await fetch(`${LOCAL_URL}/api/promotions/${perCustRacePromo.body.promotion.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: adminCookie }, body: JSON.stringify({ status: "ARCHIVED" }) });

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
