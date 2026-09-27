"use client";

import { Languages } from "lucide-react";
import { useGuestMenu } from "@/lib/useGuestMenu";
import { LocaleProvider, useLocale } from "@/lib/LocaleContext";
import type { Locale } from "@/lib/i18n";
import { GuestBottomNav } from "@/components/customer/GuestBottomNav";
import { PwaRegister } from "@/components/customer/PwaRegister";
import { PoweredByFooter } from "@/components/customer/PoweredByFooter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function GuestOrderingLayout({ children, params }: { children: React.ReactNode; params: { branchId: string } }) {
  const { menu, loading } = useGuestMenu(params.branchId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent-ink border-t-transparent animate-spin" />
      </div>
    );
  }

  const initialLocale: Locale = menu?.brand.defaultLocale === "ar" ? "ar" : "en";

  return (
    <LocaleProvider defaultLocale={initialLocale}>
      <div className="relative min-h-screen pt-12 pb-24">
        <PwaRegister />
        <ThemeToggle className="absolute top-4 start-4 z-40" />
        <LocaleToggle />
        {children}
        <PoweredByFooter />
        <GuestBottomNav branchId={params.branchId} />
      </div>
    </LocaleProvider>
  );
}

function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="absolute top-4 end-4 z-40 flex items-center gap-1.5 rounded-full glass-surface border border-border px-3 py-1.5 text-xs font-semibold shadow-sm"
      aria-label="Switch language"
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
