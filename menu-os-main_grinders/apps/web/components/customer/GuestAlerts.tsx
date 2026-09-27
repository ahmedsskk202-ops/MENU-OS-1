"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useRealtime } from "@/lib/useRealtime";
import { useLocale } from "@/lib/LocaleContext";
import { playSound, unlockAudio } from "@/lib/notification-sound";

/**
 * The guest's own alert: when their order is ready, the phone chimes, vibrates and says
 * so on whatever screen they are on (menu, game, bill). The guest has always tapped the
 * page to order, which is what lets the browser play the sound.
 */
export function GuestAlerts({ rooms }: { rooms: string[] }) {
  const { t } = useLocale();
  const [banner, setBanner] = useState<string | null>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const unlock = () => void unlockAudio();
    window.addEventListener("pointerdown", unlock);
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 12_000);
    return () => clearTimeout(id);
  }, [banner]);

  useRealtime(rooms, (event) => {
    if (event.type !== "order.status_changed" || event.status !== "READY") return;
    // The same event can arrive on both the table and the guest room — alert once.
    if (seen.current.has(event.orderId)) return;
    seen.current.add(event.orderId);
    playSound("ready");
    navigator.vibrate?.([250, 120, 250]);
    setBanner(t("guestAlert.ready", { ref: event.orderId.slice(-6).toUpperCase() }));
  });

  if (!banner) return null;
  return (
    <div role="alert" className="fixed top-3 inset-x-3 z-50 mx-auto max-w-md rounded-2xl bg-success text-white shadow-xl p-4 flex items-center gap-3 animate-fade-up">
      <CheckCircle2 className="h-6 w-6 shrink-0" />
      <p className="flex-1 font-semibold">{banner}</p>
      <button onClick={() => setBanner(null)} className="p-1 rounded-full hover:bg-white/15" aria-label="close"><X className="h-4 w-4" /></button>
    </div>
  );
}
