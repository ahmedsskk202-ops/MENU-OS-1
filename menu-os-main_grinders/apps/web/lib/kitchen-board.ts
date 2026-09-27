import { prisma } from "./db";
import { emitToBranch } from "./realtime";
import { updateOrderStatus } from "./orders";
import { updateKitchenOrderStatus } from "./kitchen";

/**
 * THE KITCHEN BOARD MODEL.
 *
 * A cafe kitchen does not think in order ids or in station ticket numbers. It thinks
 * "table 8 is next" and "table 5 has been on the pass too long". So this board is
 * built the other way round from the old per-station ticket list:
 *
 *   the COLUMN is the order's status   (new → queued → cooking → ready to hand over)
 *   the CARD  is one order
 *   the card leads with the TABLE NUMBER
 *   the card has exactly ONE button, the next thing that has to happen to it
 *
 * Both halves of that are why this is a separate module rather than a view tweak: the
 * ordering of the columns, the wording of the single button, and the fact that
 * pressing it advances the *order* together with *all* of its station tickets, are the
 * actual behaviour. Everything else — station routing, ticket timestamps, the
 * audit/outbox trail, the guest's realtime feed — is the existing machinery, reused.
 */

/** One column of the board. */
export interface BoardSection {
  /** Column key (and the order status it is named after). */
  status: string;
  /** Order statuses whose cards sit in this column. */
  orderStatuses: string[];
  /** A card is in this column if it has at least one station ticket in one of these. */
  visibleTicketStatuses: string[];
  /** What the card's one button does. */
  action: "markReady" | "handOver";
}

/**
 * Two working columns, no approvals. An order is received automatically when it is
 * placed, so the kitchen's only decision is "ready": one press moves every ticket
 * (or the filtered station's tickets) straight to ready. Orders still in the older
 * CREATED/PREPARING states (placed before this change, or advanced from the Orders
 * screen) sit in the same "received" column and take the same one press.
 */
export const BOARD_SECTIONS: BoardSection[] = [
  { status: "CONFIRMED", orderStatuses: ["CREATED", "CONFIRMED", "PREPARING"], visibleTicketStatuses: ["NEW", "PREPARING"], action: "markReady" },
  // Plated. The button closes the kitchen's tickets; the order stays READY and leaves
  // this board, which is what moves it onto the waiter's "Ready to serve".
  { status: "READY", orderStatuses: ["READY"], visibleTicketStatuses: ["READY", "COMPLETED"], action: "handOver" },
  // Paid while still on the pass — kept visible so the lifecycle reads complete.
  { status: "PAID", orderStatuses: ["PAID"], visibleTicketStatuses: ["COMPLETED"], action: "handOver" },
];

/** The one button on a card, named for the kitchen's own vocabulary. */
export const SECTION_ACTION: Record<string, "markReady" | "handOver"> = {
  CREATED: "markReady",
  CONFIRMED: "markReady",
  PREPARING: "markReady",
  READY: "handOver",
  PAID: "handOver",
};

/** An order older than this is called out on the card. A cafe burger is not a 40-minute job. */
export const DELAYED_AFTER_MINUTES = 12;

export interface BoardCard {
  orderId: string;
  /** Short human reference, printed on the slip — the last 6 of the id, uppercased. */
  orderRef: string;
  status: string;
  /** null for pickup/delivery, which have no table. */
  tableLabel: string | null;
  orderType: string;
  placedAt: string;
  minutesWaiting: number;
  delayed: boolean;
  note: string | null;
  stations: Array<{ id: string; stationId: string; stationName: string; status: string }>;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    notes: string | null;
    modifiers: string[];
  }>;
}

/**
 * The whole board for one branch, in four queries.
 *
 * Deliberately not N+1: this is the screen the kitchen stares at all day, and a query
 * per card per station per item would make the one screen that must never feel laggy
 * the slowest one. Orders carry their tickets and items; station routing for the
 * visible items is resolved in one extra query.
 */
