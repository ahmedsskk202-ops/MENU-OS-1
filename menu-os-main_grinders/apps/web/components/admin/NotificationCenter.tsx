"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BellRing, ChefHat, CheckCircle2, AlertTriangle, Info, Volume2, X } from "lucide-react";
import { useBranch } from "@/lib/BranchContext";
import { useRealtime } from "@/lib/useRealtime";
import { useLocale } from "@/lib/LocaleContext";
import { visibleNotificationTypes } from "@/lib/notification-audience";
import { notificationText } from "@/lib/notification-text";
import { PERMISSIONS } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth";
import { isAudioUnlocked, loadSoundSettings, playSound, soundForType, unlockAudio, type SoundKind, type SoundSettings } from "@/lib/notification-sound";
import { cn } from "@/lib/cn";

interface Toast {
  id: string;
  type: string;
  kind: SoundKind;
  title: string;
  body: string | null;
  at: number;
  waiterRequestId?: string;
  data: Record<string, unknown>;
}

const TOAST_MS: Record<SoundKind, number> = { call: 0, order: 12_000, ready: 15_000, alert: 12_000, info: 8_000 };
const REPEAT_EVERY_MS = 20_000;
const MAX_REPEATS = 6;

const ICON: Record<SoundKind, typeof Info> = { call: BellRing, order: ChefHat, ready: CheckCircle2, alert: AlertTriangle, info: Info };
const TONE: Record<SoundKind, string> = {
  call: "border-danger bg-danger text-white",
  order: "border-accent-ink/40 bg-surface",
  ready: "border-success/50 bg-surface",
  alert: "border-warning/50 bg-surface",
  info: "border-border bg-surface",
};

/**
 * Live alerts for the staff console: every notification meant for this person plays its
 * sound and pops up on screen, whichever page they are on. A waiter call stays up — and
 * keeps chiming every 20 seconds — until someone opens it or it is answered.
 */
