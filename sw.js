// W.L. Toomey Irrigation Estimator — Service Worker
// Caches all app assets so it works fully offline (important on job sites)

const CACHE_NAME = "toomey-estimator-v4";

const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./ToomeyLogo2026.png",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(["./index.html", "./manifest.json", "./ToomeyLogo2026.png"])
        .then(() =>
          Promise.allSettled(
            ASSETS.filter(a => a.startsWith("http")).map(url =>
              fetch(url).then(r => cache.put(url, r)).catch(() => {})
            )
          )
        );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.destination === "document") {
          return caches.match("./index.html");
        }
      });
    })
  );
});
