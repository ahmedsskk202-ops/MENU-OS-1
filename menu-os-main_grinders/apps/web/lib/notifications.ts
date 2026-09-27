import { json, type NotificationType, type Prisma } from "@menu-os/db";
import { emitToBranch } from "./realtime";

type Tx = Prisma.TransactionClient;

// Re-exported so existing importers of "@/lib/notifications" keep working, but the
// union itself lives in @menu-os/db next to the schema it describes — SQLite has no
// enum type, so that list is the only thing standing between a typo and a bad row.
export type { NotificationType };

/**
 * Writes a Notification row and pushes it live to whoever's watching the branch's
 * admin channel — the single path every notification-producing event goes through,
 * so the bell's unread count and the realtime toast never drift from the database.
 */
export async function notify(
  tx: Tx,
  params: { tenantId: string; branchId?: string; userId?: string; type: NotificationType; title: string; body?: string; data?: Record<string, unknown> }
) {
  const created = await tx.notification.create({
    data: {
      tenantId: params.tenantId,
      branchId: params.branchId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      // JSON-encoded text since the move to SQLite.
      data: json(params.data),
    },
  });
  if (params.branchId) {
    // Pushed with `data` as an object, the same shape GET /api/notifications returns —
    // the row holds JSON text, and the bell could not build its translated text from it.
    emitToBranch(params.branchId, { type: "notification.created", branchId: params.branchId, userId: params.userId, notification: { ...created, data: params.data ?? null } });
  }
  return created;
}
