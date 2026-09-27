"use client";

/**
 * Grinders-branded menu header: real logo lockup, brand name, menu title, and search.
 * Compact on mobile (the primary surface) and expands to a full row on desktop.
 */
import { Search, X } from "lucide-react";
import { GrindersLogo } from "@/components/brand/GrindersLogo";
import { useLocale } from "@/lib/LocaleContext";

export function GrindersHeader({
  query,
  onQueryChange,
  subtitle,
  resultCount,
  logoUrl,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  subtitle?: string;
  resultCount?: number;
  /** Brand logo from the database, so a rebrand only needs a seed change. */
  logoUrl?: string | null;
}) {
  const { locale, t } = useLocale();

  return (
    <header className="relative overflow-hidden border-b border-border">
      {/* Warm espresso wash so the header reads as a distinct brand band rather
          than just more page background. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 140% at 50% -30%, hsl(var(--accent) / 0.16), transparent 62%), linear-gradient(180deg, hsl(var(--surface-raised)), hsl(var(--background)))",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={t("grinders.brandName")}
              className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 object-contain"
              style={{ aspectRatio: "1 / 1" }}
            />
          ) : (
            <GrindersLogo className="h-11 w-11 sm:h-12 sm:w-12" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-accent-ink">
              {t("grinders.coffeeHouse")}
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-semibold leading-tight truncate">
              {t("grinders.brandName")}
            </h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="search"
            enterKeyHint="search"
            placeholder={t("grinders.searchPlaceholder")}
            aria-label={t("grinders.searchPlaceholder")}
            className="w-full rounded-2xl border border-border bg-surface-raised/80 ps-10 pe-10 py-3 text-sm outline-none transition focus:border-accent-ink/60 focus:ring-2 focus:ring-accent-ink/25 placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              aria-label={t("grinders.clearSearch")}
              className="absolute end-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {query && typeof resultCount === "number" && (
          <p className="mt-2 text-xs text-muted-foreground" role="status">
            {locale === "ar"
              ? `${resultCount} نتيجة`
              : `${resultCount} result${resultCount === 1 ? "" : "s"}`}
          </p>
        )}
      </div>
    </header>
  );
}
