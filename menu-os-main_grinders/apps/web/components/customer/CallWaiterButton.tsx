"use client";

import { useState } from "react";
import { Bell, Droplet, ShoppingBag, Receipt, HelpCircle, MoreHorizontal, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/LocaleContext";

export function CallWaiterButton() {
  const { t } = useLocale();
  const OPTIONS = [
    { type: "ASSISTANCE", label: t("callWaiter.option.assistance"), icon: Bell },
    { type: "WATER", label: t("callWaiter.option.water"), icon: Droplet },
    { type: "ORDER", label: t("callWaiter.option.order"), icon: ShoppingBag },
    { type: "BILL", label: t("callWaiter.option.bill"), icon: Receipt },
    { type: "QUESTION", label: t("callWaiter.option.question"), icon: HelpCircle },
    { type: "OTHER", label: t("callWaiter.option.other"), icon: MoreHorizontal },
  ] as const;
  const [open, setOpen] = useState(false);
  const [sentType, setSentType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(type: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waiter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        setSentType(type);
        setTimeout(() => {
          setOpen(false);
          setSentType(null);
        }, 1600);
      } else {
        setError(t("callWaiter.error"));
      }
    } catch {
      setError(t("callWaiter.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Shares bottom-24 with the menu's CartBar; lifts above it (via its data-cart-bar marker) while it's showing instead of covering it. */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 [body:has([data-cart-bar])_&]:bottom-44 end-4 z-40 flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-3.5 font-semibold shadow-[0_12px_28px_-8px_hsl(var(--accent)/0.65)] active:scale-95 transition-transform"
      >
        <Bell className="h-4 w-4" />
        {t("callWaiter.button")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 animate-fade-up" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-surface border-t border-border p-6 pb-8 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">{t("callWaiter.title")}</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {sentType ? (
              <div className="flex flex-col items-center gap-3 py-8 animate-fade-up">
                <div className="h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
                  <Check className="h-7 w-7 text-success" />
                </div>
                <p className="font-medium">{t("callWaiter.sent")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    disabled={loading}
                    onClick={() => send(type)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-raised p-4 text-sm font-medium",
                      "hover:border-accent-ink/50 active:scale-[0.97] transition-all disabled:opacity-50"
                    )}
                  >
                    <Icon className="h-6 w-6 text-accent-ink" />
                    {label}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="text-danger text-xs text-center mt-3">{error}</p>}

            <Button variant="ghost" className="mt-4 w-full" onClick={() => setOpen(false)}>
              {t(sentType ? "callWaiter.close" : "callWaiter.cancel")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
