import { PrismaClient, Prisma } from "../generated/client";
import bcrypt from "bcryptjs";
import { json, strArray } from "../src/sqlite-codec";
import { syncTenantRoles } from "../src/role-sync";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Aurum demo restaurant...");

  const tenant = await prisma.tenant.upsert({
    where: { slug: "aurum-group" },
    create: { name: "Aurum Hospitality Group", slug: "aurum-group", plan: "GROWTH" },
    update: {},
  });

  const brand = await prisma.brand.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "aurum" } },
    create: {
      tenantId: tenant.id,
      slug: "aurum",
      name: "Aurum",
      currency: "IQD",
      defaultLocale: "ar",
      // JSON-encoded text since the move to SQLite (see the schema's encoding notes).
      themeConfig: json({ accent: "#d4a24c" }),
    },
    update: {},
  });

  const branch = await prisma.branch.upsert({
    where: { brandId_slug: { brandId: brand.id, slug: "baghdad-karrada" } },
    create: {
      brandId: brand.id,
      slug: "baghdad-karrada",
      name: "Karrada",
      address: "Karrada Dakhil St.",
      city: "Baghdad",
      phone: "+964 770 000 0000",
    },
    update: {},
  });

  // ── Permissions & Roles ────────────────────────────────────────────────
  // Upserts every grant the registry lists and revokes any it no longer does — see
  // src/role-sync.ts, shared with the Grinders seed and `npm run db:sync-roles`.
  const roleRecords = await syncTenantRoles(prisma, tenant.id, console.log);

  // ── Staff users ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const staff: { email: string; name: string; role: string; branchScoped: boolean }[] = [
    { email: "admin@aurum.demo", name: "Layla Owner", role: "Owner", branchScoped: false },
    { email: "manager@aurum.demo", name: "Sami Manager", role: "Owner", branchScoped: true },
    { email: "cashier@aurum.demo", name: "Rania Cashier", role: "Cashier", branchScoped: true },
    { email: "waiter@aurum.demo", name: "Karim Waiter", role: "Waiter", branchScoped: true },
    { email: "kitchen@aurum.demo", name: "Noor Kitchen", role: "Kitchen", branchScoped: true },
    { email: "accountant@aurum.demo", name: "Dana Accountant", role: "Accountant", branchScoped: true },
    { email: "delivery@aurum.demo", name: "Yousef Rider", role: "Delivery", branchScoped: true },
  ];

  for (const s of staff) {
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: s.email } },
      create: { tenantId: tenant.id, email: s.email, name: s.name, passwordHash },
      update: {},
    });
    // Postgres unique constraints treat NULL branchId as distinct every time, so a
    // tenant-wide role (branchId: null) can't be upserted by the compound key — check first.
    const scopedBranchId = s.branchScoped ? branch.id : null;
    const existingAssignment = await prisma.userBranchRole.findFirst({
      where: { userId: user.id, roleId: roleRecords[s.role], branchId: scopedBranchId },
    });
    if (!existingAssignment) {
      await prisma.userBranchRole.create({
        data: { userId: user.id, roleId: roleRecords[s.role], branchId: scopedBranchId },
      });
    }
  }

  // ── Kitchen stations ─────────────────────────────────────────────────
  const stationNames = ["Grill", "Hot Kitchen", "Coffee Bar", "Dessert"];
  const stations: Record<string, string> = {};
  for (const [i, name] of stationNames.entries()) {
    const station = await prisma.kitchenStation.upsert({
      where: { id: `${branch.id}-${name}` },
      create: { id: `${branch.id}-${name}`, branchId: branch.id, name, sortOrder: i },
      update: {},
    });
    stations[name] = station.id;
  }

  // ── Zones & Tables & QR codes ────────────────────────────────────────
  const zoneNames = ["Indoor", "Terrace", "VIP"];
  const zones: Record<string, string> = {};
  for (const name of zoneNames) {
    const zone = await prisma.zone.upsert({
      where: { id: `${branch.id}-${name}` },
      create: { id: `${branch.id}-${name}`, branchId: branch.id, name },
      update: {},
    });
    zones[name] = zone.id;
  }

  // 18 tables across three zones — enough that "table 15" is a normal thing to ask for
  // and the kitchen board has to be scannable rather than a single screenful.
  const TABLE_COUNT = 18;
  const tableIdByLabel: Record<string, string> = {};
  for (let i = 1; i <= TABLE_COUNT; i++) {
    const label = String(i);
    const zoneKey = i <= 8 ? "Indoor" : i <= 14 ? "Terrace" : "VIP";
    const table = await prisma.restaurantTable.upsert({
      where: { branchId_label: { branchId: branch.id, label } },
      create: {
        branchId: branch.id,
        label,
        capacity: zoneKey === "VIP" ? 8 : zoneKey === "Terrace" ? 6 : 4,
        zoneId: zones[zoneKey],
      },
      update: {},
    });
    tableIdByLabel[label] = table.id;
    await prisma.qRCode.upsert({
      where: { token: `demo-table-${branch.id}-${label}` },
      create: {
        branchId: branch.id,
        tableId: table.id,
        type: "TABLE",
        label: `Table ${label}`,
        token: `demo-table-${branch.id}-${label}`,
      },
      update: {},
    });
  }

  // ── Menu / Categories / Modifiers ───────────────────────────────────
  const menu = await prisma.menu.upsert({
    where: { id: `${brand.id}-main` },
    create: { id: `${brand.id}-main`, brandId: brand.id, name: "Main Menu" },
    update: {},
  });

  async function category(name: string, sortOrder: number, description?: string) {
    return prisma.category.upsert({
      where: { id: `${menu.id}-${name}` },
      create: { id: `${menu.id}-${name}`, menuId: menu.id, name, sortOrder, description },
      update: {},
    });
  }

  async function modifierGroup(name: string, opts: { isRequired?: boolean; minSelect?: number; maxSelect?: number }, options: { name: string; priceDelta?: number; isDefault?: boolean }[]) {
    const group = await prisma.modifierGroup.upsert({
      where: { id: `${brand.id}-${name}` },
      create: {
        id: `${brand.id}-${name}`,
        brandId: brand.id,
        name,
        isRequired: opts.isRequired ?? false,
        minSelect: opts.minSelect ?? 0,
        maxSelect: opts.maxSelect ?? 1,
      },
      update: {},
    });
    for (const o of options) {
      await prisma.modifierOption.upsert({
        where: { id: `${group.id}-${o.name}` },
        create: { id: `${group.id}-${o.name}`, groupId: group.id, name: o.name, priceDelta: o.priceDelta ?? 0, isDefault: o.isDefault ?? false },
        update: {},
      });
    }
    return group;
  }

  const sizeGroup = await modifierGroup("Size", { isRequired: true, minSelect: 1, maxSelect: 1 }, [
    { name: "Regular", priceDelta: 0, isDefault: true },
    { name: "Large", priceDelta: 1500 },
  ]);
  const milkGroup = await modifierGroup("Milk", { minSelect: 0, maxSelect: 1 }, [
    { name: "Whole Milk", isDefault: true },
    { name: "Oat Milk", priceDelta: 1000 },
    { name: "Almond Milk", priceDelta: 1000 },
  ]);
  const burgerAddOns = await modifierGroup("Add-ons", { minSelect: 0, maxSelect: 4 }, [
    { name: "Cheese", priceDelta: 1000 },
    { name: "Extra Patty", priceDelta: 3000 },
    { name: "Bacon", priceDelta: 2000 },
    { name: "Sauce", priceDelta: 500 },
  ]);
  const spiceGroup = await modifierGroup("Spice Level", { isRequired: true, minSelect: 1, maxSelect: 1 }, [
    { name: "Mild", isDefault: true },
    { name: "Medium" },
    { name: "Hot" },
  ]);

  interface SeedProduct {
    name: string;
    price: number;
    desc: string;
    station?: string;
    modGroups?: string[];
    flags?: Partial<{ isFeatured: boolean; isPopular: boolean; isNew: boolean; isSeasonal: boolean }>;
    availability?: "AVAILABLE" | "LOW_STOCK" | "SOLD_OUT";
  }

  const catalog: Record<string, SeedProduct[]> = {
    Coffee: [
      { name: "Spanish Latte", price: 7000, desc: "Espresso, condensed milk, steamed milk.", station: "Coffee Bar", modGroups: ["Size", "Milk"], flags: { isPopular: true } },
      { name: "Flat White", price: 6000, desc: "Double espresso, velvety micro-foam.", station: "Coffee Bar", modGroups: ["Size", "Milk"] },
      { name: "Cappuccino", price: 5500, desc: "Espresso, steamed milk, thick foam.", station: "Coffee Bar", modGroups: ["Size", "Milk"] },
      { name: "Iced Americano", price: 5000, desc: "Espresso over ice.", station: "Coffee Bar", modGroups: ["Size"] },
      { name: "Turkish Coffee", price: 4500, desc: "Traditional finely-ground coffee.", station: "Coffee Bar" },
      { name: "Matcha Latte", price: 7500, desc: "Ceremonial-grade matcha, steamed milk.", station: "Coffee Bar", modGroups: ["Size", "Milk"], flags: { isNew: true } },
    ],
    Breakfast: [
      { name: "Shakshuka", price: 12000, desc: "Eggs poached in spiced tomato sauce.", station: "Hot Kitchen", flags: { isFeatured: true } },
      { name: "Avocado Toast", price: 11000, desc: "Sourdough, smashed avocado, chili flakes.", station: "Hot Kitchen" },
      { name: "Eggs Benedict", price: 13500, desc: "Poached eggs, hollandaise, English muffin.", station: "Hot Kitchen" },
      { name: "Croissant Sandwich", price: 9000, desc: "Butter croissant, turkey, cheese.", station: "Hot Kitchen" },
      { name: "Pancake Stack", price: 10000, desc: "Maple syrup, seasonal berries.", station: "Hot Kitchen" },
      { name: "Labneh & Zaatar", price: 8000, desc: "Strained yogurt, olive oil, zaatar, bread.", station: "Hot Kitchen" },
    ],
    Mains: [
      { name: "Aurum Signature Burger", price: 16000, desc: "Wagyu blend, brioche bun, secret sauce.", station: "Grill", modGroups: ["Size", "Add-ons"], flags: { isFeatured: true, isPopular: true } },
      { name: "Grilled Chicken Pasta", price: 15000, desc: "Creamy sauce, sun-dried tomato.", station: "Hot Kitchen" },
      { name: "Beef Kebab Platter", price: 18000, desc: "Char-grilled skewers, rice, salad.", station: "Grill" },
      { name: "Spicy Chicken Sandwich", price: 12500, desc: "Crispy chicken, pickles, spicy mayo.", station: "Grill", modGroups: ["Spice Level"] },
      { name: "Margherita Pizza", price: 13000, desc: "San Marzano tomato, buffalo mozzarella.", station: "Hot Kitchen" },
      { name: "Truffle Risotto", price: 17000, desc: "Arborio rice, wild mushroom, truffle oil.", station: "Hot Kitchen", flags: { isSeasonal: true } },
      { name: "Grilled Salmon", price: 19500, desc: "Lemon butter sauce, seasonal vegetables.", station: "Grill" },
      { name: "Chicken Shawarma Wrap", price: 8500, desc: "Garlic sauce, pickles, fries.", station: "Grill", flags: { isPopular: true } },
    ],
    Salads: [
      { name: "Caesar Salad", price: 9500, desc: "Romaine, parmesan, croutons, anchovy dressing." },
      { name: "Quinoa & Pomegranate", price: 9000, desc: "Quinoa, pomegranate, feta, mint." },
      { name: "Halloumi Salad", price: 10000, desc: "Grilled halloumi, mixed greens, walnuts." },
    ],
    Desserts: [
      { name: "New York Cheesecake", price: 8500, desc: "Classic baked cheesecake, berry compote.", station: "Dessert", flags: { isPopular: true } },
      { name: "Molten Chocolate Cake", price: 8000, desc: "Warm cake, liquid chocolate center.", station: "Dessert" },
      { name: "Baklava Plate", price: 6500, desc: "Pistachio, honey syrup.", station: "Dessert" },
      { name: "Tiramisu", price: 8000, desc: "Espresso-soaked ladyfingers, mascarpone.", station: "Dessert", flags: { isNew: true } },
      { name: "Kunafa", price: 7500, desc: "Sweet cheese pastry, syrup, pistachio.", station: "Dessert", availability: "LOW_STOCK" },
    ],
    Beverages: [
      { name: "Fresh Orange Juice", price: 4500, desc: "Cold-pressed daily." },
      { name: "Mango Smoothie", price: 6000, desc: "Fresh mango, yogurt." },
      { name: "Sparkling Water", price: 2000, desc: "" },
      { name: "Iced Tea", price: 3500, desc: "House-brewed, lightly sweetened." },
    ],
  };

  const groupIdByName: Record<string, string> = { Size: sizeGroup.id, Milk: milkGroup.id, "Add-ons": burgerAddOns.id, "Spice Level": spiceGroup.id };
  const stationIdByName: Record<string, string> = stations;

  let categorySort = 0;
  for (const [catName, products] of Object.entries(catalog)) {
    const cat = await category(catName, categorySort++);
    let sortOrder = 0;
    for (const p of products) {
      const product = await prisma.product.upsert({
        where: { id: `${cat.id}-${p.name}` },
        create: {
          id: `${cat.id}-${p.name}`,
          categoryId: cat.id,
          name: p.name,
          description: p.desc,
          basePrice: new Prisma.Decimal(p.price),
          sortOrder: sortOrder++,
          isFeatured: p.flags?.isFeatured ?? false,
          isPopular: p.flags?.isPopular ?? false,
          isNew: p.flags?.isNew ?? false,
          isSeasonal: p.flags?.isSeasonal ?? false,
          // JSON-encoded text since the move to SQLite (see the schema's encoding notes).
          tags: strArray([]),
          allergens: strArray([]),
        },
        update: {},
      });

      if (p.station) {
        await prisma.productStation.upsert({
          where: { productId_stationId: { productId: product.id, stationId: stationIdByName[p.station] } },
          create: { productId: product.id, stationId: stationIdByName[p.station] },
          update: {},
        });
      }

      for (const groupName of p.modGroups ?? []) {
        await prisma.productModifierGroup.upsert({
          where: { productId_groupId: { productId: product.id, groupId: groupIdByName[groupName] } },
          create: { productId: product.id, groupId: groupIdByName[groupName] },
          update: {},
        });
      }

      if (p.availability) {
        await prisma.productAvailability.upsert({
          where: { productId_branchId: { productId: product.id, branchId: branch.id } },
          create: { productId: product.id, branchId: branch.id, status: p.availability },
          update: { status: p.availability },
        });
      }
    }
  }

  // ── Delivery zones ───────────────────────────────────────────────────
  await prisma.deliveryZone.upsert({
    where: { id: `${branch.id}-zone-a` },
    create: { id: `${branch.id}-zone-a`, branchId: branch.id, name: "Zone A · Karrada", feeAmount: 2000, minOrderAmount: 10000, estimatedMinutes: 25 },
    update: {},
  });
  await prisma.deliveryZone.upsert({
    where: { id: `${branch.id}-zone-b` },
    create: { id: `${branch.id}-zone-b`, branchId: branch.id, name: "Zone B · Jadriya", feeAmount: 3500, minOrderAmount: 15000, estimatedMinutes: 40 },
    update: {},
  });

  // ── Game catalog ─────────────────────────────────────────────────────
  await prisma.game.upsert({
    where: { key: "thirty-second-challenge" },
    create: { key: "thirty-second-challenge", name: "30-Second Challenge", description: "Beat the clock with your table.", isActive: true },
    update: {},
  });

  // ── Historical demo orders (for analytics) ──────────────────────────
  // Guarded so a second `db:seed` does not fail on the (tableId, sessionNumber)
  // unique constraint, and — more to the point — does not double every one of these
  // orders into the revenue reports. These two blocks are append-only by nature:
  // they fabricate a floor that happened rather than describe configuration, so the
  // honest behaviour on a database that already has them is to leave it alone.
  const demoTable = await prisma.restaurantTable.findFirstOrThrow({ where: { branchId: branch.id, label: "3" } });
  const burgerProduct = await prisma.product.findFirstOrThrow({ where: { name: "Aurum Signature Burger", category: { menuId: menu.id } } });
  const latteProduct = await prisma.product.findFirstOrThrow({ where: { name: "Spanish Latte", category: { menuId: menu.id } } });

  const historyAlreadySeeded = await prisma.tableSession.findUnique({
    where: { tableId_sessionNumber: { tableId: demoTable.id, sessionNumber: 1000 } },
    select: { id: true },
  });

  for (let day = historyAlreadySeeded ? 5 : 0; day < 5; day++) {
    const session = await prisma.tableSession.create({
      data: {
        tableId: demoTable.id,
        sessionNumber: 1000 + day,
        status: "CLOSED",
        openedAt: new Date(Date.now() - day * 86400000),
        closedAt: new Date(Date.now() - day * 86400000 + 3600000),
      },
    });

    const subtotal = new Prisma.Decimal(burgerProduct.basePrice).add(new Prisma.Decimal(latteProduct.basePrice));
    const order = await prisma.order.create({
      data: {
        branchId: branch.id,
        tableSessionId: session.id,
        type: "DINE_IN",
        status: "CLOSED",
        subtotal,
        total: subtotal,
        createdAt: new Date(Date.now() - day * 86400000),
        items: {
          create: [
            { productId: burgerProduct.id, nameSnapshot: burgerProduct.name, unitPriceSnapshot: burgerProduct.basePrice, quantity: 1, lineTotal: burgerProduct.basePrice },
            { productId: latteProduct.id, nameSnapshot: latteProduct.name, unitPriceSnapshot: latteProduct.basePrice, quantity: 1, lineTotal: latteProduct.basePrice },
          ],
        },
        statusEvents: { create: [{ toStatus: "CREATED" }, { toStatus: "PAID" }, { toStatus: "CLOSED" }] },
        payments: { create: { method: "CASH", amount: subtotal, status: "VERIFIED" } },
      },
    });
    void order;
  }

  // ── Live floor state ────────────────────────────────────────────────
  // One open table session on each of six tables, each with an order parked in a
  // different stage of the real workflow, so every screen has something true to show
  // the moment the app starts:
  //
  //   Table 1  CREATED     just scanned the QR — sitting in the kitchen's "New" column
  //   Table 2  CONFIRMED   accepted, not started
  //   Table 5  PREPARING   on the pass right now
  //   Table 8  READY       plated and waiting for a waiter to carry it over
  //   Table 12 DELIVERED   served, bill not settled
  //   Table 15 PAID        paid, ready to close the table
  //
  // These are written through the same rows `createOrder` would write (Order +
  // OrderItem + KitchenOrder per station + OrderStatusEvent + Payment), so the kitchen
  // board, the waiter page, the orders list and the receipt all read real data rather
  // than a special-cased demo path.
  const catalogProducts = await prisma.product.findMany({
    where: { category: { menuId: menu.id } },
    orderBy: { sortOrder: "asc" },
  });
  const productByName = new Map(catalogProducts.map((p) => [p.name, p]));

  /** Menu line for a demo order, priced off the product's own base price. */
  function line(name: string, quantity: number) {
    const product = productByName.get(name);
    if (!product) throw new Error(`Demo order references a product that is not in the menu: "${name}"`);
    return {
      productId: product.id,
      nameSnapshot: product.name,
      unitPriceSnapshot: product.basePrice,
      quantity,
      lineTotal: product.basePrice.mul(quantity),
    };
  }

  /** The order statuses a given order has already been through, oldest first. */
  const STATUS_LADDER: Record<string, string[]> = {
    CREATED: ["CREATED"],
    CONFIRMED: ["CREATED", "CONFIRMED"],
    PREPARING: ["CREATED", "CONFIRMED", "PREPARING"],
    READY: ["CREATED", "CONFIRMED", "PREPARING", "READY"],
    DELIVERED: ["CREATED", "CONFIRMED", "PREPARING", "READY", "DELIVERED"],
    PAID: ["CREATED", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "PAID"],
  };
  /** How far the kitchen tickets have progressed alongside the order. */
  const KITCHEN_TICKET_STATUS: Record<string, string> = {
    CREATED: "NEW",
    CONFIRMED: "NEW",
    PREPARING: "PREPARING",
    READY: "READY",
    DELIVERED: "COMPLETED",
    PAID: "COMPLETED",
  };

  const demoFloor: {
    tableLabel: string;
    status: string;
    openedMinutesAgo: number;
    items: ReturnType<typeof line>[];
    guestCalls?: number;
  }[] = [
    { tableLabel: "1", status: "CREATED", openedMinutesAgo: 2, items: [line("Aurum Signature Burger", 1), line("Labneh & Zaatar", 1)] },
    { tableLabel: "2", status: "CONFIRMED", openedMinutesAgo: 7, items: [line("Chicken Shawarma Wrap", 2), line("Fresh Orange Juice", 2)] },
    { tableLabel: "5", status: "PREPARING", openedMinutesAgo: 12, items: [line("Aurum Signature Burger", 2), line("Grilled Chicken Pasta", 1), line("Sparkling Water", 2)] },
    { tableLabel: "8", status: "READY", openedMinutesAgo: 18, items: [line("Margherita Pizza", 1), line("Iced Tea", 2)] },
    { tableLabel: "12", status: "DELIVERED", openedMinutesAgo: 34, items: [line("Caesar Salad", 1), line("Chicken Shawarma Wrap", 1), line("Spanish Latte", 2)] },
    { tableLabel: "15", status: "PAID", openedMinutesAgo: 51, items: [line("Mango Smoothie", 3), line("Tiramisu", 1)] },
  ];

  // A couple of tables that have called for a waiter and not been answered yet — the
  // "Table N is calling a waiter" half of the waiter screen needs live rows to show.
  for (const tableLabel of ["5", "12"]) {
    demoFloor.find((d) => d.tableLabel === tableLabel)!.guestCalls = 1;
  }

  let demoSessionNumber = 2000;

  // Clear whatever is currently open anywhere in the branch before re-laying the floor.
  //
  // An earlier version skipped this whole block if the fixture was already there, which
  // made the seed safe to re-run but useless for its actual job: after an afternoon of
  // clicking through the app, every table is occupied and `npm run db:seed` leaves you
  // with no free table to scan a QR at. Someone running a seed wants a demoable cafe,
  // so re-seeding now means re-seeding.
  //
  // Bounded two ways so it cannot eat history: only sessions still ACTIVE, and only in
  // this branch. A CLOSED session is a paid meal that has already happened — the five
  // days of them written above are the point of the demo, and they stay.
  const staleSessions = await prisma.tableSession.findMany({
    where: { status: "ACTIVE", table: { branchId: branch.id } },
    select: { id: true, tableId: true },
  });
  if (staleSessions.length > 0) {
    const staleIds = staleSessions.map((s) => s.id);
    // Two deletes, because the schema's own `onDelete: Cascade` covers the rest: an
    // Order takes its items, modifiers, kitchen tickets, status events, payments,
    // discounts and redemptions with it, and a WaiterRequest goes with its session.
    // Deleting a TableSession while an Order still points at it is the one thing the
    // schema refuses, so the orders go first.
    await prisma.order.deleteMany({ where: { tableSessionId: { in: staleIds } } });
    await prisma.tableSession.deleteMany({ where: { id: { in: staleIds } } });
    await prisma.restaurantTable.updateMany({
      where: { id: { in: [...new Set(staleSessions.map((s) => s.tableId))] } },
      data: { status: "AVAILABLE" },
    });
    console.log(`  Cleared ${staleIds.length} open session(s) so the floor can be re-laid.`);
  }

  for (const d of demoFloor) {
    const tableId = tableIdByLabel[d.tableLabel];

    const openedAt = new Date(Date.now() - d.openedMinutesAgo * 60_000);
    const session = await prisma.tableSession.create({
      data: {
        tableId,
        sessionNumber: demoSessionNumber++,
        status: "ACTIVE",
        openedAt,
      },
    });

    const subtotal = d.items.reduce((sum, l) => sum.add(l.lineTotal), new Prisma.Decimal(0));
    // The demo branch has no tax or service fee configured, so the total is the
    // subtotal — matching what priceCart would compute, rather than inventing one.
    const total = subtotal;

    const order = await prisma.order.create({
      data: {
        branchId: branch.id,
        tableSessionId: session.id,
        type: "DINE_IN",
        status: d.status,
        subtotal,
        total,
        currency: "IQD",
        createdAt: openedAt,
        items: { create: d.items },
        statusEvents: {
          create: STATUS_LADDER[d.status].map((toStatus, i) => ({
            fromStatus: i === 0 ? null : STATUS_LADDER[d.status][i - 1],
            toStatus,
            // The audit trail of a real order is spread over the minutes it took to be
            // made, not bunched at the same instant — this makes "how long has this been
            // waiting?" a real question in the demo data.
            changedAt: new Date(openedAt.getTime() + i * 4 * 60_000),
          })),
        },
        ...(d.status === "PAID" ? { payments: { create: { method: "CASH", amount: total, status: "VERIFIED" } } } : {}),
      },
    });

    // One KitchenOrder per station the items route to, exactly as createOrder does, so
    // the station filter on the kitchen board has real per-station tickets to filter.
    // The created OrderItems are read back rather than reused from `d.items`, because
    // a nested create does not hand the new rows' ids back to the caller.
    const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    const routes = await prisma.productStation.findMany({ where: { productId: { in: orderItems.map((i) => i.productId) } } });
    const stationForProduct = new Map(routes.map((r) => [r.productId, r.stationId]));
    const fallbackStation = (await prisma.kitchenStation.findFirst({ where: { branchId: branch.id }, orderBy: { sortOrder: "asc" } }))?.id;
    const itemsByStation = new Map<string, typeof orderItems>();
    for (const item of orderItems) {
      const stationId = stationForProduct.get(item.productId) ?? fallbackStation;
      if (!stationId) continue;
      if (!itemsByStation.has(stationId)) itemsByStation.set(stationId, []);
      itemsByStation.get(stationId)!.push(item);
    }
    for (const [stationId, items] of itemsByStation) {
      await prisma.kitchenOrder.create({
        data: {
          orderId: order.id,
          stationId,
          status: KITCHEN_TICKET_STATUS[d.status],
          startedAt: d.status === "CREATED" || d.status === "CONFIRMED" ? null : new Date(openedAt.getTime() + 6 * 60_000),
          readyAt: ["READY", "DELIVERED", "PAID"].includes(d.status) ? new Date(openedAt.getTime() + 18 * 60_000) : null,
          completedAt: KITCHEN_TICKET_STATUS[d.status] === "COMPLETED" ? new Date(openedAt.getTime() + 20 * 60_000) : null,
          items: { create: items.map((i) => ({ orderItemId: i.id, status: KITCHEN_TICKET_STATUS[d.status] })) },
        },
      });
    }

    for (let c = 0; c < (d.guestCalls ?? 0); c++) {
      await prisma.waiterRequest.create({
        data: {
          tableSessionId: session.id,
          type: "ASSISTANCE",
          status: "OPEN",
          note: "Guests need assistance",
          createdAt: new Date(Date.now() - 3 * 60_000),
        },
      });
    }

    // A table mid-service is OCCUPIED; once the bill is settled it is CLEANING and the
    // floor team clears it. Matches what lib/orders.ts does on these transitions.
    await prisma.restaurantTable.update({
      where: { id: tableId },
      data: { status: d.status === "PAID" ? "CLEANING" : "ORDERING" },
    });
  }


  console.log("Seed complete.");
  console.log("Staff logins (password: Password123!):");
  for (const s of staff) console.log(`  ${s.role.padEnd(16)} ${s.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
