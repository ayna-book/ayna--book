// AYNA BOOK - 0MB SPACE SERVICE WORKER - WORLD RECORD - Owner Mohammad Mahabub Alam - Ukhiya 4700
const CACHE_NAME = 'ayna-book-10-lakh-crore-v1-0mb-space';
const FILES = ['/ayna--book/', '/ayna--book/index.html', '/ayna--book/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(f => {
    return caches.open(CACHE_NAME).then(c => { c.put(e.request, f.clone()); return f; });
  })));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.map(x => { if(x!==CACHE_NAME) return caches.delete(x); }))));
});