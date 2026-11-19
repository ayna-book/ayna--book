/* =========================================================
   AYNA BOOK
   Main Service Worker
   Version: 5.0
   ========================================================= */

"use strict";

const CACHE_NAME = "ayna-book-cache-v5";

const OFFLINE_URL = "./index.html";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./login.html",
  "./signup.html",
  "./forgot-password.html",
  "./styles.css",
  "./ayna-ui-patch.css",
  "./app.js",
  "./login.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener(
  "install",
  (event) => {

    event.waitUntil(
      (async () => {

        try {

          const cache =
            await caches.open(
              CACHE_NAME
            );

          await Promise.all(
            FILES_TO_CACHE.map(
              async (file) => {

                try {

                  const response =
                    await fetch(
                      file,
                      {
                        cache: "reload"
                      }
                    );

                  if (response.ok) {

                    await cache.put(
                      file,
                      response
                    );

                    console.log(
                      "AYNA BOOK Cached:",
                      file
                    );

                  } else {

                    console.warn(
                      "AYNA BOOK Cache HTTP Error:",
                      file,
                      response.status
                    );
                  }

                } catch (error) {

                  console.warn(
                    "AYNA BOOK Cache Skip:",
                    file,
                    error
                  );
                }
              }
            )
          );

          /*
           * Do not activate immediately here.
           * update.js can control activation through
           * SKIP_WAITING when an update is confirmed.
           */

          console.log(
            "AYNA BOOK Service Worker Installed:",
            CACHE_NAME
          );

        } catch (error) {

          console.error(
            "AYNA BOOK Service Worker Install Error:",
            error
          );
        }

      })()
    );
  }
);


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener(
  "activate",
  (event) => {

    event.waitUntil(
      (async () => {

        try {

          const cacheNames =
            await caches.keys();

          await Promise.all(
            cacheNames
              .filter(
                (cacheName) =>
                  cacheName.startsWith(
                    "ayna-book-cache-"
                  ) &&
                  cacheName !== CACHE_NAME
              )
              .map(
                (cacheName) =>
                  caches.delete(
                    cacheName
                  )
              )
          );

          await self.clients.claim();

          console.log(
            "AYNA BOOK Service Worker Activated:",
            CACHE_NAME
          );

        } catch (error) {

          console.error(
            "AYNA BOOK Service Worker Activate Error:",
            error
          );
        }

      })()
    );
  }
);


/* =========================================================
   MESSAGE
   ========================================================= */

self.addEventListener(
  "message",
  (event) => {

    if (
      event.data &&
      event.data.type ===
        "SKIP_WAITING"
    ) {

      console.log(
        "AYNA BOOK: SKIP_WAITING received."
      );

      self.skipWaiting();
    }
  }
);


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;

    /*
     * Only GET requests are handled.
     */
    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url
      );

    /*
     * Ignore external domains.
     */
    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    /*
     * Ignore requests with query strings.
     * This prevents cached version/network-check
     * requests from becoming stale.
     */
    if (
      url.search
    ) {
      return;
    }

    /*
     * Ignore special platform paths.
     */
    if (
      url.pathname.includes(
        "/__/"
      )
    ) {
      return;
    }

    event.respondWith(
      (async () => {

        try {

          /*
           * Network first.
           */
          const networkResponse =
            await fetch(
              request
            );

          /*
           * Cache successful same-origin responses.
           */
          if (
            networkResponse.ok &&
            networkResponse.type ===
              "basic"
          ) {

            try {

              const cache =
                await caches.open(
                  CACHE_NAME
                );

              await cache.put(
                request,
                networkResponse.clone()
              );

            } catch (cacheError) {

              console.warn(
                "AYNA BOOK Cache Update Error:",
                cacheError
              );
            }
          }

          return networkResponse;

        } catch (networkError) {

          console.warn(
            "AYNA BOOK Network Request Failed:",
            networkError
          );

          /*
           * Network failed:
           * try cache.
           */
          const cachedResponse =
            await caches.match(
              request
            );

          if (cachedResponse) {
            return cachedResponse;
          }

          /*
           * Navigation fallback.
           */
          if (
            request.mode ===
            "navigate"
          ) {

            const homePage =
              await caches.match(
                OFFLINE_URL
              );

            if (homePage) {
              return homePage;
            }

            return new Response(
              `
              <!DOCTYPE html>
              <html lang="bn">
              <head>
                <meta charset="UTF-8">
                <meta
                  name="viewport"
                  content="width=device-width,initial-scale=1.0"
                >
                <title>AYNA BOOK — Offline</title>
              </head>

              <body style="
                margin:0;
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#0A0F1E;
                color:#FFFFFF;
                font-family:Arial,sans-serif;
                text-align:center;
                padding:20px;
              ">

                <div>

                  <h1 style="
                    color:#FFD700;
                  ">
                    AYNA BOOK
                  </h1>

                  <p style="
                    color:#A9B0BC;
                  ">
                    আপনি বর্তমানে অফলাইনে আছেন।
                  </p>

                  <p style="
                    color:#A9B0BC;
                  ">
                    ইন্টারনেট সংযোগ ফিরে এলে আবার চেষ্টা করুন।
                  </p>

                </div>

              </body>
              </html>
              `,
              {
                status: 503,
                headers: {
                  "Content-Type":
                    "text/html; charset=utf-8"
                }
              }
            );
          }

          /*
           * No cached response available.
           */
          return Response.error();
        }

      })()
    );
  }
);


/* =========================================================
   SERVICE WORKER READY
   ========================================================= */

console.log(
  "AYNA BOOK — Main Service Worker v5 Loaded."
);