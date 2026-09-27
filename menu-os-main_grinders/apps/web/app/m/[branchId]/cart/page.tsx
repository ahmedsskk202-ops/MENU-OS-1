"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, Trash2, ArrowLeft, Tag, X, Gift, Sparkles, Package } from "lucide-react";
import Link from "next/link";
import { useGuestMenu } from "@/lib/useGuestMenu";
import { useCartStore, cartLineTotal, cartSubtotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/LocaleContext";
import { createRequestId, formatApiError } from "@/lib/request-id";
import { PaymentMethodPicker, startOnlinePayment, useOnlineProviders, type PayChoice } from "@/components/customer/OnlinePayment";

interface OfferPreview {
  source: "coupon" | "promotion" | "combo";
  code?: string;
  type?: string | null;
  promotionName?: string | null;
  comboDealName?: string | null;
  comboSetsApplied?: number | null;
  discountTotal: number;
  total: number;
  freeProductId?: string | null;
  freeProductName?: string | null;
}

interface DeliveryZone {
  id: string;
  name: string;
  feeAmount: number;
  minOrderAmount: number;
  estimatedMinutes: number;
}

export default function GuestCartPage({ params }: { params: { branchId: string } }) {
  const { t, locale } = useLocale();
  const { menu } = useGuestMenu(params.branchId);
  const { items, updateQuantity, removeItem, clear } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderType] = useState<"PICKUP" | "DELIVERY">(searchParams?.get("type") === "DELIVERY" ? "DELIVERY" : "PICKUP");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientRequestId] = useState(() => createRequestId("guest-order"));
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<OfferPreview | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [automaticOffer, setAutomaticOffer] = useState<OfferPreview | null>(null);
  const automaticCheckSeq = useRef(0);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  // Online methods appear only when the server has a provider configured.
  const providers = useOnlineProviders();
  const [payWith, setPayWith] = useState<PayChoice>("CASH");

  // Establish a guest identity up front so the automatic-offer preview below has a
  // session to price against before the first order is actually placed.
  useEffect(() => {
    fetch("/api/guest-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId: params.branchId }),
    });
  }, [params.branchId]);

  useEffect(() => {
    if (orderType !== "DELIVERY") return;
    fetch(`/api/delivery/zones/public?branchId=${params.branchId}`)
      .then((r) => r.json())
      .then((json) => setZones(json.zones ?? []));
  }, [orderType, params.branchId]);

  const currency = menu?.brand.currency ?? "IQD";

  function cartLines() {
    return items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      notes: i.notes,
      modifierOptionIds: i.modifiers.map((m) => m.optionId),
    }));
  }

  useEffect(() => {
    if (appliedCoupon || items.length === 0) {
      setAutomaticOffer(null);
      return;
    }
    const seq = ++automaticCheckSeq.current;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: cartLines() }),
        });
        const json = await res.json();
        if (seq !== automaticCheckSeq.current) return;
        if (res.ok && json.valid && json.source) {
          setAutomaticOffer({
            source: json.source,
            type: json.type,
            promotionName: json.promotionName,
            comboDealName: json.comboDealName,
            comboSetsApplied: json.comboSetsApplied,
            discountTotal: json.discountTotal,
            total: json.total,
            freeProductId: json.freeProductId,
            freeProductName: json.freeProductName,
          });
        } else {
          setAutomaticOffer(null);
        }
      } catch {
        if (seq === automaticCheckSeq.current) setAutomaticOffer(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items.map((i) => [i.productId, i.quantity, i.modifiers.map((m) => m.optionId)])), appliedCoupon]);

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), lines: cartLines() }),
      });
      const json = await res.json();
      if (!res.ok || !json.valid) throw new Error(json.error ?? t("cart.invalidCode"));
      setAppliedCoupon({
        source: json.source ?? "coupon",
        code: couponInput.trim().toUpperCase(),
        type: json.type,
        promotionName: json.promotionName,
        comboDealName: json.comboDealName,
        comboSetsApplied: json.comboSetsApplied,
        discountTotal: json.discountTotal,
        total: json.total,
        freeProductId: json.freeProductId,
        freeProductName: json.freeProductName,
      });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Invalid discount code");
    } finally {
      setCheckingCoupon(false);
    }
  }

  const activeOffer = appliedCoupon ?? automaticOffer;
  const selectedZone = zones.find((z) => z.id === zoneId);
  const deliveryFee = orderType === "DELIVERY" ? selectedZone?.feeAmount ?? 0 : 0;
  const grandTotal = (activeOffer ? activeOffer.total : cartSubtotal(items)) + deliveryFee;

  const canPlace = customerName.trim() && (orderType === "PICKUP" || (phone.trim() && address.trim()));

  async function placeOrder() {
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: params.branchId,
          type: orderType,
          customerName,
          phone: orderType === "DELIVERY" ? phone : undefined,
          clientRequestId,
          couponCode: appliedCoupon?.code,
          lines: cartLines(),
          delivery: orderType === "DELIVERY" ? { address, zoneId: zoneId || undefined } : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(formatApiError(json.error, t("guest.genericError")));
      clear();
      if (payWith !== "CASH") {
        // The order exists now; payment is a separate step the guest can retry from their
        // orders if it can't be opened. On success the browser goes to the provider.
        const message = await startOnlinePayment(json.order.id, payWith, locale, t);
        router.push(`/m/${params.branchId}/orders?payment_error=${encodeURIComponent(message ? "START" : "")}`);
        return;
      }
      router.push(`/m/${params.branchId}/orders`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("guest.genericError"));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/m/${params.branchId}`} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">{t("cart.title")}</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>{t("cart.empty")}</p>
          <Link href={`/m/${params.branchId}`} className="text-accent-ink font-semibold mt-2 inline-block">
            {t("cart.browseMenu")}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => {
              const isFreeItemLine = activeOffer?.type === "FREE_ITEM" && activeOffer.freeProductId === item.productId;
              const unitPrice = cartLineTotal(item) / item.quantity;
              return (
                <Card key={item.key} className={isFreeItemLine ? "p-4 border-success/40" : "p-4"}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-1.5">
                        {item.name}
                        {isFreeItemLine && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success text-[10px] font-bold px-2 py-0.5">
                            <Gift className="h-3 w-3" /> {t("cart.free")}
                          </span>
                        )}
                      </p>
                      {item.modifiers.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.modifiers.map((m) => m.name).join(", ")}</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-muted-foreground hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 rounded-xl border border-border px-2">
                      <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-1.5">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-1.5">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {isFreeItemLine ? (
                      <div className="text-end">
                        <p className="text-xs text-muted-foreground line-through">{formatMoney(cartLineTotal(item), currency)}</p>
                        <p className="font-display font-semibold text-success">{formatMoney(cartLineTotal(item) - unitPrice, currency)}</p>
                      </div>
                    ) : (
                      <span className="font-display font-semibold">{formatMoney(cartLineTotal(item), currency)}</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-5 mt-6">
            {appliedCoupon ? (
              <div className="flex items-center justify-between mb-3 rounded-lg bg-success/10 px-3 py-2">
                <span className="text-sm font-medium flex items-center gap-1.5 text-success">
                  <Tag className="h-3.5 w-3.5" /> {t("cart.codeApplied", { code: appliedCoupon.code ?? "" })}
                </span>
                <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : automaticOffer ? (
              <div className="flex items-center gap-1.5 mb-3 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
                {automaticOffer.source === "combo" ? <Package className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                {t("cart.appliedAutomatically", { name: (automaticOffer.source === "combo" ? automaticOffer.comboDealName : automaticOffer.promotionName) ?? "" })}
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("cart.discountCode")}
                  className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
                />
                <Button size="sm" variant="outline" onClick={applyCoupon} loading={checkingCoupon} disabled={!couponInput.trim()}>
                  {t("cart.apply")}
                </Button>
              </div>
            )}
            {couponError && <p className="text-danger text-xs mb-3">{couponError}</p>}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{t("cart.subtotal")}</span>
              <span>{formatMoney(cartSubtotal(items), currency)}</span>
            </div>
            {activeOffer && activeOffer.discountTotal > 0 && (
              <div className="flex items-center justify-between text-sm text-success mt-1">
                <span>{t("cart.discount")}</span>
                <span>-{formatMoney(activeOffer.discountTotal, currency)}</span>
              </div>
            )}
            {orderType === "DELIVERY" && deliveryFee > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                <span>{t("guest.deliveryFee")}</span>
                <span>{formatMoney(deliveryFee, currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-display font-semibold text-lg mt-2 pt-2 border-t border-border">
              <span>{t("cart.total")}</span>
              <span>{formatMoney(grandTotal, currency)}</span>
            </div>
          </Card>

          <Card className="p-5 mt-4 space-y-3">
            <h3 className="font-semibold text-sm">{t("guest.checkoutTitle")}</h3>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("guest.name")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
            {orderType === "DELIVERY" && (
              <>
                <input dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("guest.phone")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("guest.address")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
                {zones.length > 0 && (
                  <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
                    <option value="">{t("guest.noZone")}</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.name} — {formatMoney(z.feeAmount, currency)}</option>
                    ))}
                  </select>
                )}
              </>
            )}
            {providers.length > 0 && (
              <PaymentMethodPicker
                value={payWith}
                onChange={setPayWith}
                providers={providers}
                cashLabel={t("guest.payNote", { mode: orderType === "PICKUP" ? t("guest.payNoteOnPickup") : t("guest.payNoteOnDelivery") })}
              />
            )}
            {payWith === "CASH" ? (
              <p className="text-xs text-muted-foreground">
                {t("guest.payNote", { mode: orderType === "PICKUP" ? t("guest.payNoteOnPickup") : t("guest.payNoteOnDelivery") })}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{t("pay.redirectNote")}</p>
            )}
          </Card>

          {error && <p className="text-danger text-sm mt-3">{error}</p>}

          <Button size="lg" className="w-full mt-5 mb-10" onClick={placeOrder} loading={placing} disabled={!canPlace}>
            {payWith === "CASH" ? t("guest.placeOrder") : t("pay.placeAndPay", { amount: formatMoney(grandTotal, currency) })}
          </Button>
        </>
      )}
    </div>
  );
}
