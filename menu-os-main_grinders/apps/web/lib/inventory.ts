import { Prisma, type StockMovementType } from "@menu-os/db";
import { prisma } from "./db";
import { withLock } from "./async-lock";
import { notify } from "./notifications";
import { writeOutboxEvent } from "./outbox";
import { emitToBranch } from "./realtime";

/**
 * The stock engine.
 *
 * Stock lives in two places that are always written together:
 *
 *   - `StockMovement` is the ledger. Every change is one signed row, and a branch's
 *     stock on hand is the sum of its rows. That is the number every screen shows.
 *   - `StockBatch` is what is physically on the shelf: one row per delivery, with its
 *     own cost and expiry. Consumption draws batches down FIFO (oldest delivery first)
 *     or FEFO (soonest expiry first), so cost of goods is the real cost of the stock
 *     that was used, and expired stock is never the stock that gets used.
 *
 * The two only disagree when more is used than was on the shelf (a sale of stock that
 * was never received). That shortfall is recorded in the ledger without a batch, so the
 * branch shows negative stock, and the next delivery settles it before anything is put
 * on the shelf — the sum of batch remainders is always max(0, stock on hand).
 *
 * Every operation runs through `runStockOperation`, which serialises writes per branch
 * (SQLite has no row locks: two sales reading the same batch at once would both take
 * from it) and then applies the knock-on effects: low/out-of-stock alerts and switching
 * menu items to sold out — and back — as ingredients run out and arrive.
 */

type Tx = Prisma.TransactionClient;
const D = (n: Prisma.Decimal.Value) => new Prisma.Decimal(n);
const ZERO = D(0);

// ─── units ────────────────────────────────────────────────────────────────

const UNITS: Record<string, { base: string; factor: number }> = {
  mg: { base: "g", factor: 0.001 },
  g: { base: "g", factor: 1 },
  gr: { base: "g", factor: 1 },
  gram: { base: "g", factor: 1 },
  grams: { base: "g", factor: 1 },
  "غ": { base: "g", factor: 1 },
  "غرام": { base: "g", factor: 1 },
  kg: { base: "g", factor: 1000 },
  "كغ": { base: "g", factor: 1000 },
  "كيلو": { base: "g", factor: 1000 },
  ml: { base: "ml", factor: 1 },
  "مل": { base: "ml", factor: 1 },
  cl: { base: "ml", factor: 10 },
  l: { base: "ml", factor: 1000 },
  lt: { base: "ml", factor: 1000 },
  liter: { base: "ml", factor: 1000 },
  litre: { base: "ml", factor: 1000 },
  "لتر": { base: "ml", factor: 1000 },
  pcs: { base: "pcs", factor: 1 },
  pc: { base: "pcs", factor: 1 },
  piece: { base: "pcs", factor: 1 },
  pieces: { base: "pcs", factor: 1 },
  unit: { base: "pcs", factor: 1 },
  "قطعة": { base: "pcs", factor: 1 },
  "حبة": { base: "pcs", factor: 1 },
};

/**
 * A recipe line written in one unit ("18 g" of coffee) converted to the unit the
 * ingredient is stocked in ("kg"). Units that cannot be converted (a recipe in "pcs"
 * against stock in "g") are taken at face value — the same thing the recipe builder
 * shows — rather than guessed at.
 */
export function convertQuantity(quantity: number, from: string, to: string): number {
  const a = UNITS[from.trim().toLowerCase()];
  const b = UNITS[to.trim().toLowerCase()];
  if (!a || !b || a.base !== b.base) return quantity;
  return (quantity * a.factor) / b.factor;
}

// ─── operation context ───────────────────────────────────────────────────

/** Net change per branch+ingredient made by one operation, for the knock-on effects. */
class StockContext {
  readonly deltas = new Map<string, { branchId: string; ingredientId: string; delta: Prisma.Decimal }>();
  constructor(readonly userId: string | null) {}
  add(branchId: string, ingredientId: string, delta: Prisma.Decimal) {
    const key = `${branchId}|${ingredientId}`;
    const cur = this.deltas.get(key);
    if (cur) cur.delta = cur.delta.add(delta);
    else this.deltas.set(key, { branchId, ingredientId, delta });
  }
}

