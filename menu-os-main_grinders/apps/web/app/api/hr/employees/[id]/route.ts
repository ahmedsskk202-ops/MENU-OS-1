import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { employeeInReach } from "@/lib/hr";

const patchSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  jobTitle: z.string().trim().max(60).optional().nullable(),
  code: z.string().trim().regex(/^\d{3,8}$/).optional().nullable(),
  salaryType: z.enum(["MONTHLY", "DAILY", "HOURLY"]).optional(),
  salaryAmount: z.number().min(0).optional(),
  hireDate: z.string().optional(),
  userId: z.string().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", details: parsed.error.flatten() }, { status: 400 });
  const employee = await employeeInReach(auth.user, params.id);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { hireDate, ...data } = parsed.data;
  if (data.code && data.code !== employee.code && (await prisma.employee.findFirst({ where: { tenantId: employee.tenantId, code: data.code } }))) {
    return NextResponse.json({ error: "code_taken" }, { status: 409 });
  }
  if (data.userId && data.userId !== employee.userId) {
    const u = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!u || u.tenantId !== employee.tenantId) return NextResponse.json({ error: "unknown_user" }, { status: 400 });
    if (await prisma.employee.findUnique({ where: { userId: data.userId } })) return NextResponse.json({ error: "user_linked" }, { status: 409 });
  }
  const updated = await prisma.employee.update({ where: { id: employee.id }, data: { ...data, hireDate: hireDate ? new Date(hireDate) : undefined } });
  return NextResponse.json({ employee: updated });
}
