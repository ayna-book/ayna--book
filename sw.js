// AYNA BOOK - V100 SUPER ULTRA GOD - BLACK HOLE ENGINE
// UKHIYA ORIGIN - OFFLINE ROCKET SYSTEM

const CACHE_NAME = "ayna-book-v100-ultra-god-final";
const OFFLINE_URL = "/ayna--book/index.html";

// সব ফাইল যা Offline এ চলবে
const PRECACHE_URLS = [
  "/ayna--book/",
  "/ayna--book/index.html",
  "/ayna--book/V42.html",
  "/ayna--book/icon.png",
  "/ayna--book/manifest.json",
  "/ayna--book/sw.js"
];

// INSTALL - সব ফাইল Cache করো
self.addEventListener("install", event => {
  console.log("🔱 AYNA BOOK V100 Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      console.log("✅ AYNA BOOK All Files Cached!");
      return self.skipWaiting();
    })
  );
});

// ACTIVATE - পুরানো Cache Delete করো
self.addEventListener("activate", event => {
  console.log("🚀 AYNA BOOK V100 Activating...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache