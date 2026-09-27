"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal — the app works fully without the service worker, it's a
        // progressive install/offline-shell enhancement only.
      });
    }
  }, []);
  return null;
}
