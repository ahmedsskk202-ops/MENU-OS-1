import type { Server } from "socket.io";

// Event contracts shared between server emitters and client listeners.
// Keep this the single source of truth for real-time payload shapes.
export type RealtimeEvent =
  | { type: "order.created"; branchId: string; order: unknown }
  | { type: "order.status_changed"; branchId: string; orderId: string; status: string; tableSessionId?: string | null }
  | { type: "table.status_changed"; branchId: string; tableId: string; status: string }
  | { type: "table_session.closed"; tableSessionId: string }
  | { type: "waiter_request.created"; branchId: string; request: unknown }
  | { type: "waiter_request.updated"; branchId: string; request: unknown }
  | { type: "product.availability_changed"; branchId: string; productId: string; status: string }
  | { type: "kitchen_order.updated"; branchId: string; kitchenOrder: unknown }
  | { type: "payment.updated"; branchId: string; orderId: string; payment: unknown }
  | { type: "game_session.updated"; tableSessionId: string; gameSession: unknown }
  | { type: "game_round.started"; tableSessionId: string; round: unknown }
  | { type: "game_round.result"; tableSessionId: string; result: unknown }
  | { type: "shift.updated"; branchId: string; shift: unknown }
  | { type: "expense.recorded"; branchId: string; expense: unknown }
  | { type: "refund.created"; branchId: string; orderId: string; refund: unknown }
  | { type: "reservation.created"; branchId: string; reservation: unknown }
  | { type: "reservation.updated"; branchId: string; reservation: unknown }
  | { type: "delivery_order.updated"; branchId: string; deliveryOrder: unknown }
  | { type: "notification.created"; branchId: string; userId?: string | null; notification: unknown }
  | { type: "inventory.changed"; branchId: string; ingredientIds: string[] };

function getIo(): Server | null {
  const g = global as unknown as { __menuOsIo?: Server };
  return g.__menuOsIo ?? null;
}

/** Broadcast to every admin/staff client watching a branch (dashboard, KDS, waiter board, table map). */
export function emitToBranch(branchId: string, event: RealtimeEvent) {
  getIo()?.to(`branch:${branchId}`).emit("event", event);
}

/** Broadcast to every device currently on a table session (order timeline, bill, game state). */
export function emitToTableSession(tableSessionId: string, event: RealtimeEvent) {
  getIo()?.to(`table-session:${tableSessionId}`).emit("event", event);
}

/** Broadcast to one guest's own device — used by the table-less self-service ordering
 *  flow (pickup/delivery), where there's no shared table session to broadcast to. */
export function emitToCustomerSession(customerSessionId: string, event: RealtimeEvent) {
  getIo()?.to(`customer-session:${customerSessionId}`).emit("event", event);
}

export function emitToGameSession(gameSessionId: string, event: RealtimeEvent) {
  getIo()?.to(`game-session:${gameSessionId}`).emit("event", event);
}
