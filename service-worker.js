const CACHE_NAME = "copper-spoon-v6";
const ASSETS = [
  "/",
  "/index.html",
  "/privacy.html",
  "/terms.html",
  "/style.css",
  "/app.js",
  "/recipes.js",
  "/manifest.webmanifest",
  "/icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);

  // Do not intercept cross-origin traffic (recipe providers, CDNs, etc.).
  // Let the browser handle these directly to avoid API breakage.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Keep API requests live to avoid stale search results from cached JSON.
  if (requestUrl.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(network => {
        const cloned = network.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return network;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }

        return new Response("Offline", {
          status: 503,
          statusText: "Offline"
        });
      })
  );
});

// Allow the page to trigger immediate activation of a waiting SW.
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
