import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { dayRange, employeeInReach, hoursBetween, hrAccess, isDate, localDate } from "@/lib/hr";

/** Attendance of a branch between two local dates (default: today). */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], sp.get("branchId"));
  if ("error" in access) return access.error;
  const fromDate = isDate(sp.get("from")) ? sp.get("from")! : localDate();
  const toDate = isDate(sp.get("to")) ? sp.get("to")! : fromDate;
  const employeeId = sp.get("employeeId");
  const records = await prisma.attendanceRecord.findMany({
    where: {
      branchId: access.branch.id,
      clockIn: { gte: dayRange(fromDate).from, lt: dayRange(toDate).to },
      ...(employeeId ? { employeeId } : {}),
    },
    orderBy: { clockIn: "desc" },
    include: { employee: { select: { id: true, name: true, jobTitle: true } } },
    take: 1000,
  });
  return NextResponse.json({
    records: records.map((r) => ({
      id: r.id,
      employee: r.employee,
      date: localDate(r.clockIn),
      clockIn: r.clockIn,
      clockOut: r.clockOut,
      hours: r.clockOut ? hoursBetween(r.clockIn, r.clockOut) : null,
      source: r.source,
      note: r.note,
    })),
  });
}

const createSchema = z.object({
  employeeId: z.string(),
  clockIn: z.string(),
  clockOut: z.string().optional().nullable(),
  note: z.string().trim().max(200).optional().nullable(),
});

/** A manager's manual entry — a forgotten punch, a shift worked elsewhere. */
export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const employee = await employeeInReach(auth.user, parsed.data.employeeId);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const clockIn = new Date(parsed.data.clockIn);
  const clockOut = parsed.data.clockOut ? new Date(parsed.data.clockOut) : null;
  if (Number.isNaN(clockIn.getTime()) || (clockOut && (Number.isNaN(clockOut.getTime()) || clockOut <= clockIn))) {
    return NextResponse.json({ error: "bad_times" }, { status: 400 });
  }
  const record = await prisma.attendanceRecord.create({
    data: { employeeId: employee.id, branchId: employee.branchId, clockIn, clockOut, source: "MANUAL", note: parsed.data.note ?? null },
  });
  return NextResponse.json({ record }, { status: 201 });
}
