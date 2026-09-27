import { randomUUID } from "node:crypto";
import { prisma } from "../db";

/**
 * A lock for online-payment work that holds across processes, not just inside one.
 *
 * lib/async-lock.ts serialises callers within a single Node process, which is not enough
 * once more than one server process shares the database: two processes could both see
 * "no open checkout" and both create one, or both apply the same gateway result. This
 * lock is a row in PaymentLock, keyed by the resource. Taking it is a single INSERT on a
 * primary key, which the database itself makes atomic — so it behaves the same on SQLite
 * (processes sharing the file) and on PostgreSQL, with no extra infrastructure.
 *
 * It is a lease: a holder that crashes can't wedge the order forever, because once
 * `expiresAt` passes another caller may take the row over. The TTL is well above the
 * longest thing done under it (one gateway call, capped at 15s in providerFetch). And
 * the lock is not the only guard: every status change is still a conditional update
 * (`where status = PENDING`), so even an expired lease can't apply a result twice.
 */
const TTL_MS = 60_000;
const WAIT_MS = 45_000;

export class LockTimeoutError extends Error {}

export async function withPaymentLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const owner = randomUUID();
  const deadline = Date.now() + WAIT_MS;
  let delay = 25;

  for (;;) {
    if (await tryAcquire(key, owner)) break;
    if (Date.now() > deadline) throw new LockTimeoutError(`payment lock busy: ${key}`);
    await new Promise((r) => setTimeout(r, delay + Math.floor(Math.random() * delay)));
    delay = Math.min(delay * 2, 400);
  }

  try {
    return await fn();
  } finally {
    // Only our own lease — if it expired and someone else took it over, it's theirs now.
    await prisma.paymentLock.deleteMany({ where: { key, owner } }).catch(() => undefined);
  }
}

async function tryAcquire(key: string, owner: string): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TTL_MS);
  // Look first, so an ordinary wait doesn't cost a failed INSERT on every poll.
  const held = await prisma.paymentLock.findUnique({ where: { key }, select: { expiresAt: true } }).catch(() => null);
  if (!held) {
    try {
      await prisma.paymentLock.create({ data: { key, owner, expiresAt } });
      return true;
    } catch (err) {
      // Lost the race to another holder (unique key). Checked by code, not instanceof:
      // inside the Next.js bundle the Prisma error class can be a different copy.
      if ((err as { code?: string })?.code === "P2002") return false;
      // SQLite answers a write that collides with another process's write with "busy" —
      // that is contention, not failure: wait and try again like any other held lock.
      if (isBusy(err)) return false;
      throw err;
    }
  }
  if (held && held.expiresAt > now) return false;
  // Held by someone. Take it over only if their lease has run out (one conditional update,
  // so two waiters can't both win it).
  try {
    const stolen = await prisma.paymentLock.updateMany({ where: { key, expiresAt: { lt: now } }, data: { owner, expiresAt } });
    return stolen.count === 1;
  } catch (err) {
    if (isBusy(err)) return false;
    throw err;
  }
}

function isBusy(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return /database is locked|SQLITE_BUSY|timed out/i.test(msg);
}
