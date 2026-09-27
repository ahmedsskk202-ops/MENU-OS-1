import { readStrArray, type Prisma } from "@menu-os/db";
import { withLock } from "./async-lock";

type Tx = Prisma.TransactionClient;

/** The schedule/branch/global-usage field shape shared identically by Promotion and ComboDeal. */
export interface ScheduledLimitedRecord {
  status: string;
  startsAt: Date;
  endsAt: Date | null;
  /** JSON-encoded in SQLite since the migration — callers decode with `readStrArray`/`readIntArray`. */
  branchIds: string[];
  daysOfWeek: number[];
  startTimeMinutes: number | null;
  endTimeMinutes: number | null;
  maxUsesTotal: number | null;
  usesCount: number;
}

/**
 * Schedule/branch/global-usage gating — identical for a Promotion and a ComboDeal,
 * factored out once rather than duplicated across lib/promotions.ts and lib/combos.ts.
 * Cart-specific rules (minOrderAmount, eligible-quantity) stay in each engine, since
 * only Promotion has them.
 */
export function isScheduleAndLimitEligible(record: ScheduledLimitedRecord, params: { now: Date; branchId: string }): boolean {
  if (record.status !== "ACTIVE") return false;
  if (params.now < record.startsAt) return false;
  if (record.endsAt && params.now > record.endsAt) return false;
  if (record.branchIds.length > 0 && !record.branchIds.includes(params.branchId)) return false;
  if (record.daysOfWeek.length > 0 && !record.daysOfWeek.includes(params.now.getDay())) return false;
  if (record.startTimeMinutes != null || record.endTimeMinutes != null) {
    const minutesNow = params.now.getHours() * 60 + params.now.getMinutes();
    if (record.startTimeMinutes != null && minutesNow < record.startTimeMinutes) return false;
    if (record.endTimeMinutes != null && minutesNow > record.endTimeMinutes) return false;
  }
  if (record.maxUsesTotal !== null && record.usesCount >= record.maxUsesTotal) return false;
  return true;
}

/**
 * Race-safe per-guest limit (and optional first-order-only) claim, shared by the
 * Promotion and Combo redemption ledgers.
 *
 * WHY THE LOCK, GIVEN SQLITE. A plain read-then-write count check has a window where
 * two requests for the same guest both read "under the limit" and both proceed. On
 * Postgres that window was closed with `pg_advisory_xact_lock(hashtext(...))`, keyed on
 * (namespace, recordId, guest). SQLite has no advisory locks, so this now serializes on
 * an in-process mutex with the same key (see lib/async-lock.ts).
 *
 * The reads deliberately stay on the caller's `tx` so transaction semantics are
 * unchanged — the claim is part of the order-creation transaction and must roll back
 * with it. Note that SQLite grants only one writer at a time, so the engine already
 * serializes the write half; the mutex additionally covers the multi-statement window
 * between the read and the write within that transaction, and keeps the original
 * guarantee explicit for anyone who later moves this database to a server.
 *
 * THE GUEST KEY. There is no registered-customer identity anymore, so "one use per
 * customer" is keyed on `customerSessionId` — the row created when a device scans a
 * table's QR code. That is the only durable identity a cafe guest has.
 *
 * `countPriorRedemptions` is supplied by the caller (querying PromotionRedemption or
 * ComboRedemption) so this stays generic across both ledgers without fighting Prisma's
 * per-model delegate types.
 */export async function claimPerCustomerLimit(
  tx: Tx,
  params: {
    lockNamespace: "promo" | "combo";
    recordId: string;
    maxUsesPerCustomer: number | null;
    firstOrderOnly?: boolean;
    customerSessionId?: string;
    currentOrderId: string;
    countPriorRedemptions: () => Promise<number>;
  }
): Promise<boolean> {
  if (params.maxUsesPerCustomer === null && !params.firstOrderOnly) return true;
  if (!params.customerSessionId) return true;

  return withLock(`${params.lockNamespace}:${params.recordId}:${params.customerSessionId}`, async () => {
    if (params.firstOrderOnly) {
      const priorOrder = await tx.order.findFirst({
        where: {
          id: { not: params.currentOrderId }, // the current order already exists in this transaction — exclude it
          customerSessionId: params.customerSessionId,
        },
      });
      if (priorOrder) return false;
    }

    if (params.maxUsesPerCustomer !== null) {
      const priorRedemptions = await params.countPriorRedemptions();
      if (priorRedemptions >= params.maxUsesPerCustomer) return false;
    }

    return true;
  });
}

/**
 * Admin-list filter for "which offers can this branch see?".
 *
 * An empty `branchIds` means "every branch" — the same rule `isScheduleAndLimitEligible`
 * applies at evaluation time — so both admin lists (promotions and combo deals) use
 * exactly this one test.
 *
 * This runs in JS rather than as a Prisma `where` on purpose. It used to be
 * `{ OR: [{ branchIds: { has: branchId } }, { branchIds: { equals: [] } }] }`, a
 * scalar-list operator only PostgreSQL has; `branchIds` is JSON text on SQLite now, so
 * there is no list column left to push the predicate into. The candidate set is one
 * brand's active offers — a few hundred rows at most — and each test only JSON.parses
 * one short array, so the scan is not worth an index.
 */
export function matchesBranchScope(branchIdsJson: string, branchId: string): boolean {
  const branchIds = readStrArray(branchIdsJson);
  return branchIds.length === 0 || branchIds.includes(branchId);
}

/**
 * Case-insensitive substring match for the admin search boxes. These columns were
 * queried with `mode: "insensitive"` before the migration, which is likewise
 * PostgreSQL-only. SQLite's `LIKE` happens to be case-insensitive for ASCII, but
 * matching in JS keeps the behaviour identical everywhere and off the database's
 * collation rules entirely.
 */
export function matchesSearch(haystack: string | null | undefined, needle: string): boolean {
  return (haystack ?? "").toLowerCase().includes(needle.trim().toLowerCase());
}
