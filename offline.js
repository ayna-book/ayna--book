/* AYNA BOOK - Offline Support */

const AYNA_CACHE_NAME = "ayna-book-cache-v1";

const AYNA_FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json"
];

// Save essential files for offline use
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(AYNA_CACHE_NAME)
      .then((cache) => cache.addAll(AYNA_FILES_TO_CACHE))
      .catch((error) => {
        console.error("AYNA BOOK cache error:", error);
      })
  );

  self.skipWaiting();
});

// Remove old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== AYNA_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Load cached files when offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(AYNA_CACHE_NAME)
            .then((cache) => cache.put(event.request, copy))
            .catch(() => {});
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);

        if (cached) return cached;

        if (event.request.mode === "navigate") {
          return (
            await caches.match("./index.html")
          ) || Response.error();
        }

        return Response.error();
      })
  );
});