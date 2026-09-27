// Real, executed integration test for the offline-first / sync architecture.
// Talks to the ACTUAL running local app (localhost:3100) and cloud service
// (localhost:4000), reads/writes the ACTUAL local and cloud Postgres databases,
// and genuinely stops/starts the cloud process to simulate internet loss.
//
// Run: node scripts/offline-sync-test.mjs
import { execSync, spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const LOCAL_URL = "http://localhost:3100";
const CLOUD_URL = "http://localhost:4000";
const CLOUD_PORT = 4000;
const BRANCH_ID = "cmug2a45d0004stemr504wzug";
const ADMIN_EMAIL = "admin@aurum.demo";
const ADMIN_PASSWORD = "Password123!";
// Every branch-scoped Cloud* projection's row id is `${branchId}:${localId}`, not the
// bare local id — a fix for a real cross-branch id-collision risk (see
// scripts/cloud-isolation-test.mjs). Every cloud-side lookup by a local id needs this.
const cid = (id) => `${BRANCH_ID}:${id}`;

const { PrismaClient: LocalPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const { PrismaClient: CloudPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/cloud-db/generated/client/index.js")));
const localDb = new LocalPrismaClient();
const cloudDb = new CloudPrismaClient();

let pass = 0;
let fail = 0;
const failures = [];
const testOrderIds = [];

// Polls instead of a fixed sleep — the background sync engine (running its own
// independent 5s timer the whole time this test runs) can race an explicit
// triggerSync() call, so "drained" is a condition to wait for, not a fixed delay.
// conditionFn returns null/undefined for "not ready yet", anything else (including
// 0, false) counts as done — falsy-but-defined results like a drained count of 0
// must not be mistaken for "keep waiting".
async function waitUntil(conditionFn, { timeoutMs = 10000, intervalMs = 300 } = {}) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeoutMs) {
    last = await conditionFn();
    if (last !== null && last !== undefined) return last;
    await sleep(intervalMs);
  }
  return last;
}

function check(label, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  \x1b[31m✗\x1b[0m ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function section(title) {
  console.log(`\n\x1b[1m${title}\x1b[0m`);
}

// ── Process control (real "internet disconnected" simulation) ──────────────

function isPortListening(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: "utf8" });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

function killCloud() {
  try {
    const out = execSync(`netstat -ano | findstr :${CLOUD_PORT} | findstr LISTENING`, { encoding: "utf8" });
    const pids = new Set(out.trim().split("\n").map((l) => l.trim().split(/\s+/).pop()));
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

let cloudProc = null;
function startCloud() {
  cloudProc = spawn("node", ["server.js"], {
    cwd: path.join(ROOT, "apps/cloud"),
    stdio: "ignore",
    detached: true,
  });
  cloudProc.unref();
}

async function waitForCloudUp(timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${CLOUD_URL}/health`);
      if (res.ok) return true;
    } catch {
      /* keep waiting */
    }
    await sleep(300);
  }
  return false;
}

async function waitForCloudDown(timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(`${CLOUD_URL}/health`, { signal: AbortSignal.timeout(500) });
    } catch {
      return true;
    }
    await sleep(200);
  }
  return false;
}

// ── Local app helpers ────────────────────────────────────────────────────

async function scanQr(token) {
  const res = await fetch(`${LOCAL_URL}/r/${token}`, { redirect: "manual" });
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith("mos_session")).split(";")[0];
  const location = res.headers.get("location");
  const tableSessionId = location.split("/t/")[1];
  return { cookie, tableSessionId };
}

async function getMenu() {
  const res = await fetch(`${LOCAL_URL}/api/menu?branchId=${BRANCH_ID}`);
  return res.json();
}

async function placeOrder(cookie, productId, modifierOptionIds = []) {
  const res = await fetch(`${LOCAL_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ lines: [{ productId, quantity: 1, modifierOptionIds }] }),
  });
  return { status: res.status, body: await res.json() };
}

function firstCookies(res) {
  return res.headers.getSetCookie().map((c) => c.split(";")[0]);
}

let adminCookie = null;
async function adminLogin() {
  const csrfRes = await fetch(`${LOCAL_URL}/api/auth/csrf`);
  const csrfCookie = firstCookies(csrfRes).find((c) => c.startsWith("next-auth.csrf-token"));
  const { csrfToken } = await csrfRes.json();

  const loginRes = await fetch(`${LOCAL_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", cookie: csrfCookie },
    body: new URLSearchParams({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, csrfToken, json: "true" }),
    redirect: "manual",
  });
  const sessionCookie = firstCookies(loginRes).find((c) => c.startsWith("next-auth.session-token"));
  adminCookie = `${csrfCookie}; ${sessionCookie}`;
}

async function updateKitchenOrder(kitchenOrderId, status) {
  return fetch(`${LOCAL_URL}/api/kitchen/orders/${kitchenOrderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ status }),
  });
}

