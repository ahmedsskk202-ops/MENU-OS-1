import type { Prisma } from "@menu-os/db";
import { prisma } from "./db";
import { writeOutboxEvent } from "./outbox";

/**
 * Loyalty points.
 *
 * The rules are deliberately few and fixed (nothing in the spec pinned a rate, so this
 * is the documented default):
 *   - 1 point per 1,000 of an order's paid total, earned once per order, when it is paid;
 *   - tiers by lifetime points: Member → Silver at 500 → Gold at 2,000;
 *   - points belong to a customer *per brand*, so two cafes of one owner keep their own.
 *
 * Every change is a LoyaltyTransaction row carrying the balance after it, so a balance is
 * always explained by its history, and each one is synced to HQ through the outbox.
 */

type Tx = Prisma.TransactionClient;

export const POINTS_PER_CURRENCY = 1 / 1000;
export const TIERS = [
  { tier: "GOLD", min: 2000 },
  { tier: "SILVER", min: 500 },
  { tier: "MEMBER", min: 0 },
] as const;

export function tierFor(lifetimePoints: number): string {
  return TIERS.find((t) => lifetimePoints >= t.min)!.tier;
}

export function pointsFor(total: number): number {
  return Math.max(0, Math.floor(total * POINTS_PER_CURRENCY));
}

/** Normalises an Iraqi-style phone number so "0770 123 4567" and "+9647701234567" match. */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, "");
  if (d.startsWith("+964")) d = "0" + d.slice(4);
  else if (d.startsWith("00964")) d = "0" + d.slice(5);
  else if (d.startsWith("964") && d.length === 13) d = "0" + d.slice(3);
  d = d.replace(/\D/g, "");
  return d.length >= 7 && d.length <= 15 ? d : null;
}

async function accountFor(tx: Tx, customerId: string, brandId: string) {
  return tx.loyaltyAccount.upsert({
    where: { customerId_brandId: { customerId, brandId } },
    create: { customerId, brandId },
    update: {},
  });
}

async function record(
  tx: Tx,
  params: { accountId: string; branchId: string; brandId: string; customerId: string; type: "EARN" | "REDEEM" | "ADJUST"; points: number; orderId?: string | null; reason?: string | null; userId?: string | null }
) {
  const account = await tx.loyaltyAccount.findUniqueOrThrow({ where: { id: params.accountId } });
  const newBalance = account.pointsBalance + params.points;
  if (newBalance < 0) throw new LoyaltyError("insufficient_points");
  const lifetime = account.lifetimePoints + Math.max(0, params.type === "REDEEM" ? 0 : params.points);
  const updated = await tx.loyaltyAccount.update({
    where: { id: account.id },
    data: { pointsBalance: newBalance, lifetimePoints: lifetime, tier: tierFor(lifetime) },
  });
  const txRow = await tx.loyaltyTransaction.create({
    data: {
      accountId: account.id,
      orderId: params.orderId ?? null,
      type: params.type,
      points: params.points,
      newBalance,
      reason: params.reason ?? null,
      userId: params.userId ?? null,
    },
  });
  await writeOutboxEvent(tx, {
    branchId: params.branchId,
    aggregateType: "LoyaltyTransaction",
    aggregateId: txRow.id,
    eventType: "loyalty_transaction.created",
    payload: {
      brandId: params.brandId,
      accountId: account.id,
      customerId: params.customerId,
      orderId: txRow.orderId,
      type: txRow.type,
      points: txRow.points,
      newBalance,
    },
    occurredAt: txRow.createdAt,
  });
  return { account: updated, transaction: txRow };
}

export class LoyaltyError extends Error {}

/**
 * Earns the points for one paid order, if it belongs to a customer. Safe to call more
 * than once: an order that already earned is skipped, so a double-recorded payment can
 * never double the points.
 */
export async function earnForOrder(tx: Tx, orderId: string) {
  const order = await tx.order.findUnique({ where: { id: orderId }, include: { branch: true } });
  if (!order || !order.customerId) return null;
  if (!["PAID", "CLOSED"].includes(order.status)) return null;
  if (await tx.loyaltyTransaction.findFirst({ where: { orderId, type: "EARN" }, select: { id: true } })) return null;
  const points = pointsFor(order.total.toNumber());
  if (points <= 0) return null;
  const account = await accountFor(tx, order.customerId, order.branch.brandId);
  return record(tx, {
    accountId: account.id,
    branchId: order.branchId,
    brandId: order.branch.brandId,
    customerId: order.customerId,
    type: "EARN",
    points,
    orderId,
    reason: `Order #${orderId.slice(-6).toUpperCase()}`,
  });
}

/** Staff redeem (spend) or adjust points on an account. Redeeming below zero is refused. */
export async function adjustPoints(params: { accountId: string; type: "REDEEM" | "ADJUST"; points: number; reason: string; userId: string; branchId: string }) {
  return prisma.$transaction(async (tx) => {
    const account = await tx.loyaltyAccount.findUniqueOrThrow({ where: { id: params.accountId } });
    const signed = params.type === "REDEEM" ? -Math.abs(params.points) : params.points;
    return record(tx, {
      accountId: account.id,
      branchId: params.branchId,
      brandId: account.brandId,
      customerId: account.customerId,
      type: params.type,
      points: signed,
      reason: params.reason,
      userId: params.userId,
    });
  });
}

/**
 * Attaches a customer (found or created by phone) to orders and earns points for any of
 * them already paid. Used by the guest's opt-in on the bill screen (all orders of their
 * table visit) and by staff at the till (one order).
 */
export async function linkCustomerToOrders(params: { tenantId: string; phone: string; name?: string | null; orderIds: string[] }) {
  const phone = normalizePhone(params.phone);
  if (!phone) throw new LoyaltyError("bad_phone");
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { tenantId_phone: { tenantId: params.tenantId, phone } },
      create: { tenantId: params.tenantId, phone, name: params.name?.trim() || null },
      update: params.name?.trim() ? { name: params.name.trim() } : {},
    });
    if (params.orderIds.length > 0) {
      await tx.order.updateMany({ where: { id: { in: params.orderIds }, customerId: null }, data: { customerId: customer.id } });
    }
    let earned = 0;
    for (const id of params.orderIds) {
      const r = await earnForOrder(tx, id);
      if (r) earned += r.transaction.points;
    }
    return { customer, earned };
  });
}

export function nextTier(lifetimePoints: number) {
  const next = [...TIERS].reverse().find((t) => t.min > lifetimePoints);
  return next ? { tier: next.tier, pointsToGo: next.min - lifetimePoints } : null;
}
