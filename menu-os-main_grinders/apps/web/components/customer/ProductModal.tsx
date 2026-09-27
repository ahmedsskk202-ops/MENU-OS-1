"use client";

import { useMemo, useState } from "react";
import { X, Minus, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { formatProductBadge } from "@/lib/promo-badge-format";
import { useCartStore } from "@/lib/cart-store";
import { useLocale } from "@/lib/LocaleContext";
import { localizedDescription, localizedName } from "@/lib/localized";
import type { ProductDTO } from "@/lib/menu-types";
import { cn } from "@/lib/cn";

/** A single-select group with 2–3 short options (Size) reads better as pills. */
function isSizeSelector(group: ProductDTO["modifierGroups"][number]): boolean {
  return group.maxSelect === 1 && group.minSelect === 1 && group.isRequired && group.options.length <= 4;
}

export function ProductModal({
  product,
  currency,
  onClose,
}: {
  product: ProductDTO;
  currency: string;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      product.modifierGroups.map((g) => [g.id, g.options.filter((o) => o.isDefault).map((o) => o.id)])
    )
  );

  const name = localizedName(product, locale);
  const description = localizedDescription(product, locale);

  const unitPrice = useMemo(() => {
    const modDelta = product.modifierGroups
      .flatMap((g) => g.options.filter((o) => selected[g.id]?.includes(o.id)))
      .reduce((sum, o) => sum + o.priceDelta, 0);
    return product.basePrice + modDelta;
  }, [selected, product]);

  const missingRequired = product.modifierGroups.filter(
    (g) => g.isRequired && (selected[g.id]?.length ?? 0) < g.minSelect
  );

  function toggleOption(groupId: string, optionId: string, maxSelect: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (maxSelect === 1) {
        // Single-select: tapping the active choice keeps it active. Deselecting a
        // required choice would leave an unorderable item, so it's a no-op here.
        return { ...prev, [groupId]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= maxSelect) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  function handleAdd() {
    if (missingRequired.length > 0) return;
    const modifiers = product.modifierGroups.flatMap((g) =>
      g.options.filter((o) => selected[g.id]?.includes(o.id)).map((o) => ({ optionId: o.id, name: localizedName(o, locale), priceDelta: o.priceDelta }))
    );
    const key = `${product.id}:${modifiers.map((m) => m.optionId).sort().join(",")}`;
    addItem({
      key,
      productId: product.id,
      name,
      imageUrl: product.imageUrl,
      unitBasePrice: product.basePrice,
      quantity,
      modifiers,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/55 animate-fade-up" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl bg-surface border border-border max-h-[90vh] overflow-y-auto premium-scroll animate-scale-in">
        <div className="relative aspect-[16/9] bg-muted">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full shimmer-skeleton animate-shimmer" />
          )}
          <button onClick={onClose} className="absolute top-3 end-3 h-9 w-9 rounded-full glass-surface flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            {product.promoBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success text-xs font-bold px-2.5 py-1 mb-2">
                <Tag className="h-3 w-3" /> {formatProductBadge(product.promoBadge, currency, locale)}
              </span>
            )}
            <h2 className="font-display text-2xl font-semibold leading-tight">{name}</h2>
            {locale === "ar" ? (
              product.nameEn && product.nameEn !== name ? (
                <p className="text-sm text-muted-foreground mt-1" dir="ltr">{product.nameEn}</p>
              ) : null
            ) : (
              product.nameAr && product.nameAr !== name ? (
                <p className="text-sm text-muted-foreground mt-1" dir="rtl">{product.nameAr}</p>
              ) : null
            )}
            {description && <p className="text-muted-foreground text-sm mt-2">{description}</p>}
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              {product.calories && <span>{t("product.kcal", { n: product.calories })}</span>}
              {product.prepTimeMinutes && <span>· {t("product.minutes", { n: product.prepTimeMinutes })}</span>}
              {product.allergens.length > 0 && <span>· {t("product.contains", { list: product.allergens.join(", ") })}</span>}
            </div>
          </div>

          {product.modifierGroups.map((group) => {
            const groupName = localizedName(group, locale);
            return (
              <div key={group.id}>
                <div className="flex items-baseline justify-between mb-2.5 gap-3">
                  <h4 className="font-semibold text-sm">{groupName}</h4>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {group.isRequired ? t("product.required") : t("product.optional")}{" "}
                    {group.maxSelect > 1 ? `· ${t("product.upTo", { n: group.maxSelect })}` : ""}
                  </span>
                </div>

                {isSizeSelector(group) ? (
                  // Size reads as a row of pills, each showing the price for that
                  // size outright rather than a "+500" delta — clearer when the
                  // whole point of the choice is the price.
                  <div className={cn("grid gap-2", group.options.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
                    {group.options.map((option) => {
                      const active = selected[group.id]?.includes(option.id);
                      const soldOut = option.stockStatus === "SOLD_OUT";
                      const optionPrice = product.basePrice + option.priceDelta;
                      return (
                        <button
                          key={option.id}
                          disabled={soldOut}
                          aria-pressed={active}
                          onClick={() => toggleOption(group.id, option.id, group.maxSelect)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-3 transition-all",
                            active
                              ? "border-accent-ink bg-accent text-accent-foreground shadow-[0_8px_20px_-10px_hsl(var(--accent)/0.9)]"
                              : "border-border bg-surface-raised hover:border-accent-ink/50",
                            soldOut && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <span className="text-sm font-semibold leading-none">{localizedName(option, locale)}</span>
                          <span className={cn("text-[11px] leading-none", active ? "opacity-80" : "text-muted-foreground")}>
                            {formatMoney(optionPrice, currency)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const active = selected[group.id]?.includes(option.id);
                      const soldOut = option.stockStatus === "SOLD_OUT";
                      return (
                        <button
                          key={option.id}
                          disabled={soldOut}
                          aria-pressed={active}
                          onClick={() => toggleOption(group.id, option.id, group.maxSelect)}
                          className={cn(
                            "w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                            active ? "border-accent-ink bg-accent/10" : "border-border bg-surface-raised",
                            soldOut && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <span>{localizedName(option, locale)} {soldOut && `· ${t("product.soldOut")}`}</span>
                          <span className="text-muted-foreground">
                            {option.priceDelta > 0 ? `+${formatMoney(option.priceDelta, currency)}` : t("product.included")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 glass-surface border-t border-border p-4 flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border px-2">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-4 text-center font-semibold">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="p-2">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button size="lg" className="flex-1" onClick={handleAdd} disabled={missingRequired.length > 0}>
            {t("product.add", { price: formatMoney(unitPrice * quantity, currency) })}
          </Button>
        </div>
      </div>
    </div>
  );
}
