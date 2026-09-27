# Offline-First / Local-First Architecture

This is the design and assessment requested before implementation. It covers what
already supports local-first operation, what's missing, the proposed data flow, and
the sync/conflict/duplicate/failure strategy. Implementation follows this document;
see the bottom for what was actually built and tested.

## 1. What already supports this architecture

The current app was, without anyone planning it that way, **already structurally
local-first for a single branch**, because nothing in the operational hot path calls
an external service:

- Orders, kitchen routing, table sessions, waiter requests, availability, and the
  30-Second Challenge game all read and write **only** the local Postgres via Prisma,
  and broadcast **only** over the in-process Socket.io server (`apps/web/server.js`).
  There is no payment gateway call, no external auth provider, no third-party API in
  that path today (confirmed by grep — zero `fetch()` to a non-local host anywhere in
  `lib/` or `app/api/`).
- `next/font/google` fonts are downloaded once at build time and self-hosted — no
  runtime dependency on Google Fonts.
- The schema is already branch-scoped everywhere (`branchId` on `Order`, `KitchenOrder`,
  `WaiterRequest`, `ProductAvailability`, `RestaurantTable`, etc.), which is exactly the
  partition key a per-branch local database needs.

So: a restaurant with a PC running this app and Postgres on its own LAN, with staff
and customer phones on the same Wi-Fi, already keeps working with zero internet. That
was never tested end-to-end, though, and two real gaps exist:

- **QR codes encode whatever `Host` header the admin's browser happened to send**
  (`apps/web/app/api/qr/[id]/image/route.ts` uses `req.nextUrl.origin`). If the admin
  printed a QR while on `localhost:3100`, a customer's phone can't resolve `localhost`
  — it needs the LAN IP or a local hostname. This has nothing to do with cloud sync; it
  breaks *local* operation over Wi-Fi even with zero cloud involved.
- **There is no cloud tier at all.** Nothing was aggregating data centrally, so there
  was nothing to call "sync." Multi-branch head-office reporting (spec §37–38) has no
  data source today beyond querying the one shared database directly.

## 2. What's missing

1. A **durable outbox** — a record, in the *same transaction* as every operational
   write, saying "this needs to reach the cloud eventually." Without this, a sync
   engine has nothing crash-safe to read from; it would need to guess what changed.
2. A **sync engine** — something that drains the outbox to the cloud when reachable,
   backs off when not, and never blocks a local operation on cloud reachability.
3. A **cloud tier** — a genuinely separate service and database that a branch is *not*
   dependent on, only reachable over the internet, whose job is aggregation for HQ
   reporting, not running the restaurant.
4. **Idempotency at two layers**:
   - Client → local API (a customer's phone double-submitting an order on a flaky
     connection must not create two orders).
   - Local → cloud (a retried sync batch after a dropped connection must not apply
     the same event twice).
5. A **conflict policy** — mostly moot for order/kitchen/payment data (see below), but
   needed for the one class of data that can legitimately be written from two places:
   shared reference data like product availability.
6. **LAN-resolvable QR codes** independent of which host generated them.

## 3. Proposed data flow

