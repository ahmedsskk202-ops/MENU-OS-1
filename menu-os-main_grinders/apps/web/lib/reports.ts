import { prisma } from "./db";
import { computeExpectedCash, computeVariance } from "./shifts";
import type { DateRange } from "./date-range";

export type { DateRange };

function num(d: { toNumber(): number } | null | undefined): number {
  return d ? d.toNumber() : 0;
}

/** Sales report: gross/net sales, discounts, tax, service fee, refunds, by channel and by day. */
export async function getSalesReport(branchId: string, range: DateRange) {
  const orders = await prisma.order.findMany({
    where: { branchId, createdAt: { gte: range.from, lte: range.to }, status: { notIn: ["CANCELLED"] } },
    include: { payments: { include: { refunds: true } } },
  });

  const grossSales = orders.reduce((s, o) => s + o.subtotal.toNumber(), 0);
  const discountTotal = orders.reduce((s, o) => s + o.discountTotal.toNumber(), 0);
  const taxTotal = orders.reduce((s, o) => s + o.taxTotal.toNumber(), 0);
  const serviceFeeTotal = orders.reduce((s, o) => s + o.serviceFeeTotal.toNumber(), 0);
  const refundTotal = orders.reduce(
    (s, o) => s + o.payments.flatMap((p) => p.refunds).filter((r) => r.status === "COMPLETED").reduce((rs, r) => rs + r.amount.toNumber(), 0),
    0
  );
  const grossRevenue = orders.reduce((s, o) => s + o.total.toNumber(), 0);
  const netSales = grossRevenue - refundTotal;

  const byType: Record<string, { count: number; revenue: number }> = { DINE_IN: { count: 0, revenue: 0 }, PICKUP: { count: 0, revenue: 0 }, DELIVERY: { count: 0, revenue: 0 } };
  for (const o of orders) {
    byType[o.type].count++;
    byType[o.type].revenue += o.total.toNumber();
  }

  const byDayMap = new Map<string, { orders: number; revenue: number }>();
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    const entry = byDayMap.get(day) ?? { orders: 0, revenue: 0 };
    entry.orders++;
    entry.revenue += o.total.toNumber();
    byDayMap.set(day, entry);
  }
  const byDay = [...byDayMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ date, ...v }));

  return {
    ordersCount: orders.length,
    grossSales: round2(grossSales),
    discountTotal: round2(discountTotal),
    taxTotal: round2(taxTotal),
    serviceFeeTotal: round2(serviceFeeTotal),
    refundTotal: round2(refundTotal),
    netSales: round2(netSales),
    avgOrderValue: orders.length > 0 ? round2(grossRevenue / orders.length) : 0,
    byType,
    byDay,
  };
}

