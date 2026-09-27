import { readJson } from "@menu-os/db";
import { prisma } from "./db";

const BATCH_SIZE = 50;
const MAX_BACKOFF_MS = 5 * 60_000;

function backoffMs(attempts: number) {
  return Math.min(attempts * 5_000, MAX_BACKOFF_MS);
}

let cycleInFlight = false;

export interface SyncCycleResult {
  attempted: number;
  synced: number;
  failed: number;
  reason?: string;
}

/**
 * Drains one batch of the outbox to the cloud. Never throws — a failed cycle just
 * leaves events for the next tick (or the next manual call in tests). Local
 * operations never wait on this; it's invoked on its own interval from server.js.
 */
export async function runSyncCycle(): Promise<SyncCycleResult> {
  const cloudUrl = process.env.CLOUD_SYNC_URL;
  const branchId = process.env.CLOUD_BRANCH_ID;
  const apiKey = process.env.CLOUD_API_KEY;

  if (!cloudUrl || !branchId || !apiKey) {
    return { attempted: 0, synced: 0, failed: 0, reason: "sync not configured" };
  }

  if (cycleInFlight) return { attempted: 0, synced: 0, failed: 0, reason: "cycle already running" };
  cycleInFlight = true;

  try {
    const now = new Date();
    const batch = await prisma.outboxEvent.findMany({
      where: {
        branchId,
        OR: [{ syncStatus: "PENDING" }, { syncStatus: "FAILED", nextAttemptAt: { lte: now } }],
      },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    if (batch.length === 0) return { attempted: 0, synced: 0, failed: 0 };

    await prisma.outboxEvent.updateMany({
      where: { id: { in: batch.map((e) => e.id) } },
      data: { syncStatus: "SYNCING" },
    });

    let response: Response;
    try {
      response = await fetch(`${cloudUrl}/sync/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          apiKey,
          events: batch.map((e) => ({
            id: e.id,
            aggregateType: e.aggregateType,
            aggregateId: e.aggregateId,
            eventType: e.eventType,
            // `payload` is JSON *text* in the outbox since the move to SQLite. The
            // wire contract is unchanged — the cloud service has always received a
            // JSON object here — so decode at the edge rather than changing the
            // protocol and every consumer of it.
            payload: readJson(e.payload) ?? {},
            occurredAt: e.occurredAt.toISOString(),
          })),
        }),
      });
    } catch (err) {
      // Network unreachable — this is what "internet is down" looks like in practice.
      await markFailed(batch.map((e) => ({ id: e.id, attempts: e.attempts })));
      return { attempted: batch.length, synced: 0, failed: batch.length, reason: err instanceof Error ? err.message : "network error" };
    }

    if (!response.ok) {
      await markFailed(batch.map((e) => ({ id: e.id, attempts: e.attempts })));
      return { attempted: batch.length, synced: 0, failed: batch.length, reason: `cloud responded ${response.status}` };
    }

    const body = (await response.json()) as { acknowledged: string[] };
    const ackSet = new Set(body.acknowledged ?? []);

    const ackIds = batch.filter((e) => ackSet.has(e.id)).map((e) => e.id);
    const unackedIds = batch.filter((e) => !ackSet.has(e.id));

    if (ackIds.length > 0) {
      await prisma.outboxEvent.updateMany({
        where: { id: { in: ackIds } },
        data: { syncStatus: "SYNCED", syncedAt: new Date() },
      });
    }
    if (unackedIds.length > 0) {
      await markFailed(unackedIds.map((e) => ({ id: e.id, attempts: e.attempts })));
    }

    return { attempted: batch.length, synced: ackIds.length, failed: unackedIds.length };
  } finally {
    cycleInFlight = false;
  }
}

async function markFailed(events: { id: string; attempts: number }[]) {
  await Promise.all(
    events.map((e) =>
      prisma.outboxEvent.update({
        where: { id: e.id },
        data: {
          syncStatus: "FAILED",
          attempts: { increment: 1 },
          nextAttemptAt: new Date(Date.now() + backoffMs(e.attempts + 1)),
        },
      })
    )
  );
}

export function startSyncEngine(intervalMs = 5_000) {
  if (!process.env.CLOUD_SYNC_URL) {
    console.log("Sync engine: CLOUD_SYNC_URL not set — running local-only (this is a supported mode, not an error).");
    return;
  }
  console.log(`Sync engine: polling ${process.env.CLOUD_SYNC_URL} every ${intervalMs}ms`);
  setInterval(() => {
    runSyncCycle().catch((err) => console.error("Sync cycle crashed unexpectedly:", err));
  }, intervalMs);
}
