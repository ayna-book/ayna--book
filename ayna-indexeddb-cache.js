// =====================================================================
// AYNA BOOK — INDEXEDDB FAST CACHE ENGINE (ayna-indexeddb-cache.js)
// =====================================================================

const DB_NAME = "AynaBookQuantumDB";
const DB_VERSION = 1;
const STORE_NAME = "quantumCache";

function openAynaDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB supported nahi"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveToIndexedCache(key, data) {
  try {
    const db = await openAynaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ key, data, updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    try {
      localStorage.setItem(`idb_fb_${key}`, JSON.stringify({ data, updatedAt: Date.now() }));
    } catch {}
    return false;
  }
}

export async function readFromIndexedCache(key) {
  try {
    const db = await openAynaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const raw = JSON.parse(localStorage.getItem(`idb_fb_${key}`) || "null");
      return raw ? raw.data : null;
    } catch {
      return null;
    }
  }
}