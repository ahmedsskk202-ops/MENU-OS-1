"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2, ArrowLeft, Tag, X, Gift, Sparkles, Package } from "lucide-react";
import Link from "next/link";
import { useTableSession } from "@/lib/useTableSession";
import { useCartStore, cartLineTotal, cartSubtotal } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/LocaleContext";
import { createRequestId, formatApiError } from "@/lib/request-id";

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

export default function CartPage({ params }: { params: { sessionId: string } }) {
  const { t } = useLocale();
  const { data: session } = useTableSession();
  const { items, updateQuantity, removeItem, clear } = useCartStore();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Stable for the lifetime of this checkout attempt: if placeOrder fails on a flaky
  // connection and the guest taps "Place Order" again, the retry reuses the same key
  // so the server returns the original order instead of creating a duplicate.
  const [clientRequestId] = useState(() => createRequestId("table-order"));
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<OfferPreview | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  // Automatic offers (no code) — previewed via the exact same pricing path checkout
  // uses, so the server stays the sole source of truth for the amount; this is purely
  // a live display of what would apply. Re-checked whenever the cart changes.
  const [automaticOffer, setAutomaticOffer] = useState<OfferPreview | null>(null);
  const automaticCheckSeq = useRef(0);

  const currency = session?.brand.currency ?? "IQD";

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
        if (seq !== automaticCheckSeq.current) return; // a newer cart state already superseded this check
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

  // Whichever offer is actually live right now — a manually-applied code (which the
  // server already resolved against automatic candidates too, so it's always the true
  // winner), or the automatic-only preview when no code has been entered.
  const activeOffer = appliedCoupon ?? automaticOffer;

  async function placeOrder() {
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientRequestId,
          couponCode: appliedCoupon?.code,
          lines: cartLines(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(formatApiError(json.error, t("cart.genericError")));
      clear();
      // `placed` lets the orders screen confirm, in words, that this order reached the
      // kitchen — a status timeline alone left guests unsure whether it had been sent.
      router.push(`/t/${params.sessionId}/orders${json.order?.id ? `?placed=${json.order.id}` : ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("cart.genericError"));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 pt-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/t/${params.sessionId}/menu`} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <h1 className="font-display text-2xl font-semibold">{t("cart.title")}</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>{t("cart.empty")}</p>
          <Link href={`/t/${params.sessionId}/menu`} className="text-accent-ink font-semibold mt-2 inline-block">
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
                      {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5">&quot;{item.notes}&quot;</p>}
                    </div>
                    {/* 40px tap targets throughout: these are pressed with a thumb on a phone,
                        and the old 26px buttons were easy to miss (or to hit the wrong one). */}
                    <button onClick={() => removeItem(item.key)} aria-label={t("cart.remove")} className="-m-2 h-10 w-10 shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:text-danger hover:bg-muted">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 rounded-xl border border-border">
                      <button onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label={t("cart.decrease")} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label={t("cart.increase")} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-muted">
                        <Plus className="h-4 w-4" />
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
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponInput("");
                  }}
                  className="text-muted-foreground"
                >
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
                <span className="flex items-center gap-1.5">
                  {activeOffer.type === "FREE_ITEM" && <Gift className="h-3.5 w-3.5" />}
                  {activeOffer.type === "FREE_ITEM"
                    ? t("cart.freeItem", { name: activeOffer.freeProductName ?? "" })
                    : activeOffer.source === "combo"
                    ? `${activeOffer.comboDealName}${activeOffer.comboSetsApplied && activeOffer.comboSetsApplied > 1 ? ` × ${activeOffer.comboSetsApplied}` : ""}`
                    : activeOffer.source === "promotion"
                    ? activeOffer.promotionName ?? t("cart.discount")
                    : t("cart.discount")}
                </span>
                <span>-{formatMoney(activeOffer.discountTotal, currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-display font-semibold text-lg mt-2 pt-2 border-t border-border">
              <span>{t("cart.total")}</span>
              <span>{formatMoney(activeOffer ? activeOffer.total : cartSubtotal(items), currency)}</span>
            </div>
          </Card>

          {error && <p className="text-danger text-sm mt-3">{error}</p>}

          <Button size="lg" className="w-full mt-5 mb-10" onClick={placeOrder} loading={placing}>
            {t("cart.placeOrder")}
          </Button>
        </>
      )}
    </div>
  );
}
