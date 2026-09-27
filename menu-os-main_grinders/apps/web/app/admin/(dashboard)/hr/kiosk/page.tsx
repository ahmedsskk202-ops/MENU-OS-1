"use client";

import { useEffect, useState } from "react";
import { Fingerprint, Delete, LogIn, LogOut } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { useBranch } from "@/lib/BranchContext";
import { cn } from "@/lib/cn";

/**
 * The attendance tablet. Leave it open at the entrance: each employee types their code
 * and is clocked in, or out if they are already in. No names to pick, nothing to
 * approve — the manager fixes mistakes from the HR screen.
 */
export default function KioskPage() {
  const { t } = useLocale();
  const { branchId, currentBranch } = useBranch();
  const [code, setCode] = useState("");
  const [now, setNow] = useState(new Date());
  const [result, setResult] = useState<{ ok: boolean; text: string; sub?: string; action?: "IN" | "OUT" } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!result) return;
    const id = setTimeout(() => setResult(null), 4000);
    return () => clearTimeout(id);
  }, [result]);

  async function submit(value = code) {
    if (!branchId || value.length < 3 || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/hr/punch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ branchId, code: value }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, text: t(j.error === "other_branch" ? "admin.kiosk.otherBranch" : "admin.kiosk.unknown") });
      } else {
        const at = new Date(j.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setResult({
          ok: true,
          action: j.action,
          text: t(j.action === "IN" ? "admin.kiosk.welcome" : "admin.kiosk.goodbye", { name: j.name }),
          sub: j.repeated ? t("admin.kiosk.already", { time: at }) : j.action === "IN" ? t("admin.kiosk.inAt", { time: at }) : t("admin.kiosk.outAt", { time: at, hours: j.hours?.toFixed(1) ?? "0" }),
        });
      }
    } finally {
      setCode("");
      setBusy(false);
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) setCode((c) => (c + e.key).slice(0, 8));
      else if (e.key === "Backspace") setCode((c) => c.slice(0, -1));
      else if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <Fingerprint className="h-12 w-12 mx-auto text-accent-ink" />
        <h1 className="font-display text-2xl font-semibold mt-2">{t("admin.kiosk.title")}</h1>
        <p className="text-sm text-muted-foreground">{currentBranch?.name}</p>
        <p className="font-display text-5xl font-bold tabular-nums mt-4" dir="ltr">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="text-sm text-muted-foreground">{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>

        <div className={cn("mt-6 h-24 rounded-2xl flex flex-col items-center justify-center px-4 transition-colors", result ? (result.ok ? (result.action === "IN" ? "bg-success/15 text-success" : "bg-accent/15 text-accent-ink") : "bg-danger/15 text-danger") : "bg-muted")}>
          {result ? (
            <>
              <p className="font-semibold text-lg flex items-center gap-2">
                {result.action === "IN" && <LogIn className="h-5 w-5" />}
                {result.action === "OUT" && <LogOut className="h-5 w-5" />}
                {result.text}
              </p>
              {result.sub && <p className="text-sm">{result.sub}</p>}
            </>
          ) : (
            <p className="font-mono text-3xl tracking-[0.5em]" dir="ltr">{code ? "•".repeat(code.length) : <span className="text-base tracking-normal text-muted-foreground font-sans">{t("admin.kiosk.enterCode")}</span>}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6" dir="ltr">
          {keys.map((k) => (
            <button
              key={k}
              disabled={busy}
              onClick={() => (k === "del" ? setCode((c) => c.slice(0, -1)) : k === "ok" ? submit() : setCode((c) => (c + k).slice(0, 8)))}
              className={cn(
                "h-16 rounded-2xl text-2xl font-semibold border border-border active:scale-95 transition",
                k === "ok" ? "bg-accent text-accent-foreground" : "bg-surface-raised hover:bg-muted"
              )}
            >
              {k === "del" ? <Delete className="h-6 w-6 mx-auto" /> : k === "ok" ? t("admin.kiosk.ok") : k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
