import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { employeeInReach, hrAccess, isPeriod, localPeriod, payrollFor } from "@/lib/hr";
import { writeAuditLog } from "@/lib/audit";

/** The month's payroll for a branch. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const access = await hrAccess([PERMISSIONS.HR_MANAGE], sp.get("branchId"));
  if ("error" in access) return access.error;
  const period = isPeriod(sp.get("period")) ? sp.get("period")! : localPeriod();
  const rows = await payrollFor(access.branch.id, period);
  return NextResponse.json({
    period,
    currency: access.branch.brand.currency,
    rows,
    totals: {
      net: rows.reduce((s, r) => s + r.net, 0),
      paid: rows.reduce((s, r) => s + (r.paid?.net ?? 0), 0),
      unpaid: rows.filter((r) => !r.paid).reduce((s, r) => s + r.net, 0),
    },
  });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("adjust"),
    employeeId: z.string(),
    period: z.string().refine(isPeriod),
    type: z.enum(["BONUS", "DEDUCTION", "ADVANCE"]),
    amount: z.number().positive(),
    note: z.string().trim().max(200).optional(),
  }),
  z.object({ action: z.literal("removeAdjustment"), id: z.string() }),
  z.object({ action: z.literal("pay"), employeeId: z.string(), period: z.string().refine(isPeriod), note: z.string().trim().max(200).optional() }),
  z.object({ action: z.literal("unpay"), employeeId: z.string(), period: z.string().refine(isPeriod) }),
]);

/**
 * Bonus / deduction / advance, and marking a month paid. Paying records the net as an
 * Expense ("Salaries") of the employee's branch, so wages show up in the expense and
 * profit reports without being typed twice; un-paying removes that expense again.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticate(PERMISSIONS.HR_MANAGE);
  if (auth.error) return auth.error;
  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const body = parsed.data;
  const user = auth.user;

  if (body.action === "removeAdjustment") {
    const adj = await prisma.payrollAdjustment.findUnique({ where: { id: body.id } });
    if (!adj || !(await employeeInReach(user, adj.employeeId))) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (await prisma.payrollPayment.findUnique({ where: { employeeId_period: { employeeId: adj.employeeId, period: adj.period } } })) {
      return NextResponse.json({ error: "already_paid" }, { status: 409 });
    }
    await prisma.payrollAdjustment.delete({ where: { id: adj.id } });
    return NextResponse.json({ ok: true });
  }

  const employee = await employeeInReach(user, body.employeeId);
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const paid = await prisma.payrollPayment.findUnique({ where: { employeeId_period: { employeeId: employee.id, period: body.period } } });

  if (body.action === "adjust") {
    if (paid) return NextResponse.json({ error: "already_paid" }, { status: 409 });
    const adjustment = await prisma.payrollAdjustment.create({
      data: { employeeId: employee.id, period: body.period, type: body.type, amount: body.amount, note: body.note ?? null, createdById: user.id },
    });
    return NextResponse.json({ adjustment }, { status: 201 });
  }

  if (body.action === "unpay") {
    if (!paid) return NextResponse.json({ error: "not_paid" }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      if (paid.expenseId) await tx.expense.deleteMany({ where: { id: paid.expenseId } });
      await tx.payrollPayment.delete({ where: { id: paid.id } });
      await writeAuditLog(tx, { tenantId: user.tenantId, branchId: employee.branchId, userId: user.id, action: "payroll.unpaid", entityType: "Employee", entityId: employee.id, before: { period: body.period, net: paid.net.toNumber() } });
    });
    return NextResponse.json({ ok: true });
  }

  // pay
  if (paid) return NextResponse.json({ error: "already_paid" }, { status: 409 });
  const [row] = await payrollFor(employee.branchId, body.period, employee.id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.net < 0) return NextResponse.json({ error: "negative_net" }, { status: 400 });
  const payment = await prisma.$transaction(async (tx) => {
    const expense =
      row.net > 0
        ? await tx.expense.create({
            data: {
              branchId: employee.branchId,
              category: "Salaries",
              amount: row.net,
              description: `${employee.name} — ${body.period}${body.note ? ` — ${body.note}` : ""}`,
              recordedById: user.id,
            },
          })
        : null;
    const created = await tx.payrollPayment.create({
      data: {
        employeeId: employee.id,
        period: body.period,
        base: row.base,
        bonuses: row.bonuses,
        deductions: row.deductions,
        advances: row.advances,
        net: row.net,
        expenseId: expense?.id ?? null,
        note: body.note ?? null,
        paidById: user.id,
      },
    });
    await writeAuditLog(tx, {
      tenantId: user.tenantId,
      branchId: employee.branchId,
      userId: user.id,
      action: "payroll.paid",
      entityType: "Employee",
      entityId: employee.id,
      after: { period: body.period, base: row.base, bonuses: row.bonuses, deductions: row.deductions, advances: row.advances, net: row.net },
    });
    return created;
  });
  return NextResponse.json({ payment }, { status: 201 });
}
