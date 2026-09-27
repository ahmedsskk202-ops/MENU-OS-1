"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import { Plus, Truck, MapPin, Bike } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

const STATUS_TONE: Record<string, "warning" | "accent" | "success" | "neutral" | "danger"> = {
  NEW: "warning",
  CONFIRMED: "accent",
  PREPARING: "accent",
  READY: "accent",
  ASSIGNED: "accent",
  OUT_FOR_DELIVERY: "accent",
  DELIVERED: "success",
  FAILED: "danger",
};
const NEXT_STATUS: Record<string, string | null> = {
  NEW: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "ASSIGNED",
  ASSIGNED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
  DELIVERED: null,
  FAILED: null,
};

export default function DeliveryPage() {
  const { branchId } = useBranch();
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const { t } = useLocale();

  async function refresh() {
    if (!branchId) return;
    const [ordersRes, driversRes, zonesRes] = await Promise.all([
      fetch(`/api/delivery/orders?branchId=${branchId}`),
      fetch(`/api/delivery/drivers?branchId=${branchId}`),
      fetch(`/api/delivery/zones?branchId=${branchId}`),
    ]);
    if (ordersRes.ok) setOrders((await ordersRes.json()).deliveryOrders);
    if (driversRes.ok) setDrivers((await driversRes.json()).drivers);
    if (zonesRes.ok) setZones((await zonesRes.json()).zones);
  }

  useEffect(() => {
    refresh();
  }, [branchId]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (["delivery_order.updated", "order.created", "order.status_changed"].includes(event.type)) refresh();
  });

  async function assignDriver(id: string, driverId: string) {
    await fetch(`/api/delivery/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ driverId, status: "ASSIGNED" }) });
  }
  async function advance(id: string, status: string) {
    await fetch(`/api/delivery/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }
  async function toggleDriver(id: string, status: string) {
    await fetch(`/api/delivery/drivers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: status === "ONLINE" ? "OFFLINE" : "ONLINE" }) });
    refresh();
  }

  const active = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "FAILED");
  const done = orders.filter((o) => o.status === "DELIVERED" || o.status === "FAILED");

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">{t("admin.delivery.title")}</h1>
        <Button onClick={() => setShowOrderForm(true)}>
          <Plus className="h-4 w-4" /> {t("admin.delivery.newOrder")}
        </Button>
      </div>

      {showOrderForm && branchId && (
        <NewDeliveryOrderForm branchId={branchId} zones={zones} onClose={() => setShowOrderForm(false)} onDone={() => { setShowOrderForm(false); refresh(); }} />
      )}

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2">
          <h2 className="font-semibold text-sm text-muted-foreground mb-3">{t("admin.delivery.active")}</h2>
          <div className="space-y-2">
            {active.map((o) => (
              <Card key={o.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{o.customerName}</span>
                    <Badge tone={STATUS_TONE[o.status]}>{enumLabel(t, o.status)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5"><span dir="ltr">{o.phone}</span> · {o.address}{o.zone ? ` (${o.zone.name})` : ""}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("admin.delivery.orderStatus", { amount: formatMoney(o.order.total, "IQD"), status: enumLabel(t, o.order.status) })}</p>
                </div>
                <div className="flex items-center gap-2">
                  {o.status === "READY" && (
                    <select
                      className="rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs"
                      defaultValue=""
                      onChange={(e) => e.target.value && assignDriver(o.id, e.target.value)}
                    >
                      <option value="" disabled>{t("admin.delivery.assignDriver")}</option>
                      {drivers.filter((d) => d.status === "ONLINE").map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  )}
                  {o.driver && <span className="text-xs text-muted-foreground flex items-center gap-1"><Bike className="h-3 w-3" /> {o.driver.name}</span>}
                  {NEXT_STATUS[o.status] && o.status !== "READY" && (
                    <Button size="sm" variant="outline" onClick={() => advance(o.id, NEXT_STATUS[o.status]!)}>
                      {t("admin.delivery.mark", { status: enumLabel(t, NEXT_STATUS[o.status]!) })}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            {active.length === 0 && <p className="text-muted-foreground text-sm">{t("admin.delivery.empty")}</p>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-muted-foreground">{t("admin.delivery.drivers")}</h2>
            <button onClick={() => setShowDriverForm((v) => !v)} className="text-xs text-accent-ink font-medium whitespace-nowrap">{t("admin.delivery.addShort")}</button>
          </div>
          {showDriverForm && branchId && <NewDriverForm branchId={branchId} onDone={() => { setShowDriverForm(false); refresh(); }} />}
          <div className="space-y-2">
            {drivers.map((d) => (
              <Card key={d.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground"><span dir="ltr">{d.phone}</span>{d.deliveryOrders?.length ? t("admin.delivery.activeCount", { n: d.deliveryOrders.length }) : ""}</p>
                </div>
                <button onClick={() => toggleDriver(d.id, d.status)}>
                  <Badge tone={d.status === "ONLINE" ? "success" : "neutral"}>{enumLabel(t, d.status)}</Badge>
                </button>
              </Card>
            ))}
            {drivers.length === 0 && <p className="text-xs text-muted-foreground">{t("admin.delivery.noDrivers")}</p>}
          </div>

          <div className="flex items-center justify-between mb-3 mt-6">
            <h2 className="font-semibold text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {t("admin.delivery.zones")}</h2>
            <button onClick={() => setShowZoneForm((v) => !v)} className="text-xs text-accent-ink font-medium whitespace-nowrap">{t("admin.delivery.addShort")}</button>
          </div>
          {showZoneForm && branchId && <NewZoneForm branchId={branchId} onDone={() => { setShowZoneForm(false); refresh(); }} />}
          <div className="space-y-2">
            {zones.map((z) => (
              <Card key={z.id} className="p-3">
                <p className="text-sm font-medium">{z.name}</p>
                <p className="text-xs text-muted-foreground">{t("admin.delivery.zoneLine", { amount: formatMoney(z.feeAmount, "IQD"), n: z.estimatedMinutes })}</p>
              </Card>
            ))}
            {zones.length === 0 && <p className="text-xs text-muted-foreground">{t("admin.delivery.noZones")}</p>}
          </div>
        </div>
      </div>

      {done.length > 0 && (
        <>
          <h2 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> {t("admin.delivery.completed")}</h2>
          <div className="space-y-2">
            {done.slice(0, 15).map((o) => (
              <Card key={o.id} className="p-3 flex items-center justify-between opacity-70">
                <span className="text-sm">{o.customerName}</span>
                <Badge tone={STATUS_TONE[o.status]}>{enumLabel(t, o.status)}</Badge>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NewDriverForm({ branchId, onDone }: { branchId: string; onDone: () => void }) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <Card className="p-3 mb-3 space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.common.name")} className="w-full rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("admin.common.phone")} className="w-full rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
      <Button size="sm" disabled={!name || !phone} onClick={async () => {
        await fetch("/api/delivery/drivers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchId, name, phone }) });
        onDone();
      }}>{t("admin.delivery.addDriver")}</Button>
    </Card>
  );
}

function NewZoneForm({ branchId, onDone }: { branchId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("30");
  const { t } = useLocale();
  return (
    <Card className="p-3 mb-3 space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.delivery.zoneName")} className="w-full rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
      <input type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} placeholder={t("admin.delivery.fee")} className="w-full rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
      <input type="number" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} placeholder={t("admin.delivery.eta")} className="w-full rounded-lg border border-border bg-surface-raised px-2 py-1.5 text-xs" />
      <Button size="sm" disabled={!name || !feeAmount} onClick={async () => {
        await fetch("/api/delivery/zones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchId, name, feeAmount: parseFloat(feeAmount), estimatedMinutes: parseInt(estimatedMinutes, 10) }) });
        onDone();
      }}>{t("admin.delivery.addZone")}</Button>
    </Card>
  );
}

function NewDeliveryOrderForm({ branchId, zones, onClose, onDone }: { branchId: string; zones: any[]; onClose: () => void; onDone: () => void }) {
  const [type, setType] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/menu?branchId=${branchId}`).then((r) => r.json()).then((menu) => {
      setProducts(menu.menus?.[0]?.categories.flatMap((c: any) => c.products) ?? []);
    });
  }, [branchId]);

  const lines = Object.entries(qty).filter(([, q]) => q > 0).map(([productId, quantity]) => ({ productId, quantity, modifierOptionIds: [] }));
  const canSubmit = lines.length > 0 && (type === "PICKUP" || (customerName.trim() && phone.trim() && address.trim()));

  async function submit() {
    setError(null);
    const res = await fetch("/api/orders/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId,
        type,
        lines,
        delivery: type === "DELIVERY" ? { customerName, phone, address, zoneId: zoneId || undefined } : undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) return setError(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
    onDone();
  }

  return (
    <Card className="p-5 mb-6 space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setType("DELIVERY")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${type === "DELIVERY" ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground"}`}>{enumLabel(t, "DELIVERY")}</button>
        <button onClick={() => setType("PICKUP")} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${type === "PICKUP" ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground"}`}>{enumLabel(t, "PICKUP")}</button>
      </div>
      {type === "DELIVERY" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("admin.delivery.customerName")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("admin.common.phone")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
          </div>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("admin.delivery.address")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
          <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
            <option value="">{t("admin.delivery.noZone")}</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name} — {formatMoney(z.feeAmount, "IQD")}</option>)}
          </select>
        </>
      )}
      <div className="max-h-64 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between text-sm py-1">
            <span>{p.name}</span>
            <input
              type="number"
              min={0}
              className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1 text-xs text-end"
              value={qty[p.id] ?? ""}
              onChange={(e) => setQty((prev) => ({ ...prev, [p.id]: parseInt(e.target.value || "0", 10) }))}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>{t("admin.common.cancel")}</Button>
        <Button disabled={!canSubmit} onClick={submit}>{t("admin.delivery.createOrder")}</Button>
      </div>
    </Card>
  );
}
