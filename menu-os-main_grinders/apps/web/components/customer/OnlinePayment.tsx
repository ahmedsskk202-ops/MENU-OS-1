"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Check, Clock, AlertCircle, X } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

export type OnlineProvider = "CARD";
export type PayChoice = "CASH" | OnlineProvider;

/** The online methods this server offers. Empty until loaded, and empty when none are configured. */
export function useOnlineProviders() {
  const [providers, setProviders] = useState<{ id: OnlineProvider; test: boolean }[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/payments/online")
      .then((r) => (r.ok ? r.json() : { providers: [] }))
      .then((json) => !cancelled && setProviders(json.providers ?? []))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return providers;
}

/**
 * Opens the provider's hosted checkout for one of the guest's orders. Only the order and
 * the method are sent; the server works out the amount. Resolves with an error message,
 * or never (the browser is navigating away).
 */
export async function startOnlinePayment(orderId: string, provider: OnlineProvider, locale: string, t: (k: string) => string): Promise<string> {
  try {
    const res = await fetch("/api/payments/online", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, provider, language: locale === "ar" ? "ar" : "en" }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.redirectUrl) return errorText(json.code, t);
    window.location.assign(json.redirectUrl);
    return new Promise<string>(() => undefined);
  } catch {
    return t("pay.error.network");
  }
}

function errorText(code: string | undefined, t: (k: string) => string) {
  const key = `pay.error.${code ?? "ERROR"}`;
  const s = t(key);
  return s === key ? t("pay.error.ERROR") : s;
}

const PROVIDER_ICON = { CARD: CreditCard } as const;

