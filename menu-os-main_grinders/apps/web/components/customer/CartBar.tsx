"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, cartCount, cartSubtotal } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/LocaleContext";

export function CartBar({ href, currency }: { href: string; currency: string }) {
  const items = useCartStore((s) => s.items);
  const count = cartCount(items);
  const { t } = useLocale();
  if (count === 0) return null;

  return (
    <div data-cart-bar className="fixed bottom-24 inset-x-0 z-30 px-5">
      <Link
        href={href}
        className="mx-auto max-w-lg flex items-center justify-between rounded-2xl bg-accent text-accent-foreground px-5 py-4 shadow-[0_16px_32px_-12px_hsl(var(--accent)/0.7)] animate-fade-up"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-5 w-5" />
          {t(count > 1 ? "cart.itemCountPlural" : "cart.itemCount", { n: count })}
        </span>
        <span className="font-display font-semibold">{formatMoney(cartSubtotal(items), currency)}</span>
      </Link>
    </div>
  );
}
