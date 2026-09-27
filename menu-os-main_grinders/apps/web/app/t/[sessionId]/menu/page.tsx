"use client";

import { useEffect, useState } from "react";
import { useTableSession } from "@/lib/useTableSession";
import { useRealtime } from "@/lib/useRealtime";
import { MenuBrowser } from "@/components/customer/MenuBrowser";
import { useLocale } from "@/lib/LocaleContext";
import type { MenuResponse, ProductDTO } from "@/lib/menu-types";

export default function MenuPage({ params }: { params: { sessionId: string } }) {
  const { t } = useLocale();
  const { data: session } = useTableSession();
  const [menu, setMenu] = useState<MenuResponse | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/menu?branchId=${session.branch.id}`)
      .then((r) => r.json())
      .then((json: MenuResponse) => setMenu(json));
  }, [session]);

  // Sold-out / low-stock toggles in the admin reach the guest's open menu live.
  useRealtime(session ? [`branch:${session.branch.id}`] : [], (event) => {
    if (event.type !== "product.availability_changed") return;
    setMenu((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        menus: prev.menus.map((m) => ({
          ...m,
          categories: m.categories.map((c) => ({
            ...c,
            products: c.products.map((p: ProductDTO) =>
              p.id === event.productId
                ? { ...p, availabilityStatus: event.status as ProductDTO["availabilityStatus"] }
                : p
            ),
          })),
        })),
      };
    });
  });

  if (!session || !menu) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 space-y-4">
        <div className="h-28 rounded-2xl shimmer-skeleton animate-shimmer" />
        <div className="h-10 rounded-full shimmer-skeleton animate-shimmer" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl shimmer-skeleton animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <MenuBrowser
      menu={menu}
      cartHref={`/t/${params.sessionId}/cart`}
      subtitle={t("menu.tableInfo", { label: session.table.label, brand: menu.brand.name })}
    />
  );
}
