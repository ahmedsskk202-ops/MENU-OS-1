import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { employeeInReach, hrAccess, isDate, isTime } from "@/lib/hr";

function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** The work roster of a branch for the 7 days from `from`. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], sp.get("branchId"));
  if ("error" in access) return access.error;
  const from = isDate(sp.get("from")) ? sp.get("from")! : new Date().toISOString().slice(0, 10);
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  const shifts = await prisma.workShift.findMany({ where: { branchId: access.branch.id, date: { in: days } } });
  return NextResponse.json({ days, shifts });
}

const putSchema = z.object({
  employeeId: z.string(),
  date: z.string().refine(isDate),
  startTime: z.string().refine(isTime),
  endTime: z.string().refine(isTime),
  note: z.string().trim().max(100).optional().nullable(),
});

/** Sets (or replaces) one employee's shift on one day. */
export async function PUT(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const employee = await employeeInReach(auth.user, parsed.data.employeeId);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { employeeId, date, startTime, endTime, note } = parsed.data;
  const shift = await prisma.workShift.upsert({
    where: { employeeId_date: { employeeId, date } },
    create: { employeeId, branchId: employee.branchId, date, startTime, endTime, note: note ?? null },
    update: { startTime, endTime, note: note ?? null },
  });
  return NextResponse.json({ shift });
}

const deleteSchema = z.object({ employeeId: z.string(), date: z.string().refine(isDate) });

export async function DELETE(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const employee = await employeeInReach(auth.user, parsed.data.employeeId);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.workShift.deleteMany({ where: { employeeId: employee.id, date: parsed.data.date } });
  return NextResponse.json({ ok: true });
}

const copySchema = z.object({ branchId: z.string(), fromWeek: z.string().refine(isDate), toWeek: z.string().refine(isDate) });

/** Copies a whole week's roster onto another week — the usual "same as last week". */
export async function POST(req: NextRequest) {
  const parsed = copySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], parsed.data.branchId);
  if ("error" in access) return access.error;
  const source = await prisma.workShift.findMany({
    where: { branchId: access.branch.id, date: { in: Array.from({ length: 7 }, (_, i) => addDays(parsed.data.fromWeek, i)) } },
  });
  const offset = Math.round((Date.parse(parsed.data.toWeek) - Date.parse(parsed.data.fromWeek)) / 86_400_000);
  for (const s of source) {
    const date = addDays(s.date, offset);
    await prisma.workShift.upsert({
      where: { employeeId_date: { employeeId: s.employeeId, date } },
      create: { employeeId: s.employeeId, branchId: s.branchId, date, startTime: s.startTime, endTime: s.endTime, note: s.note },
      update: { startTime: s.startTime, endTime: s.endTime, note: s.note },
    });
  }
  return NextResponse.json({ copied: source.length });
}
