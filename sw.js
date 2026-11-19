/* =========================================================
   AYNA BOOK
   Service Worker
   Version: 6.0
   ========================================================= */

const CACHE_NAME = "ayna-book-cache-v6";

const APP_FILES = [
  "./",
  "./index.html",
  "./login.html",
  "./signup.html",
  "./forgot-password.html",
  "./dashboard.html",
  "./profile.html",

  "./styles.css",
  "./ayna-ui-patch.css",

  "./app.js",
  "./auth.js",
  "./firebase.js",
  "./firebase-init.js",
  "./firebase-config.js",
  "./login.js",

  "./manifest.webmanifest",
  "./version.json"
];

/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});


/* =========================================================
   ACTIVATE
   পুরোনো Cache মুছে ফেলা
   ========================================================= */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", (event) => {

  const request = event.request;

  /* শুধু GET request handle করা হবে */
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  /*
   * Firebase / Google / external services
   * Cache করা হবে না।
   *
   * এর মধ্যে Firebase Authentication,
   * Firestore, Storage এবং OTP সম্পর্কিত
   * network request থাকবে।
   */
  const isExternal =
    url.origin !== self.location.origin;

  if (isExternal) {
    return;
  }


  /* =======================================================
     HTML Navigation
     Network First
     ======================================================= */

  if (request.mode === "navigate") {

    event.respondWith(
      fetch(request)
        .then((response) => {

          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, copy);
              });
          }

          return response;
        })
        .catch(() => {

          return caches.match(request)
            .then((cachedResponse) => {

              if (cachedResponse) {
                return cachedResponse;
              }

              return caches.match("./index.html");
            });
        })
    );

    return;
  }


  /* =======================================================
     Local CSS / JS / Images / Manifest
     Cache First
     ======================================================= */

  event.respondWith(

    caches.match(request)
      .then((cachedResponse) => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {

            if (
              response &&
              response.ok &&
              response.type === "basic"
            ) {

              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, copy);
                });
            }

            return response;
          });

      })
      .catch(() => {

        /*
         * কোনো local resource পাওয়া না গেলে
         * network error return হবে।
         */
        return new Response(
          "AYNA BOOK — এই ফাইলটি বর্তমানে পাওয়া যাচ্ছে না।",
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


/* =========================================================
   MESSAGE
   ========================================================= */

self.addEventListener("message", (event) => {

  if (!event.data) {
    return;
  }

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

});