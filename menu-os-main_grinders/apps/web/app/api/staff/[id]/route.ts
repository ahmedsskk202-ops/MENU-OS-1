import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { invalidateAccess } from "@/lib/auth";
import { attendanceCodeFree, attendanceCodeSchema, canManageAssignments, checkAssignable, setAttendanceCode, userWithRoles } from "@/lib/staff-access";
import { writeAuditLog } from "@/lib/audit";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().toLowerCase().email().max(120).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).max(100).optional(),
  // One job per person from this screen: giving a role replaces what they had.
  roleId: z.string().optional(),
  branchId: z.string().nullable().optional(),
  // The clock-in (fingerprint) code; null clears it.
  attendanceCode: attendanceCodeSchema.optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(PERMISSIONS.STAFF_MANAGE);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const target = await prisma.user.findUnique({ where: { id: params.id }, include: userWithRoles });
  if (!target || target.tenantId !== actor.tenantId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Nobody changes their own job or switches themselves off — that is how a tablet ends
  // up with no manager able to sign in.
  if (target.id === actor.id) return NextResponse.json({ error: "self" }, { status: 403 });
  if (!(await canManageAssignments(actor, target.branchRoles))) return NextResponse.json({ error: "user_above_you" }, { status: 403 });

  let newRole: { id: string; name: string } | null = null;
  if (data.roleId !== undefined) {
    const branchId = data.branchId === undefined ? target.branchRoles[0]?.branchId ?? null : data.branchId;
    const check = await checkAssignable(actor, data.roleId, branchId);
    if ("error" in check) return NextResponse.json({ error: check.error }, { status: 403 });
    newRole = check.role;
    data.branchId = branchId;
  }

  if (data.email && data.email !== target.email) {
    if (await prisma.user.findFirst({ where: { email: data.email, NOT: { id: target.id } } })) {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }
  }

  if (data.attendanceCode && !(await attendanceCodeFree(actor.tenantId, data.attendanceCode, target.id))) {
    return NextResponse.json({ error: "code_taken" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    if (data.attendanceCode !== undefined) {
      await setAttendanceCode(tx, {
        tenantId: actor.tenantId,
        userId: target.id,
        name: data.name ?? target.name,
        phone: data.phone === undefined ? target.phone : data.phone || null,
        branchId: data.branchId ?? target.branchRoles[0]?.branchId ?? null,
        jobTitle: newRole?.name ?? target.branchRoles[0]?.role.name ?? "",
        code: data.attendanceCode || null,
      });
    }
    await tx.user.update({
      where: { id: target.id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone === undefined ? undefined : data.phone || null,
        isActive: data.isActive,
        passwordHash: data.password ? await bcrypt.hash(data.password, 10) : undefined,
      },
    });
    if (newRole) {
      await tx.userBranchRole.deleteMany({ where: { userId: target.id } });
      await tx.userBranchRole.create({ data: { userId: target.id, roleId: newRole.id, branchId: data.branchId ?? null } });
    }
    await writeAuditLog(tx, {
      tenantId: actor.tenantId,
      userId: actor.id,
      action: "staff.updated",
      entityType: "User",
      entityId: target.id,
      before: {
        name: target.name,
        email: target.email,
        isActive: target.isActive,
        roles: target.branchRoles.map((br) => ({ role: br.role.name, branchId: br.branchId })),
      },
      after: {
        name: data.name,
        email: data.email,
        isActive: data.isActive,
        passwordReset: data.password ? true : undefined,
        role: newRole ? { role: newRole.name, branchId: data.branchId ?? null } : undefined,
      },
    });
  });

  // Takes effect on the person's very next request, not their next sign-in.
  invalidateAccess(target.id);
  return NextResponse.json({ ok: true });
}
