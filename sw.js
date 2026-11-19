"use strict";

/* =========================================================
   AYNA BOOK
   Service Worker
   Version: 5.0
   ========================================================= */

const CACHE_NAME = "ayna-book-cache-v5";

const APP_FILES = [
  "./",
  "./index.html",
  "./login.html",
  "./signup.html",
  "./forgot-password.html",
  "./profile.html",
  "./messages.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", (event) => {

  event.waitUntil(

    (async () => {

      try {

        const cache =
          await caches.open(CACHE_NAME);


        await Promise.allSettled(

          APP_FILES.map(
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


        console.log(
          "AYNA BOOK: Essential files cached."
        );


        // নতুন Service Worker দ্রুত চালু করা
        await self.skipWaiting();


      } catch (error) {

        console.error(
          "AYNA BOOK Install Error:",
          error
        );

      }

    })()

  );

});


/* =========================================================
   ACTIVATE
   পুরোনো Cache মুছে ফেলা
   ========================================================= */

self.addEventListener("activate", (event) => {

  event.waitUntil(

    (async () => {

      try {

        const cacheNames =
          await caches.keys();


        await Promise.all(

          cacheNames
            .filter(
              (name) =>
                name.startsWith(
                  "ayna-book-cache-"
                ) &&
                name !== CACHE_NAME
            )
            .map(
              (name) =>
                caches.delete(name)
            )

        );


        // সব open page-কে নতুন Service Worker-এর অধীনে আনা
        await self.clients.claim();


        console.log(
          "AYNA BOOK Service Worker Activated:",
          CACHE_NAME
        );


      } catch (error) {

        console.error(
          "AYNA BOOK Activate Error:",
          error
        );

      }

    })()

  );

});


/* =========================================================
   MESSAGE
   update.js থেকে SKIP_WAITING গ্রহণ
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
        "AYNA BOOK: Updating Service Worker..."
      );


      self.skipWaiting();

    }

  }
);


/* =========================================================
   FETCH
   Online = Network
   Offline = Cache
   ========================================================= */

self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;


    // শুধু GET request
    if (
      request.method !== "GET"
    ) {

      return;

    }


    const url =
      new URL(
        request.url
      );


    // External domain Cache করা হবে না
    if (
      url.origin !==
      self.location.origin
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


    // Query request Cache না করাই নিরাপদ
    if (
      url.search
    ) {

      return;

    }


    event.respondWith(

      (async () => {

        try {

          // ---------------------------------------------
          // প্রথমে Network
          // ---------------------------------------------

          const response =
            await fetch(
              request
            );


          // সফল response Cache-এ রাখা
          if (
            response &&
            response.ok &&
            response.type === "basic"
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
                "AYNA BOOK Cache Update Failed:",
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


          // ---------------------------------------------
          // Network না থাকলে Cache
          // ---------------------------------------------

          const cached =
            await caches.match(
              request
            );


          if (cached) {

            return cached;

          }


          // ---------------------------------------------
          // Navigation হলে index.html দেখানো
          // ---------------------------------------------

          if (
            request.mode ===
            "navigate"
          ) {

            const home =
              await caches.match(
                "./index.html"
              );


            if (home) {

              return home;

            }

          }


          // ---------------------------------------------
          // কোনো Cache না থাকলে Offline message
          // ---------------------------------------------

          return new Response(

            "আপনি বর্তমানে অফলাইনে আছেন। " +
            "ইন্টারনেট সংযোগ ফিরে এলে আবার চেষ্টা করুন।",

            {
              status: 503,

              headers: {
                "Content-Type":
                  "text/plain; charset=utf-8"
              }

            }

          );

        }

      })()

    );

  }
);


/* =========================================================
   READY
   ========================================================= */

console.log(
  "AYNA BOOK Service Worker v5 Loaded."
);