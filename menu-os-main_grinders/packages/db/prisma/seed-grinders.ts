/**
 * THE GRINDERS COFFEE HOUSE — prototype seed (Baghdad, Iraq).
 *
 * Menu data is a local, authoritative snapshot of the live Grinders menu, captured
 * into `grinders-menu.json` (15 categories / 136 products, Arabic + English names,
 * real IQD prices, real product photography downloaded to apps/web/public/menu).
 * Nothing here calls the live site at runtime — the prototype works fully offline.
 *
 * This seeds a SEPARATE tenant from the existing "Aurum" demo, so nothing that
 * already works is touched or replaced.
 *
 * Run: npm run seed:grinders
 */
import { PrismaClient } from "../generated/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { json } from "../src/sqlite-codec";
import { syncTenantRoles } from "../src/role-sync";
import { GRINDERS_STATIONS, stationForGrindersProduct } from "./grinders-stations";

// Prisma reads .env relative to the schema, but `npm run seed` is invoked from
// this package dir while the schema lives in ./prisma — so load it explicitly
// rather than depending on which directory the runner happens to start in.
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const prisma = new PrismaClient();

// Local authoritative snapshot — no network call at seed time.
const menuData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "grinders-menu.json"), "utf8")
);

// Permissions and roles come from the shared registry (src/rbac.ts) via src/role-sync.ts.
// This file used to keep its own copy, which silently lacked `orders.serve` — so a
// Grinders waiter had no floor screen and could not serve an order.

// Grinders expresses size variants as three parallel price columns. A 0/absent
// column means that size genuinely isn't offered for the item, so we only build a
// size selector when there's more than one real price to choose between.
const SIZE_LABELS: { key: "s" | "m" | "l"; en: string; ar: string }[] = [
  { key: "s", en: "Small", ar: "صغير" },
  { key: "m", en: "Medium", ar: "وسط" },
  { key: "l", en: "Large", ar: "كبير" },
];

function sizeOptionsFor(prices: { s: number; m: number; l: number }) {
  const offered = SIZE_LABELS.filter((s) => (prices[s.key] ?? 0) > 0);
  if (offered.length < 2) return null;
  // The product's headline price is the cheapest size; each option's priceDelta is
  // relative to that, which is exactly how the existing pricing engine applies
  // modifier options. Deltas may be negative on paper, never in practice here
  // (cheapest is the base), but the Decimal column accepts it either way.
  const base = Math.min(...offered.map((s) => prices[s.key]));
  return { base, offered };
}

