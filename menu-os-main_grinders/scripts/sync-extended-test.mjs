// Real, executed integration test for: the Reservation double-booking race fix, and
// local/cloud sync for Reservation, Ingredient, and Recipe.
// Run: node scripts/sync-extended-test.mjs
// Requires: apps/web on :3100, apps/cloud on :4000 (CLOUD_SYNC_URL configured), both DBs up.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LOCAL_URL = "http://localhost:3100";
const CLOUD_URL = "http://localhost:4000";
const BRANCH_ID = "cmug2a45d0004stemr504wzug";
// Every branch-scoped Cloud* projection's row id is `${branchId}:${localId}`, not the
// bare local id — see scripts/cloud-isolation-test.mjs for why.
const cid = (id) => `${BRANCH_ID}:${id}`;

const { PrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
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
  console.log("Menu OS — Reservation race-safety + Reservation/Ingredient/Recipe sync test suite");
  console.log("=".repeat(70));

  const adminCookie = await loginAs("admin@aurum.demo", "Password123!");
  check("admin logged in", !!adminCookie);

  const branch = await db.branch.findUniqueOrThrow({ where: { id: BRANCH_ID }, include: { brand: true } });
  const table = await db.restaurantTable.findFirstOrThrow({ where: { branchId: BRANCH_ID, label: "3" } });

  await db.reservation.deleteMany({ where: { tableId: table.id, guestName: { startsWith: "Race Test" } } });

  // ═══════════════════════════════════════════════════════════════════════
  section("1. Reservations — 5-way concurrent overlapping bookings on the same table");
  const reservedFor = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const attempts = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      fetch(`${LOCAL_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: adminCookie },
        body: JSON.stringify({
          branchId: BRANCH_ID,
          tableId: table.id,
          guestName: `Race Test ${i}`,
          guestPhone: "07700000000",
          partySize: 2,
          reservedFor,
          durationMinutes: 60,
        }),
      })
    )
  );
  const succeeded = attempts.filter((r) => r.status === 201);
  const rejected = attempts.filter((r) => r.status === 409);
  check("exactly ONE of 5 concurrent overlapping bookings succeeds", succeeded.length === 1, `${succeeded.length} succeeded`);
  check("the other 4 are rejected as conflicts (409), not silently dropped", rejected.length === 4, `${rejected.length} rejected`);
  const dbCount = await db.reservation.count({ where: { tableId: table.id, guestName: { startsWith: "Race Test" }, status: { in: ["PENDING", "CONFIRMED", "SEATED"] } } });
  check("exactly one live reservation row exists for that slot — no double-booking landed in the database", dbCount === 1, dbCount);

  // ═══════════════════════════════════════════════════════════════════════
  section("2. Reservations — branch isolation (a different branch's table never conflicts)");
  // Another branch of the SAME tenant — a branch of another company is refused (403) by
  // design, which is not what this check is about.
  const thisBranch = await db.branch.findUnique({ where: { id: BRANCH_ID }, include: { brand: true } });
  const otherBranch = await db.branch.findFirst({ where: { id: { not: BRANCH_ID }, brand: { tenantId: thisBranch.brand.tenantId } } });
  if (otherBranch) {
    const otherTable = await db.restaurantTable.findFirst({ where: { branchId: otherBranch.id } });
    if (otherTable) {
      const crossBranchRes = await fetch(`${LOCAL_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: adminCookie },
        body: JSON.stringify({ branchId: otherBranch.id, tableId: otherTable.id, guestName: "Race Test Other Branch", guestPhone: "07700000000", partySize: 2, reservedFor, durationMinutes: 60 }),
      });
      check("the same time slot on a different branch's table is unaffected", crossBranchRes.status === 201, crossBranchRes.status);
      if (crossBranchRes.status === 201) await db.reservation.delete({ where: { id: (await j(crossBranchRes)).reservation.id } });
    } else {
      check("no second branch with tables to test isolation against — skipped", true);
    }
  } else {
    check("only one branch seeded — cross-branch isolation not applicable in this environment", true);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("3. Reservations — reaches the cloud, idempotent, last-write-wins on update");
  await new Promise((r) => setTimeout(r, 6500));
  const winner = await db.reservation.findFirst({ where: { tableId: table.id, guestName: { startsWith: "Race Test" }, status: { in: ["PENDING", "CONFIRMED", "SEATED"] } } });
  const cloudResRes = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/reservations`);
  if (cloudResRes.ok) {
    const cloudResJson = await cloudResRes.json();
    const synced = cloudResJson.reservations.find((r) => r.id === (winner?.id && cid(winner.id)));
    check("the winning reservation synced to the cloud", !!synced, "not found in cloud yet");
    if (synced) check("cloud reservation status matches local (PENDING)", synced.status === "PENDING", synced.status);

    const confirmRes = await fetch(`${LOCAL_URL}/api/reservations/${winner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: adminCookie },
      body: JSON.stringify({ status: "CONFIRMED" }),
    });
    check("reservation confirms", confirmRes.status === 200);
    await new Promise((r) => setTimeout(r, 6500));
    const cloudResRes2 = await fetch(`${CLOUD_URL}/branches/${BRANCH_ID}/reservations`);
    const cloudResJson2 = await cloudResRes2.json();
    const syncedAfterUpdate = cloudResJson2.reservations.find((r) => r.id === cid(winner.id));
    check("the status update reached the cloud too", syncedAfterUpdate?.status === "CONFIRMED", syncedAfterUpdate?.status);
  } else {
    check("cloud reachable for reservation check", false, `cloud responded ${cloudResRes.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("4. Ingredients — reaches the cloud, updates sync, brand-scoped (not branch-scoped)");
  await db.ingredient.deleteMany({ where: { name: "Sync Test Ingredient" } });
  const ingRes = await fetch(`${LOCAL_URL}/api/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId: branch.brandId, name: "Sync Test Ingredient", unit: "kg", currentStock: 50, lowStockThreshold: 10 }),
  });
  const ingJson = await j(ingRes);
  check("ingredient created", ingRes.status === 201);

  await new Promise((r) => setTimeout(r, 6500));
  const cloudIngRes = await fetch(`${CLOUD_URL}/brands/${branch.brandId}/ingredients`);
  if (cloudIngRes.ok) {
    const cloudIngJson = await cloudIngRes.json();
    const syncedIng = cloudIngJson.ingredients.find((i) => i.id === ingJson.ingredient.id);
    check("the ingredient synced to the cloud", !!syncedIng);
    if (syncedIng) check("cloud ingredient stock is correct", parseFloat(syncedIng.currentStock) === 50, syncedIng.currentStock);

    const updateRes = await fetch(`${LOCAL_URL}/api/ingredients/${ingJson.ingredient.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: adminCookie },
      body: JSON.stringify({ currentStock: 5 }),
    });
    check("ingredient stock updates", updateRes.status === 200);
    await new Promise((r) => setTimeout(r, 6500));
    const cloudIngRes2 = await fetch(`${CLOUD_URL}/brands/${branch.brandId}/ingredients`);
    const cloudIngJson2 = await cloudIngRes2.json();
    const syncedIng2 = cloudIngJson2.ingredients.find((i) => i.id === ingJson.ingredient.id);
    check("the stock update reached the cloud (5, not the stale 50)", parseFloat(syncedIng2?.currentStock) === 5, syncedIng2?.currentStock);
  } else {
    check("cloud reachable for ingredient check", false, `cloud responded ${cloudIngRes.status}`);
  }

  // ═══════════════════════════════════════════════════════════════════════
  section("5. Recipe — whole-list replace syncs correctly, old lines don't linger in the cloud");
  const product = await db.product.findFirstOrThrow({ where: { category: { menu: { brandId: branch.brandId } } } });
  const ingredient2Res = await fetch(`${LOCAL_URL}/api/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ brandId: branch.brandId, name: "Sync Test Ingredient 2", unit: "g" }),
  });
  const ingredient2 = (await j(ingredient2Res)).ingredient;

  const recipeRes1 = await fetch(`${LOCAL_URL}/api/recipes/${product.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ lines: [{ ingredientId: ingJson.ingredient.id, quantity: 100, unit: "g", costPerUnitSnapshot: 3 }] }),
  });
  check("recipe saves with one line", recipeRes1.status === 200);
  await new Promise((r) => setTimeout(r, 6500));
  const cloudRecipeRes1 = await fetch(`${CLOUD_URL}/products/${product.id}/recipe`);
  const cloudRecipeJson1 = await j(cloudRecipeRes1);
  check("the first recipe version synced with exactly one line", cloudRecipeJson1?.lines?.length === 1, cloudRecipeJson1?.lines?.length);

  const recipeRes2 = await fetch(`${LOCAL_URL}/api/recipes/${product.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ lines: [{ ingredientId: ingredient2.id, quantity: 50, unit: "g", costPerUnitSnapshot: 1.5 }] }),
  });
  check("recipe replaces with a different single line", recipeRes2.status === 200);
  await new Promise((r) => setTimeout(r, 6500));
  const cloudRecipeRes2 = await fetch(`${CLOUD_URL}/products/${product.id}/recipe`);
  const cloudRecipeJson2 = await j(cloudRecipeRes2);
  check("the replaced recipe has exactly the new line, not both old and new", cloudRecipeJson2?.lines?.length === 1 && cloudRecipeJson2.lines[0].ingredientId === ingredient2.id, JSON.stringify(cloudRecipeJson2?.lines));

  // ═══════════════════════════════════════════════════════════════════════
  section("6. Regression — the local recipe/ingredient endpoints still behave exactly as before");
  const recipeGet = await fetch(`${LOCAL_URL}/api/recipes/${product.id}`, { headers: { cookie: adminCookie } });
  const recipeGetJson = await j(recipeGet);
  check("GET recipe still round-trips locally", recipeGetJson.recipe?.lines?.length === 1);

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
