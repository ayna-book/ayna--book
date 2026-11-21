'use strict';

// =========================================================
// AYNA BOOK
// SERVICE WORKER
// Version: 1.0.0
// =========================================================

const CACHE_NAME = "ayna-book-v1.0.0";

const APP_SHELL = [
  "./",
  "./index.html",
  "./login.html",
  "./signup.html",
  "./forgot-password.html",
  "./profile.html",
  "./manifest.json"
];


// =========================================================
// INSTALL
// =========================================================

self.addEventListener("install", (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          "AYNA BOOK Service Worker install error:",
          error
        );
      })
  );

});


// =========================================================
// ACTIVATE
// =========================================================

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys()
      .then((cacheNames) => {

        return Promise.all(

          cacheNames.map((cacheName) => {

            if (
              cacheName !== CACHE_NAME
            ) {
              return caches.delete(
                cacheName
              );
            }

            return Promise.resolve();
          })

        );

      })
      .then(() => {
        return self.clients.claim();
      })

  );

});


// =========================================================
// FETCH
// =========================================================

self.addEventListener("fetch", (event) => {

  const request = event.request;

  // শুধুমাত্র GET request
  if (request.method !== "GET") {
    return;
  }

  // Firebase / Google CDN request Service Worker
  // cache করবে না
  const url = new URL(request.url);

  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("firebasedatabase.app") ||
    url.hostname.includes("firebaseapp.com")
  ) {
    return;
  }


  event.respondWith(

    fetch(request)

      .then((response) => {

        // Valid response হলে cache update
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {

          const responseClone =
            response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(
                request,
                responseClone
              );
            });

        }

        return response;

      })

      .catch(() => {

        // Internet না থাকলে cache থেকে
        // আগের ফাইল দেওয়ার চেষ্টা
        return caches.match(request)
          .then((cachedResponse) => {

            if (cachedResponse) {
              return cachedResponse;
            }

            // Navigation request হলে index.html
            if (
              request.mode === "navigate"
            ) {
              return caches.match(
                "./index.html"
              );
            }

            return new Response(
              "AYNA BOOK is currently offline.",
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: {
                  "Content-Type":
                    "text/plain; charset=utf-8"
                }
              }
            );

          });

      })

  );

});


// =========================================================
// MESSAGE
// =========================================================

self.addEventListener("message", (event) => {

  if (
    event.data &&
    event.data.type === "SKIP_WAITING"
  ) {
    self.skipWaiting();
  }

});