/** Payments report: breakdown by method, including tips and how much is still outstanding. */
export async function getPaymentsReport(branchId: string, range: DateRange) {
  const payments = await prisma.payment.findMany({
    where: { order: { branchId }, createdAt: { gte: range.from, lte: range.to } },
  });

  const byMethod: Record<string, { count: number; amount: number; tips: number; verified: number; pending: number }> = {};
  for (const p of payments) {
    const bucket = byMethod[p.method] ?? { count: 0, amount: 0, tips: 0, verified: 0, pending: 0 };
    bucket.count++;
    bucket.amount += p.amount.toNumber();
    bucket.tips += p.tipAmount.toNumber();
    if (p.status === "VERIFIED") bucket.verified += p.amount.toNumber();
    if (p.status === "PENDING") bucket.pending += p.amount.toNumber();
    byMethod[p.method] = bucket;
  }

  const orders = await prisma.order.findMany({
    where: { branchId, createdAt: { gte: range.from, lte: range.to }, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    include: { payments: true },
  });
  const outstanding = orders.reduce((sum, o) => {
    const paid = o.payments.filter((p) => p.status === "VERIFIED").reduce((s, p) => s + p.amount.toNumber(), 0);
    return sum + Math.max(0, o.total.toNumber() - paid);
  }, 0);

  return { byMethod, totalOutstanding: round2(outstanding) };
}

export async function getRefundsReport(branchId: string, range: DateRange) {
  const refunds = await prisma.refund.findMany({
    where: { payment: { order: { branchId } }, createdAt: { gte: range.from, lte: range.to } },
    include: { payment: { include: { order: true } }, processedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    count: refunds.length,
    total: round2(refunds.filter((r) => r.status === "COMPLETED").reduce((s, r) => s + r.amount.toNumber(), 0)),
    refunds: refunds.map((r) => ({
      id: r.id,
      orderId: r.payment.orderId,
      amount: r.amount.toNumber(),
      reason: r.reason,
      status: r.status,
      processedBy: r.processedBy?.name ?? null,
      createdAt: r.createdAt,
    })),
  };
}

export async function getExpensesReport(branchId: string, range: DateRange) {
  const expenses = await prisma.expense.findMany({
    where: { branchId, createdAt: { gte: range.from, lte: range.to } },
    include: { recordedBy: true },
    orderBy: { createdAt: "desc" },
  });
  const byCategory: Record<string, number> = {};
  for (const e of expenses) byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount.toNumber();
  return {
    count: expenses.length,
    total: round2(expenses.reduce((s, e) => s + e.amount.toNumber(), 0)),
    byCategory,
    expenses: expenses.map((e) => ({ id: e.id, category: e.category, amount: e.amount.toNumber(), description: e.description, recordedBy: e.recordedBy.name, createdAt: e.createdAt })),
  };
}

/** Cash reconciliation for one shift — works for an OPEN shift too (a live preview before closing). */
export async function getCashReconciliationReport(shiftId: string) {
  const shift = await prisma.shift.findUniqueOrThrow({ where: { id: shiftId }, include: { openedBy: true, closedBy: true } });
  const [cashSalesAgg, cashMovements, cashRefundsAgg] = await Promise.all([
    prisma.payment.aggregate({ where: { shiftId, method: "CASH", status: "VERIFIED" }, _sum: { amount: true } }),
    prisma.cashMovement.findMany({ where: { shiftId }, include: { recordedBy: true } }),
    prisma.refund.aggregate({ where: { status: "COMPLETED", payment: { shiftId, method: "CASH" } }, _sum: { amount: true } }),
  ]);

  const cashIn = cashMovements.filter((m) => m.type === "CASH_IN").reduce((s, m) => s + m.amount.toNumber(), 0);
  const cashOut = cashMovements.filter((m) => m.type === "CASH_OUT").reduce((s, m) => s + m.amount.toNumber(), 0);
  const cashSales = num(cashSalesAgg._sum.amount);
  const cashRefunds = num(cashRefundsAgg._sum.amount);
  const openingCash = shift.openingCash.toNumber();
  const expectedCash = shift.status === "CLOSED" && shift.expectedCash ? shift.expectedCash.toNumber() : computeExpectedCash({ openingCash, cashSales, cashIn, cashOut, cashRefunds });
  const actualCash = shift.actualCash?.toNumber() ?? null;
  const variance = actualCash != null ? computeVariance(actualCash, expectedCash) : null;

  return {
    shift: { id: shift.id, status: shift.status, openedAt: shift.openedAt, closedAt: shift.closedAt, openedBy: shift.openedBy.name, closedBy: shift.closedBy?.name ?? null },
    openingCash,
    cashSales: round2(cashSales),
    cashIn: round2(cashIn),
    cashOut: round2(cashOut),
    cashRefunds: round2(cashRefunds),
    expectedCash: round2(expectedCash),
    actualCash,
    variance,
    varianceReason: shift.varianceReason,
    movements: cashMovements.map((m) => ({ type: m.type, amount: m.amount.toNumber(), reason: m.reason, recordedBy: m.recordedBy.name, createdAt: m.createdAt })),
  };
}

export async function getShiftClosingReport(shiftId: string) {
  const [reconciliation, orders, expenses] = await Promise.all([
    getCashReconciliationReport(shiftId),
    prisma.order.findMany({ where: { payments: { some: { shiftId } } }, include: { payments: { where: { shiftId } } } }),
    prisma.expense.findMany({ where: { shiftId }, include: { recordedBy: true } }),
  ]);
  const salesTotal = orders.reduce((s, o) => s + o.payments.reduce((ps, p) => ps + p.amount.toNumber(), 0), 0);
  return {
    ...reconciliation,
    ordersCount: orders.length,
    salesTotal: round2(salesTotal),
    expensesTotal: round2(expenses.reduce((s, e) => s + e.amount.toNumber(), 0)),
    expenses: expenses.map((e) => ({ category: e.category, amount: e.amount.toNumber(), recordedBy: e.recordedBy.name })),
  };
}

export async function getBranchPerformanceReport(branchIds: string[], range: DateRange) {
  const results = [];
  for (const branchId of branchIds) {
    const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { brand: true } });
    if (!branch) continue;
    const sales = await getSalesReport(branchId, range);
    results.push({ branchId, branchName: branch.name, brandName: branch.brand.name, ...sales });
  }
  return results.sort((a, b) => b.netSales - a.netSales);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