type AvailabilityChange = { branchId: string; productId: string; status: string };

/**
 * Serialises stock writes for the given branches, runs `fn` in one transaction, then
 * applies the alerts and menu-availability effects of whatever it changed.
 */
export async function runStockOperation<T>(
  branchIds: string[],
  userId: string | null,
  fn: (tx: Tx, ctx: StockContext) => Promise<T>
): Promise<T> {
  const keys = [...new Set(branchIds)].sort().map((b) => `inventory:${b}`);
  const run = async () => {
    const changes: AvailabilityChange[] = [];
    const result = await prisma.$transaction(
      async (tx) => {
        const ctx = new StockContext(userId);
        const r = await fn(tx, ctx);
        await applyStockEffects(tx, ctx, changes);
        return { r, touched: [...ctx.deltas.values()] };
      },
      { timeout: 20_000 }
    );
    for (const c of changes) emitToBranch(c.branchId, { type: "product.availability_changed", ...c });
    const byBranch = new Map<string, string[]>();
    for (const t of result.touched) byBranch.set(t.branchId, [...(byBranch.get(t.branchId) ?? []), t.ingredientId]);
    for (const [branchId, ingredientIds] of byBranch) emitToBranch(branchId, { type: "inventory.changed", branchId, ingredientIds });
    return result.r;
  };
  // Nested so an operation spanning two branches (a transfer) holds both, always in the
  // same order, so two opposite transfers cannot wait on each other forever.
  const wrapped = keys.reduceRight<() => Promise<T>>((inner, key) => () => withLock(key, inner), run);
  return wrapped();
}

// ─── reads ────────────────────────────────────────────────────────────────

export async function onHand(tx: Tx, branchId: string, ingredientId: string): Promise<Prisma.Decimal> {
  const agg = await tx.stockMovement.aggregate({ where: { branchId, ingredientId }, _sum: { quantity: true } });
  return agg._sum.quantity ?? ZERO;
}

/** A branch tracks an ingredient once any stock has ever been booked for it there. */
async function isTracked(tx: Tx, branchId: string, ingredientId: string): Promise<boolean> {
  return (await tx.stockMovement.count({ where: { branchId, ingredientId } })) > 0;
}

type IngredientRow = Awaited<ReturnType<typeof prisma.ingredient.findUniqueOrThrow>>;

function sortForConsumption<B extends { receivedAt: Date; expiresAt: Date | null }>(batches: B[], method: string): B[] {
  return [...batches].sort((a, b) => {
    if (method === "FEFO") {
      const ea = a.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
      const eb = b.expiresAt?.getTime() ?? Number.POSITIVE_INFINITY;
      if (ea !== eb) return ea - eb;
    }
    return a.receivedAt.getTime() - b.receivedAt.getTime();
  });
}

// ─── writes ───────────────────────────────────────────────────────────────

/**
 * Takes `quantity` out of a branch, batch by batch in FIFO/FEFO order, skipping
 * anything already expired. Returns what was taken from each batch (a transfer needs
 * it to rebuild the same batches on the other side) and the cost of it.
 */
