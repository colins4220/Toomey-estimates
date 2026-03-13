// W.L. Toomey Irrigation Estimator — Service Worker
// Caches all app assets so it works fully offline (important on job sites)

const CACHE_NAME = "toomey-estimator-v1";

// Everything the app needs to run offline
const ASSETS = [
  "./index.html",
  "./manifest.json",
  // React + ReactDOM (cached from CDN on first load)
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js",
];

// ── Install: pre-cache everything ────────────────────────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets strictly; CDN assets best-effort
      return cache.addAll(["./index.html", "./manifest.json"])
        .then(() =>
          Promise.allSettled(
            ASSETS.filter(a => a.startsWith("http")).map(url =>
              fetch(url).then(r => cache.put(url, r)).catch(() => {})
            )
          )
        );
    })
  );
  // Take over immediately without waiting for old SW to expire
  self.skipWaiting();
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for app assets, network-first for everything else ──────
self.addEventListener("fetch", event => {
  const url = event.request.url;

  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      // Not cached — try network, then cache the response for next time
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;

        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Completely offline and not cached — return the app shell
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
