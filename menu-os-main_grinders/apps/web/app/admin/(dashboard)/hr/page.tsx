"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Fingerprint, Clock, Pencil, Trash2, Copy, Wallet, Upload, StickyNote, Check, Undo2, RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { useBranch } from "@/lib/BranchContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

type Tab = "today" | "employees" | "shifts" | "notes" | "payroll";

interface Employee {
  id: string; name: string; phone: string | null; jobTitle: string | null; code: string | null;
  salaryType: "MONTHLY" | "DAILY" | "HOURLY"; salaryAmount: number; hireDate: string; isActive: boolean; notes: string | null;
  notesCount: number; clockedInSince: string | null; workedToday: boolean; todayShift: { start: string; end: string } | null;
}

const input = "rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm";
const localToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Baghdad" }).format(new Date());
const time = (d: string | Date) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const hrs = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function HrPage() {
  const { t } = useLocale();
  const { branchId, currentBranch } = useBranch();
  const [tab, setTab] = useState<Tab>("today");
  const [employees, setEmployees] = useState<Employee[]>([]);

  const load = useCallback(async () => {
    if (!branchId) return;
    const res = await fetch(`/api/hr/employees?branchId=${branchId}`);
    if (res.ok) setEmployees((await res.json()).employees);
  }, [branchId]);
  useEffect(() => { load(); }, [load]);

  const active = employees.filter((e) => e.isActive);

  return (
    <div className="p-4 md:p-8 max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{t("admin.hr.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentBranch ? `${currentBranch.brandName} · ${currentBranch.name}` : ""}</p>
        </div>
        <Link href="/admin/hr/kiosk" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 h-10 text-sm font-semibold hover:bg-muted">
          <Fingerprint className="h-4 w-4" /> {t("admin.hr.openKiosk")}
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(["today", "employees", "shifts", "notes", "payroll"] as Tab[]).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", tab === k ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>
            {t(`admin.hr.tab.${k}`)}
          </button>
        ))}
      </div>
      {branchId && tab === "today" && <TodayTab branchId={branchId} employees={active} onChange={load} />}
      {branchId && tab === "employees" && <EmployeesTab branchId={branchId} employees={employees} currency={currentBranch?.currency} onChange={load} />}
      {branchId && tab === "shifts" && <ShiftsTab branchId={branchId} employees={active} />}
      {branchId && tab === "notes" && <NotesTab branchId={branchId} employees={active} />}
      {branchId && tab === "payroll" && <PayrollTab branchId={branchId} />}
    </div>
  );
}

// ─── today / attendance ───────────────────────────────────────────────────

