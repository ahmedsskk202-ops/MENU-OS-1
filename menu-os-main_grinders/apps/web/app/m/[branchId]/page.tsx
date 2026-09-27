"use client";

import { useEffect, useState } from "react";
import { Store, Bike } from "lucide-react";
import { useGuestMenu } from "@/lib/useGuestMenu";
import { useLocale } from "@/lib/LocaleContext";
import { useCartStore } from "@/lib/cart-store";
import { MenuBrowser } from "@/components/customer/MenuBrowser";
import { cn } from "@/lib/cn";

const ORDER_TYPE_STORAGE_KEY = "mos_guest_order_type";

export default function GuestMenuPage({ params }: { params: { branchId: string } }) {
  const { t } = useLocale();
  const { menu, loading } = useGuestMenu(params.branchId);
  const ensureSession = useCartStore((s) => s.ensureSession);
  const guestSessionId = `guest:${params.branchId}`;

  useEffect(() => {
    ensureSession(guestSessionId);
  }, [ensureSession, guestSessionId]);

  const [orderType, setOrderType] = useState<"PICKUP" | "DELIVERY">(() => {
    if (typeof window === "undefined") return "PICKUP";
    try {
      return localStorage.getItem(ORDER_TYPE_STORAGE_KEY) === "DELIVERY" ? "DELIVERY" : "PICKUP";
    } catch {
      return "PICKUP";
    }
  });

  function setType(next: "PICKUP" | "DELIVERY") {
    setOrderType(next);
    try {
      localStorage.setItem(ORDER_TYPE_STORAGE_KEY, next);
    } catch {
      // per-device convenience only — fine if it doesn't persist
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 space-y-4">
        <div className="h-32 rounded-2xl shimmer-skeleton animate-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl shimmer-skeleton animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }
  if (!menu) return null;

  return (
    <MenuBrowser
      menu={menu}
      cartHref={`/m/${params.branchId}/cart?type=${orderType}`}
      subtitle={menu.branch.name}
      headerAccessory={
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType("PICKUP")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                orderType === "PICKUP"
                  ? "border-accent-ink bg-accent text-accent-foreground"
                  : "border-border bg-surface-raised text-muted-foreground"
              )}
            >
              <Store className="h-4 w-4" /> {t("guest.pickup")}
            </button>
            <button
              onClick={() => setType("DELIVERY")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                orderType === "DELIVERY"
                  ? "border-accent-ink bg-accent text-accent-foreground"
                  : "border-border bg-surface-raised text-muted-foreground"
              )}
            >
              <Bike className="h-4 w-4" /> {t("guest.delivery")}
            </button>
          </div>
        </div>
      }
    />
  );
}
