/* AYNA BOOK - Offline Support */

const AYNA_CACHE_NAME = "ayna-book-cache-v2";

const AYNA_FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// Install and cache essential files
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

// Activate and remove old AYNA BOOK caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("ayna-book-cache-")
            && key !== AYNA_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Network first, cached files when offline
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestURL = new URL(event.request.url);

  // Only handle requests from this website
  if (requestURL.origin !== self.location.origin) return;

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
          ) || new Response(
            "আপনি অফলাইনে আছেন। AYNA BOOK-এর সংরক্ষিত পৃষ্ঠা খুলুন।",
            {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            }
          );
        }

        return Response.error();
      })
  );
});