/** Checkout method choice — same chip style as the product options. */
export function PaymentMethodPicker({
  value,
  onChange,
  providers,
  cashLabel,
}: {
  value: PayChoice;
  onChange: (v: PayChoice) => void;
  providers: { id: OnlineProvider; test: boolean }[];
  cashLabel: string;
}) {
  const { t } = useLocale();
  const choices: { id: PayChoice; label: string; test?: boolean }[] = [
    { id: "CASH", label: cashLabel },
    ...providers.map((p) => ({ id: p.id, label: t(`pay.method.${p.id}`), test: p.test })),
  ];
  return (
    <div className={cn("grid gap-2", choices.length >= 3 ? "grid-cols-3" : "grid-cols-2")} role="radiogroup" aria-label={t("pay.methodTitle")}>
      {choices.map((c) => {
        const active = value === c.id;
        const Icon = c.id === "CASH" ? null : PROVIDER_ICON[c.id];
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            data-pay-method={c.id}
            onClick={() => onChange(c.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 transition-all",
              active
                ? "border-accent-ink bg-accent text-accent-foreground shadow-[0_8px_20px_-10px_hsl(var(--accent)/0.9)]"
                : "border-border bg-surface-raised hover:border-accent-ink/50"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="text-xs font-semibold leading-tight text-center">{c.label}</span>
            {c.test && <span className={cn("text-[10px] leading-none", active ? "opacity-80" : "text-muted-foreground")}>{t("pay.testMode")}</span>}
          </button>
        );
      })}
    </div>
  );
}

const CLOSED = ["PAID", "CLOSED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"];

/**
 * The payment part of an order card: pay online while something is owed, and the state
 * of the last online attempt (verified / pending / failed). Every state shown here comes
 * from the server's payment rows, never from the URL the provider sent the guest back on.
 */
export function OrderOnlinePayment({
  order,
  currency,
  providers,
  highlight,
  onChanged,
}: {
  order: any;
  currency: string;
  providers: { id: OnlineProvider; test: boolean }[];
  highlight?: boolean;
  onChanged?: () => void;
}) {
  const { t, locale } = useLocale();
  const [busy, setBusy] = useState<OnlineProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checked = useRef<string | null>(null);

  const payments: any[] = order.payments ?? [];
  const paid = payments.filter((p) => p.status === "VERIFIED").reduce((s, p) => s + parseFloat(p.amount), 0);
  const due = parseFloat(order.total) - paid;
  const online = payments.filter((p) => p.provider).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const last = online[0];

  // A payment still pending when the guest is back here (closed the provider tab, lost
  // signal on the way back…) is re-checked once with the provider, server-side.
  useEffect(() => {
    if (last?.status !== "PENDING" || checked.current === last.id) return;
    checked.current = last.id;
    fetch(`/api/payments/online/${last.id}`, { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => json?.payment?.status && json.payment.status !== "PENDING" && onChanged?.())
      .catch(() => undefined);
  }, [last?.id, last?.status, onChanged]);

  async function pay(provider: OnlineProvider) {
    if (busy) return;
    setBusy(provider);
    setError(null);
    const message = await startOnlinePayment(order.id, provider, locale, t);
    setError(message);
    setBusy(null);
  }

  const canPay = due > 0.01 && !CLOSED.includes(order.status) && providers.length > 0;
  if (!last && !canPay) return null;

  return (
    <div className={cn("mt-4 pt-4 border-t border-border space-y-3", highlight && "animate-fade-up")} data-order-payment={order.id}>
      {last?.status === "VERIFIED" && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-success" data-pay-state="VERIFIED">
          <Check className="h-4 w-4" /> {t("pay.state.verified", { amount: formatMoney(last.amount, currency), method: t(`pay.method.${last.provider}`) })}
        </p>
      )}
      {last?.status === "PENDING" && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground" data-pay-state="PENDING">
          <Clock className="h-4 w-4" /> {t("pay.state.pending")}
        </p>
      )}
      {last?.status === "FAILED" && canPay && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-danger" data-pay-state="FAILED">
          <AlertCircle className="h-4 w-4" /> {t(`pay.failed.${last.failureReason ?? "DECLINED"}`)}
        </p>
      )}
      {canPay && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("pay.payOnlineDue", { amount: formatMoney(due, currency) })}</p>
          <div className={cn("grid gap-2", providers.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {providers.map((p) => {
              const Icon = PROVIDER_ICON[p.id];
              return (
                <Button key={p.id} size="sm" variant="outline" loading={busy === p.id} disabled={!!busy} onClick={() => pay(p.id)} data-pay-provider={p.id}>
                  <Icon className="h-4 w-4" /> {t(`pay.method.${p.id}`)}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="text-danger text-xs" role="alert">{error}</p>}
    </div>
  );
}

/**
 * The result shown when the guest lands back from the provider (`?payment=<id>`). It
 * looks the payment up in the orders just loaded from the server — the URL only says
 * which payment to talk about, never how it went.
 */
export function PaymentResultBanner({ paymentId, orders, currency, onClose }: { paymentId: string | null; orders: any[]; currency: string; onClose: () => void }) {
  const { t } = useLocale();
  if (!paymentId) return null;
  const payment = orders.flatMap((o) => o.payments ?? []).find((p: any) => p.id === paymentId);
  if (!payment) return null;

  const tone =
    payment.status === "VERIFIED"
      ? { box: "border-success/30 bg-success/10", icon: <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />, title: t("pay.result.success") }
      : payment.status === "PENDING"
      ? { box: "border-border bg-surface-raised", icon: <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />, title: t("pay.result.pending") }
      : { box: "border-danger/30 bg-danger/10", icon: <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />, title: t(`pay.failed.${payment.failureReason ?? "DECLINED"}`) };

  return (
    <div role="status" data-pay-result={payment.status} className={cn("mb-5 flex items-start gap-3 rounded-2xl border p-4 animate-fade-up", tone.box)}>
      {tone.icon}
      <div className="flex-1">
        <p className="font-semibold">{tone.title}</p>
        <p className="text-sm text-muted-foreground">
          {t("pay.result.body", { amount: formatMoney(payment.amount, currency), method: t(`pay.method.${payment.provider}`) })}
        </p>
      </div>
      <button onClick={onClose} aria-label={t("common.close")} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
