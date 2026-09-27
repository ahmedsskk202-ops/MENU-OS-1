import { prisma } from "./db";
import { priceCart, type CartLineInput } from "./pricing";
import { emitToBranch, emitToTableSession, emitToCustomerSession } from "./realtime";
import { writeOutboxEvent } from "./outbox";
import { claimCouponUse } from "./discounts";
import { claimPromotionUse, claimPromotionPerCustomerLimit } from "./promotions";
import { claimComboUse, claimComboPerCustomerLimit } from "./combos";
import { writeAuditLog } from "./audit";
import { notify } from "./notifications";
import { consumeStockForOrder, reverseStockForOrder } from "./inventory";
import { settleIfFullyPaid, broadcastPaid } from "./payments/settle";
import type { OrderType } from "@menu-os/db";
import { Prisma } from "@menu-os/db";

function isUniqueConstraintError(err: unknown, field: string): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    JSON.stringify(err.meta?.target ?? "").includes(field)
  );
}

export async function createOrder(params: {
  branchId: string;
  tableSessionId?: string;
  customerSessionId?: string;
  type: OrderType;
  lines: CartLineInput[];
  notes?: string;
  clientRequestId?: string;
  couponCode?: string;
  createdByUserId?: string;
  delivery?: { customerName: string; phone: string; address: string; zoneId?: string; deliveryFee: number };
}) {
  // Idempotency: a retried request with the same clientRequestId (flaky Wi-Fi,
  // double-tap) returns the order that was already created instead of a duplicate.
  if (params.clientRequestId) {
    const existing = await prisma.order.findUnique({ where: { clientRequestId: params.clientRequestId } });
    if (existing) return existing;
  }

  const priced = await priceCart(params.branchId, params.lines, {
    couponCode: params.couponCode,
    customerSessionId: params.customerSessionId,
  });
  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: params.branchId }, include: { brand: true } });
  const deliveryFee = new Prisma.Decimal(params.delivery?.deliveryFee ?? 0);
  const orderTotal = priced.total.add(deliveryFee);

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        branchId: params.branchId,
        tableSessionId: params.tableSessionId,
        customerSessionId: params.customerSessionId,
        clientRequestId: params.clientRequestId,
        type: params.type,
        // No approval step: an order is received the moment it is placed. The guest
        // sees "order received" straight away and the kitchen's only job is "ready".
        status: "CONFIRMED",
        subtotal: priced.subtotal,
        taxTotal: priced.taxTotal,
        serviceFeeTotal: priced.serviceFeeTotal,
        discountTotal: priced.discountTotal,
        total: orderTotal,
        notes: params.notes,
        items: {
          create: priced.lines.map((line) => ({
            productId: line.productId,
            nameSnapshot: line.nameSnapshot,
            unitPriceSnapshot: line.unitPriceSnapshot,
            quantity: line.quantity,
            notes: line.notes,
            lineTotal: line.lineTotal,
            modifiers: {
              create: line.modifiers.map((m) => ({
                modifierOptionId: m.modifierOptionId,
                nameSnapshot: m.nameSnapshot,
                priceDeltaSnapshot: m.priceDeltaSnapshot,
              })),
            },
          })),
        },
        statusEvents: {
          create: [
            { toStatus: "CREATED" },
            { fromStatus: "CREATED", toStatus: "CONFIRMED", note: "Received automatically" },
          ],
        },
      },
      include: { items: true },
    });

    if (priced.coupon) {
      const claimed = await claimCouponUse(tx, priced.coupon.couponId, priced.coupon.maxUses);
      if (!claimed) {
        // Lost the race for the last remaining use between validation and commit —
        // abort the whole order rather than silently honor a discount that's no
        // longer available. Rolls back everything created in this transaction so far.
        throw new Error("This discount code was just used up — please remove it and try again");
      }
      const discount = await tx.discount.create({
        data: {
          orderId: created.id,
          couponId: priced.coupon.couponId,
          type: priced.coupon.type,
          value: priced.coupon.value,
          amountApplied: priced.coupon.amountApplied,
          reason: priced.coupon.code,
          freeProductId: priced.coupon.freeProductId,
          freeProductName: priced.coupon.freeProductName,
        },
      });
      // Self-service redemption by the guest — no staff actor, but still an
      // auditable record of which code was used, on which order, for how much.
      // For FREE_ITEM, the original menu price and the fact that it's a promotion
      // (not a $0 product) are recorded explicitly — the OrderItem itself is never
      // touched, so this audit line plus OrderItem.unitPriceSnapshot together give
      // the full Original Price → Promotion Discount → Final Price = 0 trail.
      await writeAuditLog(tx, {
        tenantId: branch.brand.tenantId,
        branchId: params.branchId,
        action: "discount.applied",
        entityType: "Discount",
        entityId: discount.id,
        after: {
          orderId: created.id,
          couponCode: priced.coupon.code,
          type: priced.coupon.type,
          amountApplied: priced.coupon.amountApplied.toNumber(),
          appliedBy: "customer_self_service",
          ...(priced.coupon.type === "FREE_ITEM"
            ? { freeProductId: priced.coupon.freeProductId, freeProductName: priced.coupon.freeProductName, originalPrice: priced.coupon.amountApplied.toNumber(), finalPrice: 0 }
            : {}),
        },
      });
    }

    if (priced.promotion) {
      // Race-safe per-customer/first-order claim FIRST — this is the actual guarantee
      // against two simultaneous orders from the same guest both landing inside the
      // pricing-time pre-check's read window (see lib/promo-scheduling.ts).
      const perCustomerOk = await claimPromotionPerCustomerLimit(tx, {
        promotionId: priced.promotion.promotionId,
        maxUsesPerCustomer: priced.promotion.maxUsesPerCustomer,
        firstOrderOnly: priced.promotion.firstOrderOnly,
        customerSessionId: params.customerSessionId,
        currentOrderId: created.id,
      });
      if (!perCustomerOk) {
        throw new Error("This offer is limited to one use per customer and has already been used");
      }
      const claimed = await claimPromotionUse(tx, priced.promotion.promotionId, priced.promotion.maxUsesTotal);
      if (!claimed) {
        throw new Error("This offer was just used up — please try again");
      }
      const discount = await tx.discount.create({
        data: {
          orderId: created.id,
          promotionId: priced.promotion.promotionId,
          couponId: priced.promotion.viaCouponId,
          type: priced.promotion.type,
          value: priced.promotion.amountApplied, // the engine's computed value is the authoritative "value" here
          amountApplied: priced.promotion.amountApplied,
          reason: priced.promotion.viaCouponCode ?? priced.promotion.promotionName,
          freeProductId: priced.promotion.freeProductId,
          freeProductName: priced.promotion.freeProductName,
        },
      });

      await tx.promotionRedemption.create({
        data: {
          promotionId: priced.promotion.promotionId,
          orderId: created.id,
          customerSessionId: params.customerSessionId,
          discountId: discount.id,
          discountAmount: priced.promotion.amountApplied,
        },
      });

      await writeAuditLog(tx, {
        tenantId: branch.brand.tenantId,
        branchId: params.branchId,
        action: "promotion.applied",
        entityType: "Discount",
        entityId: discount.id,
        after: {
          orderId: created.id,
          promotionId: priced.promotion.promotionId,
          promotionName: priced.promotion.promotionName,
          viaCouponCode: priced.promotion.viaCouponCode ?? null,
          type: priced.promotion.type,
          amountApplied: priced.promotion.amountApplied.toNumber(),
          appliedBy: "customer_self_service",
          ...(priced.promotion.type === "FREE_ITEM"
            ? { freeProductId: priced.promotion.freeProductId, freeProductName: priced.promotion.freeProductName, originalPrice: priced.promotion.amountApplied.toNumber(), finalPrice: 0 }
            : {}),
        },
      });
    }

    if (priced.combo) {
      const perCustomerOk = await claimComboPerCustomerLimit(tx, {
        comboDealId: priced.combo.comboDealId,
        maxUsesPerCustomer: priced.combo.maxUsesPerCustomer,
        customerSessionId: params.customerSessionId,
        currentOrderId: created.id,
      });
      if (!perCustomerOk) {
        throw new Error("This combo is limited to one use per customer and has already been used");
      }
      const claimed = await claimComboUse(tx, priced.combo.comboDealId, priced.combo.maxUsesTotal);
      if (!claimed) {
        throw new Error("This combo was just used up — please try again");
      }

      // Same non-destructive pattern as FREE_ITEM: OrderItem prices are never touched —
      // the bundle's savings live entirely in this Discount row, so the original price
      // of every item in the set is still recoverable for COGS/analytics/audit.
      const discount = await tx.discount.create({
        data: {
          orderId: created.id,
          comboDealId: priced.combo.comboDealId,
          type: "COMBO",
          value: priced.combo.fixedPricePerSet,
          amountApplied: priced.combo.amountApplied,
          reason: priced.combo.comboDealName,
        },
      });

      await tx.comboRedemption.create({
        data: {
          comboDealId: priced.combo.comboDealId,
          orderId: created.id,
          customerSessionId: params.customerSessionId,
          discountId: discount.id,
          savedAmount: priced.combo.amountApplied,
          setsApplied: priced.combo.setsApplied,
        },
      });

      await writeAuditLog(tx, {
        tenantId: branch.brand.tenantId,
        branchId: params.branchId,
        action: "combo.applied",
        entityType: "Discount",
        entityId: discount.id,
        after: {
          orderId: created.id,
          comboDealId: priced.combo.comboDealId,
          comboDealName: priced.combo.comboDealName,
          setsApplied: priced.combo.setsApplied,
          fixedPricePerSet: priced.combo.fixedPricePerSet.toNumber(),
          savedAmount: priced.combo.amountApplied.toNumber(),
          appliedBy: "customer_self_service",
        },
      });
    }

    // Auto-route each item to its kitchen station, creating one ticket per station.
    const stationRoutes = await tx.productStation.findMany({
      where: { productId: { in: created.items.map((i) => i.productId) } },
    });
    const productToStation = new Map(stationRoutes.map((r) => [r.productId, r.stationId]));

    let defaultStationId: string | null = null;
    const stationsForItemsWithNoRoute = created.items.some((i) => !productToStation.has(i.productId));
    if (stationsForItemsWithNoRoute) {
      const fallback = await tx.kitchenStation.findFirst({
        where: { branchId: params.branchId },
        orderBy: { sortOrder: "asc" },
      });
      defaultStationId = fallback?.id ?? null;
    }

    const itemsByStation = new Map<string, typeof created.items>();
    for (const item of created.items) {
      const stationId = productToStation.get(item.productId) ?? defaultStationId;
      if (!stationId) continue;
      if (!itemsByStation.has(stationId)) itemsByStation.set(stationId, []);
      itemsByStation.get(stationId)!.push(item);
    }

    for (const [stationId, items] of itemsByStation) {
      await tx.kitchenOrder.create({
        data: {
          orderId: created.id,
          stationId,
          status: "NEW",
          items: { create: items.map((i) => ({ orderItemId: i.id, status: "NEW" })) },
        },
      });
    }

    if (params.tableSessionId) {
      await tx.restaurantTable.updateMany({
        where: { sessions: { some: { id: params.tableSessionId } } },
        data: { status: "ORDERING" },
      });
    }

    if (params.delivery) {
      const deliveryOrder = await tx.deliveryOrder.create({
        data: {
          orderId: created.id,
          customerName: params.delivery.customerName,
          phone: params.delivery.phone,
          address: params.delivery.address,
          zoneId: params.delivery.zoneId,
          deliveryFee: deliveryFee,
          status: "NEW",
        },
      });
      await writeOutboxEvent(tx, {
        branchId: params.branchId,
        aggregateType: "DeliveryOrder",
        aggregateId: deliveryOrder.id,
        eventType: "delivery_order.created",
        payload: {
          orderId: created.id,
          status: deliveryOrder.status,
          zoneId: deliveryOrder.zoneId,
          deliveryFee: deliveryOrder.deliveryFee.toNumber(),
          driverId: null,
        },
        occurredAt: created.createdAt,
      });
    }

    await writeOutboxEvent(tx, {
      branchId: params.branchId,
      aggregateType: "Order",
      aggregateId: created.id,
      eventType: "order.created",
      payload: {
        tenantId: branch.brand.tenantId,
        type: created.type,
        status: created.status,
        subtotal: created.subtotal.toNumber(),
        discountTotal: created.discountTotal.toNumber(),
        taxTotal: created.taxTotal.toNumber(),
        serviceFeeTotal: created.serviceFeeTotal.toNumber(),
        total: created.total.toNumber(),
        currency: created.currency,
        createdAt: created.createdAt.toISOString(),
      },
      occurredAt: created.createdAt,
    });

    // Like every other staff alert, a dine-in order is announced by its table.
    const tableLabel = params.tableSessionId
      ? (await tx.tableSession.findUnique({ where: { id: params.tableSessionId }, select: { table: { select: { label: true } } } }))?.table.label ?? null
      : null;
    await notify(tx, {
      tenantId: branch.brand.tenantId,
      branchId: params.branchId,
      type: "NEW_ORDER",
      title: tableLabel ? `New order — Table ${tableLabel}` : `New ${created.type.toLowerCase().replace("_", " ")} order`,
      body: `${created.items.length} item${created.items.length === 1 ? "" : "s"} · ${orderTotal.toString()} ${created.currency}`,
      data: { orderId: created.id, tableLabel, orderType: created.type, itemCount: created.items.length },
    });

    return created;
    });
  } catch (err) {
    // Race: two concurrent requests with the same clientRequestId both passed the
    // pre-check above. The unique constraint catches it — return the winner's order
    // instead of surfacing a spurious failure to the loser's request.
    if (params.clientRequestId && isUniqueConstraintError(err, "clientRequestId")) {
      const existing = await prisma.order.findUnique({ where: { clientRequestId: params.clientRequestId } });
      if (existing) return existing;
    }
    throw err;
  }

  // Recipe ingredients leave the shelf when the order is placed (FIFO), so stock, the
  // low-stock alerts and the sold-out switch all reflect it before the next guest orders.
  await consumeStockForOrder(order.id);

  emitToBranch(params.branchId, { type: "order.created", branchId: params.branchId, order });
  if (params.tableSessionId) {
    emitToTableSession(params.tableSessionId, {
      type: "order.status_changed",
      branchId: params.branchId,
      orderId: order.id,
      status: order.status,
      tableSessionId: params.tableSessionId,
    });
  }
  if (params.customerSessionId) {
    emitToCustomerSession(params.customerSessionId, {
      type: "order.status_changed",
      branchId: params.branchId,
      orderId: order.id,
      status: order.status,
      tableSessionId: params.tableSessionId ?? null,
    });
  }

  return order;
}

