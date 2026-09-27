import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { employeeInReach } from "@/lib/hr";

const schema = z.object({
  clockIn: z.string().optional(),
  clockOut: z.string().optional().nullable(),
  note: z.string().trim().max(200).optional().nullable(),
});

async function load(userId: Parameters<typeof employeeInReach>[0], id: string) {
  const record = await prisma.attendanceRecord.findUnique({ where: { id } });
  if (!record) return null;
  return (await employeeInReach(userId, record.employeeId)) ? record : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const record = await load(auth.user, params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const clockIn = parsed.data.clockIn ? new Date(parsed.data.clockIn) : record.clockIn;
  const clockOut = parsed.data.clockOut === undefined ? record.clockOut : parsed.data.clockOut ? new Date(parsed.data.clockOut) : null;
  if (Number.isNaN(clockIn.getTime()) || (clockOut && (Number.isNaN(clockOut.getTime()) || clockOut <= clockIn))) {
    return NextResponse.json({ error: "bad_times" }, { status: 400 });
  }
  const updated = await prisma.attendanceRecord.update({
    where: { id: record.id },
    data: { clockIn, clockOut, note: parsed.data.note === undefined ? undefined : parsed.data.note, source: "MANUAL" },
  });
  return NextResponse.json({ record: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const record = await load(auth.user, params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.attendanceRecord.delete({ where: { id: record.id } });
  return NextResponse.json({ ok: true });
}
