"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GrindersLogo } from "@/components/brand/GrindersLogo";
import { NotificationBell } from "./NotificationBell";
import { AdminLocaleToggle } from "./AdminLocaleToggle";
import { ADMIN_NAV, OPEN_SIDEBAR_EVENT } from "./AdminSidebar";

/**
 * The bar across the top of every staff screen: the screen's name on one side, and the
 * notifications, sound, language and theme on the other. Built with logical sides
 * (start/end), so switching Arabic <-> English mirrors it rather than overlapping.
 */
export function AdminTopBar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const current = ADMIN_NAV.filter((n) => pathname === n.href || (n.href !== "/admin" && pathname.startsWith(`${n.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 md:px-8 border-b border-border glass-surface">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => window.dispatchEvent(new Event(OPEN_SIDEBAR_EVENT))}
          aria-label={t("admin.common.openMenu")}
          className="md:hidden h-10 w-10 -ms-1 flex items-center justify-center rounded-xl hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
        <GrindersLogo className="hidden sm:block md:hidden h-8 w-8 shrink-0" />
        {/* Each screen has its own heading, so the bar only names it on a phone, where the
            sidebar that would show it is folded away. */}
        {current && <p className="md:hidden font-display font-semibold text-base truncate">{t(current.label)}</p>}
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <NotificationBell />
        <span className="hidden sm:block h-6 w-px bg-border mx-1" />
        <AdminLocaleToggle />
        <ThemeToggle className="h-10 w-10" />
      </div>
    </header>
  );
}
