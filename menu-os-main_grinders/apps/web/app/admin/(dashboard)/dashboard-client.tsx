// The command centre itself. Split out from page.tsx so that file can stay a server
// component and redirect staff to the screen their role actually works from — see
// the note there. Everything here is client-side because it is a live dashboard.
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DollarSign, ShoppingBag, LayoutGrid, Gamepad2, Radio, CloudOff, Cloud, RefreshCw, Receipt, Undo2, Wallet, TrendingUp, TrendingDown, ChefHat, BarChart3, ClipboardList, ConciergeBell, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { PERMISSIONS } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth";

interface SyncStatus {
  cloudConfigured: boolean;
  pending: number;
  syncing: number;
  failed: number;
  synced: number;
  status: "LOCAL_ONLY" | "UP_TO_DATE" | "SYNCING" | "RETRYING";
}

function SyncStatusBadge() {
  const { branchId } = useBranch();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (!branchId) return;
    const refresh = () => fetch(`/api/sync/status?branchId=${branchId}`).then((r) => r.ok && r.json()).then((j) => j && setStatus(j));
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [branchId]);

  if (!status) return null;

  const backlog = status.pending + status.syncing + status.failed;

  if (!status.cloudConfigured) {
    return (
      <Badge tone="neutral" title={t("admin.dash.sync.localTitle")}>
        <CloudOff className="h-3 w-3" /> {t("admin.dash.sync.local")}
      </Badge>
    );
  }
  if (status.status === "RETRYING") {
    return (
      <Badge tone="warning">
        <CloudOff className="h-3 w-3" /> {t("admin.dash.sync.offline", { n: backlog })}
      </Badge>
    );
  }
  if (backlog > 0) {
    return (
      <Badge tone="accent">
        <RefreshCw className="h-3 w-3" /> {t("admin.dash.sync.syncing", { n: backlog })}
      </Badge>
    );
  }
  return (
    <Badge tone="success">
      <Cloud className="h-3 w-3" /> {t("admin.dash.sync.synced")}
    </Badge>
  );
}

interface Summary {
  revenue: number;
  ordersCount: number;
  avgOrderValue: number;
  revenueByType: Record<string, number>;
  activeTables: number;
  openWaiterRequests: number;
  gamesPlayed: number;
  discounts: number;
  refunds: number;
  expenses: number;
  paymentBreakdown: Record<string, { count: number; amount: number; tips: number }>;
  outstandingPayments: number;
  mostSoldProduct: { name: string; unitsSold: number } | null;
  leastSoldProduct: { name: string; unitsSold: number } | null;
  peakHours: { hour: number; orders: number }[];
  openShift: { id: string; openedBy: string; openedAt: string; cashVariancePreview: { expectedCash: number; cashSales: number } | null } | null;
  openOrdersCount: number;
  kitchenStatus: Record<string, number>;
  revenueChange: { previousRevenue: number; previousOrdersCount: number; revenueDelta: number; revenueChangePercent: number | null; ordersDelta: number };
}

interface ActivityEntry {
  id: string;
  label: string;
  time: string;
}

