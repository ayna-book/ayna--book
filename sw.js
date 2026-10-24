// AYNA BOOK • SW.JS • SUPER ULTRA GOD 1000Y • UKHIYA ORIGIN
const VERSION = "v1000-super-ultra-ayna";
const CACHE_STATIC = `static-${VERSION}`;
const CACHE_DYNAMIC = `dynamic-${VERSION}`;
const CACHE_IMMUTABLE = `immutable-${VERSION}`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./V42.html",
  "./manifest.json",
  "./icon.png"
];

const OFFLINE_PAGE = "./index.html";

// INSTALL - Pre-cache Core
self.addEventListener("install", (e) => {
  console.log("[SW] INSTALL ULTRA");
  e.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => {
      return self.skipWaiting(); // Immediately activate
    })
  );
});

// ACTIVATE - Clean Old Cache + Claim
self.addEventListener("activate", (e) => {
  console.log("[SW] ACTIVATE GOD MODE");
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.includes(VERSION)) {
            console.log("[SW] Deleting old:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// FETCH STRATEGY
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 1. Skip non-GET & chrome-extension
  if (req.method !== "GET" || url.protocol === "chrome-extension:") return;

  // 2. For HTML - Network First, Fallback to Cache (Always Fresh)
  if (req.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          return caches.open(CACHE_STATIC).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match(OFFLINE_PAGE);
          });
        })
    );
    return;
  }

  // 3. For CSS, JS, Images - Stale While Revalidate (SUPER FAST)
  if (req.destination === "style" || req.destination === "script" || req.destination === "image" || req.destination === "font") {
    e.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req).then((res) => {
          return caches.open(CACHE_DYNAMIC).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        }).catch(()=>cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // 4. For Everything Else - Cache First, Network Fallback
  e.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((res) => {
        return caches.open(CACHE_DYNAMIC).then((cache) => {
          cache.put(req, res.clone());
          return res;
        });
      }).catch(() => {
        if (req.headers.get("accept")?.includes("image")) {
          return caches.match("./icon.png");
        }
      });
    })
  );
});

// BACKGROUND SYNC - Future Feature
self.addEventListener("sync", (e) => {
  console.log("[SW] Background Sync:", e.tag);
  if (e.tag === "sync-ayna") {
    e.waitUntil(console.log("Syncing Ayna Data..."));
  }
});

// PUSH NOTIFICATION - Future Feature
self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : { title: "AYNA BOOK", body: "Ukhiya Origin থেকে নতুন আপডেট!" };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon.png",
      badge: "./icon.png",
      vibrate: [100, 50, 100],
      data: { url: "./" }
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});