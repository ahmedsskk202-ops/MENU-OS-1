"use client";

import { useLocale } from "@/lib/LocaleContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

// Stored as these English keys (so reports group them), shown translated.
const CATEGORIES = ["Rent", "Electricity", "Generator", "Water", "Internet", "Maintenance", "Cleaning", "Transport", "Supplies", "Salaries", "Other"];

const thisMonth = () => new Date().toISOString().slice(0, 7);
const today = () => new Date().toISOString().slice(0, 10);

export default function ExpensesPage() {
  const { branchId, currentBranch } = useBranch();
  const { t } = useLocale();
  const [month, setMonth] = useState(thisMonth());
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const currency = currentBranch?.currency;

  const catLabel = useCallback((c: string) => {
    const key = `admin.expenseCat.${c}`;
    const s = t(key);
    return s === key ? c : s;
  }, [t]);

  const refresh = useCallback(async () => {
    if (!branchId) return;
    const [y, m] = month.split("-").map(Number);
    const from = new Date(`${month}-01T00:00:00+03:00`).toISOString();
    const to = new Date(new Date(`${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}-01T00:00:00+03:00`).getTime() - 1).toISOString();
    const res = await fetch(`/api/expenses?branchId=${branchId}&from=${from}&to=${to}`);
    if (res.ok) setExpenses((await res.json()).expenses);
  }, [branchId, month]);

  useEffect(() => { refresh(); }, [refresh]);

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of expenses) m.set(e.category, (m.get(e.category) ?? 0) + parseFloat(e.amount));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses]);
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const shown = filter ? expenses.filter((e) => e.category === filter) : expenses;

  async function remove(id: string) {
    if (!confirm(t("admin.expenses.confirmDelete"))) return;
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error === "payroll_expense" ? t("admin.expenses.payrollLocked") : t("admin.expenses.errGeneric"));
    }
    refresh();
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("admin.expenses.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.expenses.monthTotal", { amount: formatMoney(total, currency) })}</p>
        </div>
        <div className="flex gap-2 items-center">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
          {!showForm && <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> {t("admin.expenses.record")}</Button>}
        </div>
      </div>

      {showForm && <NewExpenseForm branchId={branchId} catLabel={catLabel} onClose={() => setShowForm(false)} onDone={() => { setShowForm(false); refresh(); }} />}

      {byCategory.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {byCategory.map(([c, amount]) => (
            <button key={c} onClick={() => setFilter(filter === c ? null : c)} className="text-start">
              <Card className={cn("p-3", filter === c && "ring-2 ring-accent")}>
                <p className="text-xs text-muted-foreground">{catLabel(c)}</p>
                <p className="font-display font-semibold">{formatMoney(amount, currency)}</p>
                <p className="text-[11px] text-muted-foreground">{total > 0 ? Math.round((amount / total) * 100) : 0}%</p>
              </Card>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {shown.map((e) => (
          <Card key={e.id} className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{catLabel(e.category)}</p>
              {e.description && <p className="text-xs text-muted-foreground truncate">{e.description}</p>}
              <p className="text-xs text-muted-foreground">{e.recordedBy.name} · {new Date(e.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold">{formatMoney(e.amount, currency)}</span>
              <button onClick={() => remove(e.id)} className="p-2 text-muted-foreground hover:text-danger" title={t("admin.expenses.delete")}><Trash2 className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
        {shown.length === 0 && <p className="text-muted-foreground">{t("admin.expenses.empty")}</p>}
      </div>
    </div>
  );
}

function NewExpenseForm({ branchId, catLabel, onClose, onDone }: { branchId: string | null; catLabel: (c: string) => string; onClose: () => void; onDone: () => void }) {
  const [category, setCategory] = useState("");
  const [custom, setCustom] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { t } = useLocale();

  async function submit() {
    if (!branchId) return;
    const value = parseFloat(amount);
    const finalCategory = category === "Other" && custom.trim() ? custom.trim() : category;
    if (!finalCategory) return setError(t("admin.expenses.errCategory"));
    if (!Number.isFinite(value) || value <= 0) return setError(t("admin.expenses.errAmount"));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, category: finalCategory, amount: value, description: description.trim() || undefined, date }),
      });
      if (!res.ok) return setError(t("admin.expenses.errGeneric"));
      onDone();
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm";
  return (
    <Card className="p-5 mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.filter((c) => c !== "Salaries").map((c) => (
          <button key={c} onClick={() => { setCategory(c); setError(null); }} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium", category === c ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>
            {catLabel(c)}
          </button>
        ))}
      </div>
      {category === "Other" && <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={60} placeholder={t("admin.expenses.category")} className={input} />}
      <div className="grid grid-cols-2 gap-3">
        <input value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} type="number" min={0} step="any" placeholder={t("admin.orders.amount")} className={input} />
        <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} className={input} />
      </div>
      <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} placeholder={t("admin.expenses.description")} className={input} />
      <p className="text-xs text-muted-foreground">{t("admin.expenses.salaryHint")}</p>
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} loading={saving}>{t("admin.expenses.submit")}</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>{t("admin.common.cancel")}</Button>
      </div>
    </Card>
  );
}
