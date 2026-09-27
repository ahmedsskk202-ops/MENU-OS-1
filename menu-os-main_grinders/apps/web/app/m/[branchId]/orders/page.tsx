"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import { useRealtime } from "@/lib/useRealtime";
import { GuestAlerts } from "@/components/customer/GuestAlerts";
import { OrderStatusCard } from "@/components/customer/OrderStatusCard";
import { useGuestMenu } from "@/lib/useGuestMenu";
import { PaymentResultBanner, useOnlineProviders } from "@/components/customer/OnlinePayment";

export default function GuestOrdersPage({ params }: { params: { branchId: string } }) {
  const { t } = useLocale();
  const { menu } = useGuestMenu(params.branchId);
  const [orders, setOrders] = useState<any[]>([]);
  const [customerSessionId, setCustomerSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  // Set on the way back from a payment provider — which payment to report on.
  const [paymentId, setPaymentId] = useState<string | null>(searchParams.get("payment"));
  const [payError, setPayError] = useState<string | null>(searchParams.get("payment_error"));
  const providers = useOnlineProviders();

  async function refresh() {
    try {
      const res = await fetch("/api/orders/guest/mine");
      if (res.ok) {
        const json = await res.json();
        setOrders(json.orders);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  // Orders carry their own customerSessionId — pull it from the first loaded order to
  // subscribe to this guest's own realtime room (there's no upfront session fetch here
  // the way the table flow has via useTableSession).
  useEffect(() => {
    if (orders[0]?.customerSessionId) setCustomerSessionId(orders[0].customerSessionId);
  }, [orders]);

  useRealtime(customerSessionId ? [`customer-session:${customerSessionId}`] : [], (event) => {
    if (event.type === "order.status_changed" || event.type === "payment.updated" || event.type === "delivery_order.updated") refresh();
  });

  const currency = menu?.brand.currency ?? "IQD";

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-10">
      {customerSessionId && <GuestAlerts rooms={[`customer-session:${customerSessionId}`]} />}
      <h1 className="font-display text-2xl font-semibold mb-6">{t("orders.title")}</h1>

      <PaymentResultBanner paymentId={paymentId} orders={orders} currency={currency} onClose={() => setPaymentId(null)} />
      {payError && (
        <p role="alert" className="mb-5 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger" onClick={() => setPayError(null)}>
          {t(`pay.error.${payError}`) === `pay.error.${payError}` ? t("pay.error.ERROR") : t(`pay.error.${payError}`)}
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl shimmer-skeleton animate-shimmer" />
          ))}
        </div>
      ) : (
        orders.length === 0 && <p className="text-muted-foreground text-center py-16">{t("guest.orders.empty")}</p>
      )}

      <div className="space-y-5">
        {orders.map((order) => (
          <OrderStatusCard key={order.id} order={order} currency={currency} payment={{ providers, highlightPaymentId: paymentId, onChanged: refresh }} />
        ))}
      </div>
    </div>
  );
}
