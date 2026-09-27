"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Receipt, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/LocaleContext";

export function GuestBottomNav({ branchId }: { branchId: string }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const base = `/m/${branchId}`;

  const items = [
    { href: base, label: t("guest.nav.menu"), icon: UtensilsCrossed, match: (p: string) => p === base || p.startsWith(`${base}/cart`) },
    { href: `${base}/play`, label: t("nav.play"), icon: Gamepad2, match: (p: string) => p.startsWith(`${base}/play`) },
    { href: `${base}/orders`, label: t("guest.nav.orders"), icon: Receipt, match: (p: string) => p.startsWith(`${base}/orders`) },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass-surface border-t border-border">
      <div className="mx-auto max-w-lg grid grid-cols-3 px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname ?? "");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                active ? "text-accent-ink" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