export async function takeStock(
  tx: Tx,
  ctx: StockContext,
  params: {
    branchId: string;
    ingredient: IngredientRow;
    quantity: Prisma.Decimal;
    type: StockMovementType;
    reason?: string | null;
    orderId?: string | null;
    preferBatchId?: string | null;
  }
) {
  const { branchId, ingredient } = params;
  const now = new Date();
  const available = await tx.stockBatch.findMany({
    where: { ingredientId: ingredient.id, branchId, status: "ACTIVE", quantityRemaining: { gt: 0 } },
  });
  let batches = sortForConsumption(
    available.filter((b) => !b.expiresAt || b.expiresAt > now),
    ingredient.costingMethod
  );
  if (params.preferBatchId) {
    const preferred = available.find((b) => b.id === params.preferBatchId);
    if (preferred) batches = [preferred, ...batches.filter((b) => b.id !== preferred.id)];
  }

  let remaining = params.quantity;
  let cost = ZERO;
  const taken: { batch: (typeof available)[number]; quantity: Prisma.Decimal }[] = [];

  for (const batch of batches) {
    if (remaining.lte(0)) break;
    const take = Prisma.Decimal.min(remaining, batch.quantityRemaining);
    const left = batch.quantityRemaining.sub(take);
    await tx.stockBatch.update({
      where: { id: batch.id },
      data: { quantityRemaining: left, status: left.lte(0) ? "DEPLETED" : batch.status },
    });
    await tx.stockMovement.create({
      data: {
        ingredientId: ingredient.id,
        branchId,
        batchId: batch.id,
        type: params.type,
        quantity: take.neg(),
        unitCost: batch.unitCost,
        reason: params.reason ?? null,
        orderId: params.orderId ?? null,
        userId: ctx.userId,
      },
    });
    cost = cost.add(take.mul(batch.unitCost));
    taken.push({ batch, quantity: take });
    remaining = remaining.sub(take);
  }

  // More was used than was on the shelf. Book it anyway — the stock really was used —
  // so the branch goes negative and the next delivery settles it.
  if (remaining.gt(0)) {
    const unitCost = ingredient.lastUnitCost ?? ZERO;
    await tx.stockMovement.create({
      data: {
        ingredientId: ingredient.id,
        branchId,
        batchId: null,
        type: params.type,
        quantity: remaining.neg(),
        unitCost,
        reason: params.reason ?? null,
        orderId: params.orderId ?? null,
        userId: ctx.userId,
      },
    });
    cost = cost.add(remaining.mul(unitCost));
  }

  ctx.add(branchId, ingredient.id, params.quantity.neg());
  return { taken, shortfall: remaining.gt(0) ? remaining : ZERO, cost };
}

/** Puts a new batch on the shelf, first settling any shortfall the branch is carrying. */
export async function addStock(
  tx: Tx,
  ctx: StockContext,
  params: {
    branchId: string;
    ingredient: IngredientRow;
    quantity: Prisma.Decimal;
    unitCost: Prisma.Decimal;
    type: StockMovementType;
    expiresAt?: Date | null;
    receivedAt?: Date;
    batchCode?: string | null;
    supplier?: string | null;
    notes?: string | null;
    reason?: string | null;
  }
) {
  const { branchId, ingredient } = params;
  const before = await onHand(tx, branchId, ingredient.id);
  const deficit = before.lt(0) ? before.neg() : ZERO;
  const settled = Prisma.Decimal.min(deficit, params.quantity);
  const shelf = params.quantity.sub(settled);

  let expiresAt = params.expiresAt ?? null;
  if (!expiresAt && ingredient.trackExpiry && ingredient.shelfLifeDays) {
    expiresAt = new Date(Date.now() + ingredient.shelfLifeDays * 86_400_000);
  }

  const batch = await tx.stockBatch.create({
    data: {
      ingredientId: ingredient.id,
      branchId,
      batchCode: params.batchCode ?? null,
      supplier: params.supplier ?? null,
      quantityReceived: params.quantity,
      quantityRemaining: shelf,
      unitCost: params.unitCost,
      receivedAt: params.receivedAt ?? new Date(),
      expiresAt,
      status: shelf.gt(0) ? "ACTIVE" : "DEPLETED",
      notes: params.notes ?? null,
      receivedById: ctx.userId,
    },
  });
  await tx.stockMovement.create({
    data: {
      ingredientId: ingredient.id,
      branchId,
      batchId: batch.id,
      type: params.type,
      quantity: params.quantity,
      unitCost: params.unitCost,
      reason: params.reason ?? null,
      userId: ctx.userId,
    },
  });
  if (params.type === "RECEIVE" && params.unitCost.gt(0)) {
    await tx.ingredient.update({ where: { id: ingredient.id }, data: { lastUnitCost: params.unitCost } });
  }
  ctx.add(branchId, ingredient.id, params.quantity);
  return batch;
}

// ─── knock-on effects ────────────────────────────────────────────────────

