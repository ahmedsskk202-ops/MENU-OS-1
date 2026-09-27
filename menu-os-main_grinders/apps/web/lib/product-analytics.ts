import { prisma } from "./db";
import type { DateRange } from "./date-range";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function productSales(branchId: string, range: DateRange) {
  const items = await prisma.orderItem.findMany({
    where: {
      order: { branchId, createdAt: { gte: range.from, lte: range.to }, status: { notIn: ["CANCELLED"] } },
    },
    select: { productId: true, quantity: true, lineTotal: true, product: { select: { name: true, category: true } } },
  });

  const byProduct = new Map<string, { name: string; category: string; unitsSold: number; revenue: number; orderCount: Set<never> }>();
  for (const item of items) {
    const key = item.productId;
    const entry = byProduct.get(key) ?? { name: item.product.name, category: item.product.category.name, unitsSold: 0, revenue: 0, orderCount: new Set() };
    entry.unitsSold += item.quantity;
    entry.revenue += item.lineTotal.toNumber();
    byProduct.set(key, entry);
  }
  return byProduct;
}

export async function getProductAnalytics(branchId: string, range: DateRange, previousRange?: DateRange) {
  const byProduct = await productSales(branchId, range);

  const allActiveProducts = await prisma.product.findMany({
    where: { isActive: true, category: { menu: { brand: { branches: { some: { id: branchId } } } } } },
    select: { id: true, name: true, category: { select: { name: true } } },
  });

  const products = [...byProduct.entries()]
    .map(([productId, v]) => ({ productId, name: v.name, category: v.category, unitsSold: v.unitsSold, revenue: round2(v.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);

  const soldProductIds = new Set(byProduct.keys());
  const zeroSalesProducts = allActiveProducts.filter((p) => !soldProductIds.has(p.id)).map((p) => ({ productId: p.id, name: p.name, category: p.category.name }));

  const categoryMap = new Map<string, { unitsSold: number; revenue: number }>();
  for (const p of products) {
    const entry = categoryMap.get(p.category) ?? { unitsSold: 0, revenue: 0 };
    entry.unitsSold += p.unitsSold;
    entry.revenue += p.revenue;
    categoryMap.set(p.category, entry);
  }
  const categoryPerformance = [...categoryMap.entries()].map(([category, v]) => ({ category, ...v, revenue: round2(v.revenue) })).sort((a, b) => b.revenue - a.revenue);

  // Peak hours / best days computed from actual order timestamps in range.
  const orders = await prisma.order.findMany({
    where: { branchId, createdAt: { gte: range.from, lte: range.to }, status: { notIn: ["CANCELLED"] } },
    select: { createdAt: true, total: true },
  });
  const hourMap = new Map<number, { orders: number; revenue: number }>();
  const dayMap = new Map<number, { orders: number; revenue: number }>();
  for (const o of orders) {
    const hour = o.createdAt.getHours();
    const day = o.createdAt.getDay();
    const hourEntry = hourMap.get(hour) ?? { orders: 0, revenue: 0 };
    hourEntry.orders++;
    hourEntry.revenue += o.total.toNumber();
    hourMap.set(hour, hourEntry);
    const dayEntry = dayMap.get(day) ?? { orders: 0, revenue: 0 };
    dayEntry.orders++;
    dayEntry.revenue += o.total.toNumber();
    dayMap.set(day, dayEntry);
  }
  const peakHours = [...hourMap.entries()].map(([hour, v]) => ({ hour, ...v, revenue: round2(v.revenue) })).sort((a, b) => b.orders - a.orders);
  const bestDays = [...dayMap.entries()].map(([day, v]) => ({ day: WEEKDAYS[day], ...v, revenue: round2(v.revenue) })).sort((a, b) => b.revenue - a.revenue);

  let trends: { productId: string; name: string; currentRevenue: number; previousRevenue: number; changePercent: number | null }[] = [];
  if (previousRange) {
    const byProductPrevious = await productSales(branchId, previousRange);
    const allIds = new Set([...byProduct.keys(), ...byProductPrevious.keys()]);
    trends = [...allIds]
      .map((id) => {
        const current = byProduct.get(id);
        const previous = byProductPrevious.get(id);
        const currentRevenue = round2(current?.revenue ?? 0);
        const previousRevenue = round2(previous?.revenue ?? 0);
        const changePercent = previousRevenue > 0 ? round2(((currentRevenue - previousRevenue) / previousRevenue) * 100) : currentRevenue > 0 ? 100 : null;
        return { productId: id, name: current?.name ?? previous?.name ?? id, currentRevenue, previousRevenue, changePercent };
      })
      .sort((a, b) => (b.changePercent ?? -Infinity) - (a.changePercent ?? -Infinity));
  }

  return {
    products,
    topProducts: products.slice(0, 10),
    lowProducts: products.slice(-10).reverse(),
    zeroSalesProducts,
    categoryPerformance,
    topCategories: categoryPerformance.slice(0, 5),
    lowCategories: categoryPerformance.slice(-5).reverse(),
    peakHours: peakHours.slice(0, 5),
    bestDays,
    trends: previousRange ? { rising: trends.filter((t) => (t.changePercent ?? 0) > 0).slice(0, 10), declining: trends.filter((t) => (t.changePercent ?? 0) < 0).slice(-10).reverse() } : null,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
