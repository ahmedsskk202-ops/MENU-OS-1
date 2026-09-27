# Status — Phase 1 (Foundation)

Honest accounting of what's real vs. what's an intentional extension point.
Nothing below is a fake button — anything not listed as "built" simply isn't
in the UI yet.

## Built and wired to the database, end-to-end

- **Multi-tenant schema**: Tenant → Brand → Branch → Tables/Menu/Staff/Orders, all 40+
  entities from the spec (`packages/db/prisma/schema.prisma`).
- **QR → table session**: scan resolves branch/table, opens or reuses an active
  `TableSession`, signs a per-device cookie — no restaurant/table picker shown to the guest.
- **Menu engine**: categories, products, modifier groups (required/optional, min/max),
  per-branch availability (Available/Low Stock/Sold Out), badges (Featured/Popular/New/Seasonal).
  A sold-out toggle in the admin reaches every guest already browsing, live.
- **Ordering**: cart is priced server-side only (never trusts the client), creates the
  order, auto-routes items to kitchen stations, and drives a real status timeline
  (Created → Confirmed → Preparing → Ready → Delivered → Paid → Closed, or Cancelled).
- **Kitchen Display System**: station-based board (New/Preparing/Ready), delay highlighting.
- **Table management**: floor map, live status, auto-lifecycle tied to sessions.
- **Waiter requests**: guest-initiated, staff assign/complete, timestamps captured for
  future response-time reporting.
- **Payments**: cash recorded and verified by staff (never by the browser); partial
  payments supported. Card/Online/Wallet are modeled and accepted by the API but sit
  `PENDING` — no gateway is wired in yet (by your choice: cash-first for v1).
- **RBAC**: 6 seeded roles (Owner, Branch Manager, Cashier, Waiter, Kitchen, Accountant),
  enforced on every API route by permission key, not role name.
- **QR management**: generate/deactivate Table/Menu/Pickup/Marketing codes, downloadable PNG.
- **Admin Command Center**: today's revenue, orders, active tables, games played, live
  activity feed over the same Socket.io channel the KDS and floor map use.
- **Sales analytics**: revenue by channel with a date-range filter, chart.
- **Menu management UI**: create categories/products, toggle active + availability status.
- **30-Second Challenge**: real multiplayer — lobby, ready-up, 5 rounds, trivia (typed
  answers, speed-scored) and social vote rounds, live leaderboard, server-authoritative
  scoring and timeouts. Original content, not derived from any commercial game.
- **Seed data**: "Aurum" demo restaurant — 30+ products across 6 categories, modifiers,
  12 tables across 3 zones, 5 staff logins, 2 delivery zones, 5 days of paid order
  history for analytics to have something to show.

## Reservations, Delivery, Loyalty, Inventory/Costing, Audit log, Notifications — built and tested

Everything below was a genuine gap (either unmodeled or modeled-but-unbuilt) closed in
this pass. `scripts/phase2-test.mjs` — 29/29 checks — covers all of it end-to-end
against the live app and database.

- **Reservations** (new: `Reservation` model + `reservations.manage` permission).
  Booking ahead of a visit, distinct from `TableSession` (which only exists once a
  guest has actually scanned a QR code). Conflict-checked per table on a half-open
  time-interval overlap (`lib/reservations.ts`) on both create and edit. Status
  lifecycle Pending → Confirmed → Seated → Completed, or Cancelled/No-show. Admin UI
  at `/admin/reservations`.
- **Delivery** (schema already had `DeliveryZone`/`Driver`/`DeliveryOrder`; nothing used
  them). `lib/orders.ts#createOrder` now accepts an optional `delivery` block that
  creates the `DeliveryOrder` row atomically with the `Order` and adds the zone's fee
  on top of the priced cart total. `POST /api/orders/staff` is a new staff-facing
  order-entry endpoint (phone-in pickup/delivery, or a walk-in with no table) that
  reuses the exact same pricing/kitchen-routing/outbox path as guest self-service
  orders — the only difference is who's placing it. Admin UI at `/admin/delivery`:
  zone and driver management, a live order board, and driver assignment. Marking a
  delivery **Delivered** advances the underlying `Order.status` to `DELIVERED` too, so
  it flows into the existing payment/report pipeline unchanged. There is still no
  guest-facing self-service pickup/delivery checkout (see gaps below) — this closes
  the *operational* half (staff can take and run these orders today).
- **Loyalty** (schema already had `LoyaltyAccount`/`LoyaltyTransaction`; nothing used
  them). Guests opt in with a phone number at the bill screen after paying
  (`POST /api/loyalty/link`) — no login, consistent with the guest-only session model;
  this retroactively links their paid orders in that table session and earns points on
  each (1 point per 1,000 currency units, tier ladder Member → Silver 500 → Gold 2,000
  — a documented default rate, nothing pinned one in the original spec). Earning is
  idempotent per order (guarded in `lib/loyalty.ts`, verified under the same-order
  double-payment-callback shape). Admin UI at `/admin/loyalty`: search accounts, manual
  point adjustment, and redemption (server-rejects redeeming more than the balance).
- **Recipe / ingredient costing** (schema already had `Ingredient`/`Recipe`/
  `RecipeIngredient`; nothing used them). Admin UI at `/admin/inventory`: ingredient
  CRUD with current stock and a low-stock threshold; a recipe builder per product
  (ingredient + quantity + cost-per-unit snapshot lines, the same snapshot pattern used
  everywhere else in this codebase) that computes food cost and margin live against the
  product's menu price. Crossing the low-stock threshold fires a `LOW_STOCK`
  notification.
- **Audit log viewer** (the log itself was already written to; there was no screen to
  read it). `GET /api/audit-log` + `/admin/audit-log`: filter by entity type, expand a
  row to see the before/after JSON.
- **Notification center** (`Notification` model existed, unused everywhere).
  `lib/notifications.ts#notify` is the single write path — writes the row and pushes it
  live over the branch's existing Socket.IO channel. Wired into: new orders, waiter
  requests, sold-out toggles, delivery status updates, and ingredient low-stock. A bell
  in the admin sidebar shows live unread count and a dropdown feed. `DELAYED_ORDER` is
  not wired (would need a background timer/cron, which this codebase doesn't have
  infrastructure for yet — noted rather than faked).
