import { prisma } from "./db";

/**
 * THE WAITER'S FLOOR.
 *
 * Two lists and nothing else, because a waiter carrying plates cannot read a console.
 *
 *   READY TO SERVE  orders the kitchen has handed over, keyed by table, with the next
 *                   one first — a table that has been waiting longest is the one a
 *                   guest is least patient about.
 *   TABLE CALLS     tables that have used the "call a waiter" button, oldest call
 *                   first, with how long they have been waiting.
 *
 * Both are the same shape — a table label, a headline, a wait time, an id to act on —
 * because they are answered with the same two gestures: walk there, and either put
 * the plate down or deal with the guest.
 */

export interface FloorOrder {
  orderId: string;
  orderRef: string;
  tableLabel: string | null;
  orderType: string;
  currency: string;
  total: string;
  /** Minutes since the order reached READY, not since it was placed. */
  readyMinutesAgo: number;
  itemCount: number;
  /**
   * The real line totals, not a share of the order total. A receipt whose lines do not
   * add up to its own total is the kind of thing a guest checks at the counter, and the
   * only way to avoid it is to send the number the order already stored.
   */
  // modifiers: the size or option the guest chose — without it two lines of the same
  // drink in different sizes read as an accidental duplicate.
  items: Array<{ name: string; quantity: number; lineTotal: string; modifiers: string[] }>;
  /** Present so the card can print the slip without a second fetch. */
  receipt: {
    branchName: string;
    brandName: string;
    address: string | null;
    phone: string | null;
  };
}

export interface FloorCall {
  requestId: string;
  tableLabel: string | null;
  type: string;
  note: string | null;
  waitingMinutes: number;
  status: string;
}

export async function getWaiterFloor(branchId: string): Promise<{ readyToServe: FloorOrder[]; tableCalls: FloorCall[] }> {
  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: branchId }, include: { brand: true } });

  // An order reaches "ready" from the kitchen, and leaves it when a waiter says so.
  // Both endpoints are the same row, so this one query is the whole first list.
  const readyOrders = await prisma.order.findMany({
    where: { branchId, status: "READY" },
    orderBy: { updatedAt: "asc" },
    include: {
      tableSession: { include: { table: { select: { label: true } } } },
      items: { select: { nameSnapshot: true, quantity: true, lineTotal: true, modifiers: { select: { nameSnapshot: true } } } },
      statusEvents: { where: { toStatus: "READY" }, orderBy: { changedAt: "desc" }, take: 1, select: { changedAt: true } },
    },
  });

  const now = Date.now();
  const readyToServe: FloorOrder[] = readyOrders.map((o) => {
    // Prefer the status event that put it here; fall back to `updatedAt`, which for an
    // order sitting in READY is the same instant. This is a truer "how long has this
    // been on the pass" than `createdAt`, which is how long the *guest* has waited.
    const becameReadyAt = o.statusEvents.length > 0 ? o.statusEvents[0].changedAt : o.updatedAt;
    return {
      orderId: o.id,
      orderRef: o.id.slice(-6).toUpperCase(),
      tableLabel: o.tableSession?.table.label ?? null,
      orderType: o.type,
      currency: o.currency,
      total: o.total.toString(),
      readyMinutesAgo: Math.max(0, Math.floor((now - becameReadyAt.getTime()) / 60_000)),
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      items: o.items.map((i) => ({
        name: i.nameSnapshot,
        quantity: i.quantity,
        lineTotal: i.lineTotal.toString(),
        modifiers: i.modifiers.map((m) => m.nameSnapshot),
      })),
      receipt: { branchName: branch.name, brandName: branch.brand.name, address: branch.address, phone: branch.phone },
    };
  });

  // An open call is anything not COMPLETED. The guest app's button creates an OPEN
  // request; ASSIGNED means a waiter is already on the way and the row stays visible
  // so a second waiter does not also set off across the room.
  const calls = await prisma.waiterRequest.findMany({
    where: { tableSession: { table: { branchId } }, status: { not: "COMPLETED" } },
    orderBy: { createdAt: "asc" },
    include: { tableSession: { include: { table: { select: { label: true } } } } },
  });

  const tableCalls: FloorCall[] = calls.map((c) => ({
    requestId: c.id,
    tableLabel: c.tableSession?.table.label ?? null,
    type: c.type,
    note: c.note,
    waitingMinutes: Math.max(0, Math.floor((now - c.createdAt.getTime()) / 60_000)),
    status: c.status,
  }));

  return { readyToServe, tableCalls };
}
