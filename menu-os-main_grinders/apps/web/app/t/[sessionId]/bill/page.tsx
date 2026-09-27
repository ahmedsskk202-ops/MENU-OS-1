"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, Check, Gift, Sparkles, Package, Printer, CreditCard } from "lucide-react";
import { useTableSession } from "@/lib/useTableSession";
import { useRealtime } from "@/lib/useRealtime";
import { useLocale } from "@/lib/LocaleContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceiptPrint } from "@/components/customer/ReceiptPrint";
import { formatMoney } from "@/lib/format";
import { useOnlineProviders } from "@/components/customer/OnlinePayment";

export default function BillPage() {
  const { t } = useLocale();
  const { data: session } = useTableSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);
  const providers = useOnlineProviders();

  async function refresh() {
    try {
      const res = await fetch("/api/orders/mine");
      if (res.ok) setOrders((await res.json()).orders.filter((o: any) => o.status !== "CANCELLED"));
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
  const total = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const paid = orders.reduce(
    (sum, o) => sum + o.payments.filter((p: any) => p.status === "VERIFIED").reduce((s: number, p: any) => s + parseFloat(p.amount), 0),
    0
  );
  const due = Math.max(0, total - paid);

  async function requestBill() {
    await fetch("/api/waiter-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "BILL" }),
    });
    setRequested(true);
  }

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-10">
      <h1 className="font-display text-2xl font-semibold mb-6">{t("bill.title")}</h1>

      {loading ? (
        <div className="h-32 rounded-2xl shimmer-skeleton animate-shimmer" />
      ) : (
        <Card className="p-6 text-center bg-gradient-to-br from-accent/15 to-transparent border-accent-ink/30">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("bill.amountDue")}</p>
          <p className="font-display text-4xl font-bold mt-2">{formatMoney(due, currency)}</p>
          {paid > 0 && <p className="text-xs text-muted-foreground mt-2">{t("bill.alreadyPaid", { amount: formatMoney(paid, currency) })}</p>}
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t("bill.order", { id: order.id.slice(-6).toUpperCase() })}</span>
              <span className="font-semibold">{formatMoney(order.total, currency)}</span>
            </div>
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                <span>{item.quantity}x {item.nameSnapshot}</span>
                <span>{formatMoney(item.lineTotal, currency)}</span>
              </div>
            ))}
            {order.discounts?.map((d: any) => (
              <div key={d.id} className="flex justify-between text-xs text-success mt-1 pt-1 border-t border-border/50">
                <span className="flex items-center gap-1">
                  {d.type === "FREE_ITEM" && <Gift className="h-3 w-3" />}
                  {d.type === "COMBO" && <Package className="h-3 w-3" />}
                  {d.promotionId && d.type !== "FREE_ITEM" && <Sparkles className="h-3 w-3" />}
                  {d.type === "FREE_ITEM"
                    ? t("orders.free", { name: d.freeProductName })
                    : d.type === "COMBO"
                    ? t("orders.combo", { name: d.reason })
                    : d.promotionId
                    ? t("orders.promotion", { name: d.reason ?? d.type })
                    : t("orders.discount", { name: d.reason ?? d.type })}
                </span>
                <span>-{formatMoney(d.amountApplied, currency)}</span>
              </div>
            ))}
          </Card>
        ))}
      </div>


      {due > 0 && (
        <>
          {requested ? (
            <div className="flex items-center justify-center gap-2 mt-6 text-success font-medium">
              <Check className="h-5 w-5" /> {t("bill.waiterComing")}
            </div>
          ) : (
            <Button size="lg" className="w-full mt-6" onClick={requestBill}>
              <Receipt className="h-4 w-4" /> {t("bill.requestBill")}
            </Button>
          )}
          {/* Online payment is per order, on the orders screen — shown only when a provider is configured. */}
          {providers.length > 0 && session && (
            <Link href={`/t/${session.tableSessionId}/orders`} className="block mt-3">
              <Button size="lg" variant="outline" className="w-full">
                <CreditCard className="h-4 w-4" /> {t("bill.payOnline")}
              </Button>
            </Link>
          )}
          <p className="text-xs text-center text-muted-foreground mt-3">{t("bill.paymentNote")}</p>
        </>
      )}

      {/* A guest can always print what they have been charged, settled or not — the
          same component the staff side uses, so both produce an identical slip. */}
      {orders.length > 0 && (
        <ReceiptPrint
          className="w-full mt-6"
          label={t("bill.printReceipt")}
          icon={<Printer className="h-4 w-4" />}
          receipt={{
            brandName: session?.brand.name ?? "",
            branchName: session?.branch.name ?? "",
            address: session?.branch.address ?? "",
            phone: session?.branch.phone ?? "",
            taxId: "",
            // The table number is the single most important thing on a cafe receipt —
            // it is what staff and guests read back across the counter.
            tableLabel: session?.table?.label ?? "",
            orderNumber: orders.map((o) => o.id.slice(-6).toUpperCase()).join(", "),
            issuedAt: new Date().toISOString(),
            currency,
            items: orders.flatMap((o: any) =>
              o.items.map((i: any) => ({
                name: i.nameSnapshot,
                quantity: i.quantity,
                lineTotal: i.lineTotal,
                modifiers: (i.modifiers ?? []).map((m: any) => m.nameSnapshot),
              }))
            ),
            discounts: orders.flatMap((o: any) =>
              (o.discounts ?? []).map((d: any) => ({ reason: d.reason ?? d.type, amount: d.amountApplied }))
            ),
            subtotal: total - orders.reduce((s: number, o: any) => s + parseFloat(o.discountTotal || 0), 0),
            discountTotal: orders.reduce((s: number, o: any) => s + parseFloat(o.discountTotal || 0), 0),
            taxTotal: orders.reduce((s: number, o: any) => s + parseFloat(o.taxTotal || 0), 0),
            serviceFeeTotal: orders.reduce((s: number, o: any) => s + parseFloat(o.serviceFeeTotal || 0), 0),
            total,
            paid,
            due,
            payments: orders.flatMap((o: any) =>
              o.payments
                .filter((p: any) => p.status === "VERIFIED")
                .map((p: any) => ({ method: p.method, amount: p.amount, tipAmount: p.tipAmount ?? 0 }))
            ),
          }}
        />
      )}
    </div>
  );
}
