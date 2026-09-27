// Real, executed integration test for the customer QR/table/session lifecycle fixes:
// the proactive real-time push when staff frees a table mid-session, and that the
// customer session API now carries the brand's locale for the i18n/RTL layer.
// Run: node scripts/qr-session-flow-test.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { io } from "socket.io-client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const BRANCH_ID = "cmug2a45d0004stemr504wzug";

const { PrismaClient: LocalPrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const localDb = new LocalPrismaClient();

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

async function main() {
  console.log("Menu OS — Customer QR/table/session lifecycle: real, executed test suite");
  console.log("=".repeat(70));

  section("Setup");
  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);

  const table = await localDb.restaurantTable.findFirst({ where: { branchId: BRANCH_ID, label: "12" } });
  const qr = await localDb.qRCode.findFirst({ where: { branchId: BRANCH_ID, label: "Table 12" } });

  // ═══════════════════════════════════════════════════════════════════════
  section("1. /api/session carries the brand's default locale for the i18n/RTL layer");
  const scanRes = await fetch(`${LOCAL_URL}/r/${qr.token}`, { redirect: "manual" });
  const guestCookie = scanRes.headers.getSetCookie().find((c) => c.startsWith("mos_session")).split(";")[0];
  const sessionRes = await fetch(`${LOCAL_URL}/api/session`, { headers: { cookie: guestCookie } }).then((r) => r.json());
  check("brand.defaultLocale is present and is the brand's real configured value", sessionRes.brand?.defaultLocale === "ar", sessionRes.brand);
  check("participants list includes this guest's own session", sessionRes.participants.some((p) => p.id === sessionRes.customerSessionId));

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Freeing a table proactively pushes table_session.closed to the browsing guest");
  const tableSessionId = sessionRes.tableSessionId;

  const socket = io(LOCAL_URL, { path: "/socket.io" });
  await new Promise((resolve, reject) => {
    socket.on("connect", resolve);
    socket.on("connect_error", reject);
    setTimeout(() => reject(new Error("socket connect timeout")), 5000);
  });
  socket.emit("join", `table-session:${tableSessionId}`);
  await new Promise((r) => setTimeout(r, 300)); // let the join land before we trigger the event

  const closedEventPromise = new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 5000);
    socket.on("event", (event) => {
      if (event.type === "table_session.closed") {
        clearTimeout(timer);
        resolve(event);
      }
    });
  });

  const freeRes = await fetch(`${LOCAL_URL}/api/tables/${table.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ status: "AVAILABLE" }),
  });
  check("staff can free the table", freeRes.status === 200);

  const closedEvent = await closedEventPromise;
  check("the browsing guest's socket receives table_session.closed in real time", !!closedEvent, "no event received within 5s");
  check("the event identifies the correct table session", closedEvent?.tableSessionId === tableSessionId, closedEvent);

  const closedSession = await localDb.tableSession.findUnique({ where: { id: tableSessionId } });
  check("the session is actually CLOSED in the database, not just announced", closedSession.status === "CLOSED");

  socket.close();

  // ═══════════════════════════════════════════════════════════════════════
  console.log("\n" + "=".repeat(70));
  console.log(`RESULT: ${pass} passed, ${fail} failed`);
  if (failures.length) {
    console.log("Failed checks:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
  await localDb.$disconnect();
}

main().catch((err) => {
  console.error("Test harness crashed:", err);
  process.exitCode = 1;
});
