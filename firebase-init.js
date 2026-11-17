// ======================================================
// AYNA BOOK — Firebase Initialization
// Firebase SDK 12.5.0
// ======================================================

import { initializeApp, getApps, getApp } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { getDatabase } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

import { getStorage } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

import { firebaseConfig } from "./firebase-config.js";


// ------------------------------------------------------
// Firebase App
// ------------------------------------------------------

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);


// ------------------------------------------------------
// Firebase Services
// ------------------------------------------------------

const auth = getAuth(app);

const db = getFirestore(app);

const realtimeDB = getDatabase(app);

const storage = getStorage(app);


// ------------------------------------------------------
// Export
// ------------------------------------------------------

export {
  app,
  auth,
  db,
  realtimeDB,
  storage
};


// ------------------------------------------------------
// Optional global access
// ------------------------------------------------------

window.AYNA_FIREBASE = {
  app,
  auth,
  db,
  realtimeDB,
  storage
};

console.log("✅ AYNA BOOK Firebase initialized successfully");