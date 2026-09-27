"use client";

/**
 * Shared Grinders menu browser.
 *
 * Used by both the table flow (/t/[sessionId]/menu) and the table-less guest flow
 * (/m/[branchId]) so the two stay pixel-identical — the only difference between
 * them is which page wraps this and where the cart bar links to.
 *
 * Search matches BOTH the Arabic and English name of every product regardless of
 * the active UI locale, because Iraqi customers routinely type either.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchX } from "lucide-react";
import { GrindersHeader } from "@/components/customer/GrindersHeader";
import { CategoryRail } from "@/components/customer/CategoryRail";
import { ProductCard } from "@/components/customer/ProductCard";
import { ProductModal } from "@/components/customer/ProductModal";
import { CartBar } from "@/components/customer/CartBar";
import { useLocale } from "@/lib/LocaleContext";
import { localizedName } from "@/lib/localized";
import type { CategoryDTO, MenuResponse, ProductDTO } from "@/lib/menu-types";
import { cn } from "@/lib/cn";

/** Normalize Arabic orthography so "اسبريسو" and "إسبريسو" match. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىی]/g, "ي")
    .replace(/[ؤئ]/g, "ء")
    .replace(/ة/g, "ه")
    .replace(/[ً-ْـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function productHaystack(p: ProductDTO): string {
  return normalize([p.name, p.nameAr, p.nameEn, p.description, p.descriptionAr, p.descriptionEn].filter(Boolean).join(" "));
}

export function MenuBrowser({
  menu,
  subtitle,
  cartHref,
  headerAccessory,
}: {
  menu: MenuResponse;
  subtitle?: string;
  cartHref: string;
  headerAccessory?: React.ReactNode;
}) {
  const { t, locale } = useLocale();
  const categories = menu.menus[0]?.categories ?? [];
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id ?? null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  // Set when a pill is tapped: the scroll-spy stands down while the page glides to the
  // chosen section (and for a category near the end, which may never reach the top).
  const spyPausedUntil = useRef(0);

  const searching = query.trim().length > 0;

  // A search spans every category at once (so results are findable without
  // knowing which category an item lives in) and preserves category grouping.
  const { visibleCategories, matchCount } = useMemo(() => {
    if (!searching) {
      return { visibleCategories: categories, matchCount: 0 };
    }
    const q = normalize(query);
    const terms = q.split(" ").filter(Boolean);
    const out: CategoryDTO[] = [];
    let total = 0;
    for (const cat of categories) {
      // Category name match => show the whole category.
      const catHay = normalize([cat.name, cat.nameAr, cat.nameEn].filter(Boolean).join(" "));
      if (terms.every((term) => catHay.includes(term))) {
        out.push(cat);
        total += cat.products.length;
        continue;
      }
      const products = cat.products.filter((p) => {
        const hay = productHaystack(p);
        return terms.every((term) => hay.includes(term));
      });
      if (products.length) {
        out.push({ ...cat, products });
        total += products.length;
      }
    }
    return { visibleCategories: out, matchCount: total };
  }, [categories, query, searching]);

  // Keep the highlighted pill on the category actually on screen. Before, it only moved
  // when a pill was tapped, so after scrolling (or clearing a search) the rail kept
  // pointing at a category the guest was no longer looking at.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (Date.now() < spyPausedUntil.current) return;
      // A section counts as current once its heading has scrolled up under the sticky
      // rail (sections carry scroll-mt-20, i.e. 80px, for the same reason).
      let current = visibleCategories[0]?.id ?? null;
      for (const cat of visibleCategories) {
        const el = document.getElementById(`cat-${cat.id}`);
        if (el && el.getBoundingClientRect().top <= 100) current = cat.id;
      }
      setActiveCategory((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [visibleCategories]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const cat of visibleCategories) c[cat.id] = cat.products.length;
    return c;
  }, [visibleCategories]);

  return (
    <div className="pb-4">
      <GrindersHeader
        query={query}
        onQueryChange={setQuery}
        subtitle={subtitle}
        resultCount={searching ? matchCount : undefined}
        logoUrl={menu.brand.logoUrl}
      />
      {headerAccessory}

      <CategoryRail
        categories={visibleCategories}
        activeId={activeCategory}
        onSelect={(id) => {
          spyPausedUntil.current = Date.now() + 1200;
          setActiveCategory(id);
          const el = document.getElementById(`cat-${id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        counts={searching ? counts : undefined}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 sm:py-7">
        {searching && matchCount === 0 ? (
          <EmptySearch />
        ) : (
          visibleCategories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-20 mb-9 last:mb-2">
              <div className="flex items-baseline gap-3 mb-3.5">
                <h2 className="font-display text-lg sm:text-xl font-semibold">{localizedName(cat, locale)}</h2>
                <span aria-hidden className="h-px flex-1 bg-border" />
                {searching && (
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">{cat.products.length}</span>
                )}
              </div>

              {/* 1 column on small phones so the photo stays readable, 2 up from
                  380px, 3 on tablet, 4 on desktop. */}
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {cat.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    currency={menu.brand.currency}
                    onSelect={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          currency={menu.brand.currency}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Kept here rather than in each page so the bar is identical in both flows. */}
      <CartBar href={cartHref} currency={menu.brand.currency} />
    </div>
  );
}

function EmptySearch() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="h-14 w-14 rounded-2xl bg-accent/10 border border-accent-ink/25 flex items-center justify-center mb-4">
        <SearchX className="h-6 w-6 text-accent-ink" />
      </div>
      <p className="font-display text-lg font-semibold">{t("grinders.noResults")}</p>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">{t("grinders.noResultsHint")}</p>
    </div>
  );
}
