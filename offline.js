"use strict";

/* =========================================
   AYNA BOOK — OFFLINE SERVICE WORKER
   Version: 1.0.0
   ========================================= */

const CACHE_NAME = "ayna-book-cache-v2";

/* অ্যাপের প্রয়োজনীয় ফাইল */
const APP_FILES = [
  "./",
  "./index.html",
  "./login.html",
  "./signup.html",
  "./profile.html",
  "./messages.html",
  "./chat.html",
  "./radio-tv.html",
  "./global-alert.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./manifest.json",
  "./app.js",
  "./js/app.js",
  "./icon-192.png",
  "./icon-512.png"
];

/* =========================================
   1. INSTALL — প্রয়োজনীয় ফাইল ক্যাশে রাখা
   ========================================= */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        /*
         * একটি ফাইল না পাওয়া গেলে পুরো install
         * ব্যর্থ হওয়া এড়াতে প্রতিটি ফাইল আলাদাভাবে
         * ক্যাশে করার চেষ্টা করা হচ্ছে।
         */
        await Promise.all(
          APP_FILES.map(async file => {
            try {
              const response = await fetch(file, {
                cache: "reload"
              });

              if (response.ok) {
                await cache.put(file, response);
              } else {
                console.warn(
                  "AYNA BOOK: ফাইল পাওয়া যায়নি:",
                  file,
                  response.status
                );
              }
            } catch (error) {
              console.warn(
                "AYNA BOOK: ফাইল ক্যাশে করা যায়নি:",
                file,
                error
              );
            }
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* =========================================
   2. ACTIVATE — পুরোনো ক্যাশে পরিষ্কার
   ========================================= */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName.startsWith("ayna-book-cache-") &&
              cacheName !== CACHE_NAME
            ) {
              return caches.delete(cacheName);
            }

            return Promise.resolve(false);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

/* =========================================
   3. FETCH — ক্যাশে থেকে পেজ দেখানো
   ========================================= */

self.addEventListener("fetch", event => {
  const request = event.request;

  /* শুধু GET অনুরোধ পরিচালনা করা হবে */
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /*
   * অন্য ওয়েবসাইটের অনুরোধ এই Service Worker
   * পরিচালনা করবে না।
   */
  if (url.origin !== self.location.origin) {
    return;
  }

  /*
   * HTML পেজের জন্য Network First:
   * ইন্টারনেট থাকলে নতুন পেজ, না থাকলে ক্যাশে।
   */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const responseCopy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, responseCopy);
              })
              .catch(error => {
                console.warn(
                  "AYNA BOOK: পেজ ক্যাশে করা যায়নি:",
                  error
                );
              });
          }

          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }

          const cachedIndex =
            await caches.match("./index.html");

          if (cachedIndex) {
            return cachedIndex;
          }

          return new Response(
            `<!DOCTYPE html>
            <html lang="bn">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport"
                    content="width=device-width, initial-scale=1">
              <title>AYNA BOOK — Offline</title>
            </head>
            <body>
              <h1>🌍 AYNA BOOK</h1>
              <p>আপনি এখন অফলাইনে আছেন।</p>
              <p>ইন্টারনেট সংযোগ করে আবার চেষ্টা করুন।</p>
            </body>
            </html>`,
            {
              status: 200,
              headers: {
                "Content-Type": "text/html; charset=utf-8"
              }
            }
          );
        })
    );

    return;
  }

  /*
   * CSS, JavaScript, আইকনসহ অন্যান্য GET ফাইলের
   * জন্য Cache First; ক্যাশে না থাকলে নেটওয়ার্ক।
   */
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(response => {
            if (
              response &&
              response.ok &&
              response.type === "basic"
            ) {
              const responseCopy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseCopy);
                })
                .catch(error => {
                  console.warn(
                    "AYNA BOOK: রিসোর্স ক্যাশে করা যায়নি:",
                    error
                  );
                });
            }

            return response;
          });
      })
      .catch(() => {
        return new Response(
          "এই ফাইলটি অফলাইনে পাওয়া যাচ্ছে না।",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      })
  );
});