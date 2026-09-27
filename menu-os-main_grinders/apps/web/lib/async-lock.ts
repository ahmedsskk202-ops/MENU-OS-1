/**
 * A minimal keyed async mutex.
 *
 * REPLACES THE POSTGRES ADVISORY LOCKS. Both reservation double-booking and the
 * per-customer promotion/combo usage limits need the same guarantee: two
 * concurrent requests for the SAME logical resource must not both read "no
 * conflict" and then both write. `pg_advisory_xact_lock(hashtext(...))` gave
 * that on Postgres; SQLite has no equivalent, so serialization is done here
 * instead.
 *
 * SCOPE — read this before relying on it. The lock is per JavaScript process and
 * per key. That matches how this app actually runs (a single `node server.js`
 * for the branch, see apps/web/server.js; the HQ cloud service is a single
 * process too), and it is why a branch's own database is a local SQLite file
 * rather than a shared server. It would NOT be sufficient across several
 * processes or several machines pointed at one database file — if this is ever
 * deployed that way, replace this module with a real lock and nothing else
 * needs to change, because every caller already goes through `withLock`.
 */

/** key -> the tail of the queue of waiters for that key. */
const chains = new Map<string, Promise<unknown>>();

/**
 * Runs `fn` with exclusive access to `key`. Concurrent calls with the same key
 * run one at a time, in arrival order; calls with different keys never wait on
 * each other.
 *
 * The lock is released in a `finally`, so a throwing `fn` still unblocks the
 * next waiter instead of deadlocking it forever.
 */
export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // Chain onto whatever is already running for this key. `catch` on the
  // predecessor keeps a previous failure from rejecting the next waiter.
  const previous = chains.get(key) ?? Promise.resolve();
  const run = previous.then(
    () => fn(),
    () => fn()
  );

  // The stored value must never reject, or the next `previous.then` would see
  // a rejected promise and (without the rejection handler above) chain forever.
  const settled = run.then(
    () => undefined,
    () => undefined
  );
  chains.set(key, settled);

  try {
    return await run;
  } finally {
    // Only clear the map entry if we are still the tail — a later caller may
    // already have queued behind us.
    if (chains.get(key) === settled) chains.delete(key);
  }
}
