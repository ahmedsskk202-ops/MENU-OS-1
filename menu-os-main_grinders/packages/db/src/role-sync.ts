import type { PrismaClient } from "../generated/client";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, unregisteredRolePermissions } from "./rbac";

/**
 * Makes one tenant's system roles match the registry in `rbac.ts` exactly.
 *
 * Both seeds call this, and so does `prisma/sync-roles.ts` for a database that already
 * exists. It used to be two copies — one in each seed — and the Grinders copy carried its
 * own hand-written permission list that never gained `orders.serve`, so a Grinders waiter
 * signed in to an empty dashboard with no way to serve an order. One implementation, fed
 * from one list, is what stops that from happening again.
 *
 * Declared, not accumulated: a grant the registry no longer lists is revoked, otherwise
 * shrinking a role would leave the old permission live in every existing database.
 *
 * Returns the role ids by name so a seed can attach staff to them.
 */
export async function syncTenantRoles(
  prisma: PrismaClient,
  tenantId: string,
  log: (line: string) => void = () => {}
): Promise<Record<string, string>> {
  const unregistered = unregisteredRolePermissions();
  if (unregistered.length > 0) {
    throw new Error(`Roles reference permissions that are not in PERMISSIONS: ${unregistered.join(", ")}`);
  }

  const permissionRecords = await Promise.all(
    ALL_PERMISSIONS.map((key) =>
      prisma.permission.upsert({ where: { key }, create: { key, description: key.replace(".", " ") }, update: {} })
    )
  );
  const permissionByKey = new Map(permissionRecords.map((p) => [p.key, p.id]));

  const roleIds: Record<string, string> = {};
  for (const [roleName, keys] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { id: `${tenantId}-${roleName}` },
      create: { id: `${tenantId}-${roleName}`, tenantId, name: roleName, isSystem: true },
      update: {},
    });
    roleIds[roleName] = role.id;

    const keep = new Set(keys.map((key) => permissionByKey.get(key)!));
    for (const permissionId of keep) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        create: { roleId: role.id, permissionId },
        update: {},
      });
    }

    const existing = await prisma.rolePermission.findMany({ where: { roleId: role.id }, select: { permissionId: true } });
    const revoke = existing.filter((rp) => !keep.has(rp.permissionId)).map((rp) => rp.permissionId);
    if (revoke.length > 0) {
      await prisma.rolePermission.deleteMany({ where: { roleId: role.id, permissionId: { in: revoke } } });
      log(`  ${roleName}: revoked ${revoke.length} permission(s) no longer granted`);
    }
  }

  // A system role the registry dropped (the old General/Branch Manager, merged into
  // Owner) is removed. Anyone left without a role by that loses sign-in rather than
  // keeping a login that opens nothing.
  const stale = await prisma.role.findMany({
    where: { tenantId, isSystem: true, name: { notIn: Object.keys(ROLE_PERMISSIONS) } },
    include: { branchRoleLinks: { select: { userId: true } } },
  });
  for (const role of stale) {
    const userIds = [...new Set(role.branchRoleLinks.map((l) => l.userId))];
    await prisma.role.delete({ where: { id: role.id } });
    for (const userId of userIds) {
      if ((await prisma.userBranchRole.count({ where: { userId } })) === 0) {
        await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
      }
    }
    log(`  ${role.name}: removed (no longer a system role; ${userIds.length} user(s) unassigned)`);
  }

  // Permissions the registry no longer has (loyalty.manage) disappear from custom roles too.
  const stalePerms = await prisma.permission.findMany({ where: { key: { notIn: ALL_PERMISSIONS } }, select: { id: true, key: true } });
  if (stalePerms.length > 0) {
    await prisma.rolePermission.deleteMany({ where: { permissionId: { in: stalePerms.map((p) => p.id) } } });
    await prisma.permission.deleteMany({ where: { id: { in: stalePerms.map((p) => p.id) } } });
    log(`  removed permission(s): ${stalePerms.map((p) => p.key).join(", ")}`);
  }
  return roleIds;
}