async function applyStockEffects(tx: Tx, ctx: StockContext, changes: AvailabilityChange[]) {
  if (ctx.deltas.size === 0) return;
  const branchCache = new Map<string, { tenantId: string }>();
  const branchOf = async (branchId: string) => {
    if (!branchCache.has(branchId)) {
      const b = await tx.branch.findUniqueOrThrow({ where: { id: branchId }, include: { brand: true } });
      branchCache.set(branchId, { tenantId: b.brand.tenantId });
    }
    return branchCache.get(branchId)!;
  };

  const ingredientIds = new Set<string>();
  for (const { branchId, ingredientId } of ctx.deltas.values()) {
    ingredientIds.add(ingredientId);
    const ingredient = await tx.ingredient.findUniqueOrThrow({ where: { id: ingredientId } });
    const after = await onHand(tx, branchId, ingredientId);
    const { tenantId } = await branchOf(branchId);
    const data = { ingredientId, name: ingredient.name, unit: ingredient.unit, onHand: after.toNumber() };

    // One live alert per ingredient and branch: raised whenever stock ends up out or at
    // or below its minimum and no unread alert of that kind is already waiting. Firing
    // only on the exact crossing missed items that were created or counted already
    // below their minimum — they never alerted at all.
    const unread = async (type: "OUT_OF_STOCK" | "LOW_STOCK") =>
      (await tx.notification.count({ where: { branchId, type, isRead: false, data: { contains: `"ingredientId":"${ingredientId}"` } } })) > 0;

    if (after.lte(0) && !(await unread("OUT_OF_STOCK"))) {
      await notify(tx, {
        tenantId,
        branchId,
        type: "OUT_OF_STOCK",
        title: `Out of stock: ${ingredient.name}`,
        body: `0 ${ingredient.unit} left`,
        data,
      });
    } else if (ingredient.lowStockThreshold != null && after.gt(0) && after.lte(ingredient.lowStockThreshold) && !(await unread("LOW_STOCK"))) {
      await notify(tx, {
        tenantId,
        branchId,
        type: "LOW_STOCK",
        title: `Low stock: ${ingredient.name}`,
        body: `${after.toNumber()} ${ingredient.unit} remaining (threshold ${ingredient.lowStockThreshold} ${ingredient.unit})`,
        data: { ...data, threshold: ingredient.lowStockThreshold.toNumber() },
      });
    }

    await syncProductAvailability(tx, branchId, ingredientId, tenantId, changes);
  }

  // Brand-wide total, for the cloud mirror and anything still reading the old column.
  for (const ingredientId of ingredientIds) {
    const total = await tx.stockMovement.aggregate({ where: { ingredientId }, _sum: { quantity: true } });
    const updated = await tx.ingredient.update({ where: { id: ingredientId }, data: { currentStock: total._sum.quantity ?? ZERO } });
    const branch = await tx.branch.findFirst({ where: { brandId: updated.brandId }, select: { id: true } });
    if (branch) {
      await writeOutboxEvent(tx, {
        branchId: branch.id,
        aggregateType: "Ingredient",
        aggregateId: updated.id,
        eventType: "ingredient.updated",
        payload: {
          brandId: updated.brandId,
          name: updated.name,
          unit: updated.unit,
          currentStock: updated.currentStock?.toNumber() ?? null,
          lowStockThreshold: updated.lowStockThreshold?.toNumber() ?? null,
        },
        occurredAt: new Date(),
      });
    }
  }
}

/**
 * Menu items made with this ingredient: sold out when the branch can no longer make
 * one, back on sale when it can again. Only items the stock system itself switched off
 * are switched back on; a manager's own "sold out" is left alone.
 */