async function main() {
  console.log("Seeding THE GRINDERS COFFEE HOUSE (Baghdad) from local menu snapshot...");
  console.log(`  source snapshot: ${menuData.categories.length} categories, ` +
    `${menuData.categories.reduce((a: number, c: { products: unknown[] }) => a + c.products.length, 0)} products`);

  // ── Tenant / Brand / Branch ─────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "grinders" },
    create: { name: "The Grinders Coffee House", slug: "grinders" },
    update: {},
  });

  const brand = await prisma.brand.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "grinders" } },
    create: {
      tenantId: tenant.id,
      slug: "grinders",
      name: "The Grinders",
      // The real client logo, served locally so the prototype never hotlinks.
      logoUrl: "/brand/grinders-logo.png",
      currency: "IQD",
      // Grinders is an Iraqi brand; the customer app opens in Arabic and switches
      // to English per device.
      defaultLocale: "ar",
      themeConfig: json({ accent: "#d9a94a", leaf: "#4f7d5c", surface: "#0d0a08" }),
    },
    update: { logoUrl: "/brand/grinders-logo.png", currency: "IQD", defaultLocale: "ar", themeConfig: json({ accent: "#d9a94a", leaf: "#4f7d5c", surface: "#0d0a08" }) },
  });

  const branch = await prisma.branch.upsert({
    where: { brandId_slug: { brandId: brand.id, slug: "baghdad" } },
    create: {
      brandId: brand.id,
      slug: "baghdad",
      name: "Baghdad",
      city: "Baghdad",
      // No invented address/phone — the client's real details weren't published in
      // the menu source, so these stay null rather than being made up.
      address: null,
      phone: null,
      timezone: "Asia/Baghdad",
    },
    update: {},
  });

  // ── Permissions, roles, staff ───────────────────────────────────────
  const roleRecords = await syncTenantRoles(prisma, tenant.id, console.log);

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const staff: { email: string; name: string; role: string; branchScoped: boolean }[] = [
    { email: "admin@grinders.demo", name: "Grinders Owner", role: "Owner", branchScoped: false },
    { email: "cashier@grinders.demo", name: "Grinders Cashier", role: "Cashier", branchScoped: true },
    { email: "waiter@grinders.demo", name: "Grinders Waiter", role: "Waiter", branchScoped: true },
    { email: "kitchen@grinders.demo", name: "Grinders Kitchen", role: "Kitchen", branchScoped: true },
  ];
  for (const s of staff) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: s.email } },
      create: { tenantId: tenant.id, email: s.email, name: s.name, passwordHash },
      update: {},
    });
    const scopedBranchId = s.branchScoped ? branch.id : null;
    const existing = await prisma.userBranchRole.findFirst({
      where: { userId: user.id, roleId: roleRecords[s.role], branchId: scopedBranchId },
    });
    if (!existing) {
      await prisma.userBranchRole.create({ data: { userId: user.id, roleId: roleRecords[s.role], branchId: scopedBranchId } });
    }
  }

  // ── Kitchen stations (a coffee house, not a grill house) ────────────
  const stationNames = GRINDERS_STATIONS;
  const stations: Record<string, string> = {};
  for (const [i, name] of stationNames.entries()) {
    const station = await prisma.kitchenStation.upsert({
      where: { id: `${branch.id}-${name}` },
      create: { id: `${branch.id}-${name}`, branchId: branch.id, name, sortOrder: i },
      update: {},
    });
    stations[name] = station.id;
  }

  // ── Zones, tables, QR codes ─────────────────────────────────────────
  const zones: Record<string, string> = {};
  for (const name of ["Indoor", "Terrace"]) {
    const zone = await prisma.zone.upsert({
      where: { id: `${branch.id}-${name}` },
      create: { id: `${branch.id}-${name}`, branchId: branch.id, name },
      update: {},
    });
    zones[name] = zone.id;
  }
  for (let i = 1; i <= 10; i++) {
    const label = String(i);
    const zoneKey = i <= 6 ? "Indoor" : "Terrace";
    const table = await prisma.restaurantTable.upsert({
      where: { branchId_label: { branchId: branch.id, label } },
      create: { branchId: branch.id, label, capacity: i <= 6 ? 4 : 6, zoneId: zones[zoneKey] },
      update: {},
    });
    await prisma.qRCode.upsert({
      where: { token: `grinders-table-${label}` },
      create: { branchId: branch.id, tableId: table.id, type: "TABLE", label: `Table ${label}`, token: `grinders-table-${label}` },
      update: {},
    });
  }
  // A menu-wide QR so the menu is reachable without sitting at a table.
  await prisma.qRCode.upsert({
    where: { token: "grinders-menu-main" },
    create: { branchId: branch.id, type: "MENU", label: "Main Menu", token: "grinders-menu-main" },
    update: {},
  });

  // ── Menu / Categories / Products / Size modifiers ───────────────────
  const menu = await prisma.menu.upsert({
    where: { id: `${brand.id}-main` },
    create: { id: `${brand.id}-main`, brandId: brand.id, name: "Main Menu" },
    update: {},
  });

  // Size variants become a per-product "Size" modifier group (required, pick exactly
  // one). The product's base price is its cheapest size; each option's priceDelta is
  // the step up to that size. This reuses the existing modifier machinery end to end,
  // so size selection is validated and priced server-side like any other option — no
  // bespoke size code path, and the customer UI gets a real size selector for free.
  let productCount = 0;
  let sizedCount = 0;

  for (const [ci, cat] of menuData.categories.entries()) {
    const category = await prisma.category.upsert({
      where: { id: `${menu.id}-${cat.remoteId}` },
      create: {
        id: `${menu.id}-${cat.remoteId}`,
        menuId: menu.id,
        // `name` stays the English label so the admin console and any non-localized
        // caller read naturally; nameAr/nameEn drive the customer UI per locale.
        name: cat.nameEn ?? cat.nameAr,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        imageUrl: cat.image ? `/menu/categories/${cat.remoteId}.png` : null,
        sortOrder: ci,
      },
      update: { name: cat.nameEn ?? cat.nameAr, nameAr: cat.nameAr, nameEn: cat.nameEn, imageUrl: cat.image ? `/menu/categories/${cat.remoteId}.png` : null, sortOrder: ci },
    });

    for (const p of cat.products) {
      const sizes = sizeOptionsFor(p.prices);
      const basePrice = sizes ? sizes.base : (p.prices.s || p.prices.m || p.prices.l);

      const product = await prisma.product.upsert({
        where: { id: `${category.id}-${p.remoteId}` },
        create: {
          id: `${category.id}-${p.remoteId}`,
          categoryId: category.id,
          name: p.nameEn ?? p.nameAr,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          description: p.descEn ?? p.descAr,
          descriptionAr: p.descAr,
          descriptionEn: p.descEn,
          imageUrl: p.image ? `/menu/products/${p.remoteId}.png` : null,
          basePrice,
          tags: json([]) ?? "[]",
          allergens: json([]) ?? "[]",
          sortOrder: p.sort,
          isSeasonal: cat.nameEn === "Autumn Collection",
          isNew: false,
          isFeatured: false,
        },
        update: {
          name: p.nameEn ?? p.nameAr,
          nameAr: p.nameAr, nameEn: p.nameEn,
          description: p.descEn ?? p.descAr,
          descriptionAr: p.descAr, descriptionEn: p.descEn,
          imageUrl: p.image ? `/menu/products/${p.remoteId}.png` : null,
          basePrice,
          sortOrder: p.sort,
        },
      });
      productCount++;

      // Per-branch availability drives the live sold-out / low-stock UI.
      await prisma.productAvailability.upsert({
        where: { productId_branchId: { productId: product.id, branchId: branch.id } },
        create: { productId: product.id, branchId: branch.id, status: "AVAILABLE" },
        update: {},
      });

      // Kitchen routing — exactly one station per product, decided per product (see
      // grinders-stations.ts). Any other route left by an earlier seed is removed, so
      // re-seeding an existing database corrects a mis-routed item instead of adding a
      // second ticket for it.
      const stationId = stations[stationForGrindersProduct(cat.nameEn ?? "", p.nameEn ?? p.nameAr ?? "")];
      await prisma.productStation.deleteMany({ where: { productId: product.id, stationId: { not: stationId } } });
      await prisma.productStation.upsert({
        where: { productId_stationId: { productId: product.id, stationId } },
        create: { productId: product.id, stationId },
        update: {},
      });

      if (sizes) {
        sizedCount++;
        const perProductGroup = await prisma.modifierGroup.upsert({
          where: { id: `${product.id}-Size` },
          create: { id: `${product.id}-Size`, brandId: brand.id, name: "Size", nameEn: "Size", nameAr: "الحجم", isRequired: true, minSelect: 1, maxSelect: 1 },
          update: {},
        });
        // Sort by the canonical size order, not the order the item happens to
        // offer them, so a "Medium only" item still gets the Medium slot.
        const ordered = [...sizes.offered].sort(
          (a, b) => SIZE_LABELS.findIndex((s) => s.key === a.key) - SIZE_LABELS.findIndex((s) => s.key === b.key)
        );
        for (const [i, s] of ordered.entries()) {
          const delta = p.prices[s.key] - sizes.base;
          await prisma.modifierOption.upsert({
            where: { id: `${perProductGroup.id}-${s.en}` },
            create: {
              id: `${perProductGroup.id}-${s.en}`,
              groupId: perProductGroup.id,
              name: s.en, nameEn: s.en, nameAr: s.ar,
              priceDelta: delta,
              isDefault: delta === 0,
              sortOrder: i,
            },
            update: { nameAr: s.ar, priceDelta: delta, isDefault: delta === 0, sortOrder: i },
          });
        }
        await prisma.productModifierGroup.upsert({
          where: { productId_groupId: { productId: product.id, groupId: perProductGroup.id } },
          create: { productId: product.id, groupId: perProductGroup.id },
          update: {},
        });
      }
    }
  }

  console.log(`\n  ${productCount} products across ${menuData.categories.length} categories`);
  console.log(`  ${sizedCount} products carry a Small/Medium/Large size selector`);
  console.log(`\nGrinders staff logins (password: Password123!):`);
  for (const s of staff) console.log(`  ${s.role.padEnd(15)} ${s.email}`);
  console.log(`\nTable QR (scan or open): /r/grinders-table-1`);
  console.log(`Menu QR (no table):     /r/grinders-menu-main`);
  console.log(`Branch id: ${branch.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
