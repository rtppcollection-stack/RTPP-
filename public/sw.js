// RTPP PWA High-Performance Service Worker
const CACHE_NAME = "rtpp-v1-static";
const RUNTIME_CACHE = "rtpp-v1-runtime";

const PRECACHE_URLS = [
  "/",
  "/favicon.ico",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/manifest.json",
];

// Install Event - Pre-cache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch Event - Stale-While-Revalidate for JS/CSS/Images, Network-first for APIs
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls or WebSockets
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/ws") ||
    url.protocol.startsWith("ws")
  ) {
    return;
  }

  // Static Assets (CSS, JS, Fonts, Images) -> Stale-While-Revalidate / Cache-First
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      }),
    );
    return;
  }

  // HTML Page Navigation -> Network First with Cache Fallback
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
  }
});
