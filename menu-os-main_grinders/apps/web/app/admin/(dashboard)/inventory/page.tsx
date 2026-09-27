"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Plus, Boxes, ChefHat, AlertTriangle, PackagePlus, ClipboardCheck, Trash2, ArrowLeftRight, History, Search,
  PackageX, PackageMinus, Timer, Wallet, TrendingDown, X, Settings2, CalendarClock,
} from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { PERMISSIONS } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

type Tab = "overview" | "stock" | "receive" | "issue" | "count" | "movements" | "items" | "recipes";

interface Item {
  id: string; name: string; unit: string; sku: string | null; category: string | null; isActive: boolean;
  costingMethod: "FIFO" | "FEFO"; trackExpiry: boolean; shelfLifeDays: number | null; expiryAlertDays: number;
  lowStockThreshold: number | null; reorderQuantity: number | null; onHand: number;
  state: "OK" | "LOW" | "OUT" | "UNTRACKED"; batchCount: number; nextExpiry: string | null; daysToExpiry: number | null;
  expiringSoon: boolean; avgDailyUsage: number; daysLeft: number | null; reorderSuggestion: number | null;
  stockValue?: number; lastUnitCost?: number | null;
}
interface Overview {
  items: Item[];
  expiring: { batchId: string; ingredientId: string; name: string; unit: string; quantity: number; expiresAt: string; days: number; alertDays: number; batchCode: string | null }[];
  summary: { totalItems: number; tracked: number; low: number; out: number; expiringSoon: number; stockValue?: number; cogs30?: number; waste30?: number };
  canSeeCost: boolean;
  currency: string;
}

const qty = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 3 });
const input = "rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm";
const today = () => new Date().toISOString().slice(0, 10);

export default function InventoryPage() {
  const { t } = useLocale();
  const { data: session } = useSession();
  const { branchId, currentBranch } = useBranch();
  const perms = new Set((session?.user as SessionUser | undefined)?.permissions ?? []);
  const canManage = perms.has(PERMISSIONS.INVENTORY_MANAGE);
  const canWaste = canManage || perms.has(PERMISSIONS.INVENTORY_WASTE);

  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Overview | null>(null);
  const [action, setAction] = useState<{ kind: "waste" | "transfer" | "history"; item: Item } | null>(null);

  const refresh = useCallback(async () => {
    if (!branchId) return;
    const res = await fetch(`/api/inventory/overview?branchId=${branchId}`);
    if (res.ok) setData(await res.json());
  }, [branchId]);

  useEffect(() => { refresh(); }, [refresh]);
  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (event.type === "inventory.changed") refresh();
  });

  const tabs: { key: Tab; show: boolean }[] = [
    { key: "overview", show: true },
    { key: "stock", show: true },
    { key: "receive", show: canManage },
    { key: "issue", show: canWaste },
    { key: "count", show: canManage },
    { key: "movements", show: true },
    { key: "items", show: canManage },
    { key: "recipes", show: canManage },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("admin.inv.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentBranch ? `${currentBranch.brandName} · ${currentBranch.name}` : ""}</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setTab("receive")}><PackagePlus className="h-4 w-4" /> {t("admin.inv.receive")}</Button>
            <Button size="sm" variant="outline" onClick={() => setTab("count")}><ClipboardCheck className="h-4 w-4" /> {t("admin.inv.count")}</Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.filter((x) => x.show).map((x) => (
          <button key={x.key} onClick={() => setTab(x.key)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", tab === x.key ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>
            {t(`admin.inv.tab.${x.key}`)}
          </button>
        ))}
      </div>

      {!data && <p className="text-sm text-muted-foreground">{t("admin.common.loading")}</p>}
      {data && tab === "overview" && <OverviewTab data={data} onOpen={(item) => setAction({ kind: "history", item })} goStock={() => setTab("stock")} canManage={canManage} goReceive={() => setTab("receive")} />}
      {data && tab === "stock" && (
        <StockTab data={data} canManage={canManage} canWaste={canWaste} onAction={(kind, item) => setAction({ kind, item })} />
      )}
      {data && tab === "receive" && branchId && <ReceiveTab items={data.items} branchId={branchId} currency={data.currency} onDone={() => { refresh(); setTab("stock"); }} />}
      {data && tab === "issue" && branchId && <IssueTab items={data.items} branchId={branchId} onDone={() => { refresh(); setTab("movements"); }} />}
      {data && tab === "count" && branchId && <CountTab items={data.items} branchId={branchId} onDone={() => { refresh(); setTab("stock"); }} />}
      {data && tab === "movements" && branchId && <MovementsTab branchId={branchId} items={data.items} canSeeCost={data.canSeeCost} currency={data.currency} />}
      {data && tab === "items" && currentBranch && <ItemsTab items={data.items} brandId={currentBranch.brandId} branchId={currentBranch.id} currency={data.currency} onChange={refresh} />}
      {data && tab === "recipes" && <RecipesTab branchId={currentBranch?.id} currency={currentBranch?.currency} items={data.items} />}

      {action && branchId && (
        <Drawer onClose={() => setAction(null)} title={action.item.name}>
          {action.kind === "waste" && <WasteForm item={action.item} branchId={branchId} onDone={() => { setAction(null); refresh(); }} />}
          {action.kind === "transfer" && <TransferForm item={action.item} branchId={branchId} onDone={() => { setAction(null); refresh(); }} />}
          {action.kind === "history" && <HistoryPanel item={action.item} branchId={branchId} canSeeCost={!!data?.canSeeCost} currency={data?.currency} />}
        </Drawer>
      )}
    </div>
  );
}

function StateBadge({ item }: { item: Item }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-wrap gap-1">
      {item.state === "OUT" && <Badge tone="danger"><PackageX className="h-3 w-3" /> {t("admin.inv.state.OUT")}</Badge>}
      {item.state === "LOW" && <Badge tone="warning"><AlertTriangle className="h-3 w-3" /> {t("admin.inv.state.LOW")}</Badge>}
      {item.state === "OK" && <Badge tone="success">{t("admin.inv.state.OK")}</Badge>}
      {item.state === "UNTRACKED" && <Badge tone="neutral">{t("admin.inv.state.UNTRACKED")}</Badge>}
      {item.expiringSoon && <Badge tone="warning"><Timer className="h-3 w-3" /> {t("admin.inv.expiresIn", { n: Math.max(0, item.daysToExpiry ?? 0) })}</Badge>}
      {!item.isActive && <Badge tone="neutral">{t("admin.common.inactive")}</Badge>}
    </div>
  );
}