export function CommandCenter() {
  const { branchId, currentBranch } = useBranch();
  const { data: session } = useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const { t } = useLocale();

  // The figure panels below are all one request, and that request requires
  // analytics.view — which the Cashier deliberately does not hold, because the takings
  // of the whole branch are not reception's business. This screen is gated on
  // dashboard.view instead, so the two do not always line up.
  //
  // Without this check a Cashier got a 403 every thirty seconds and a screen of em
  // dashes, which reads as "the cafe took no money today" rather than "these figures
  // are not yours". Ask the session instead: the permission list is already in the JWT
  // and the API re-checks it regardless.
  const permissions = new Set((session?.user as SessionUser | undefined)?.permissions ?? []);
  const canSeeFigures = permissions.has(PERMISSIONS.ANALYTICS_VIEW);

  async function refresh() {
    if (!branchId || !canSeeFigures) return;
    const res = await fetch(`/api/analytics/summary?branchId=${branchId}&range=today`);
    if (res.ok) setSummary(await res.json());
  }

  useEffect(() => {
    refresh();
    if (!canSeeFigures) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [branchId, canSeeFigures]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    let label: string | null = null;
    if (event.type === "order.created") label = t("admin.dash.activity.newOrder");
    if (event.type === "waiter_request.created") label = t("admin.dash.activity.waiter");
    if (event.type === "product.availability_changed" && event.status === "SOLD_OUT") label = t("admin.dash.activity.soldOut");
    if (event.type === "order.status_changed" && event.status === "READY") label = t("admin.dash.activity.ready");
    if (label) {
      setActivity((prev) => [{ id: `${Date.now()}-${Math.random()}`, label, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 12));
      refresh();
    }
  });

  return (
    <div className="p-8 max-w-7xl">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("admin.dash.title")}</h1>
          <p className="text-muted-foreground mt-1">{currentBranch ? `${currentBranch.brandName} · ${currentBranch.name}` : t("admin.common.loadingBranch")}</p>
        </div>
        <SyncStatusBadge />
      </header>

      {/*
        Every figure on this screen comes from one analytics call. When the role is not
        allowed to make it, the panels are not rendered empty — eight tiles full of "—"
        are indistinguishable from a cafe that took nothing today. The live activity
        feed below needs no permission, so it stays: it is the part of the command
        centre that is actually about the next ten minutes.
      */}
      {!canSeeFigures && (
        <Card className="p-6 mb-8 flex items-start gap-4">
          <BarChart3 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{t("admin.dash.figuresNotYours")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("admin.dash.figuresNotYoursBody")}</p>
          </div>
        </Card>
      )}

      {canSeeFigures && (
        <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          label={t("admin.dash.todayRevenue")}
          value={summary ? formatMoney(summary.revenue, currentBranch?.currency) : "—"}
          sublabel={
            summary?.revenueChange
              ? t("admin.dash.vsPrevious", {
                  // LRI…PDI isolates keep the sign next to the amount inside Arabic (RTL) text.
                  delta: `⁦${summary.revenueChange.revenueDelta >= 0 ? "+" : ""}${formatMoney(summary.revenueChange.revenueDelta, currentBranch?.currency)}⁩`,
                  pct: summary.revenueChange.revenueChangePercent !== null ? ` (⁦${summary.revenueChange.revenueChangePercent >= 0 ? "+" : ""}${summary.revenueChange.revenueChangePercent}%⁩)` : "",
                })
              : undefined
          }
          icon={DollarSign}
          tone="accent"
        />
        <StatCard label={t("admin.dash.orders")} value={summary ? String(summary.ordersCount) : "—"} sublabel={summary ? t("admin.dash.avg", { amount: formatMoney(summary.avgOrderValue, currentBranch?.currency) }) : undefined} icon={ShoppingBag} />
        <StatCard label={t("admin.dash.activeTables")} value={summary ? String(summary.activeTables) : "—"} icon={LayoutGrid} />
        <StatCard label={t("admin.dash.gamesPlayed")} value={summary ? String(summary.gamesPlayed) : "—"} icon={Gamepad2} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label={t("admin.dash.discounts")} value={summary ? formatMoney(summary.discounts, currentBranch?.currency) : "—"} icon={Receipt} />
        <StatCard label={t("admin.dash.refunds")} value={summary ? formatMoney(summary.refunds, currentBranch?.currency) : "—"} icon={Undo2} />
        <StatCard label={t("admin.dash.expenses")} value={summary ? formatMoney(summary.expenses, currentBranch?.currency) : "—"} icon={Wallet} />
        <StatCard
          label={t("admin.dash.cashVariance")}
          value={summary?.openShift?.cashVariancePreview ? formatMoney(summary.openShift.cashVariancePreview.expectedCash, currentBranch?.currency) : summary?.openShift ? "—" : t("admin.dash.noOpenShift")}
          sublabel={summary?.openShift ? t("admin.dash.openedBy", { name: summary.openShift.openedBy }) : undefined}
          icon={Wallet}
          tone={summary?.openShift ? "accent" : "neutral"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4">{t("admin.dash.paymentBreakdown")}</h2>
          <div className="space-y-2 text-sm">
            {summary &&
              Object.entries(summary.paymentBreakdown).map(([method, v]) => (
                <div key={method} className="flex justify-between">
                  <span className="text-muted-foreground">{enumLabel(t, method)}</span>
                  <span>{v.count}x · {formatMoney(v.amount, currentBranch?.currency)}</span>
                </div>
              ))}
            {summary && summary.outstandingPayments > 0 && (
              <div className="flex justify-between pt-2 border-t border-border text-warning">
                <span>{t("admin.dash.outstanding")}</span>
                <span>{formatMoney(summary.outstandingPayments, currentBranch?.currency)}</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4">{t("admin.dash.productPerformance")}</h2>
          <div className="space-y-3 text-sm">
            {summary?.mostSoldProduct && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>{summary.mostSoldProduct.name}</span>
                <span className="text-muted-foreground ms-auto">{t("admin.dash.sold", { n: summary.mostSoldProduct.unitsSold })}</span>
              </div>
            )}
            {summary?.leastSoldProduct && (
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-danger" />
                <span>{summary.leastSoldProduct.name}</span>
                <span className="text-muted-foreground ms-auto">{t("admin.dash.sold", { n: summary.leastSoldProduct.unitsSold })}</span>
              </div>
            )}
            {summary && summary.peakHours.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">{t("admin.dash.peakHour")}</p>
                <p>{t("admin.dash.peakOrders", { hour: summary.peakHours[0].hour, n: summary.peakHours[0].orders })}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <ChefHat className="h-4 w-4" /> {t("admin.dash.kitchenOrders")}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("admin.dash.openOrders")}</span><span>{summary?.openOrdersCount ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("admin.dash.waiterRequests")}</span><span>{summary?.openWaiterRequests ?? "—"}</span></div>
            {summary &&
              Object.entries(summary.kitchenStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-muted-foreground">{enumLabel(t, status)}</span>
                  <span>{count}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>

        </>
      )}

      {/* Outside the figures block on purpose: the live feed needs no analytics
          permission, and reception gets a row of shortcuts to the screens it works in
          instead of a dashboard that is otherwise just a notice. */}
      <div className="grid lg:grid-cols-3 gap-6">
        {!canSeeFigures && <QuickActions permissions={permissions} />}
        {canSeeFigures && (
        <Card className="lg:col-span-2 p-6">
          <h2 className="font-display text-lg font-semibold mb-4">{t("admin.dash.revenueByChannel")}</h2>
          <div className="space-y-3">
            {summary &&
              Object.entries(summary.revenueByType).map(([type, value]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{enumLabel(t, type)}</span>
                    <span className="font-medium">{formatMoney(value, currentBranch?.currency)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${summary.revenue > 0 ? (value / summary.revenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Card>
        )}

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Radio className="h-4 w-4 text-accent-ink animate-pulse" /> {t("admin.dash.liveActivity")}
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto premium-scroll">
            {activity.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.dash.waiting")}</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex justify-between text-sm border-b border-border pb-2 last:border-0 animate-fade-up">
                <span>{a.label}</span>
                <span className="text-muted-foreground text-xs">{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Shortcuts for dashboard users who do not see the figures (the reception desk). */
function QuickActions({ permissions }: { permissions: Set<string> }) {
  const { t } = useLocale();
  const links = [
    { href: "/admin/orders", label: "admin.nav.orders", icon: ClipboardList, permission: PERMISSIONS.ORDERS_MANAGE },
    { href: "/admin/waiter", label: "admin.nav.waiter", icon: ConciergeBell, permission: PERMISSIONS.ORDERS_SERVE },
    { href: "/admin/reservations", label: "admin.nav.reservations", icon: CalendarClock, permission: PERMISSIONS.RESERVATIONS_MANAGE },
    { href: "/admin/shifts", label: "admin.nav.shifts", icon: Wallet, permission: PERMISSIONS.SHIFTS_MANAGE },
  ].filter((l) => permissions.has(l.permission));
  if (links.length === 0) return null;
  return (
    <Card className="lg:col-span-2 p-6">
      <h2 className="font-display text-lg font-semibold mb-4">{t("admin.dash.quickActions")}</h2>
      <div className="grid grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-xl border border-border px-4 py-4 font-semibold hover:bg-muted transition-colors">
            <l.icon className="h-5 w-5 text-accent-ink" />
            {t(l.label)}
          </Link>
        ))}
      </div>
    </Card>
  );
}
