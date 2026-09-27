"use client";

import { Check, Gift, Undo2, Sparkles, Package, Bike, MapPin } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import { localizedName } from "@/lib/localized";
import { OrderOnlinePayment, type OnlineProvider } from "@/components/customer/OnlinePayment";

// Two steps, the only two a guest needs: the cafe has the order, and it is ready.
const TIMELINE_STEPS = ["RECEIVED", "READY"];
const READY_STATUSES = ["READY", "DELIVERED", "PAID", "CLOSED"];

/** One order's status timeline + line items + discounts/refunds — shared by the
 *  dine-in order list (/t/[sessionId]/orders) and the guest pickup/delivery order
 *  list (/m/[branchId]/orders), which differ only in how "my orders" is fetched. */
export function OrderStatusCard({
  order,
  currency,
  payment,
}: {
  order: any;
  currency: string;
  /** Online payment options; omitted → the card shows no payment section, as before. */
  payment?: { providers: { id: OnlineProvider; test: boolean }[]; highlightPaymentId?: string | null; onChanged?: () => void };
}) {
  const { t, locale } = useLocale();
  const STEP_LABEL: Record<string, string> = {
    RECEIVED: t("orders.step.created"),
    READY: t("orders.step.readyFull"),
  };

  const currentIndex = READY_STATUSES.includes(order.status) ? 1 : 0;
  const cancelled = ["CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(order.status);
  const deliveryOrder = order.deliveryOrder;

  return (
    <Card className="p-5 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">
          #{order.id.slice(-6).toUpperCase()} {order.type && order.type !== "DINE_IN" && `· ${order.type === "PICKUP" ? t("orders.type.pickup") : t("orders.type.delivery")}`}
        </span>
        <span className="font-display font-semibold">{formatMoney(order.total, currency)}</span>
      </div>

      {cancelled ? (
        <p className="text-danger text-sm font-medium">
          {order.status === "REFUNDED" ? t("orders.refunded") : order.status === "PARTIALLY_REFUNDED" ? t("orders.status.partiallyRefunded") : t("orders.status.cancelled")}
        </p>
      ) : (
        <div className="flex items-center gap-1">
          {TIMELINE_STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="flex items-center w-full">
                <div className={cn("h-1 flex-1 rounded-full", i === 0 ? "opacity-0" : i <= currentIndex ? "bg-accent" : "bg-muted")} />
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center shrink-0 border-2",
                    i <= currentIndex ? "bg-accent border-accent-ink text-accent-foreground" : "border-muted bg-surface"
                  )}
                >
                  {i <= currentIndex && <Check className="h-3 w-3" />}
                </div>
                <div className={cn("h-1 flex-1 rounded-full", i === TIMELINE_STEPS.length - 1 ? "opacity-0" : i < currentIndex ? "bg-accent" : "bg-muted")} />
              </div>
              <span className={cn("text-[10px] text-center leading-tight", i === currentIndex ? "text-foreground font-semibold" : "text-muted-foreground")}>
                {STEP_LABEL[step]}
              </span>
            </div>
          ))}
        </div>
      )}

      {deliveryOrder && (
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {deliveryOrder.status.replace(/_/g, " ").toLowerCase()}
          </span>
          {deliveryOrder.driver && (
            <span className="flex items-center gap-1.5 font-medium">
              <Bike className="h-3.5 w-3.5" /> {deliveryOrder.driver.name} · {deliveryOrder.driver.phone}
            </span>
          )}
        </div>
      )}

      <div className="mt-5 space-y-1.5 border-t border-border pt-4">
        {order.items.map((item: any) => {
          const freeDiscount = order.discounts?.find((d: any) => d.type === "FREE_ITEM" && d.freeProductId === item.productId);
          return (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="flex flex-col">
                <span className="flex items-center gap-1.5">
                  {item.quantity}x {item.product ? localizedName({ ...item.product, name: item.nameSnapshot }, locale) : item.nameSnapshot}
                  {freeDiscount && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success text-[10px] font-bold px-1.5 py-0.5">
                      <Gift className="h-2.5 w-2.5" /> {t("cart.free")}
                    </span>
                  )}
                </span>
                {/* The size (or any other option) the guest chose — "2x Latte" alone
                    left them unsure whether the Medium they picked was what was sent. */}
                {item.modifiers?.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {item.modifiers
                      .map((m: any) => (m.modifierOption ? localizedName({ ...m.modifierOption, name: m.nameSnapshot }, locale) : m.nameSnapshot))
                      .join(" · ")}
                  </span>
                )}
              </span>
              <span className="text-muted-foreground">{formatMoney(item.lineTotal, currency)}</span>
            </div>
          );
        })}
      </div>

      {order.discounts?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-1">
          {order.discounts.map((d: any) => (
            <div key={d.id} className="flex justify-between text-sm text-success">
              <span className="flex items-center gap-1.5">
                {d.type === "FREE_ITEM" && <Gift className="h-3.5 w-3.5" />}
                {d.type === "COMBO" && <Package className="h-3.5 w-3.5" />}
                {d.promotionId && d.type !== "FREE_ITEM" && <Sparkles className="h-3.5 w-3.5" />}
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
        </div>
      )}

      {order.payments?.some((p: any) => p.refunds?.length > 0) && (
        <div className="mt-3 pt-3 border-t border-border space-y-1">
          {order.payments.flatMap((p: any) => p.refunds).map((r: any) => (
            <div key={r.id} className="flex justify-between text-sm text-danger">
              <span className="flex items-center gap-1.5">
                <Undo2 className="h-3.5 w-3.5" /> {t("orders.refunded")}
              </span>
              <span>-{formatMoney(r.amount, currency)}</span>
            </div>
          ))}
        </div>
      )}

      {payment && (
        <OrderOnlinePayment
          order={order}
          currency={currency}
          providers={payment.providers}
          highlight={!!payment.highlightPaymentId && order.payments?.some((p: any) => p.id === payment.highlightPaymentId)}
          onChanged={payment.onChanged}
        />
      )}
    </Card>
  );
}