- **Customer accounts**: still guest-only per table session by design (no login) — but
  a `Customer` record now actually gets created (via the loyalty opt-in), and
  `/admin/customers` lists them with order history and loyalty balance. This was listed
  as a gap before because nothing ever created a `Customer` row; it's populated now,
  opt-in, same trust model as the rest of the customer app.
- **Product image upload**: `POST /api/admin/upload` (local disk under
  `apps/web/public/uploads`, JPEG/PNG/WebP, 5MB cap) replaces the "set it via Prisma
  Studio" workaround. Click a product's thumbnail in `/admin/menu` to upload.
- **RBAC**: two roles that existed in `lib/rbac.ts`'s permission map but were never
  actually seeded (`General Manager`, `Bar`, `Delivery`, `Marketing` — `packages/db/
  prisma/seed.ts` had drifted out of sync with it) are now seeded for real, plus a
  `delivery@aurum.demo` demo login. Three new permission keys
  (`reservations.manage`, `loyalty.manage`, `inventory.manage`) added and assigned
  across the existing role set.

## Corrections to this document

- **Cross-branch Head Office rollup** was previously listed here as "not yet built" —
  it already existed: `/admin/reports` → Branch Performance
  (`getBranchPerformanceReport`, `lib/reports.ts`) already aggregates sales across
  every branch a tenant-wide user (`branchIds: []`, e.g. Owner/General Manager) can
  see, with CSV/PDF export. Correcting the record rather than building a duplicate
  screen.

## Guest self-service pickup/delivery checkout — built and tested

