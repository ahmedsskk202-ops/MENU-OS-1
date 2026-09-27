"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Gamepad2, Receipt } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/LocaleContext";

export function BottomNav({ sessionId }: { sessionId: string }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const base = `/t/${sessionId}`;

  const items = [
    { href: base, label: t("nav.home"), icon: Home, match: (p: string) => p === base },
    { href: `${base}/menu`, label: t("nav.order"), icon: UtensilsCrossed, match: (p: string) => p.startsWith(`${base}/menu`) },
    { href: `${base}/play`, label: t("nav.play"), icon: Gamepad2, match: (p: string) => p.startsWith(`${base}/play`) },
    { href: `${base}/bill`, label: t("nav.bill"), icon: Receipt, match: (p: string) => p.startsWith(`${base}/bill`) },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 glass-surface border-t border-border">
      <div className="mx-auto max-w-lg grid grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
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
