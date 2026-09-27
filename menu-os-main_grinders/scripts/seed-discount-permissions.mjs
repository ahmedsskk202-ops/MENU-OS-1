// One-off, idempotent: adds discounts.apply / discounts.approve to the live DB's
// existing roles without re-running the full (non-idempotent) seed script.
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");
const { PrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const prisma = new PrismaClient();

const NEW_PERMISSIONS = ["discounts.apply", "discounts.approve"];
const ROLE_ADDITIONS = {
  Owner: NEW_PERMISSIONS,
  "Branch Manager": NEW_PERMISSIONS,
  Cashier: ["discounts.apply"],
};

async function main() {
  const tenant = await prisma.tenant.findFirstOrThrow({ where: { slug: "aurum-group" } });

  const permissionRecords = await Promise.all(
    NEW_PERMISSIONS.map((key) => prisma.permission.upsert({ where: { key }, create: { key, description: key.replace(".", " ") }, update: {} }))
  );
  const permissionByKey = new Map(permissionRecords.map((p) => [p.key, p.id]));

  for (const [roleName, keys] of Object.entries(ROLE_ADDITIONS)) {
    const role = await prisma.role.findFirst({ where: { tenantId: tenant.id, name: roleName } });
    if (!role) continue;
    for (const key of keys) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permissionByKey.get(key) } },
        create: { roleId: role.id, permissionId: permissionByKey.get(key) },
        update: {},
      });
    }
    console.log(`Updated ${roleName}: +${keys.join(", ")}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