async function setAvailability(productId, status, occurredAt) {
  return fetch(`${LOCAL_URL}/api/availability/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ branchId: BRANCH_ID, status, occurredAt }),
  });
}

async function createWaiterRequest(cookie, type) {
  return fetch(`${LOCAL_URL}/api/waiter-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ type }),
  });
}

async function triggerSync() {
  const res = await fetch(`${LOCAL_URL}/api/sync/trigger`, { method: "POST", headers: { cookie: adminCookie } });
  return res.json();
}

async function getQrToken(label) {
  const qr = await localDb.qRCode.findFirst({ where: { branchId: BRANCH_ID, label: `Table ${label}` } });
  return qr.token;
}

async function main() {
  console.log("Menu OS — Offline-First Architecture: real, executed test suite");
  console.log("=".repeat(70));

  // ── Preconditions ──────────────────────────────────────────────────────
  section("Preconditions");
  const localUp = await fetch(`${LOCAL_URL}/`).then((r) => r.ok).catch(() => false);
  check("local app is running", localUp);
  if (!isPortListening(CLOUD_PORT)) startCloud();
  check("cloud service is reachable", await waitForCloudUp());
  await adminLogin();
  check("admin login succeeds", !!adminCookie);

  const menu = await getMenu();
  const latte = menu.menus[0].categories.flatMap((c) => c.products).find((p) => p.name === "Spanish Latte");
  const regularSize = latte.modifierGroups.find((g) => g.name === "Size").options[0].id;
  const burger = menu.menus[0].categories.flatMap((c) => c.products).find((p) => p.name.includes("Burger"));
  const burgerSize = burger.modifierGroups.find((g) => g.name === "Size").options[0].id;

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Internet available — order syncs to cloud");
  const s1 = await scanQr(await getQrToken("6"));
  const o1 = await placeOrder(s1.cookie, latte.id, [regularSize]);
  check("order placed locally", o1.status === 201, JSON.stringify(o1.body));
  testOrderIds.push(o1.body.order.id);
  await triggerSync();
  const cloudO1 = await waitUntil(() => cloudDb.cloudOrder.findUnique({ where: { id: cid(o1.body.order.id) } }));
  check("order appears in cloud DB after sync", !!cloudO1);
  check("cloud order total matches local", cloudO1 && cloudO1.total.toString() === o1.body.order.total.toString());

  // ═══════════════════════════════════════════════════════════════════════
  section("2 & 3. Internet disconnected — order still creatable, queues locally");
  killCloud();
  check("cloud is actually down", await waitForCloudDown());

  const s2 = await scanQr(await getQrToken("7"));
  const before = Date.now();
  const o2 = await placeOrder(s2.cookie, latte.id, [regularSize]);
  const elapsedMs = Date.now() - before;
  check("order still succeeds with cloud unreachable", o2.status === 201, JSON.stringify(o2.body));
  testOrderIds.push(o2.body.order.id);
  check("order creation did not hang waiting on the network", elapsedMs < 2000, `took ${elapsedMs}ms`);

  const syncWhileDown = await triggerSync();
  const anyFailedReason = syncWhileDown.cycles.some((c) => c.reason && c.reason !== "sync not configured");
  check("sync attempt fails fast while offline (doesn't throw)", anyFailedReason, JSON.stringify(syncWhileDown));

  const outboxForO2 = await localDb.outboxEvent.findMany({ where: { aggregateId: o2.body.order.id } });
  check("order's outbox event exists and is queued (not lost, not synced)", outboxForO2.length === 1 && outboxForO2[0].syncStatus !== "SYNCED", JSON.stringify(outboxForO2.map((e) => e.syncStatus)));

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Kitchen processing while offline — status cascades locally, queues for sync");
  const kitchenOrder = await localDb.kitchenOrder.findFirst({ where: { orderId: o2.body.order.id } });
  await fetch(`${LOCAL_URL}/api/orders/${o2.body.order.id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ status: "CONFIRMED" }),
  });
  const kdsRes = await updateKitchenOrder(kitchenOrder.id, "PREPARING");
  check("kitchen ticket advances while offline", kdsRes.status === 200);
  const orderAfterKitchen = await localDb.order.findUnique({ where: { id: o2.body.order.id } });
  check("order status cascaded to PREPARING locally, offline", orderAfterKitchen.status === "PREPARING");
  const statusEvents = await localDb.outboxEvent.findMany({ where: { aggregateId: o2.body.order.id, eventType: "order.status_changed" } });
  check("status-change outbox event was queued while offline", statusEvents.some((e) => e.syncStatus !== "SYNCED"));

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Concurrent orders on the same table — no corruption, no lost writes");
  const s5 = await scanQr(await getQrToken("8"));
  const concurrentCount = 5;
  const results = await Promise.all(Array.from({ length: concurrentCount }, () => placeOrder(s5.cookie, burger.id, [burgerSize])));
  check("all concurrent orders on one table succeeded", results.every((r) => r.status === 201), JSON.stringify(results.map((r) => r.status)));
  const ids = results.map((r) => r.body.order.id);
  testOrderIds.push(...ids);
  check("all concurrent orders got distinct ids", new Set(ids).size === concurrentCount);
  const kitchenTicketsForTable = await localDb.kitchenOrder.count({ where: { orderId: { in: ids } } });
  check("each concurrent order got its own kitchen ticket", kitchenTicketsForTable === concurrentCount, `got ${kitchenTicketsForTable}`);
  const outboxForConcurrent = await localDb.outboxEvent.count({ where: { aggregateId: { in: ids }, eventType: "order.created" } });
  check("exactly one outbox event per concurrent order (no dupes, none dropped)", outboxForConcurrent === concurrentCount, `got ${outboxForConcurrent}`);

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Internet restored");
  startCloud();
  check("cloud comes back up", await waitForCloudUp());

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Synchronization — backlog drains, local/cloud reach consistency");
  const syncResult = await triggerSync();
  // The background engine's own independent 5s timer can also be mid-cycle right
  // now (it never stopped running); poll instead of asserting on a single snapshot.
  const remainingPending = await waitUntil(async () => {
    const n = await localDb.outboxEvent.count({ where: { branchId: BRANCH_ID, syncStatus: { in: ["PENDING", "SYNCING", "FAILED"] } } });
    return n === 0 ? 0 : null;
  });
  check("outbox fully drains after reconnecting", remainingPending === 0, `cycles=${JSON.stringify(syncResult.cycles)}`);
  const cloudO2 = await waitUntil(() => cloudDb.cloudOrder.findUnique({ where: { id: cid(o2.body.order.id) } }));
  check("the order created while offline is now in the cloud", !!cloudO2);
  check("its status reflects the offline kitchen update (PREPARING)", cloudO2 && cloudO2.status === "PREPARING");
  const cloudConcurrentCount = await waitUntil(async () => {
    const n = await cloudDb.cloudOrder.count({ where: { id: { in: ids.map(cid) } } });
    return n === concurrentCount ? n : null;
  });
  check("all 5 concurrent orders reached the cloud, none duplicated/lost", cloudConcurrentCount === concurrentCount, `cloud has ${cloudConcurrentCount}`);

  // ═══════════════════════════════════════════════════════════════════════
  section("8. Duplicate sync attempt — re-sending an applied event is a safe no-op");
  const appliedEvent = await localDb.outboxEvent.findFirst({ where: { aggregateId: o1.body.order.id, eventType: "order.created" } });
  const beforeCount = await cloudDb.syncedEvent.count({ where: { id: appliedEvent.id } });
  const beforeOrderCount = await cloudDb.cloudOrder.count({ where: { id: cid(o1.body.order.id) } });
  const dupRes = await fetch(`${CLOUD_URL}/sync/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      branchId: BRANCH_ID,
      apiKey: process.env.CLOUD_API_KEY_FOR_TEST,
      events: [{ id: appliedEvent.id, aggregateType: "Order", aggregateId: o1.body.order.id, eventType: "order.created", payload: appliedEvent.payload, occurredAt: appliedEvent.occurredAt.toISOString() }],
    }),
  });
  const dupBody = await dupRes.json();
  const afterCount = await cloudDb.syncedEvent.count({ where: { id: appliedEvent.id } });
  const afterOrderCount = await cloudDb.cloudOrder.count({ where: { id: cid(o1.body.order.id) } });
  check("cloud accepts the re-sent batch without error", dupRes.ok);
  check("re-sent event is acknowledged (idempotent ack)", dupBody.acknowledged.includes(appliedEvent.id));
  check("no duplicate SyncedEvent row was created", beforeCount === 1 && afterCount === 1, `before=${beforeCount} after=${afterCount}`);
  check("no duplicate CloudOrder row was created", beforeOrderCount === 1 && afterOrderCount === 1, `before=${beforeOrderCount} after=${afterOrderCount}`);

  // ═══════════════════════════════════════════════════════════════════════
  section("9. Interrupted sync — batch dies mid-way, retry is exactly-once");
  const s9 = await scanQr(await getQrToken("9"));
  const o9a = await placeOrder(s9.cookie, latte.id, [regularSize]);
  const o9b = await placeOrder(s9.cookie, burger.id, [burgerSize]);
  testOrderIds.push(o9a.body.order.id, o9b.body.order.id);
  const wr9 = await createWaiterRequest(s9.cookie, "WATER");
  const wr9Body = await wr9.json();

  const pendingEvents = await localDb.outboxEvent.findMany({
    where: { aggregateId: { in: [o9a.body.order.id, o9b.body.order.id, wr9Body.request.id] } },
    orderBy: { createdAt: "asc" },
  });
  check("3 fresh events staged for the interrupted-sync test", pendingEvents.length === 3, `got ${pendingEvents.length}`);

  const batchPayload = {
    branchId: BRANCH_ID,
    apiKey: process.env.CLOUD_API_KEY_FOR_TEST,
    events: pendingEvents.map((e) => ({ id: e.id, aggregateType: e.aggregateType, aggregateId: e.aggregateId, eventType: e.eventType, payload: e.payload, occurredAt: e.occurredAt.toISOString() })),
    simulateCrashAfter: 1, // cloud applies event #1, commits it, then drops the connection
  };

  let crashedAsExpected = false;
  let crashDetail = "";
  try {
    const r = await fetch(`${CLOUD_URL}/sync/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(batchPayload) });
    crashDetail = `responded ${r.status} ${await r.text()}`;
  } catch {
    crashedAsExpected = true;
  }
  check("connection is actually dropped mid-batch (simulated crash)", crashedAsExpected, crashDetail);

  const appliedSoFar = await cloudDb.syncedEvent.count({ where: { id: { in: pendingEvents.map((e) => e.id) } } });
  check("exactly 1 of 3 events committed before the simulated crash", appliedSoFar === 1, `got ${appliedSoFar}`);

  // Retry the FULL batch (this is what the real sync engine does on a network error).
  const retryPayload = { ...batchPayload };
  delete retryPayload.simulateCrashAfter;
  const retryRes = await fetch(`${CLOUD_URL}/sync/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(retryPayload) });
  const retryBody = await retryRes.json();
  check("retry of the full batch succeeds", retryRes.ok, `${retryRes.status} ${JSON.stringify(retryBody)}`);
  check("retry acknowledges all 3 events", retryBody.acknowledged.length === 3);

  const finalApplied = await cloudDb.syncedEvent.count({ where: { id: { in: pendingEvents.map((e) => e.id) } } });
  check("exactly 3 SyncedEvent rows exist after retry — no duplicate from the pre-crash commit", finalApplied === 3, `got ${finalApplied}`);
  const finalOrderRows = await cloudDb.cloudOrder.count({ where: { id: { in: [cid(o9a.body.order.id), cid(o9b.body.order.id)] } } });
  check("exactly one CloudOrder row per order — the pre-crash commit didn't duplicate", finalOrderRows === 2, `got ${finalOrderRows}`);

  // ═══════════════════════════════════════════════════════════════════════
  section("10. Conflict scenario — last-write-wins on ProductAvailability by occurredAt");
  const kunafa = menu.menus[0].categories.flatMap((c) => c.products).find((p) => p.name === "Kunafa");
  const newer = new Date();
  const older = new Date(newer.getTime() - 60_000);
  // Written in this order: the NEWER state first, the STALE (older) state second —
  // simulating a delayed/retried older event arriving after a fresher one.
  await setAvailability(kunafa.id, "SOLD_OUT", newer.toISOString());
  await setAvailability(kunafa.id, "AVAILABLE", older.toISOString());
  await triggerSync();
  const cloudAvailability = await waitUntil(async () => {
    const r = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/availability/${kunafa.id}`).then((res) => res.json());
    return r.row ? r : null;
  });
  check(
    "cloud keeps the NEWER state (SOLD_OUT) despite the older-timestamped event arriving second",
    cloudAvailability.row && cloudAvailability.row.status === "SOLD_OUT",
    JSON.stringify(cloudAvailability.row)
  );

  // ═══════════════════════════════════════════════════════════════════════
  section("11. Final consistency between local and cloud");
  // Scenario 9 talked to the cloud directly (bypassing the local engine) to control
  // fault injection precisely, so those 3 events are still PENDING locally even
  // though the cloud already has them. One more real trigger reconciles that —
  // the cloud's idempotent "already_applied" ack still counts as acknowledged.
  await triggerSync();
  const finalPending = await waitUntil(async () => {
    const n = await localDb.outboxEvent.count({ where: { branchId: BRANCH_ID, syncStatus: { in: ["PENDING", "SYNCING", "FAILED"] } } });
    return n === 0 ? 0 : null;
  });
  check("outbox is fully drained at the end of the run", finalPending === 0);

  // Compare exactly the orders this test created, by id — not raw branch totals,
  // which also include pre-existing seed/demo data from before the outbox existed
  // and legitimately never synced (there was nothing to sync it with).
  const cloudTestOrders = await waitUntil(async () => {
    const rows = await cloudDb.cloudOrder.findMany({ where: { id: { in: testOrderIds.map(cid) } } });
    return rows.length === testOrderIds.length ? rows : null;
  });
  check(
    "every order this test created reached the cloud exactly once",
    cloudTestOrders && cloudTestOrders.length === testOrderIds.length,
    `expected ${testOrderIds.length}, cloud has ${cloudTestOrders?.length ?? 0}`
  );
  const localTestOrders = await localDb.order.findMany({ where: { id: { in: testOrderIds } } });
  const totalsMatch = localTestOrders.every((lo) => {
    const co = cloudTestOrders?.find((c) => c.id === cid(lo.id));
    return co && co.total.toString() === lo.total.toString() && co.status === lo.status;
  });
  check("every synced order's status and total match between local and cloud", totalsMatch);

  const cloudSummary = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/summary`).then((r) => r.json());
  console.log(`  (this test's orders: ${testOrderIds.length}, cloud total orders for branch: ${cloudSummary.orderCount}, cloud revenue: ${cloudSummary.revenue})`);

  // ── Report ───────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(70));
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log("Failed checks:");
    failures.forEach((f) => console.log(`  - ${f}`));
  }
  await localDb.$disconnect();
  await cloudDb.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exit(1);
});