export async function getKitchenBoard(params: { branchId: string; stationId?: string | null }): Promise<{
  sections: Array<{ status: string; cards: BoardCard[] }>;
  stations: Array<{ id: string; name: string }>;
}> {
  const { branchId, stationId } = params;

  const stations = await prisma.kitchenStation.findMany({ where: { branchId }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } });

  const orders = await prisma.order.findMany({
    where: {
      branchId,
      // Only the four kitchen-owned statuses. Also keeps this the cheapest of the
      // order queries on the busiest screen in the building.
      status: { in: BOARD_SECTIONS.flatMap((s) => s.orderStatuses) },
      ...(stationId ? { kitchenOrders: { some: { stationId } } } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: {
      tableSession: { include: { table: { select: { label: true } } } },
      kitchenOrders: { include: { station: { select: { id: true, name: true } } } },
      items: { include: { modifiers: { select: { nameSnapshot: true } } } },
    },
  });

  // Which station makes which product, resolved once for every visible item. This is
  // what lets the station filter show "what is MY station making" rather than just
  // "which orders happen to involve my station somewhere".
  const routes = await prisma.productStation.findMany({
    where: { productId: { in: orders.flatMap((o) => o.items.map((i) => i.productId)) } },
    select: { productId: true, stationId: true },
  });
  const stationsByProduct = new Map<string, string[]>();
  for (const r of routes) {
    const list = stationsByProduct.get(r.productId) ?? [];
    list.push(r.stationId);
    stationsByProduct.set(r.productId, list);
  }

  const now = Date.now();
  const cards: BoardCard[] = orders.map((o) => {
    const minutesWaiting = Math.max(0, Math.floor((now - o.createdAt.getTime()) / 60_000));
    return {
      orderId: o.id,
      orderRef: o.id.slice(-6).toUpperCase(),
      status: o.status,
      tableLabel: o.tableSession?.table.label ?? null,
      orderType: o.type,
      placedAt: o.createdAt.toISOString(),
      minutesWaiting,
      delayed: minutesWaiting >= DELAYED_AFTER_MINUTES,
      note: o.notes,
      stations: o.kitchenOrders
        .filter((k) => !stationId || k.stationId === stationId)
        .map((k) => ({ id: k.id, stationId: k.stationId, stationName: k.station.name, status: k.status })),
      items: o.items
        // A filtered board shows only that station's food; an unfiltered one shows the
        // whole order, because whoever plates it needs to see all of it.
        .filter((i) => !stationId || (stationsByProduct.get(i.productId) ?? []).includes(stationId))
        .map((i) => ({
          id: i.id,
          name: i.nameSnapshot,
          quantity: i.quantity,
          notes: i.notes,
          modifiers: i.modifiers.map((m) => m.nameSnapshot),
        })),
    };
  });

  const sections = BOARD_SECTIONS.map((section) => ({
    status: section.status,
    cards: cards
      .filter((c) => section.orderStatuses.includes(c.status))
      .filter((c) => c.stations.some((s) => section.visibleTicketStatuses.includes(s.status)))
      // Oldest first inside a column: the thing that has waited longest is the thing to
      // pick up next, and putting it at the top is the only way a cook can tell without
      // reading every card.
      .sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime()),
  }));

  return { sections, stations };
}

/**
 * Presses the one button on a card.
 *
 * `stationId` is the station filter, not a routing decision. With no filter this
 * advances every ticket on the order; with a filter it advances only that station's
 * ticket and leaves the rest of the order to whoever owns the other stations. That is
 * the only reason the filter is not purely cosmetic — a filtered cook genuinely has
 * only their own ticket to move.
 *
 * The order-level transition goes through `updateOrderStatus`, so the status history,
 * the outbox event, the branch broadcast and the guest's live feed all happen exactly
 * as they do when staff advance an order from the Orders screen.
 */
export async function advanceBoardCard(params: { orderId: string; stationId?: string | null }): Promise<{ orderStatus: string; advancedTicketCount: number }> {
  const { orderId, stationId } = params;

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { kitchenOrders: true } });

  const section = BOARD_SECTIONS.find((s) => s.orderStatuses.includes(order.status));
  if (!section) throw new Error(`${order.status} is not a kitchen board status`);

  if (section.action === "markReady") {
    // An order from before auto-receive may still be CREATED; receive it first so the
    // status history reads in order.
    if (order.status === "CREATED") await updateOrderStatus(order.id, "CONFIRMED");
    // Every ticket this press owns goes straight to READY. `updateKitchenOrderStatus`
    // keeps the timestamps and, once all stations are ready, moves the order to READY
    // (which is what notifies the waiter and the guest).
    const mine = order.kitchenOrders.filter((k) => (!stationId || k.stationId === stationId) && (k.status === "NEW" || k.status === "PREPARING"));
    for (const ticket of mine) {
      if (ticket.status === "NEW") await updateKitchenOrderStatus(ticket.id, "PREPARING");
      await updateKitchenOrderStatus(ticket.id, "READY");
    }
    const fresh = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, select: { status: true } });
    return { orderStatus: fresh.status, advancedTicketCount: mine.length };
  }

  const advanceable = order.kitchenOrders.filter((k) => (!stationId || k.stationId === stationId) && k.status === "READY");
  for (const ticket of advanceable) {
    await updateKitchenOrderStatus(ticket.id, "COMPLETED");
  }

  if (order.status === "PAID") {
    // Already paid: stays visible as completed until the cashier closes it.
    return { orderStatus: order.status, advancedTicketCount: advanceable.length };
  }

  // The kitchen is done: tickets closed, order deliberately still READY. This broadcast
  // is what makes the board drop it, live, the moment the last plate leaves the pass.
  emitToBranch(order.branchId, {
    type: "order.status_changed",
    branchId: order.branchId,
    orderId: order.id,
    status: order.status,
    tableSessionId: order.tableSessionId,
  });
  return { orderStatus: order.status, advancedTicketCount: advanceable.length };
}
