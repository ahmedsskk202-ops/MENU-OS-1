"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { cn } from "@/lib/cn";

export function AdminLocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      aria-label={t("admin.common.language")}
      title={t("admin.common.language")}
      className={cn(
        "h-10 flex items-center gap-2 rounded-full border border-border bg-surface-raised hover:bg-muted px-3 sm:px-4 text-sm font-semibold transition-colors",
        className
      )}
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{locale === "ar" ? "English" : "عربي"}</span>
      <span className="sm:hidden">{locale === "ar" ? "EN" : "ع"}</span>
    </button>
  );
}
