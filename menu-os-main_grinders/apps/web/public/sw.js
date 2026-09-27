// Menu OS customer-app service worker — installability + static asset caching only.
// Deliberately does NOT cache API responses or page navigations: menu pricing,
// availability and order status must always come from the network. Offline write
// resilience is handled server-side by the transactional outbox (see
// docs/OFFLINE_ARCHITECTURE.md) — this worker's job is just a fast, installable shell.
const CACHE_NAME = "menu-os-shell-v1";
const SHELL_ASSETS = ["/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return; // always network — never serve stale order/menu data
  if (url.pathname.startsWith("/_next/static/") || SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached ?? fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      }))
    );
  }
});