```
┌─────────────────────────── BRANCH (fully offline-capable) ───────────────────────────┐
│                                                                                        │
│   Customer phones (LAN/Wi-Fi)          Staff devices (LAN/Wi-Fi)                      │
│         │  HTTP + Socket.io                  │  HTTP + Socket.io                      │
│         ▼                                    ▼                                        │
│   ┌───────────────────────────────────────────────────────┐                          │
│   │        Local runtime (apps/web, this Next.js app)      │                          │
│   │   Order/Kitchen/Table/Waiter/Game logic — unchanged    │                          │
│   └───────────────────────────┬─────────────────────────────┘                          │
│                                │ same DB transaction as the write                      │
│                                ▼                                                       │
│                     ┌─────────────────────┐        ┌───────────────────────┐          │
│                     │  Local Postgres      │        │  OutboxEvent table    │          │
│                     │  (operational data)  │◄──────►│  (sync ledger)        │          │
│                     └─────────────────────┘        └───────────┬───────────┘          │
│                                                                  │ polled every ~5s     │
│                                                                  ▼                      │
│                                                     ┌────────────────────────┐         │
│                                                     │   Sync Engine          │         │
│                                                     │  (background loop in   │         │
│                                                     │   the same process)    │         │
│                                                     └───────────┬────────────┘         │
└─────────────────────────────────────────────────────────────────┼─────────────────────┘
                                                                    │ HTTPS, only when reachable
                                                        (retries + backoff when not)
                                                                    ▼
                                          ┌──────────────────────────────────────────┐
                                          │        CLOUD (apps/cloud)                 │
                                          │  Separate process, separate database      │
                                          │  ┌──────────────────────────────────┐    │
                                          │  │ SyncedEvent (idempotency ledger)  │    │
                                          │  │ unique on event id                │    │
                                          │  └──────────────────────────────────┘    │
                                          │  ┌──────────────────────────────────┐    │
                                          │  │ Aggregated projections:           │    │
                                          │  │ CloudOrder, CloudPayment,          │    │
                                          │  │ CloudWaiterRequest,                │    │
                                          │  │ CloudProductAvailability, ...      │    │
                                          │  │ (per tenant/branch — HQ reporting) │    │
                                          │  └──────────────────────────────────┘    │
                                          └──────────────────────────────────────────┘
```

Key point: the arrow into the cloud only ever points **one way** for operational data
(orders, kitchen, waiter requests, payments, games) — a branch is the single writer of
its own operational data, always. The cloud never writes operational data back down to
a branch. That single fact is what makes conflict resolution simple for 95% of the data
(see §5).

## 4. Synchronization strategy

- **Transactional outbox, not event bus.** Every write path that matters (order
  creation, order status change, kitchen ticket update, payment recorded, waiter
  request created/updated, availability changed, table session opened/closed, game
  session completed) inserts one `OutboxEvent` row in the *same* Prisma transaction as
  the operational write. If the transaction commits, the event is guaranteed to exist;
  if it rolls back, neither the write nor the event exists. No dual-write problem.
- **Poll-and-push, not push-on-write.** A background loop (started in `server.js`,
  every 5 seconds, only if `CLOUD_SYNC_URL` is configured) selects a batch of
  `PENDING`/eligible-`FAILED` events ordered by `createdAt`, POSTs them to the cloud's
  `/sync/events` endpoint, and marks exactly the events the cloud acknowledges as
  `SYNCED`. This is deliberately decoupled from the request/response cycle of the
  operation that created the event — placing an order never waits on the network.
- **Backoff on failure.** A failed batch increments `attempts` and computes a backoff
  window (`min(attempts * 5s, 5min)`) before that event is eligible again. The engine
  keeps running on its normal interval regardless — it just skips events still in
  backoff.
- **Cloud is optional infrastructure, not a dependency.** If `CLOUD_SYNC_URL` is unset,
  the sync loop never starts. The restaurant runs exactly the same either way.

## 5. Conflict strategy

Two different data classes need two different answers:

- **Branch-owned operational data (orders, kitchen tickets, payments, waiter requests,
  table sessions, game sessions):** single writer, always the branch that owns them.
  There is no conflict to resolve — the branch's version is authoritative by
  construction, full stop. The cloud is a read replica for this data, built by
  replaying events in order.
