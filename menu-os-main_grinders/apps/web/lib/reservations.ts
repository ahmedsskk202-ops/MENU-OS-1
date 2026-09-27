import type { Prisma } from "@menu-os/db";
import { withLock } from "./async-lock";

type Tx = Prisma.TransactionClient;

/**
 * A table can't hold two overlapping reservations. Half-open interval overlap check:
 * [existingStart, existingEnd) intersects [candidateStart, candidateEnd).
 * PENDING and CONFIRMED both hold the slot; CANCELLED/NO_SHOW/COMPLETED free it.
 *
 * Race-safe: two concurrent requests booking the same table (e.g. two staff devices,
 * or a retried request) both reading "no conflict" and then both inserting is a real
 * window — a plain check-then-insert is not enough on its own, the same class of race
 * the coupon/promotion claim paths already guard against. This serializes on an
 * in-process mutex keyed on the table (it used to be a Postgres advisory lock keyed the
 * same way; see lib/async-lock.ts for the lock's scope), so concurrent attempts on the
 * SAME table are applied one after another instead of both winning.
 *
 * The lock is released before the caller inserts, so two callers that both found the
 * table free will still both return "no conflict" and the caller's own
 * unique-constraint/serializable behaviour is what settles the second one. Same as the
 * advisory-lock version: the mutex narrows the window, it does not turn this into a
 * distributed reservation lock.
 */
export async function findConflictingReservation(
  tx: Tx,
  params: { tableId: string; reservedFor: Date; durationMinutes: number; excludeReservationId?: string }
) {
  const candidateStart = params.reservedFor;
  const candidateEnd = new Date(candidateStart.getTime() + params.durationMinutes * 60_000);

  return withLock(`reservation:table:${params.tableId}`, async () => {
    const candidates = await tx.reservation.findMany({
      where: {
        tableId: params.tableId,
        status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
        id: params.excludeReservationId ? { not: params.excludeReservationId } : undefined,
      },
    });

    for (const existing of candidates) {
      const existingStart = existing.reservedFor;
      const existingEnd = new Date(existingStart.getTime() + existing.durationMinutes * 60_000);
      if (existingStart < candidateEnd && candidateStart < existingEnd) return existing;
    }
    return null;
  });
}