const NEXT_STATUSES: Record<string, string[]> = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["PAID"],
  PAID: ["CLOSED", "REFUNDED", "PARTIALLY_REFUNDED"],
};

export function canTransition(from: string, to: string): boolean {
  return NEXT_STATUSES[from]?.includes(to) ?? false;
}

export async function updateOrderStatus(orderId: string, toStatus: string, changedById?: string, note?: string) {
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  if (!canTransition(order.status, toStatus) && !["CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(toStatus)) {
    throw new Error(`Cannot move order from ${order.status} to ${toStatus}`);
  }

  // PAID is a statement about money, so it must be backed by it. Recording a payment sets
  // PAID itself (api/payments); this path is the manual status change, which used to let
  // an order be marked paid with nothing collected.
  if (toStatus === "PAID") {
    const verified = await prisma.payment.aggregate({ where: { orderId, status: "VERIFIED" }, _sum: { amount: true } });
    const collected = verified._sum.amount?.toNumber() ?? 0;
    if (collected < order.total.toNumber() - 0.01) {
      throw new Error("Record the payment before marking this order paid");
    }
  }

  const branch = await prisma.branch.findUniqueOrThrow({ where: { id: order.branchId }, include: { brand: true } });

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.order.update({
      where: { id: orderId },
      data: {
        status: toStatus as never,
        statusEvents: { create: { fromStatus: order.status, toStatus: toStatus as never, changedById, note } },
      },
    });

    await writeOutboxEvent(tx, {
      branchId: order.branchId,
      aggregateType: "Order",
      aggregateId: order.id,
      eventType: "order.status_changed",
      payload: {
        tenantId: branch.brand.tenantId,
        type: u.type,
        status: u.status,
        subtotal: u.subtotal.toNumber(),
        discountTotal: u.discountTotal.toNumber(),
        taxTotal: u.taxTotal.toNumber(),
        serviceFeeTotal: u.serviceFeeTotal.toNumber(),
        total: u.total.toNumber(),
        currency: u.currency,
        createdAt: u.createdAt.toISOString(),
      },
    });

    return u;
  });

  // A cancelled order was never made, so its ingredients go back to the batches they
  // came from. (A refund is not a cancellation — that food was served.)
  if (toStatus === "CANCELLED" && order.status !== "CANCELLED") {
    await reverseStockForOrder(order.id, changedById);
  }

  emitToBranch(order.branchId, {
    type: "order.status_changed",
    branchId: order.branchId,
    orderId: order.id,
    status: toStatus,
    tableSessionId: order.tableSessionId,
  });
  if (order.tableSessionId) {
    emitToTableSession(order.tableSessionId, {
      type: "order.status_changed",
      branchId: order.branchId,
      orderId: order.id,
      status: toStatus,
      tableSessionId: order.tableSessionId,
    });
  }
  if (order.customerSessionId) {
    emitToCustomerSession(order.customerSessionId, {
      type: "order.status_changed",
      branchId: order.branchId,
      orderId: order.id,
      status: toStatus,
      tableSessionId: order.tableSessionId,
    });
  }

  // Paid online before it was served: now that it has been delivered, it settles to PAID
  // exactly as a till payment would have at this point (see lib/payments/settle.ts).
  if (toStatus === "DELIVERED") {
    const settled = await prisma.$transaction((tx) => settleIfFullyPaid(tx, order.id, changedById));
    if (settled) {
      broadcastPaid(order);
      return settled;
    }
  }

  return updated;
}
