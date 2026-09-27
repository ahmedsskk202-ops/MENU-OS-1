import type { Prisma } from "@menu-os/db";
import { writeOutboxEvent } from "../outbox";
import { earnForOrder } from "../loyalty";
import { emitToBranch, emitToTableSession, emitToCustomerSession } from "../realtime";

type Tx = Prisma.TransactionClient;

/**
 * Closes the money side of an order that has been fully paid online ahead of time.
 *
 * A guest can pay online before the food is ready, but the order can't jump to PAID
 * then — the kitchen board and the waiter flow only know CREATED→…→DELIVERED→PAID, and a
 * PAID order in the middle of that would fall off both. So a verified online payment
 * leaves the order where it is, and the order becomes PAID at the same point a till
 * payment would settle it: once it has been DELIVERED. Called from both ends — when the
 * payment is verified (order already delivered) and when the order is delivered (payment
 * already verified) — so whichever happens second settles it, exactly once.
 *
 * Returns the settled order, or null if it isn't delivered yet or isn't fully paid.
 */
export async function settleIfFullyPaid(tx: Tx, orderId: string, changedById?: string | null) {
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { branch: { include: { brand: true } } } });
  if (!order || order.status !== "DELIVERED") return null;
  const verified = await tx.payment.aggregate({ where: { orderId, status: "VERIFIED" }, _sum: { amount: true } });
  if ((verified._sum.amount?.toNumber() ?? 0) < order.total.toNumber() - 0.01) return null;

  const paid = await tx.order.update({
    where: { id: orderId },
    data: { status: "PAID", statusEvents: { create: { fromStatus: order.status, toStatus: "PAID", changedById: changedById ?? null, note: "Paid online" } } },
  });
  await writeOutboxEvent(tx, {
    branchId: order.branchId,
    aggregateType: "Order",
    aggregateId: order.id,
    eventType: "order.status_changed",
    payload: {
      tenantId: order.branch.brand.tenantId,
      type: paid.type,
      status: paid.status,
      subtotal: paid.subtotal.toNumber(),
      discountTotal: paid.discountTotal.toNumber(),
      taxTotal: paid.taxTotal.toNumber(),
      serviceFeeTotal: paid.serviceFeeTotal.toNumber(),
      total: paid.total.toNumber(),
      currency: paid.currency,
      createdAt: paid.createdAt.toISOString(),
    },
  });
  await earnForOrder(tx, order.id);
  return paid;
}

/** Tells every screen watching this order that it is now PAID (call after the transaction commits). */
export function broadcastPaid(order: { id: string; branchId: string; tableSessionId: string | null; customerSessionId: string | null }) {
  const event = { type: "order.status_changed" as const, branchId: order.branchId, orderId: order.id, status: "PAID", tableSessionId: order.tableSessionId };
  emitToBranch(order.branchId, event);
  if (order.tableSessionId) emitToTableSession(order.tableSessionId, event);
  if (order.customerSessionId) emitToCustomerSession(order.customerSessionId, event);
}
