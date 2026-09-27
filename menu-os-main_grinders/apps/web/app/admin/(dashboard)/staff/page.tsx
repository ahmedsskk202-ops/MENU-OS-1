"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus, Lock, ShieldCheck, Search, Pencil, Trash2, Plus, KeyRound, Fingerprint, RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/cn";

interface Assignment { id: string; roleId: string; roleName: string; branchId: string | null; branchName: string | null }
interface StaffRow { id: string; name: string; email: string; phone: string | null; attendanceCode: string | null; isActive: boolean; isSelf: boolean; editable: boolean; assignments: Assignment[] }
interface RoleRow { id: string; name: string; isSystem: boolean; permissions: string[]; userCount: number; assignable: boolean }
interface RolesPayload { roles: RoleRow[]; branches: { id: string; name: string }[]; canAssignAllBranches: boolean; allPermissions: string[]; myPermissions: string[] }

/** Permissions grouped by the part of the cafe they belong to, for reading and editing. */
const PERMISSION_GROUPS: { key: string; permissions: string[] }[] = [
  { key: "floor", permissions: ["dashboard.view", "orders.view", "orders.manage", "orders.serve", "tables.manage", "waiter_requests.view", "waiter_requests.manage", "reservations.manage", "delivery.manage"] },
  { key: "kitchen", permissions: ["kitchen.view", "kitchen.manage", "availability.manage", "menu.manage"] },
  { key: "inventory", permissions: ["inventory.view", "inventory.waste", "inventory.manage"] },
  { key: "money", permissions: ["payments.manage", "discounts.apply", "discounts.approve", "refunds.manage", "shifts.manage", "cash_movements.manage", "expenses.manage", "revenue.view"] },
  { key: "insight", permissions: ["reports.view", "reports.export", "analytics.view", "audit_log.view"] },
  { key: "marketing", permissions: ["promotions.manage"] },
  { key: "hr", permissions: ["hr.manage", "attendance.kiosk"] },
  { key: "admin", permissions: ["staff.manage", "qr.manage", "settings.manage"] },
];

export default function StaffPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState<"staff" | "roles">("staff");
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [roles, setRoles] = useState<RolesPayload | null>(null);

  async function refresh() {
    const [s, r] = await Promise.all([fetch("/api/staff"), fetch("/api/staff/roles")]);
    if (s.ok) setStaff((await s.json()).staff);
    if (r.ok) setRoles(await r.json());
  }
  useEffect(() => { refresh(); }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <h1 className="font-display text-3xl font-semibold mb-1">{t("admin.staff.title")}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t("admin.staff.intro")}</p>
      <div className="flex gap-2 mb-6">
        {(["staff", "roles"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", tab === k ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground")}>
            {t(`admin.staff.tab.${k}`)}
          </button>
        ))}
      </div>
      {roles && tab === "staff" && <StaffTab staff={staff} roles={roles} onChange={refresh} />}
      {roles && tab === "roles" && <RolesTab roles={roles} onChange={refresh} />}
    </div>
  );
}

function useRoleName() {
  const { t } = useLocale();
  return (name: string) => {
    const key = `admin.role.${name}`;
    const s = t(key);
    return s === key ? name : s;
  };
}

function errorText(t: (k: string) => string, code: string | undefined) {
  const key = `admin.staff.err.${code ?? "generic"}`;
  const s = t(key);
  return s === key ? t("admin.staff.err.generic") : s;
}

// ─── staff ────────────────────────────────────────────────────────────────

