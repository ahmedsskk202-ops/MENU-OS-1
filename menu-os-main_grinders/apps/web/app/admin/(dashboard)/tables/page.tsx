"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Download } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { PERMISSIONS } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { compareTableLabels } from "@/lib/table-labels";

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "bg-success/10 border-success/30 text-success",
  OCCUPIED: "bg-muted border-border text-foreground",
  ORDERING: "bg-accent/10 border-accent-ink/30 text-accent-ink",
  WAITING: "bg-warning/10 border-warning/30 text-warning",
  RESERVED: "bg-primary/5 border-primary/20 text-foreground",
  CLEANING: "bg-danger/10 border-danger/30 text-danger",
};

const STATUSES = ["AVAILABLE", "OCCUPIED", "ORDERING", "WAITING", "RESERVED", "CLEANING"];

export default function TablesPage() {
  const { branchId } = useBranch();
  const { data: session } = useSession();
  const [tables, setTables] = useState<any[]>([]);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { t } = useLocale();

  const permissions = new Set((session?.user as SessionUser | undefined)?.permissions ?? []);
  // Same rule as the API: adding a table also creates its QR code.
  const canAddTables = permissions.has(PERMISSIONS.TABLES_MANAGE) && permissions.has(PERMISSIONS.QR_MANAGE);

  async function refresh() {
    if (!branchId) return;
    const res = await fetch(`/api/tables?branchId=${branchId}`);
    if (res.ok) setTables((await res.json()).tables);
  }

  useEffect(() => {
    refresh();
  }, [branchId]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (["table.status_changed", "order.created", "order.status_changed"].includes(event.type)) refresh();
  });

  // The status menu closes on Escape and on a click anywhere outside it, like any menu.
  useEffect(() => {
    if (!menuFor) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuFor(null);
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-table-tile]")) setMenuFor(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuFor]);

  async function setStatus(tableId: string, status: string) {
    await fetch(`/api/tables/${tableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMenuFor(null);
  }

  // "1, 2, … 10", not the "1, 10, 2" a plain string sort gives.
  const sorted = [...tables].sort((a, b) => compareTableLabels(a.label, b.label));

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl font-semibold">{t("admin.tables.title")}</h1>
        {canAddTables && !adding && (
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> {t("admin.tables.add")}
          </Button>
        )}
      </div>

      {adding && branchId && (
        <AddTableForm
          branchId={branchId}
          suggested={nextTableLabel(tables.map((x) => x.label))}
          onCancel={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            refresh();
          }}
        />
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {sorted.map((table) => {
          const activeSession = table.sessions[0];
          // A plate waiting on the pass is the one thing on this map a waiter must act on.
          const readyCount = activeSession ? activeSession.orders.filter((o: any) => o.status === "READY").length : 0;
          return (
            <div key={table.id} className="relative" data-table-tile>
              <button onClick={() => setMenuFor(menuFor === table.id ? null : table.id)} className="w-full" aria-haspopup="menu" aria-expanded={menuFor === table.id}>
                <Card className={cn("relative aspect-square flex flex-col items-center justify-center gap-1 border-2", STATUS_STYLE[table.status])}>
                  {readyCount > 0 && (
                    <span className="absolute top-2 inset-x-2 rounded-full bg-success text-white text-[10px] font-bold py-0.5 animate-pulse">
                      {t("admin.tables.ready", { n: readyCount })}
                    </span>
                  )}
                  <span className="font-display text-2xl font-bold">{table.label}</span>
                  <span className="text-[10px] uppercase tracking-wide font-semibold">{enumLabel(t, table.status)}</span>
                  {activeSession && <span className="text-[10px]">{t("admin.tables.orders", { n: activeSession.orders.length })}</span>}
                </Card>
              </button>

              {menuFor === table.id && (
                <div role="menu" className="absolute z-10 top-full mt-1 inset-x-0 rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      role="menuitem"
                      onClick={() => setStatus(table.id, s)}
                      className={cn("w-full text-start px-3 py-2 text-xs hover:bg-muted", s === table.status && "font-bold")}
                    >
                      {enumLabel(t, s)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** One more than the highest numeric table label, as a starting suggestion. */
function nextTableLabel(labels: string[]): string {
  const numbers = labels.map((l) => parseInt(l, 10)).filter((n) => Number.isFinite(n));
  return String(numbers.length ? Math.max(...numbers) + 1 : 1);
}

function AddTableForm({
  branchId,
  suggested,
  onCancel,
  onCreated,
}: {
  branchId: string;
  suggested: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const { t } = useLocale();
  const [label, setLabel] = useState(suggested);
  const [capacity, setCapacity] = useState("4");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ label: string; qrId: string | null } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    const seats = parseInt(capacity, 10);
    if (!trimmed) return setError(t("admin.tables.errLabel"));
    if (trimmed.length > 20) return setError(t("admin.tables.errLabelLong"));
    if (!Number.isInteger(seats) || seats < 1 || seats > 50) return setError(t("admin.tables.errCapacity"));

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, label: trimmed, capacity: seats }),
      });
      if (res.status === 409) return setError(t("admin.tables.errDuplicate", { label: trimmed }));
      if (!res.ok) return setError(t("admin.tables.errGeneric"));
      const json = await res.json().catch(() => ({}));
      setCreated({ label: trimmed, qrId: json.qrCode?.id ?? null });
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    // The code is shown here, ready to download or print, because a new table is only
    // useful to guests once its sticker is on it — a link to another screen was one step
    // too many and easy to skip.
    return (
      <Card className="p-5 mb-6 flex flex-wrap items-center gap-5">
        {created.qrId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/qr/${created.qrId}/image`} alt="" className="h-32 w-32 rounded-lg border border-border bg-white" />
        )}
        <div className="flex-1 min-w-[220px] space-y-3">
          <p className="text-sm">{t("admin.tables.created", { label: created.label })}</p>
          <div className="flex flex-wrap gap-2">
            {created.qrId && (
              <a href={`/api/qr/${created.qrId}/image?size=1024&download=1`} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 h-9 text-sm font-semibold hover:bg-muted">
                <Download className="h-4 w-4" /> {t("admin.qr.download")}
              </a>
            )}
            <Link href="/admin/qr" className="inline-flex items-center rounded-xl border border-border px-3.5 h-9 text-sm font-semibold hover:bg-muted">
              {t("admin.tables.openQr")}
            </Link>
            <Button size="sm" onClick={onCreated}>{t("admin.tables.done")}</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 mb-6">
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3" noValidate>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("admin.tables.label")}
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={20}
            autoFocus
            className="w-32 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          {t("admin.tables.capacity")}
          <input
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            type="number"
            min={1}
            max={50}
            className="w-24 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
          />
        </label>
        <Button type="submit" loading={saving}>{t("admin.tables.create")}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>{t("admin.common.cancel")}</Button>
        {error && <p className="basis-full text-danger text-xs">{error}</p>}
      </form>
    </Card>
  );
}
