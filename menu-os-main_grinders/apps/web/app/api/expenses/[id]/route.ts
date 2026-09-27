import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/api-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { checkBranchAccess } from "@/lib/branch-access";
import { writeAuditLog } from "@/lib/audit";

/** Removes a mistaken expense. A paid salary is undone from Payroll instead. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(PERMISSIONS.EXPENSES_MANAGE);
  if (auth.error) return auth.error;
  const expense = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const denied = await checkBranchAccess(auth.user, expense.branchId);
  if (denied) return denied;
  if (await prisma.payrollPayment.findFirst({ where: { expenseId: expense.id } })) {
    return NextResponse.json({ error: "payroll_expense" }, { status: 409 });
  }
  // A cashier may remove what they recorded; anything else needs a manager.
  if (expense.recordedById !== auth.user.id && !auth.user.permissions.includes(PERMISSIONS.REPORTS_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.$transaction(async (tx) => {
    await tx.expense.delete({ where: { id: expense.id } });
    await writeAuditLog(tx, {
      tenantId: auth.user.tenantId,
      branchId: expense.branchId,
      userId: auth.user.id,
      action: "expense.deleted",
      entityType: "Expense",
      entityId: expense.id,
      before: { category: expense.category, amount: expense.amount.toNumber(), description: expense.description },
    });
  });
  return NextResponse.json({ ok: true });
}
