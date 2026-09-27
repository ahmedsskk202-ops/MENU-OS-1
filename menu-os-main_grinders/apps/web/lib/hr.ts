import { NextResponse } from "next/server";
import { prisma } from "./db";
import { authenticate } from "./api-guard";
import { checkBranchAccess } from "./branch-access";
import type { SessionUser } from "./auth";

/**
 * HR, kept deliberately simple.
 *
 * Dates are the cafe's local calendar (Baghdad, UTC+3 all year, no daylight saving), so
 * "today", a month's payroll and a shift's date all mean what the manager means.
 *
 * Pay per month:
 *   MONTHLY → the salary as set,
 *   DAILY   → rate × days with at least one clock-in,
 *   HOURLY  → rate × hours of completed attendance,
 * plus bonuses, minus deductions and advances booked to that month.
 */

export const TZ = "Asia/Baghdad";
const OFFSET = "+03:00";

/** YYYY-MM-DD of an instant in the cafe's time zone. */
export function localDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function localPeriod(d: Date = new Date()): string {
  return localDate(d).slice(0, 7);
}

/** Start (inclusive) and end (exclusive) instants of a local day or month. */
export function dayRange(date: string) {
  const from = new Date(`${date}T00:00:00${OFFSET}`);
  return { from, to: new Date(from.getTime() + 86_400_000) };
}

export function monthRange(period: string) {
  const [y, m] = period.split("-").map(Number);
  const from = new Date(`${period}-01T00:00:00${OFFSET}`);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  return { from, to: new Date(`${next}-01T00:00:00${OFFSET}`) };
}

export const isDate = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isPeriod = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}$/.test(s);
export const isTime = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** Hours between two instants, rounded to minutes. */
export function hoursBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60_000)) / 60;
}

/** An open punch older than this is treated as forgotten, not as "still here". */
export const MAX_SHIFT_HOURS = 20;

/** Common front of every HR route: signed in, holding one of `anyOf`, allowed into the branch. */
export async function hrAccess(anyOf: string[], branchId: string | null | undefined) {
  const auth = await authenticate();
  if (auth.error) return { error: auth.error };
  const user = auth.user as SessionUser;
  if (!anyOf.some((p) => user.permissions.includes(p))) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (!branchId) return { error: NextResponse.json({ error: "branchId is required" }, { status: 400 }) };
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return { error: denied };
  const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
  if (!branch) return { error: NextResponse.json({ error: "Branch not found" }, { status: 404 }) };
  return { user, branch };
}

/** The employee, only if they belong to a branch this user can reach. */
export async function employeeInReach(user: SessionUser, employeeId: string) {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || employee.tenantId !== user.tenantId) return null;
  const denied = await checkBranchAccess(user, employee.branchId);
  return denied ? null : employee;
}

/**
 * One punch on the attendance tablet: clocks the employee out if they have an open
 * record from the last MAX_SHIFT_HOURS, otherwise clocks them in. A second punch within
 * a minute is ignored — a double tap is not a whole shift.
 */
export async function punch(tenantId: string, branchId: string, code: string) {
  const employee = await prisma.employee.findFirst({ where: { tenantId, code: code.trim(), isActive: true } });
  if (!employee) return { error: "unknown_code" as const };
  if (employee.branchId !== branchId) return { error: "other_branch" as const };
  const now = new Date();
  const open = await prisma.attendanceRecord.findFirst({
    where: { employeeId: employee.id, clockOut: null, clockIn: { gte: new Date(now.getTime() - MAX_SHIFT_HOURS * 3_600_000) } },
    orderBy: { clockIn: "desc" },
  });
  const last = await prisma.attendanceRecord.findFirst({ where: { employeeId: employee.id }, orderBy: { createdAt: "desc" } });
  const lastTouch = last ? Math.max(last.clockIn.getTime(), last.clockOut?.getTime() ?? 0) : 0;
  if (now.getTime() - lastTouch < 60_000) {
    return { employee, action: open ? ("IN" as const) : ("OUT" as const), at: new Date(lastTouch), repeated: true };
  }
  if (open) {
    await prisma.attendanceRecord.update({ where: { id: open.id }, data: { clockOut: now } });
    return { employee, action: "OUT" as const, at: now, hours: hoursBetween(open.clockIn, now) };
  }
  await prisma.attendanceRecord.create({ data: { employeeId: employee.id, branchId, clockIn: now, source: "KIOSK" } });
  return { employee, action: "IN" as const, at: now };
}

/** A month's pay for every employee of a branch (or one employee). */
export async function payrollFor(branchId: string, period: string, employeeId?: string) {
  const { from, to } = monthRange(period);
  const employees = await prisma.employee.findMany({
    where: { branchId, ...(employeeId ? { id: employeeId } : {}), OR: [{ isActive: true }, { payments: { some: { period } } }] },
    orderBy: { name: "asc" },
    include: {
      attendance: { where: { clockIn: { gte: from, lt: to } } },
      adjustments: { where: { period }, orderBy: { createdAt: "asc" }, include: { createdBy: { select: { name: true } } } },
      payments: { where: { period } },
    },
  });

  return employees.map((e) => {
    const days = new Set(e.attendance.map((a) => localDate(a.clockIn))).size;
    const hours = Math.round(e.attendance.reduce((s, a) => s + (a.clockOut ? hoursBetween(a.clockIn, a.clockOut) : 0), 0) * 100) / 100;
    const rate = e.salaryAmount.toNumber();
    const base = e.salaryType === "DAILY" ? rate * days : e.salaryType === "HOURLY" ? Math.round(rate * hours) : rate;
    const sum = (type: string) => e.adjustments.filter((a) => a.type === type).reduce((s, a) => s + a.amount.toNumber(), 0);
    const bonuses = sum("BONUS");
    const deductions = sum("DEDUCTION");
    const advances = sum("ADVANCE");
    const payment = e.payments[0] ?? null;
    return {
      employeeId: e.id,
      name: e.name,
      jobTitle: e.jobTitle,
      salaryType: e.salaryType,
      rate,
      days,
      hours,
      base,
      bonuses,
      deductions,
      advances,
      net: base + bonuses - deductions - advances,
      openPunches: e.attendance.filter((a) => !a.clockOut).length,
      adjustments: e.adjustments.map((a) => ({ id: a.id, type: a.type, amount: a.amount.toNumber(), note: a.note, by: a.createdBy?.name ?? null, createdAt: a.createdAt })),
      paid: payment ? { id: payment.id, net: payment.net.toNumber(), paidAt: payment.paidAt } : null,
    };
  });
}

/** A random 4-digit clock-in code not yet used in this tenant (5 digits once 4 run short). */
export async function freeAttendanceCode(tenantId: string): Promise<string> {
  const taken = new Set(
    (await prisma.employee.findMany({ where: { tenantId, code: { not: null } }, select: { code: true } })).map((e) => e.code)
  );
  for (let digits = 4; ; digits++) {
    const min = 10 ** (digits - 1);
    for (let i = 0; i < 200; i++) {
      const code = String(min + Math.floor(Math.random() * (9 * min)));
      if (!taken.has(code)) return code;
    }
  }
}
