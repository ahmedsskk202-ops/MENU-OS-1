// Menu OS Cloud — the head-office aggregation service.
// Deliberately a separate process, separate package, separate database from the
// branch's local runtime (apps/web). A branch never depends on this being reachable
// to operate; see docs/OFFLINE_ARCHITECTURE.md.
require("dotenv").config();
const { createServer } = require("http");
const { createHash } = require("crypto");
const { PrismaClient, Prisma } = require("@menu-os/cloud-db/generated/client");

const prisma = new PrismaClient();
const port = process.env.CLOUD_PORT ? parseInt(process.env.CLOUD_PORT, 10) : 4000;

function hashKey(key) {
  return createHash("sha256").update(key).digest("hex");
}

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function authenticateBranch(branchId, apiKey) {
  if (!branchId || !apiKey) return null;
  const branch = await prisma.cloudBranch.findUnique({ where: { id: branchId } });
  if (!branch || branch.apiKeyHash !== hashKey(apiKey)) return null;
  return branch;
}

// Applies one OutboxEvent to its projection table. Each event commits independently —
// this is what makes a batch safe to retry after a partial failure (see §6/§7 of the
// architecture doc and the "interrupted sync" test).
async function applyEvent(branch, event) {
  // Idempotent ingestion: if we've already applied this exact event id, skip it.
  const already = await prisma.syncedEvent.findUnique({ where: { id: event.id } });
  if (already) return { id: event.id, status: "already_applied" };

  await prisma.$transaction(async (tx) => {
    await tx.syncedEvent.create({
      data: {
        id: event.id,
        branchId: branch.id,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        occurredAt: new Date(event.occurredAt),
      },
    });

    // Branches store the payload as JSON text; the sync engine decodes it before sending,
    // but a client that forwards the raw text used to have every field read as
    // undefined — orders failed, and other aggregates were silently written blank.
    let p = event.payload ?? {};
    if (typeof p === "string") {
      try {
        p = JSON.parse(p) ?? {};
      } catch {
        throw new Error(`Event ${event.id}: payload is not valid JSON`);
      }
    }
    const occurredAt = new Date(event.occurredAt);

    // Every projection is last-write-wins by occurredAt, not just ProductAvailability.
    // Events can legitimately arrive out of creation order once more than one sync
    // attempt can be in flight at once (the local engine's own retry racing its next
    // scheduled tick is enough) — a stale "order.created" landing after a newer
    // "order.status_changed" must never revert the projection. Discovered by, and
    // regression-guarded by, the offline-sync test's own concurrency (see scripts/
    // offline-sync-test.mjs) — this was a real bug the test caught, not a hypothetical.
    async function upsertWithLWW(model, id, createData, updateData) {
      const existing = await model.findUnique({ where: { id } });
      if (existing && existing.occurredAt > occurredAt) return; // a newer state already won
      await model.upsert({ where: { id }, create: createData, update: updateData });
    }

    // Every branch-scoped projection's cloud row id is `${branchId}:${aggregateId}`,
    // never the bare local aggregateId (same composite pattern ProductAvailability
    // already used). Local ids are branch-local cuids — the local Postgres instance
    // that generated them has no idea any other branch exists — so two DIFFERENT
    // branches can, in principle, produce the same id. Without this prefix, a second
    // branch's push with a colliding id would upsert into the FIRST branch's row
    // (findUnique/upsert both key on bare `id`), silently overwriting some of its
    // fields with the second branch's data — a real cross-branch write, not just a
    // theoretical one; caught by scripts/cloud-isolation-test.mjs before this fix.
    function cid(aggregateId) {
      return `${branch.id}:${aggregateId}`;
    }

    switch (event.aggregateType) {
      case "Order": {
        await upsertWithLWW(
          tx.cloudOrder,
          cid(event.aggregateId),
          {
            id: cid(event.aggregateId),
            tenantId: p.tenantId,
            branchId: branch.id,
            type: p.type,
            status: p.status,
            subtotal: new Prisma.Decimal(p.subtotal ?? 0),
            discountTotal: new Prisma.Decimal(p.discountTotal ?? 0),
            taxTotal: new Prisma.Decimal(p.taxTotal ?? 0),
            serviceFeeTotal: new Prisma.Decimal(p.serviceFeeTotal ?? 0),
            total: new Prisma.Decimal(p.total ?? 0),
            currency: p.currency ?? "IQD",
            occurredAt,
            createdAt: p.createdAt ? new Date(p.createdAt) : occurredAt,
          },
          { status: p.status, total: new Prisma.Decimal(p.total ?? 0), occurredAt }
        );
        break;
      }
      case "Payment": {
        await upsertWithLWW(
          tx.cloudPayment,
          cid(event.aggregateId),
          {
            id: cid(event.aggregateId),
            orderId: cid(p.orderId),
            branchId: branch.id,
            method: p.method,
            amount: new Prisma.Decimal(p.amount ?? 0),
            tipAmount: new Prisma.Decimal(p.tipAmount ?? 0),
            currency: p.currency ?? "IQD",
            status: p.status,
            shiftId: p.shiftId ? cid(p.shiftId) : null,
            occurredAt,
          },
          { status: p.status, occurredAt }
        );
        break;
      }
      case "Refund": {
        await upsertWithLWW(
          tx.cloudRefund,
          cid(event.aggregateId),
          { id: cid(event.aggregateId), paymentId: cid(p.paymentId), branchId: branch.id, amount: new Prisma.Decimal(p.amount ?? 0), status: p.status, occurredAt },
          { status: p.status, occurredAt }
        );
        break;
      }
      case "Shift": {
        await upsertWithLWW(
          tx.cloudShift,
          cid(event.aggregateId),
          {
            id: cid(event.aggregateId),
            branchId: branch.id,
            status: p.status,
            openedAt: p.openedAt ? new Date(p.openedAt) : occurredAt,
            closedAt: p.closedAt ? new Date(p.closedAt) : null,
            openingCash: new Prisma.Decimal(p.openingCash ?? 0),
            expectedCash: p.expectedCash != null ? new Prisma.Decimal(p.expectedCash) : null,
            actualCash: p.actualCash != null ? new Prisma.Decimal(p.actualCash) : null,
            variance: p.variance != null ? new Prisma.Decimal(p.variance) : null,
            varianceReason: p.varianceReason ?? null,
            occurredAt,
          },
          {
            status: p.status,
            closedAt: p.closedAt ? new Date(p.closedAt) : null,
            expectedCash: p.expectedCash != null ? new Prisma.Decimal(p.expectedCash) : null,
            actualCash: p.actualCash != null ? new Prisma.Decimal(p.actualCash) : null,
            variance: p.variance != null ? new Prisma.Decimal(p.variance) : null,
            varianceReason: p.varianceReason ?? null,
            occurredAt,
          }
        );
        break;
      }
      case "Expense": {
        await upsertWithLWW(
          tx.cloudExpense,
          cid(event.aggregateId),
          { id: cid(event.aggregateId), branchId: branch.id, shiftId: p.shiftId ? cid(p.shiftId) : null, category: p.category, amount: new Prisma.Decimal(p.amount ?? 0), occurredAt },
          { category: p.category, amount: new Prisma.Decimal(p.amount ?? 0), occurredAt }
        );
        break;
      }
      case "CashMovement": {
        await upsertWithLWW(
          tx.cloudCashMovement,
          cid(event.aggregateId),
          { id: cid(event.aggregateId), branchId: branch.id, shiftId: cid(p.shiftId), type: p.type, amount: new Prisma.Decimal(p.amount ?? 0), occurredAt },
          { type: p.type, amount: new Prisma.Decimal(p.amount ?? 0), occurredAt }
        );
        break;
      }
      case "WaiterRequest": {
        await upsertWithLWW(
          tx.cloudWaiterRequest,
          cid(event.aggregateId),
          {
            id: cid(event.aggregateId),
            branchId: branch.id,
            type: p.type,
            status: p.status,
            createdAt: p.createdAt ? new Date(p.createdAt) : occurredAt,
            completedAt: p.completedAt ? new Date(p.completedAt) : null,
            occurredAt,
          },
          { status: p.status, completedAt: p.completedAt ? new Date(p.completedAt) : null, occurredAt }
        );
        break;
      }
      case "ProductAvailability": {
        const id = `${branch.id}:${p.productId}`;
        await upsertWithLWW(
          tx.cloudProductAvailability,
          id,
          { id, branchId: branch.id, productId: p.productId, status: p.status, occurredAt },
          { status: p.status, occurredAt }
        );
        break;
      }
      case "GameSession": {
        await upsertWithLWW(
          tx.cloudGameSession,
          cid(event.aggregateId),
          { id: cid(event.aggregateId), branchId: branch.id, status: p.status, playerCount: p.playerCount ?? 0, occurredAt },
          { status: p.status, occurredAt }
        );
        break;
      }
      case "DeliveryOrder": {
        await upsertWithLWW(
          tx.cloudDeliveryOrder,
          cid(event.aggregateId),
          {
            id: cid(event.aggregateId),
            orderId: cid(p.orderId),
            branchId: branch.id,
            status: p.status,
            zoneId: p.zoneId ?? null,
            deliveryFee: new Prisma.Decimal(p.deliveryFee ?? 0),
            driverId: p.driverId ?? null,
            deliveredAt: p.deliveredAt ? new Date(p.deliveredAt) : null,
            occurredAt,
          },
          { status: p.status, driverId: p.driverId ?? null, deliveredAt: p.deliveredAt ? new Date(p.deliveredAt) : null, occurredAt }
        );
        break;
      }
      case "Reservation": {
        await upsertWithLWW(
          tx.cloudReservation,
          cid(event.aggregateId),
          {
            id: cid(event.aggregateId),
            branchId: branch.id,
            tableId: p.tableId ?? null,
            guestName: p.guestName,
            guestPhone: p.guestPhone,
            partySize: p.partySize ?? 1,
            reservedFor: new Date(p.reservedFor),
            durationMinutes: p.durationMinutes ?? 90,
            status: p.status,
            occurredAt,
          },
          {
            tableId: p.tableId ?? null,
            partySize: p.partySize ?? 1,
            reservedFor: new Date(p.reservedFor),
            durationMinutes: p.durationMinutes ?? 90,
            status: p.status,
            occurredAt,
          }
        );
        break;
      }
      case "Ingredient": {
        await upsertWithLWW(
          tx.cloudIngredient,
          event.aggregateId,
          {
            id: event.aggregateId,
            brandId: p.brandId,
            name: p.name,
            unit: p.unit,
            currentStock: p.currentStock != null ? new Prisma.Decimal(p.currentStock) : null,
            lowStockThreshold: p.lowStockThreshold != null ? new Prisma.Decimal(p.lowStockThreshold) : null,
            occurredAt,
          },
          {
            name: p.name,
            currentStock: p.currentStock != null ? new Prisma.Decimal(p.currentStock) : null,
            lowStockThreshold: p.lowStockThreshold != null ? new Prisma.Decimal(p.lowStockThreshold) : null,
            occurredAt,
          }
        );
        break;
      }
      case "LoyaltyTransaction": {
        await tx.cloudLoyaltyTransaction.upsert({
          where: { id: event.aggregateId },
          create: {
            id: event.aggregateId,
            branchId: branch.id,
            brandId: p.brandId,
            accountId: p.accountId,
            customerId: p.customerId,
            orderId: p.orderId ?? null,
            type: p.type,
            points: p.points,
            newBalance: p.newBalance,
            occurredAt,
          },
          update: {},
        });
        break;
      }
      case "Recipe": {
        // The whole line list is replaced as one unit locally (see PUT
        // /api/recipes/:productId) — mirror that here: delete this product's old cloud
        // lines and insert the new set inside the same transaction, so a partial sync
        // retry can never leave a mix of old and new lines.
        await tx.cloudRecipeLine.deleteMany({ where: { productId: p.productId } });
        if (Array.isArray(p.lines) && p.lines.length > 0) {
          await tx.cloudRecipeLine.createMany({
            data: p.lines.map((l) => ({
              id: l.id,
              productId: p.productId,
              ingredientId: l.ingredientId,
              quantity: new Prisma.Decimal(l.quantity ?? 0),
              unit: l.unit,
              costPerUnitSnapshot: l.costPerUnitSnapshot != null ? new Prisma.Decimal(l.costPerUnitSnapshot) : null,
              occurredAt,
            })),
          });
        }
        break;
      }
      default:
        // Unknown aggregate types are still recorded in SyncedEvent (audit trail)
        // even though there's no projection for them yet.
        break;
    }
  });

  return { id: event.id, status: "applied" };
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      return send(res, 200, { ok: true });
    }

    if (req.method === "POST" && req.url === "/sync/events") {
      const body = await readJson(req);
      const branch = await authenticateBranch(body.branchId, body.apiKey);
      if (!branch) return send(res, 401, { error: "Invalid branch or API key" });

      const events = Array.isArray(body.events) ? body.events : [];
      const results = [];
      let count = 0;
      for (const event of events) {
        count++;
        const result = await applyEvent(branch, event);
        results.push(result);
        // Test-only fault injection: simulate the cloud process dying mid-batch,
        // after committing `simulateCrashAfter` events, before responding.
        if (body.simulateCrashAfter && count >= body.simulateCrashAfter) {
          req.socket.destroy();
          return;
        }
      }
      return send(res, 200, { acknowledged: results.map((r) => r.id) });
    }

    const branchSummaryMatch = req.url.match(/^\/branches\/([^/]+)\/summary$/);
    if (req.method === "GET" && branchSummaryMatch) {
      const branchId = decodeURIComponent(branchSummaryMatch[1]);
      const orders = await prisma.cloudOrder.findMany({ where: { branchId } });
      const revenue = orders
        .filter((o) => ["PAID", "CLOSED"].includes(o.status))
        .reduce((sum, o) => sum + o.total.toNumber(), 0);
      const eventCount = await prisma.syncedEvent.count({ where: { branchId } });
      return send(res, 200, { branchId, orderCount: orders.length, revenue, eventCount });
    }

    const availabilityMatch = req.url.match(/^\/branches\/([^/]+)\/availability\/([^/]+)$/);
    if (req.method === "GET" && availabilityMatch) {
      const [, branchId, productId] = availabilityMatch.map(decodeURIComponent);
      const row = await prisma.cloudProductAvailability.findUnique({
        where: { id: `${branchId}:${productId}` },
      });
      return send(res, 200, { row });
    }

    const ordersMatch = req.url.match(/^\/branches\/([^/]+)\/orders$/);
    if (req.method === "GET" && ordersMatch) {
      const branchId = decodeURIComponent(ordersMatch[1]);
      const orders = await prisma.cloudOrder.findMany({ where: { branchId }, orderBy: { createdAt: "desc" } });
      return send(res, 200, { orders });
    }

    const deliveryOrdersMatch = req.url.match(/^\/branches\/([^/]+)\/delivery-orders$/);
    if (req.method === "GET" && deliveryOrdersMatch) {
      const branchId = decodeURIComponent(deliveryOrdersMatch[1]);
      const deliveryOrders = await prisma.cloudDeliveryOrder.findMany({ where: { branchId }, orderBy: { occurredAt: "desc" } });
      return send(res, 200, { deliveryOrders });
    }

    const reservationsMatch = req.url.match(/^\/branches\/([^/]+)\/reservations$/);
    if (req.method === "GET" && reservationsMatch) {
      const branchId = decodeURIComponent(reservationsMatch[1]);
      const reservations = await prisma.cloudReservation.findMany({ where: { branchId }, orderBy: { reservedFor: "desc" } });
      return send(res, 200, { reservations });
    }

    const loyaltyMatch = req.url.match(/^\/brands\/([^/]+)\/loyalty-transactions$/);
    if (req.method === "GET" && loyaltyMatch) {
      const brandId = decodeURIComponent(loyaltyMatch[1]);
      const transactions = await prisma.cloudLoyaltyTransaction.findMany({ where: { brandId }, orderBy: { occurredAt: "desc" }, take: 500 });
      return send(res, 200, { transactions });
    }

    const ingredientsMatch = req.url.match(/^\/brands\/([^/]+)\/ingredients$/);
    if (req.method === "GET" && ingredientsMatch) {
      const brandId = decodeURIComponent(ingredientsMatch[1]);
      const ingredients = await prisma.cloudIngredient.findMany({ where: { brandId }, orderBy: { name: "asc" } });
      return send(res, 200, { ingredients });
    }

    const recipeMatch = req.url.match(/^\/products\/([^/]+)\/recipe$/);
    if (req.method === "GET" && recipeMatch) {
      const productId = decodeURIComponent(recipeMatch[1]);
      const lines = await prisma.cloudRecipeLine.findMany({ where: { productId } });
      return send(res, 200, { lines });
    }

    send(res, 404, { error: "Not found" });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: err.message });
  }
});

server.listen(port, () => {
  console.log(`Menu OS Cloud running on http://localhost:${port}`);
});
