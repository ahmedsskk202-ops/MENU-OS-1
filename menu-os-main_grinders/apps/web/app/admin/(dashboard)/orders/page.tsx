"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { ReceiptPrint } from "@/components/customer/ReceiptPrint";
import { useSession } from "next-auth/react";
import { PERMISSIONS } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth";

const NEXT_ACTION: Record<string, { label: string; next: string }> = {
  CREATED: { label: "admin.orders.action.confirm", next: "CONFIRMED" },
  CONFIRMED: { label: "admin.orders.action.startPreparing", next: "PREPARING" },
  PREPARING: { label: "admin.orders.action.markReady", next: "READY" },
  READY: { label: "admin.orders.action.markDelivered", next: "DELIVERED" },
  // No DELIVERED → PAID shortcut: an order becomes paid by recording its payment (the
  // "Record payment" button), never by flipping the status — a status-only "paid" showed
  // as revenue with no cash behind it and printed a receipt still saying the full amount due.
  PAID: { label: "admin.orders.action.close", next: "CLOSED" },
};

const TONE: Record<string, "neutral" | "accent" | "success" | "warning"> = {
  CREATED: "neutral",
  CONFIRMED: "accent",
  PREPARING: "warning",
  READY: "success",
  DELIVERED: "success",
  PAID: "success",
  CLOSED: "neutral",
};

