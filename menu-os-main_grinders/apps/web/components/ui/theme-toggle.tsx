"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/cn";

/** Icon-only toggle, reused across the customer app, admin dashboard and auth pages.
 *  Renders nothing in its icon slot until mounted — the theme itself is already correct
 *  pre-hydration (see the blocking script in app/layout.tsx), but which icon to show
 *  depends on React state that only exists client-side, so guessing before mount would
 *  risk a hydration warning for a value that's purely decorative anyway. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggleTheme}
      aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex items-center justify-center h-9 w-9 rounded-full glass-surface border border-border shadow-sm text-foreground transition-transform active:scale-95",
        className
      )}
    >
      {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
    </button>
  );
}
