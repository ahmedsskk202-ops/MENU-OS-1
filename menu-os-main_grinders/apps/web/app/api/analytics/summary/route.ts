import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/rbac";
import { parseDateRange, previousPeriod } from "@/lib/date-range";
import { getSalesReport, getPaymentsReport, getRefundsReport, getExpensesReport, getCashReconciliationReport } from "@/lib/reports";
import { getProductAnalytics } from "@/lib/product-analytics";
import { checkBranchAccess } from "@/lib/branch-access";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user || !user.permissions.includes(PERMISSIONS.ANALYTICS_VIEW)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const branchId = req.nextUrl.searchParams.get("branchId");
  if (!branchId) return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  const denied = await checkBranchAccess(user, branchId);
  if (denied) return denied;
  const range = parseDateRange(req.nextUrl.searchParams);

  const [sales, paidOrders, payments, refunds, expenses, productAnalytics, openShift, activeTables, openWaiterRequests, gamesPlayed, openOrdersCount, kitchenCounts] = await Promise.all([
    getSalesReport(branchId, range),
    // Kept distinct from getSalesReport's "all non-cancelled orders" view: the
    // dashboard's headline "revenue" number has always meant cash actually collected
    // (paid/closed), not gross sales activity — preserving that exact definition.
    prisma.order.findMany({ where: { branchId, createdAt: { gte: range.from, lte: range.to }, status: { in: ["PAID", "CLOSED"] } }, select: { total: true, type: true } }),
    getPaymentsReport(branchId, range),
    getRefundsReport(branchId, range),
    getExpensesReport(branchId, range),
    getProductAnalytics(branchId, range),
    prisma.shift.findFirst({ where: { branchId, status: "OPEN" }, include: { openedBy: true } }),
    prisma.restaurantTable.count({ where: { branchId, status: { not: "AVAILABLE" } } }),
    prisma.waiterRequest.count({ where: { tableSession: { table: { branchId } }, status: { not: "COMPLETED" } } }),
    prisma.gameSession.count({ where: { tableSession: { table: { branchId } }, createdAt: { gte: range.from }, status: "COMPLETED" } }),
    prisma.order.count({ where: { branchId, status: { notIn: ["PAID", "CLOSED", "CANCELLED", "REFUNDED"] } } }),
    prisma.kitchenOrder.groupBy({ by: ["status"], where: { station: { branchId }, status: { in: ["NEW", "PREPARING", "READY"] } }, _count: true }),
  ]);

  // Factual revenue-change breakdown — the previous equal-length period's real
  // paid/closed orders, same definition of "revenue" as above. No estimates.
  const prev = previousPeriod(range);
  const previousPaidOrders = await prisma.order.findMany({
    where: { branchId, createdAt: { gte: prev.from, lte: prev.to }, status: { in: ["PAID", "CLOSED"] } },
    select: { total: true },
  });
  const previousRevenue = previousPaidOrders.reduce((s, o) => s + o.total.toNumber(), 0);
  const previousOrdersCount = previousPaidOrders.length;
  const revenueChange = {
    previousRevenue: round2(previousRevenue),
    previousOrdersCount,
    revenueDelta: round2((paidOrders.reduce((s, o) => s + o.total.toNumber(), 0)) - previousRevenue),
    revenueChangePercent: previousRevenue > 0 ? round2(((paidOrders.reduce((s, o) => s + o.total.toNumber(), 0) - previousRevenue) / previousRevenue) * 100) : null,
    ordersDelta: paidOrders.length - previousOrdersCount,
  };

  const cashPreview = user.permissions.includes(PERMISSIONS.SHIFTS_MANAGE) && openShift ? await getCashReconciliationReport(openShift.id) : null;

  const kitchenStatus = { NEW: 0, PREPARING: 0, READY: 0 } as Record<string, number>;
  for (const row of kitchenCounts) kitchenStatus[row.status] = row._count;

  const revenue = paidOrders.reduce((sum, o) => sum + o.total.toNumber(), 0);
  const ordersCount = paidOrders.length;
  const revenueByType = { DINE_IN: 0, PICKUP: 0, DELIVERY: 0 } as Record<string, number>;
  for (const o of paidOrders) revenueByType[o.type] = (revenueByType[o.type] ?? 0) + o.total.toNumber();

  return NextResponse.json({
    range: range.label,
    // Kept the original meaning: cash actually collected (paid/closed orders only).
    revenue,
    ordersCount,
    avgOrderValue: ordersCount > 0 ? revenue / ordersCount : 0,
    revenueByType,
    activeTables,
    openWaiterRequests,
    gamesPlayed,
    // New financial/operational fields.
    discounts: sales.discountTotal,
    refunds: refunds.total,
    expenses: expenses.total,
    paymentBreakdown: payments.byMethod,
    outstandingPayments: payments.totalOutstanding,
    mostSoldProduct: productAnalytics.topProducts[0] ?? null,
    leastSoldProduct: productAnalytics.lowProducts[0] ?? null,
    peakHours: productAnalytics.peakHours,
    openShift: openShift ? { id: openShift.id, openedBy: openShift.openedBy.name, openedAt: openShift.openedAt, cashVariancePreview: cashPreview ? { expectedCash: cashPreview.expectedCash, cashSales: cashPreview.cashSales } : null } : null,
    openOrdersCount,
    kitchenStatus,
    revenueChange,
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
