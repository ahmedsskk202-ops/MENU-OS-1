// Real, executed integration test proving the CLOUD service itself enforces branch
// isolation for Reservation sync — using two real, independently-credentialed
// branches, not just two local rows. This is the piece a single local app instance
// can't exercise on its own (one instance = one CLOUD_BRANCH_ID by design; see
// docs/OFFLINE_ARCHITECTURE.md) — a real multi-branch deployment is N separate local
// instances, each with its own branch id + API key, all pushing to the SAME cloud
// service, which must never let one branch's push affect another's data.
// Run: node scripts/cloud-isolation-test.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomBytes, createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLOUD_URL = "http://localhost:4000";
const LOCAL_URL = "http://localhost:3100";
const BRANCH_A_ID = "cmug2a45d0004stemr504wzug"; // Aurum · Karrada (seeded, already has real cloud creds)
const BRANCH_A_API_KEY = process.env.CLOUD_API_KEY_FOR_TEST; // this machine's cloud credential for branch A

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

const { PrismaClient: LocalPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const { PrismaClient: CloudPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/cloud-db/generated/client/index.js")));
const localDb = new LocalPrismaClient();
const cloudDb = new CloudPrismaClient();

function hashKey(key) {
  return createHash("sha256").update(key).digest("hex");
}

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
async function j(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function main() {
  console.log("Menu OS — Cloud-side branch isolation test suite (2 real branches)");
  console.log("=".repeat(70));

  const branchA = await localDb.branch.findUniqueOrThrow({ where: { id: BRANCH_A_ID } });

  // ── A second real local branch, with its OWN cloud credential ───────────
  const branchB = await localDb.branch.upsert({
    where: { brandId_slug: { brandId: branchA.brandId, slug: "isolation-test-branch" } },
    create: { brandId: branchA.brandId, slug: "isolation-test-branch", name: "Isolation Test Branch", city: "Baghdad" },
    update: {},
  });
  const brand = await localDb.brand.findUniqueOrThrow({ where: { id: branchA.brandId } });
  const branchBApiKey = `mos_${randomBytes(24).toString("hex")}`;
  await cloudDb.cloudBranch.upsert({
    where: { id: branchB.id },
    create: { id: branchB.id, tenantId: brand.tenantId, name: branchB.name, brandName: brand.name, apiKeyHash: hashKey(branchBApiKey) },
    update: { apiKeyHash: hashKey(branchBApiKey) },
  });

  // Clean slate for this run.
  await cloudDb.cloudReservation.deleteMany({ where: { branchId: { in: [BRANCH_A_ID, branchB.id] } } });

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Two branches independently push a Reservation event with the SAME local id");
  // Deliberately colliding aggregateId — proves the cloud scopes by the AUTHENTICATED
  // branch, never by anything in the payload; two different branches legitimately
  // reusing cuid-space (or a replay attempt) must never merge into one row.
  const sharedLocalId = `shared-${randomBytes(8).toString("hex")}`;
  const reservationAId = `${sharedLocalId}-evt`;
  const reservationBId = `${sharedLocalId}-evt`; // intentionally identical

  const pushA = await fetch(`${CLOUD_URL}/sync/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      branchId: BRANCH_A_ID,
      apiKey: BRANCH_A_API_KEY,
      events: [
        {
          id: `${sharedLocalId}-outbox-a`,
          aggregateType: "Reservation",
          aggregateId: reservationAId,
          eventType: "reservation.created",
          payload: JSON.stringify({ tableId: null, guestName: "Branch A Guest", guestPhone: "07700000001", partySize: 2, reservedFor: new Date(Date.now() + 86400000).toISOString(), durationMinutes: 90, status: "PENDING" }),
          occurredAt: new Date().toISOString(),
        },
      ],
    }),
  });
  check("branch A's push is accepted with its own credentials", pushA.status === 200, pushA.status);

  const pushB = await fetch(`${CLOUD_URL}/sync/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      branchId: branchB.id,
      apiKey: branchBApiKey,
      events: [
        {
          id: `${sharedLocalId}-outbox-b`,
          aggregateType: "Reservation",
          aggregateId: reservationBId, // same aggregateId as branch A's event, different branch
          eventType: "reservation.created",
          payload: JSON.stringify({ tableId: null, guestName: "Branch B Guest", guestPhone: "07700000002", partySize: 4, reservedFor: new Date(Date.now() + 86400000).toISOString(), durationMinutes: 60, status: "PENDING" }),
          occurredAt: new Date().toISOString(),
        },
      ],
    }),
  });
  check("branch B's push is accepted with its own (different) credentials", pushB.status === 200, pushB.status);

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Each branch's cloud reservation list shows ONLY its own data");
  const listA = await j(await fetch(`${CLOUD_URL}/branches/${BRANCH_A_ID}/reservations`));
  const listB = await j(await fetch(`${CLOUD_URL}/branches/${branchB.id}/reservations`));

  const aHasOwn = listA.reservations.some((r) => r.guestName === "Branch A Guest");
  const aHasForeign = listA.reservations.some((r) => r.guestName === "Branch B Guest");
  check("branch A's list includes branch A's reservation", aHasOwn);
  check("branch A's list does NOT include branch B's reservation", !aHasForeign);

  const bHasOwn = listB.reservations.some((r) => r.guestName === "Branch B Guest");
  const bHasForeign = listB.reservations.some((r) => r.guestName === "Branch A Guest");
  check("branch B's list includes branch B's reservation", bHasOwn);
  check("branch B's list does NOT include branch A's reservation", !bHasForeign);

  // ═══════════════════════════════════════════════════════════════════════
  section("3. The colliding aggregateId produced TWO separate rows, not one overwritten by the other");
  const rowA = await cloudDb.cloudReservation.findFirst({ where: { branchId: BRANCH_A_ID, guestName: "Branch A Guest" } });
  const rowB = await cloudDb.cloudReservation.findFirst({ where: { branchId: branchB.id, guestName: "Branch B Guest" } });
  check("branch A's row exists and is tagged with branch A's id", rowA?.branchId === BRANCH_A_ID);
  check("branch B's row exists and is tagged with branch B's id (not overwritten by A's push)", rowB?.branchId === branchB.id);
  check("the two rows are genuinely distinct despite the identical local aggregateId", rowA?.id !== rowB?.id || rowA === undefined);

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Credential isolation — a branch's id with the WRONG api key is rejected");
  const wrongKeyRes = await fetch(`${CLOUD_URL}/sync/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branchId: branchB.id, apiKey: BRANCH_A_API_KEY, events: [] }), // branch A's key used to claim to be branch B
  });
  check("branch B's id with branch A's api key is rejected (401), not silently accepted", wrongKeyRes.status === 401, wrongKeyRes.status);

  const noKeyRes = await fetch(`${CLOUD_URL}/sync/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ branchId: BRANCH_A_ID, events: [] }), // no apiKey at all
  });
  check("no api key at all is rejected (401)", noKeyRes.status === 401, noKeyRes.status);

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Regression — branch A's normal (real) sync engine still reaches the cloud correctly");
  const reservedFor = new Date(Date.now() + 2 * 86400000).toISOString();
  const localReservation = await localDb.reservation.create({
    data: { branchId: BRANCH_A_ID, guestName: "Real Sync Regression Guest", guestPhone: "07700000003", partySize: 2, reservedFor: new Date(reservedFor), durationMinutes: 90 },
  });
  await localDb.outboxEvent.create({
    data: {
      branchId: BRANCH_A_ID,
      aggregateType: "Reservation",
      aggregateId: localReservation.id,
      eventType: "reservation.created",
      payload: JSON.stringify({ tableId: null, guestName: localReservation.guestName, guestPhone: localReservation.guestPhone, partySize: localReservation.partySize, reservedFor, durationMinutes: 90, status: "PENDING" }),
      occurredAt: new Date(),
      syncStatus: "PENDING",
    },
  });
  // Drain via the real local sync engine (same path production actually uses).
  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  const triggerRes = await fetch(`${LOCAL_URL}/api/sync/trigger`, { method: "POST", headers: { cookie: adminCookie } });
  check("staff can trigger a real sync cycle", triggerRes.status === 200, triggerRes.status);
  const cloudRegression = await cloudDb.cloudReservation.findUnique({ where: { id: `${BRANCH_A_ID}:${localReservation.id}` } });
  check("the real local sync engine still correctly delivers a genuine branch A reservation", cloudRegression?.branchId === BRANCH_A_ID, cloudRegression?.branchId);

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
