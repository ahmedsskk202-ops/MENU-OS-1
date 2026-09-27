import { z } from "zod";
import type { Prisma } from "@menu-os/db";
import { prisma } from "./db";
import type { SessionUser } from "./auth";
import { getAccessibleBranchIds } from "./branch-access";

/**
 * The rules for who may hand out which job.
 *
 * staff.manage is held by the Owner, the General Manager and a Branch Manager. The last
 * one is the reason these rules exist: without them a branch manager could make
 * themselves (or a friend) an Owner. Two rules close that:
 *
 *   1. No escalation — you can only give a role whose every permission you hold
 *      yourself, and only edit people whose permissions are all ones you hold.
 *   2. No reach — a branch-scoped manager can only assign roles in their own branches,
 *      never a tenant-wide ("all branches") assignment, and only edit people who work
 *      entirely inside their branches.
 */

export const isTenantWide = (actor: SessionUser) => actor.branchIds.length === 0;

export function coversPermissions(actor: SessionUser, keys: string[]) {
  const held = new Set(actor.permissions);
  return keys.every((k) => held.has(k));
}

type Assignment = { branchId: string | null; role: { permissions: { permission: { key: string } }[] } };

/** May `actor` edit a user with these role assignments? */
export async function canManageAssignments(actor: SessionUser, assignments: Assignment[]) {
  const reach = new Set(await getAccessibleBranchIds(actor));
  for (const a of assignments) {
    if (a.branchId === null ? !isTenantWide(actor) : !reach.has(a.branchId)) return false;
    if (!coversPermissions(actor, a.role.permissions.map((p) => p.permission.key))) return false;
  }
  return true;
}

/**
 * Checks one role+branch assignment `actor` wants to give. Returns an error code, or
 * null when it is allowed.
 */
export async function checkAssignable(actor: SessionUser, roleId: string, branchId: string | null) {
  const role = await prisma.role.findUnique({ where: { id: roleId }, include: { permissions: { include: { permission: true } } } });
  if (!role || (role.tenantId !== null && role.tenantId !== actor.tenantId)) return { error: "unknown_role" as const };
  if (!coversPermissions(actor, role.permissions.map((p) => p.permission.key))) return { error: "role_above_you" as const };
  if (branchId === null) {
    if (!isTenantWide(actor)) return { error: "branch_required" as const };
  } else {
    const reach = await getAccessibleBranchIds(actor);
    if (!reach.includes(branchId)) return { error: "branch_out_of_reach" as const };
  }
  return { role };
}

export const userWithRoles = {
  branchRoles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
      branch: { select: { id: true, name: true } },
    },
  },
} as const;

export const attendanceCodeSchema = z.string().trim().regex(/^\d{3,8}$/);

/** Is `code` free for this user's employee record (nobody else in the tenant uses it)? */
export async function attendanceCodeFree(tenantId: string, code: string, userId?: string) {
  const other = await prisma.employee.findFirst({ where: { tenantId, code }, select: { userId: true } });
  return !other || (userId !== undefined && other.userId === userId);
}

/**
 * Gives a staff account its clock-in (fingerprint) code. The code lives on the person's
 * HR employee record, which is created here if they do not have one yet, so the manager
 * sets it once while adding the person and the attendance tablet recognises them.
 */
export async function setAttendanceCode(
  tx: Prisma.TransactionClient,
  p: { tenantId: string; userId: string; name: string; phone: string | null; branchId: string | null; jobTitle: string; code: string | null }
) {
  const existing = await tx.employee.findUnique({ where: { userId: p.userId } });
  if (existing) {
    await tx.employee.update({ where: { id: existing.id }, data: { code: p.code } });
    return;
  }
  if (!p.code) return;
  const branchId = p.branchId ?? (await tx.branch.findFirst({ where: { brand: { tenantId: p.tenantId } }, select: { id: true } }))?.id;
  if (!branchId) return;
  await tx.employee.create({
    data: { tenantId: p.tenantId, branchId, userId: p.userId, name: p.name, phone: p.phone, jobTitle: p.jobTitle, code: p.code },
  });
}
