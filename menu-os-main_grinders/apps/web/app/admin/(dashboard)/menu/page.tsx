"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import { Plus, ImagePlus } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

const AVAILABILITY_OPTIONS = ["AVAILABLE", "LOW_STOCK", "SOLD_OUT"];
const AVAILABILITY_TONE: Record<string, "success" | "warning" | "danger"> = {
  AVAILABLE: "success",
  LOW_STOCK: "warning",
  SOLD_OUT: "danger",
};

export default function MenuAdminPage() {
  const { branchId, currentBranch } = useBranch();
  const [categories, setCategories] = useState<any[]>([]);
  const [showNewProduct, setShowNewProduct] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const { t } = useLocale();

  async function refresh() {
    if (!branchId) return;
    const res = await fetch(`/api/admin/products?branchId=${branchId}`);
    if (res.ok) setCategories((await res.json()).categories);
  }

  useEffect(() => {
    refresh();
  }, [branchId]);

  async function setAvailability(productId: string, status: string) {
    if (!branchId) return;
    await fetch(`/api/availability/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId, status }),
    });
    refresh();
  }

  async function toggleActive(productId: string, isActive: boolean) {
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    refresh();
  }

  async function uploadImage(productId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!res.ok) return;
    const { url } = await res.json();
    await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });
    refresh();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">{t("admin.menu.title")}</h1>
        <Button size="sm" variant="outline" onClick={() => setShowNewCategory(true)}>
          <Plus className="h-4 w-4" /> {t("admin.menu.newCategory")}
        </Button>
      </div>

      {showNewCategory && (
        <NewCategoryForm
          onClose={() => setShowNewCategory(false)}
          onCreated={() => {
            setShowNewCategory(false);
            refresh();
          }}
        />
      )}

      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">{cat.name}</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowNewProduct(cat.id)}>
                <Plus className="h-3.5 w-3.5" /> {t("admin.menu.addProduct")}
              </Button>
            </div>

            {showNewProduct === cat.id && (
              <NewProductForm
                categoryId={cat.id}
                onClose={() => setShowNewProduct(null)}
                onCreated={() => {
                  setShowNewProduct(null);
                  refresh();
                }}
              />
            )}

            <div className="space-y-2">
              {cat.products.map((p: any) => (
                <Card key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className={`flex items-center gap-3 ${!p.isActive ? "opacity-50" : ""}`}>
                    <label className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-muted cursor-pointer flex items-center justify-center">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && uploadImage(p.id, e.target.files[0])}
                      />
                    </label>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatMoney(p.basePrice, currentBranch?.currency)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {!p.isActive && <Badge tone="neutral">{t("admin.common.inactive")}</Badge>}
                    <select
                      value={p.availabilityStatus}
                      onChange={(e) => setAvailability(p.id, e.target.value)}
                      className="rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs"
                    >
                      {AVAILABILITY_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {enumLabel(t, o)}
                        </option>
                      ))}
                    </select>
                    <Badge tone={AVAILABILITY_TONE[p.availabilityStatus]}>{enumLabel(t, p.availabilityStatus)}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => toggleActive(p.id, !p.isActive)}>
                      {p.isActive ? t("admin.qr.deactivate") : t("admin.qr.activate")}
                    </Button>
                  </div>
                </Card>
              ))}
              {cat.products.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.menu.empty")}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewCategoryForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { currentBranch } = useBranch();
  const [name, setName] = useState("");
  const { t } = useLocale();

  async function submit() {
    if (!name.trim() || !currentBranch) return;
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: currentBranch.brandId, name }),
    });
    onCreated();
  }

  return (
    <Card className="p-4 mb-4 flex gap-2 items-center">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("admin.menu.categoryName")}
        className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
      />
      <Button size="sm" onClick={submit}>
        {t("admin.common.create")}
      </Button>
      <Button size="sm" variant="ghost" onClick={onClose}>
        {t("admin.common.cancel")}
      </Button>
    </Card>
  );
}

function NewProductForm({ categoryId, onClose, onCreated }: { categoryId: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const { t } = useLocale();
  const [description, setDescription] = useState("");

  async function submit() {
    if (!name.trim() || !price) return;
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, name, description, basePrice: parseFloat(price) }),
    });
    onCreated();
  }

  return (
    <Card className="p-4 mb-3 space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.menu.productName")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("admin.menu.description")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t("admin.menu.basePrice")} type="number" className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit}>
          {t("admin.common.create")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          {t("admin.common.cancel")}
        </Button>
      </div>
    </Card>
  );
}