function TodayTab({ branchId, employees, onChange }: { branchId: string; employees: Employee[]; onChange: () => void }) {
  const { t } = useLocale();
  const [from, setFrom] = useState(localToday());
  const [to, setTo] = useState(localToday());
  const [records, setRecords] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/hr/attendance?branchId=${branchId}&from=${from}&to=${to}`);
    if (res.ok) setRecords((await res.json()).records);
  }, [branchId, from, to]);
  useEffect(() => { load(); }, [load]);
  const refresh = () => { load(); onChange(); };

  const inNow = employees.filter((e) => e.clockedInSince);
  const notIn = employees.filter((e) => !e.clockedInSince);
  const totalHours = records.reduce((s, r) => s + (r.hours ?? 0), 0);

  async function remove(id: string) {
    if (!confirm(t("admin.hr.confirmDelete"))) return;
    await fetch(`/api/hr/attendance/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="font-semibold mb-2 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" /> {t("admin.hr.inNow", { n: inNow.length })}</p>
          {inNow.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.hr.nobodyIn")}</p>}
          <ul className="space-y-1">
            {inNow.map((e) => (
              <li key={e.id} className="flex justify-between text-sm">
                <span>{e.name}{e.jobTitle ? <span className="text-muted-foreground text-xs"> · {e.jobTitle}</span> : null}</span>
                <span className="text-muted-foreground">{t("admin.hr.since", { time: time(e.clockedInSince!) })}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <p className="font-semibold mb-2 flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground" /> {t("admin.hr.notIn", { n: notIn.length })}</p>
          <ul className="space-y-1">
            {notIn.map((e) => (
              <li key={e.id} className="flex justify-between text-sm">
                <span>{e.name}</span>
                <span className="text-xs text-muted-foreground">
                  {e.workedToday ? t("admin.hr.leftToday") : e.todayShift ? t("admin.hr.shiftAt", { start: e.todayShift.start }) : t("admin.hr.off")}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={input} />
          <span>→</span>
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={input} />
          <span className="text-muted-foreground text-xs">{t("admin.hr.totalHours", { n: hrs(totalHours) })}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setImporting(!importing)}><Upload className="h-4 w-4" /> {t("admin.hr.import")}</Button>
          <Button size="sm" onClick={() => setAdding(!adding)}><Clock className="h-4 w-4" /> {t("admin.hr.manualEntry")}</Button>
        </div>
      </div>

      {adding && <AttendanceForm employees={employees} onDone={() => { setAdding(false); refresh(); }} onCancel={() => setAdding(false)} />}
      {importing && <ImportBox branchId={branchId} onDone={() => { setImporting(false); refresh(); }} />}

      <Card className="divide-y divide-border">
        {records.map((r) => (
          <div key={r.id} className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-medium">{r.employee.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.date} · {time(r.clockIn)} → {r.clockOut ? time(r.clockOut) : <span className="text-success">{t("admin.hr.stillIn")}</span>}
                  {r.note ? ` · ${r.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {r.hours != null && <span className="font-semibold tabular-nums">{t("admin.hr.hours", { n: hrs(r.hours) })}</span>}
                <Badge tone="neutral">{t(`admin.hr.source.${r.source}`)}</Badge>
                <button onClick={() => setEditing(editing === r.id ? null : r.id)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(r.id)} className="p-1.5 text-muted-foreground hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {editing === r.id && <AttendanceForm record={r} employees={employees} onDone={() => { setEditing(null); refresh(); }} onCancel={() => setEditing(null)} />}
          </div>
        ))}
        {records.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t("admin.hr.noAttendance")}</p>}
      </Card>
    </div>
  );
}

/** `datetime-local` value (local wall clock) for a Date. */
function toLocalInput(d: string | Date | null) {
  if (!d) return "";
  const x = new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function AttendanceForm({ record, employees, onDone, onCancel }: { record?: any; employees: Employee[]; onDone: () => void; onCancel: () => void }) {
  const { t } = useLocale();
  const [employeeId, setEmployeeId] = useState(record?.employee.id ?? employees[0]?.id ?? "");
  const [clockIn, setClockIn] = useState(toLocalInput(record?.clockIn ?? new Date()));
  const [clockOut, setClockOut] = useState(toLocalInput(record?.clockOut ?? null));
  const [note, setNote] = useState(record?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!clockIn) return setError(t("admin.hr.err.times"));
    if (clockOut && new Date(clockOut) <= new Date(clockIn)) return setError(t("admin.hr.err.times"));
    const body = { employeeId, clockIn: new Date(clockIn).toISOString(), clockOut: clockOut ? new Date(clockOut).toISOString() : null, note: note.trim() || null };
    const res = await fetch(record ? `/api/hr/attendance/${record.id}` : "/api/hr/attendance", {
      method: record ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return setError(t("admin.hr.err.times"));
    onDone();
  }

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl bg-muted/50 p-3">
      {!record && (
        <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={input}>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      )}
      <label className="text-xs text-muted-foreground space-y-1">{t("admin.hr.clockIn")}<input type="datetime-local" value={clockIn} onChange={(e) => setClockIn(e.target.value)} className={cn(input, "block")} /></label>
      <label className="text-xs text-muted-foreground space-y-1">{t("admin.hr.clockOut")}<input type="datetime-local" value={clockOut} onChange={(e) => setClockOut(e.target.value)} className={cn(input, "block")} /></label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("admin.hr.note")} className={cn(input, "flex-1 min-w-[140px]")} />
      <Button size="sm" onClick={save}>{t("admin.hr.save")}</Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>{t("admin.common.cancel")}</Button>
      {error && <p className="basis-full text-danger text-xs">{error}</p>}
    </div>
  );
}

function ImportBox({ branchId, onDone }: { branchId: string; onDone: () => void }) {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  async function readFile(f: File) {
    setText(await f.text());
  }
  async function run() {
    const res = await fetch("/api/hr/attendance/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchId, text }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return setResult(t("admin.hr.err.generic"));
    setResult(t("admin.hr.importResult", { created: j.created, skipped: j.skipped, unknown: j.unknownCodes.length ? j.unknownCodes.join(", ") : "—" }));
    if (j.created > 0) setTimeout(onDone, 1500);
  }
  return (
    <Card className="p-4 space-y-2">
      <p className="text-sm font-semibold">{t("admin.hr.importTitle")}</p>
      <p className="text-xs text-muted-foreground">{t("admin.hr.importHint")}</p>
      <input type="file" accept=".csv,.txt,.dat" onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} className="text-xs" />
      <textarea dir="ltr" value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={"12,2026-09-27 08:58\n12,2026-09-27 17:02"} className={cn(input, "w-full font-mono text-xs")} />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={run} disabled={!text.trim()}>{t("admin.hr.importRun")}</Button>
        {result && <p className="text-xs">{result}</p>}
      </div>
    </Card>
  );
}

// ─── employees ────────────────────────────────────────────────────────────

function EmployeesTab({ branchId, employees, currency, onChange }: { branchId: string; employees: Employee[]; currency?: string; onChange: () => void }) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  return (
    <>
      <div className="flex justify-end mb-4">
        {editing !== "new" && <Button size="sm" onClick={() => setEditing("new")}><UserPlus className="h-4 w-4" /> {t("admin.hr.addEmployee")}</Button>}
      </div>
      {editing === "new" && <EmployeeForm branchId={branchId} onDone={() => { setEditing(null); onChange(); }} onCancel={() => setEditing(null)} />}
      <div className="space-y-2">
        {employees.map((e) => (
          <Card key={e.id} className={cn("p-4", !e.isActive && "opacity-60")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium flex items-center gap-2">
                  {e.name}
                  {!e.isActive && <Badge tone="neutral">{t("admin.hr.inactive")}</Badge>}
                  {e.clockedInSince && <Badge tone="success">{t("admin.hr.working")}</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[e.jobTitle, e.phone, e.code ? `${t("admin.hr.code")}: ${e.code}` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatMoney(e.salaryAmount, currency)} <span className="text-xs text-muted-foreground font-normal">/ {t(`admin.hr.per.${e.salaryType}`)}</span></span>
                <Button size="sm" variant="ghost" onClick={() => setEditing(editing === e.id ? null : e.id)}><Pencil className="h-3.5 w-3.5" /> {t("admin.hr.edit")}</Button>
              </div>
            </div>
            {editing === e.id && <EmployeeForm branchId={branchId} existing={e} onDone={() => { setEditing(null); onChange(); }} onCancel={() => setEditing(null)} />}
          </Card>
        ))}
        {employees.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.hr.noEmployees")}</p>}
      </div>
    </>
  );
}

function EmployeeForm({ branchId, existing, onDone, onCancel }: { branchId: string; existing?: Employee; onDone: () => void; onCancel: () => void }) {
  const { t } = useLocale();
  const [f, setF] = useState({
    name: existing?.name ?? "",
    jobTitle: existing?.jobTitle ?? "",
    phone: existing?.phone ?? "",
    code: existing?.code ?? "",
    salaryType: existing?.salaryType ?? "MONTHLY",
    salaryAmount: existing ? String(existing.salaryAmount) : "",
    hireDate: existing ? existing.hireDate.slice(0, 10) : localToday(),
    notes: existing?.notes ?? "",
    isActive: existing?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<typeof f>) => setF((x) => ({ ...x, ...p }));

  async function save() {
    if (f.name.trim().length < 2) return setError(t("admin.hr.err.name"));
    if (f.code && !/^\d{3,8}$/.test(f.code)) return setError(t("admin.hr.err.code"));
    const body: Record<string, unknown> = {
      name: f.name.trim(),
      jobTitle: f.jobTitle.trim() || null,
      phone: f.phone.trim() || null,
      code: f.code.trim() || null,
      salaryType: f.salaryType,
      salaryAmount: parseFloat(f.salaryAmount) || 0,
      hireDate: f.hireDate,
      notes: f.notes.trim() || null,
    };
    if (existing) body.isActive = f.isActive;
    else body.branchId = branchId;
    const res = await fetch(existing ? `/api/hr/employees/${existing.id}` : "/api/hr/employees", {
      method: existing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 409) return setError(t("admin.hr.err.codeTaken"));
    if (!res.ok) return setError(t("admin.hr.err.generic"));
    onDone();
  }

  const label = "text-xs text-muted-foreground space-y-1";
  return (
    <div className={cn("space-y-3", existing ? "mt-4 pt-4 border-t border-border" : "mb-4 rounded-2xl border border-border bg-surface p-4")}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className={cn(label, "col-span-2")}>{t("admin.hr.name")}<input value={f.name} onChange={(e) => set({ name: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.hr.jobTitle")}<input value={f.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.hr.phone")}<input dir="ltr" value={f.phone} onChange={(e) => set({ phone: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.hr.salaryType")}
          <select value={f.salaryType} onChange={(e) => set({ salaryType: e.target.value as Employee["salaryType"] })} className={cn(input, "w-full")}>
            {(["MONTHLY", "DAILY", "HOURLY"] as const).map((s) => <option key={s} value={s}>{t(`admin.hr.salary.${s}`)}</option>)}
          </select>
        </label>
        <label className={label}>{t(`admin.hr.amount.${f.salaryType}`)}<input type="number" min={0} value={f.salaryAmount} onChange={(e) => set({ salaryAmount: e.target.value })} className={cn(input, "w-full")} /></label>
        <label className={label}>{t("admin.hr.code")}
          <span className="flex gap-1.5">
            <input dir="ltr" inputMode="numeric" value={f.code} onChange={(e) => set({ code: e.target.value.replace(/\D/g, "").slice(0, 8) })} placeholder="1234" className={cn(input, "w-full min-w-0 font-mono")} />
            <button
              type="button"
              title={t("admin.staff.generateCode")}
              aria-label={t("admin.staff.generateCode")}
              onClick={async () => { const r = await fetch("/api/hr/next-code"); if (r.ok) set({ code: (await r.json()).code }); }}
              className="shrink-0 px-2.5 rounded-lg border border-border bg-surface-raised hover:bg-muted text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </span>
        </label>
        <label className={label}>{t("admin.hr.hireDate")}<input type="date" value={f.hireDate} onChange={(e) => set({ hireDate: e.target.value })} className={cn(input, "w-full")} /></label>
      </div>
      <input value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder={t("admin.hr.profileNotes")} className={cn(input, "w-full")} />
      <p className="text-xs text-muted-foreground">{t("admin.hr.codeHint")}</p>
      {existing && (
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={(e) => set({ isActive: e.target.checked })} /> {t("admin.hr.stillEmployed")}</label>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>{t("admin.hr.save")}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t("admin.common.cancel")}</Button>
      </div>
    </div>
  );
}

// ─── shifts ───────────────────────────────────────────────────────────────

const PRESETS = [
  { key: "morning", start: "08:00", end: "16:00" },
  { key: "evening", start: "16:00", end: "00:00" },
  { key: "night", start: "18:00", end: "02:00" },
];

function weekStart(date: string) {
  // Saturday-first week, as most Iraqi cafes plan it.
  const d = new Date(`${date}T12:00:00Z`);
  const back = (d.getUTCDay() + 1) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}
function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function ShiftsTab({ branchId, employees }: { branchId: string; employees: Employee[] }) {
  const { t, locale } = useLocale();
  const [from, setFrom] = useState(weekStart(localToday()));
  const [days, setDays] = useState<string[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [cell, setCell] = useState<{ employeeId: string; date: string } | null>(null);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("16:00");

  const load = useCallback(async () => {
    const res = await fetch(`/api/hr/shifts?branchId=${branchId}&from=${from}`);
    if (res.ok) {
      const j = await res.json();
      setDays(j.days);
      setShifts(j.shifts);
    }
  }, [branchId, from]);
  useEffect(() => { load(); }, [load]);

  const shiftOf = (employeeId: string, date: string) => shifts.find((s) => s.employeeId === employeeId && s.date === date);

  function open(employeeId: string, date: string) {
    const s = shiftOf(employeeId, date);
    setStart(s?.startTime ?? "08:00");
    setEnd(s?.endTime ?? "16:00");
    setCell({ employeeId, date });
  }
  async function save() {
    if (!cell) return;
    await fetch("/api/hr/shifts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cell, startTime: start, endTime: end }) });
    setCell(null);
    load();
  }
  async function clear() {
    if (!cell) return;
    await fetch("/api/hr/shifts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cell) });
    setCell(null);
    load();
  }
  async function copyLastWeek() {
    await fetch("/api/hr/shifts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchId, fromWeek: addDays(from, -7), toWeek: from }) });
    load();
  }

  const dayName = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString(locale === "ar" ? "ar-IQ" : "en-GB", { weekday: "short", day: "numeric", month: "numeric", timeZone: "UTC" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setFrom(addDays(from, -7))}>{t("admin.hr.prevWeek")}</Button>
          <span className="text-sm font-medium">{days[0]} → {days[6]}</span>
          <Button size="sm" variant="outline" onClick={() => setFrom(addDays(from, 7))}>{t("admin.hr.nextWeek")}</Button>
        </div>
        <Button size="sm" variant="ghost" onClick={copyLastWeek}><Copy className="h-4 w-4" /> {t("admin.hr.copyLastWeek")}</Button>
      </div>

      {cell && (
        <Card className="p-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{employees.find((e) => e.id === cell.employeeId)?.name} · {dayName(cell.date)}</span>
          {PRESETS.map((p) => (
            <button key={p.key} onClick={() => { setStart(p.start); setEnd(p.end); }} className={cn("px-2.5 py-1 rounded-lg text-xs", start === p.start && end === p.end ? "bg-accent/15 text-accent-ink" : "bg-muted")}>
              {t(`admin.hr.preset.${p.key}`)}
            </button>
          ))}
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={input} />
          <span>→</span>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={input} />
          <Button size="sm" onClick={save}>{t("admin.hr.save")}</Button>
          <Button size="sm" variant="ghost" onClick={clear}>{t("admin.hr.dayOff")}</Button>
          <Button size="sm" variant="ghost" onClick={() => setCell(null)}>{t("admin.common.cancel")}</Button>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-start p-2">{t("admin.hr.employee")}</th>
              {days.map((d) => <th key={d} className={cn("p-2 font-medium", d === localToday() && "text-accent-ink")}>{dayName(d)}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((e) => (
              <tr key={e.id}>
                <td className="p-2 font-medium whitespace-nowrap">{e.name}</td>
                {days.map((d) => {
                  const s = shiftOf(e.id, d);
                  return (
                    <td key={d} className="p-1 text-center">
                      <button onClick={() => open(e.id, d)} className={cn("w-full rounded-lg px-1.5 py-2 text-xs tabular-nums", s ? "bg-accent/15 text-accent-ink font-semibold" : "text-muted-foreground hover:bg-muted")}>
                        {s ? `${s.startTime}–${s.endTime}` : "—"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t("admin.hr.noEmployees")}</p>}
      </Card>
    </div>
  );
}

// ─── daily notes ──────────────────────────────────────────────────────────

const KIND_TONE: Record<string, "neutral" | "success" | "danger" | "accent"> = { NOTE: "neutral", PRAISE: "success", WARNING: "danger", TASK: "accent" };

function NotesTab({ branchId, employees }: { branchId: string; employees: Employee[] }) {
  const { t } = useLocale();
  const [date, setDate] = useState(localToday());
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [kind, setKind] = useState("NOTE");
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    const p = new URLSearchParams({ branchId });
    if (employeeFilter) p.set("employeeId", employeeFilter);
    else p.set("date", date);
    const res = await fetch(`/api/hr/notes?${p}`);
    if (res.ok) setNotes((await res.json()).notes);
  }, [branchId, date, employeeFilter]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!employeeId && employees[0]) setEmployeeId(employees[0].id); }, [employees, employeeId]);

  async function add() {
    if (!text.trim() || !employeeId) return;
    await fetch("/api/hr/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ employeeId, date, kind, text: text.trim() }) });
    setText("");
    load();
  }
  async function remove(id: string) {
    await fetch(`/api/hr/notes?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={input}>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <input type="date" value={date} max={localToday()} onChange={(e) => setDate(e.target.value)} className={input} />
          {(["NOTE", "PRAISE", "WARNING", "TASK"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium", kind === k ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>{t(`admin.hr.kind.${k}`)}</button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={t("admin.hr.notePlaceholder")} className={cn(input, "w-full")} />
        <Button size="sm" onClick={add} disabled={!text.trim()}><StickyNote className="h-4 w-4" /> {t("admin.hr.addNote")}</Button>
      </Card>

      <div className="flex items-center gap-2">
        <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className={input}>
          <option value="">{t("admin.hr.notesOfDay", { date })}</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{t("admin.hr.historyOf", { name: e.name })}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {notes.map((n) => (
          <Card key={n.id} className="p-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm"><Badge tone={KIND_TONE[n.kind] ?? "neutral"} className="me-2">{t(`admin.hr.kind.${n.kind}`)}</Badge><b>{n.employee.name}</b></p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{n.text}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{n.date}{n.author ? ` · ${n.author}` : ""}</p>
            </div>
            <button onClick={() => remove(n.id)} className="p-1.5 text-muted-foreground hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
          </Card>
        ))}
        {notes.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.hr.noNotes")}</p>}
      </div>
    </div>
  );
}

// ─── payroll ──────────────────────────────────────────────────────────────

function PayrollTab({ branchId }: { branchId: string }) {
  const { t } = useLocale();
  const [period, setPeriod] = useState(localToday().slice(0, 7));
  const [data, setData] = useState<any | null>(null);
  const [adjFor, setAdjFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/hr/payroll?branchId=${branchId}&period=${period}`);
    if (res.ok) setData(await res.json());
  }, [branchId, period]);
  useEffect(() => { load(); }, [load]);

  async function act(body: Record<string, unknown>) {
    setError(null);
    const res = await fetch("/api/hr/payroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error === "already_paid" ? t("admin.hr.err.alreadyPaid") : j.error === "negative_net" ? t("admin.hr.err.negative") : t("admin.hr.err.generic"));
    }
    load();
  }

  const cur = data?.currency;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} className={input} />
        {data && (
          <div className="flex gap-4 text-sm">
            <span>{t("admin.hr.totalNet")}: <b>{formatMoney(data.totals.net, cur)}</b></span>
            <span className="text-success">{t("admin.hr.paidTotal")}: <b>{formatMoney(data.totals.paid, cur)}</b></span>
            <span className="text-warning">{t("admin.hr.unpaidTotal")}: <b>{formatMoney(data.totals.unpaid, cur)}</b></span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{t("admin.hr.payrollHint")}</p>
      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="space-y-2">
        {data?.rows.map((r: any) => (
          <Card key={r.employeeId} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{r.name} {r.jobTitle ? <span className="text-xs text-muted-foreground">· {r.jobTitle}</span> : null}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`admin.hr.salary.${r.salaryType}`)} · {t("admin.hr.daysWorked", { n: r.days })} · {t("admin.hr.hours", { n: hrs(r.hours) })}
                  {r.openPunches > 0 && <span className="text-warning"> · {t("admin.hr.openPunches", { n: r.openPunches })}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-sm tabular-nums">
                <span>{formatMoney(r.base, cur)}</span>
                {r.bonuses > 0 && <span className="text-success">+{formatMoney(r.bonuses, cur)}</span>}
                {r.deductions > 0 && <span className="text-danger">−{formatMoney(r.deductions, cur)}</span>}
                {r.advances > 0 && <span className="text-danger">−{formatMoney(r.advances, cur)} {t("admin.hr.adj.ADVANCE")}</span>}
                <span className="font-display text-lg font-bold">= {formatMoney(r.net, cur)}</span>
                {r.paid ? (
                  <>
                    <Badge tone="success"><Check className="h-3 w-3" /> {t("admin.hr.paidOn", { date: new Date(r.paid.paidAt).toLocaleDateString() })}</Badge>
                    <Button size="sm" variant="ghost" onClick={() => confirm(t("admin.hr.confirmUnpay")) && act({ action: "unpay", employeeId: r.employeeId, period })}><Undo2 className="h-3.5 w-3.5" /></Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setAdjFor(adjFor === r.employeeId ? null : r.employeeId)}>{t("admin.hr.addAdjustment")}</Button>
                    <Button size="sm" onClick={() => confirm(t("admin.hr.confirmPay", { name: r.name, amount: formatMoney(r.net, cur) })) && act({ action: "pay", employeeId: r.employeeId, period })}>
                      <Wallet className="h-3.5 w-3.5" /> {t("admin.hr.pay")}
                    </Button>
                  </>
                )}
              </div>
            </div>
            {r.adjustments.length > 0 && (
              <ul className="mt-2 text-xs space-y-1">
                {r.adjustments.map((a: any) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <Badge tone={a.type === "BONUS" ? "success" : "danger"}>{t(`admin.hr.adj.${a.type}`)}</Badge>
                    <span className="tabular-nums">{formatMoney(a.amount, cur)}</span>
                    {a.note && <span className="text-muted-foreground">{a.note}</span>}
                    {!r.paid && <button onClick={() => act({ action: "removeAdjustment", id: a.id })} className="text-muted-foreground hover:text-danger"><Trash2 className="h-3 w-3" /></button>}
                  </li>
                ))}
              </ul>
            )}
            {adjFor === r.employeeId && <AdjustmentForm onSave={(b) => { setAdjFor(null); act({ action: "adjust", employeeId: r.employeeId, period, ...b }); }} onCancel={() => setAdjFor(null)} />}
          </Card>
        ))}
        {data && data.rows.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.hr.noEmployees")}</p>}
      </div>
    </div>
  );
}

function AdjustmentForm({ onSave, onCancel }: { onSave: (b: { type: string; amount: number; note?: string }) => void; onCancel: () => void }) {
  const { t } = useLocale();
  const [type, setType] = useState("BONUS");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 p-3">
      {(["BONUS", "DEDUCTION", "ADVANCE"] as const).map((k) => (
        <button key={k} onClick={() => setType(k)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium", type === k ? "bg-accent/15 text-accent-ink" : "bg-surface text-muted-foreground")}>{t(`admin.hr.adj.${k}`)}</button>
      ))}
      <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t("admin.orders.amount")} className={cn(input, "w-32")} />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("admin.hr.note")} className={cn(input, "flex-1 min-w-[140px]")} />
      <Button size="sm" disabled={!(parseFloat(amount) > 0)} onClick={() => onSave({ type, amount: parseFloat(amount), note: note.trim() || undefined })}>{t("admin.hr.save")}</Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>{t("admin.common.cancel")}</Button>
    </div>
  );
}