The gap flagged above (guests could browse `/m/[branchId]` but not check out) is
closed. Rather than forcing pickup/delivery through the table-flow's route tree
(`/t/[sessionId]`, which is genuinely table-shaped — call waiter, shared bill, "who's
at this table" — none of which apply here), this is its own small, table-less flow
built on the same backend primitives:

- **`CustomerSession.tableSessionId` is now nullable** (additive schema change; every
  existing row still has one, so the table flow is byte-for-byte unchanged), with a
  new `branchId` on the session for when there's no table to reach a branch through.
- **A separate, smaller identity token** (`GuestSessionToken` / `mos_guest_session`
  cookie, `lib/customer-session.ts`) for table-less ordering, instead of making the
  existing `CustomerSessionToken` fields optional — every one of that type's many
  existing call sites keeps assuming a real table session, untouched.
- **`lib/orders.ts#createOrder`** already accepted an optional `tableSessionId` —
  guest orders simply omit it. The only real addition was a `delivery` param that
  creates the `DeliveryOrder` row atomically and adds the zone's fee on top of the
  priced total.
- **New routes**: `POST /api/guest-session` (establish/reuse the guest identity before
  checkout, so the cart's automatic-offer preview has something to price against),
  `POST /api/orders/guest` (place the order), `GET /api/orders/guest/mine` (this
  guest's own orders, not the whole table's), `GET /api/delivery/zones/public`
  (unauthenticated zone list for checkout). `POST /api/coupons/validate` now accepts
  either session type.
- **New pages**: `/m/[branchId]` (now a real orderable menu, Pickup/Delivery toggle,
  reuses `ProductCard`/`ProductModal`/`CartBar` verbatim from the table flow),
  `/m/[branchId]/cart` (checkout — name/phone, address+zone for delivery, "pay cash on
  pickup/delivery" — no fake payment path), `/m/[branchId]/orders` (status tracking).
  `CartBar` was generalized to take an `href` instead of assuming a table session id;
  the order-status timeline card was extracted into `OrderStatusCard` and is now
  shared by both the table and guest order-list pages instead of existing twice.
- **Realtime for a guest with no table**: a new `customer-session:<id>` room
  (`emitToCustomerSession`) that `order.status_changed`, `payment.updated`, and
  `delivery_order.updated` now also push to whenever an order has a
  `customerSessionId` — table-flow orders get this for free too, redundantly with
  their existing `table-session:<id>` push, at no cost.
- **A real bug found and fixed by hand-testing in a live browser**: `GET
  /api/delivery/zones` and `/api/delivery/zones/public` were returning Prisma
  `Decimal` fields unconverted; `NextResponse.json` serializes a `Decimal` as a
  *string*, so the cart's `subtotal + deliveryFee` was silently doing string
  concatenation ("5,500" + "3,500" rendered as "55,003,500 IQD") instead of addition.
  The actual charged total was always correct (server-side order creation always used
  `.toNumber()`) — this was a checkout-preview display bug only, but a real and
  confusing one, fixed by converting both Decimal fields to numbers before sending.
- **Tested for real**: `scripts/guest-ordering-test.mjs` — 25/25 checks: pickup and
  delivery orders with no prior session, the zone-fee-as-a-number regression test,
  per-guest order isolation (a second guest never sees the first's orders), realtime
  push to the guest's own socket room (verified with a real socket client), and the
  offline-sync + delayed-order checks below. Also hand-verified end-to-end in a live
  browser (Arabic and English, pickup and delivery, real Chrome automation) — see the
  bug found above.

## Offline/cloud sync extended to DeliveryOrder and LoyaltyTransaction

Reservation and Ingredient/Recipe stay local-only (same reasoning as
`TableSession`/`GameSession` below — no required scenario needs HQ-level visibility
into either). Delivery and loyalty are different: a delivery fee is revenue HQ needs to
see, and loyalty points are a real liability, so both got a genuine sync path, mirroring
the existing per-entity pattern exactly (new `AggregateType`, new `Cloud*` projection
table in `packages/cloud-db`, new `switch` case in `apps/cloud/server.js`):

- **`DeliveryOrder`**: syncs on creation and on every status/driver update
  (last-write-wins by `occurredAt`, same as every other mutable projection).
- **`LoyaltyTransaction`**: syncs as an append-only ledger (each transaction is its own
  row, not overwritten) — earned via a real order payment, admin `ADJUST`, or `REDEEM`
  all go through the same `syncLoyaltyTransaction` path in `lib/loyalty.ts`. Loyalty is
  brand-scoped but the outbox is branch-keyed, so every write carries whichever
  branch's action triggered it purely for sync routing — the payload itself still
  carries the real `brandId`.
- New read endpoints on the cloud service for verification/ops:
  `GET /branches/:id/delivery-orders`, `GET /brands/:id/loyalty-transactions`.
- **Tested for real**: covered by `scripts/guest-ordering-test.mjs` §6–7 — a delivery
  order and a loyalty-earning payment each actually reach the cloud DB with the correct
  fee/points/balance, not just "the outbox event was written."

## Delayed-order notifications — built and tested

The smallest mechanism that was actually appropriate: a `setInterval` in
`lib/delayed-orders.ts`, started from `instrumentation.ts` the same way the existing
sync engine already is (`startSyncEngine()` / `startDelayedOrderChecker()`, side by
side) — no new cron infrastructure introduced. Every 60s it flags any order still
`CREATED`/`CONFIRMED`/`PREPARING` more than 20 minutes after creation (a documented
default threshold, nothing pinned one) with a `DELAYED_ORDER` notification, guarded
against re-flagging the same order by checking for an existing notification rather than
adding a schema field. Also exposed as `POST /api/orders/check-delayed` (staff-only)
so it's both testable without waiting on the timer and usable as an on-demand "check
now" action. **Tested for real**: `scripts/guest-ordering-test.mjs` §8 — a stuck order
gets flagged exactly once even across repeated checks, and a non-staff request is
rejected.

## Production audit — a real, build-blocking issue found and fixed

Ran `npm run build` for the first time this session (everything before this had only
been verified in dev mode). It failed, twice, for two unrelated reasons — meaning the
app was **not actually production-deployable** before this pass:

- `app/api/qr/[id]/image/route.ts` passed a raw `Buffer` to `new NextResponse(...)`.
  Next's dev server tolerates this; `next build`'s type-check does not (`Buffer` isn't
  a `BodyInit`). Fixed the same way the PDF-export routes already do it: wrap in
  `new Uint8Array(...)`. This was flagged in earlier sessions as "one pre-existing,
  unrelated type error, left alone" — that was the wrong call once "does the
  production build succeed" was actually asked; it's fixed now, `tsc --noEmit` is 100%
  clean.
- Six admin/customer pages had raw `"`/`'` characters inside JSX text
  (`react/no-unescaped-entities`), which `next build`'s lint step treats as a hard
  error, not a warning. Escaped them (`&quot;`/`&apos;`) in `combos/page.tsx`,
  `kitchen/page.tsx`, `orders/page.tsx`, and `t/[sessionId]/cart/page.tsx`.
- A second real bug, found by hand-testing checkout in a live browser rather than by
  static analysis: `GET /api/delivery/zones` and `/api/delivery/zones/public` returned
  Prisma `Decimal` fields unconverted. `NextResponse.json` serializes a `Decimal` as a
  *string*, so the guest cart's `subtotal + deliveryFee` was doing string
  concatenation instead of addition ("5,500" + "3,500" rendered as "55,003,500 IQD").
  The actual charged total was always correct — every order-creation path already used
  `.toNumber()` server-side — this was a checkout-preview display bug only, but a real
  and confusing one. Fixed in both endpoints.
- `npm run build` now succeeds end-to-end (`packages/db` client generate → `next
  build`, exit 0) and a genuine `NODE_ENV=production` startup (not just the build) was
  verified separately: the built server actually starts, the sync engine and
  delayed-order checker both initialize, and `/`, `/admin/login`,
  `/manifest.webmanifest`, `/sw.js` all serve `200`.
- Also swept for missing auth checks (only the two intentionally-public guest routes
  lack one, by design) and for the same Decimal-as-string bug class elsewhere
  (nowhere else does client-side arithmetic on an unconverted API field).

## Reaction, Tap, and Memory games — built and tested

Reassessed after being flagged as "not clean to add" in an earlier pass — with an
explicit go-ahead, built as three new `GameRoundKind` values inside the *same* 30-Second
Challenge engine (`GameSession`/`GameRound`/`GamePlayer`/`GameResult` — no new tables,
no new game, no rebuild), because that's genuinely all `lib/game.ts`'s round lifecycle
needed:

- **Reaction**: the round reveals at a random moment (`meta.revealDelayMs`, 2–5s,
  chosen server-side when the round starts). Scoring is server-timed from
  `Date.now()` when the tap request arrives against `startedAt + revealDelayMs` — never
  the client's self-reported time, so a modified client can't fake a faster score.
  Tapping before reveal is a false start and scores 0, not a crash or a win.
- **Tap**: tap-as-fast-as-you-can. The client counts taps locally (no schema change
  needed — one `GameResult` row per player per round, same as every other kind) and
  auto-submits the final count once, at time-up. The count is clamped server-side
  (0–999) rather than trusted unbounded.
- **Memory**: the server generates a random sequence (`meta.sequence`, 4–6 symbols) the
  client shows briefly then hides; the player reproduces it by tapping symbols in
  order. Scored with partial credit for the longest correct prefix plus a bonus for an
  exact match, so a near-miss isn't worth the same as a total miss.
- Scoring math lives in a new pure module, `lib/game-scoring.ts` — no database, no
  Socket.IO — the same split `game-questions.ts#isAnswerCorrect` already uses, so it's
  unit-testable without a live server. **17 new unit tests**
  (`__tests__/game-scoring.test.ts`).
- **Reconnect handling** needed no new code: round state (kind, `meta`, `startedAt`,
  `timeLimitSeconds`) is always re-derivable from `GET /api/game/state`, and a
  reconnecting client recomputes "has reveal happened yet" / "how long is left" from
  that alone — the same mechanism TRIVIA/VOTE already relied on for this.
- A known, stated simplification: `revealDelayMs` and the memory `sequence` are sent to
  the client in the round payload (needed so the UI can render "wait for it" / show the
  sequence), so a technically-inclined player could in principle read them from the
  network tab instead of watching the screen. Given this is a casual bar/restaurant
  party game — not a competitive or wagering context — that's an accepted trade-off,
  not an oversight; noted rather than hidden.
- **Tested for real**: `scripts/games-test.mjs` — 14/14 checks against the live app:
  server-authoritative reaction timing (including the false-start case), tap-count
  clamping, exact and partial memory scoring, `GamePlayer.score` actually accumulating,
  the existing duplicate-answer rejection still holding, and one full real
  join→start→answer pass through the live engine (which happened to draw a REACTION
  round) to prove TRIVIA/VOTE weren't disturbed.

## Reservations — a real race condition fixed, then synced to the cloud

- **The conflict check had a genuine race**: `findConflictingReservation` read existing
  reservations and the caller then inserted, all inside one transaction — but Postgres's
  default READ COMMITTED isolation doesn't stop two *concurrent* transactions from both
  reading "no conflict" and both inserting, the exact race the coupon/promotion claim
  paths already guard against elsewhere in this codebase. Closed the same way: a
  transaction-scoped Postgres advisory lock (`pg_advisory_xact_lock`), keyed per table,
  taken before the conflict check — concurrent bookings on the *same* table now
  serialize; different tables never contend. Verified with real 5-way concurrency, not
  reasoned about: exactly one of five simultaneous overlapping booking attempts on one
  table succeeds, the other four get a `409`, and the database has exactly one live row.
- **Now syncs to the cloud** (`AggregateType: "Reservation"`, `CloudReservation`
  projection, last-write-wins by `occurredAt` — same pattern as every other mutable
  projection). Idempotency and retry/reconnect are inherited for free from the existing
  generic outbox/`SyncedEvent` machinery, same as every other synced entity; nothing
  bespoke was needed for those. Branch isolation is inherited too (the outbox is
  branch-keyed already) — noted as untested in this environment since the demo tenant
  only has one seeded branch to test cross-branch isolation against.
- **Tested for real**: `scripts/sync-extended-test.mjs` §1–3 — the concurrency race, a
  reservation reaching the cloud, and a status update (`PENDING` → `CONFIRMED`)
  reaching the cloud too.

## Ingredient / Recipe — local/cloud sync added

- New `AggregateType`s `"Ingredient"` and `"Recipe"`, new `CloudIngredient` /
  `CloudRecipeLine` projection tables. Both entities are brand-scoped, not
  branch-scoped (an ingredient is shared across a brand's branches) — but the
  outbox/sync transport is branch-keyed, so a new small helper,
  `lib/brand-routing.ts#getAnyBranchIdForBrand`, picks any branch of that brand purely
  to route the sync event; the payload itself still carries the real `brandId`, so
  nothing about the synced data is branch-specific. The same helper is reusable for any
  future brand-scoped entity.
- **Ingredient**: syncs on create and on every stock/threshold update
  (last-write-wins), so a reconnecting branch's inventory correction isn't lost or
  reverted by a stale retry.
- **Recipe**: the local `PUT /api/recipes/:productId` semantics are "replace the whole
  line list" (a recipe builder form, not an incremental editor) — the cloud sync
  mirrors that exactly: the handler deletes that product's old `CloudRecipeLine` rows
  and inserts the new set inside the same transaction, so a partial sync retry can
  never leave a mix of old and new lines, and cost/margin figures computed from the
  cloud projection stay correct.
- **Tested for real**: `scripts/sync-extended-test.mjs` §4–6 — an ingredient and a
  stock update both reach the cloud with the right numbers, a recipe's first version
  syncs with exactly the lines it should, replacing it syncs the new lines with zero
  leftover old ones, and the local GET endpoint still round-trips exactly as before.

## Branch-isolation authorization gap — closed across every admin/API route

The gap flagged in the previous pass ("most admin API routes check permission but not
whether the requested `branchId` is one the caller's role actually grants access to")
is fixed, tenant-wide.

- **One shared helper, `lib/branch-access.ts`**, used everywhere instead of the
  ad-hoc/duplicated checks that existed in a couple of places (`/api/orders` had its
  own inline version that — worse — skipped tenant isolation entirely for a
  tenant-wide caller): `getAccessibleBranchIds(user)` resolves a tenant-wide role
  (`branchIds: []`) to every branch of *their own tenant* (never another tenant's,
  regardless of what `branchId` a request asks about) or returns a branch-scoped
  role's list as-is; `checkBranchAccess(user, branchId)` is the one-line call-site
  pattern (`const denied = await checkBranchAccess(user, branchId); if (denied) return
  denied;`) used by every fix below.
- **Every branchId-accepting staff route audited and fixed** — reads, writes, resource-
  based updates (fetch-by-id then check the resource's own `branchId`, not a request
  param), and report exports (JSON/CSV/PDF all gated the same way): admin
  products/analytics/audit-log/availability, delivery (drivers, orders, zones),
  expenses, kitchen orders, notifications, orders (list, staff-create, discount,
  status, and the single-order `GET` — which previously accepted *any* authenticated
  staff session at all, from any branch or tenant, with no permission or branch check
  whatsoever, the worst instance found), payments, QR codes, refunds, all five
  sales/payments/refunds/expenses/branch-performance report endpoints plus the two
  shift-scoped ones (cash-reconciliation, shift-closing), reservations, shifts
  (open/list/current/close/adjust/cash-movements), sync status, tables, waiter
  requests. `branch-performance`'s own hand-rolled accessible-branches query was
  replaced with the shared helper for consistency.
- **`audit-log` and `notifications`** (both take an *optional* branchId) got the same
  treatment for the omitted case too: a tenant-wide caller still sees everything
  including branch-less tenant-level entries (unchanged), but a branch-scoped caller
  is now actually restricted to their own branches instead of seeing every branch's
  logs/notifications the moment they leave the filter off.
- **Brand-scoped resources deliberately left alone**: Coupons, Promotions, Combos,
  Ingredients, and Recipes are governed by `brandId`, not `branchId` — a different,
  narrower concern than what was reported, and changing their access model would be
  the "redesign" this pass was explicitly told not to do. The one exception is
  `/api/loyalty/accounts/:id/adjust`, named directly in the original report as an
  example of the gap: it takes no `branchId` at all (LoyaltyAccount is brand-scoped),
  so instead of a branch check it now verifies the caller has access to *some* branch
  of that account's brand — closing the concrete case that was named without
  redesigning Loyalty into a branch-scoped model it was never built as.
- **Tested for real**: `scripts/branch-isolation-test.mjs` — 17/17 checks, built
  against real fixtures (a second branch under the same tenant, a second tenant
  entirely with its own branch, and a Branch-Manager-scoped test user — chosen
  specifically because that role holds every permission the suite exercises, so a
  `403` can only mean the branch check fired, never an unrelated permission gap):
  allowed reads/writes on the user's own branch; denied reads, writes, a
  resource-by-id update, and a report export (JSON and CSV) on another branch of the
  *same* tenant, with the database checked afterward to confirm nothing was actually
  created/changed; the branch picker (`GET /api/branches`) never listing an
  inaccessible branch; a tenant-wide Owner keeping full access across their own
  tenant's branches; tenant isolation holding even for that tenant-wide Owner against
  a foreign tenant's branch; and a same-branch legitimate update still succeeding
  (the regression case).
- **REACTION/MEMORY round metadata is visible in the network payload** before the
  "reveal"/"watch" moment — a stated, accepted simplification for a casual party game,
  not a security-sensitive one (see the games section above).

## Still genuinely open

- **Card payments (Visa / Mastercard)** — built in `apps/web/lib/payments` on Mastercard
  Gateway (MPGS) Hosted Checkout, but switched off until the acquirer's credentials are set
  (`CARD_GATEWAY_*` in `.env.example`) and not yet run against a gateway sandbox. Without
  them the checkout stays cash-verified-by-staff, with no faked online-payment step.
- **Reservation cross-branch sync isolation** — the *sync* mechanism (as opposed to the
  authorization fix above) is identical to every other branch-keyed entity (isolated
  by construction, since the outbox is branch-keyed), but wasn't hand-verified this
  session for sync specifically because the demo tenant only has one seeded branch
  with real sync configuration.
- **Brand-level access control** (Coupon/Promotion/Combo/Ingredient/Recipe CRUD is
  gated by `brandId` with no check that the caller's role actually covers that brand)
  is a related but distinct and still-open gap — out of scope for this pass, which was
  specifically the `branchId` gap.

## Language — customer app is now English/Arabic with real RTL

- The customer app (`apps/web/lib/i18n.ts`, `LocaleContext.tsx`) defaults to the
  brand's `Brand.defaultLocale` (served by `GET /api/session`), with a per-device
  manual toggle persisted in `localStorage` — same convenience-storage pattern as
  the admin branch selector.
- `dir`/`lang` are set on a wrapping element from the active locale, driving real
  RTL layout (logical CSS properties, e.g. `end-4` on the locale toggle button), not
  just mirrored strings.
- The Staff Console (login + every admin page) is now English/Arabic too, on the same
  system: `lib/i18n-admin.ts` holds the `admin.*` strings as [English, Arabic] pairs
  and is merged into the same dictionaries. `app/admin/layout.tsx` wraps it in the
  same `LocaleProvider` (English by default), and a toggle sits in the sidebar and on
  the login page. Status, type and method values go through `enumLabel()`. Server-
  generated text (notification titles, API error messages) stays as the server sent
  it; in Arabic, notifications show a translated type heading above that text.
- Covered by `scripts/qr-session-flow-test.mjs` (brand locale reaches the customer
  session API) alongside the table-session-closed real-time push test.

## Offline-first / local-first sync — built and tested (see `docs/OFFLINE_ARCHITECTURE.md`)

- Transactional outbox (`OutboxEvent`) written in the same transaction as every order,
  kitchen cascade, payment, waiter request, and availability change.
- A background sync engine (`apps/web/lib/sync-engine.ts`, started via `instrumentation.ts`)
  drains the outbox to a genuinely separate cloud service (`apps/cloud`) with its own
  database (`packages/cloud-db`), with backoff on failure.
- Client-side order idempotency (`clientRequestId`) prevents duplicate orders from a
  retried/double-tapped submission.
- Cloud ingestion is idempotent (per-event commit, unique `SyncedEvent` ledger) and
  last-write-wins by `occurredAt` on every projection — not just the one case the design
  doc originally called out, after the test suite below caught a real ordering bug in
  the first pass and it was fixed uniformly.
- `LOCAL_ORIGIN` env var makes QR codes resolve on the restaurant's LAN regardless of
  what host an admin's browser happened to use to generate them.
- **Tested for real**, not just unit-tested: `scripts/offline-sync-test.mjs` genuinely
  kills and restarts the cloud process, injects a mid-batch crash, fires concurrent
  orders at one table, and re-sends already-applied events — 38/38 checks passing.
  Re-run it any time with `CLOUD_API_KEY_FOR_TEST=<key> node scripts/offline-sync-test.mjs`
  (both the local app on :3100 and the cloud DB must exist; the script starts/stops the
  cloud process itself).
- Not wired into the outbox yet: `TableSession` open/close and `GameSession` completion
  (the schema/cloud projection support GameSession already; nothing calls it). Neither
  was needed by the required test scenarios, and HQ reporting doesn't need table-session
  granularity today — noted here rather than silently left out.
- PWA manifest/service worker for the customer app is still not built — a separate,
  smaller concern from local-first operation, which doesn't depend on it.

## Financial Reports + Accounting + Analytics — built and tested

- **Shifts**: open (one at a time per branch, enforced), close with a required variance
  reason when counted cash doesn't match expected, and closed shifts are never edited in
  place — a correction goes through `POST /api/shifts/:id/adjust`, which writes a new
  audited before/after entry rather than silently overwriting the close record.
- **Cash reconciliation**: expected cash = opening + cash sales + cash-in − cash-out −
  cash refunds, computed from real `Payment`/`CashMovement`/`Refund` rows for the shift
  (`lib/shifts.ts`, unit-tested; `lib/reports.ts` wires it to real data).
- **Expenses** and **cash movements** (in/out with a reason), both shift-attributable.
- **Refunds**: there was no refund endpoint at all before this — `POST /api/refunds` is
  new. Full or partial, correctly updates `Payment`/`Order` status (including the
  split-bill case where an order has more than one payment), capped at what's actually
  refundable.
- **Order pricing** extended with branch-configurable `taxRatePercent` /
  `serviceFeeRatePercent` (`Branch`) and `Order.serviceFeeTotal`; `Payment.tipAmount` is
  entered at payment time, separate from the order total. All default to 0, so existing
  orders/pricing are unaffected unless a branch actually sets a rate.
- **Reports** (`/api/reports/*`): sales, payments, refunds, expenses, cash reconciliation,
  shift closing, branch performance — each with today/week/month/custom-range filters,
  each real-data-driven, each exportable as **PDF** (via `pdfkit`, real files — verified
  by checking the `%PDF` magic bytes and page count, not just a 200 status) and **CSV**.
  `reports.view` (JSON) and `reports.export` (PDF/CSV) are separate permissions.
- **Product analytics** (`/api/analytics/products`): top/low sellers, zero-sales products,
  category performance, peak hours, best days, and rising/declining trend vs. the
  previous equal-length period — all computed from real `OrderItem`/`Order` rows.
- **Audit log is now actually written to** (it existed in the schema but nothing used it
  before this): shift close, shift correction, cash movements, expenses, refunds, and
  product price changes all record user/before/after/timestamp/branch/shift.
- **Dashboard** extended with payment breakdown, discounts, refunds, expenses, live cash
  variance for the open shift, most/least sold product, peak hour, open orders, kitchen
  status by stage, and a factual revenue-vs-previous-period delta (real numbers, not an
  estimate) — while keeping the original "revenue" stat's exact meaning (paid/closed
  orders only) unchanged.
- **Offline-first**: shifts, expenses, cash movements, and refunds all go through the
  same outbox/sync engine built for orders — verified reaching the cloud with correct
  values, including a shift's *corrected* variance after an adjustment (not the stale
  pre-correction one).
- **Tested for real**: `scripts/financial-test.mjs` — 47/47 checks against the live app
  and both live databases, including RBAC denials, the required-reason variance rule,
  double-close rejection, over-refund rejection, real PDF/CSV bytes, and cloud sync of
  every new entity type. Re-run with `node scripts/financial-test.mjs` (needs the demo
  data seeded and both services running).

## Discounts & Coupons — the remaining gap from the financial section, now closed

- **Coupon** now carries the actual rule (percentage or fixed value, min order amount,
  a payout cap for percentage discounts, optional product/category scope, optional
  branch restriction, start/expiry window, usage limit) instead of being an empty
  shell that needed a `Promotion` to mean anything.
- **Self-service redemption** (`POST /api/orders` with `couponCode`) and **staff manual
  discounts** (`POST /api/orders/:id/discount`, before payment only, one per order) are
  two distinct paths, both fully server-validated — the client only ever sends a code
  or a type+value+reason, never an amount. A `POST /api/coupons/validate` preview
  endpoint runs the *exact* same pricing path so the cart's preview can never drift
  from what checkout actually charges.
- **Tax and service fee are computed on the post-discount amount**, which meant
  restructuring `priceCart` — subtotal → discount → tax/fee → total, not discount
  subtracted at the very end. Both discount paths now share this logic.
- **RBAC has three tiers**, not two: `promotions.manage` (create/deactivate a coupon),
  `discounts.apply` (redeem it or apply a small manual discount), `discounts.approve`
  (required only when a manual discount exceeds 20% of the order's subtotal — a
  Cashier can apply a small courtesy discount alone, a Branch Manager is required for
  a large one, and the Discount row records which permission tier authorized it).
- **Concurrency-safe usage limits**: claiming a coupon's last remaining use is a
  conditional `UPDATE ... WHERE usedCount < maxUses`, not read-then-write — verified
  under real concurrent load, not just reasoned about (see below).
- **Tested for real**: `scripts/discount-test.mjs` — 35/35 checks, including firing 5
  simultaneous checkouts at one single-use coupon and confirming exactly one succeeds
  and `usedCount` lands on exactly 1 (a genuine race, not a sequential simulation of
  one), plus valid/expired/not-yet-active/deactivated/below-minimum/oversized/
  wrong-branch/wrong-product rejections, the RBAC apply-vs-approve split, audit trail
  content, report inclusion, and cloud sync of a discounted order's post-discount total.
- Re-ran the offline-sync suite (38/38), the financial suite (47/47), and the unit
  tests (26/26) afterward — all still pass; nothing regressed.

## FREE_ITEM coupons — built and tested

- `Coupon.discountType` now supports `FREE_ITEM` for real: scoped to a product and/or
  category, the **cheapest matching unit** in the cart is made free (not the customer's
  pick, so ordering the priciest match can't be gamed), and the item's original price is
  never touched — `OrderItem.unitPriceSnapshot`/`lineTotal` stay exactly what the menu
  charges; the giveaway is recorded entirely as a separate `Discount` row
  (`amountApplied` = the original price, `freeProductId`/`freeProductName` identified),
  giving an explicit Original Price → Promotion Discount → Final Price = 0 trail in the
  order, payment, refund, report, analytics, and audit log — all from the same two rows,
  nothing hidden or recomputed.
- Works through both existing discount paths (self-service coupon code and staff manual
  discount), refunds correctly on mixed carts, supports a genuinely $0 order being marked
  paid, and is race-safe under concurrent redemption of a single-use code.
- **Tested for real**: `scripts/free-item-test.mjs` — 34/34 checks, including the
  cheapest-unit rule, a 5-way concurrent redemption race, a mixed-cart refund, and
  regression checks that plain PERCENTAGE/FIXED coupons still work unchanged.

## Promotions & Offers Engine — built and tested

The `Promotion` model (present in the schema since the start but unused) is now a real
rules engine, built *on top of* the Coupon/Discount machinery above rather than beside
it — a coupon can still exist entirely on its own, or be linked to a `Promotion` for
richer rules; either way `Discount`/refunds/audit/offline-sync are the same code path.

- **Eligibility → Benefit, one function covers every offer shape** in the spec except
  fixed-price combo/bundle pricing (see extension-point note below): percentage/fixed
  off (whole order or scoped to a product/category), BOGO-style quantity tiers —
  self-referential ("buy 2 get the 3rd free": 6 bought → 2 free, 7 bought → 6 counted +
  1 full price, verified against that exact worked example) or cross-referential
  ("buy 2 burgers, get a free dessert") — free item, and discounted item.
- **Automatic promotions** apply with zero customer action (no code); **coupon-based
  promotions** reuse the exact same `couponCode` field orders already accept. The
  customer-facing preview (`POST /api/coupons/validate`, code optional) surfaces
  whichever one actually won, by name, so the cart can show "3rd Free" without a code.
- **Scheduling**: day-of-week and minute-of-day windows (Happy Hour / weekend offers),
  a start/end date range, a minimum order amount, and a branch restriction.
- **Limits**: a global `maxUsesTotal` (claimed with the same race-safe conditional
  `UPDATE` pattern as Coupon), a per-customer `maxUsesPerCustomer` and `firstOrderOnly`
  (both keyed on the guest's `CustomerSession`, since there's no login), tracked in a
  new `PromotionRedemption` ledger — also the source of truth for real per-promotion
  analytics (orders using the offer, total discount cost, revenue generated, average
  order value, branch performance, products affected, uses remaining).
- **Priority-based, non-stacking conflict resolution**: exactly one discount source ever
  wins per order. A bare (non-promotion) coupon code beats an automatic promotion by
  default; two promotions resolve on their own configured `priority`, tie-broken by the
  larger discount amount.
- **Admin API**: create/list (search, status/branch filter)/get/edit/pause/resume/
  archive/duplicate (clones into a new `DRAFT`, never silently live)/analytics — all
  under `promotions.manage`, all audited. **Admin UI** at `/admin/promotions`: the same
  actions from a list view, plus a create form covering every eligibility/benefit/
  schedule/limit field and an inline analytics panel.
- **Race-safe `maxUsesPerCustomer` / `firstOrderOnly`** (closed a real gap): the
  pricing-time check is a fast-path only — the actual guarantee is
  `claimPromotionPerCustomerLimit` (`lib/promo-scheduling.ts`), called inside the
  order-creation transaction, which takes a transaction-scoped Postgres advisory lock
  keyed on `(promotionId, customer)` before counting prior redemptions. Two simultaneous
  requests from the same guest now serialize instead of both reading "0 prior uses" and
  both succeeding. Verified under real concurrency, not reasoned about — see testing below.
- **Customer-facing automatic-offer UX**: the Menu API now computes per-product badges
  ("Buy 2 Get 1 Free", "-10%", "Happy Hour · ...") and whole-order/combo banners
  server-side (`getMenuPromotionBadges`, `getActiveComboOffers`) — cosmetic only, the
  server stays the sole source of truth for the actual amount. The Cart auto-previews
  automatic offers via the existing `/api/coupons/validate` (no code) on every cart
  change, shown distinctly from a manually-applied code. Order details, the bill, and
  the admin order view all label promotion- and combo-driven discounts by name instead
  of a generic "Discount".
- **Tested for real**: `scripts/promotions-test.mjs` — 63/63 checks against the live app
  and both live databases: admin CRUD + RBAC, automatic and coupon-based promotions,
  both BOGO shapes with the exact worked example, category-scoped percentage-off,
  minimum order, branch restriction, Happy Hour scheduling, per-customer and global
  usage limits (the latter under real 5-way concurrency), priority/non-stacking
  (including a coupon beating a larger automatic promotion by default), refunds,
  offline sync, real analytics numbers, and a dedicated 5-way-concurrent-same-session
  test proving the `maxUsesPerCustomer` race fix actually holds.

## Fixed-Price Combos & Bundles — built and tested

A genuinely different pricing mechanism from Promotion — a bundle-price *override* for
a set of slots ("Burger + Fries + Drink = 15,000"), not a per-unit benefit — previously
flagged as an intentional extension point, now implemented as its own small engine
(`lib/combos.ts`) that plugs into the exact same priority-based, non-stacking candidate
resolution in `lib/pricing.ts` as coupons and promotions.

- **`ComboDeal` → `ComboSlot[]` → `ComboRedemption`**: a slot is "any ONE product from
  this list, quantity N" (e.g. "any burger ×1"); a combo needs every slot filled to form
  one complete set. The cheapest matching unit per slot counts toward "original value" —
  same fairness rule as FREE_ITEM — so a customer can't inflate savings by ordering the
  priciest match. `allowMultiplePerOrder` lets a big-enough cart form more than one set
  (2 full meal deals in one order), capped by the bottleneck slot.
- **Same non-destructive pattern as FREE_ITEM**: `OrderItem` prices are never touched —
  the bundle's savings live entirely in a `Discount` row (`type: "COMBO"`), so every
  item's original price is still intact for COGS/analytics/audit, and refunds work
  through the existing refund endpoint with zero changes.
- **Full support**: quantities per slot, branch restriction, day-of-week/time-of-day
  scheduling, a start/end date range, global and per-customer usage limits (both
  race-safe — the per-customer claim reuses the same advisory-lock helper as
  Promotion's), priority-based conflict resolution against coupons/promotions, real
  per-combo analytics (orders, sets sold, total savings, revenue, branch performance),
  and offline sync (no changes needed — the Order aggregate's `discountTotal`/`total`
  already carry the combo's effect, exactly like every other discount source).
- **Admin API + UI**: create (with a slot builder)/list/get/edit/pause/resume/archive/
  duplicate/analytics at `/admin/combos`, under the same `promotions.manage` permission
  — no new permission key, no duplicate engine.
- **Tested for real**: `scripts/combo-test.mjs` — 50/50 checks: admin CRUD + validation
  + RBAC, core fixed-price math, a missing slot correctly granting no discount, multi-set
  formation, slot quantities >1, branch restriction, scheduling, global and per-customer
  concurrency races (5-way, both closed), priority resolution against an automatic
  promotion in both directions, and the full financial flow (payment → refund → reports
  → analytics → audit → offline sync) on a combo-discounted order.

## Customer QR/table/session lifecycle — a real gap closed

- Staff freeing a table (`PATCH /api/tables/:id` → `AVAILABLE`) now proactively pushes
  `table_session.closed` over the same Socket.IO channel used elsewhere
  (`emitToTableSession`, room `table-session:<id>`), so a guest still browsing the menu
  finds out immediately instead of only discovering it on their next fetch/order attempt
  (which already 410'd correctly, just silently). The customer layout
  (`apps/web/app/t/[sessionId]/layout.tsx`) listens for it and shows a "session ended"
  screen right away.
- **Tested for real**: `scripts/qr-session-flow-test.mjs` — 7/7 checks: brand locale on
  `/api/session`, a real socket client receiving the event within the 5s window, the
  event identifying the correct table session, and the session actually landing `CLOSED`
  in the database (not just announced).

## Light/Dark theme + brand palette (#13131A / #FFFFFF / #F6FF72) — built and checked

- **Themes**: dark `#13131A` background with `#FFFFFF` text, light `#FFFFFF` background with
  `#13131A` text. First visit follows the OS; the toggle (customer app, guest ordering,
  admin sidebar, login, landing, invalid-code) persists the choice in `localStorage`
  (`mos_theme`). A blocking inline script in `app/layout.tsx` sets `<html data-theme>`
  before paint, so there's no flash of the wrong theme; `<meta name="theme-color">` follows.
- **Accent**: brand lime `#F6FF72` in both themes, used as a fill under `#13131A` text
  (buttons, cart bar, call-waiter). Lime on white is ~1.1:1, so accent drawn as ink (text,
  outlines, spinners, chart bars) uses a separate `--accent-ink` token (`text-accent-ink`,
  `border-accent-ink`): the same lime in dark, a deep olive of the same hue in light
  (~5.5:1 on white).
- Everything reads CSS tokens (`app/globals.css`); the audit found no hard-coded palette
  classes left beyond scrims (`bg-black/50`) and white-on-success/danger. The app icon,
  QR PNG ink and PDF export headings moved to `#13131A`/`#F6FF72` too.
- **Visual QA** (headless Chrome, light/dark × EN/AR × 390px/1440px, customer + guest +
  admin, 124 screenshots with an automated WCAG contrast/overflow pass). Fixed: light-mode
  success/warning/danger were too pale as text (badges at 2.0:1) and dark danger badges were
  4.0:1, so status tokens were retuned per theme and solid status fills use
  `text-background` instead of `text-white`. The customer theme/language toggles covered page
  headers; they now scroll with the page, with content padded below them. Call Waiter
  covered the cart bar; it now lifts above it (`data-cart-bar`). Final pass: 0 contrast
  failures, 0 overflow, 0 console errors.
- **Admin on phones**: below `md` (768px) the sidebar is an off-canvas drawer, opened from a
  slim top bar and closed on navigation or a backdrop tap. At `md` and above it's the same
  sticky column as before.

## Testing

- Unit tests cover pure logic that doesn't need a live database: RBAC checks, the
  order status state machine, the 30-Second Challenge answer matcher, money formatting,
  cash-reconciliation math, CSV formatting.
- Every integration suite above is real: two live Postgres databases, two live
  processes, zero mocks — 385 passing integration checks (offline-sync 38 + financial
  54 + discount 35 + FREE_ITEM 34 + promotions 63 + combos 50 + qr-session-flow 7 +
  phase2 29 + guest-ordering 25 + sync-extended 19 + games 14 + branch-isolation 17)
  plus 46 unit tests (17 for game scoring): **431 total**.
- The reported combo-test count was specifically re-verified by actually re-running
  `scripts/combo-test.mjs`: 50/50, matching what this document already said — no
  correction needed there. `financial-test.mjs` genuinely did grow from 47 to 54 checks
  in a prior session without this document being updated; that count is corrected above.
- `npx tsc --noEmit` is now **100% clean, zero errors** — the one pre-existing
  `qr/[id]/image` Buffer/BodyInit error noted in every prior pass is fixed (see the
  production-audit section above; it was actually blocking `next build`, not just a
  cosmetic type-checker complaint).
- `npm run build` (the real production build: `packages/db` client generate → `next
  build`, lint + type-check + prerender) succeeds end-to-end, and a genuine
  `NODE_ENV=production` server start was verified separately from the build itself.
- Re-ran every existing integration suite (offline-sync, financial, discount,
  FREE_ITEM, promotions, combos, qr-session-flow, phase2, guest-ordering) plus the full
  unit suite after every round of this session's work, including after the production
  rebuild and the dev/prod server-restart cycle that verification required — all still
  pass. `offline-sync-test.mjs` threw one flaky timing assertion on a single run under
  heavy concurrent load from other tests; re-ran clean (38/38) immediately after — noted
  as a flake, not a regression, since re-running is how it was actually confirmed rather
  than assumed.
- **Real browser QA this session** (Claude-in-Chrome was connected): logged into
  `/admin` and clicked through Reservations (create + conflict rejection was already
  integration-tested; the create form and status actions were driven live),
  Delivery (an order walked from NEW through CONFIRMED via the UI), Loyalty (expanded
  an account, saw its real transaction history), Inventory (ingredients + low-stock
  badge), Audit Log (expanded a real before/after diff), Customers. Separately drove
  the entire guest flow end-to-end in the browser twice (pickup and delivery, English
  and Arabic/RTL, including the modifier-group product modal and the live realtime
  status-timeline update) — this is what caught the Decimal-serialization bug described
  above; an integration test alone would not have (the server-side total was always
  correct, only the client preview was wrong).
- Pricing and availability logic are exercised via both integration tests and manual
  smoke tests, not (yet) a dedicated Vitest integration suite — worth adding next.
