import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { employeeInReach, hrAccess, isDate, localDate } from "@/lib/hr";

/** Daily notes of a branch: one day, or one employee's whole history. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], sp.get("branchId"));
  if ("error" in access) return access.error;
  const employeeId = sp.get("employeeId");
  const date = isDate(sp.get("date")) ? sp.get("date")! : null;
  const notes = await prisma.employeeNote.findMany({
    where: {
      employee: { branchId: access.branch.id },
      ...(employeeId ? { employeeId } : {}),
      ...(date ? { date } : {}),
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { employee: { select: { id: true, name: true } }, author: { select: { name: true } } },
    take: 500,
  });
  return NextResponse.json({ notes: notes.map((n) => ({ id: n.id, date: n.date, kind: n.kind, text: n.text, employee: n.employee, author: n.author?.name ?? null, createdAt: n.createdAt })) });
}

const schema = z.object({
  employeeId: z.string(),
  date: z.string().refine(isDate).optional(),
  kind: z.enum(["NOTE", "PRAISE", "WARNING", "TASK"]).default("NOTE"),
  text: z.string().trim().min(1).max(1000),
});

export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const employee = await employeeInReach(auth.user, parsed.data.employeeId);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const note = await prisma.employeeNote.create({
    data: { employeeId: employee.id, date: parsed.data.date ?? localDate(), kind: parsed.data.kind, text: parsed.data.text, authorId: auth.user.id },
  });
  return NextResponse.json({ note }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const id = req.nextUrl.searchParams.get("id");
  const note = id ? await prisma.employeeNote.findUnique({ where: { id } }) : null;
  if (!note || !(await employeeInReach(auth.user, note.employeeId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.employeeNote.delete({ where: { id: note.id } });
  return NextResponse.json({ ok: true });
}
