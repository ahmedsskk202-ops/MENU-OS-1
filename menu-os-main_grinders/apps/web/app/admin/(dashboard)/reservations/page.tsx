"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import { Plus, CalendarClock, Users, Phone } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_TONE: Record<string, "warning" | "accent" | "success" | "neutral" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "accent",
  SEATED: "success",
  COMPLETED: "neutral",
  CANCELLED: "danger",
  NO_SHOW: "danger",
};

export default function ReservationsPage() {
  const { branchId } = useBranch();
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { t } = useLocale();

  async function refresh() {
    if (!branchId) return;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const [resRes, tablesRes] = await Promise.all([
      fetch(`/api/reservations?branchId=${branchId}&from=${from.toISOString()}`),
      fetch(`/api/tables?branchId=${branchId}`),
    ]);
    if (resRes.ok) setReservations((await resRes.json()).reservations);
    if (tablesRes.ok) setTables((await tablesRes.json()).tables);
  }

  useEffect(() => {
    refresh();
  }, [branchId]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (["reservation.created", "reservation.updated"].includes(event.type)) refresh();
  });

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/reservations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  const upcoming = reservations.filter((r) => !["CANCELLED", "NO_SHOW", "COMPLETED"].includes(r.status));
  const past = reservations.filter((r) => ["CANCELLED", "NO_SHOW", "COMPLETED"].includes(r.status));

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">{t("admin.res.title")}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> {t("admin.res.new")}
        </Button>
      </div>

      {showForm && branchId && (
        <NewReservationForm branchId={branchId} tables={tables} onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); refresh(); }} />
      )}

      <div className="space-y-2">
        {upcoming.map((r) => (
          <Card key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{r.guestName}</span>
                <Badge tone={STATUS_TONE[r.status]}>{enumLabel(t, r.status)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" /> {new Date(r.reservedFor).toLocaleString()}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.partySize}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> <span dir="ltr">{r.guestPhone}</span></span>
                {r.table && <span>{t("admin.common.table", { label: r.table.label })}</span>}
              </p>
              {r.notes && <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>}
            </div>
            <div className="flex gap-2">
              {r.status === "PENDING" && (
                <Button size="sm" onClick={() => updateStatus(r.id, "CONFIRMED")}>{t("admin.res.confirm")}</Button>
              )}
              {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "SEATED")}>{t("admin.res.seat")}</Button>
              )}
              {r.status === "SEATED" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "COMPLETED")}>{t("admin.res.complete")}</Button>
              )}
              {r.status !== "COMPLETED" && (
                <Button size="sm" variant="ghost" onClick={() => updateStatus(r.id, "CANCELLED")}>{t("admin.common.cancel")}</Button>
              )}
            </div>
          </Card>
        ))}
        {upcoming.length === 0 && <p className="text-muted-foreground">{t("admin.res.empty")}</p>}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="font-semibold text-sm text-muted-foreground mt-8 mb-3">{t("admin.res.past")}</h2>
          <div className="space-y-2">
            {past.map((r) => (
              <Card key={r.id} className="p-3 flex items-center justify-between opacity-70">
                <div>
                  <span className="text-sm font-medium">{r.guestName}</span>
                  <span className="text-xs text-muted-foreground ms-2">{new Date(r.reservedFor).toLocaleString()}</span>
                </div>
                <Badge tone={STATUS_TONE[r.status]}>{enumLabel(t, r.status)}</Badge>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NewReservationForm({ branchId, tables, onClose, onDone }: { branchId: string; tables: any[]; onClose: () => void; onDone: () => void }) {
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [tableId, setTableId] = useState("");
  const [reservedFor, setReservedFor] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocale();

  const canSubmit = guestName.trim() && guestPhone.trim() && reservedFor;

  async function submit() {
    setError(null);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId,
        guestName,
        guestPhone,
        partySize: parseInt(partySize, 10),
        tableId: tableId || undefined,
        reservedFor: new Date(reservedFor).toISOString(),
        durationMinutes: parseInt(durationMinutes, 10),
        notes: notes || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) return setError(typeof json.error === "string" ? json.error : JSON.stringify(json.error));
    onDone();
  }

  return (
    <Card className="p-5 mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={t("admin.res.guestName")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder={t("admin.common.phone")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input type="datetime-local" value={reservedFor} onChange={(e) => setReservedFor(e.target.value)} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input type="number" min={1} value={partySize} onChange={(e) => setPartySize(e.target.value)} placeholder={t("admin.res.partySize")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        <input type="number" min={15} step={15} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder={t("admin.res.duration")} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      </div>
      <select value={tableId} onChange={(e) => setTableId(e.target.value)} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
        <option value="">{t("admin.res.noTable")}</option>
        {tables.map((tb) => (
          <option key={tb.id} value={tb.id}>{t("admin.res.tableSeats", { label: tb.label, n: tb.capacity })}</option>
        ))}
      </select>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("admin.res.notes")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>{t("admin.common.cancel")}</Button>
        <Button disabled={!canSubmit} onClick={submit}>{t("admin.res.create")}</Button>
      </div>
    </Card>
  );
}
