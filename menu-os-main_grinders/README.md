# Menu OS — Restaurant Experience Platform

One QR per table → **Order, Play, Pay, Call Waiter**. A production-grade,
multi-tenant platform for restaurants and cafes, not a QR-menu toy.

## Stack

- **Next.js 14** (App Router) + TypeScript — customer PWA and admin dashboard in one app
- **PostgreSQL + Prisma** — multi-tenant relational schema (`packages/db`)
- **Socket.io** — real-time orders, kitchen, tables, waiter requests, multiplayer games
- **NextAuth** (credentials) — staff RBAC login
- **Tailwind CSS** — premium design system, dark/light, mobile-first customer UI

## Monorepo layout

```
apps/web              Next.js app (customer experience + admin dashboard + API)
apps/cloud            Standalone HQ sync/aggregation service (its own DB, its own process)
packages/db           Local operational Prisma schema, client, seed script
packages/cloud-db     Cloud aggregation Prisma schema + client
docs/STATUS.md        What's built, what's a stub, what's next
docs/OFFLINE_ARCHITECTURE.md   Local-first/offline-sync design
scripts/offline-sync-test.mjs  Real test suite for offline-first/sync
scripts/financial-test.mjs     Real test suite for shifts/refunds/reports/exports
```

## This machine's setup (already done)

This repo has already been set up and verified end-to-end on this machine:

- A dedicated, self-contained PostgreSQL 16 instance was initialized at
  `C:\Users\M.R\.menu-os\pgdata`, running on **port 5434** (not the default 5432 — this
  machine already had a different PostgreSQL 17 installed for something else, so a
  separate instance was created rather than touching it). It runs as a plain background
  process, not a Windows service, so **it needs to be started again after a reboot**:
  ```
  "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" start -D "C:\Users\M.R\.menu-os\pgdata" -o "-p 5434" -l "C:\Users\M.R\.menu-os\pglogs\postgres.log"
  ```
- `packages/db/.env` and `apps/web/.env.local` are already filled in and point at it.
- The schema is pushed and the "Aurum" demo restaurant is seeded.
- Port **3000 was already in use** by something else on this machine, so the app runs on
  **port 3100** instead (`NEXTAUTH_URL` is already set accordingly).

To start the app after a reboot: make sure the command above is running, then:
```
npm run dev
```
(or `PORT=3100 npm run dev` if you ever change the default) and open
`http://localhost:3100`.

## First-time setup (for a fresh machine / different environment)

1. **PostgreSQL** must be running and reachable (see above for how this machine's instance
   is set up; adjust `DATABASE_URL` if pointing at a different one).
2. Copy `.env.example` to **both** `packages/db/.env` and `apps/web/.env.local`, filling in
   `DATABASE_URL`, `NEXTAUTH_SECRET`, `CUSTOMER_SESSION_SECRET`.
3. Install dependencies from the repo root:
   ```
   npm install
   ```
4. Push the schema and seed the demo restaurant ("Aurum"):
   ```
   npm run db:push
   npm run db:seed
   ```
5. Start the app (Next.js + Socket.io in one process):
   ```
   npm run dev
   ```
6. Open `http://localhost:3100/admin/login` (or `:3000` if that port is free on your
   machine) — demo logins (password `Password123!`):
   - `admin@aurum.demo` — Owner (full access)
   - `manager@aurum.demo` — Branch Manager
   - `cashier@aurum.demo` — Cashier
   - `waiter@aurum.demo` — Waiter
   - `kitchen@aurum.demo` — Kitchen
   - `accountant@aurum.demo` — Accountant (reports, refunds, expenses, audit log; no menu/order editing)
7. To experience the customer side, go to **Admin → QR Codes**, download a table's QR, and
   open its `/r/<token>` link (or scan it with a phone on the same network).
8. Optional — for offline-first sync and the cloud/HQ aggregation service, see
   `docs/OFFLINE_ARCHITECTURE.md`: `npm run cloud:push`, `npm run cloud:seed`
   (with `SEED_BRANCH_ID`/`SEED_TENANT_ID` env vars — see `packages/cloud-db/prisma/seed.ts`),
   then `npm run dev:cloud`, and set `CLOUD_SYNC_URL`/`CLOUD_BRANCH_ID`/`CLOUD_API_KEY` in
   `apps/web/.env.local`. Without these, the app runs exactly the same, just local-only.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the app in development |
| `npm run dev:cloud` | Start the cloud/HQ sync service |
| `npm run db:push` | Sync the local Prisma schema to the database (no migration history — fine for early dev) |
| `npm run db:migrate` | Create a tracked migration (use once the schema stabilizes) |
| `npm run db:seed` | Reset/seed the demo restaurant |
| `npm run db:studio` | Open Prisma Studio to browse local data |
| `npm run cloud:push` / `cloud:seed` / `cloud:studio` | Same, for the cloud database |
| `npm run test` | Run the Vitest unit tests |
| `node scripts/offline-sync-test.mjs` | Real integration test: offline-first/sync (needs `CLOUD_API_KEY_FOR_TEST`) |
| `node scripts/financial-test.mjs` | Real integration test: shifts, refunds, reports, exports |
| `node scripts/discount-test.mjs` | Real integration test: coupons, manual discounts, RBAC, concurrency |
| `node scripts/free-item-test.mjs` | Real integration test: FREE_ITEM coupons, refunds, concurrency |
| `node scripts/promotions-test.mjs` | Real integration test: Promotions Engine — automatic/coupon offers, BOGO, priority, limits, analytics |
| `node scripts/combo-test.mjs` | Real integration test: fixed-price combos/bundles — slots, quantities, limits, priority, refunds |

See `docs/STATUS.md` for an honest breakdown of what's fully wired to the database
versus what's an intentional extension point for a later phase.
