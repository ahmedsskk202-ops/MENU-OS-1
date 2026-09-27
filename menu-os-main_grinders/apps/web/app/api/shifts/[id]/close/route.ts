import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { writeAuditLog } from "@/lib/audit";
import { emitToBranch } from "@/lib/realtime";
import { computeExpectedCash, computeVariance } from "@/lib/shifts";
import { checkBranchAccess } from "@/lib/branch-access";

const bodySchema = z.object({ actualCash: z.number().nonnegative(), varianceReason: z.string().max(500).optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.SHIFTS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const shift = await prisma.shift.findUnique({ where: { id: params.id }, include: { branch: { include: { brand: true } } } });
  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, shift.branchId);
  if (denied) return denied;
  if (shift.status !== "OPEN") return NextResponse.json({ error: "Shift is already closed" }, { status: 409 });

  const [cashSalesAgg, cashMovements, cashRefundsAgg] = await Promise.all([
    prisma.payment.aggregate({
      where: { shiftId: shift.id, method: "CASH", status: "VERIFIED" },
      _sum: { amount: true },
    }),
    prisma.cashMovement.findMany({ where: { shiftId: shift.id } }),
    prisma.refund.aggregate({
      where: { status: "COMPLETED", payment: { shiftId: shift.id, method: "CASH" } },
      _sum: { amount: true },
    }),
  ]);

  const cashIn = cashMovements.filter((m) => m.type === "CASH_IN").reduce((s, m) => s + m.amount.toNumber(), 0);
  const cashOut = cashMovements.filter((m) => m.type === "CASH_OUT").reduce((s, m) => s + m.amount.toNumber(), 0);
  const cashSales = cashSalesAgg._sum.amount?.toNumber() ?? 0;
  const cashRefunds = cashRefundsAgg._sum.amount?.toNumber() ?? 0;

  const expectedCash = computeExpectedCash({ openingCash: shift.openingCash.toNumber(), cashSales, cashIn, cashOut, cashRefunds });
  const variance = computeVariance(parsed.data.actualCash, expectedCash);

  if (Math.abs(variance) > 0.01 && !parsed.data.varianceReason) {
    return NextResponse.json({ error: "A variance reason is required when counted cash doesn't match expected cash", expectedCash, variance }, { status: 422 });
  }

  const closed = await prisma.$transaction(async (tx) => {
    const updated = await tx.shift.update({
      where: { id: shift.id },
      data: {
        status: "CLOSED",
        closedById: user.id,
        closedAt: new Date(),
        expectedCash,
        actualCash: parsed.data.actualCash,
        variance,
        varianceReason: parsed.data.varianceReason,
      },
    });

    await writeOutboxEvent(tx, {
      branchId: shift.branchId,
      aggregateType: "Shift",
      aggregateId: shift.id,
      eventType: "shift.closed",
      payload: {
        status: updated.status,
        openedAt: shift.openedAt.toISOString(),
        closedAt: updated.closedAt!.toISOString(),
        openingCash: updated.openingCash.toNumber(),
        expectedCash,
        actualCash: parsed.data.actualCash,
        variance,
        varianceReason: parsed.data.varianceReason ?? null,
      },
    });

    await writeAuditLog(tx, {
      tenantId: shift.branch.brand.tenantId,
      branchId: shift.branchId,
      userId: user.id,
      shiftId: shift.id,
      action: "shift.closed",
      entityType: "Shift",
      entityId: shift.id,
      before: { status: "OPEN" },
      after: { status: "CLOSED", expectedCash, actualCash: parsed.data.actualCash, variance, varianceReason: parsed.data.varianceReason ?? null },
    });

    return updated;
  });

  emitToBranch(shift.branchId, { type: "shift.updated", branchId: shift.branchId, shift: closed });

  return NextResponse.json({ shift: closed, breakdown: { openingCash: shift.openingCash.toNumber(), cashSales, cashIn, cashOut, cashRefunds, expectedCash, variance } });
}