function StaffTab({ staff, roles, onChange }: { staff: StaffRow[]; roles: RolesPayload; onChange: () => void }) {
  const { t } = useLocale();
  const roleName = useRoleName();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = staff.filter((s) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return s.name.toLowerCase().includes(needle) || s.email.includes(needle) || s.assignments.some((a) => roleName(a.roleName).toLowerCase().includes(needle));
  });

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute top-2.5 start-3 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("admin.staff.search")} className="w-64 rounded-xl border border-border bg-surface-raised ps-9 pe-3 py-2 text-sm" />
        </div>
        {!adding && <Button size="sm" onClick={() => setAdding(true)}><UserPlus className="h-4 w-4" /> {t("admin.staff.add")}</Button>}
      </div>

      {adding && <StaffForm roles={roles} onCancel={() => setAdding(false)} onSaved={() => { setAdding(false); onChange(); }} />}

      <div className="space-y-2">
        {filtered.map((s) => (
          <Card key={s.id} className={cn("p-4", !s.isActive && "opacity-60")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium flex items-center gap-2">
                  {s.name}
                  {s.isSelf && <Badge tone="accent">{t("admin.staff.you")}</Badge>}
                  {!s.isActive && <Badge tone="danger">{t("admin.staff.disabled")}</Badge>}
                </p>
                <p className="text-xs text-muted-foreground" dir="ltr">{s.email}{s.phone ? ` · ${s.phone}` : ""}</p>
                {s.attendanceCode && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Fingerprint className="h-3.5 w-3.5" /> {t("admin.staff.attendanceCode")}: <span dir="ltr" className="font-mono font-semibold text-foreground">{s.attendanceCode}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {s.assignments.map((a) => (
                  <Badge key={a.id} tone="neutral">
                    {roleName(a.roleName)} · {a.branchName ?? t("admin.staff.allBranches")}
                  </Badge>
                ))}
                {s.assignments.length === 0 && <Badge tone="warning">{t("admin.staff.noRole")}</Badge>}
                {s.editable ? (
                  <Button size="sm" variant="ghost" onClick={() => setEditing(editing === s.id ? null : s.id)}>
                    <Pencil className="h-3.5 w-3.5" /> {t("admin.staff.edit")}
                  </Button>
                ) : (
                  !s.isSelf && <span title={t("admin.staff.lockedHint")} className="text-muted-foreground"><Lock className="h-4 w-4" /></span>
                )}
              </div>
            </div>
            {editing === s.id && (
              <StaffForm roles={roles} existing={s} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); onChange(); }} />
            )}
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">{t("admin.staff.empty")}</p>}
      </div>
    </>
  );
}

