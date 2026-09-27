"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import { Lock, Unlock, Plus, Minus } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

export default function ShiftsPage() {
  const { branchId, currentBranch } = useBranch();
  const [current, setCurrent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [showOpen, setShowOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showMovement, setShowMovement] = useState<"CASH_IN" | "CASH_OUT" | null>(null);
  const { t } = useLocale();

  async function refresh() {
    if (!branchId) return;
    const [curRes, listRes] = await Promise.all([fetch(`/api/shifts/current?branchId=${branchId}`), fetch(`/api/shifts?branchId=${branchId}`)]);
    const cur = await curRes.json();
    setCurrent(cur.shift);
    if (listRes.ok) setHistory((await listRes.json()).shifts);
    if (cur.shift) {
      const recRes = await fetch(`/api/reports/cash-reconciliation?shiftId=${cur.shift.id}`);
      if (recRes.ok) setReconciliation((await recRes.json()).report);
    } else {
      setReconciliation(null);
    }
  }

  useEffect(() => {
    refresh();
  }, [branchId]);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">{t("admin.shifts.title")}</h1>
        {!current ? (
          <Button onClick={() => setShowOpen(true)}>
            <Unlock className="h-4 w-4" /> {t("admin.shifts.open")}
          </Button>
        ) : (
          <Button variant="danger" onClick={() => setShowClose(true)}>
            <Lock className="h-4 w-4" /> {t("admin.shifts.close")}
          </Button>
        )}
      </div>

      {showOpen && <OpenShiftForm branchId={branchId} onClose={() => setShowOpen(false)} onDone={() => { setShowOpen(false); refresh(); }} />}
      {showClose && current && reconciliation && (
        <CloseShiftForm shiftId={current.id} reconciliation={reconciliation} onClose={() => setShowClose(false)} onDone={() => { setShowClose(false); refresh(); }} />
      )}

      {current && reconciliation && (
        <Card className="p-6 mb-8 bg-gradient-to-br from-accent/10 to-transparent border-accent-ink/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("admin.shifts.openShift")}</p>
              <p className="font-display text-lg font-semibold">{current.openedBy.name}</p>
            </div>
            <Badge tone="success">{enumLabel(t, "OPEN")}</Badge>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm mb-4">
            <Stat label={t("admin.shifts.opening")} value={formatMoney(reconciliation.openingCash, currentBranch?.currency)} />
            <Stat label={t("admin.shifts.cashSales")} value={formatMoney(reconciliation.cashSales, currentBranch?.currency)} />
            <Stat label={enumLabel(t, "CASH_IN")} value={formatMoney(reconciliation.cashIn, currentBranch?.currency)} />
            <Stat label={enumLabel(t, "CASH_OUT")} value={formatMoney(reconciliation.cashOut, currentBranch?.currency)} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="font-display font-semibold">{t("admin.shifts.expected", { amount: formatMoney(reconciliation.expectedCash, currentBranch?.currency) })}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowMovement("CASH_IN")}>
                <Plus className="h-3.5 w-3.5" /> {enumLabel(t, "CASH_IN")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowMovement("CASH_OUT")}>
                <Minus className="h-3.5 w-3.5" /> {enumLabel(t, "CASH_OUT")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showMovement && current && (
        <CashMovementForm shiftId={current.id} type={showMovement} onClose={() => setShowMovement(null)} onDone={() => { setShowMovement(null); refresh(); }} />
      )}

      <h2 className="font-display text-lg font-semibold mb-3">{t("admin.shifts.history")}</h2>
      <div className="space-y-2">
        {history.map((s) => (
          <Card key={s.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{s.openedBy.name} → {s.closedBy?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{new Date(s.openedAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              {s.variance !== null && (
                <Badge tone={Math.abs(s.variance) < 0.01 ? "success" : "warning"}>
                  {t("admin.shifts.variance", { amount: formatMoney(s.variance, currentBranch?.currency) })}
                </Badge>
              )}
              <Badge tone={s.status === "OPEN" ? "success" : "neutral"}>{enumLabel(t, s.status)}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function OpenShiftForm({ branchId, onClose, onDone }: { branchId: string | null; onClose: () => void; onDone: () => void }) {
  const [openingCash, setOpeningCash] = useState("");
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!branchId) return;
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId, openingCash: parseFloat(openingCash || "0") }),
    });
    const json = await res.json();
    if (!res.ok) return setError(json.error);
    onDone();
  }

  return (
    <Card className="p-5 mb-6 space-y-3">
      <h3 className="font-semibold">{t("admin.shifts.open")}</h3>
      <input value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} type="number" placeholder={t("admin.shifts.openingCash")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit}>{t("admin.shifts.openBtn")}</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>{t("admin.common.cancel")}</Button>
      </div>
    </Card>
  );
}

function CloseShiftForm({ shiftId, reconciliation, onClose, onDone }: { shiftId: string; reconciliation: any; onClose: () => void; onDone: () => void }) {
  const [actualCash, setActualCash] = useState("");
  const { t } = useLocale();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const variance = actualCash ? Math.round((parseFloat(actualCash) - reconciliation.expectedCash) * 100) / 100 : null;

  async function submit() {
    const res = await fetch(`/api/shifts/${shiftId}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actualCash: parseFloat(actualCash || "0"), varianceReason: reason || undefined }),
    });
    const json = await res.json();
    if (!res.ok) return setError(json.error);
    onDone();
  }

  return (
    <Card className="p-5 mb-6 space-y-3">
      <h3 className="font-semibold">{t("admin.shifts.close")}</h3>
      <p className="text-sm text-muted-foreground">{t("admin.shifts.expected", { amount: reconciliation.expectedCash })}</p>
      <input value={actualCash} onChange={(e) => setActualCash(e.target.value)} type="number" placeholder={t("admin.shifts.actualCash")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      {variance !== null && Math.abs(variance) > 0.01 && (
        <>
          <p className="text-sm text-warning">{t("admin.shifts.varianceLine", { n: variance })}</p>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("admin.shifts.varianceReason")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
        </>
      )}
      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit}>{t("admin.shifts.close")}</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>{t("admin.common.cancel")}</Button>
      </div>
    </Card>
  );
}

function CashMovementForm({ shiftId, type, onClose, onDone }: { shiftId: string; type: "CASH_IN" | "CASH_OUT"; onClose: () => void; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const { t } = useLocale();
  const [reason, setReason] = useState("");

  async function submit() {
    if (!amount || !reason) return;
    await fetch(`/api/shifts/${shiftId}/cash-movements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: parseFloat(amount), reason }),
    });
    onDone();
  }

  return (
    <Card className="p-5 mb-6 space-y-3">
      <h3 className="font-semibold">{enumLabel(t, type)}</h3>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder={t("admin.orders.amount")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("admin.orders.reason")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit}>{t("admin.shifts.record")}</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>{t("admin.common.cancel")}</Button>
      </div>
    </Card>
  );
}