export default function OrdersAdminPage() {
  const { branchId, currentBranch } = useBranch();
  const [orders, setOrders] = useState<any[]>([]);
  const [refundTarget, setRefundTarget] = useState<{ paymentId: string; max: number } | null>(null);
  const [discountTarget, setDiscountTarget] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<string | null>(null);
  // A rejected action (a permission the role lacks, an order that moved on in another
  // tab) used to fail silently, which reads as a button that does nothing.
  const [actionError, setActionError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const { t } = useLocale();
  const { data: session } = useSession();
  const permissions = new Set((session?.user as SessionUser | undefined)?.permissions ?? []);
  const canRefund = permissions.has(PERMISSIONS.REFUNDS_MANAGE);
  const canTakePayment = permissions.has(PERMISSIONS.PAYMENTS_MANAGE);
  const canDiscount = permissions.has(PERMISSIONS.DISCOUNTS_APPLY);

  async function reportFailure(res: Response) {
    if (res.ok) return false;
    const body = await res.json().catch(() => ({}));
    setActionError(typeof body.error === "string" ? body.error : t("admin.orders.actionFailed"));
    return true;
  }

  async function refresh() {
    if (!branchId) return;
    const res = await fetch(`/api/orders?branchId=${branchId}`);
    if (res.ok) setOrders((await res.json()).orders);
  }

  useEffect(() => {
    refresh();
  }, [branchId]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (["order.created", "order.status_changed", "payment.updated"].includes(event.type)) refresh();
  });

  async function advance(orderId: string, status: string) {
    setActionError(null);
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await reportFailure(res);
    refresh();
  }

  async function recordPayment(orderId: string, method: string, amount: number) {
    setActionError(null);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, method, amount }),
    });
    if (await reportFailure(res)) return;
    setPaymentTarget(null);
    refresh();
  }

  async function submitRefund(reason: string) {
    if (!refundTarget) return;
    setActionError(null);
    const res = await fetch("/api/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: refundTarget.paymentId, amount: refundTarget.max, reason }),
    });
    if (await reportFailure(res)) return;
    setRefundTarget(null);
    refresh();
  }

  async function submitDiscount(orderId: string, type: "PERCENTAGE" | "FIXED" | "FREE_ITEM", value: number | null, productId: string | null, reason: string) {
    setDiscountError(null);
    const res = await fetch(`/api/orders/${orderId}/discount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, value: value ?? undefined, productId: productId ?? undefined, reason }),
    });
    const json = await res.json();
    if (!res.ok) {
      setDiscountError(json.error);
      return;
    }
    setDiscountTarget(null);
    refresh();
  }

  const active = orders.filter((o) => !["CLOSED", "CANCELLED"].includes(o.status));

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-3xl font-semibold mb-8">{t("admin.orders.title")}</h1>
      {actionError && (
        <div role="alert" className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger flex items-center justify-between gap-3">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-semibold">{t("admin.common.dismiss")}</button>
        </div>
      )}

      <div className="space-y-4">
        {active.map((order) => {
          const action = NEXT_ACTION[order.status];
          const paid = order.payments.filter((p: any) => p.status === "VERIFIED").reduce((s: number, p: any) => s + parseFloat(p.amount), 0);
          const due = parseFloat(order.total) - paid;

          return (
            <Card key={order.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                {/* Where the order is going leads; the order number is reference detail. */}
                <div>
                  <p className="font-display text-xl font-semibold leading-tight">
                    {order.tableSession ? t("admin.common.table", { label: order.tableSession.table.label }) : enumLabel(t, order.type)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">#{order.id.slice(-6).toUpperCase()}</p>
                </div>
                <Badge tone={TONE[order.status]}>{enumLabel(t, order.status)}</Badge>
              </div>

              <div className="text-sm space-y-1 mb-3">
                {order.items.map((item: any) => {
                  const freeDiscount = order.discounts?.find((d: any) => d.type === "FREE_ITEM" && d.freeProductId === item.productId);
                  return (
                    <div key={item.id} className="flex justify-between text-muted-foreground">
                      <span>
                        {item.quantity}x {item.nameSnapshot}
                        {item.modifiers?.length > 0 && (
                          <span className="text-xs ms-1.5">({item.modifiers.map((m: any) => m.nameSnapshot).join(", ")})</span>
                        )}
                        {freeDiscount && <Badge tone="success" className="ms-1.5">{t("admin.orders.free1")}</Badge>}
                      </span>
                      <span>{formatMoney(item.lineTotal, currentBranch?.currency)}</span>
                    </div>
                  );
                })}
                {order.discounts?.map((d: any) => (
                  <div key={d.id} className="flex justify-between text-success">
                    <span>
                      {d.type === "FREE_ITEM"
                        ? t("admin.orders.freeLine", { name: d.freeProductName })
                        : d.type === "COMBO"
                        ? t("admin.orders.comboLine", { reason: d.reason })
                        : d.promotionId
                        ? t("admin.orders.promoLine", { reason: d.reason ?? enumLabel(t, d.type) })
                        : t("admin.orders.discountLine", { reason: d.reason ?? enumLabel(t, d.type) })}
                    </span>
                    <span>-{formatMoney(d.amountApplied, currentBranch?.currency)}</span>
                  </div>
                ))}
                {(order.payments?.length > 1 || order.payments?.some((p: any) => p.provider)) &&
                  order.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between text-muted-foreground" data-payment-row={p.id}>
                      <span>
                        {t("admin.orders.paymentLine", { method: p.provider ? t(`pay.method.${p.provider}`) : enumLabel(t, p.method) })}
                        {p.status !== "VERIFIED" && <Badge tone="warning" className="ms-1.5">{enumLabel(t, p.status)}</Badge>}
                        {/* Online payments: the provider's reference, to look up in its portal. */}
                        {p.provider && p.gatewayRef && <span className="text-xs ms-1.5">{t("admin.orders.onlineRef", { ref: p.gatewayRef })}</span>}
                        {p.status === "FAILED" && p.failureReason && <span className="text-xs ms-1.5">{t("admin.orders.onlineFailed", { reason: enumLabel(t, p.failureReason) })}</span>}
                      </span>
                      <span>{formatMoney(p.amount, currentBranch?.currency)}</span>
                    </div>
                  ))}
                {order.payments?.flatMap((p: any) => p.refunds ?? []).map((r: any) => (
                  <div key={r.id} className="flex justify-between text-danger">
                    <span>{t("admin.orders.refundedLine", { reason: r.reason })}</span>
                    <span>-{formatMoney(r.amount, currentBranch?.currency)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-display font-semibold">{formatMoney(order.total, currentBranch?.currency)}</span>
                <div className="flex gap-2">
                  {canTakePayment && due > 0.01 && order.status !== "CREATED" && (
                    <Button size="sm" variant="outline" onClick={() => setPaymentTarget(order.id)}>
                      {t("admin.orders.recordPaymentDue", { amount: formatMoney(due, currentBranch?.currency) })}
                    </Button>
                  )}
                  {action && (
                    <Button size="sm" onClick={() => advance(order.id, action.next)}>
                      {t(action.label)}
                    </Button>
                  )}
                  {canDiscount && !["PAID", "CLOSED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(order.status) && order.discounts?.length === 0 && (
                    <Button size="sm" variant="outline" onClick={() => setDiscountTarget(order.id)}>
                      {t("admin.orders.discount")}
                    </Button>
                  )}
                  <ReceiptPrint
                    label={t("bill.printReceipt")}
                    icon={<Printer className="h-4 w-4" />}
                    className="h-9 px-3 text-sm"
                    receipt={buildReceipt(order, currentBranch?.currency, t)}
                  />
                  {canRefund &&
                    ["PAID", "CLOSED"].includes(order.status) &&
                    order.payments
                      .filter((p: any) => p.status === "VERIFIED" || p.status === "PARTIALLY_REFUNDED")
                      .map((p: any) => {
                        const refunded = (p.refunds ?? []).filter((r: any) => r.status === "COMPLETED").reduce((s: number, r: any) => s + parseFloat(r.amount), 0);
                        const refundable = parseFloat(p.amount) - refunded;
                        return refundable > 0.01 ? (
                          <Button key={p.id} size="sm" variant="outline" className="text-danger border-danger/30" onClick={() => setRefundTarget({ paymentId: p.id, max: refundable })}>
                            {t("admin.orders.refund", { amount: order.payments.length > 1 ? formatMoney(refundable, currentBranch?.currency) : "" }).trim()}
                          </Button>
                        ) : null;
                      })}
                  {/* Two steps: cancelling sits next to Print, and one stray tap used to
                      cancel a guest's order outright. */}
                  {!["PAID", "CLOSED"].includes(order.status) &&
                    (cancelTarget === order.id ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-xs text-danger font-semibold">{t("admin.orders.cancelConfirm")}</span>
                        <Button size="sm" variant="danger" onClick={() => { setCancelTarget(null); advance(order.id, "CANCELLED"); }}>
                          {t("admin.orders.cancelYes")}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setCancelTarget(null)}>
                          {t("admin.orders.cancelNo")}
                        </Button>
                      </span>
                    ) : (
                      <Button size="sm" variant="ghost" className="text-danger" onClick={() => setCancelTarget(order.id)}>
                        {t("admin.orders.cancelOrder")}
                      </Button>
                    ))}
                </div>
              </div>

              {order.payments.some((p: any) => p.id === refundTarget?.paymentId) && (
                <RefundForm max={refundTarget!.max} currency={currentBranch?.currency} onCancel={() => setRefundTarget(null)} onSubmit={submitRefund} />
              )}

              {paymentTarget === order.id && (
                <PaymentForm due={due} currency={currentBranch?.currency} onCancel={() => setPaymentTarget(null)} onSubmit={(amount) => recordPayment(order.id, "CASH", amount)} />
              )}

              {discountTarget === order.id && (
                <DiscountForm
                  items={order.items}
                  error={discountError}
                  onCancel={() => {
                    setDiscountTarget(null);
                    setDiscountError(null);
                  }}
                  onSubmit={(type, value, productId, reason) => submitDiscount(order.id, type, value, productId, reason)}
                />
              )}
            </Card>
          );
        })}
        {active.length === 0 && <p className="text-muted-foreground">{t("admin.orders.empty")}</p>}
      </div>
    </div>
  );
}

/**
 * Assembles the printed slip from an order row the Orders screen already has in hand.
 *
 * Kept as a function rather than inline JSX so the arithmetic that matters — what the
 * guest still owes, and which payments count toward it — is written once. Only
 * VERIFIED payments count: a card payment still awaiting gateway confirmation has not
 * been paid, and printing "Paid 0 / Due 32,000" on a slip the guest takes home is how a
 * cafe ends up arguing with a customer at the door.
 */
function buildReceipt(order: any, currency: string | undefined, t: (key: string, params?: Record<string, string | number>) => string) {
  const subtotal = parseFloat(order.subtotal);
  const discountTotal = order.discounts?.reduce((s: number, d: any) => s + parseFloat(d.amountApplied), 0) ?? 0;
  const total = parseFloat(order.total);
  const paid = order.payments
    .filter((p: any) => p.status === "VERIFIED")
    .reduce((s: number, p: any) => s + parseFloat(p.amount), 0);
  const branch = order.tableSession?.table?.branch;

  return {
    brandName: branch?.brand?.name ?? "",
    branchName: branch?.name ?? "",
    address: branch?.address ?? undefined,
    phone: branch?.phone ?? undefined,
    // The one line a cafe slip cannot be missing: the guest is standing at the table
    // and the runner needs to know where it is going.
    tableLabel: order.tableSession?.table?.label ?? undefined,
    orderNumber: order.id.slice(-6).toUpperCase(),
    issuedAt: new Date().toISOString(),
    currency: currency ?? "IQD",
    items: order.items.map((i: any) => ({
      name: i.nameSnapshot,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
      modifiers: (i.modifiers ?? []).map((m: any) => m.nameSnapshot),
    })),
    discounts: (order.discounts ?? []).map((d: any) => ({ reason: d.reason ?? enumLabel(t, d.type), amount: d.amountApplied })),
    subtotal,
    discountTotal,
    taxTotal: parseFloat(order.taxTotal ?? 0),
    serviceFeeTotal: parseFloat(order.serviceFeeTotal ?? 0),
    total,
    paid,
    due: Math.max(0, total - paid),
    payments: order.payments.map((p: any) => ({ method: p.method, amount: p.amount, tipAmount: p.tipAmount })),
  };
}

function DiscountForm({
  items,
  error,
  onCancel,
  onSubmit,
}: {
  items: any[];
  error: string | null;
  onCancel: () => void;
  onSubmit: (type: "PERCENTAGE" | "FIXED" | "FREE_ITEM", value: number | null, productId: string | null, reason: string) => void;
}) {
  const [type, setType] = useState<"PERCENTAGE" | "FIXED" | "FREE_ITEM">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [productId, setProductId] = useState(items[0]?.productId ?? "");
  const [reason, setReason] = useState("");
  const { t } = useLocale();

  const canSubmit = type === "FREE_ITEM" ? !!productId && reason.trim() : !!value && reason.trim();

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <p className="text-xs text-muted-foreground">{t("admin.orders.discountHint")}</p>
      <div className="flex gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED" | "FREE_ITEM")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="PERCENTAGE">{t("admin.orders.type.percentage")}</option>
          <option value="FIXED">{t("admin.orders.type.fixed")}</option>
          <option value="FREE_ITEM">{t("admin.orders.type.free")}</option>
        </select>
        {type === "FREE_ITEM" ? (
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
            {items.map((i) => (
              <option key={i.id} value={i.productId}>
                {i.nameSnapshot}
              </option>
            ))}
          </select>
        ) : (
          <input value={value} onChange={(e) => setValue(e.target.value)} type="number" placeholder={t("admin.orders.value")} className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        )}
      </div>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("admin.orders.reason")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" disabled={!canSubmit} onClick={() => onSubmit(type, type === "FREE_ITEM" ? null : parseFloat(value), type === "FREE_ITEM" ? productId : null, reason)}>
          {t("admin.orders.applyDiscount")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t("admin.common.cancel")}
        </Button>
      </div>
    </div>
  );
}

function PaymentForm({ due, currency, onCancel, onSubmit }: { due: number; currency?: string; onCancel: () => void; onSubmit: (amount: number) => void }) {
  const [amount, setAmount] = useState(String(Math.round(due)));
  const parsed = parseFloat(amount);
  const canSubmit = amount.trim() !== "" && parsed > 0 && parsed <= due + 0.01;
  const { t } = useLocale();

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <p className="text-xs text-muted-foreground">
        {t("admin.orders.paymentHint")}
      </p>
      <div className="flex gap-2">
        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder={t("admin.orders.amount")} className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <Button size="sm" variant="outline" onClick={() => setAmount(String(Math.round(due)))}>
          {t("admin.orders.full", { amount: formatMoney(due, currency) })}
        </Button>
      </div>
      {!canSubmit && amount.trim() !== "" && <p className="text-danger text-xs">{t("admin.orders.amountRange", { amount: formatMoney(due, currency) })}</p>}
      <div className="flex gap-2">
        <Button size="sm" disabled={!canSubmit} onClick={() => onSubmit(parsed)}>
          {t("admin.orders.record", { amount: canSubmit ? formatMoney(parsed, currency) : "" }).trim()}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t("admin.common.cancel")}
        </Button>
      </div>
    </div>
  );
}

function RefundForm({ max, currency, onCancel, onSubmit }: { max: number; currency?: string; onCancel: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const { t } = useLocale();
  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <p className="text-xs text-muted-foreground">{t("admin.orders.refundHint", { amount: formatMoney(max, currency) })}</p>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("admin.orders.refundReason")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <Button size="sm" variant="danger" disabled={!reason.trim()} onClick={() => onSubmit(reason)}>
          {t("admin.orders.confirmRefund")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t("admin.common.cancel")}
        </Button>
      </div>
    </div>
  );
}
