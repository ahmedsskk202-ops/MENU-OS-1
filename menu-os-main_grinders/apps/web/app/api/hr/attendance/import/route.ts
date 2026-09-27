import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/rbac";
import { hrAccess, localDate } from "@/lib/hr";

/**
 * Imports the export of a fingerprint device. Each line is the employee's number on the
 * device and a date-time, in any of the usual shapes:
 *
 *   12,2026-09-27 08:58:10
 *   12	2026/09/27 17:03
 *
 * Per employee per day, the first punch is the clock-in and the last the clock-out.
 * Days already recorded for that employee are skipped, so importing the same file
 * twice does not double anyone's hours.
 */
const schema = z.object({ branchId: z.string(), text: z.string().min(1).max(500_000) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], parsed.data.branchId);
  if ("error" in access) return access.error;

  const employees = await prisma.employee.findMany({ where: { branchId: access.branch.id, code: { not: null } } });
  const byCode = new Map(employees.map((e) => [e.code!, e]));

  const punches = new Map<string, Date[]>(); // employeeId|date -> times
  const unknownCodes = new Set<string>();
  let badLines = 0;
  for (const raw of parsed.data.text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^\s*"?(\d{1,8})"?\s*[,;\t ]\s*"?(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!m) {
      badLines++;
      continue;
    }
    const [, code, y, mo, d, h, mi, s] = m;
    const employee = byCode.get(code) ?? byCode.get(code.replace(/^0+/, ""));
    if (!employee) {
      unknownCodes.add(code);
      continue;
    }
    const at = new Date(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${mi}:${s ?? "00"}+03:00`);
    if (Number.isNaN(at.getTime())) {
      badLines++;
      continue;
    }
    const key = `${employee.id}|${localDate(at)}`;
    punches.set(key, [...(punches.get(key) ?? []), at]);
  }

  let created = 0;
  let skipped = 0;
  for (const [key, times] of punches) {
    const [employeeId, date] = key.split("|");
    times.sort((a, b) => a.getTime() - b.getTime());
    const clockIn = times[0];
    const clockOut = times.length > 1 && times[times.length - 1].getTime() - clockIn.getTime() >= 60_000 ? times[times.length - 1] : null;
    const dayStart = new Date(`${date}T00:00:00+03:00`);
    const exists = await prisma.attendanceRecord.findFirst({
      where: { employeeId, clockIn: { gte: dayStart, lt: new Date(dayStart.getTime() + 86_400_000) } },
    });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.attendanceRecord.create({ data: { employeeId, branchId: access.branch.id, clockIn, clockOut, source: "IMPORT" } });
    created++;
  }

  return NextResponse.json({ created, skipped, unknownCodes: [...unknownCodes], badLines });
}
