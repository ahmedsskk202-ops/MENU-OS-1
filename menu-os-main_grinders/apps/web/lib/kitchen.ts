import { prisma } from "./db";
import { emitToBranch, emitToCustomerSession, emitToTableSession } from "./realtime";
import { writeOutboxEvent } from "./outbox";
import { notify } from "./notifications";

const KITCHEN_FLOW: Record<string, string[]> = {
  NEW: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["COMPLETED"],
};

export async function updateKitchenOrderStatus(kitchenOrderId: string, toStatus: string) {
  const kitchenOrder = await prisma.kitchenOrder.findUniqueOrThrow({
    where: { id: kitchenOrderId },
    include: { order: { include: { kitchenOrders: true } } },
  });

  if (!KITCHEN_FLOW[kitchenOrder.status]?.includes(toStatus)) {
    throw new Error(`Kitchen ticket cannot move from ${kitchenOrder.status} to ${toStatus}`);
  }

  const now = new Date();
  const timestampField =
    toStatus === "PREPARING" ? "startedAt" : toStatus === "READY" ? "readyAt" : "completedAt";

  const updated = await prisma.kitchenOrder.update({
    where: { id: kitchenOrderId },
    data: {
      status: toStatus as never,
      [timestampField]: now,
      items: { updateMany: { where: {}, data: { status: toStatus as never } } },
    },
    include: { station: true },
  });

  emitToBranch(kitchenOrder.order.branchId, {
    type: "kitchen_order.updated",
    branchId: kitchenOrder.order.branchId,
    kitchenOrder: updated,
  });

  // Propagate to the parent order's customer-facing status.
  //
  // The order is promoted once EVERY station has reached the stage, never on the
  // first one to get there. A four-item order on Grill and Dessert whose starter is
  // already on the pass is not "ready" because the grill said so — and a guest whose
  // app says "ready" while their dessert is still raw is worse than one waiting a
  // minute longer. The READY check already worked this way; this makes PREPARING
  // symmetric with it, which is what lets a station-filtered board be correct.
  const order = kitchenOrder.order;
  if (toStatus === "PREPARING" || toStatus === "READY") {
    const siblings = await prisma.kitchenOrder.findMany({ where: { orderId: order.id }, select: { id: true, status: true } });
    const allOtherTicketsDone = (allowed: string[]) =>
      siblings.every((k) => (k.id === kitchenOrderId ? true : allowed.includes(k.status)));

    if (toStatus === "PREPARING" && order.status === "CONFIRMED" && allOtherTicketsDone(["PREPARING", "READY", "COMPLETED"])) {
      await cascadeOrderStatus(order.id, order.branchId, order.tableSessionId, "PREPARING");
    }

    if (toStatus === "READY" && order.status !== "READY" && allOtherTicketsDone(["READY", "COMPLETED"])) {
      await cascadeOrderStatus(order.id, order.branchId, order.tableSessionId, "READY");
    }
  }

  return updated;
}

/**
 * Moves the whole order forward because its kitchen tickets all reached a stage.
 *
 * This is also where the "Order ready — Table 12" notification is raised, and the
 * table number is the reason it reads the way it does. A waiter standing at the
 * pass needs to know *which table* to walk to; "Order 4F2A91 is ready" is a fact the
 * notification system can store and nobody can act on. It is raised here rather than
 * in the board's button handler because every route to READY — the board, the raw
 * station ticket endpoint, a future tablet — passes through this function, and a
 * notification that only fires on one of them is a notification that lies.
 */
async function cascadeOrderStatus(orderId: string, branchId: string, tableSessionId: string | null, status: string) {
  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: branchId }, include: { brand: true } });
  const from = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { status: true, customerSessionId: true } });

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.order.update({
      where: { id: orderId },
      // The status event is written here as well as in `updateOrderStatus`, because the
      // kitchen board is now the main way an order moves and the board reaches this
      // function rather than that one. Without it the order's history reads
      // CREATED → CONFIRMED → CLOSED, skipping the two hours the guest was actually
      // waiting, and `getWaiterFloor`'s "how long has this been on the pass" has no
      // event to read. `changedById` is left unset on purpose: nobody at the pass
      // pressed a button about the order, its tickets did.
      data: {
        status: status as never,
        statusEvents: { create: { fromStatus: from.status, toStatus: status as never } },
      },
    });
    await writeOutboxEvent(tx, {
      branchId,
      aggregateType: "Order",
      aggregateId: orderId,
      eventType: "order.status_changed",
      payload: {
        tenantId: branch.brand.tenantId,
        type: u.type,
        status: u.status,
        subtotal: u.subtotal.toNumber(),
        discountTotal: u.discountTotal.toNumber(),
        taxTotal: u.taxTotal.toNumber(),
        serviceFeeTotal: u.serviceFeeTotal.toNumber(),
        total: u.total.toNumber(),
        currency: u.currency,
        createdAt: u.createdAt.toISOString(),
      },
    });
    return u;
  });

  broadcastOrderStatus(orderId, branchId, tableSessionId, from.customerSessionId, status);

  if (status === "READY") {
    // One extra read for the label. Only on this one status, and only to make the
    // notification say the one word its reader needs.
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { tableSession: { include: { table: { select: { label: true } } } } },
    });
    const tableLabel = order?.tableSession?.table.label;
    await notify(prisma, {
      tenantId: branch.brand.tenantId,
      branchId,
      type: "ORDER_READY",
      title: tableLabel ? `Order ready — Table ${tableLabel}` : "Order ready",
      body: tableLabel ? `Table ${tableLabel}'s order is plated and waiting on the pass` : "An order is plated and waiting on the pass",
      data: { orderId, tableSessionId, tableLabel: tableLabel ?? null },
    });
  }

  return updated;
}

function broadcastOrderStatus(orderId: string, branchId: string, tableSessionId: string | null, customerSessionId: string | null, status: string) {
  emitToBranch(branchId, { type: "order.status_changed", branchId, orderId, status, tableSessionId });
  if (tableSessionId) {
    emitToTableSession(tableSessionId, { type: "order.status_changed", branchId, orderId, status, tableSessionId });
  }
  if (customerSessionId) {
    emitToCustomerSession(customerSessionId, { type: "order.status_changed", branchId, orderId, status, tableSessionId });
  }
}
