"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Minus, Plus, Trash2, Send, X, Check } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { useBranch } from "@/lib/BranchContext";
import { enumLabel } from "@/lib/i18n-admin";
import { localizedName } from "@/lib/localized";
import { formatMoney } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { MenuResponse, ProductDTO, CategoryDTO } from "@/lib/menu-types";

type OrderType = "DINE_IN" | "PICKUP" | "DELIVERY";
interface Line { key: string; product: ProductDTO; optionIds: string[]; quantity: number; notes: string }
interface Zone { id: string; name: string; feeAmount: number }
interface TableRow { id: string; label: string }

/**
 * The cashier's till: the whole menu on screen, so an order taken at the counter (or on
 * the phone) is entered the same way a guest orders from the QR menu. Only a delivery
 * asks for a phone number — dine-in and takeaway guests are never asked for one.
 */
export default function PosPage() {
  const { t, locale } = useLocale();
  const { branchId } = useBranch();
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [category, setCategory] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [picking, setPicking] = useState<ProductDTO | null>(null);

  const [type, setType] = useState<OrderType>("DINE_IN");
  const [tableId, setTableId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/menu?branchId=${branchId}`).then((r) => (r.ok ? r.json() : null)).then(setMenu);
    fetch(`/api/delivery/zones/public?branchId=${branchId}`).then((r) => (r.ok ? r.json() : { zones: [] })).then((j) => setZones(j.zones ?? []));
    fetch(`/api/tables?branchId=${branchId}`).then((r) => (r.ok ? r.json() : { tables: [] })).then((j) => setTables(j.tables ?? []));
  }, [branchId]);

  const currency = menu?.brand.currency ?? "IQD";
  const categories: CategoryDTO[] = useMemo(() => menu?.menus.flatMap((m) => m.categories) ?? [], [menu]);
  const products = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return categories
      .filter((c) => category === "ALL" || c.id === category)
      .flatMap((c) => c.products)
      .filter((p) => !needle || [p.name, p.nameAr, p.nameEn].some((n) => n?.toLowerCase().includes(needle)));
  }, [categories, category, q]);

  function unitPrice(l: { product: ProductDTO; optionIds: string[] }) {
    const deltas = l.product.modifierGroups.flatMap((g) => g.options).filter((o) => l.optionIds.includes(o.id));
    return l.product.basePrice + deltas.reduce((s, o) => s + o.priceDelta, 0);
  }

  function addLine(product: ProductDTO, optionIds: string[]) {
    const key = `${product.id}|${[...optionIds].sort().join(",")}`;
    setLines((prev) => {
      const found = prev.find((l) => l.key === key && !l.notes);
      if (found) return prev.map((l) => (l === found ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { key: `${key}|${Date.now()}`, product, optionIds, quantity: 1, notes: "" }];
    });
    setSent(null);
  }

  function tap(product: ProductDTO) {
    if (product.availabilityStatus === "SOLD_OUT") return;
    if (product.modifierGroups.length > 0) setPicking(product);
    else addLine(product, []);
  }

  const selectedZone = zones.find((z) => z.id === zoneId);
  const subtotal = lines.reduce((s, l) => s + unitPrice(l) * l.quantity, 0);
  const deliveryFee = type === "DELIVERY" ? selectedZone?.feeAmount ?? 0 : 0;
  const deliveryOk = type !== "DELIVERY" || (customerName.trim() && phone.trim().length >= 3 && address.trim());

  function reset() {
    setLines([]);
    setTableId("");
    setCustomerName("");
    setPhone("");
    setAddress("");
    setZoneId("");
    setNotes("");
  }

  async function send() {
    if (!branchId || lines.length === 0) return;
    if (!deliveryOk) return setError(t("admin.pos.needDelivery"));
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/orders/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          type,
          tableId: type === "DINE_IN" && tableId ? tableId : undefined,
          notes: [type === "PICKUP" && customerName.trim() ? customerName.trim() : "", notes.trim()].filter(Boolean).join(" — ") || undefined,
          clientRequestId: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          lines: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity, notes: l.notes || undefined, modifierOptionIds: l.optionIds })),
          delivery: type === "DELIVERY" ? { customerName: customerName.trim(), phone: phone.trim(), address: address.trim(), zoneId: zoneId || undefined } : undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return setError(typeof json.error === "string" ? json.error : t("admin.pos.failed"));
      setSent(json.order.id.slice(-6).toUpperCase());
      reset();
    } finally {
      setSending(false);
    }
  }

  const input = "w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm";

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-display text-3xl font-semibold mb-1">{t("admin.pos.title")}</h1>
      <p className="text-sm text-muted-foreground mb-5">{t("admin.pos.intro")}</p>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px] items-start">
        {/* ── menu ── */}
        <div className="min-w-0">
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute top-2.5 start-3 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.pos.search")} className="w-full rounded-xl border border-border bg-surface-raised ps-9 pe-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {[{ id: "ALL", label: t("admin.pos.all") }, ...categories.map((c) => ({ id: c.id, label: localizedName(c, locale) }))].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn("shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap", category === c.id ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => {
              const soldOut = p.availabilityStatus === "SOLD_OUT";
              return (
                <button
                  key={p.id}
                  onClick={() => tap(p)}
                  disabled={soldOut}
                  className={cn("text-start rounded-2xl border border-border bg-surface overflow-hidden hover:border-accent transition-colors", soldOut && "opacity-50 cursor-not-allowed")}
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-24 w-full object-cover" />
                  ) : (
                    <div className="h-24 w-full bg-muted" />
                  )}
                  <div className="p-2.5">
                    <p className="text-sm font-medium leading-tight line-clamp-2">{localizedName(p, locale)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {soldOut ? t("admin.pos.unavailable") : formatMoney(p.basePrice, currency)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ticket ── */}
        <Card className="p-4 lg:sticky lg:top-20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{t("admin.pos.cart")}</h2>
            {lines.length > 0 && <Button size="sm" variant="ghost" onClick={() => setLines([])}>{t("admin.pos.clear")}</Button>}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(["DINE_IN", "PICKUP", "DELIVERY"] as const).map((k) => (
              <button key={k} onClick={() => setType(k)} className={cn("py-2 rounded-lg text-xs font-medium", type === k ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>
                {enumLabel(t, k)}
              </button>
            ))}
          </div>

          {type === "DINE_IN" && tables.length > 0 && (
            <select value={tableId} onChange={(e) => setTableId(e.target.value)} className={input} aria-label={t("admin.pos.table")}>
              <option value="">{t("admin.pos.noTable")}</option>
              {tables.map((tb) => <option key={tb.id} value={tb.id}>{tb.label}</option>)}
            </select>
          )}
          {type === "PICKUP" && (
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("admin.pos.customerName")} className={input} />
          )}
          {type === "DELIVERY" && (
            <div className="space-y-2">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("admin.pos.customerName")} className={input} />
              <input dir="ltr" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("admin.pos.phone")} className={input} />
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("admin.pos.address")} className={input} />
              {zones.length > 0 && (
                <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={input}>
                  <option value="">{t("admin.pos.noZone")}</option>
                  {zones.map((z) => <option key={z.id} value={z.id}>{z.name} — {formatMoney(z.feeAmount, currency)}</option>)}
                </select>
              )}
            </div>
          )}

          <div className="divide-y divide-border border-y border-border max-h-[45vh] overflow-y-auto">
            {lines.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t("admin.pos.empty")}</p>}
            {lines.map((l) => {
              const opts = l.product.modifierGroups.flatMap((g) => g.options).filter((o) => l.optionIds.includes(o.id));
              return (
                <div key={l.key} className="py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{localizedName(l.product, locale)}</p>
                      {opts.length > 0 && <p className="text-xs text-muted-foreground">{opts.map((o) => localizedName(o, locale)).join("، ")}</p>}
                    </div>
                    <p className="text-sm tabular-nums shrink-0">{formatMoney(unitPrice(l) * l.quantity, currency)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button aria-label="-" onClick={() => setLines((prev) => prev.map((x) => (x === l ? { ...x, quantity: x.quantity - 1 } : x)).filter((x) => x.quantity > 0))} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-6 text-center text-sm tabular-nums">{l.quantity}</span>
                    <button aria-label="+" onClick={() => setLines((prev) => prev.map((x) => (x === l ? { ...x, quantity: Math.min(50, x.quantity + 1) } : x)))} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                    <input value={l.notes} onChange={(e) => setLines((prev) => prev.map((x) => (x === l ? { ...x, notes: e.target.value } : x)))} placeholder={t("admin.pos.itemNote")} className="flex-1 min-w-0 rounded-lg border border-border bg-surface-raised px-2 py-1 text-xs" />
                    <button aria-label={t("admin.pos.clear")} onClick={() => setLines((prev) => prev.filter((x) => x !== l))} className="text-danger"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("admin.pos.notes")} className={input} />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>{t("admin.pos.subtotal")}</span><span>{formatMoney(subtotal, currency)}</span></div>
            {deliveryFee > 0 && <div className="flex justify-between text-muted-foreground"><span>{t("admin.pos.deliveryFee")}</span><span>{formatMoney(deliveryFee, currency)}</span></div>}
            <div className="flex justify-between font-display font-semibold text-lg pt-1"><span>{t("admin.pos.total")}</span><span>{formatMoney(subtotal + deliveryFee, currency)}</span></div>
          </div>

          {error && <p className="text-danger text-xs">{error}</p>}
          {sent && <p className="text-success text-sm flex items-center gap-1"><Check className="h-4 w-4" /> {t("admin.pos.sent", { n: sent })}</p>}
          <Button className="w-full" size="lg" onClick={send} loading={sending} disabled={lines.length === 0 || !deliveryOk}>
            <Send className="h-4 w-4 rtl:rotate-180" /> {t("admin.pos.send")}
          </Button>
        </Card>
      </div>

      {picking && <OptionsDialog product={picking} currency={currency} onClose={() => setPicking(null)} onAdd={(ids) => { addLine(picking, ids); setPicking(null); }} />}
    </div>
  );
}

/** Size / add-ons for one item. Defaults are pre-selected; required groups must be filled. */
function OptionsDialog({ product, currency, onClose, onAdd }: { product: ProductDTO; currency: string; onClose: () => void; onAdd: (optionIds: string[]) => void }) {
  const { t, locale } = useLocale();
  const [picked, setPicked] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(product.modifierGroups.map((g) => [g.id, g.options.filter((o) => o.isDefault).map((o) => o.id).slice(0, g.maxSelect)]))
  );

  function toggle(groupId: string, optionId: string, max: number) {
    setPicked((prev) => {
      const cur = prev[groupId] ?? [];
      if (cur.includes(optionId)) return { ...prev, [groupId]: cur.filter((x) => x !== optionId) };
      if (max <= 1) return { ...prev, [groupId]: [optionId] };
      if (cur.length >= max) return prev;
      return { ...prev, [groupId]: [...cur, optionId] };
    });
  }

  const ok = product.modifierGroups.every((g) => (picked[g.id]?.length ?? 0) >= Math.max(g.minSelect, g.isRequired ? 1 : 0));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold">{localizedName(product, locale)}</p>
            <p className="text-xs text-muted-foreground">{t("admin.pos.options")}</p>
          </div>
          <button onClick={onClose} aria-label={t("admin.common.cancel")}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          {product.modifierGroups.map((g) => (
            <div key={g.id}>
              <p className="text-sm font-medium mb-1.5 flex items-center gap-2">
                {localizedName(g, locale)}
                {(g.isRequired || g.minSelect > 0) && <Badge tone="warning">{t("admin.pos.required")}</Badge>}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.options.map((o) => {
                  const on = picked[g.id]?.includes(o.id);
                  const out = o.stockStatus === "SOLD_OUT";
                  return (
                    <button
                      key={o.id}
                      disabled={out}
                      onClick={() => toggle(g.id, o.id, g.maxSelect)}
                      className={cn("px-3 py-1.5 rounded-lg text-sm border", on ? "border-accent bg-accent/15 text-accent-ink" : "border-border bg-surface-raised", out && "opacity-40")}
                    >
                      {localizedName(o, locale)}
                      {o.priceDelta ? ` +${formatMoney(o.priceDelta, currency)}` : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-5" disabled={!ok} onClick={() => onAdd(Object.values(picked).flat())}>{t("admin.pos.add")}</Button>
      </Card>
    </div>
  );
}
