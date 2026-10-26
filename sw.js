// AYNA BOOK - WORLD NO1 - SERVICE WORKER - V2000000 CRORE
self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
console.log("AYNA BOOK - SW - WORLD NO1 - Thanda Mia - Ukhiya 4750");