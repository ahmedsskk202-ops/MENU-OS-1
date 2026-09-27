"use client";

/**
 * Sticky, horizontally-scrolling category rail.
 *
 * Grinders has 15 categories, so the rail is a single compact row that scrolls
 * sideways rather than a vertical list eating the screen. The active pill is kept
 * in view on change (and on scroll) so jumping categories always feels anchored.
 * This is the ONE place horizontal scrolling is intentional.
 */
import { useEffect, useRef } from "react";
import type { CategoryDTO } from "@/lib/menu-types";
import { localizedName } from "@/lib/localized";
import { useLocale } from "@/lib/LocaleContext";
import { cn } from "@/lib/cn";

export function CategoryRail({
  categories,
  activeId,
  onSelect,
  counts,
}: {
  categories: CategoryDTO[];
  activeId: string | null;
  onSelect: (id: string) => void;
  /** Product count per category, so the rail can hint at size during a search. */
  counts?: Record<string, number>;
}) {
  const { locale } = useLocale();
  const railRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Keep the active category visible when it changes from outside the rail
  // (a search result jump, or the browser restoring a hash).
  useEffect(() => {
    if (!activeId) return;
    const el = pillRefs.current[activeId];
    const rail = railRef.current;
    if (!el || !rail) return;
    const elBox = el.getBoundingClientRect();
    const railBox = rail.getBoundingClientRect();
    if (elBox.left < railBox.left || elBox.right > railBox.right) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeId]);

  if (categories.length === 0) return null;

  return (
    <div className="sticky top-0 z-30 glass-surface border-b border-border">
      <div
        ref={railRef}
        role="tablist"
        aria-label="Menu categories"
        className="mx-auto max-w-5xl flex gap-2 overflow-x-auto premium-scroll px-4 sm:px-6 py-2.5"
      >
        {categories.map((cat) => {
          const active = activeId === cat.id;
          const n = counts?.[cat.id];
          return (
            <button
              key={cat.id}
              ref={(el) => {
                pillRefs.current[cat.id] = el;
              }}
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-accent text-accent-foreground border-accent shadow-[0_6px_18px_-8px_hsl(var(--accent)/0.8)]"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-accent-ink/40"
              )}
            >
              {localizedName(cat, locale)}
              {typeof n === "number" && n > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                    active ? "bg-accent-foreground/15 text-accent-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
