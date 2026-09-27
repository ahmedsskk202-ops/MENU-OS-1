import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/rbac";
import { MAX_SHIFT_HOURS, dayRange, hrAccess, localDate } from "@/lib/hr";

const employeeFields = {
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(30).optional().nullable(),
  jobTitle: z.string().trim().max(60).optional().nullable(),
  code: z.string().trim().regex(/^\d{3,8}$/).optional().nullable(),
  salaryType: z.enum(["MONTHLY", "DAILY", "HOURLY"]).optional(),
  salaryAmount: z.number().min(0).optional(),
  hireDate: z.string().optional(),
  userId: z.string().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
};

/** Employees of a branch, each with whether they are clocked in right now. */
export async function GET(req: NextRequest) {
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], req.nextUrl.searchParams.get("branchId"));
  if ("error" in access) return access.error;
  const today = dayRange(localDate());
  const employees = await prisma.employee.findMany({
    where: { branchId: access.branch.id },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      user: { select: { id: true, email: true } },
      attendance: { where: { clockIn: { gte: new Date(Date.now() - MAX_SHIFT_HOURS * 3_600_000) } }, orderBy: { clockIn: "desc" }, take: 1 },
      shifts: { where: { date: localDate() } },
      _count: { select: { dailyNotes: true } },
    },
  });
  return NextResponse.json({
    employees: employees.map((e) => {
      const last = e.attendance[0];
      return {
        id: e.id,
        name: e.name,
        phone: e.phone,
        jobTitle: e.jobTitle,
        code: e.code,
        salaryType: e.salaryType,
        salaryAmount: e.salaryAmount.toNumber(),
        hireDate: e.hireDate,
        isActive: e.isActive,
        notes: e.notes,
        user: e.user,
        notesCount: e._count.dailyNotes,
        clockedInSince: last && !last.clockOut ? last.clockIn : null,
        workedToday: !!last && last.clockIn >= today.from,
        todayShift: e.shifts[0] ? { start: e.shifts[0].startTime, end: e.shifts[0].endTime } : null,
      };
    }),
  });
}

const createSchema = z.object({ branchId: z.string(), ...employeeFields });

export async function POST(req: NextRequest) {
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], parsed.data.branchId);
  if ("error" in access) return access.error;
  const { branchId, hireDate, ...data } = parsed.data;
  if (data.code && (await prisma.employee.findFirst({ where: { tenantId: access.user.tenantId, code: data.code } }))) {
    return NextResponse.json({ error: "code_taken" }, { status: 409 });
  }
  if (data.userId) {
    const u = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!u || u.tenantId !== access.user.tenantId) return NextResponse.json({ error: "unknown_user" }, { status: 400 });
    if (await prisma.employee.findUnique({ where: { userId: data.userId } })) return NextResponse.json({ error: "user_linked" }, { status: 409 });
  }
  const employee = await prisma.employee.create({
    data: { ...data, tenantId: access.user.tenantId, branchId, hireDate: hireDate ? new Date(hireDate) : undefined },
  });
  return NextResponse.json({ employee }, { status: 201 });
}
