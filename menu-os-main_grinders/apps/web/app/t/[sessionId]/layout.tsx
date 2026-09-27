"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useTableSession } from "@/lib/useTableSession";
import { useRealtime } from "@/lib/useRealtime";
import { useCartStore } from "@/lib/cart-store";
import { LocaleProvider, useLocale } from "@/lib/LocaleContext";
import type { Locale } from "@/lib/i18n";
import { BottomNav } from "@/components/customer/BottomNav";
import { CallWaiterButton } from "@/components/customer/CallWaiterButton";
import { PwaRegister } from "@/components/customer/PwaRegister";
import { GuestAlerts } from "@/components/customer/GuestAlerts";
import { PoweredByFooter } from "@/components/customer/PoweredByFooter";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function TableSessionLayout({ children, params }: { children: React.ReactNode; params: { sessionId: string } }) {
  const { data, error, loading } = useTableSession();
  const [closedByStaff, setClosedByStaff] = useState(false);
  const ensureSession = useCartStore((s) => s.ensureSession);

  useEffect(() => {
    if (data) ensureSession(data.tableSessionId);
  }, [data, ensureSession]);

  useRealtime(data ? [`table-session:${data.tableSessionId}`] : [], (event) => {
    if (event.type === "table_session.closed") setClosedByStaff(true);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent-ink border-t-transparent animate-spin" />
      </div>
    );
  }

  const initialLocale: Locale = data?.brand.defaultLocale === "ar" ? "ar" : "en";

  if (error || !data || closedByStaff) {
    return (
      <LocaleProvider defaultLocale={initialLocale}>
        <ThemeToggle className="fixed top-4 start-4 z-40" />
        <SessionEndedScreen closedByStaff={closedByStaff} />
      </LocaleProvider>
    );
  }

  return (
    <LocaleProvider defaultLocale={initialLocale}>
      <div className="relative min-h-screen pt-12 pb-28">
        <PwaRegister />
        <GuestAlerts rooms={[`table-session:${data.tableSessionId}`, `customer-session:${data.customerSessionId}`]} />
        <ThemeToggle className="absolute top-4 start-4 z-40" />
        <LocaleToggle />
        {children}
        <PoweredByFooter />
        <CallWaiterButton />
        <BottomNav sessionId={params.sessionId} />
      </div>
    </LocaleProvider>
  );
}

function SessionEndedScreen({ closedByStaff }: { closedByStaff: boolean }) {
  const { t } = useLocale();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-2xl font-semibold">{t("sessionEnded.title")}</h1>
      {/* Always the guest's language. The server's reason ('No active table session',
          'This table session has ended') is English and says nothing about what to do. */}
      <p className="text-muted-foreground max-w-xs">{closedByStaff ? t("sessionEnded.closedByStaff") : t("sessionEnded.body")}</p>
      <PoweredByFooter />
    </div>
  );
}

function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="absolute top-4 end-4 z-40 flex items-center gap-1.5 rounded-full glass-surface border border-border h-10 px-3.5 text-xs font-semibold shadow-sm"
      aria-label="Switch language"
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "ar" ? "EN" : "عربي"}
    </button>
  );
}
