import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { getAccessibleBranchIds } from "@/lib/branch-access";
import { attendanceCodeFree, attendanceCodeSchema, canManageAssignments, checkAssignable, setAttendanceCode, userWithRoles } from "@/lib/staff-access";
import { writeAuditLog } from "@/lib/audit";

/** Staff the caller can see: everyone in the tenant for a tenant-wide manager, otherwise
 *  anyone with at least one assignment in the caller's branches. */
export async function GET() {
  const auth = await authenticate(PERMISSIONS.STAFF_MANAGE);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const reach = await getAccessibleBranchIds(actor);
  const tenantWide = actor.branchIds.length === 0;

  const users = await prisma.user.findMany({
    where: { tenantId: actor.tenantId, ...(tenantWide ? {} : { branchRoles: { some: { branchId: { in: reach } } } }) },
    include: { ...userWithRoles, employeeProfile: { select: { code: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const staff = await Promise.all(
    users.map(async (u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      attendanceCode: u.employeeProfile?.code ?? null,
      isActive: u.isActive,
      createdAt: u.createdAt,
      isSelf: u.id === actor.id,
      editable: u.id !== actor.id && (await canManageAssignments(actor, u.branchRoles)),
      assignments: u.branchRoles.map((br) => ({
        id: br.id,
        roleId: br.roleId,
        roleName: br.role.name,
        branchId: br.branchId,
        branchName: br.branch?.name ?? null,
      })),
    }))
  );
  return NextResponse.json({ staff });
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(8).max(100),
  phone: z.string().trim().max(30).optional().nullable(),
  roleId: z.string(),
  branchId: z.string().nullable(),
  attendanceCode: attendanceCodeSchema.optional().nullable(),
});

export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.STAFF_MANAGE);
  if (auth.error) return auth.error;
  const actor = auth.user;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const check = await checkAssignable(actor, data.roleId, data.branchId);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: 403 });

  // Sign-in looks a user up by email alone, so an email must be unique everywhere.
  if (await prisma.user.findFirst({ where: { email: data.email } })) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }
  if (data.attendanceCode && !(await attendanceCodeFree(actor.tenantId, data.attendanceCode))) {
    return NextResponse.json({ error: "code_taken" }, { status: 409 });
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        tenantId: actor.tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        passwordHash: await bcrypt.hash(data.password, 10),
        branchRoles: { create: { roleId: data.roleId, branchId: data.branchId } },
      },
    });
    await setAttendanceCode(tx, {
      tenantId: actor.tenantId,
      userId: created.id,
      name: created.name,
      phone: created.phone,
      branchId: data.branchId,
      jobTitle: check.role.name,
      code: data.attendanceCode || null,
    });
    await writeAuditLog(tx, {
      tenantId: actor.tenantId,
      branchId: data.branchId ?? undefined,
      userId: actor.id,
      action: "staff.created",
      entityType: "User",
      entityId: created.id,
      after: { name: created.name, email: created.email, role: check.role.name, branchId: data.branchId },
    });
    return created;
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
}
