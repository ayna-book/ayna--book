/* =========================================================
   AYNA BOOK
   Offline Service Worker
   Version: 4.0
   ========================================================= */

const CACHE_NAME = "ayna-book-cache-v4";

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


// =========================================================
// INSTALL
// =========================================================

self.addEventListener("install", (event) => {

  event.waitUntil(

    (async () => {

      try {

        const cache =
          await caches.open(CACHE_NAME);


        await Promise.allSettled(

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


        // নতুন Service Worker দ্রুত activate করবে
        await self.skipWaiting();


      } catch (error) {

        console.error(
          "AYNA BOOK Service Worker Install Error:",
          error
        );

      }

    })()

  );

});


// =========================================================
// ACTIVATE
// =========================================================

self.addEventListener("activate", (event) => {

  event.waitUntil(

    (async () => {

      try {

        const keys =
          await caches.keys();


        await Promise.all(

          keys
            .filter(
              (key) =>
                key.startsWith(
                  "ayna-book-cache-"
                ) &&
                key !== CACHE_NAME
            )
            .map(
              (key) =>
                caches.delete(key)
            )

        );


        // বর্তমান client-গুলোকে নতুন SW-এর অধীনে আনা
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

});


// =========================================================
// MESSAGE
// update.js থেকে SKIP_WAITING
// =========================================================

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


// =========================================================
// FETCH
// Network First → Cache Fallback
// =========================================================

self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;


    // GET ছাড়া অন্য request Service Worker handle করবে না
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


    // শুধু AYNA BOOK-এর নিজের domain
    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    // Query request cache করা হবে না
    if (
      url.search
    ) {

      return;

    }


    // Firebase internal request cache নয়
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

          // প্রথমে Network
          const response =
            await fetch(
              request
            );


          // সফল response হলে Cache update
          if (
            response.ok &&
            response.type ===
              "basic"
          ) {

            try {

              const cache =
                await caches.open(
                  CACHE_NAME
                );


              await cache.put(
                request,
                response.clone()
              );


            } catch (cacheError) {

              console.warn(
                "AYNA BOOK Cache Update Error:",
                cacheError
              );

            }

          }


          return response;


        } catch (networkError) {

          console.warn(
            "AYNA BOOK Network Failed:",
            networkError
          );


          // Cache থেকে response
          const cached =
            await caches.match(
              request
            );


          if (cached) {

            return cached;

          }


          // Offline navigation fallback
          if (
            request.mode ===
            "navigate"
          ) {

            const homePage =
              await caches.match(
                "./index.html"
              );


            if (homePage) {

              return homePage;

            }


            return new Response(
              "আপনি বর্তমানে অফলাইনে আছেন। AYNA BOOK-এর এই পেজটি এখন Cache-এ নেই।",
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

  }
);


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK Offline Service Worker v4 Loaded."
);