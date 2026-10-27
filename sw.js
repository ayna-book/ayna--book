const CACHE = "ayna-v2";
const FILES = ["/ayna--book/", "/ayna--book/index.html", "/ayna--book/icon.png", "/ayna--book/manifest.json"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener("fetch", e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));