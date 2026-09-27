"use client";

import { useLocale } from "@/lib/LocaleContext";
import { useEffect, useState } from "react";
import { Plus, Tag, Gift } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

export default function CouponsPage() {
  const { currentBranch } = useBranch();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { t } = useLocale();

  async function refresh() {
    if (!currentBranch) return;
    const [couponsRes, productsRes] = await Promise.all([
      fetch(`/api/coupons?brandId=${currentBranch.brandId}`),
      fetch(`/api/admin/products?branchId=${currentBranch.id}`),
    ]);
    if (couponsRes.ok) setCoupons((await couponsRes.json()).coupons);
    if (productsRes.ok) setCategories((await productsRes.json()).categories);
  }

  useEffect(() => {
    refresh();
  }, [currentBranch?.brandId]);

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/coupons/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) });
    refresh();
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">{t("admin.coupons.title")}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> {t("admin.coupons.new")}
        </Button>
      </div>

      {showForm && currentBranch && (
        <NewCouponForm
          brandId={currentBranch.brandId}
          categories={categories}
          onClose={() => setShowForm(false)}
          onDone={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      <div className="space-y-2">
        {coupons.map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {c.discountType === "FREE_ITEM" ? <Gift className="h-4 w-4 text-accent-ink" /> : <Tag className="h-4 w-4 text-accent-ink" />}
              <div>
                <p className="font-semibold text-sm">{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {c.discountType === "PERCENTAGE" ? `${c.value}%` : c.discountType === "FIXED" ? formatMoney(c.value, currentBranch?.currency) : t("admin.coupons.freeItem")}
                  {c.applicableProductIds?.length > 0 ? t("admin.coupons.productsScoped", { n: c.applicableProductIds.length }) : ""}
                  {c.applicableCategoryIds?.length > 0 ? t("admin.coupons.categoriesScoped", { n: c.applicableCategoryIds.length }) : ""}
                  {c.minOrderAmount ? t("admin.coupons.min", { amount: formatMoney(c.minOrderAmount, currentBranch?.currency) }) : ""}
                  {c.maxUses ? t("admin.coupons.usedOf", { used: c.usedCount, max: c.maxUses }) : t("admin.coupons.used", { used: c.usedCount })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? t("admin.common.active") : t("admin.common.inactive")}</Badge>
              <Button size="sm" variant="ghost" onClick={() => toggle(c.id, !c.isActive)}>
                {c.isActive ? t("admin.qr.deactivate") : t("admin.qr.activate")}
              </Button>
            </div>
          </Card>
        ))}
        {coupons.length === 0 && <p className="text-muted-foreground">{t("admin.coupons.empty")}</p>}
      </div>
    </div>
  );
}

function NewCouponForm({ brandId, categories, onClose, onDone }: { brandId: string; categories: any[]; onClose: () => void; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED" | "FREE_ITEM">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [applicableProductIds, setApplicableProductIds] = useState<string[]>([]);
  const [applicableCategoryIds, setApplicableCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocale();

  const allProducts = categories.flatMap((c) => c.products.map((p: any) => ({ ...p, categoryName: c.name })));

  function toggleProduct(id: string) {
    setApplicableProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }
  function toggleCategory(id: string) {
    setApplicableCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  const canSubmit = code.trim() && (discountType === "FREE_ITEM" ? applicableProductIds.length > 0 || applicableCategoryIds.length > 0 : !!value);

  async function submit() {
    setError(null);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        code,
        discountType,
        value: discountType === "FREE_ITEM" ? undefined : parseFloat(value || "0"),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
        maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        applicableProductIds,
        applicableCategoryIds,
      }),
    });
    const json = await res.json();
    if (!res.ok) return setError(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
    onDone();
  }

  return (
    <Card className="p-5 mb-6 space-y-3">
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("admin.coupons.codePlaceholder")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm uppercase" />
      <div className="grid grid-cols-2 gap-3">
        <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED" | "FREE_ITEM")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="PERCENTAGE">{t("admin.orders.type.percentage")}</option>
          <option value="FIXED">{t("admin.orders.type.fixed")}</option>
          <option value="FREE_ITEM">{t("admin.coupons.freeItem")}</option>
        </select>
        {discountType !== "FREE_ITEM" && (
          <input value={value} onChange={(e) => setValue(e.target.value)} type="number" placeholder={t("admin.orders.value")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        )}
      </div>

      {discountType === "FREE_ITEM" && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            {t("admin.coupons.freeHint")}
          </p>
          <div className="max-h-40 overflow-y-auto premium-scroll border border-border rounded-lg p-2 space-y-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-xs px-1 py-0.5">
                <input type="checkbox" checked={applicableCategoryIds.includes(cat.id)} onChange={() => toggleCategory(cat.id)} />
                <span className="font-semibold">{t("admin.coupons.wholeCategory", { name: cat.name })}</span>
              </label>
            ))}
            {allProducts.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-xs px-1 py-0.5">
                <input type="checkbox" checked={applicableProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                <span>{p.name}</span>
                <span className="text-muted-foreground">({p.categoryName})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} type="number" placeholder={t("admin.coupons.minOrder")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} type="number" placeholder={t("admin.coupons.maxUses")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>
      <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" placeholder={t("admin.coupons.expires")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
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
