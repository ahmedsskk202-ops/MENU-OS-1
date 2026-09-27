# The Grinders Coffee House — Prototype

An adaptation of the Menu OS app into a branded, bilingual prototype for
**The Grinders Coffee House, Baghdad**. The existing application is reused, not
replaced: every Grinders screen runs on the same catalog, cart, order, kitchen,
payments and admin machinery as the original demo.

## Quick start

```bash
npm install
npm run db:push
npm run db:seed:grinders     # the Grinders brand, branch, and full menu
PORT=3100 npm run dev
```

Then open:

| What | URL |
| --- | --- |
| Landing page | `http://localhost:3100/` |
| Guest menu (no table) | `http://localhost:3100/m/cmuikcel30004926bu95r82gq` |
| Table QR (Table 1) | `http://localhost:3100/r/grinders-table-1` |
| Menu-wide QR | `http://localhost:3100/r/grinders-menu-main` |
| Staff login | `http://localhost:3100/admin/login` |

Staff accounts (password `Password123!`):

| Role | Email |
| --- | --- |
| Owner | `admin@grinders.demo` |
| Branch Manager | `manager@grinders.demo` |
| Cashier | `cashier@grinders.demo` |
| Waiter | `waiter@grinders.demo` |
| Kitchen | `kitchen@grinders.demo` |

Verify the whole thing end to end:

```bash
node scripts/grinders-verify.mjs      # 34 checks
npm test                              # 86 unit tests
```

## Where the menu data came from

The menu is a **local snapshot of the real Grinders menu**, not invented content.

- Captured from the client's live menu app (`grindersiq.iraqsapp.com/view/tabs/products`)
  via its JSON endpoints (`/category?status=1`, `/product/?category=<id>&status=1`).
- Stored in `packages/db/prisma/grinders-menu.json` — **15 categories, 136 products**,
  each with its real Arabic name, real English name, real IQD prices, and real
  product photo.
- All 151 images were downloaded into `apps/web/public/menu/` and the real logo into
  `apps/web/public/brand/grinders-logo.png`. **Nothing hotlinks the live site**, so the
  prototype keeps working if that host goes away.
- `name`/`description` in the seed hold the English label (so the admin console and any
  non-localized caller read naturally); `nameAr`/`nameEn` drive the customer UI.

To refresh the menu later, re-run the capture against the live site and re-seed.

## How size variants work

Grinders publishes three parallel price columns per item (`price_s` / `price_m` /
`price_l`), where `0` means that size genuinely isn't offered.

Rather than adding a bespoke size code path, sizes are modelled as a **per-product
`ModifierGroup` named "Size"** — required, pick exactly one — with each option's
`priceDelta` as the step up from the cheapest size:

| Size | `priceDelta` | Real price |
| --- | --- | --- |
| صغير / Small | 0 | 6,000 IQD |
| وسط / Medium | +500 | 6,500 IQD |
| كبير / Large | +1000 | 7,000 IQD |

This means size selection is validated and priced by the **existing server-side
pricing engine**, exactly like any other modifier. A client cannot order a Large at the
base price, and cannot attach a size to a product that has no size group. 78 of the 136
products carry a size selector; the other 58 are single-price items.

**Not every sized item has all three sizes.** The live menu publishes `0` for a size an
item isn't sold in, and 58 items are in fact single-size — many of them Medium-only
(e.g. prices `[0, 5000, 0]`). Those deliberately get **no** size selector and simply show
their one price, because offering a one-option picker would be noise. The verification
script re-derives the expected price for all 136 products straight from
`grinders-menu.json` and fails if any displayed price differs, so the prototype cannot
drift from the client's published menu.

`ModifierOption` also gained a `sortOrder` field. Without it the API returned size
options in whatever order the database yielded, and a size group could render
Large / Medium / Small. The API now orders by it, so sizes always read smallest → largest.

## Brand & design

The palette lives in `apps/web/app/globals.css` as HSL custom properties.

- **Dark is the default on every device** — the warm near-black with gold *is* the
  Grinders identity, not a user preference, so there is deliberately no
  `prefers-color-scheme` block. The header toggle still switches to light and remembers
  the choice.
- **Accent** is a warm gold (`hsl(40 68% 52%)`), the single accent used for the cart bar,
  active category pill, and selected size.
- **`--leaf`** is a natural plant green, used sparingly (seasonal badge) rather than as
  a second accent.
- The warm hue family comes from the live Grinders app, which ships `--color: #6e1f00`
  (espresso brown) as its own brand colour.
- Arabic uses the app's existing Cairo font and renders RTL. Arabic is the default
  locale (`brand.defaultLocale = "ar"`); English is one tap away and both names show.

### Bilingual search

Search matches **both** the Arabic and the English name of every product regardless of
the UI locale, because Iraqi customers routinely type either. Arabic is normalized
(أ/إ/آ → ا, ة → ه, diacritics stripped) so `إسبريسو` finds `اسبريسو`. Searching `latte`
while the UI is in Arabic returns the same 24 items as `لاتيه`.

## What was added vs. changed

**New**
- `packages/db/prisma/grinders-menu.json` — the real menu snapshot
- `packages/db/prisma/seed-grinders.ts` — Grinders tenant/brand/branch/menu seed
- `apps/web/public/brand/grinders-logo.png` — the real client logo
- `apps/web/public/menu/{categories,products}/` — 151 real images, served locally
- `apps/web/components/brand/GrindersLogo.tsx`
- `apps/web/components/customer/GrindersHeader.tsx` — logo, brand, search
- `apps/web/components/customer/CategoryRail.tsx` — sticky scrollable category rail
- `apps/web/components/customer/MenuBrowser.tsx` — shared menu experience
- `apps/web/lib/localized.ts` — locale-aware name/description resolution
- `scripts/grinders-verify.mjs` — 34-check end-to-end verification

**Changed**
- `packages/db/prisma/schema.prisma` — optional `nameAr`/`nameEn`/`descriptionAr`/`descriptionEn` on
  `Product` and `Category`, `nameAr`/`nameEn` on `ModifierGroup`/`ModifierOption`, and
  `sortOrder` on `ModifierOption`. All additive; `name`/`description` remain the fallback
  so existing rows and callers are unaffected.
- `globals.css` / `tailwind.config.ts` — Grinders palette, plus a `--leaf` / `leaf` token
- `app/layout.tsx` — dark by default, brand `theme-color`
- `api/menu/route.ts` + `lib/menu-types.ts` — expose the bilingual fields
- `ProductCard.tsx`, `ProductModal.tsx` — bilingual, size-aware, pill size selector
- `app/t/[sessionId]/menu/page.tsx`, `app/m/[branchId]/page.tsx` — both use `MenuBrowser`
- `app/page.tsx` — Grinders landing page

The **Aurum demo seed is untouched** and still works — Grinders is a separate tenant, so
nothing that already functioned was replaced.

## Known gaps

- The admin product editor edits `name`/`description` only; it does not yet expose the
  `nameAr`/`nameEn` fields as form inputs. Editing through Prisma Studio works today.
- Order lines store a `nameSnapshot` in the DB, so the order confirmation screen shows the
  canonical (English) item name even when ordering in Arabic. This is deliberate for
  kitchen-facing accuracy, but a bilingual receipt would need the locale-aware snapshot.
- A PWA service worker (`public/sw.js`) aggressively caches chunks in dev. After editing
  translations, unregister it in DevTools → Application → Service Workers, or you will see
  a stale string.
- `apps/cloud` (the multi-tenant cloud tier) is not part of this prototype; the app runs
  local-only, which the server logs as a supported mode.