async function syncProductAvailability(tx: Tx, branchId: string, ingredientId: string, tenantId: string, changes: AvailabilityChange[]) {
  const lines = await tx.recipeIngredient.findMany({
    where: { ingredientId },
    select: { recipe: { select: { productId: true, lines: { include: { ingredient: true } } } } },
  });

  for (const { recipe } of lines) {
    let canMake = true;
    for (const line of recipe.lines) {
      if (!line.ingredient.isActive) continue;
      if (!(await isTracked(tx, branchId, line.ingredientId))) continue;
      const need = convertQuantity(line.quantity.toNumber(), line.unit, line.ingredient.unit);
      const have = (await onHand(tx, branchId, line.ingredientId)).toNumber();
      if (have + 1e-9 < need) {
        canMake = false;
        break;
      }
    }

    const current = await tx.productAvailability.findUnique({
      where: { productId_branchId: { productId: recipe.productId, branchId } },
    });

    if (!canMake && current?.status !== "SOLD_OUT") {
      await tx.productAvailability.upsert({
        where: { productId_branchId: { productId: recipe.productId, branchId } },
        create: { productId: recipe.productId, branchId, status: "SOLD_OUT", autoReason: "INVENTORY" },
        update: { status: "SOLD_OUT", autoReason: "INVENTORY", updatedById: null },
      });
      await writeOutboxEvent(tx, {
        branchId,
        aggregateType: "ProductAvailability",
        aggregateId: recipe.productId,
        eventType: "product.availability_changed",
        payload: { productId: recipe.productId, status: "SOLD_OUT" },
        occurredAt: new Date(),
      });
      const product = await tx.product.findUnique({ where: { id: recipe.productId }, select: { name: true } });
      await notify(tx, {
        tenantId,
        branchId,
        type: "SOLD_OUT",
        title: `${product?.name ?? "A menu item"} is sold out`,
        body: "An ingredient ran out",
        data: { productId: recipe.productId, auto: true },
      });
      changes.push({ branchId, productId: recipe.productId, status: "SOLD_OUT" });
    } else if (canMake && current?.status === "SOLD_OUT" && current.autoReason === "INVENTORY") {
      await tx.productAvailability.update({
        where: { id: current.id },
        data: { status: "AVAILABLE", autoReason: null, updatedById: null },
      });
      await writeOutboxEvent(tx, {
        branchId,
        aggregateType: "ProductAvailability",
        aggregateId: recipe.productId,
        eventType: "product.availability_changed",
        payload: { productId: recipe.productId, status: "AVAILABLE" },
        occurredAt: new Date(),
      });
      changes.push({ branchId, productId: recipe.productId, status: "AVAILABLE" });
    }
  }
}

// ─── orders ───────────────────────────────────────────────────────────────

/**
 * Deducts the recipe ingredients of an order's items from its branch, FIFO.
 *
 * Idempotent per order. Ingredients the branch has never stocked are skipped: a cafe
 * that has written recipes but not yet counted its shelves should not see every item
 * turn sold out on the first sale.
 *
 * Never throws — an inventory problem must not lose a guest's order.
 */
export async function consumeStockForOrder(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, branchId: true, items: { select: { productId: true, quantity: true } } },
    });
    if (!order || order.items.length === 0) return;
    if (await prisma.stockMovement.findFirst({ where: { orderId, type: "SALE" }, select: { id: true } })) return;

    const recipes = await prisma.recipe.findMany({
      where: { productId: { in: [...new Set(order.items.map((i) => i.productId))] } },
      include: { lines: { include: { ingredient: true } } },
    });
    if (recipes.length === 0) return;
    const byProduct = new Map(recipes.map((r) => [r.productId, r]));

    const needs = new Map<string, { ingredient: IngredientRow; quantity: number }>();
    for (const item of order.items) {
      const recipe = byProduct.get(item.productId);
      if (!recipe) continue;
      for (const line of recipe.lines) {
        if (!line.ingredient.isActive) continue;
        const qty = convertQuantity(line.quantity.toNumber(), line.unit, line.ingredient.unit) * item.quantity;
        const cur = needs.get(line.ingredientId);
        needs.set(line.ingredientId, { ingredient: line.ingredient, quantity: (cur?.quantity ?? 0) + qty });
      }
    }
    if (needs.size === 0) return;

    const reason = `Order #${order.id.slice(-6).toUpperCase()}`;
    await runStockOperation([order.branchId], null, async (tx, ctx) => {
      for (const { ingredient, quantity } of needs.values()) {
        if (quantity <= 0) continue;
        if (!(await isTracked(tx, order.branchId, ingredient.id))) continue;
        await takeStock(tx, ctx, { branchId: order.branchId, ingredient, quantity: D(quantity), type: "SALE", reason, orderId: order.id });
      }
    });
  } catch (err) {
    console.error(`Inventory: could not deduct stock for order ${orderId}:`, err);
  }
}

