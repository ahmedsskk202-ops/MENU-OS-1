"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles, BarChart3, Copy, Pause, Play, Archive, Pencil, X } from "lucide-react";
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

function benefitSummary(p: any, currency: string | undefined, t: (key: string, vars?: Record<string, string | number>) => string) {
  const value = p.benefitType === "PERCENTAGE_OFF" ? `${p.benefitValue}%` : p.benefitType === "FIXED_OFF" ? formatMoney(p.benefitValue, currency) : p.benefitType === "DISCOUNTED_ITEM" ? t("admin.promo.pctOffItem", { n: p.benefitValue }) : t("admin.promo.freeItem");
  const scope = p.eligibleProductIds?.length || p.eligibleCategoryIds?.length ? t("admin.promo.scoped", { n: p.eligibleProductIds.length + p.eligibleCategoryIds.length }) : t("admin.promo.wholeOrder");
  const bogo = p.benefitType === "FREE_ITEM" || p.benefitType === "DISCOUNTED_ITEM" ? t("admin.promo.bogo", { buy: p.eligibleMinQuantity, get: p.benefitQuantity }) : "";
  return t("admin.promo.summary", { value, scope, bogo });
}

export default function PromotionsPage() {
  const { currentBranch, branches } = useBranch();
  const [promotions, setPromotions] = useState<any[]>([]);
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
    const [promoRes, productsRes] = await Promise.all([
      fetch(`/api/promotions?${params}`),
      fetch(`/api/admin/products?branchId=${currentBranch.id}`),
    ]);
    if (promoRes.ok) setPromotions((await promoRes.json()).promotions);
    if (productsRes.ok) setCategories((await productsRes.json()).categories);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBranch?.brandId, statusFilter, search]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/promotions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    refresh();
  }
  async function duplicate(id: string) {
    await fetch(`/api/promotions/${id}/duplicate`, { method: "POST" });
    refresh();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("admin.promo.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("admin.promo.intro")}</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> {t("admin.promo.new")}
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
        <NewPromotionForm
          brandId={currentBranch.brandId}
          branches={branches}
          categories={categories}
          onClose={() => setShowForm(false)}
          onDone={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      <div className="space-y-2">
        {promotions.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Sparkles className="h-4 w-4 text-accent-ink shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {benefitSummary(p, currentBranch?.currency, t)}
                    {p.requiresCouponCode ? t("admin.promo.code", { code: p.coupons?.[0]?.code ?? "—" }) : t("admin.promo.automatic")}
                    {p.priority ? t("admin.promo.priority", { n: p.priority }) : ""}
                    {p.maxUsesTotal ? t("admin.coupons.usedOf", { used: p.usesCount, max: p.maxUsesTotal }) : t("admin.coupons.used", { used: p.usesCount })}
                    {p.maxUsesPerCustomer ? t("admin.promo.limitPerCustomer", { n: p.maxUsesPerCustomer }) : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>{enumLabel(t, p.status)}</Badge>
                <Button size="sm" variant="ghost" title={t("admin.promo.analytics")} onClick={() => setAnalyticsFor(analyticsFor === p.id ? null : p.id)}>
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" title={t("admin.common.edit")} onClick={() => setEditFor(editFor === p.id ? null : p.id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" title={t("admin.promo.duplicate")} onClick={() => duplicate(p.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
                {p.status === "ACTIVE" ? (
                  <Button size="sm" variant="ghost" title={t("admin.promo.pause")} onClick={() => setStatus(p.id, "PAUSED")}>
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : p.status !== "ARCHIVED" ? (
                  <Button size="sm" variant="ghost" title={t("admin.qr.activate")} onClick={() => setStatus(p.id, "ACTIVE")}>
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}
                {p.status !== "ARCHIVED" && (
                  <Button size="sm" variant="ghost" title={t("admin.promo.archive")} onClick={() => setStatus(p.id, "ARCHIVED")}>
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {analyticsFor === p.id && <PromotionAnalytics id={p.id} currency={currentBranch?.currency} />}
            {editFor === p.id && (
              <EditPromotionPanel
                promotion={p}
                onClose={() => setEditFor(null)}
                onDone={() => {
                  setEditFor(null);
                  refresh();
                }}
              />
            )}
          </Card>
        ))}
        {promotions.length === 0 && <p className="text-muted-foreground">{t("admin.promo.empty")}</p>}
      </div>
    </div>
  );
}

function PromotionAnalytics({ id, currency }: { id: string; currency?: string }) {
  const [data, setData] = useState<any>(null);
  const { t } = useLocale();
  useEffect(() => {
    fetch(`/api/promotions/${id}/analytics`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <p className="text-xs text-muted-foreground mt-3">{t("admin.promo.loadingAnalytics")}</p>;
  if (data.error) return <p className="text-xs text-danger mt-3">{data.error}</p>;

  return (
    <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
      <Stat label={t("admin.promo.ordersUsing")} value={data.ordersUsingOffer} />
      <Stat label={t("admin.promo.discountValue")} value={formatMoney(data.totalDiscountValue, currency)} />
      <Stat label={t("admin.promo.revenue")} value={formatMoney(data.revenueGenerated, currency)} />
      <Stat label={t("admin.promo.aov")} value={formatMoney(Math.round(data.avgOrderValue), currency)} />
      <Stat label={t("admin.promo.remaining")} value={data.usageRemaining ?? t("admin.promo.unlimited")} />
      <Stat label={t("admin.promo.productsAffected")} value={data.productsAffected.length} />
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

function EditPromotionPanel({ promotion, onClose, onDone }: { promotion: any; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState(promotion.name);
  const [priority, setPriority] = useState(String(promotion.priority ?? 0));
  const [maxUsesTotal, setMaxUsesTotal] = useState(promotion.maxUsesTotal ? String(promotion.maxUsesTotal) : "");
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState(promotion.maxUsesPerCustomer ? String(promotion.maxUsesPerCustomer) : "");
  const [endsAt, setEndsAt] = useState(promotion.endsAt ? promotion.endsAt.slice(0, 10) : "");
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const res = await fetch(`/api/promotions/${promotion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
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
          {t("admin.promo.editHint")}
        </p>
        <button onClick={onClose}>
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.common.name")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
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

function NewPromotionForm({
  brandId,
  branches,
  categories,
  onClose,
  onDone,
}: {
  brandId: string;
  branches: { id: string; name: string }[];
  categories: any[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [benefitType, setBenefitType] = useState<"PERCENTAGE_OFF" | "FIXED_OFF" | "FREE_ITEM" | "DISCOUNTED_ITEM">("PERCENTAGE_OFF");
  const [benefitValue, setBenefitValue] = useState("");
  const [eligibleProductIds, setEligibleProductIds] = useState<string[]>([]);
  const [eligibleCategoryIds, setEligibleCategoryIds] = useState<string[]>([]);
  const [eligibleMinQuantity, setEligibleMinQuantity] = useState("1");
  const [benefitProductIds, setBenefitProductIds] = useState<string[]>([]);
  const [benefitCategoryIds, setBenefitCategoryIds] = useState<string[]>([]);
  const [benefitQuantity, setBenefitQuantity] = useState("1");
  const [allowMultiplePerOrder, setAllowMultiplePerOrder] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [restrictBranchId, setRestrictBranchId] = useState("");
  const [priority, setPriority] = useState("0");
  const [requiresCouponCode, setRequiresCouponCode] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [maxUsesTotal, setMaxUsesTotal] = useState("");
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = useState("");
  const { t } = useLocale();
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const allProducts = categories.flatMap((c) => c.products.map((p: any) => ({ ...p, categoryName: c.name })));
  const isBogoStyle = benefitType === "FREE_ITEM" || benefitType === "DISCOUNTED_ITEM";

  function toggle(list: string[], setList: (v: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  const canSubmit =
    name.trim() &&
    (benefitType === "PERCENTAGE_OFF" || benefitType === "FIXED_OFF" || benefitType === "DISCOUNTED_ITEM" ? !!benefitValue : true) &&
    (isBogoStyle ? eligibleProductIds.length > 0 || eligibleCategoryIds.length > 0 : true) &&
    (requiresCouponCode ? couponCode.trim().length > 0 : true);

  async function submit() {
    setError(null);
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        name,
        benefitType,
        benefitValue: benefitValue ? parseFloat(benefitValue) : undefined,
        eligibleProductIds,
        eligibleCategoryIds,
        eligibleMinQuantity: parseInt(eligibleMinQuantity || "1", 10),
        benefitProductIds,
        benefitCategoryIds,
        benefitQuantity: parseInt(benefitQuantity || "1", 10),
        allowMultiplePerOrder,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
        branchIds: restrictBranchId ? [restrictBranchId] : [],
        priority: parseInt(priority || "0", 10),
        requiresCouponCode,
        couponCode: requiresCouponCode ? couponCode.trim().toUpperCase() : undefined,
        maxUsesTotal: maxUsesTotal ? parseInt(maxUsesTotal, 10) : undefined,
        maxUsesPerCustomer: maxUsesPerCustomer ? parseInt(maxUsesPerCustomer, 10) : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) return setError(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
    onDone();
  }

  function ScopePicker({ productIds, categoryIds, onToggleProduct, onToggleCategory }: any) {
    return (
      <div className="max-h-40 overflow-y-auto premium-scroll border border-border rounded-lg p-2 space-y-1">
        {categories.map((cat) => (
          <label key={cat.id} className="flex items-center gap-2 text-xs px-1 py-0.5">
            <input type="checkbox" checked={categoryIds.includes(cat.id)} onChange={() => onToggleCategory(cat.id)} />
            <span className="font-semibold">{t("admin.coupons.wholeCategory", { name: cat.name })}</span>
          </label>
        ))}
        {allProducts.map((p: any) => (
          <label key={p.id} className="flex items-center gap-2 text-xs px-1 py-0.5">
            <input type="checkbox" checked={productIds.includes(p.id)} onChange={() => onToggleProduct(p.id)} />
            <span>{p.name}</span>
            <span className="text-muted-foreground">({p.categoryName})</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-5 mb-6 space-y-4">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.promo.namePh")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />

      <div className="grid grid-cols-2 gap-3">
        <select value={benefitType} onChange={(e) => setBenefitType(e.target.value as any)} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="PERCENTAGE_OFF">{t("admin.promo.opt.pct")}</option>
          <option value="FIXED_OFF">{t("admin.promo.opt.fixed")}</option>
          <option value="FREE_ITEM">{t("admin.promo.opt.free")}</option>
          <option value="DISCOUNTED_ITEM">{t("admin.promo.opt.discounted")}</option>
        </select>
        {benefitType !== "FREE_ITEM" && (
          <input value={benefitValue} onChange={(e) => setBenefitValue(e.target.value)} type="number" placeholder={benefitType === "PERCENTAGE_OFF" || benefitType === "DISCOUNTED_ITEM" ? t("admin.promo.percent") : t("admin.orders.amount")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">{t("admin.promo.eligibility", { buy: isBogoStyle ? t("admin.promo.buySide") : "" })}</p>
        <ScopePicker
          productIds={eligibleProductIds}
          categoryIds={eligibleCategoryIds}
          onToggleProduct={(id: string) => toggle(eligibleProductIds, setEligibleProductIds, id)}
          onToggleCategory={(id: string) => toggle(eligibleCategoryIds, setEligibleCategoryIds, id)}
        />
      </div>

      {isBogoStyle && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <input value={eligibleMinQuantity} onChange={(e) => setEligibleMinQuantity(e.target.value)} type="number" min="1" placeholder={t("admin.promo.buyQty")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
            <input value={benefitQuantity} onChange={(e) => setBenefitQuantity(e.target.value)} type="number" min="1" placeholder={t("admin.promo.getQty")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
          </div>
          {benefitType === "DISCOUNTED_ITEM" && (
            <input value={benefitValue} onChange={(e) => setBenefitValue(e.target.value)} type="number" placeholder={t("admin.promo.discountFreeSide")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {t("admin.promo.benefitHint")}
            </p>
            <ScopePicker
              productIds={benefitProductIds}
              categoryIds={benefitCategoryIds}
              onToggleProduct={(id: string) => toggle(benefitProductIds, setBenefitProductIds, id)}
              onToggleCategory={(id: string) => toggle(benefitCategoryIds, setBenefitCategoryIds, id)}
            />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={allowMultiplePerOrder} onChange={(e) => setAllowMultiplePerOrder(e.target.checked)} />
            {t("admin.promo.repeat")}
          </label>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} type="number" placeholder={t("admin.promo.minOrder")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <select value={restrictBranchId} onChange={(e) => setRestrictBranchId(e.target.value)} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="">{t("admin.promo.allBranches")}</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {t("admin.promo.branchOnly", { name: b.name })}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={priority} onChange={(e) => setPriority(e.target.value)} type="number" placeholder={t("admin.promo.priorityHint")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="date" placeholder={t("admin.promo.ends")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input value={maxUsesTotal} onChange={(e) => setMaxUsesTotal(e.target.value)} type="number" placeholder={t("admin.promo.maxTotal")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={maxUsesPerCustomer} onChange={(e) => setMaxUsesPerCustomer(e.target.value)} type="number" placeholder={t("admin.promo.maxPerCustomerOpt")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>

      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={requiresCouponCode} onChange={(e) => setRequiresCouponCode(e.target.checked)} />
        {t("admin.promo.requireCode")}
      </label>
      {requiresCouponCode && (
        <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder={t("admin.promo.couponPh")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm uppercase" />
      )}

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
