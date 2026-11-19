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
// প্রয়োজনীয় ফাইল Cache করা
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


        // নতুন Service Worker activate করার অনুমতি
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
// পুরোনো Cache মুছে ফেলা
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


        // বর্তমান পেজগুলোকে নতুন SW-এর অধীনে আনা
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
// update.js থেকে SKIP_WAITING গ্রহণ
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
// Online হলে Network
// Offline হলে Cache
// =========================================================

self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;


    // শুধু GET request
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


    // শুধু AYNA BOOK-এর নিজস্ব domain
    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    // Query-যুক্ত request Cache করা হবে না
    if (
      url.search
    ) {

      return;

    }


    // Firebase internal request Cache নয়
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


          // সফল হলে Cache update
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


          // Network না থাকলে Cache
          const cached =
            await caches.match(
              request
            );


          if (cached) {

            return cached;

          }


          // Navigation request হলে index.html
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