/** Puts a cancelled order's ingredients back into the batches they came from. Idempotent. */
export async function reverseStockForOrder(orderId: string, userId?: string | null): Promise<void> {
  try {
    const sales = await prisma.stockMovement.findMany({ where: { orderId, type: "SALE" } });
    if (sales.length === 0) return;
    if (await prisma.stockMovement.findFirst({ where: { orderId, type: "SALE_REVERSAL" }, select: { id: true } })) return;
    const branchId = sales[0].branchId;
    const reason = `Order #${orderId.slice(-6).toUpperCase()} cancelled`;

    await runStockOperation([branchId], userId ?? null, async (tx, ctx) => {
      for (const sale of sales) {
        const qty = sale.quantity.neg();
        if (sale.batchId) {
          const batch = await tx.stockBatch.findUnique({ where: { id: sale.batchId } });
          if (batch) {
            // Back on the shelf it came from. If that batch has expired meanwhile, the
            // expiry pass run right after this writes it off like any other.
            await tx.stockBatch.update({
              where: { id: batch.id },
              data: { quantityRemaining: batch.quantityRemaining.add(qty), status: "ACTIVE" },
            });
          }
        }
        await tx.stockMovement.create({
          data: {
            ingredientId: sale.ingredientId,
            branchId: sale.branchId,
            batchId: sale.batchId,
            type: "SALE_REVERSAL",
            quantity: qty,
            unitCost: sale.unitCost,
            reason,
            orderId,
            userId: ctx.userId,
          },
        });
        ctx.add(sale.branchId, sale.ingredientId, qty);
      }
    });
    // Anything returned to a batch that has since expired is written off straight away.
    await processExpiredStock(branchId);
  } catch (err) {
    console.error(`Inventory: could not return stock for cancelled order ${orderId}:`, err);
  }
}

// ─── expiry ───────────────────────────────────────────────────────────────

/**
 * Writes off every batch past its expiry date (it must not be used, so it must not be
 * counted as stock) and warns about batches about to expire, once per batch.
 */