- **Shared/reference data that could plausibly be touched from more than one place
  (today: `ProductAvailability` — a branch toggles it locally, and a future
  HQ-managed-menu feature could also touch it centrally):** resolved with
  **last-write-wins by timestamp**, using the event's `occurredAt` (captured at the
  moment of the local write, not at sync time) compared against the cloud
  projection's stored `occurredAt` for that entity. An incoming event older than what
  the cloud already has for that `(branchId, productId)` is accepted into the event log
  (nothing is ever discarded) but does **not** overwrite the projection. This is
  intentionally simple — not a CRDT, not per-field merge — because there is exactly one
  entity class that needs it today. If true concurrent multi-branch menu editing
  becomes a real feature, that's the point to revisit this with a proper merge
  strategy; documented here so it isn't quietly forgotten.

## 6. Duplicate-prevention strategy

Two distinct duplication risks, two distinct keys:

1. **Customer double-submits an order** (flaky Wi-Fi, impatient tap, retry logic in a
   future PWA). Fixed with a client-generated `clientRequestId` (UUID) sent with the
   order creation request. `Order.clientRequestId` is `@unique`; the API does
   find-or-create on it, so a retried request with the same id returns the original
   order instead of creating a second one.
2. **Sync engine re-sends an already-applied batch** (network dropped after the cloud
   committed but before the local process saw the response — see interrupted-sync test
   below). Fixed with the outbox event's own id (a UUID generated at write time,
   stable across retries) as the idempotency key. The cloud's `SyncedEvent(id)` has a
   unique constraint; ingestion is `INSERT ... ON CONFLICT (id) DO NOTHING`, and each
   event is applied in **its own transaction**, not one transaction per batch — so a
   batch that dies halfway through still leaves the already-applied events safely
   committed and idempotent to re-apply.

## 7. Failure / recovery behavior

- **Local process restarts:** outbox rows already survive in Postgres; the sync loop
  just resumes selecting `PENDING` rows on the next tick. Nothing is lost, nothing is
  re-created.
- **Cloud unreachable:** every sync attempt fails fast (connection refused/timeout),
  events stay `PENDING`/`FAILED` with backoff, local operations are completely
  unaffected because they never touch the network.
- **Cloud reachable again:** next tick of the sync loop picks up every backlogged
  event and drains the queue in `createdAt` order.
- **Sync interrupted mid-batch** (cloud applies some events, then the connection dies
  before the response reaches the local engine): the local engine treats the whole
  batch as failed and retries all of it. The cloud's per-event idempotent ingestion
  means the already-applied events are no-ops on retry and the rest get applied. No
  duplicates, no gaps.
- **Local database itself is lost** (disk failure with no backup): out of scope for
  this pass — that's a backup/DR concern, not a sync concern, and conflating the two
  would be the wrong abstraction. Noted here so it isn't mistaken for "handled."

## 8. Multi-branch note

Nothing about this design assumes a single branch. Each branch runs its own local
Postgres + local app instance (or, on a single dev machine, its own local database);
every outbox event already carries `branchId`; the cloud's `/sync/events` endpoint is
authenticated per-branch (an API key per branch) and its projections are keyed by
`(tenantId, branchId)`. Adding a second branch means standing up a second local
instance with its own `CLOUD_SYNC_URL`/API key pointed at the same cloud — no schema or
protocol change.

---

## What was actually built (see `docs/STATUS.md` for the running honest ledger)

- `OutboxEvent` model + `Order.clientRequestId` added to the local schema (additive,
  non-breaking).
- `apps/web/lib/outbox.ts` + wiring into `createOrder`, `updateOrderStatus`,
  `updateKitchenOrderStatus`, payments, waiter requests, availability changes, and
  table-session open.
- `apps/web/lib/sync-engine.ts`, started from `server.js` on an interval.
- `packages/cloud-db` — a separate Prisma schema/client for the cloud database.
- `apps/cloud` — a standalone Node service (own `package.json`, own port, own database)
  exposing `POST /sync/events` (idempotent, per-event commit, optional fault injection
  for testing) and read endpoints used to verify final consistency.
- `scripts/offline-sync-test.mjs` — the real, executed test harness for every scenario
  requested. Its actual output is in the message this doc's implementation was
  delivered in, not reproduced here (it would go stale).
