"use client";

import { useEffect, useState } from "react";
import { Plus, Package, BarChart3, Copy, Pause, Play, Archive, Pencil, X, Trash2 } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  PAUSED: "warning",
  DRAFT: "neutral",
  ARCHIVED: "danger",
};

export default function CombosPage() {
  const { currentBranch, branches } = useBranch();
  const [combos, setCombos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [analyticsFor, setAnalyticsFor] = useState<string | null>(null);
  const [editFor, setEditFor] = useState<string | null>(null);
  const { t } = useLocale();

  async function refresh() {
    if (!currentBranch) return;
    const params = new URLSearchParams({ brandId: currentBranch.brandId });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const [comboRes, productsRes] = await Promise.all([
      fetch(`/api/combos?${params}`),
      fetch(`/api/admin/products?branchId=${currentBranch.id}`),
    ]);
    if (comboRes.ok) setCombos((await comboRes.json()).combos);
    if (productsRes.ok) setCategories((await productsRes.json()).categories);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch?.brandId, statusFilter, search]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/combos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    refresh();
  }
  async function duplicate(id: string) {
    await fetch(`/api/combos/${id}/duplicate`, { method: "POST" });
    refresh();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("admin.combo.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("admin.combo.intro")}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> {t("admin.combo.new")}
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.promo.search")}
          className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm w-64"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="">{t("admin.promo.allStatuses")}</option>
          <option value="ACTIVE">{enumLabel(t, "ACTIVE")}</option>
          <option value="PAUSED">{enumLabel(t, "PAUSED")}</option>
          <option value="DRAFT">{enumLabel(t, "DRAFT")}</option>
          <option value="ARCHIVED">{enumLabel(t, "ARCHIVED")}</option>
        </select>
      </div>

      {showForm && currentBranch && (
        <NewComboForm
          brandId={currentBranch.brandId}
          branches={branches}
          categories={categories}
          currency={currentBranch.currency}
          onClose={() => setShowForm(false)}
          onDone={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      <div className="space-y-2">
        {combos.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Package className="h-4 w-4 text-accent-ink shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(c.fixedPrice, currentBranch?.currency)} · {c.slots.map((s: any) => s.label).join(" + ")}
                    {c.priority ? t("admin.promo.priority", { n: c.priority }) : ""}
                    {c.maxUsesTotal ? t("admin.coupons.usedOf", { used: c.usesCount, max: c.maxUsesTotal }) : t("admin.coupons.used", { used: c.usesCount })}
                    {c.maxUsesPerCustomer ? t("admin.promo.limitPerCustomer", { n: c.maxUsesPerCustomer }) : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge tone={STATUS_TONE[c.status] ?? "neutral"}>{enumLabel(t, c.status)}</Badge>
                <Button size="sm" variant="ghost" title={t("admin.promo.analytics")} onClick={() => setAnalyticsFor(analyticsFor === c.id ? null : c.id)}>
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" title={t("admin.common.edit")} onClick={() => setEditFor(editFor === c.id ? null : c.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" title={t("admin.promo.duplicate")} onClick={() => duplicate(c.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
                {c.status === "ACTIVE" ? (
                  <Button size="sm" variant="ghost" title={t("admin.promo.pause")} onClick={() => setStatus(c.id, "PAUSED")}>
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : c.status !== "ARCHIVED" ? (
                  <Button size="sm" variant="ghost" title={t("admin.qr.activate")} onClick={() => setStatus(c.id, "ACTIVE")}>
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}
                {c.status !== "ARCHIVED" && (
                  <Button size="sm" variant="ghost" title={t("admin.promo.archive")} onClick={() => setStatus(c.id, "ARCHIVED")}>
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {analyticsFor === c.id && <ComboAnalytics id={c.id} currency={currentBranch?.currency} />}
            {editFor === c.id && (
              <EditComboPanel
                combo={c}
                onClose={() => setEditFor(null)}
                onDone={() => {
                  setEditFor(null);
                  refresh();
                }}
              />
            )}
          </Card>
        ))}
        {combos.length === 0 && <p className="text-muted-foreground">{t("admin.combo.empty")}</p>}
      </div>
    </div>
  );
}

function ComboAnalytics({ id, currency }: { id: string; currency?: string }) {
  const [data, setData] = useState<any>(null);
  const { t } = useLocale();
  useEffect(() => {
    fetch(`/api/combos/${id}/analytics`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <p className="text-xs text-muted-foreground mt-3">{t("admin.promo.loadingAnalytics")}</p>;
  if (data.error) return <p className="text-xs text-danger mt-3">{data.error}</p>;

  return (
    <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
      <Stat label={t("admin.promo.ordersUsing")} value={data.ordersUsingOffer} />
      <Stat label={t("admin.combo.setsSold")} value={data.totalSetsSold} />
      <Stat label={t("admin.combo.savings")} value={formatMoney(data.totalSavings, currency)} />
      <Stat label={t("admin.promo.revenue")} value={formatMoney(data.revenueGenerated, currency)} />
      <Stat label={t("admin.promo.aov")} value={formatMoney(Math.round(data.avgOrderValue), currency)} />
      <Stat label={t("admin.promo.remaining")} value={data.usageRemaining ?? t("admin.promo.unlimited")} />
      {data.branchPerformance.map((b: any) => (
        <Stat key={b.branchId} label={b.branchName} value={t("admin.reports.ordersAmount", { n: b.orders, amount: formatMoney(b.revenue, currency) })} />
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function EditComboPanel({ combo, onClose, onDone }: { combo: any; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(combo.name);
  const [fixedPrice, setFixedPrice] = useState(String(combo.fixedPrice));
  const [priority, setPriority] = useState(String(combo.priority ?? 0));
  const [maxUsesTotal, setMaxUsesTotal] = useState(combo.maxUsesTotal ? String(combo.maxUsesTotal) : "");
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState(combo.maxUsesPerCustomer ? String(combo.maxUsesPerCustomer) : "");
  const [endsAt, setEndsAt] = useState(combo.endsAt ? combo.endsAt.slice(0, 10) : "");
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const res = await fetch(`/api/combos/${combo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        fixedPrice: parseFloat(fixedPrice),
        priority: parseInt(priority || "0", 10),
        maxUsesTotal: maxUsesTotal ? parseInt(maxUsesTotal, 10) : null,
        maxUsesPerCustomer: maxUsesPerCustomer ? parseInt(maxUsesPerCustomer, 10) : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      }),
    });
    const json = await res.json();
    if (!res.ok) return setError(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
    onDone();
  }

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">
          {t("admin.combo.editHint")}
        </p>
        <button onClick={onClose}>
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.common.name")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} type="number" placeholder={t("admin.combo.fixedPrice")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={priority} onChange={(e) => setPriority(e.target.value)} type="number" placeholder={t("admin.promo.priorityPh")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={maxUsesTotal} onChange={(e) => setMaxUsesTotal(e.target.value)} type="number" placeholder={t("admin.promo.maxTotalBlank")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={maxUsesPerCustomer} onChange={(e) => setMaxUsesPerCustomer(e.target.value)} type="number" placeholder={t("admin.promo.maxPerCustomer")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="date" placeholder={t("admin.promo.ends")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-danger text-xs">{error}</p>}
      <Button size="sm" onClick={save}>
        {t("admin.common.save")}
      </Button>
    </div>
  );
}

interface SlotDraft {
  label: string;
  productIds: string[];
  categoryIds: string[];
  quantity: number;
}

function NewComboForm({
  brandId,
  branches,
  categories,
  currency,
  onClose,
  onDone,
}: {
  brandId: string;
  branches: { id: string; name: string }[];
  categories: any[];
  currency: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fixedPrice, setFixedPrice] = useState("");
  const [priority, setPriority] = useState("0");
  const [allowMultiplePerOrder, setAllowMultiplePerOrder] = useState(true);
  const [restrictBranchId, setRestrictBranchId] = useState("");
  const [maxUsesTotal, setMaxUsesTotal] = useState("");
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const { t } = useLocale();
  const [slots, setSlots] = useState<SlotDraft[]>([
    { label: "", productIds: [], categoryIds: [], quantity: 1 },
    { label: "", productIds: [], categoryIds: [], quantity: 1 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const allProducts = categories.flatMap((c) => c.products.map((p: any) => ({ ...p, categoryName: c.name })));

  function updateSlot(i: number, patch: Partial<SlotDraft>) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function toggleSlotProduct(i: number, id: string) {
    updateSlot(i, { productIds: slots[i].productIds.includes(id) ? slots[i].productIds.filter((p) => p !== id) : [...slots[i].productIds, id] });
  }
  function toggleSlotCategory(i: number, id: string) {
    updateSlot(i, { categoryIds: slots[i].categoryIds.includes(id) ? slots[i].categoryIds.filter((c) => c !== id) : [...slots[i].categoryIds, id] });
  }
  function addSlot() {
    setSlots((prev) => [...prev, { label: "", productIds: [], categoryIds: [], quantity: 1 }]);
  }
  function removeSlot(i: number) {
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  }

  const canSubmit =
    name.trim() &&
    !!fixedPrice &&
    slots.length >= 2 &&
    slots.every((s) => s.label.trim() && (s.productIds.length > 0 || s.categoryIds.length > 0));

  async function submit() {
    setError(null);
    const res = await fetch("/api/combos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        name,
        description: description || undefined,
        fixedPrice: parseFloat(fixedPrice),
        priority: parseInt(priority || "0", 10),
        allowMultiplePerOrder,
        slots: slots.map((s) => ({ label: s.label, productIds: s.productIds, categoryIds: s.categoryIds, quantity: s.quantity })),
        branchIds: restrictBranchId ? [restrictBranchId] : [],
        maxUsesTotal: maxUsesTotal ? parseInt(maxUsesTotal, 10) : undefined,
        maxUsesPerCustomer: maxUsesPerCustomer ? parseInt(maxUsesPerCustomer, 10) : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) return setError(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
    onDone();
  }

  return (
    <Card className="p-5 mb-6 space-y-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.combo.namePh")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("admin.expenses.description")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <input value={fixedPrice} onChange={(e) => setFixedPrice(e.target.value)} type="number" placeholder={t("admin.combo.fixedPriceCur", { currency })} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">
          {t("admin.combo.slotsHint")}
        </p>
        {slots.map((slot, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={slot.label}
                onChange={(e) => updateSlot(i, { label: e.target.value })}
                placeholder={t("admin.combo.slotLabel", { n: i + 1 })}
                className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
              />
              <input
                value={slot.quantity}
                onChange={(e) => updateSlot(i, { quantity: parseInt(e.target.value || "1", 10) })}
                type="number"
                min="1"
                className="w-20 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
              />
              {slots.length > 2 && (
                <button onClick={() => removeSlot(i)} className="text-muted-foreground hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="max-h-32 overflow-y-auto premium-scroll border border-border rounded-lg p-2 space-y-1">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-xs px-1 py-0.5">
                  <input type="checkbox" checked={slot.categoryIds.includes(cat.id)} onChange={() => toggleSlotCategory(i, cat.id)} />
                  <span className="font-semibold">{t("admin.coupons.wholeCategory", { name: cat.name })}</span>
                </label>
              ))}
              {allProducts.map((p: any) => (
                <label key={p.id} className="flex items-center gap-2 text-xs px-1 py-0.5">
                  <input type="checkbox" checked={slot.productIds.includes(p.id)} onChange={() => toggleSlotProduct(i, p.id)} />
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">({p.categoryName})</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addSlot}>
          <Plus className="h-3.5 w-3.5" /> {t("admin.combo.addSlot")}
        </Button>
      </div>

      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={allowMultiplePerOrder} onChange={(e) => setAllowMultiplePerOrder(e.target.checked)} />
        {t("admin.combo.allowMultiple")}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <select value={restrictBranchId} onChange={(e) => setRestrictBranchId(e.target.value)} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="">{t("admin.promo.allBranches")}</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {t("admin.promo.branchOnly", { name: b.name })}
            </option>
          ))}
        </select>
        <input value={priority} onChange={(e) => setPriority(e.target.value)} type="number" placeholder={t("admin.promo.priorityHint")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={maxUsesTotal} onChange={(e) => setMaxUsesTotal(e.target.value)} type="number" placeholder={t("admin.promo.maxTotal")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={maxUsesPerCustomer} onChange={(e) => setMaxUsesPerCustomer(e.target.value)} type="number" placeholder={t("admin.promo.maxPerCustomerOpt")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>
      <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="date" placeholder={t("admin.promo.ends")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />

      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={!canSubmit}>
          {t("admin.common.create")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          {t("admin.common.cancel")}
        </Button>
      </div>
    </Card>
  );
}