export async function processExpiredStock(branchId?: string): Promise<{ expired: number; expiring: number }> {
  const now = new Date();
  const expiredBatches = await prisma.stockBatch.findMany({
    where: { status: "ACTIVE", quantityRemaining: { gt: 0 }, expiresAt: { lte: now }, ...(branchId ? { branchId } : {}) },
    include: { ingredient: true, branch: { include: { brand: true } } },
  });

  const byBranch = new Map<string, typeof expiredBatches>();
  for (const b of expiredBatches) byBranch.set(b.branchId, [...(byBranch.get(b.branchId) ?? []), b]);

  for (const [bid, batches] of byBranch) {
    await runStockOperation([bid], null, async (tx, ctx) => {
      for (const b of batches) {
        const fresh = await tx.stockBatch.findUnique({ where: { id: b.id } });
        if (!fresh || fresh.status !== "ACTIVE" || fresh.quantityRemaining.lte(0)) continue;
        await tx.stockBatch.update({ where: { id: b.id }, data: { quantityRemaining: 0, status: "EXPIRED" } });
        await tx.stockMovement.create({
          data: {
            ingredientId: b.ingredientId,
            branchId: bid,
            batchId: b.id,
            type: "EXPIRED",
            quantity: fresh.quantityRemaining.neg(),
            unitCost: fresh.unitCost,
            reason: "Expired — written off automatically",
          },
        });
        ctx.add(bid, b.ingredientId, fresh.quantityRemaining.neg());
        await notify(tx, {
          tenantId: b.branch.brand.tenantId,
          branchId: bid,
          type: "STOCK_EXPIRY",
          title: `Expired: ${b.ingredient.name}`,
          body: `${fresh.quantityRemaining.toNumber()} ${b.ingredient.unit} written off`,
          data: { kind: "expired", batchId: b.id, ingredientId: b.ingredientId, name: b.ingredient.name, unit: b.ingredient.unit, quantity: fresh.quantityRemaining.toNumber() },
        });
      }
    });
  }

  // Early warning, once per batch.
  const soon = await prisma.stockBatch.findMany({
    where: { status: "ACTIVE", quantityRemaining: { gt: 0 }, expiresAt: { gt: now, lte: new Date(now.getTime() + 30 * 86_400_000) }, ...(branchId ? { branchId } : {}) },
    include: { ingredient: true, branch: { include: { brand: true } } },
  });
  const due = soon.filter((b) => b.expiresAt!.getTime() - now.getTime() <= b.ingredient.expiryAlertDays * 86_400_000);
  let warned = 0;
  if (due.length > 0) {
    const existing = await prisma.notification.findMany({
      where: { type: "STOCK_EXPIRY", branchId: { in: [...new Set(due.map((b) => b.branchId))] } },
      select: { data: true },
    });
    const done = new Set<string>();
    for (const n of existing) {
      try {
        const d = JSON.parse(n.data ?? "null");
        if (d?.kind === "soon" && typeof d.batchId === "string") done.add(d.batchId);
      } catch {
        /* legacy row */
      }
    }
    for (const b of due) {
      if (done.has(b.id)) continue;
      const days = Math.max(0, Math.ceil((b.expiresAt!.getTime() - now.getTime()) / 86_400_000));
      await prisma.$transaction((tx) =>
        notify(tx, {
          tenantId: b.branch.brand.tenantId,
          branchId: b.branchId,
          type: "STOCK_EXPIRY",
          title: `Expiring soon: ${b.ingredient.name}`,
          body: `${b.quantityRemaining.toNumber()} ${b.ingredient.unit} expires in ${days} day(s)`,
          data: { kind: "soon", batchId: b.id, ingredientId: b.ingredientId, name: b.ingredient.name, unit: b.ingredient.unit, quantity: b.quantityRemaining.toNumber(), days },
        })
      );
      warned++;
    }
  }
  return { expired: expiredBatches.length, expiring: warned };
}

export function startExpiryChecker(intervalMs = 30 * 60_000) {
  const tick = () => processExpiredStock().catch((err) => console.error("Inventory expiry check failed:", err));
  setTimeout(tick, 15_000);
  setInterval(tick, intervalMs);
}

// ─── overview ─────────────────────────────────────────────────────────────

export type StockState = "OK" | "LOW" | "OUT" | "UNTRACKED";

