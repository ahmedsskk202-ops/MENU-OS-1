"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { useTableSession } from "@/lib/useTableSession";
import { useRealtime } from "@/lib/useRealtime";
import { useLocale } from "@/lib/LocaleContext";
import { OrderStatusCard } from "@/components/customer/OrderStatusCard";
import { PaymentResultBanner, useOnlineProviders } from "@/components/customer/OnlinePayment";

export default function OrdersPage() {
  const { t } = useLocale();
  const { data: session } = useTableSession();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Set only on the redirect straight out of checkout, so a guest who just tapped
  // "Place order" is told in words that it reached the kitchen and for which table.
  const [justPlaced, setJustPlaced] = useState<string | null>(searchParams.get("placed"));
  // Set on the way back from a payment provider — which payment to report on.
  const [paymentId, setPaymentId] = useState<string | null>(searchParams.get("payment"));
  const providers = useOnlineProviders();

  async function refresh() {
    try {
      const res = await fetch("/api/orders/mine");
      if (res.ok) setOrders((await res.json()).orders);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useRealtime(session ? [`table-session:${session.tableSessionId}`] : [], (event) => {
    if (event.type === "order.status_changed" || event.type === "order.created" || event.type === "payment.updated") refresh();
  });

  const currency = session?.brand.currency ?? "IQD";
  const placedOrder = justPlaced ? orders.find((o) => o.id === justPlaced) : null;

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-10">
      <div className="mb-6">
        {session && <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("home.table", { label: session.table.label })}</p>}
        <h1 className="font-display text-2xl font-semibold">{t("orders.title")}</h1>
      </div>

      {placedOrder && (
        <div role="status" className="mb-5 flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 animate-fade-up">
          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{t("orders.placed.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("orders.placed.body", { label: session?.table.label ?? "", number: placedOrder.id.slice(-6).toUpperCase() })}
            </p>
          </div>
          <button onClick={() => setJustPlaced(null)} aria-label={t("common.close")} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <PaymentResultBanner paymentId={paymentId} orders={orders} currency={currency} onClose={() => setPaymentId(null)} />

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl shimmer-skeleton animate-shimmer" />
          ))}
        </div>
      ) : (
        orders.length === 0 && <p className="text-muted-foreground text-center py-16">{t("orders.empty")}</p>
      )}

      <div className="space-y-5">
        {orders.map((order) => (
          <OrderStatusCard key={order.id} order={order} currency={currency} payment={{ providers, highlightPaymentId: paymentId, onChanged: refresh }} />
        ))}
      </div>
    </div>
  );
}
