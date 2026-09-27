import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { writeOutboxEvent } from "@/lib/outbox";
import { writeAuditLog } from "@/lib/audit";
import { emitToBranch, emitToTableSession } from "@/lib/realtime";
import { checkBranchAccess } from "@/lib/branch-access";
import { STAFF_PAYMENT_SELECT } from "@/lib/payments/service";

const bodySchema = z.object({ paymentId: z.string(), amount: z.number().positive(), reason: z.string().min(1).max(500) });

// There was no refund endpoint at all before this — Refund/RefundStatus were modeled
// in the schema (spec §15) but nothing ever created one. This is that missing path.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.REFUNDS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: { refunds: true, order: { include: { branch: { include: { brand: true } }, payments: { include: { refunds: true } } } } },
  });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (payment.status !== "VERIFIED" && payment.status !== "PARTIALLY_REFUNDED") {
    return NextResponse.json({ error: "Only a verified payment can be refunded" }, { status: 422 });
  }

  const alreadyRefunded = payment.refunds.filter((r) => r.status === "COMPLETED").reduce((s, r) => s + r.amount.toNumber(), 0);
  const refundable = payment.amount.toNumber() - alreadyRefunded;
  if (parsed.data.amount > refundable + 0.01) {
    return NextResponse.json({ error: `Cannot refund more than ${refundable} (already refunded ${alreadyRefunded})` }, { status: 422 });
  }

  const order = payment.order;
  const denied = await checkBranchAccess(user, order.branchId);
  if (denied) return denied;
  const tenantId = order.branch.brand.tenantId;
  const isFullPaymentRefund = parsed.data.amount >= refundable - 0.01;

  // Whether this refund closes out the whole order depends on every payment on the
  // order, not just this one — an order can have more than one payment (split bill).
  const totalPaidAcrossOrder = order.payments.filter((p) => p.status === "VERIFIED" || p.status === "PARTIALLY_REFUNDED").reduce((s, p) => s + p.amount.toNumber(), 0);
  const totalRefundedAcrossOrder =
    order.payments.flatMap((p) => p.refunds).filter((r) => r.status === "COMPLETED").reduce((s, r) => s + r.amount.toNumber(), 0) + parsed.data.amount;
  const isFullOrderRefund = totalRefundedAcrossOrder >= totalPaidAcrossOrder - 0.01;

  const result = await prisma.$transaction(async (tx) => {
    const refund = await tx.refund.create({
      data: { paymentId: payment.id, amount: parsed.data.amount, reason: parsed.data.reason, status: "COMPLETED", processedById: user.id },
    });

    const newPaymentStatus = isFullPaymentRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";
    await tx.payment.update({ where: { id: payment.id }, data: { status: newPaymentStatus } });

    const newOrderStatus = isFullOrderRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";
    const updatedOrder = await tx.order.update({ where: { id: order.id }, data: { status: newOrderStatus } });

    await writeOutboxEvent(tx, {
      branchId: order.branchId,
      aggregateType: "Refund",
      aggregateId: refund.id,
      eventType: "refund.created",
      payload: { paymentId: payment.id, amount: refund.amount.toNumber(), status: refund.status },
    });

    await writeOutboxEvent(tx, {
      branchId: order.branchId,
      aggregateType: "Order",
      aggregateId: order.id,
      eventType: "order.status_changed",
      payload: {
        tenantId,
        type: updatedOrder.type,
        status: updatedOrder.status,
        subtotal: updatedOrder.subtotal.toNumber(),
        discountTotal: updatedOrder.discountTotal.toNumber(),
        taxTotal: updatedOrder.taxTotal.toNumber(),
        serviceFeeTotal: updatedOrder.serviceFeeTotal.toNumber(),
        total: updatedOrder.total.toNumber(),
        currency: updatedOrder.currency,
        createdAt: updatedOrder.createdAt.toISOString(),
      },
    });

    await writeAuditLog(tx, {
      tenantId,
      branchId: order.branchId,
      userId: user.id,
      shiftId: payment.shiftId ?? undefined,
      action: "refund.created",
      entityType: "Refund",
      entityId: refund.id,
      before: { orderStatus: order.status, paymentStatus: payment.status },
      after: { orderStatus: newOrderStatus, paymentStatus: newPaymentStatus, amount: refund.amount.toNumber(), reason: refund.reason },
    });

    return { refund, order: updatedOrder };
  });

  emitToBranch(order.branchId, { type: "refund.created", branchId: order.branchId, orderId: order.id, refund: result.refund });
  if (order.tableSessionId) {
    emitToTableSession(order.tableSessionId, { type: "order.status_changed", branchId: order.branchId, orderId: order.id, status: result.order.status, tableSessionId: order.tableSessionId });
  }

  return NextResponse.json({ refund: result.refund, order: result.order }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.REFUNDS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;

  const refunds = await prisma.refund.findMany({
    where: { payment: { order: { branchId } } },
    orderBy: { createdAt: "desc" },
    // Who processed it, by name — never the whole staff row (password hash, email).
    include: { payment: { select: { ...STAFF_PAYMENT_SELECT, order: true } }, processedBy: { select: { id: true, name: true } } },
    take: 200,
  });

  return NextResponse.json({ refunds });
}
