"use client";

import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { useEffect, useMemo, useState } from "react";
import { Plus, Download, Printer, AlertTriangle, Wand2, Link2 } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { compareTableLabels } from "@/lib/table-labels";
import { cn } from "@/lib/cn";

type Filter = "all" | "tables" | "other" | "inactive";

export default function QrAdminPage() {
  const { branchId, currentBranch } = useBranch();
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [missing, setMissing] = useState<{ id: string; label: string }[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { t } = useLocale();

  async function refresh() {
    if (!branchId) return;
    const [qrRes, tableRes] = await Promise.all([fetch(`/api/qr?branchId=${branchId}`), fetch(`/api/tables?branchId=${branchId}`)]);
    if (qrRes.ok) {
      const j = await qrRes.json();
      setQrCodes(j.qrCodes);
      setMissing([...(j.missingTables ?? [])].sort((a, b) => compareTableLabels(a.label, b.label)));
      setBaseUrl(j.baseUrl ?? "");
    }
    if (tableRes.ok) setTables((await tableRes.json()).tables);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/qr/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive }) });
    refresh();
  }

  async function generateMissing() {
    if (!branchId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/qr/missing-tables", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchId }) });
      if (res.ok) setNotice(t("admin.qr.generatedMissing", { n: (await res.json()).created }));
      await refresh();
    } finally {
      setGenerating(false);
    }
  }

  // Live codes per table — more than one means two stickers open the same table.
  const liveByTable = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of qrCodes) if (q.isActive && q.tableId) m.set(q.tableId, (m.get(q.tableId) ?? 0) + 1);
    return m;
  }, [qrCodes]);

  const sorted = useMemo(() => {
    const list = [...qrCodes].sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      if (a.table && b.table) return compareTableLabels(a.table.label, b.table.label);
      if (a.table) return -1;
      if (b.table) return 1;
      return a.label.localeCompare(b.label);
    });
    return list.filter((q) =>
      filter === "tables" ? q.type === "TABLE" && q.isActive : filter === "other" ? q.type !== "TABLE" && q.isActive : filter === "inactive" ? !q.isActive : true
    );
  }, [qrCodes, filter]);

  function printCodes(codes: any[]) {
    const w = window.open("", "_blank");
    if (!w) return;
    const cafe = currentBranch ? `${currentBranch.brandName} · ${currentBranch.name}` : "";
    const cards = codes
      .map(
        (q) => `<div class="card"><img src="${location.origin}/api/qr/${q.id}/image?size=900" /><div class="label">${escapeHtml(q.table ? t("admin.common.table", { label: q.table.label }) : q.label)}</div><div class="hint">${escapeHtml(t("admin.qr.printHint"))}</div><div class="cafe">${escapeHtml(cafe)}</div></div>`
      )
      .join("");
    w.document.write(`<!doctype html><html dir="${document.documentElement.dir || "ltr"}"><head><meta charset="utf-8"><title>QR</title><style>
      body{font-family:system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;margin:0;padding:12mm;color:#13131a}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10mm}
      .card{border:1px dashed #bbb;border-radius:6mm;padding:8mm;text-align:center;break-inside:avoid}
      img{width:62mm;height:62mm}
      .label{font-size:22pt;font-weight:800;margin-top:3mm}
      .hint{font-size:11pt;color:#555;margin-top:1mm}
      .cafe{font-size:9pt;color:#888;margin-top:2mm}
      @media print{body{padding:6mm}}
    </style></head><body><div class="grid">${cards}</div><script>
      const imgs=[...document.images];let left=imgs.length;const go=()=>{if(--left<=0)setTimeout(()=>window.print(),150)};
      imgs.forEach(i=>i.complete?go():(i.onload=go,i.onerror=go)); if(!imgs.length) window.print();
    </script></body></html>`);
    w.document.close();
  }

  const liveTableCodes = qrCodes.filter((q) => q.isActive && q.type === "TABLE").sort((a, b) => compareTableLabels(a.table?.label ?? "", b.table?.label ?? ""));
  const loopback = /\/\/(localhost|127\.)/.test(baseUrl);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="font-display text-3xl font-semibold">{t("admin.qr.title")}</h1>
        <div className="flex flex-wrap gap-2">
          {liveTableCodes.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => printCodes(liveTableCodes)}>
              <Printer className="h-4 w-4" /> {t("admin.qr.printAll")}
            </Button>
          )}
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> {t("admin.qr.new")}
          </Button>
        </div>
      </div>

      {baseUrl && (
        <p className={cn("text-xs mb-4 flex items-center gap-1.5", loopback ? "text-danger" : "text-muted-foreground")}>
          <Link2 className="h-3.5 w-3.5" />
          <span>{t("admin.qr.pointsTo")}</span>
          <span dir="ltr" className="font-mono">{baseUrl}</span>
          {loopback && <span>— {t("admin.qr.loopbackWarn")}</span>}
        </p>
      )}

      {missing.length > 0 && (
        <Card className="p-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-warning/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t("admin.qr.missingTitle", { n: missing.length })}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{missing.map((m) => m.label).join("، ")}</p>
            </div>
          </div>
          <Button size="sm" onClick={generateMissing} loading={generating}>
            <Wand2 className="h-4 w-4" /> {t("admin.qr.generateMissing")}
          </Button>
        </Card>
      )}

      {notice && <p className="text-sm text-success mb-4">{notice}</p>}

      {showForm && (
        <NewQrForm
          tables={tables}
          liveByTable={liveByTable}
          branchId={branchId}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            refresh();
          }}
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "tables", "other", "inactive"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", filter === f ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}
          >
            {t(`admin.qr.filter.${f}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {sorted.map((qr) => {
          const dup = qr.isActive && qr.tableId && (liveByTable.get(qr.tableId) ?? 0) > 1;
          return (
            <Card key={qr.id} className={cn("p-4 flex flex-col items-center text-center", !qr.isActive && "opacity-60")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr/${qr.id}/image`} alt={qr.label} className="h-32 w-32 mb-3" />
              <p className="font-semibold text-sm">{qr.table ? t("admin.common.table", { label: qr.table.label }) : qr.label}</p>
              <p className="text-xs text-muted-foreground mb-2">
                {enumLabel(t, qr.type)}
                {qr.table && qr.label !== `Table ${qr.table.label}` ? ` · ${qr.label}` : ""}
              </p>
              <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
                <Badge tone={qr.isActive ? "success" : "neutral"}>{qr.isActive ? t("admin.common.active") : t("admin.common.inactive")}</Badge>
                {dup && <Badge tone="warning">{t("admin.qr.duplicate")}</Badge>}
                <span className="text-xs text-muted-foreground">{t("admin.qr.scans", { n: qr.scansCount })}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <a href={`/api/qr/${qr.id}/image?size=1024&download=1`} title={t("admin.qr.download")}>
                  <Button size="sm" variant="outline" className="w-full px-0">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
                <Button size="sm" variant="outline" className="px-0" title={t("admin.qr.print")} onClick={() => printCodes([qr])}>
                  <Printer className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="px-0 text-xs" onClick={() => toggleActive(qr.id, !qr.isActive)}>
                  {qr.isActive ? t("admin.qr.deactivate") : t("admin.qr.activate")}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      {sorted.length === 0 && <p className="text-muted-foreground text-sm">{t("admin.qr.empty")}</p>}
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function NewQrForm({
  tables,
  liveByTable,
  branchId,
  onClose,
  onCreated,
}: {
  tables: any[];
  liveByTable: Map<string, number>;
  branchId: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useLocale();
  const sortedTables = useMemo(() => [...tables].sort((a, b) => compareTableLabels(a.label, b.label)), [tables]);
  const [type, setType] = useState("TABLE");
  // Default to the first table that has no code yet — that is almost always the one
  // the manager came here for.
  const [tableId, setTableId] = useState("");
  const [label, setLabel] = useState("");
  const [replace, setReplace] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tableId && sortedTables[0]) setTableId((sortedTables.find((tb) => !liveByTable.get(tb.id)) ?? sortedTables[0]).id);
  }, [tableId, sortedTables, liveByTable]);

  const selectedTable = sortedTables.find((tb) => tb.id === tableId);
  const hasLive = !!selectedTable && (liveByTable.get(selectedTable.id) ?? 0) > 0;
  const defaultLabel = type === "TABLE" && selectedTable ? `Table ${selectedTable.label}` : "";

  async function submit() {
    if (!branchId) return;
    const finalLabel = label.trim() || defaultLabel;
    if (type === "TABLE" && !selectedTable) return setError(t("admin.qr.errTable"));
    if (!finalLabel) return setError(t("admin.qr.errLabel"));
    if (type === "TABLE" && hasLive && !replace) return setError(t("admin.qr.errHasCode"));
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, type, label: finalLabel, tableId: type === "TABLE" ? tableId : undefined, replace: type === "TABLE" ? replace : undefined }),
      });
      if (res.status === 409) return setError(t("admin.qr.errHasCode"));
      if (!res.ok) return setError(t("admin.qr.errGeneric"));
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-5 mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select value={type} onChange={(e) => { setType(e.target.value); setError(null); }} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
          <option value="TABLE">{enumLabel(t, "TABLE")}</option>
          <option value="MENU">{enumLabel(t, "MENU")}</option>
          <option value="PICKUP">{enumLabel(t, "PICKUP")}</option>
          <option value="MARKETING">{enumLabel(t, "MARKETING")}</option>
        </select>
        {type === "TABLE" && (
          <select value={tableId} onChange={(e) => { setTableId(e.target.value); setReplace(false); setError(null); }} className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm">
            {sortedTables.map((tb) => (
              <option key={tb.id} value={tb.id}>
                {t("admin.common.table", { label: tb.label })}
                {liveByTable.get(tb.id) ? ` — ${t("admin.qr.hasCode")}` : ` — ${t("admin.qr.noCode")}`}
              </option>
            ))}
          </select>
        )}
      </div>
      <input
        value={label}
        onChange={(e) => { setLabel(e.target.value); setError(null); }}
        placeholder={defaultLabel || t("admin.qr.labelPlaceholder")}
        maxLength={60}
        className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm"
      />
      {type === "TABLE" && hasLive && (
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} className="mt-1" />
          <span>{t("admin.qr.replaceHint")}</span>
        </label>
      )}
      {type === "TABLE" && (
        <p className="text-xs text-muted-foreground">
          {t("admin.qr.newTableHint")}{" "}
          <Link href="/admin/tables" className="underline font-semibold">{t("admin.qr.newTableLink")}</Link>
        </p>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} loading={saving}>{t("admin.qr.generate")}</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>{t("admin.common.cancel")}</Button>
      </div>
    </Card>
  );
}
