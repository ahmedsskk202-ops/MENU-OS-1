import Link from "next/link";
import { QrCode, UtensilsCrossed, Gamepad2, Bell, ScanLine } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GrindersLogo } from "@/components/brand/GrindersLogo";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-8">
      <ThemeToggle className="fixed top-4 end-4" />

      <div className="space-y-4">
        <GrindersLogo className="h-20 w-20 mx-auto" />
        <p className="text-xs uppercase tracking-[0.3em] text-accent-ink font-semibold">
          Coffee House · Baghdad
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold max-w-2xl">The Grinders</h1>
        <p className="text-muted-foreground max-w-md mx-auto" dir="rtl">
         Scan the code on your table, browse the menu, order and pay — no app to download.
        </p>
      </div>

      <div className="flex gap-6 text-muted-foreground">
        <ScanLine className="h-6 w-6" />
        <QrCode className="h-6 w-6" />
        <UtensilsCrossed className="h-6 w-6" />
        <Gamepad2 className="h-6 w-6" />
        <Bell className="h-6 w-6" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/r/grinders-menu-main"
          className="rounded-2xl bg-accent text-accent-foreground px-6 py-3.5 text-sm font-semibold transition hover:brightness-105"
        >
          Browse the menu
        </Link>
        <Link
          href="/admin/login"
          className="rounded-2xl border border-border px-6 py-3.5 text-sm font-semibold text-accent-ink hover:border-accent-ink/50"
        >
          Staff login →
        </Link>
      </div>

      <p dir="ltr" className="text-xs tracking-wide text-muted-foreground fixed bottom-6">
        Powered by <span className="font-semibold text-accent-ink">ORVYQ CO.</span>
      </p>
    </div>
  );
}
