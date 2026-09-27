"use client";

import { Flame, Sparkles, Star, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";
import { formatProductBadge } from "@/lib/promo-badge-format";
import { useLocale } from "@/lib/LocaleContext";
import { localizedDescription, localizedName, sizeRangeLabel } from "@/lib/localized";
import type { ProductDTO } from "@/lib/menu-types";
import { cn } from "@/lib/cn";

/**
 * Grinders product card.
 *
 * One card per drink — never one card per size. Where the item has a real
 * Small/Medium/Large range, the card shows the entry price plus the size names,
 * and the tap target opens the size selector. That's the same interaction model
 * the underlying required-modifier group already enforces server-side.
 */
export function ProductCard({
  product,
  currency,
  onSelect,
}: {
  product: ProductDTO;
  currency: string;
  onSelect: () => void;
}) {
  const { t, locale } = useLocale();
  const soldOut = product.availabilityStatus === "SOLD_OUT";
  const lowStock = product.availabilityStatus === "LOW_STOCK";

  const name = localizedName(product, locale);
  const description = localizedDescription(product, locale);
  const sizeGroup = product.modifierGroups.find((g) => g.options.length > 1);
  const sizes = sizeGroup ? sizeRangeLabel(sizeGroup.options, locale) : null;

  return (
    <button onClick={onSelect} disabled={soldOut} className="text-start w-full disabled:cursor-not-allowed group">
      <Card
        className={cn(
          "overflow-hidden h-full flex flex-col transition-all duration-200",
          "group-hover:border-accent-ink/50 group-hover:-translate-y-0.5 group-active:scale-[0.99]",
          soldOut && "opacity-60"
        )}
      >
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full shimmer-skeleton animate-shimmer" />
          )}

          <div className="absolute top-2 start-2 flex flex-wrap gap-1.5">
            {product.isFeatured && <Badge tone="accent"><Star className="h-3 w-3" />{t("product.featured")}</Badge>}
            {product.isNew && <Badge tone="success">{t("product.new")}</Badge>}
            {product.isPopular && <Badge tone="warning"><Flame className="h-3 w-3" />{t("product.popular")}</Badge>}
            {product.isSeasonal && (
              <Badge tone="leaf"><Sparkles className="h-3 w-3" />{t("grinders.seasonalBadge")}</Badge>
            )}
          </div>

          {soldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge tone="danger">{t("product.soldOut")}</Badge>
            </div>
          )}
          {!soldOut && lowStock && (
            <div className="absolute bottom-2 start-2">
              <Badge tone="warning">{t("product.lowStock")}</Badge>
            </div>
          )}
        </div>

        <div className="p-3.5 flex flex-col flex-1 gap-2">
          {product.promoBadge && (
            <span className="inline-flex items-center gap-1 self-start rounded-full bg-success/15 text-success text-[10px] font-bold px-2 py-0.5">
              <Tag className="h-2.5 w-2.5" /> {formatProductBadge(product.promoBadge, currency, locale)}
            </span>
          )}

          <div className="flex-1">
            {/* In Arabic the English name is the useful secondary line, and vice
                versa — only shown when the two actually differ. */}
            <h3 className="font-semibold text-sm leading-snug">{name}</h3>
            {locale === "ar" ? (
              product.nameEn && product.nameEn !== name ? (
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5" dir="ltr">
                  {product.nameEn}
                </p>
              ) : null
            ) : (
              product.nameAr && product.nameAr !== name ? (
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5" dir="rtl">
                  {product.nameAr}
                </p>
              ) : null
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{description}</p>
            )}
          </div>

          <div className="flex items-end justify-between gap-2 mt-auto pt-1">
            <span className="font-display font-semibold text-accent-ink leading-none">
              {formatMoney(product.basePrice, currency)}
            </span>
            {sizes && (
              <span className="text-[10px] text-muted-foreground text-end leading-tight">{sizes}</span>
            )}
          </div>
        </div>
      </Card>
    </button>
  );
}
