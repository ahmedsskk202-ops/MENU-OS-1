import { formatMoney } from "./format";
import { translate, type Locale } from "./i18n";
import type { ProductPromoBadgeDTO, WholeOrderPromoBadgeDTO } from "./menu-types";

// Shared wording so the Menu, Product, Cart, and Checkout badges never drift from
// each other — one formatter, used everywhere a promotion is shown to a customer.
// Localized via the same dictionary as the rest of the customer app.
export function formatProductBadge(badge: ProductPromoBadgeDTO, currency: string, locale: Locale = "en"): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const prefix = badge.isHappyHour ? t("promo.happyHour") : "";
  switch (badge.kind) {
    case "PERCENTAGE_OFF":
      return prefix + t("promo.percentOff", { value: badge.value ?? 0 });
    case "FIXED_OFF":
      return prefix + t("promo.fixedOff", { value: formatMoney(badge.value ?? 0, currency) });
    case "FREE_ITEM":
      return prefix + t("promo.buyGetFree", { buy: badge.buyQty, get: badge.getQty });
    case "DISCOUNTED_ITEM":
      return prefix + t("promo.buyGetDiscount", { buy: badge.buyQty, get: badge.getQty, value: badge.value ?? 0 });
  }
}

export function formatWholeOrderBadge(badge: WholeOrderPromoBadgeDTO, currency: string, locale: Locale = "en"): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const prefix = badge.isHappyHour ? t("promo.happyHour") : "";
  return badge.kind === "PERCENTAGE_OFF"
    ? prefix + t("promo.wholeOrderPercent", { value: badge.value })
    : prefix + t("promo.wholeOrderFixed", { value: formatMoney(badge.value, currency) });
}