// ─── overview ─────────────────────────────────────────────────────────────

function OverviewTab({ data, onOpen, goStock, goReceive, canManage }: { data: Overview; onOpen: (i: Item) => void; goStock: () => void; goReceive: () => void; canManage: boolean }) {
  const { t } = useLocale();
  const s = data.summary;
  const needAction = data.items.filter((i) => i.isActive && (i.state === "OUT" || i.state === "LOW")).sort((a, b) => (a.state === b.state ? a.name.localeCompare(b.name) : a.state === "OUT" ? -1 : 1));
  const runningOut = data.items.filter((i) => i.isActive && i.state === "OK" && i.daysLeft !== null && i.daysLeft <= 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t("admin.inv.kpi.items")} value={`${s.tracked}/${s.totalItems}`} sublabel={t("admin.inv.kpi.itemsSub")} icon={Boxes} />
        <StatCard label={t("admin.inv.kpi.out")} value={String(s.out)} icon={PackageX} tone={s.out > 0 ? "accent" : undefined} />
        <StatCard label={t("admin.inv.kpi.low")} value={String(s.low)} icon={AlertTriangle} />
        <StatCard label={t("admin.inv.kpi.expiring")} value={String(s.expiringSoon)} icon={CalendarClock} />
      </div>
      {data.canSeeCost && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label={t("admin.inv.kpi.value")} value={formatMoney(s.stockValue ?? 0, data.currency)} sublabel={t("admin.inv.kpi.valueSub")} icon={Wallet} />
          <StatCard label={t("admin.inv.kpi.cogs")} value={formatMoney(s.cogs30 ?? 0, data.currency)} sublabel={t("admin.inv.kpi.last30")} icon={TrendingDown} />
          <StatCard label={t("admin.inv.kpi.waste")} value={formatMoney(s.waste30 ?? 0, data.currency)} sublabel={t("admin.inv.kpi.last30")} icon={Trash2} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t("admin.inv.needAction")}</h2>
            {canManage && needAction.length > 0 && <Button size="sm" variant="outline" onClick={goReceive}><PackagePlus className="h-4 w-4" /> {t("admin.inv.receive")}</Button>}
          </div>
          {needAction.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.inv.allGood")}</p>}
          <ul className="divide-y divide-border">
            {needAction.map((i) => (
              <li key={i.id} className="py-2.5 flex items-center justify-between gap-3">
                <button className="text-start" onClick={() => onOpen(i)}>
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.inv.onHand")}: {qty(i.onHand)} {i.unit}
                    {i.lowStockThreshold != null ? ` · ${t("admin.inv.minLevel")}: ${qty(i.lowStockThreshold)}` : ""}
                  </p>
                </button>
                <div className="text-end">
                  <StateBadge item={i} />
                  {i.reorderSuggestion != null && <p className="text-[11px] text-muted-foreground mt-1">{t("admin.inv.suggestOrder", { n: qty(i.reorderSuggestion), unit: i.unit })}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-3">{t("admin.inv.expiringTitle")}</h2>
          {data.expiring.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.inv.noExpiring")}</p>}
          <ul className="divide-y divide-border">
            {data.expiring.map((b) => (
              <li key={b.batchId} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {qty(b.quantity)} {b.unit}{b.batchCode ? ` · ${t("admin.inv.batch")} ${b.batchCode}` : ""} · {new Date(b.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={b.days <= 0 ? "danger" : b.days <= b.alertDays ? "warning" : "neutral"}>
                  {b.days <= 0 ? t("admin.inv.expiresToday") : t("admin.inv.expiresIn", { n: b.days })}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {runningOut.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold mb-1">{t("admin.inv.runningOut")}</h2>
          <p className="text-xs text-muted-foreground mb-3">{t("admin.inv.runningOutHint")}</p>
          <div className="flex flex-wrap gap-2">
            {runningOut.map((i) => <Badge key={i.id} tone="warning">{i.name} · {t("admin.inv.daysLeft", { n: i.daysLeft! })}</Badge>)}
          </div>
        </Card>
      )}

      <button onClick={goStock} className="text-sm text-accent-ink font-medium">{t("admin.inv.seeAll")} →</button>
    </div>
  );
}

// ─── stock list ───────────────────────────────────────────────────────────

type StockFilter = "all" | "attention" | "OUT" | "LOW" | "expiring" | "UNTRACKED";

function StockTab({ data, canManage, canWaste, onAction }: { data: Overview; canManage: boolean; canWaste: boolean; onAction: (k: "waste" | "transfer" | "history", i: Item) => void }) {
  const { t } = useLocale();
  const { branches, currentBranch } = useBranch();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [category, setCategory] = useState("");
  const siblings = branches.filter((b) => b.brandId === currentBranch?.brandId && b.id !== currentBranch?.id);
  const categories = [...new Set(data.items.map((i) => i.category).filter(Boolean))] as string[];

  const rows = data.items.filter((i) => {
    if (q && !`${i.name} ${i.sku ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (category && i.category !== category) return false;
    if (filter === "attention") return i.state === "OUT" || i.state === "LOW" || i.expiringSoon;
    if (filter === "OUT" || filter === "LOW" || filter === "UNTRACKED") return i.state === filter;
    if (filter === "expiring") return i.expiringSoon;
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute top-2.5 start-3 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.inv.search")} className={cn(input, "ps-9 w-56")} />
        </div>
        {categories.length > 0 && (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
            <option value="">{t("admin.inv.allCategories")}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        {(["all", "attention", "OUT", "LOW", "expiring", "UNTRACKED"] as StockFilter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-2.5 py-1.5 rounded-lg text-xs font-medium", filter === f ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>
            {t(`admin.inv.filter.${f}`)}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground border-b border-border">
            <tr>
              <th className="text-start p-3">{t("admin.inv.col.item")}</th>
              <th className="text-end p-3">{t("admin.inv.onHand")}</th>
              <th className="text-start p-3">{t("admin.inv.col.status")}</th>
              <th className="text-start p-3 hidden md:table-cell">{t("admin.inv.col.nextExpiry")}</th>
              <th className="text-end p-3 hidden md:table-cell">{t("admin.inv.col.usage")}</th>
              {data.canSeeCost && <th className="text-end p-3 hidden lg:table-cell">{t("admin.inv.col.value")}</th>}
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((i) => (
              <tr key={i.id} className={cn(!i.isActive && "opacity-50")}>
                <td className="p-3">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{[i.category, i.sku, i.costingMethod].filter(Boolean).join(" · ")}</p>
                </td>
                <td className={cn("p-3 text-end font-semibold tabular-nums", i.onHand < 0 && "text-danger")}>{qty(i.onHand)} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span></td>
                <td className="p-3"><StateBadge item={i} /></td>
                <td className="p-3 hidden md:table-cell text-xs">{i.nextExpiry ? new Date(i.nextExpiry).toLocaleDateString() : "—"}</td>
                <td className="p-3 hidden md:table-cell text-end text-xs text-muted-foreground">
                  {i.avgDailyUsage > 0 ? `${qty(i.avgDailyUsage)}/${t("admin.inv.day")}` : "—"}
                  {i.daysLeft != null && <div>{t("admin.inv.daysLeft", { n: i.daysLeft })}</div>}
                </td>
                {data.canSeeCost && <td className="p-3 hidden lg:table-cell text-end text-xs">{formatMoney(i.stockValue ?? 0, data.currency)}</td>}
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" title={t("admin.inv.history")} onClick={() => onAction("history", i)}><History className="h-3.5 w-3.5" /></Button>
                    {canWaste && i.state !== "UNTRACKED" && <Button size="sm" variant="ghost" title={t("admin.inv.waste")} onClick={() => onAction("waste", i)}><Trash2 className="h-3.5 w-3.5 text-danger" /></Button>}
                    {canManage && siblings.length > 0 && i.onHand > 0 && <Button size="sm" variant="ghost" title={t("admin.inv.transfer")} onClick={() => onAction("transfer", i)}><ArrowLeftRight className="h-3.5 w-3.5" /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-sm text-muted-foreground">{t("admin.inv.empty")}</p>}
      </Card>
    </>
  );
}

// ─── receive ──────────────────────────────────────────────────────────────

interface ReceiveLine { ingredientId: string; quantity: string; unitCost: string; expiresAt: string; batchCode: string }

function ReceiveTab({ items, branchId, currency, onDone }: { items: Item[]; branchId: string; currency: string; onDone: () => void }) {
  const { t } = useLocale();
  const active = items.filter((i) => i.isActive);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const blank = (): ReceiveLine => ({ ingredientId: "", quantity: "", unitCost: "", expiresAt: "", batchCode: "" });
  const [lines, setLines] = useState<ReceiveLine[]>([blank()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (i: number, patch: Partial<ReceiveLine>) => setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const pick = (i: number, ingredientId: string) => {
    const item = items.find((x) => x.id === ingredientId);
    const expiry = item?.trackExpiry && item.shelfLifeDays ? new Date(Date.now() + item.shelfLifeDays * 86_400_000).toISOString().slice(0, 10) : "";
    update(i, { ingredientId, unitCost: item?.lastUnitCost != null ? String(item.lastUnitCost) : "", expiresAt: expiry });
  };
  const total = lines.reduce((s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitCost) || 0), 0);

  async function submit() {
    const ready = lines.filter((l) => l.ingredientId && parseFloat(l.quantity) > 0);
    if (ready.length === 0) return setError(t("admin.inv.err.noLines"));
    for (const l of ready) {
      const item = items.find((x) => x.id === l.ingredientId);
      if (item?.trackExpiry && !l.expiresAt) return setError(t("admin.inv.err.expiryRequired", { name: item.name }));
      if (l.expiresAt && l.expiresAt < today()) return setError(t("admin.inv.err.expiredOnArrival", { name: item?.name ?? "" }));
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          supplier: supplier.trim() || undefined,
          notes: notes.trim() || undefined,
          lines: ready.map((l) => ({
            ingredientId: l.ingredientId,
            quantity: parseFloat(l.quantity),
            unitCost: parseFloat(l.unitCost) || 0,
            expiresAt: l.expiresAt ? new Date(`${l.expiresAt}T23:59:00`).toISOString() : null,
            batchCode: l.batchCode.trim() || null,
          })),
        }),
      });
      if (!res.ok) return setError(t("admin.inv.err.generic"));
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="font-semibold">{t("admin.inv.receiveTitle")}</h2>
        <p className="text-xs text-muted-foreground">{t("admin.inv.receiveHint")}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder={t("admin.inv.supplier")} className={input} />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("admin.inv.notes")} className={input} />
      </div>
      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.2fr_1fr_auto] gap-2 text-[11px] text-muted-foreground px-1">
          <span>{t("admin.inv.col.item")}</span><span>{t("admin.inv.qty")}</span><span>{t("admin.inv.unitCostCur", { currency })}</span><span>{t("admin.inv.expiry")}</span><span>{t("admin.inv.batch")}</span><span />
        </div>
        {lines.map((l, i) => {
          const item = items.find((x) => x.id === l.ingredientId);
          return (
            <div key={i} className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1.2fr_1fr_auto] gap-2 items-center">
              <select value={l.ingredientId} onChange={(e) => pick(i, e.target.value)} className={cn(input, "col-span-2 md:col-span-1")}>
                <option value="">{t("admin.inv.ingredient")}</option>
                {active.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.unit})</option>)}
              </select>
              <input type="number" min={0} step="any" value={l.quantity} onChange={(e) => update(i, { quantity: e.target.value })} placeholder={item ? `${t("admin.inv.qty")} (${item.unit})` : t("admin.inv.qty")} className={input} />
              <input type="number" min={0} step="any" value={l.unitCost} onChange={(e) => update(i, { unitCost: e.target.value })} placeholder={t("admin.inv.costPerUnit")} className={input} />
              <input type="date" value={l.expiresAt} min={today()} onChange={(e) => update(i, { expiresAt: e.target.value })} className={cn(input, item?.trackExpiry && !l.expiresAt && "border-warning")} />
              <input value={l.batchCode} onChange={(e) => update(i, { batchCode: e.target.value })} placeholder={t("admin.inv.batchCode")} className={input} />
              <button onClick={() => setLines((p) => p.length > 1 ? p.filter((_, idx) => idx !== i) : [blank()])} className="text-danger justify-self-end p-2"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
        <button onClick={() => setLines((p) => [...p, blank()])} className="text-xs text-accent-ink font-medium">{t("admin.inv.addLine")}</button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">{t("admin.inv.receiptTotal")}: <b className="text-foreground">{formatMoney(total, currency)}</b></span>
        <div className="flex items-center gap-3">
          {error && <p className="text-danger text-xs">{error}</p>}
          <Button onClick={submit} loading={saving}><PackagePlus className="h-4 w-4" /> {t("admin.inv.saveReceipt")}</Button>
        </div>
      </div>
    </Card>
  );
}

// ─── stock count ─────────────────────────────────────────────────────────

function CountTab({ items, branchId, onDone }: { items: Item[]; branchId: string; onDone: () => void }) {
  const { t } = useLocale();
  const active = items.filter((i) => i.isActive);
  const [counted, setCounted] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changed = active.filter((i) => counted[i.id] !== undefined && counted[i.id] !== "" && parseFloat(counted[i.id]) !== i.onHand);

  async function submit() {
    if (changed.length === 0) return setError(t("admin.inv.err.noChanges"));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, reason: reason.trim() || undefined, counts: changed.map((i) => ({ ingredientId: i.id, counted: Math.max(0, parseFloat(counted[i.id])) })) }),
      });
      if (!res.ok) return setError(t("admin.inv.err.generic"));
      const j = await res.json();
      setResult(t("admin.inv.countSaved", { n: j.adjustments.length }));
      setCounted({});
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h2 className="font-semibold">{t("admin.inv.countTitle")}</h2>
        <p className="text-xs text-muted-foreground">{t("admin.inv.countHint")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="h-4 w-4 absolute top-2.5 start-3 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.inv.search")} className={cn(input, "ps-9 w-56")} />
        </div>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("admin.inv.countReason")} className={cn(input, "flex-1 min-w-[200px]")} />
      </div>
      <div className="divide-y divide-border">
        {active.filter((i) => !q || i.name.toLowerCase().includes(q.toLowerCase())).map((i) => {
          const v = counted[i.id];
          const diff = v !== undefined && v !== "" ? parseFloat(v) - i.onHand : null;
          return (
            <div key={i.id} className="py-2 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
              <div>
                <p className="text-sm font-medium">{i.name}</p>
                <p className="text-xs text-muted-foreground">{t("admin.inv.systemQty")}: {qty(i.onHand)} {i.unit}</p>
              </div>
              <input type="number" min={0} step="any" value={v ?? ""} onChange={(e) => setCounted((p) => ({ ...p, [i.id]: e.target.value }))} placeholder={t("admin.inv.counted")} className={cn(input, "w-28 text-end")} />
              <span className={cn("w-20 text-end text-xs font-semibold tabular-nums", diff == null ? "text-muted-foreground" : diff < 0 ? "text-danger" : diff > 0 ? "text-success" : "")}>
                {diff == null ? "" : `${diff > 0 ? "+" : ""}${qty(diff)}`}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        {result && <p className="text-success text-xs">{result}</p>}
        {error && <p className="text-danger text-xs">{error}</p>}
        <Button onClick={submit} loading={saving}><ClipboardCheck className="h-4 w-4" /> {t("admin.inv.saveCount", { n: changed.length })}</Button>
      </div>
    </Card>
  );
}

// ─── movements ───────────────────────────────────────────────────────────

const MOVEMENT_TYPES = ["RECEIVE", "ISSUE", "SALE", "SALE_REVERSAL", "WASTE", "EXPIRED", "ADJUSTMENT", "TRANSFER_IN", "TRANSFER_OUT"];

function MovementsTab({ branchId, items, canSeeCost, currency }: { branchId: string; items: Item[]; canSeeCost: boolean; currency: string }) {
  const { t } = useLocale();
  const [type, setType] = useState("");
  const [ingredientId, setIngredientId] = useState("");
  const [days, setDays] = useState("30");
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const p = new URLSearchParams({ branchId, days });
    if (type) p.set("type", type);
    if (ingredientId) p.set("ingredientId", ingredientId);
    fetch(`/api/inventory/movements?${p}`).then((r) => (r.ok ? r.json() : { movements: [] })).then((j) => setRows(j.movements));
  }, [branchId, type, ingredientId, days]);

  return (
    <>
      <StoreBook branchId={branchId} />
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
          <option value="">{t("admin.inv.allTypes")}</option>
          {MOVEMENT_TYPES.map((m) => <option key={m} value={m}>{t(`admin.inv.mv.${m}`)}</option>)}
        </select>
        <select value={ingredientId} onChange={(e) => setIngredientId(e.target.value)} className={input}>
          <option value="">{t("admin.inv.allItems")}</option>
          {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <select value={days} onChange={(e) => setDays(e.target.value)} className={input}>
          {["1", "7", "30", "90"].map((d) => <option key={d} value={d}>{t("admin.inv.lastDays", { n: d })}</option>)}
        </select>
      </div>
      <MovementList rows={rows} canSeeCost={canSeeCost} currency={currency} showItem />
    </>
  );
}

function MovementList({ rows, canSeeCost, currency, showItem }: { rows: any[]; canSeeCost: boolean; currency: string; showItem?: boolean }) {
  const { t } = useLocale();
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{t("admin.inv.noMovements")}</p>;
  return (
    <Card className="divide-y divide-border">
      {rows.map((m) => (
        <div key={m.id} className="p-3 flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="font-medium">
              <Badge tone={m.quantity >= 0 ? "success" : m.type === "WASTE" || m.type === "EXPIRED" ? "danger" : "neutral"} className="me-2">{t(`admin.inv.mv.${m.type}`)}</Badge>
              {showItem && m.ingredient?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {new Date(m.createdAt).toLocaleString()}
              {m.reason ? ` · ${m.reason}` : ""}
              {m.user ? ` · ${m.user}` : ""}
              {m.batchCode ? ` · ${t("admin.inv.batch")} ${m.batchCode}` : ""}
            </p>
          </div>
          <div className="text-end shrink-0">
            <p className={cn("font-semibold tabular-nums", m.quantity < 0 ? "text-danger" : "text-success")} dir="ltr">
              {m.quantity > 0 ? "+" : ""}{qty(m.quantity)} {m.ingredient?.unit}
            </p>
            {canSeeCost && m.value != null && <p className="text-[11px] text-muted-foreground">{formatMoney(Math.abs(m.value), currency)}</p>}
          </div>
        </div>
      ))}
    </Card>
  );
}

/** The store book: per item, what was there, what came in, what went out and why. */
function StoreBook({ branchId }: { branchId: string }) {
  const { t } = useLocale();
  const [from, setFrom] = useState(`${today().slice(0, 7)}-01`);
  const [to, setTo] = useState(today());
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/inventory/summary?branchId=${branchId}&from=${from}&to=${to}`).then((r) => (r.ok ? r.json() : { rows: [] })).then((j) => setRows(j.rows));
  }, [branchId, from, to]);
  return (
    <Card className="p-4 mb-6 overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="font-semibold">{t("admin.inv.bookTitle")}</h2>
        <div className="flex items-center gap-2 text-xs">
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={input} />
          <span>→</span>
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={input} />
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground border-b border-border">
          <tr>
            <th className="text-start p-2">{t("admin.inv.col.item")}</th>
            <th className="text-end p-2">{t("admin.inv.book.opening")}</th>
            <th className="text-end p-2 text-success">{t("admin.inv.book.in")}</th>
            <th className="text-end p-2 text-danger">{t("admin.inv.book.out")}</th>
            <th className="text-end p-2 hidden md:table-cell">{t("admin.inv.book.sold")}</th>
            <th className="text-end p-2 hidden md:table-cell">{t("admin.inv.book.issued")}</th>
            <th className="text-end p-2 hidden md:table-cell">{t("admin.inv.book.wasted")}</th>
            <th className="text-end p-2">{t("admin.inv.book.closing")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border tabular-nums">
          {rows.map((r) => (
            <tr key={r.ingredientId}>
              <td className="p-2">{r.name} <span className="text-xs text-muted-foreground">({r.unit})</span></td>
              <td className="p-2 text-end">{qty(r.opening)}</td>
              <td className="p-2 text-end text-success">{r.in ? `+${qty(r.in)}` : "—"}</td>
              <td className="p-2 text-end text-danger">{r.out ? `−${qty(r.out)}` : "—"}</td>
              <td className="p-2 text-end hidden md:table-cell">{r.sold ? qty(r.sold) : "—"}</td>
              <td className="p-2 text-end hidden md:table-cell">{r.issued ? qty(r.issued) : "—"}</td>
              <td className="p-2 text-end hidden md:table-cell">{r.wasted ? qty(r.wasted) : "—"}</td>
              <td className={cn("p-2 text-end font-semibold", r.closing <= 0 && "text-danger")}>{qty(r.closing)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="text-sm text-muted-foreground p-2">{t("admin.inv.noMovements")}</p>}
    </Card>
  );
}

// ─── issue out ────────────────────────────────────────────────────────────

const ISSUE_REASONS = ["kitchen", "bar", "staffMeal", "cleaning", "other"];

function IssueTab({ items, branchId, onDone }: { items: Item[]; branchId: string; onDone: () => void }) {
  const { t } = useLocale();
  const active = items.filter((i) => i.isActive && i.state !== "UNTRACKED");
  const [lines, setLines] = useState<{ ingredientId: string; quantity: string }[]>([{ ingredientId: "", quantity: "" }]);
  const [reason, setReason] = useState("kitchen");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const update = (i: number, patch: Partial<{ ingredientId: string; quantity: string }>) => setLines((p) => p.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  async function submit() {
    const ready = lines.filter((l) => l.ingredientId && parseFloat(l.quantity) > 0);
    if (ready.length === 0) return setError(t("admin.inv.err.noLines"));
    for (const l of ready) {
      const item = items.find((x) => x.id === l.ingredientId)!;
      if (parseFloat(l.quantity) > item.onHand) return setError(t("admin.inv.err.insufficientItem", { name: item.name, n: qty(item.onHand), unit: item.unit }));
    }
    setSaving(true);
    setError(null);
    try {
      const label = t(`admin.inv.issueReason.${reason}`);
      const res = await fetch("/api/inventory/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, reason: note.trim() ? `${label} — ${note.trim()}` : label, lines: ready.map((l) => ({ ingredientId: l.ingredientId, quantity: parseFloat(l.quantity) })) }),
      });
      if (!res.ok) return setError(t("admin.inv.err.generic"));
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 space-y-4 max-w-3xl">
      <div>
        <h2 className="font-semibold">{t("admin.inv.issueTitle")}</h2>
        <p className="text-xs text-muted-foreground">{t("admin.inv.issueHint")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {ISSUE_REASONS.map((r) => (
          <button key={r} onClick={() => setReason(r)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium", reason === r ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>{t(`admin.inv.issueReason.${r}`)}</button>
        ))}
      </div>
      {lines.map((l, i) => {
        const item = items.find((x) => x.id === l.ingredientId);
        return (
          <div key={i} className="grid grid-cols-[2fr_1fr_auto] gap-2 items-center">
            <select value={l.ingredientId} onChange={(e) => update(i, { ingredientId: e.target.value })} className={input}>
              <option value="">{t("admin.inv.ingredient")}</option>
              {active.map((x) => <option key={x.id} value={x.id}>{x.name} — {qty(x.onHand)} {x.unit}</option>)}
            </select>
            <input type="number" min={0} step="any" value={l.quantity} onChange={(e) => update(i, { quantity: e.target.value })} placeholder={item ? `${t("admin.inv.qty")} (${item.unit})` : t("admin.inv.qty")} className={input} />
            <button onClick={() => setLines((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : [{ ingredientId: "", quantity: "" }]))} className="text-danger p-2"><X className="h-4 w-4" /></button>
          </div>
        );
      })}
      <button onClick={() => setLines((p) => [...p, { ingredientId: "", quantity: "" }])} className="text-xs text-accent-ink font-medium">{t("admin.inv.addLine")}</button>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("admin.inv.notes")} className={cn(input, "w-full")} />
      <div className="flex items-center justify-end gap-3">
        {error && <p className="text-danger text-xs">{error}</p>}
        <Button onClick={submit} loading={saving}><PackageMinus className="h-4 w-4" /> {t("admin.inv.saveIssue")}</Button>
      </div>
    </Card>
  );
}

// ─── drawer actions ──────────────────────────────────────────────────────

function Drawer({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full overflow-y-auto bg-surface border-s border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const WASTE_REASONS = ["spoiled", "dropped", "overcooked", "returned", "other"];

function WasteForm({ item, branchId, onDone }: { item: Item; branchId: string; onDone: () => void }) {
  const { t } = useLocale();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("spoiled");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const q = parseFloat(quantity);
    if (!(q > 0)) return setError(t("admin.inv.err.qty"));
    setSaving(true);
    try {
      const label = t(`admin.inv.wasteReason.${reason}`);
      const res = await fetch("/api/inventory/waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, ingredientId: item.id, quantity: q, reason: note.trim() ? `${label} — ${note.trim()}` : label }),
      });
      if (!res.ok) return setError(t("admin.inv.err.generic"));
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("admin.inv.wasteHint", { n: qty(item.onHand), unit: item.unit })}</p>
      <input type="number" min={0} step="any" autoFocus value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={`${t("admin.inv.qty")} (${item.unit})`} className={cn(input, "w-full")} />
      <div className="flex flex-wrap gap-2">
        {WASTE_REASONS.map((r) => (
          <button key={r} onClick={() => setReason(r)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium", reason === r ? "bg-danger/15 text-danger" : "bg-muted text-muted-foreground")}>{t(`admin.inv.wasteReason.${r}`)}</button>
        ))}
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("admin.inv.notes")} className={cn(input, "w-full")} />
      {error && <p className="text-danger text-xs">{error}</p>}
      <Button variant="danger" onClick={submit} loading={saving}><Trash2 className="h-4 w-4" /> {t("admin.inv.recordWaste")}</Button>
    </div>
  );
}

function TransferForm({ item, branchId, onDone }: { item: Item; branchId: string; onDone: () => void }) {
  const { t } = useLocale();
  const { branches, currentBranch } = useBranch();
  const targets = branches.filter((b) => b.brandId === currentBranch?.brandId && b.id !== branchId);
  const [to, setTo] = useState(targets[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    const q = parseFloat(quantity);
    if (!(q > 0)) return setError(t("admin.inv.err.qty"));
    if (q > item.onHand) return setError(t("admin.inv.err.insufficient", { n: qty(item.onHand), unit: item.unit }));
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromBranchId: branchId, toBranchId: to, ingredientId: item.id, quantity: q, notes: notes.trim() || undefined }),
      });
      if (res.status === 409) return setError(t("admin.inv.err.insufficient", { n: qty(item.onHand), unit: item.unit }));
      if (!res.ok) return setError(t("admin.inv.err.generic"));
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("admin.inv.transferHint")}</p>
      <select value={to} onChange={(e) => setTo(e.target.value)} className={cn(input, "w-full")}>
        {targets.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <input type="number" min={0} step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder={`${t("admin.inv.qty")} (${item.unit}) — ${t("admin.inv.available")} ${qty(item.onHand)}`} className={cn(input, "w-full")} />
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("admin.inv.notes")} className={cn(input, "w-full")} />
      {error && <p className="text-danger text-xs">{error}</p>}
      <Button onClick={submit} loading={saving}><ArrowLeftRight className="h-4 w-4" /> {t("admin.inv.transfer")}</Button>
    </div>
  );
}

function HistoryPanel({ item, branchId, canSeeCost, currency }: { item: Item; branchId: string; canSeeCost: boolean; currency?: string }) {
  const { t } = useLocale();
  const [batches, setBatches] = useState<any[]>([]);
  const [moves, setMoves] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/inventory/batches?branchId=${branchId}&ingredientId=${item.id}`).then((r) => r.json()).then((j) => setBatches(j.batches ?? []));
    fetch(`/api/inventory/movements?branchId=${branchId}&ingredientId=${item.id}&days=90&limit=100`).then((r) => r.json()).then((j) => setMoves(j.movements ?? []));
  }, [branchId, item.id]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-2xl font-semibold tabular-nums">{qty(item.onHand)} {item.unit}</span>
        <StateBadge item={item} />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">{t("admin.inv.batchesTitle", { method: item.costingMethod })}</h3>
        {batches.length === 0 && <p className="text-xs text-muted-foreground">{t("admin.inv.noBatches")}</p>}
        <ol className="space-y-2">
          {batches.map((b, idx) => {
            const expired = b.expiresAt && new Date(b.expiresAt) < new Date();
            return (
              <li key={b.id} className="rounded-xl border border-border p-3 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">#{idx + 1}{b.batchCode ? ` · ${b.batchCode}` : ""}{idx === 0 ? ` · ${t("admin.inv.usedNext")}` : ""}</span>
                  <span className="font-semibold tabular-nums">{qty(b.quantityRemaining)} / {qty(b.quantityReceived)} {item.unit}</span>
                </div>
                <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                  <span>{t("admin.inv.received")}: {new Date(b.receivedAt).toLocaleDateString()}</span>
                  {b.expiresAt && <span className={cn(expired && "text-danger")}>{t("admin.inv.expiry")}: {new Date(b.expiresAt).toLocaleDateString()}</span>}
                  {b.supplier && <span>{b.supplier}</span>}
                  {canSeeCost && b.unitCost != null && <span>{formatMoney(b.unitCost, currency)}/{item.unit}</span>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">{t("admin.inv.movementsTitle")}</h3>
        <MovementList rows={moves} canSeeCost={canSeeCost} currency={currency ?? "IQD"} />
      </div>
    </div>
  );
}

// ─── item setup ──────────────────────────────────────────────────────────

function ItemsTab({ items, brandId, branchId, currency, onChange }: { items: Item[]; brandId: string; branchId: string; currency: string; onChange: () => void }) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  return (
    <>
      <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground max-w-2xl">{t("admin.inv.itemsHint")}</p>
        {editing !== "new" && <Button size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> {t("admin.inv.newIngredient")}</Button>}
      </div>
      {editing === "new" && <ItemForm brandId={brandId} branchId={branchId} currency={currency} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChange(); }} />}
      <div className="space-y-2">
        {items.map((i) => (
          <Card key={i.id} className={cn("p-3", !i.isActive && "opacity-60")}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{i.name} <span className="text-xs text-muted-foreground">({i.unit})</span></p>
                  <p className="text-xs text-muted-foreground">
                    {[i.category, i.sku, i.costingMethod, i.lowStockThreshold != null ? `${t("admin.inv.minLevel")} ${qty(i.lowStockThreshold)}` : null, i.trackExpiry ? t("admin.inv.tracksExpiry") : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setEditing(editing === i.id ? null : i.id)}><Settings2 className="h-3.5 w-3.5" /> {t("admin.inv.edit")}</Button>
            </div>
            {editing === i.id && <ItemForm existing={i} brandId={brandId} branchId={branchId} currency={currency} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChange(); }} />}
          </Card>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-sm">{t("admin.inv.empty")}</p>}
      </div>
    </>
  );
}

function ItemForm({ existing, brandId, branchId, currency, onClose, onSaved }: { existing?: Item; brandId: string; branchId: string; currency: string; onClose: () => void; onSaved: () => void }) {
  const { t } = useLocale();
  const [f, setF] = useState({
    name: existing?.name ?? "",
    unit: existing?.unit ?? "g",
    category: existing?.category ?? "",
    sku: existing?.sku ?? "",
    lowStockThreshold: existing?.lowStockThreshold != null ? String(existing.lowStockThreshold) : "",
    reorderQuantity: existing?.reorderQuantity != null ? String(existing.reorderQuantity) : "",
    costingMethod: existing?.costingMethod ?? "FIFO",
    trackExpiry: existing?.trackExpiry ?? false,
    shelfLifeDays: existing?.shelfLifeDays != null ? String(existing.shelfLifeDays) : "",
    expiryAlertDays: String(existing?.expiryAlertDays ?? 3),
    isActive: existing?.isActive ?? true,
    openingStock: "",
    openingUnitCost: "",
    openingExpiresAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<typeof f>) => setF((p) => ({ ...p, ...patch }));
  const num = (s: string) => (s.trim() === "" ? null : parseFloat(s));

  async function save() {
    if (!f.name.trim() || !f.unit.trim()) return setError(t("admin.inv.err.nameUnit"));
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        name: f.name.trim(),
        unit: f.unit.trim(),
        category: f.category.trim() || null,
        sku: f.sku.trim() || null,
        lowStockThreshold: num(f.lowStockThreshold),
        reorderQuantity: num(f.reorderQuantity),
        costingMethod: f.costingMethod,
        trackExpiry: f.trackExpiry,
        shelfLifeDays: f.shelfLifeDays ? parseInt(f.shelfLifeDays, 10) : null,
        expiryAlertDays: parseInt(f.expiryAlertDays, 10) || 0,
      };
      if (existing) body.isActive = f.isActive;
      else {
        body.brandId = brandId;
        if (num(f.openingStock)) {
          body.currentStock = num(f.openingStock);
          body.openingBranchId = branchId;
          body.openingUnitCost = num(f.openingUnitCost) ?? 0;
          body.openingExpiresAt = f.openingExpiresAt ? new Date(`${f.openingExpiresAt}T23:59:00`).toISOString() : null;
        }
      }
      const res = await fetch(existing ? `/api/ingredients/${existing.id}` : "/api/ingredients", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 409) {
        const j = await res.json().catch(() => ({}));
        return setError(j.error === "unit_locked" ? t("admin.inv.err.unitLocked") : t("admin.inv.err.duplicate"));
      }
      if (!res.ok) return setError(t("admin.inv.err.generic"));
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const label = "text-xs text-muted-foreground space-y-1";
  return (
    <div className={cn("space-y-3", existing ? "mt-3 pt-3 border-t border-border" : "mb-4 rounded-2xl border border-border bg-surface p-4")}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className={cn(label, "col-span-2")}>{t("admin.inv.ingredientName")}<input value={f.name} onChange={(e) => set({ name: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.inv.unit")}<input value={f.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="g, kg, ml, l, pcs" className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.inv.category")}<input value={f.category} onChange={(e) => set({ category: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.inv.sku")}<input value={f.sku} onChange={(e) => set({ sku: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.inv.minLevel")}<input type="number" min={0} step="any" value={f.lowStockThreshold} onChange={(e) => set({ lowStockThreshold: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.inv.reorderQty")}<input type="number" min={0} step="any" value={f.reorderQuantity} onChange={(e) => set({ reorderQuantity: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.inv.method")}
          <select value={f.costingMethod} onChange={(e) => set({ costingMethod: e.target.value as "FIFO" | "FEFO" })} className={cn(input, "w-full")}>
            <option value="FIFO">{t("admin.inv.fifo")}</option>
            <option value="FEFO">{t("admin.inv.fefo")}</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <label className="flex items-center gap-2 text-sm col-span-2 md:col-span-1">
          <input type="checkbox" checked={f.trackExpiry} onChange={(e) => set({ trackExpiry: e.target.checked })} /> {t("admin.inv.trackExpiry")}
        </label>
        <label className={label}>{t("admin.inv.shelfLife")}<input type="number" min={1} value={f.shelfLifeDays} onChange={(e) => set({ shelfLifeDays: e.target.value })} disabled={!f.trackExpiry} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.inv.alertDays")}<input type="number" min={0} value={f.expiryAlertDays} onChange={(e) => set({ expiryAlertDays: e.target.value })} className={cn(input, "w-full")} /></label>
        {existing && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.isActive} onChange={(e) => set({ isActive: e.target.checked })} /> {t("admin.common.active")}
          </label>
        )}
      </div>
      {!existing && (
        <div className="rounded-xl bg-muted/60 p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <p className="md:col-span-3 text-xs font-semibold">{t("admin.inv.openingStock")}</p>
          <input type="number" min={0} step="any" value={f.openingStock} onChange={(e) => set({ openingStock: e.target.value })} placeholder={t("admin.inv.qty")} className={input} />
          <input type="number" min={0} step="any" value={f.openingUnitCost} onChange={(e) => set({ openingUnitCost: e.target.value })} placeholder={t("admin.inv.unitCostCur", { currency })} className={input} />
          <input type="date" value={f.openingExpiresAt} onChange={(e) => set({ openingExpiresAt: e.target.value })} className={input} />
        </div>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose}>{t("admin.common.cancel")}</Button>
        <Button size="sm" onClick={save} loading={saving}>{existing ? t("admin.inv.save") : t("admin.common.add")}</Button>
      </div>
    </div>
  );
}

// ─── recipes ──────────────────────────────────────────────────────────────

function RecipesTab({ branchId, currency, items }: { branchId: string | undefined; currency: string | undefined; items: Item[] }) {
  const { t } = useLocale();
  const [categories, setCategories] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [lines, setLines] = useState<{ ingredientId: string; quantity: string; unit: string; costPerUnitSnapshot: string }[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/admin/products?branchId=${branchId}`).then((r) => r.json()).then((json) => setCategories(json.categories ?? []));
  }, [branchId]);

  useEffect(() => {
    setSaved(false);
    if (!productId) { setLines([]); return; }
    fetch(`/api/recipes/${productId}`).then((r) => r.json()).then((json) => {
      setLines((json.recipe?.lines ?? []).map((l: any) => ({ ingredientId: l.ingredientId, quantity: String(l.quantity), unit: l.unit, costPerUnitSnapshot: l.costPerUnitSnapshot != null ? String(l.costPerUnitSnapshot) : "" })));
    });
  }, [productId]);

  const allProducts = useMemo(() => categories.flatMap((c) => c.products.map((p: any) => ({ ...p, categoryName: c.name }))), [categories]);
  const selectedProduct = allProducts.find((p) => p.id === productId);
  const cost = lines.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.costPerUnitSnapshot) || 0), 0);
  const price = selectedProduct ? parseFloat(selectedProduct.basePrice) : 0;
  const margin = price > 0 ? ((price - cost) / price) * 100 : null;

  const updateLine = (i: number, patch: Partial<(typeof lines)[0]>) => setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  // Picking an ingredient fills in its stock unit and the cost of its latest delivery,
  // so the food cost below is right without typing prices twice. A line may still be
  // written in another unit (g against stock in kg) — stock deduction converts it.
  const pickIngredient = (i: number, ingredientId: string) => {
    const item = items.find((x) => x.id === ingredientId);
    updateLine(i, {
      ingredientId,
      unit: item?.unit ?? "g",
      costPerUnitSnapshot: item?.lastUnitCost != null ? String(item.lastUnitCost) : "",
    });
  };

  async function save() {
    await fetch(`/api/recipes/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: lines
          .filter((l) => l.ingredientId && l.quantity)
          .map((l) => ({ ingredientId: l.ingredientId, quantity: parseFloat(l.quantity), unit: l.unit, costPerUnitSnapshot: l.costPerUnitSnapshot ? parseFloat(l.costPerUnitSnapshot) : undefined })),
      }),
    });
    setSaved(true);
  }

  return (
    <div className="max-w-4xl">
      <p className="text-sm text-muted-foreground mb-3">{t("admin.inv.recipesHint")}</p>
      <select value={productId} onChange={(e) => setProductId(e.target.value)} className={cn(input, "w-full mb-4")}>
        <option value="">{t("admin.inv.selectProduct")}</option>
        {allProducts.map((p) => <option key={p.id} value={p.id}>{p.categoryName} · {p.name}</option>)}
      </select>

      {productId && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-4 w-4 text-accent-ink" />
            <p className="font-semibold text-sm">{selectedProduct?.name}</p>
          </div>
          <div className="space-y-2 mb-3">
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_60px_90px_auto] gap-2 items-center">
                <select value={l.ingredientId} onChange={(e) => pickIngredient(i, e.target.value)} className="rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs">
                  <option value="">{t("admin.inv.ingredient")}</option>
                  {items.map((ing) => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                </select>
                <input type="number" value={l.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} placeholder={t("admin.inv.qty")} className="rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
                <input value={l.unit} onChange={(e) => updateLine(i, { unit: e.target.value })} placeholder={t("admin.inv.unit")} className="rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
                <input type="number" value={l.costPerUnitSnapshot} onChange={(e) => updateLine(i, { costPerUnitSnapshot: e.target.value })} placeholder={t("admin.inv.costPerUnit")} className="rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
                <button onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs text-danger">{t("admin.inv.remove")}</button>
              </div>
            ))}
            <button onClick={() => setLines((prev) => [...prev, { ingredientId: "", quantity: "", unit: "g", costPerUnitSnapshot: "" }])} className="text-xs text-accent-ink font-medium">{t("admin.inv.addLine")}</button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
            <span className="text-muted-foreground">{t("admin.inv.costLine", { cost: formatMoney(cost, currency), price: formatMoney(price, currency) })}</span>
            {margin != null && <Badge tone={margin > 60 ? "success" : margin > 30 ? "warning" : "danger"}>{t("admin.inv.margin", { n: margin.toFixed(0) })}</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Button size="sm" onClick={save}>{t("admin.inv.saveRecipe")}</Button>
            {saved && <span className="text-xs text-success">{t("admin.inv.recipeSaved")}</span>}
          </div>
        </Card>
      )}
    </div>
  );
}
