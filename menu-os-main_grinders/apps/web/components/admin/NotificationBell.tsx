"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Volume2, VolumeX, Settings2, CheckCheck } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/LocaleContext";
import { enumLabel } from "@/lib/i18n-admin";
import { notificationText } from "@/lib/notification-text";
import { loadSoundSettings, playSound, saveSoundSettings, unlockAudio, type SoundKind, type SoundSettings } from "@/lib/notification-sound";
import { cn } from "@/lib/cn";

export function NotificationBell() {
  const { branchId } = useBranch();
  const { t, locale } = useLocale();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sound, setSound] = useState<SoundSettings>({ enabled: true, volume: 0.8, repeatCalls: true });
  const [osPermission, setOsPermission] = useState<string>("unsupported");
  const rootRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const res = await fetch(`/api/notifications${branchId ? `?branchId=${branchId}` : ""}`);
    if (res.ok) setNotifications((await res.json()).notifications);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  useEffect(() => {
    setSound(loadSoundSettings());
    const onChange = (e: Event) => setSound((e as CustomEvent<SoundSettings>).detail);
    window.addEventListener("mos-sound-settings", onChange);
    // System notifications need HTTPS (or localhost); on a plain LAN address the browser
    // does not offer them, and the in-page pop-up + sound is what works.
    if ("Notification" in window && window.isSecureContext) setOsPermission(Notification.permission);
    return () => window.removeEventListener("mos-sound-settings", onChange);
  }, []);

  // Close on Escape or a click outside, so the panel never lingers over the page.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (event.type === "notification.created") refresh();
  });

  const unread = notifications.filter((n) => !n.isRead);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  async function markAllRead() {
    await Promise.all(unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PATCH" })));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function update(patch: Partial<SoundSettings>) {
    const next = { ...sound, ...patch };
    setSound(next);
    saveSoundSettings(next);
  }

  async function test(kind: SoundKind) {
    await unlockAudio();
    playSound(kind, sound.volume);
  }

  const iconBtn = "relative h-10 w-10 flex items-center justify-center rounded-full border border-border bg-surface-raised hover:bg-muted transition-colors";

  return (
    <div ref={rootRef} className="relative flex items-center gap-2">
      <button
        onClick={() => update({ enabled: !sound.enabled })}
        title={sound.enabled ? t("admin.sound.mute") : t("admin.sound.unmute")}
        aria-label={sound.enabled ? t("admin.sound.mute") : t("admin.sound.unmute")}
        className={cn(iconBtn, sound.enabled ? "text-accent-ink" : "text-muted-foreground")}
      >
        {sound.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <button
        onClick={() => setOpen((v) => !v)}
        title={t("admin.notifications.title")}
        aria-label={t("admin.notifications.title")}
        aria-expanded={open}
        className={cn(iconBtn, open && "bg-muted")}
      >
        <Bell className="h-4 w-4" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -end-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-danger text-background text-[11px] font-bold flex items-center justify-center">
            {unread.length > 99 ? "99+" : unread.length}
          </span>
        )}
      </button>

      {/* Anchored to the logical end, so it opens toward the page in both Arabic and English. */}
      {open && (
        <div className="absolute top-full mt-3 end-0 w-[24rem] max-w-[calc(100vw-1.5rem)] max-h-[75vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl z-[70] overflow-hidden animate-fade-up">
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent-ink" /> {t("admin.notifications.title")}
                {unread.length > 0 && <Badge tone="danger" className="text-[11px]">{unread.length}</Badge>}
              </p>
              {unread.length > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-medium text-accent-ink hover:underline">
                  <CheckCheck className="h-4 w-4" /> {t("admin.sound.markAll")}
                </button>
              )}
            </div>
            <button
              onClick={() => setShowSettings((v) => !v)}
              className={cn(
                "mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium transition-colors",
                showSettings ? "bg-accent/15 text-accent-ink" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings2 className="h-4 w-4" /> {t("admin.sound.settings")}
            </button>
          </div>

          <div className="overflow-y-auto">
            {showSettings && (
              <div className="p-4 border-b border-border space-y-4 text-sm bg-muted/30">
                <label className="flex items-center justify-between gap-3">
                  <span>{t("admin.sound.enabled")}</span>
                  <input type="checkbox" className="h-4 w-4" checked={sound.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
                </label>
                <label className="flex items-center gap-3">
                  <span className="shrink-0">{t("admin.sound.volume")}</span>
                  <input type="range" min={0.1} max={1} step={0.05} value={sound.volume} onChange={(e) => update({ volume: parseFloat(e.target.value) })} className="flex-1" />
                  <span dir="ltr" className="w-10 text-end text-xs text-muted-foreground tabular-nums">{Math.round(sound.volume * 100)}%</span>
                </label>
                <label className="flex items-center justify-between gap-3">
                  <span>{t("admin.sound.repeatCalls")}</span>
                  <input type="checkbox" className="h-4 w-4" checked={sound.repeatCalls} onChange={(e) => update({ repeatCalls: e.target.checked })} />
                </label>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">{t("admin.sound.test")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["call", "order", "ready", "alert", "info"] as SoundKind[]).map((k) => (
                      <button key={k} onClick={() => test(k)} className="px-2 py-2 rounded-lg bg-surface-raised border border-border text-xs hover:bg-muted">
                        {t(`admin.sound.kind.${k}`)}
                      </button>
                    ))}
                  </div>
                </div>
                {osPermission === "default" && (
                  <button onClick={async () => setOsPermission(await Notification.requestPermission())} className="w-full rounded-lg bg-surface-raised border border-border py-2 text-xs">
                    {t("admin.sound.allowSystem")}
                  </button>
                )}
              </div>
            )}

            {notifications.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted-foreground">{t("admin.notifications.empty")}</p>}
            {notifications.map((n) => {
              const text = notificationText(n, t);
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn("w-full text-start px-4 py-3 border-b border-border/60 last:border-0 hover:bg-muted flex gap-3", n.isRead && "opacity-60")}
                >
                  <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", n.isRead ? "bg-transparent" : "bg-accent")} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      {n.type && <span className="text-[11px] font-semibold text-accent-ink">{enumLabel(t, n.type)}</span>}
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString(locale === "ar" ? "ar-IQ" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </span>
                    <span className="block text-sm font-semibold mt-1 leading-snug" dir="auto">{text.title}</span>
                    {text.body && <span className="block text-xs text-muted-foreground mt-1 leading-relaxed" dir="auto">{text.body}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
