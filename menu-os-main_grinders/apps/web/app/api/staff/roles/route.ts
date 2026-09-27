import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { ALL_PERMISSIONS, PERMISSIONS } from "@/lib/rbac";
import { getAccessibleBranchIds } from "@/lib/branch-access";
import { coversPermissions } from "@/lib/staff-access";
import { writeAuditLog } from "@/lib/audit";

/**
 * The roles of this tenant with what each can do, plus the branches the caller may
 * assign people to. `assignable` marks the roles the caller is allowed to hand out.
 */
export async function GET() {
  const auth = await authenticate(PERMISSIONS.STAFF_MANAGE);
  if (auth.error) return auth.error;
  const actor = auth.user;

  const [roles, branchIds] = await Promise.all([
    prisma.role.findMany({
      where: { OR: [{ tenantId: actor.tenantId }, { tenantId: null }] },
      include: { permissions: { include: { permission: true } }, _count: { select: { branchRoleLinks: true } } },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    }),
    getAccessibleBranchIds(actor),
  ]);
  const branches = await prisma.branch.findMany({ where: { id: { in: branchIds } }, select: { id: true, name: true }, orderBy: { name: "asc" } });

  return NextResponse.json({
    roles: roles.map((r) => {
      const permissions = r.permissions.map((p) => p.permission.key);
      return {
        id: r.id,
        name: r.name,
        isSystem: r.isSystem,
        permissions,
        userCount: r._count.branchRoleLinks,
        assignable: coversPermissions(actor, permissions),
      };
    }),
    branches,
    canAssignAllBranches: actor.branchIds.length === 0,
    allPermissions: ALL_PERMISSIONS,
    myPermissions: actor.permissions,
  });
}

const schema = z.object({
  name: z.string().trim().min(2).max(40),
  permissions: z.array(z.string()).min(1),
});

/** A custom role — any mix of permissions the caller holds. System roles are fixed. */
export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.STAFF_MANAGE);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const keys = [...new Set(parsed.data.permissions)];
  if (!keys.every((k) => (ALL_PERMISSIONS as string[]).includes(k))) return NextResponse.json({ error: "unknown_permission" }, { status: 400 });
  if (!coversPermissions(actor, keys)) return NextResponse.json({ error: "role_above_you" }, { status: 403 });
  if (await prisma.role.findFirst({ where: { tenantId: actor.tenantId, name: parsed.data.name } })) {
    return NextResponse.json({ error: "name_taken" }, { status: 409 });
  }

  const perms = await prisma.permission.findMany({ where: { key: { in: keys } } });
  const role = await prisma.$transaction(async (tx) => {
    const created = await tx.role.create({
      data: {
        tenantId: actor.tenantId,
        name: parsed.data.name,
        isSystem: false,
        permissions: { create: perms.map((p) => ({ permissionId: p.id })) },
      },
    });
    await writeAuditLog(tx, {
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "role.created",
      entityType: "Role",
      entityId: created.id,
      after: { name: created.name, permissions: keys },
    });
    return created;
  });
  return NextResponse.json({ role }, { status: 201 });
}
