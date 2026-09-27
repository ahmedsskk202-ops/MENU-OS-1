import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { ALL_PERMISSIONS, PERMISSIONS } from "@/lib/rbac";
import { invalidateAccess } from "@/lib/auth";
import { coversPermissions } from "@/lib/staff-access";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  name: z.string().trim().min(2).max(40).optional(),
  permissions: z.array(z.string()).min(1).optional(),
});

async function loadCustomRole(id: string, tenantId: string) {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: { include: { permission: true } }, branchRoleLinks: { select: { userId: true } } },
  });
  if (!role || role.tenantId !== tenantId) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  // System roles are defined in code (packages/db/src/rbac.ts) and re-applied by
  // `npm run db:sync-roles`; an edit here would be silently undone.
  if (role.isSystem) return { error: NextResponse.json({ error: "system_role" }, { status: 403 }) };
  return { role };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(PERMISSIONS.STAFF_MANAGE);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const loaded = await loadCustomRole(params.id, actor.tenantId);
  if ("error" in loaded) return loaded.error;
  const { role } = loaded;

  const current = role.permissions.map((p) => p.permission.key);
  if (!coversPermissions(actor, current)) return NextResponse.json({ error: "role_above_you" }, { status: 403 });
  const keys = parsed.data.permissions ? [...new Set(parsed.data.permissions)] : null;
  if (keys) {
    if (!keys.every((k) => (ALL_PERMISSIONS as string[]).includes(k))) return NextResponse.json({ error: "unknown_permission" }, { status: 400 });
    if (!coversPermissions(actor, keys)) return NextResponse.json({ error: "role_above_you" }, { status: 403 });
  }

  const perms = keys ? await prisma.permission.findMany({ where: { key: { in: keys } } }) : [];
  await prisma.$transaction(async (tx) => {
    await tx.role.update({ where: { id: role.id }, data: { name: parsed.data.name } });
    if (keys) {
      await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
      await tx.rolePermission.createMany({ data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })) });
    }
    await writeAuditLog(tx, {
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "role.updated",
      entityType: "Role",
      entityId: role.id,
      before: { name: role.name, permissions: current },
      after: { name: parsed.data.name ?? role.name, permissions: keys ?? current },
    });
  });
  for (const link of role.branchRoleLinks) invalidateAccess(link.userId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(PERMISSIONS.STAFF_MANAGE);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const loaded = await loadCustomRole(params.id, actor.tenantId);
  if ("error" in loaded) return loaded.error;
  if (loaded.role.branchRoleLinks.length > 0) return NextResponse.json({ error: "role_in_use" }, { status: 409 });
  if (!coversPermissions(actor, loaded.role.permissions.map((p) => p.permission.key))) {
    return NextResponse.json({ error: "role_above_you" }, { status: 403 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.role.delete({ where: { id: loaded.role.id } });
    await writeAuditLog(tx, {
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "role.deleted",
      entityType: "Role",
      entityId: loaded.role.id,
      before: { name: loaded.role.name },
    });
  });
  return NextResponse.json({ ok: true });
}
