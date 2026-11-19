
/* =========================================================
   AYNA BOOK
   Offline Service Worker
   Version: 3.0
   ========================================================= */

const CACHE_NAME = "ayna-book-cache-v3";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./login.html",
  "./signup.html",
  "./forgot-password.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

// Install: প্রয়োজনীয় ফাইল Cache করা
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await Promise.allSettled(
        FILES_TO_CACHE.map(async (file) => {
          try {
            const response = await fetch(file, {
              cache: "reload"
            });

            if (response.ok) {
              await cache.put(file, response);
            }
          } catch (error) {
            console.warn(
              "AYNA BOOK Cache Skip:",
              file
            );
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

// Activate: পুরোনো Cache মুছে ফেলা
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("ayna-book-cache-") &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// Fetch: Online হলে নতুন পৃষ্ঠা, Offline হলে Cache
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Firebase/API এবং query-যুক্ত অনুরোধ Cache নয়
  if (url.search || url.pathname.includes("/__/")) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);

          await cache.put(
            request,
            response.clone()
          );
        }

        return response;

      } catch (error) {
        const cached = await caches.match(request);

        if (cached) return cached;

        if (request.mode === "navigate") {
          const homePage = await caches.match(
            "./index.html"
          );

          if (homePage) return homePage;

          return new Response(
            "আপনি বর্তমানে অফলাইনে আছেন।",
            {
              status: 503,
              headers: {
                "Content-Type":
                  "text/plain; charset=utf-8"
              }
            }
          );
        }

        return Response.error();
      }
    })()
  );
});

console.log("AYNA BOOK Offline Service Worker v3 Loaded.");
