/**
 * Brings every tenant's system roles in an EXISTING database into line with the
 * registry in src/rbac.ts — adds missing grants, revokes stale ones. Touches nothing
 * else (no menu, no staff, no orders), so it is safe to run on a live branch database.
 *
 * Signed-in staff pick the change up on their next request (the session re-reads
 * permissions from the database every ~15 seconds), so nobody has to sign out.
 *
 * Run: npm run db:sync-roles
 */
import { PrismaClient } from "../generated/client";
import fs from "node:fs";
import path from "node:path";
import { syncTenantRoles } from "../src/role-sync";

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({ select: { id: true, name: true } });
  for (const tenant of tenants) {
    console.log(`Syncing roles for ${tenant.name}`);
    await syncTenantRoles(prisma, tenant.id, console.log);
  }
  console.log("Done. Signed-in staff pick up the change within about 15 seconds (no sign-out needed).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