/** Everything the inventory screen shows for one branch, in one pass. */
export async function getInventoryOverview(branchId: string, brandId: string, withCost: boolean) {
  const now = new Date();
  const since14 = new Date(now.getTime() - 14 * 86_400_000);
  const since30 = new Date(now.getTime() - 30 * 86_400_000);

  const [ingredients, onHandRows, batches, usageRows, recent30] = await Promise.all([
    prisma.ingredient.findMany({ where: { brandId }, orderBy: { name: "asc" } }),
    prisma.stockMovement.groupBy({ by: ["ingredientId"], where: { branchId }, _sum: { quantity: true }, _count: true }),
    prisma.stockBatch.findMany({ where: { branchId, status: "ACTIVE", quantityRemaining: { gt: 0 } }, orderBy: { receivedAt: "asc" } }),
    prisma.stockMovement.groupBy({ by: ["ingredientId", "type"], where: { branchId, createdAt: { gte: since14 }, type: { in: ["SALE", "SALE_REVERSAL"] } }, _sum: { quantity: true } }),
    prisma.stockMovement.findMany({ where: { branchId, createdAt: { gte: since30 }, type: { in: ["SALE", "SALE_REVERSAL", "WASTE", "EXPIRED"] } }, select: { type: true, quantity: true, unitCost: true } }),
  ]);

  const stock = new Map(onHandRows.map((r) => [r.ingredientId, { qty: r._sum.quantity?.toNumber() ?? 0, count: r._count }]));
  const usage = new Map<string, number>();
  for (const r of usageRows) usage.set(r.ingredientId, (usage.get(r.ingredientId) ?? 0) - (r._sum.quantity?.toNumber() ?? 0));

  const batchesBy = new Map<string, typeof batches>();
  for (const b of batches) batchesBy.set(b.ingredientId, [...(batchesBy.get(b.ingredientId) ?? []), b]);

  let stockValue = 0;
  const items = ingredients.map((ing) => {
    const s = stock.get(ing.id);
    const tracked = !!s && s.count > 0;
    const qty = round(s?.qty ?? 0);
    const own = batchesBy.get(ing.id) ?? [];
    const value = own.reduce((sum, b) => sum + b.quantityRemaining.toNumber() * b.unitCost.toNumber(), 0);
    stockValue += value;
    const expiries = own.map((b) => b.expiresAt).filter((d): d is Date => !!d).sort((a, b) => a.getTime() - b.getTime());
    const nextExpiry = expiries[0] ?? null;
    const daysToExpiry = nextExpiry ? Math.ceil((nextExpiry.getTime() - now.getTime()) / 86_400_000) : null;
    const threshold = ing.lowStockThreshold?.toNumber() ?? null;
    const avgDaily = round((usage.get(ing.id) ?? 0) / 14);
    const daysLeft = avgDaily > 0 && qty > 0 ? Math.floor(qty / avgDaily) : null;

    let state: StockState = "OK";
    if (!tracked) state = "UNTRACKED";
    else if (qty <= 0) state = "OUT";
    else if (threshold != null && qty <= threshold) state = "LOW";

    const expiringSoon = daysToExpiry != null && daysToExpiry <= ing.expiryAlertDays;
    const needsReorder = state === "OUT" || state === "LOW";
    const reorderSuggestion = needsReorder
      ? round(ing.reorderQuantity?.toNumber() ?? Math.max(avgDaily * 7, (threshold ?? 0) * 2, 1) - Math.min(qty, 0))
      : null;

    return {
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      sku: ing.sku,
      category: ing.category,
      isActive: ing.isActive,
      costingMethod: ing.costingMethod,
      trackExpiry: ing.trackExpiry,
      shelfLifeDays: ing.shelfLifeDays,
      expiryAlertDays: ing.expiryAlertDays,
      lowStockThreshold: threshold,
      reorderQuantity: ing.reorderQuantity?.toNumber() ?? null,
      onHand: qty,
      state,
      batchCount: own.length,
      nextExpiry,
      daysToExpiry,
      expiringSoon,
      avgDailyUsage: avgDaily,
      daysLeft,
      reorderSuggestion,
      ...(withCost ? { stockValue: round(value), lastUnitCost: ing.lastUnitCost?.toNumber() ?? null } : {}),
    };
  });

  const expiring = batches
    .filter((b) => b.expiresAt)
    .map((b) => {
      const ing = ingredients.find((i) => i.id === b.ingredientId);
      const days = Math.ceil((b.expiresAt!.getTime() - now.getTime()) / 86_400_000);
      return { batchId: b.id, ingredientId: b.ingredientId, name: ing?.name ?? "", unit: ing?.unit ?? "", quantity: b.quantityRemaining.toNumber(), expiresAt: b.expiresAt, days, alertDays: ing?.expiryAlertDays ?? 3, batchCode: b.batchCode };
    })
    .filter((b) => b.days <= Math.max(b.alertDays, 7))
    .sort((a, b) => a.days - b.days);

  let cogs30 = 0;
  let waste30 = 0;
  for (const m of recent30) {
    const v = -m.quantity.toNumber() * m.unitCost.toNumber();
    if (m.type === "SALE" || m.type === "SALE_REVERSAL") cogs30 += v;
    else waste30 += v;
  }

  const active = items.filter((i) => i.isActive);
  return {
    items,
    expiring,
    summary: {
      totalItems: active.length,
      tracked: active.filter((i) => i.state !== "UNTRACKED").length,
      low: active.filter((i) => i.state === "LOW").length,
      out: active.filter((i) => i.state === "OUT").length,
      expiringSoon: expiring.filter((e) => e.days <= e.alertDays).length,
      ...(withCost ? { stockValue: round(stockValue), cogs30: round(cogs30), waste30: round(waste30) } : {}),
    },
  };
}

function round(n: number) {
  return Math.round(n * 1000) / 1000;
}
