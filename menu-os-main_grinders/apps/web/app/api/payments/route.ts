import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { emitToBranch, emitToTableSession, emitToCustomerSession } from "@/lib/realtime";
import { writeOutboxEvent } from "@/lib/outbox";
import { checkBranchAccess } from "@/lib/branch-access";
import { earnForOrder } from "@/lib/loyalty";

const bodySchema = z.object({
  orderId: z.string(),
  method: z.enum(["CASH", "CARD", "ONLINE", "WALLET"]),
  // nonnegative, not positive: an order that's entirely comped by a promotion (e.g. a
  // single FREE_ITEM order) legitimately totals 0 and still needs to be marked paid.
  amount: z.number().nonnegative(),
  tipAmount: z.number().nonnegative().optional(),
});

// Payment success is always decided server-side by staff verification — never by the
// customer's browser (spec §15). Cash is verified immediately by the staff member
// recording it; card/online/wallet stay PENDING until a gateway or manager confirms them.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.PAYMENTS_MANAGE)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { payments: true, branch: { include: { brand: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const denied = await checkBranchAccess(user, order.branchId);
  if (denied) return denied;

  const alreadyPaid = order.payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + p.amount.toNumber(), 0);
  const remaining = order.total.toNumber() - alreadyPaid;
  const isPartial = parsed.data.amount < remaining - 0.01;
  const tenantId = order.branch.brand.tenantId;

  // Cash (and, in principle, card settled at the till) reconciles against whichever
  // shift is currently open for this staff member at this branch — if none is open,
  // the payment simply isn't shift-attributed (older behavior, unaffected).
  const openShift =
    parsed.data.method === "CASH"
      ? await prisma.shift.findFirst({ where: { branchId: order.branchId, status: "OPEN" }, orderBy: { openedAt: "desc" } })
      : null;

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        orderId: order.id,
        method: parsed.data.method,
        amount: parsed.data.amount,
        tipAmount: parsed.data.tipAmount ?? 0,
        isPartial,
        status: parsed.data.method === "CASH" ? "VERIFIED" : "PENDING",
        verifiedById: parsed.data.method === "CASH" ? user.id : null,
        shiftId: openShift?.id,
      },
    });

    await writeOutboxEvent(tx, {
      branchId: order.branchId,
      aggregateType: "Payment",
      aggregateId: created.id,
      eventType: "payment.recorded",
      payload: {
        orderId: order.id,
        method: created.method,
        amount: created.amount.toNumber(),
        currency: created.currency,
        status: created.status,
      },
    });

    if (created.status === "VERIFIED" && !isPartial) {
      const paidOrder = await tx.order.update({
        where: { id: order.id },
        // The status event is written here as well as in `updateOrderStatus`. Settling
        // the bill is the transition that closes a table, so leaving it out of the
        // history makes an order read as if it jumped from "served" to "closed" and
        // nobody ever paid for it — which is exactly the question a manager opens the
        // order screen to answer. Attributed to whoever took the money.
        data: {
          status: "PAID",
          statusEvents: { create: { fromStatus: order.status, toStatus: "PAID", changedById: user.id } },
        },
      });
      await writeOutboxEvent(tx, {
        branchId: order.branchId,
        aggregateType: "Order",
        aggregateId: order.id,
        eventType: "order.status_changed",
        payload: {
          tenantId,
          type: paidOrder.type,
          status: paidOrder.status,
          subtotal: paidOrder.subtotal.toNumber(),
          discountTotal: paidOrder.discountTotal.toNumber(),
          taxTotal: paidOrder.taxTotal.toNumber(),
          serviceFeeTotal: paidOrder.serviceFeeTotal.toNumber(),
          total: paidOrder.total.toNumber(),
          currency: paidOrder.currency,
          createdAt: paidOrder.createdAt.toISOString(),
        },
      });
      // A loyalty member's points are earned in the same transaction that marks the
      // order paid — once per order, whatever happens to the payment afterwards.
      await earnForOrder(tx, order.id);
    }

    return created;
  });

  const orderStatusForRealtime = order.status === "PAID" || order.payments.some((p) => p.status === "VERIFIED" && p.amount.toNumber() >= order.total.toNumber() - 0.01)
    ? "PAID"
    : order.status;

  emitToBranch(order.branchId, { type: "payment.updated", branchId: order.branchId, orderId: order.id, payment });
  if (orderStatusForRealtime !== order.status || order.status === "PAID") {
    emitToBranch(order.branchId, {
      type: "order.status_changed",
      branchId: order.branchId,
      orderId: order.id,
      status: "PAID",
      tableSessionId: order.tableSessionId,
    });
  }
  if (order.tableSessionId) {
    emitToTableSession(order.tableSessionId, {
      type: "payment.updated",
      branchId: order.branchId,
      orderId: order.id,
      payment,
    });
    if (orderStatusForRealtime !== order.status || order.status === "PAID") {
      emitToTableSession(order.tableSessionId, {
        type: "order.status_changed",
        branchId: order.branchId,
        orderId: order.id,
        status: "PAID",
        tableSessionId: order.tableSessionId,
      });
    }
  }
  if (order.customerSessionId) {
    emitToCustomerSession(order.customerSessionId, {
      type: "payment.updated",
      branchId: order.branchId,
      orderId: order.id,
      payment,
    });
    if (orderStatusForRealtime !== order.status || order.status === "PAID") {
      emitToCustomerSession(order.customerSessionId, {
        type: "order.status_changed",
        branchId: order.branchId,
        orderId: order.id,
        status: "PAID",
        tableSessionId: order.tableSessionId,
      });
    }
  }

  return NextResponse.json({ payment }, { status: 201 });
}
