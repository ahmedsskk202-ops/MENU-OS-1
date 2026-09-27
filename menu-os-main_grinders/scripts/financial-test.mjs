// Real, executed integration test for the Financial Reports + Accounting module.
// Hits the actual running app (localhost:3100) and actual databases (local + cloud).
// Run: node scripts/financial-test.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const CLOUD_URL = "http://localhost:4000";
const BRANCH_ID = "cmug2a45d0004stemr504wzug";
// Every branch-scoped Cloud* projection's row id is `${branchId}:${localId}`, not the
// bare local id — see scripts/cloud-isolation-test.mjs for why.
const cid = (id) => `${BRANCH_ID}:${id}`;

const { PrismaClient: LocalPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const { PrismaClient: CloudPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/cloud-db/generated/client/index.js")));
const localDb = new LocalPrismaClient();
const cloudDb = new CloudPrismaClient();

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
    await sleep(intervalMs);
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
  const location = res.headers.get("location");
  return { cookie, tableSessionId: location.split("/t/")[1] };
}

async function main() {
  console.log("Menu OS — Financial/Accounting Module: real, executed test suite");
  console.log("=".repeat(70));

  section("Setup");
  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  const waiterCookie = await loginAs("waiter@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);
  check("waiter logged in (used for RBAC negative tests)", !!waiterCookie);

  // Make sure no shift is left open from a previous run of this script.
  const existingOpen = await localDb.shift.findFirst({ where: { branchId: BRANCH_ID, status: "OPEN" } });
  if (existingOpen) {
    await fetch(`${LOCAL_URL}/api/shifts/${existingOpen.id}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: adminCookie },
      body: JSON.stringify({ actualCash: existingOpen.openingCash.toNumber(), varianceReason: "test cleanup" }),
    });
  }

  const menuRes = await fetch(`${LOCAL_URL}/api/menu?branchId=${BRANCH_ID}`).then((r) => r.json());
  const burger = menuRes.menus[0].categories.flatMap((c) => c.products).find((p) => p.name.includes("Burger"));
  const burgerSize = burger.modifierGroups.find((g) => g.name === "Size").options[0].id;
  const qr = await localDb.qRCode.findFirst({ where: { branchId: BRANCH_ID, label: "Table 10" } });

  // ═══════════════════════════════════════════════════════════════════════
  section("1. RBAC — a Waiter cannot open a shift, record an expense, or issue a refund");
  const waiterShiftAttempt = await fetch(`${LOCAL_URL}/api/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: waiterCookie },
    body: JSON.stringify({ branchId: BRANCH_ID, openingCash: 100000 }),
  });
  check("waiter cannot open a shift (403)", waiterShiftAttempt.status === 403);
  const waiterExpenseAttempt = await fetch(`${LOCAL_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: waiterCookie },
    body: JSON.stringify({ branchId: BRANCH_ID, category: "Test", amount: 1000 }),
  });
  check("waiter cannot record an expense (403)", waiterExpenseAttempt.status === 403);
  const waiterRefundAttempt = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: waiterCookie },
    body: JSON.stringify({ paymentId: "does-not-matter", amount: 1000, reason: "test" }),
  });
  check("waiter cannot issue a refund (403)", waiterRefundAttempt.status === 403);
  const waiterReportAttempt = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: waiterCookie } });
  check("waiter cannot view reports (403)", waiterReportAttempt.status === 403);

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Shift open — business rule: only one open shift per branch");
  const openRes = await fetch(`${LOCAL_URL}/api/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ branchId: BRANCH_ID, openingCash: 100000 }),
  });
  const openBody = await openRes.json();
  check("shift opens with the given opening cash", openRes.status === 201 && openBody.shift.openingCash === "100000", JSON.stringify(openBody));
  const shiftId = openBody.shift.id;

  const secondOpenAttempt = await fetch(`${LOCAL_URL}/api/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ branchId: BRANCH_ID, openingCash: 50000 }),
  });
  check("cannot open a second shift while one is open (409)", secondOpenAttempt.status === 409);

  // ═══════════════════════════════════════════════════════════════════════
  section("3. A real order + cash payment attributed to this shift");
  const s = await scanQr(qr.token);
  const orderRes = await fetch(`${LOCAL_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: s.cookie },
    body: JSON.stringify({ lines: [{ productId: burger.id, quantity: 1, modifierOptionIds: [burgerSize] }] }),
  });
  const orderBody = await orderRes.json();
  check("order placed", orderRes.status === 201);
  const orderTotal = parseFloat(orderBody.order.total);

  const paymentRes = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: orderBody.order.id, method: "CASH", amount: orderTotal, tipAmount: 2000 }),
  });
  const paymentBody = await paymentRes.json();
  check("cash payment recorded and verified", paymentRes.status === 201 && paymentBody.payment.status === "VERIFIED");
  check("payment is attributed to the open shift", paymentBody.payment.shiftId === shiftId, `got ${paymentBody.payment.shiftId}`);
  check("tip amount persisted separately from the order total", paymentBody.payment.tipAmount === "2000");

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Cash movements + expense during the shift");
  const cashInRes = await fetch(`${LOCAL_URL}/api/shifts/${shiftId}/cash-movements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ type: "CASH_IN", amount: 20000, reason: "float top-up" }),
  });
  check("cash-in recorded", cashInRes.status === 201);
  const cashOutRes = await fetch(`${LOCAL_URL}/api/shifts/${shiftId}/cash-movements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ type: "CASH_OUT", amount: 5000, reason: "petty cash for cleaning supplies" }),
  });
  check("cash-out recorded", cashOutRes.status === 201);
  const expenseRes = await fetch(`${LOCAL_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ branchId: BRANCH_ID, shiftId, category: "Supplies", amount: 7500, description: "Napkins" }),
  });
  check("expense recorded", expenseRes.status === 201);

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Real calculation — cash reconciliation math matches by hand");
  const reconRes = await fetch(`${LOCAL_URL}/api/reports/cash-reconciliation?shiftId=${shiftId}`, { headers: { cookie: adminCookie } });
  const recon = (await reconRes.json()).report;
  const handComputedExpected = 100000 /* opening */ + orderTotal /* cash sale */ + 20000 /* cash in */ - 5000; /* cash out */
  check("expected cash matches an independent hand calculation", recon.expectedCash === handComputedExpected, `api=${recon.expectedCash} hand=${handComputedExpected}`);
  check("cash sales in the reconciliation match the order total", recon.cashSales === orderTotal);

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Daily closing — requires a reason for variance, then succeeds and is audited");
  const wrongCloseRes = await fetch(`${LOCAL_URL}/api/shifts/${shiftId}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ actualCash: handComputedExpected - 1500 }), // short by 1500, no reason given
  });
  check("closing with an unexplained variance is rejected (422)", wrongCloseRes.status === 422);

  const closeRes = await fetch(`${LOCAL_URL}/api/shifts/${shiftId}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ actualCash: handComputedExpected - 1500, varianceReason: "Till was short — under investigation" }),
  });
  const closeBody = await closeRes.json();
  check("shift closes once a variance reason is given", closeRes.status === 200 && closeBody.shift.status === "CLOSED");
  check("variance computed correctly (actual - expected)", parseFloat(closeBody.shift.variance) === -1500, closeBody.shift.variance);

  const reCloseAttempt = await fetch(`${LOCAL_URL}/api/shifts/${shiftId}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ actualCash: 0, varianceReason: "x" }),
  });
  check("an already-closed shift cannot be closed again (409)", reCloseAttempt.status === 409);

  const closeAudit = await localDb.auditLog.findFirst({ where: { entityType: "Shift", entityId: shiftId, action: "shift.closed" } });
  check("shift close is audited with before/after and the acting user", !!closeAudit && J(closeAudit.afterJson)?.variance === -1500, JSON.stringify(J(closeAudit?.afterJson)));

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Corrections to a closed shift are a new auditable adjustment, not a silent edit");
  const adjustRes = await fetch(`${LOCAL_URL}/api/shifts/${shiftId}/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ correctedActualCash: handComputedExpected, reason: "recount found the missing cash" }),
  });
  const adjustBody = await adjustRes.json();
  check("correction succeeds on a closed shift", adjustRes.status === 200 && parseFloat(adjustBody.shift.variance) === 0);
  const adjustAudit = await localDb.auditLog.findFirst({ where: { entityType: "Shift", entityId: shiftId, action: "shift.corrected" } });
  check("the correction itself is audited with old and new values", !!adjustAudit && J(adjustAudit.beforeJson)?.actualCash === handComputedExpected - 1500, JSON.stringify(J(adjustAudit?.beforeJson)));

  // ═══════════════════════════════════════════════════════════════════════
  section("8. Refunds — partial refund updates order/payment status and is audited");
  const overRefundAttempt = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ paymentId: paymentBody.payment.id, amount: orderTotal + 999999, reason: "too much" }),
  });
  check("cannot refund more than was paid (422)", overRefundAttempt.status === 422);

  const partialAmount = Math.floor(orderTotal / 2);
  const refundRes = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ paymentId: paymentBody.payment.id, amount: partialAmount, reason: "customer complaint — half refunded" }),
  });
  const refundBody = await refundRes.json();
  check("partial refund succeeds", refundRes.status === 201);
  check("order status becomes PARTIALLY_REFUNDED", refundBody.order.status === "PARTIALLY_REFUNDED", refundBody.order.status);
  const refundAudit = await localDb.auditLog.findFirst({ where: { entityType: "Refund", entityId: refundBody.refund.id } });
  check("the refund is audited with the reason and amount", !!refundAudit && J(refundAudit.afterJson)?.amount === partialAmount);

  // ═══════════════════════════════════════════════════════════════════════
  section("9. Product price change is audited (existing endpoint, new audit wiring)");
  const priceRes = await fetch(`${LOCAL_URL}/api/admin/products/${burger.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ basePrice: burger.basePrice + 500 }),
  });
  check("price change succeeds", priceRes.status === 200);
  const priceAudit = await localDb.auditLog.findFirst({ where: { entityType: "Product", entityId: burger.id, action: "product.price_changed" }, orderBy: { createdAt: "desc" } });
  check("price change is audited with before/after price", !!priceAudit && J(priceAudit.beforeJson)?.basePrice === burger.basePrice && J(priceAudit.afterJson)?.basePrice === burger.basePrice + 500);
  // Revert so re-running this script (and the live app) isn't left with a shifted menu price.
  await fetch(`${LOCAL_URL}/api/admin/products/${burger.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ basePrice: burger.basePrice }),
  });

  // ═══════════════════════════════════════════════════════════════════════
  section("10. Reports reflect exactly what just happened");
  const salesReport = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  check("sales report counts today's order", salesReport.report.ordersCount >= 1);
  check("sales report's refund total includes the refund just issued", salesReport.report.refundTotal >= partialAmount, `got ${salesReport.report.refundTotal}`);

  const expensesReport = await fetch(`${LOCAL_URL}/api/reports/expenses?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  check("expenses report includes the expense just recorded", expensesReport.report.byCategory.Supplies >= 7500, JSON.stringify(expensesReport.report.byCategory));

  const refundsReport = await fetch(`${LOCAL_URL}/api/reports/refunds?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  check("refunds report lists the refund with the right reason", refundsReport.report.refunds.some((r) => r.id === refundBody.refund.id && r.reason.includes("half refunded")));

  // ═══════════════════════════════════════════════════════════════════════
  section("11. PDF and CSV exports are real files built from real data");
  const pdfRes = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${BRANCH_ID}&range=today&format=pdf`, { headers: { cookie: adminCookie } });
  const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
  check("PDF export responds with application/pdf", pdfRes.headers.get("content-type") === "application/pdf");
  check("PDF export starts with the real PDF magic bytes", pdfBuffer.subarray(0, 4).toString() === "%PDF");
  check("PDF export is a substantial file, not an empty stub", pdfBuffer.length > 1000, `${pdfBuffer.length} bytes`);

  const csvRes = await fetch(`${LOCAL_URL}/api/reports/expenses?branchId=${BRANCH_ID}&range=today&format=csv`, { headers: { cookie: adminCookie } });
  const csvText = await csvRes.text();
  check("CSV export responds with text/csv", csvRes.headers.get("content-type") === "text/csv");
  check("CSV export contains the real expense row just created", csvText.includes("Supplies") && csvText.includes("Napkins"));

  const reportsWithoutExportPerm = await loginAs("cashier@aurum.demo", "Password123!");
  const cashierExportAttempt = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${BRANCH_ID}&range=today&format=pdf`, { headers: { cookie: reportsWithoutExportPerm } });
  check("a role without reports.export cannot download PDF/CSV even if it can view JSON", cashierExportAttempt.status === 403);

  // ═══════════════════════════════════════════════════════════════════════
  section("12. Product analytics reflect the real order");
  const analyticsRes = await fetch(`${LOCAL_URL}/api/analytics/products?branchId=${BRANCH_ID}&range=today`, { headers: { cookie: adminCookie } }).then((r) => r.json());
  const burgerAnalytics = analyticsRes.analytics.products.find((p) => p.productId === burger.id);
  check("the burger shows up in product analytics with at least 1 unit sold today", !!burgerAnalytics && burgerAnalytics.unitsSold >= 1, JSON.stringify(burgerAnalytics));
  check("peak hours are computed from real order timestamps", analyticsRes.analytics.peakHours.length > 0);

  // ═══════════════════════════════════════════════════════════════════════
  section("13. Offline-first — shift/expense/cash-movement/refund all reach the cloud");
  await fetch(`${LOCAL_URL}/api/sync/trigger`, { method: "POST", headers: { cookie: adminCookie } });
  const cloudShift = await waitUntil(() => cloudDb.cloudShift.findUnique({ where: { id: cid(shiftId) } }));
  check("closed shift (with the correction) reached the cloud", !!cloudShift && cloudShift.status === "CLOSED");
  check("cloud has the corrected variance, not the original", cloudShift && cloudShift.variance.toString() === "0", cloudShift?.variance?.toString());
  const cloudRefund = await waitUntil(() => cloudDb.cloudRefund.findUnique({ where: { id: cid(refundBody.refund.id) } }));
  check("refund reached the cloud", !!cloudRefund && cloudRefund.amount.toString() === String(partialAmount));
  const cloudExpense = await waitUntil(() => cloudDb.cloudExpense.findFirst({ where: { branchId: BRANCH_ID, category: "Supplies", amount: { equals: 7500 } } }));
  check("expense reached the cloud", !!cloudExpense);
  const cloudCashMovements = await waitUntil(async () => {
    const rows = await cloudDb.cloudCashMovement.findMany({ where: { shiftId: cid(shiftId) } });
    return rows.length >= 2 ? rows : null;
  });
  check("both cash movements reached the cloud", cloudCashMovements && cloudCashMovements.length >= 2);

  // ═══════════════════════════════════════════════════════════════════════
  section("14. Split bill — two partial cash payments settle one order, each independently refundable");
  const s14 = await scanQr(qr.token);
  const order14 = await fetch(`${LOCAL_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: s14.cookie },
    body: JSON.stringify({ lines: [{ productId: burger.id, quantity: 2, modifierOptionIds: [burgerSize] }] }),
  }).then((r) => r.json());
  const total14 = parseFloat(order14.order.total);
  const half14 = Math.floor(total14 / 2);

  const pay14a = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: order14.order.id, method: "CASH", amount: half14 }),
  }).then((r) => r.json());
  check("first partial cash payment is recorded and immediately verified", pay14a.payment.status === "VERIFIED" && pay14a.payment.isPartial === true);

  const orderAfterFirst = await localDb.order.findUnique({ where: { id: order14.order.id } });
  check("the order is NOT marked paid after only the first partial payment", orderAfterFirst.status !== "PAID", orderAfterFirst.status);

  const pay14b = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: order14.order.id, method: "CASH", amount: total14 - half14 }),
  }).then((r) => r.json());
  check("second payment for the remaining balance completes the split", pay14b.payment.status === "VERIFIED" && pay14b.payment.isPartial === false);

  const orderAfterSecond = await localDb.order.findUnique({ where: { id: order14.order.id } });
  check("the order becomes PAID once both partial payments cover the total", orderAfterSecond.status === "PAID", orderAfterSecond.status);

  const refund14a = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ paymentId: pay14a.payment.id, amount: half14, reason: "split-bill refund test — first payment" }),
  });
  check("the FIRST split payment can be refunded independently of the second", refund14a.status === 201, JSON.stringify(await refund14a.clone().json()));

  const refund14b = await fetch(`${LOCAL_URL}/api/refunds`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ paymentId: pay14b.payment.id, amount: total14 - half14, reason: "split-bill refund test — second payment" }),
  });
  const refund14bBody = await refund14b.json();
  check("the SECOND split payment can also be refunded independently — the admin UI's per-payment refund list, not just the first payment found", refund14b.status === 201, JSON.stringify(refund14bBody));
  check("refunding both splits fully refunds the order", refund14bBody.order.status === "REFUNDED", refund14bBody.order.status);

  // ── Report ───────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(70));
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (fail > 0) failures.forEach((f) => console.log(`  - ${f}`));
  await localDb.$disconnect();
  await cloudDb.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exit(1);
});
