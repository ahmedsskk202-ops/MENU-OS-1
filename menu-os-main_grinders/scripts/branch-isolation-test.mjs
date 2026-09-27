// Real, executed integration test for the branch-isolation authorization fix
// (lib/branch-access.ts). Verifies: a branch-scoped role can only reach its own
// branch's data (reads, writes, resource-based updates, and report exports); a
// tenant-wide role keeps multi-branch access within its own tenant; and tenant
// isolation holds even for a tenant-wide role against another tenant's branch.
// Run: node scripts/branch-isolation-test.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const BRANCH_ID = "cmug2a45d0004stemr504wzug"; // Aurum · Karrada (seeded)

const { PrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const bcrypt = (await import("bcryptjs")).default;
const db = new PrismaClient();

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
  console.log("Menu OS — Branch isolation (authorization) test suite");
  console.log("=".repeat(70));

  const homeBranch = await db.branch.findUniqueOrThrow({ where: { id: BRANCH_ID }, include: { brand: true } });
  const tenant = await db.tenant.findUniqueOrThrow({ where: { id: homeBranch.brand.tenantId } });

  // ── Fixtures ──────────────────────────────────────────────────────────
  // A second branch under the SAME tenant/brand (same-tenant cross-branch case).
  const otherBranch = await db.branch.upsert({
    where: { brandId_slug: { brandId: homeBranch.brandId, slug: "isolation-test-branch" } },
    create: { brandId: homeBranch.brandId, slug: "isolation-test-branch", name: "Isolation Test Branch", city: "Baghdad" },
    update: {},
  });
  const otherTable = await db.restaurantTable.upsert({
    where: { branchId_label: { branchId: otherBranch.id, label: "ISO-1" } },
    create: { branchId: otherBranch.id, label: "ISO-1", capacity: 2 },
    update: {},
  });

  // A second tenant entirely, with its own branch (cross-tenant case).
  const otherTenant = await db.tenant.upsert({
    where: { slug: "isolation-test-tenant" },
    create: { name: "Isolation Test Tenant", slug: "isolation-test-tenant", plan: "GROWTH" },
    update: {},
  });
  const otherTenantBrand = await db.brand.upsert({
    where: { tenantId_slug: { tenantId: otherTenant.id, slug: "isolation-test-brand" } },
    create: { tenantId: otherTenant.id, slug: "isolation-test-brand", name: "Isolation Test Brand", currency: "IQD" },
    update: {},
  });
  const foreignBranch = await db.branch.upsert({
    where: { brandId_slug: { brandId: otherTenantBrand.id, slug: "isolation-test-foreign-branch" } },
    create: { brandId: otherTenantBrand.id, slug: "isolation-test-foreign-branch", name: "Foreign Tenant Branch" },
    update: {},
  });

  // A branch-scoped test user (Branch Manager role — it has every permission this
  // suite exercises: TABLES_MANAGE, EXPENSES_MANAGE, REPORTS_VIEW/EXPORT — so a 403
  // can only mean the branch check fired, never an unrelated permission gap).
  const managerRole = await db.role.findUniqueOrThrow({ where: { id: `${tenant.id}-Branch Manager` } });
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const scopedUser = await db.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "isolation-test-manager@aurum.demo" } },
    create: { tenantId: tenant.id, email: "isolation-test-manager@aurum.demo", name: "Isolation Test Manager", passwordHash },
    update: { passwordHash },
  });
  const existingRole = await db.userBranchRole.findFirst({ where: { userId: scopedUser.id, roleId: managerRole.id, branchId: homeBranch.id } });
  if (!existingRole) await db.userBranchRole.create({ data: { userId: scopedUser.id, roleId: managerRole.id, branchId: homeBranch.id } });

  const scopedCookie = await loginAs("isolation-test-manager@aurum.demo", "Password123!");
  const ownerCookie = await loginAs("admin@aurum.demo", "Password123!"); // tenant-wide Owner

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Branch-scoped user — allowed on their own branch");
  const ownBranchRes = await fetch(`${LOCAL_URL}/api/tables?branchId=${homeBranch.id}`, { headers: { cookie: scopedCookie } });
  check("read (tables) on own branch succeeds", ownBranchRes.status === 200, ownBranchRes.status);

  const createExpenseOwn = await fetch(`${LOCAL_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: scopedCookie },
    body: JSON.stringify({ branchId: homeBranch.id, category: "Test", amount: 10 }),
  });
  check("write (create expense) on own branch succeeds", createExpenseOwn.status === 201, createExpenseOwn.status);

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Branch-scoped user — denied on another branch in the SAME tenant");
  const crossBranchRes = await fetch(`${LOCAL_URL}/api/tables?branchId=${otherBranch.id}`, { headers: { cookie: scopedCookie } });
  check("read (tables) on another branch is 403, not 200 with leaked data", crossBranchRes.status === 403, crossBranchRes.status);

  const crossExpenseRes = await fetch(`${LOCAL_URL}/api/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: scopedCookie },
    body: JSON.stringify({ branchId: otherBranch.id, category: "Test", amount: 10 }),
  });
  check("write (create expense) on another branch is 403, not silently created", crossExpenseRes.status === 403, crossExpenseRes.status);
  const leakedExpense = await db.expense.findFirst({ where: { branchId: otherBranch.id, category: "Test" } });
  check("no expense actually landed in the other branch's data", !leakedExpense);

  const crossTableWriteRes = await fetch(`${LOCAL_URL}/api/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: scopedCookie },
    body: JSON.stringify({ branchId: otherBranch.id, label: "SHOULD-NOT-EXIST" }),
  });
  check("creating a table on another branch is 403", crossTableWriteRes.status === 403, crossTableWriteRes.status);

  // Resource-based: fetch-by-id, not a raw branchId param — the harder case.
  const crossTablePatchRes = await fetch(`${LOCAL_URL}/api/tables/${otherTable.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: scopedCookie },
    body: JSON.stringify({ status: "OCCUPIED" }),
  });
  check("updating a table THEY DON'T OWN by id (not by branchId param) is 403", crossTablePatchRes.status === 403, crossTablePatchRes.status);
  const tableAfter = await db.restaurantTable.findUnique({ where: { id: otherTable.id } });
  check("that table's status was not actually changed", tableAfter.status === "AVAILABLE", tableAfter.status);

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Branch-scoped user — denied on a report export for another branch");
  const crossReportJson = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${otherBranch.id}`, { headers: { cookie: scopedCookie } });
  check("report JSON read on another branch is 403", crossReportJson.status === 403, crossReportJson.status);
  const crossReportCsv = await fetch(`${LOCAL_URL}/api/reports/sales?branchId=${otherBranch.id}&format=csv`, { headers: { cookie: scopedCookie } });
  check("report CSV export on another branch is 403", crossReportCsv.status === 403, crossReportCsv.status);

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Branch-scoped user — the branch picker (GET /api/branches) never lists a branch they can't access");
  const branchesRes = await fetch(`${LOCAL_URL}/api/branches`, { headers: { cookie: scopedCookie } });
  const branchesJson = await j(branchesRes);
  const listedIds = branchesJson.branches.map((b) => b.id);
  check("their own branch is listed", listedIds.includes(homeBranch.id));
  check("the other same-tenant branch is NOT listed", !listedIds.includes(otherBranch.id));

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Tenant-wide role (Owner) — multi-branch access within their own tenant is preserved");
  const ownerOtherBranchRes = await fetch(`${LOCAL_URL}/api/tables?branchId=${otherBranch.id}`, { headers: { cookie: ownerCookie } });
  check("Owner can read another branch of their OWN tenant", ownerOtherBranchRes.status === 200, ownerOtherBranchRes.status);
  const ownerBranchesRes = await fetch(`${LOCAL_URL}/api/branches`, { headers: { cookie: ownerCookie } });
  const ownerBranchesJson = await j(ownerBranchesRes);
  check("Owner's branch list includes the newly created second branch", ownerBranchesJson.branches.some((b) => b.id === otherBranch.id));

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Tenant isolation — even a tenant-wide role cannot reach ANOTHER tenant's branch");
  const ownerForeignRes = await fetch(`${LOCAL_URL}/api/tables?branchId=${foreignBranch.id}`, { headers: { cookie: ownerCookie } });
  check("Owner (tenant-wide) is still denied a foreign tenant's branch", ownerForeignRes.status === 403, ownerForeignRes.status);
  const scopedForeignRes = await fetch(`${LOCAL_URL}/api/tables?branchId=${foreignBranch.id}`, { headers: { cookie: scopedCookie } });
  check("branch-scoped user is also denied a foreign tenant's branch", scopedForeignRes.status === 403, scopedForeignRes.status);

  // ═══════════════════════════════════════════════════════════════════════
  section("7. Regression — a legitimate same-branch resource update still works");
  const ownTable = await db.restaurantTable.findFirstOrThrow({ where: { branchId: homeBranch.id } });
  const legitPatchRes = await fetch(`${LOCAL_URL}/api/tables/${ownTable.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie: scopedCookie },
    body: JSON.stringify({ status: ownTable.status }),
  });
  check("updating a table on their own branch still succeeds", legitPatchRes.status === 200, legitPatchRes.status);

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