function StaffForm({ roles, existing, onCancel, onSaved }: { roles: RolesPayload; existing?: StaffRow; onCancel: () => void; onSaved: () => void }) {
  const { t } = useLocale();
  const roleName = useRoleName();
  const assignable = roles.roles.filter((r) => r.assignable);
  const first = existing?.assignments[0];
  const [name, setName] = useState(existing?.name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(first?.roleId ?? assignable.find((r) => r.name === "Waiter")?.id ?? assignable[0]?.id ?? "");
  const [branchId, setBranchId] = useState<string>(first ? first.branchId ?? "ALL" : roles.branches[0]?.id ?? "ALL");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [code, setCode] = useState(existing?.attendanceCode ?? "");

  async function generateCode() {
    const res = await fetch("/api/hr/next-code");
    if (res.ok) setCode((await res.json()).code);
  }
  // A new person gets a code straight away; the manager can change or clear it.
  useEffect(() => {
    if (!existing) generateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const role = roles.roles.find((r) => r.id === roleId);
  const screens = role ? ADMIN_NAV.filter((n) => role.permissions.includes(n.permission)) : [];

  async function save() {
    setError(null);
    if (name.trim().length < 2) return setError(t("admin.staff.err.name"));
    if (!existing && password.length < 8) return setError(t("admin.staff.err.password"));
    if (existing && password && password.length < 8) return setError(t("admin.staff.err.password"));
    if (code && !/^\d{3,8}$/.test(code)) return setError(t("admin.staff.err.code"));
    setSaving(true);
    try {
      const roleChanged = !existing || roleId !== first?.roleId || (branchId === "ALL" ? null : branchId) !== (first?.branchId ?? null);
      const body: Record<string, unknown> = { name: name.trim(), email: email.trim(), phone: phone.trim() || null };
      if (password) body.password = password;
      if (roleChanged) { body.roleId = roleId; body.branchId = branchId === "ALL" ? null : branchId; }
      if (existing) body.isActive = isActive;
      if (!existing || code !== (existing.attendanceCode ?? "")) body.attendanceCode = code || null;
      const res = await fetch(existing ? `/api/staff/${existing.id}` : "/api/staff", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return setError(errorText(t, (await res.json().catch(() => ({}))).error));
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm";
  return (
    <div className={cn("space-y-3", existing ? "mt-4 pt-4 border-t border-border" : "mb-5 rounded-2xl border border-border bg-surface p-5")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs text-muted-foreground space-y-1">{t("admin.staff.name")}<input value={name} onChange={(e) => setName(e.target.value)} className={input} /></label>
        <label className="text-xs text-muted-foreground space-y-1">{t("admin.staff.email")}<input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} /></label>
        <label className="text-xs text-muted-foreground space-y-1">{t("admin.staff.phone")}<input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} /></label>
        <label className="text-xs text-muted-foreground space-y-1">
          <span className="flex items-center gap-1"><KeyRound className="h-3 w-3" /> {existing ? t("admin.staff.newPassword") : t("admin.staff.password")}</span>
          <input dir="ltr" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={existing ? t("admin.staff.passwordKeep") : ""} className={input} />
        </label>
        <div className="text-xs text-muted-foreground space-y-1">
          <span className="flex items-center gap-1"><Fingerprint className="h-3 w-3" /> {t("admin.staff.attendanceCode")}</span>
          <div className="flex gap-2">
            <input dir="ltr" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="1234" className={cn(input, "font-mono tracking-widest")} />
            <Button type="button" size="sm" variant="outline" onClick={generateCode} className="h-auto shrink-0">
              <RefreshCw className="h-3.5 w-3.5" /> {t("admin.staff.generateCode")}
            </Button>
          </div>
          <p className="text-[11px]">{t("admin.staff.attendanceHint")}</p>
        </div>
        <div className="hidden sm:block" />
        <label className="text-xs text-muted-foreground space-y-1">{t("admin.staff.role")}
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className={input}>
            {assignable.map((r) => <option key={r.id} value={r.id}>{roleName(r.name)}{r.isSystem ? "" : ` (${t("admin.staff.custom")})`}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted-foreground space-y-1">{t("admin.staff.branch")}
          <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className={input}>
            {roles.canAssignAllBranches && <option value="ALL">{t("admin.staff.allBranches")}</option>}
            {roles.branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
      </div>
      {existing && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          {t("admin.staff.activeLabel")}
        </label>
      )}
      {role && (
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-xs font-semibold mb-2">{t("admin.staff.willSee")}</p>
          <div className="flex flex-wrap gap-1.5">
            {screens.map((n) => <Badge key={n.href} tone="accent">{t(n.label)}</Badge>)}
            {screens.length === 0 && <span className="text-xs text-muted-foreground">{t("admin.staff.noScreens")}</span>}
          </div>
        </div>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} loading={saving}>{existing ? t("admin.staff.save") : t("admin.staff.create")}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t("admin.common.cancel")}</Button>
      </div>
    </div>
  );
}

// ─── roles ────────────────────────────────────────────────────────────────

function RolesTab({ roles, onChange }: { roles: RolesPayload; onChange: () => void }) {
  const { t } = useLocale();
  const roleName = useRoleName();
  const [editing, setEditing] = useState<string | "new" | null>(null);

  async function remove(id: string) {
    if (!confirm(t("admin.staff.confirmDeleteRole"))) return;
    const res = await fetch(`/api/staff/roles/${id}`, { method: "DELETE" });
    if (!res.ok) alert(errorText(t, (await res.json().catch(() => ({}))).error));
    onChange();
  }

  return (
    <>
      <div className="flex justify-between items-center gap-3 mb-4 flex-wrap">
        <p className="text-sm text-muted-foreground max-w-2xl">{t("admin.staff.rolesIntro")}</p>
        {editing !== "new" && <Button size="sm" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> {t("admin.staff.newRole")}</Button>}
      </div>
      {editing === "new" && <RoleEditor roles={roles} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); onChange(); }} />}
      <div className="grid gap-3 md:grid-cols-2">
        {roles.roles.map((r) => {
          const screens = ADMIN_NAV.filter((n) => r.permissions.includes(n.permission));
          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent-ink" /> {roleName(r.name)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.isSystem ? t("admin.staff.systemRole") : t("admin.staff.customRole")} · {t("admin.staff.userCount", { n: r.userCount })} · {t("admin.staff.permCount", { n: r.permissions.length })}
                  </p>
                </div>
                {!r.isSystem && r.assignable && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(editing === r.id ? null : r.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                    {r.userCount === 0 && <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5 text-danger" /></Button>}
                  </div>
                )}
              </div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">{t("admin.staff.screens")}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {screens.map((n) => <Badge key={n.href} tone="accent" className="text-[11px] py-0.5">{t(n.label)}</Badge>)}
                {screens.length === 0 && <span className="text-xs text-muted-foreground">{t("admin.staff.noScreens")}</span>}
              </div>
              <details>
                <summary className="text-xs cursor-pointer text-muted-foreground">{t("admin.staff.showPermissions")}</summary>
                <div className="mt-2 space-y-2">
                  {PERMISSION_GROUPS.map((g) => {
                    const held = g.permissions.filter((p) => r.permissions.includes(p));
                    if (held.length === 0) return null;
                    return (
                      <div key={g.key}>
                        <p className="text-[11px] font-semibold">{t(`admin.permGroup.${g.key}`)}</p>
                        <ul className="text-xs text-muted-foreground list-disc ps-5">
                          {held.map((p) => <li key={p}>{t(`admin.perm.${p}`)}</li>)}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </details>
              {editing === r.id && <RoleEditor roles={roles} existing={r} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); onChange(); }} />}
            </Card>
          );
        })}
      </div>
    </>
  );
}

function RoleEditor({ roles, existing, onCancel, onSaved }: { roles: RolesPayload; existing?: RoleRow; onCancel: () => void; onSaved: () => void }) {
  const { t } = useLocale();
  const mine = useMemo(() => new Set(roles.myPermissions), [roles.myPermissions]);
  const [name, setName] = useState(existing?.name ?? "");
  const [picked, setPicked] = useState<Set<string>>(new Set(existing?.permissions ?? []));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggle(p: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  async function save() {
    setError(null);
    if (name.trim().length < 2) return setError(t("admin.staff.err.name"));
    if (picked.size === 0) return setError(t("admin.staff.err.noPerms"));
    setSaving(true);
    try {
      const res = await fetch(existing ? `/api/staff/roles/${existing.id}` : "/api/staff/roles", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), permissions: [...picked] }),
      });
      if (!res.ok) return setError(errorText(t, (await res.json().catch(() => ({}))).error));
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 mb-4 rounded-2xl border border-border bg-surface p-4 space-y-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("admin.staff.roleName")} className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm" />
      <div className="grid sm:grid-cols-2 gap-3">
        {PERMISSION_GROUPS.map((g) => (
          <div key={g.key}>
            <p className="text-xs font-semibold mb-1">{t(`admin.permGroup.${g.key}`)}</p>
            {g.permissions.map((p) => (
              <label key={p} className={cn("flex items-center gap-2 text-xs py-0.5", !mine.has(p) && "opacity-40")}>
                <input type="checkbox" disabled={!mine.has(p)} checked={picked.has(p)} onChange={() => toggle(p)} />
                {t(`admin.perm.${p}`)}
              </label>
            ))}
          </div>
        ))}
      </div>
      {error && <p className="text-danger text-xs">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} loading={saving}>{t("admin.staff.save")}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t("admin.common.cancel")}</Button>
      </div>
    </div>
  );
}
