// One-off, idempotent: adds the new financial-module permissions/roles/user without
// re-running the full seed script (which would crash on the historical demo orders'
// unique session numbers). Mirrors packages/db/prisma/seed.ts's permission section.
import path from "node:path";
import { pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const { PrismaClient } = await import(pathToFileURL(path.join(ROOT, "packages/db/generated/client/index.js")));
const prisma = new PrismaClient();

const NEW_PERMISSIONS = ["shifts.manage", "cash_movements.manage", "expenses.manage", "reports.view", "reports.export"];

const ROLE_ADDITIONS = {
  Owner: NEW_PERMISSIONS,
  "Branch Manager": NEW_PERMISSIONS,
  Cashier: ["shifts.manage", "cash_movements.manage", "expenses.manage"],
};

async function main() {
  const tenant = await prisma.tenant.findFirstOrThrow({ where: { slug: "aurum-group" } });
  const branch = await prisma.branch.findFirstOrThrow({ where: { brand: { tenantId: tenant.id } } });

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

  const accountantPerms = ["revenue.view", "analytics.view", "refunds.manage", "audit_log.view", "expenses.manage", "reports.view", "reports.export", "shifts.manage"];
  const allAccountantPermRecords = await Promise.all(
    accountantPerms.map((key) => prisma.permission.upsert({ where: { key }, create: { key, description: key.replace(".", " ") }, update: {} }))
  );
  const accountantRole = await prisma.role.upsert({
    where: { id: `${tenant.id}-Accountant` },
    create: { id: `${tenant.id}-Accountant`, tenantId: tenant.id, name: "Accountant", isSystem: true },
    update: {},
  });
  for (const p of allAccountantPermRecords) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: accountantRole.id, permissionId: p.id } },
      create: { roleId: accountantRole.id, permissionId: p.id },
      update: {},
    });
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const accountantUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "accountant@aurum.demo" } },
    create: { tenantId: tenant.id, email: "accountant@aurum.demo", name: "Dana Accountant", passwordHash },
    update: {},
  });
  const existingAssignment = await prisma.userBranchRole.findFirst({ where: { userId: accountantUser.id, roleId: accountantRole.id, branchId: branch.id } });
  if (!existingAssignment) {
    await prisma.userBranchRole.create({ data: { userId: accountantUser.id, roleId: accountantRole.id, branchId: branch.id } });
  }
  console.log("Accountant user ready: accountant@aurum.demo / Password123!");

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
