"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "mos_theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// The actual color switch already happened before this component ever mounts — see the
// blocking inline script in app/layout.tsx, which reads localStorage (or the OS
// preference on a first visit) and sets <html data-theme> synchronously before paint,
// the same technique next-themes uses to avoid a flash of the wrong theme. This
// provider only mirrors that already-applied value into React state so the toggle
// button knows what to show and how to flip it — it never decides the theme itself.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "dark";
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
  });

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // ignore — the choice just won't persist across visits
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Keep the <meta name="theme-color"> tag (browser chrome / PWA splash screen) in
  // sync with whichever theme is actually active, including an explicit user override
  // — the static per-media-query tag in app/layout.tsx only covers the OS-preference
  // case for a visitor who has never toggled.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#FFFFFF" : "#13131A");
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
