import { readJson } from "@menu-os/db";
import { prisma } from "./db";
import { notify } from "./notifications";

// Documented default (nothing in the spec pinned an exact threshold): an order still
// sitting in CREATED/CONFIRMED/PREPARING 20 minutes after being placed is "delayed".
// READY/DELIVERED/PAID/CLOSED/CANCELLED orders are excluded — this flags kitchen-side
// delay, not a guest sitting on a ready order.
export const DELAYED_ORDER_THRESHOLD_MINUTES = 20;

// What the order is still waiting on, in words a person would use — the raw status
// read as "Still created after 20 minutes".
const STATUS_WORDS: Record<string, string> = {
  CREATED: "not yet accepted",
  CONFIRMED: "accepted, not started",
  PREPARING: "still cooking",
};

/**
 * Scans for orders that have been stuck for too long and fires one DELAYED_ORDER
 * notification per order — guarded by checking for an existing notification for that
 * order rather than a schema change, so a repeat tick is a safe no-op.
 */
export async function checkDelayedOrders(thresholdMinutes = DELAYED_ORDER_THRESHOLD_MINUTES): Promise<number> {
  const cutoff = new Date(Date.now() - thresholdMinutes * 60_000);
  const candidates = await prisma.order.findMany({
    where: { status: { in: ["CREATED", "CONFIRMED", "PREPARING"] }, createdAt: { lte: cutoff } },
    include: { branch: { include: { brand: true } }, tableSession: { include: { table: { select: { label: true } } } } },
  });

  let flagged = 0;
  // One read of every DELAYED_ORDER notification for the branch, then an in-memory
  // membership test. The obvious `data: { path: ["orderId"], equals: order.id }`
  // filter was a Prisma JSON-path predicate, and `data` is plain JSON *text* now that
  // the database is SQLite — there is no JSON index to push that down to, and SQLite
  // would have to scan and parse every row anyway. This query is bounded by how many
  // orders are ever late at once, so reading them is cheaper than special-casing.
  const existingDelayed = await prisma.notification.findMany({
    where: { branchId: { in: [...new Set(candidates.map((o) => o.branchId))] }, type: "DELAYED_ORDER" },
    select: { data: true },
  });
  const alreadyFlagged = new Set<string>();
  for (const n of existingDelayed) {
    const orderId = (readJson(n.data) as { orderId?: unknown } | null)?.orderId;
    if (typeof orderId === "string") alreadyFlagged.add(orderId);
  }

  for (const order of candidates) {
    if (alreadyFlagged.has(order.id)) continue;
    alreadyFlagged.add(order.id);

    const minutesStuck = Math.floor((Date.now() - order.createdAt.getTime()) / 60_000);
    const tableLabel = order.tableSession?.table.label ?? null;
    const orderNumber = order.id.slice(-6).toUpperCase();
    await prisma.$transaction(async (tx) => {
      await notify(tx, {
        tenantId: order.branch.brand.tenantId,
        branchId: order.branchId,
        type: "DELAYED_ORDER",
        // The table leads, for the same reason it leads every other staff alert: the
        // reader has to know where to look. The order number is kept as the fallback
        // for pickup/delivery orders that have no table. The bell renders this from
        // `data` in the reader's language; the English title is the stored fallback.
        title: tableLabel
          ? `Order running late — Table ${tableLabel}`
          : `Order #${orderNumber} is running late`,
        body: `Waiting ${minutesStuck} minutes · ${STATUS_WORDS[order.status] ?? order.status.toLowerCase()}`,
        data: { orderId: order.id, orderNumber, tableLabel, status: order.status, minutes: minutesStuck },
      });
    });
    flagged++;
  }
  return flagged;
}

export function startDelayedOrderChecker(intervalMs = 60_000) {
  console.log(`Delayed-order checker: scanning every ${intervalMs}ms for orders stuck over ${DELAYED_ORDER_THRESHOLD_MINUTES}m`);
  setInterval(() => {
    checkDelayedOrders().catch((err) => console.error("Delayed-order check crashed unexpectedly:", err));
  }, intervalMs);
}
