// Real, executed integration test for: guest self-service pickup/delivery ordering,
// offline/cloud sync for DeliveryOrder + LoyaltyTransaction, and the delayed-order
// checker. Run: node scripts/guest-ordering-test.mjs
// Requires: apps/web on :3100, apps/cloud on :4000 (CLOUD_SYNC_URL configured), both DBs up.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { io } from "socket.io-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const CLOUD_URL = "http://localhost:4000";
const BRANCH_ID = "cmug2a45d0004stemr504wzug";
// Every branch-scoped Cloud* projection's row id is `${branchId}:${localId}`, not the
// bare local id — see scripts/cloud-isolation-test.mjs for why.
const cid = (id) => `${BRANCH_ID}:${id}`;

const { PrismaClient: LocalPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const db = new LocalPrismaClient();

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
async function j(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function main() {
  console.log("Menu OS — Guest self-service pickup/delivery ordering test suite");
  console.log("=".repeat(70));

  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);

  const branch = await db.branch.findUniqueOrThrow({ where: { id: BRANCH_ID }, include: { brand: true } });
  const product = await db.product.findFirstOrThrow({
    where: { category: { menu: { brandId: branch.brandId } }, modifierGroups: { none: { group: { isRequired: true } } } },
  });

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Public delivery zone fees are real numbers, not Decimal-as-string");
  const zone = await db.deliveryZone.upsert({
    where: { id: "guest-test-zone" },
    create: { id: "guest-test-zone", branchId: BRANCH_ID, name: "Guest Test Zone", feeAmount: 2500, estimatedMinutes: 20 },
    update: { feeAmount: 2500 },
  });
  const zonesRes = await fetch(`${LOCAL_URL}/api/delivery/zones/public?branchId=${BRANCH_ID}`);
  const zonesJson = await j(zonesRes);
  const publicZone = zonesJson.zones.find((z) => z.id === zone.id);
  check("feeAmount is typeof number (regression: was serialized as a string)", typeof publicZone?.feeAmount === "number", typeof publicZone?.feeAmount);
  check("feeAmount value is correct", publicZone?.feeAmount === 2500, publicZone?.feeAmount);

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Guest pickup order — no QR/table session required");
  const pickupRes = await fetch(`${LOCAL_URL}/api/orders/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      branchId: BRANCH_ID,
      type: "PICKUP",
      customerName: "Guest Pickup Tester",
      phone: "07701112222",
      lines: [{ productId: product.id, quantity: 1, modifierOptionIds: [] }],
    }),
  });
  const guestCookie = pickupRes.headers.getSetCookie().find((c) => c.startsWith("mos_guest_session"))?.split(";")[0];
  const pickupJson = await j(pickupRes);
  check("guest can place a pickup order with no prior session", pickupRes.status === 201, JSON.stringify(pickupJson));
  check("guest session cookie is issued", !!guestCookie);
  check("order has no tableSessionId", !pickupJson.order?.tableSessionId);
  check("order type is PICKUP", pickupJson.order?.type === "PICKUP");

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Guest delivery order — zone fee lands on the real charged total");
  const deliveryRes = await fetch(`${LOCAL_URL}/api/orders/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: guestCookie },
    body: JSON.stringify({
      branchId: BRANCH_ID,
      type: "DELIVERY",
      customerName: "Guest Delivery Tester",
      phone: "07701112222",
      lines: [{ productId: product.id, quantity: 2, modifierOptionIds: [] }],
      delivery: { address: "42 Test Ave", zoneId: zone.id },
    }),
  });
  const deliveryJson = await j(deliveryRes);
  check("guest can place a delivery order reusing the same guest session", deliveryRes.status === 201, JSON.stringify(deliveryJson));
  const expectedTotal = product.basePrice.toNumber() * 2 + 2500;
  check("delivery order total = items + zone fee", Math.abs(parseFloat(deliveryJson.order.total) - expectedTotal) < 0.01, `${deliveryJson.order.total} vs ${expectedTotal}`);

  const deliveryOrderRow = await db.deliveryOrder.findUnique({ where: { orderId: deliveryJson.order.id } });
  check("DeliveryOrder row created with the right zone", deliveryOrderRow?.zoneId === zone.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("4. My orders — scoped to this guest only, not other guests or branches");
  const mineRes = await fetch(`${LOCAL_URL}/api/orders/guest/mine`, { headers: { cookie: guestCookie } });
  const mineJson = await j(mineRes);
  check("guest sees both of their own orders", mineJson.orders?.length === 2, mineJson.orders?.length);
  check("no active guest session returns 401, not an empty list", (await fetch(`${LOCAL_URL}/api/orders/guest/mine`)).status === 401);

  const secondPickupRes = await fetch(`${LOCAL_URL}/api/orders/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      branchId: BRANCH_ID,
      type: "PICKUP",
      customerName: "Second Guest",
      phone: "07709999999",
      lines: [{ productId: product.id, quantity: 1, modifierOptionIds: [] }],
    }),
  });
  const secondGuestCookie = secondPickupRes.headers.getSetCookie().find((c) => c.startsWith("mos_guest_session"))?.split(";")[0];
  const secondMineRes = await fetch(`${LOCAL_URL}/api/orders/guest/mine`, { headers: { cookie: secondGuestCookie } });
  const secondMineJson = await j(secondMineRes);
  check("a second guest sees only their own order, not the first guest's", secondMineJson.orders?.length === 1 && secondMineJson.orders[0].id !== pickupJson.order.id);

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Realtime — staff advancing status pushes to the guest's own customer-session room");
  const socket = io(LOCAL_URL, { path: "/socket.io" });
  await new Promise((resolve, reject) => {
    socket.on("connect", resolve);
    socket.on("connect_error", reject);
    setTimeout(() => reject(new Error("socket connect timeout")), 5000);
  });
  socket.emit("join", `customer-session:${pickupJson.order.customerSessionId}`);
  await new Promise((r) => setTimeout(r, 300));

  const statusEventPromise = new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 5000);
    socket.on("event", (event) => {
      if (event.type === "order.status_changed" && event.orderId === pickupJson.order.id) {
        clearTimeout(timer);
        resolve(event);
      }
    });
  });
  const advanceRes = await fetch(`${LOCAL_URL}/api/orders/${pickupJson.order.id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    // Orders are received automatically (CONFIRMED on creation), so the next thing staff
    // do is move it along — here to PREPARING.
    body: JSON.stringify({ status: "PREPARING" }),
  });
  check("staff advances the guest's pickup order", advanceRes.status === 200);
  const statusEvent = await statusEventPromise;
  check("guest's own socket room receives order.status_changed", !!statusEvent, "no event within 5s");
  socket.close();

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Offline sync — DeliveryOrder reaches the cloud");
  await new Promise((r) => setTimeout(r, 6500)); // sync engine polls every 5s
  const cloudDeliveryRes = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/delivery-orders`);
  if (cloudDeliveryRes.ok) {
    const cloudDeliveryJson = await cloudDeliveryRes.json();
    const synced = cloudDeliveryJson.deliveryOrders.find((d) => d.id === cid(deliveryOrderRow.id));
    check("the delivery order synced to the cloud", !!synced, "not found in cloud yet — check CLOUD_SYNC_URL is configured");
    if (synced) check("cloud delivery order carries the right fee", parseFloat(synced.deliveryFee) === 2500, synced.deliveryFee);
  } else {
    check("cloud reachable for delivery-order check", false, `cloud responded ${cloudDeliveryRes.status} — is apps/cloud running?`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Loyalty (Customer / LoyaltyTransaction) is not part of this build's schema; the
  // section only runs where those models exist.
  if (db.customer && db.loyaltyTransaction) {
  section("7. Offline sync — LoyaltyTransaction reaches the cloud");
  const uniquePhone = `0770${Math.floor(1000000 + Math.random() * 8999999)}`;
  const loyaltyCustomer = await db.customer.create({ data: { tenantId: branch.brand.tenantId, name: "Cloud Loyalty Test", phone: uniquePhone } });
  const loyaltyOrder = await db.order.create({
    data: {
      branchId: BRANCH_ID,
      customerId: loyaltyCustomer.id,
      type: "PICKUP",
      status: "CREATED",
      subtotal: 10000,
      total: 10000,
      items: { create: { productId: product.id, nameSnapshot: product.name, unitPriceSnapshot: 10000, quantity: 1, lineTotal: 10000 } },
    },
  });
  const loyaltyPayRes = await fetch(`${LOCAL_URL}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ orderId: loyaltyOrder.id, method: "CASH", amount: 10000 }),
  });
  check("cash payment on the loyalty test order verifies", loyaltyPayRes.status === 201);
  const loyaltyTx = await db.loyaltyTransaction.findFirst({ where: { orderId: loyaltyOrder.id } });
  check("points were earned locally", loyaltyTx?.points === 10);

  await new Promise((r) => setTimeout(r, 6500));
  const cloudLoyaltyRes = await fetch(`${CLOUD_URL}/brands/${branch.brandId}/loyalty-transactions`);
  if (cloudLoyaltyRes.ok) {
    const cloudLoyaltyJson = await cloudLoyaltyRes.json();
    const syncedTx = cloudLoyaltyJson.transactions.find((t) => t.id === loyaltyTx?.id);
    check("the loyalty transaction synced to the cloud", !!syncedTx, "not found in cloud yet");
    if (syncedTx) check("cloud loyalty transaction carries the right points and balance", syncedTx.points === 10 && syncedTx.newBalance >= 10);
  } else {
    check("cloud reachable for loyalty-transaction check", false, `cloud responded ${cloudLoyaltyRes.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  } else {
    console.log("  (skipped: this build has no loyalty models)");
  }

  section("8. Delayed-order checker — flags a stuck order exactly once");
  const staleOrder = await db.order.create({
    data: {
      branchId: BRANCH_ID,
      type: "PICKUP",
      status: "CREATED",
      subtotal: 5000,
      total: 5000,
      createdAt: new Date(Date.now() - 25 * 60_000),
      items: { create: { productId: product.id, nameSnapshot: product.name, unitPriceSnapshot: 5000, quantity: 1, lineTotal: 5000 } },
    },
  });
  const checkRes1 = await fetch(`${LOCAL_URL}/api/orders/check-delayed`, { method: "POST", headers: { cookie: adminCookie } });
  check("staff can trigger the delayed-order check on demand", checkRes1.status === 200);
  const notif = await db.notification.findFirst({ where: { type: "DELAYED_ORDER", data: { contains: `"orderId":"${staleOrder.id}"` } } });
  check("a DELAYED_ORDER notification is written for a stuck order", !!notif);
  await fetch(`${LOCAL_URL}/api/orders/check-delayed`, { method: "POST", headers: { cookie: adminCookie } });
  const notifCountAfter = await db.notification.count({ where: { type: "DELAYED_ORDER", data: { contains: `"orderId":"${staleOrder.id}"` } } });
  check("running the checker again does not duplicate the notification", notifCountAfter === 1, notifCountAfter);
  check("a non-staff request is rejected", (await fetch(`${LOCAL_URL}/api/orders/check-delayed`, { method: "POST" })).status === 403);

  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(70));
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log("Failed checks:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
  await db.$disconnect();
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exitCode = 1;
});
