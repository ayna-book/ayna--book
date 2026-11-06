
const CACHE_PREFIX = "ayna-book-";
const CACHE_NAME = CACHE_PREFIX + "shell-v1";

const CORE_FILES = [
  "./",
  "./index.html",
  "./version.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith(CACHE_PREFIX) &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Firebase ও বাইরের সার্ভিসে হস্তক্ষেপ করবে না
  if (url.origin !== self.location.origin) return;

  // Version সবসময় সার্ভার থেকে পরীক্ষা
  if (url.pathname.endsWith("/version.json")) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
    );
    return;
  }

  // Network first, offline হলে cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return new Response("Offline", {
          status: 503
        });
      })
  );
});
