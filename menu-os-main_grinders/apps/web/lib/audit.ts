import { json, type Prisma } from "@menu-os/db";

type Tx = Prisma.TransactionClient;

/**
 * Records who did what to what, with before/after values, in the same transaction as
 * the change itself. Financial and price-affecting actions must never be silently
 * un-auditable — this is the single write path for that guarantee.
 */
export async function writeAuditLog(
  tx: Tx,
  params: {
    tenantId: string;
    branchId?: string;
    userId?: string;
    shiftId?: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    deviceInfo?: string;
  }
) {
  await tx.auditLog.create({
    data: {
      tenantId: params.tenantId,
      branchId: params.branchId,
      userId: params.userId,
      shiftId: params.shiftId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      // JSON-encoded text since the move to SQLite (see the schema's encoding notes).
      beforeJson: json(params.before),
      afterJson: json(params.after),
      deviceInfo: params.deviceInfo,
    },
  });
}
