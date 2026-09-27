/**
 * Locale-aware display names.
 *
 * Grinders publishes every item in both Arabic and English, so the menu carries
 * `nameAr`/`nameEn` alongside the original `name`. These helpers pick the right one
 * for the active locale and always fall back to something non-empty, so a missing
 * translation degrades to the English/canonical label instead of a blank UI.
 *
 * Arabic is the primary display language for this brand (it's an Iraqi client), so
 * the fallback order is: active locale -> the other Latin name -> canonical name.
 */
import type { Locale } from "@/lib/i18n";

type Localized = {
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
};

type LocalizedWithDescription = Localized & {
  description?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
};

export function localizedName(item: Localized, locale: Locale): string {
  const preferred = locale === "ar" ? item.nameAr : item.nameEn;
  if (preferred?.trim()) return preferred.trim();
  const secondary = locale === "ar" ? item.nameEn : item.nameAr;
  if (secondary?.trim()) return secondary.trim();
  return item.name;
}

export function localizedDescription(item: LocalizedWithDescription, locale: Locale): string | null {
  const preferred = locale === "ar" ? item.descriptionAr : item.descriptionEn;
  if (preferred?.trim()) return preferred.trim();
  const secondary = locale === "ar" ? item.descriptionEn : item.descriptionAr;
  if (secondary?.trim()) return secondary.trim();
  return item.description?.trim() || null;
}

/** "Small · Medium · Large" style hint for a size-selectable product. */
export function sizeRangeLabel(options: { name: string; nameAr?: string | null; nameEn?: string | null }[], locale: Locale): string | null {
  const names = options.map((o) => localizedName(o, locale)).filter(Boolean);
  return names.length > 1 ? names.join(" · ") : null;
}