export function NotificationCenter() {
  const { data } = useSession();
  const user = data?.user as SessionUser | undefined;
  const { branchId } = useBranch();
  const { t } = useLocale();
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [settings, setSettings] = useState<SoundSettings>({ enabled: true, volume: 0.8, repeatCalls: true });
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const repeats = useRef(new Map<string, { count: number; last: number }>());
  const baseTitle = useRef<string | null>(null);

  useEffect(() => {
    setSettings(loadSoundSettings());
    const onChange = (e: Event) => setSettings((e as CustomEvent<SoundSettings>).detail);
    window.addEventListener("mos-sound-settings", onChange);
    return () => window.removeEventListener("mos-sound-settings", onChange);
  }, []);

  // Browsers only allow sound after the first touch. Unlock on the first one, anywhere.
  useEffect(() => {
    const unlock = async () => {
      if (await unlockAudio()) setNeedsUnlock(false);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    const id = setTimeout(() => setNeedsUnlock(!isAudioUnlocked()), 1500);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      clearTimeout(id);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
    repeats.current.delete(id);
  }, []);

  // Auto-hide everything except waiter calls.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((x) => TOAST_MS[x.kind] === 0 || now - x.at < TOAST_MS[x.kind]));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Keep chiming for unanswered waiter calls.
  useEffect(() => {
    const id = setInterval(() => {
      if (!settings.enabled || !settings.repeatCalls) return;
      const now = Date.now();
      for (const toast of toasts) {
        if (toast.kind !== "call") continue;
        const r = repeats.current.get(toast.id) ?? { count: 0, last: toast.at };
        if (r.count < MAX_REPEATS && now - r.last >= REPEAT_EVERY_MS) {
          playSound("call", settings.volume);
          repeats.current.set(toast.id, { count: r.count + 1, last: now });
        }
      }
    }, 2000);
    return () => clearInterval(id);
  }, [toasts, settings]);

  // Tab title shows the count of open alerts when the console is in the background.
  useEffect(() => {
    if (baseTitle.current === null) baseTitle.current = document.title;
    const calls = toasts.filter((x) => x.kind === "call").length;
    document.title = toasts.length > 0 ? `(${toasts.length}) ${calls ? "🔔 " : ""}${baseTitle.current}` : baseTitle.current;
  }, [toasts]);

  useRealtime(branchId ? [`branch:${branchId}`] : [], (event) => {
    if (event.type === "waiter_request.updated") {
      // Someone took the call — stop ringing it everywhere.
      const req = event.request as { id?: string; status?: string } | null;
      if (req?.id && req.status !== "OPEN") setToasts((prev) => prev.filter((x) => x.waiterRequestId !== req.id));
      return;
    }
    if (event.type !== "notification.created" || !user) return;
    const n = event.notification as { id: string; type: string; title: string; body: string | null; userId: string | null; branchId: string | null; data: Record<string, unknown> | null };
    const mine = n.userId ? n.userId === user.id : n.branchId === branchId && visibleNotificationTypes(user.permissions).includes(n.type as never);
    if (!mine) return;

    const kind = soundForType(n.type);
    const text = notificationText({ type: n.type, title: n.title, body: n.body, data: n.data }, t);
    const toast: Toast = {
      id: n.id,
      type: n.type,
      kind,
      title: text.title,
      body: text.body,
      at: Date.now(),
      waiterRequestId: typeof n.data?.waiterRequestId === "string" ? (n.data.waiterRequestId as string) : undefined,
      data: n.data ?? {},
    };
    setToasts((prev) => [toast, ...prev.filter((x) => x.id !== toast.id)].slice(0, 6));

    if (settings.enabled) {
      const played = playSound(kind, settings.volume);
      if (!played) setNeedsUnlock(true);
    }
    if (kind === "call" || kind === "order") navigator.vibrate?.(kind === "call" ? [300, 150, 300] : 200);
    // A system notification when the console is in the background (HTTPS/localhost only).
    if (document.hidden && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(text.title, { body: text.body ?? undefined, tag: n.id, requireInteraction: kind === "call" });
      } catch {
        /* not supported on this device */
      }
    }
  });

  function open(toast: Toast) {
    fetch(`/api/notifications/${toast.id}`, { method: "PATCH" }).catch(() => {});
    dismiss(toast.id);
    const perms = new Set(user?.permissions ?? []);
    const go = (href: string, permission: string) => perms.has(permission) && router.push(href);
    if (toast.type === "WAITER_REQUEST") {
      if (perms.has(PERMISSIONS.ORDERS_SERVE) && !perms.has(PERMISSIONS.DASHBOARD_VIEW)) go("/admin/waiter", PERMISSIONS.ORDERS_SERVE);
      else go("/admin/waiter-requests", PERMISSIONS.WAITER_REQUESTS_VIEW);
    } else if (toast.type === "NEW_ORDER" || toast.type === "DELAYED_ORDER") {
      if (perms.has(PERMISSIONS.KITCHEN_VIEW)) go("/admin/kitchen", PERMISSIONS.KITCHEN_VIEW);
      else go("/admin/orders", PERMISSIONS.ORDERS_MANAGE);
    } else if (toast.type === "ORDER_READY") {
      if (perms.has(PERMISSIONS.ORDERS_SERVE)) go("/admin/waiter", PERMISSIONS.ORDERS_SERVE);
    } else if (["LOW_STOCK", "OUT_OF_STOCK", "STOCK_EXPIRY"].includes(toast.type)) {
      go("/admin/inventory", PERMISSIONS.INVENTORY_VIEW);
    } else if (toast.type === "SOLD_OUT") {
      go("/admin/menu", PERMISSIONS.MENU_MANAGE);
    } else if (toast.type === "DELIVERY_UPDATE") {
      go("/admin/delivery", PERMISSIONS.DELIVERY_MANAGE);
    }
  }

  return (
    <>
      {needsUnlock && settings.enabled && (
        <button
          onClick={async () => {
            if (await unlockAudio()) {
              setNeedsUnlock(false);
              playSound("info", settings.volume);
            }
          }}
          className="fixed bottom-4 inset-x-4 md:inset-x-auto md:end-4 z-[60] flex items-center justify-center gap-2 rounded-2xl bg-accent text-accent-foreground px-4 py-3 text-sm font-semibold shadow-lg"
        >
          <Volume2 className="h-4 w-4" /> {t("admin.sound.enable")}
        </button>
      )}

      <div className="fixed top-20 inset-x-3 md:inset-x-auto md:end-6 md:w-96 z-[60] space-y-3 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = ICON[toast.kind];
          return (
            <div
              key={toast.id}
              role="alert"
              className={cn("pointer-events-auto rounded-2xl border-2 shadow-xl p-3 flex items-start gap-3 animate-fade-up", TONE[toast.kind], toast.kind === "call" && "animate-pulse")}
            >
              <Icon className="h-6 w-6 shrink-0 mt-0.5" />
              <button onClick={() => open(toast)} className="flex-1 text-start min-w-0">
                <p className="font-semibold leading-snug" dir="auto">{toast.title}</p>
                {toast.body && <p className={cn("text-sm mt-0.5", toast.kind === "call" ? "text-white/90" : "text-muted-foreground")} dir="auto">{toast.body}</p>}
                <p className={cn("text-[11px] mt-1", toast.kind === "call" ? "text-white/80" : "text-muted-foreground")}>
                  {new Date(toast.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {t("admin.sound.tapToOpen")}
                </p>
              </button>
              <button onClick={() => dismiss(toast.id)} aria-label={t("admin.sound.dismiss")} className="p-1 rounded-full hover:bg-black/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
