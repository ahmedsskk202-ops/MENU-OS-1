"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translate, LOCALE_STORAGE_KEY, type Locale } from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Defaults to the brand's own configured locale (Brand.defaultLocale) the first time a
// guest opens this table's session; a manual toggle after that is remembered per device,
// the same convenience-storage pattern as the admin branch selector.
export function LocaleProvider({ defaultLocale, children }: { defaultLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "en" || stored === "ar") setLocaleState(stored);
    } catch {
      // localStorage unavailable (private mode, etc.) — falls back to the brand default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      // ignore — the choice just won't persist across visits
    }
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(locale, key, vars), [locale]);
  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";
  const value = useMemo(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>
      <div dir={dir} lang={locale} className={locale === "ar" ? "font-arabic" : undefined}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
