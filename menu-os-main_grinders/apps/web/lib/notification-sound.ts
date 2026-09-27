"use client";

/**
 * Notification sounds, synthesised with the Web Audio API — no sound files to ship or
 * load, so they work offline on the cafe's own network and start instantly.
 *
 * Each kind of alert has its own sound, so staff can tell from across the room what
 * happened without looking at a screen:
 *   call  — a table is calling a waiter: a loud two-tone door chime, played twice
 *   order — a new order: a rising three-note chime
 *   ready — food is ready on the pass: a bright double bell
 *   alert — something is wrong (late order, sold out, out of stock): two low beeps
 *   info  — everything else: one soft ping
 *
 * Browsers refuse to play sound until the person has touched the page once; `unlock()`
 * is called on the first tap/click/key anywhere, and the console shows a one-tap
 * "enable sound" bar until that has happened.
 */

export type SoundKind = "call" | "order" | "ready" | "alert" | "info";

const SOUND_FOR_TYPE: Record<string, SoundKind> = {
  WAITER_REQUEST: "call",
  NEW_ORDER: "order",
  ORDER_READY: "ready",
  DELAYED_ORDER: "alert",
  SOLD_OUT: "alert",
  OUT_OF_STOCK: "alert",
  LOW_STOCK: "info",
  STOCK_EXPIRY: "info",
  PAYMENT: "info",
  DELIVERY_UPDATE: "info",
};

export function soundForType(type: string | null | undefined): SoundKind {
  return (type && SOUND_FOR_TYPE[type]) || "info";
}

// ─── settings (per device) ───────────────────────────────────────────────

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0..1
  repeatCalls: boolean; // keep ringing for an unanswered waiter call
}

const KEY = "mos_sound_settings";
const DEFAULTS: SoundSettings = { enabled: true, volume: 0.8, repeatCalls: true };

export function loadSoundSettings(): SoundSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSoundSettings(s: SoundSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode — settings just won't persist */
  }
  window.dispatchEvent(new CustomEvent("mos-sound-settings", { detail: s }));
}

// ─── audio ────────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

/** True once the browser allows this page to play sound. */
export function isAudioUnlocked() {
  return !!ctx && ctx.state === "running";
}

/** Call from a user gesture. Resolves true if sound can now play. */
export async function unlockAudio(): Promise<boolean> {
  const c = context();
  if (!c) return false;
  try {
    if (c.state !== "running") await c.resume();
    // A silent blip: some mobile browsers only fully unlock after a real start().
    const o = c.createOscillator();
    const g = c.createGain();
    g.gain.value = 0;
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.01);
  } catch {
    /* still locked */
  }
  return c.state === "running";
}

type Note = { f: number; at: number; dur: number; type?: OscillatorType; gain?: number };

const PATTERNS: Record<SoundKind, Note[]> = {
  // "Ding-dong" twice — impossible to confuse with anything else.
  call: [
    { f: 988, at: 0, dur: 0.45, type: "sine", gain: 1 },
    { f: 784, at: 0.35, dur: 0.7, type: "sine", gain: 1 },
    { f: 988, at: 1.1, dur: 0.45, type: "sine", gain: 1 },
    { f: 784, at: 1.45, dur: 0.8, type: "sine", gain: 1 },
  ],
  order: [
    { f: 659, at: 0, dur: 0.18, type: "triangle" },
    { f: 784, at: 0.15, dur: 0.18, type: "triangle" },
    { f: 1047, at: 0.3, dur: 0.4, type: "triangle" },
  ],
  ready: [
    { f: 1319, at: 0, dur: 0.35, type: "sine" },
    { f: 1568, at: 0.02, dur: 0.35, type: "sine", gain: 0.4 },
    { f: 1319, at: 0.4, dur: 0.5, type: "sine" },
    { f: 1568, at: 0.42, dur: 0.5, type: "sine", gain: 0.4 },
  ],
  alert: [
    { f: 330, at: 0, dur: 0.22, type: "square", gain: 0.35 },
    { f: 330, at: 0.32, dur: 0.22, type: "square", gain: 0.35 },
  ],
  info: [{ f: 880, at: 0, dur: 0.25, type: "sine", gain: 0.7 }],
};

/** Plays one sound now. Returns false if the browser has not allowed audio yet. */
export function playSound(kind: SoundKind, volume?: number): boolean {
  const c = context();
  if (!c || c.state !== "running") return false;
  const v = Math.max(0, Math.min(1, volume ?? loadSoundSettings().volume));
  const t0 = c.currentTime + 0.02;
  for (const n of PATTERNS[kind]) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = n.type ?? "sine";
    o.frequency.value = n.f;
    const peak = 0.35 * v * (n.gain ?? 1);
    g.gain.setValueAtTime(0.0001, t0 + n.at);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + n.at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
    o.connect(g).connect(c.destination);
    o.start(t0 + n.at);
    o.stop(t0 + n.at + n.dur + 0.05);
  }
  return true;
}
