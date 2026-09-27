"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/admin/StatCard";
import { formatMoney } from "@/lib/format";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

const RANGES = [
  { key: "today", label: "admin.analytics.today" },
  { key: "week", label: "admin.analytics.week" },
  { key: "month", label: "admin.analytics.month" },
];

export default function AnalyticsPage() {
  const { branchId, currentBranch } = useBranch();
  const [range, setRange] = useState("today");
  const [summary, setSummary] = useState<any>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/analytics/summary?branchId=${branchId}&range=${range}`)
      .then((r) => r.json())
      .then(setSummary);
  }, [branchId, range]);

  const chartData = summary
    ? Object.entries(summary.revenueByType as Record<string, number>).map(([type, value]) => ({ type: enumLabel(t, type), revenue: value }))
    : [];

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">{t("admin.analytics.title")}</h1>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border",
                range === r.key ? "bg-accent text-accent-foreground border-accent-ink" : "border-border text-muted-foreground"
              )}
            >
              {t(r.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label={t("admin.analytics.revenue")} value={summary ? formatMoney(summary.revenue, currentBranch?.currency) : "—"} icon={DollarSign} tone="accent" />
        <StatCard label={t("admin.analytics.orders")} value={summary ? String(summary.ordersCount) : "—"} icon={ShoppingBag} />
        <StatCard label={t("admin.analytics.avgOrder")} value={summary ? formatMoney(summary.avgOrderValue, currentBranch?.currency) : "—"} icon={TrendingUp} />
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold mb-6">{t("admin.analytics.byChannel")}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{ background: "hsl(var(--surface-raised))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="revenue" name={t("admin.analytics.revenue")} fill="hsl(var(--accent-ink))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
