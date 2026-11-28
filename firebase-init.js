// ============================================================
// AYNA BOOK ★
// FIREBASE INITIALIZATION
// File: firebase-init.js
// Firebase SDK: 13.4.0
// ============================================================

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "আপনার আসল Firebase Web API Key",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "আপনার আসল Firebase Web App ID",
  measurementId: "আপনার আসল Measurement ID"
};


// ============================================================
// FIREBASE APP
// ============================================================

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);


// ============================================================
// AUTH
// ============================================================

const auth = getAuth(app);


// ============================================================
// REALTIME DATABASE
// ============================================================

const database = getDatabase(app);


// ============================================================
// AUTH PERSISTENCE
// ============================================================

const authReady = setPersistence(
  auth,
  browserLocalPersistence
).catch((error) => {

  console.error(
    "AYNA BOOK Auth Persistence Error:",
    error
  );

  return null;
});


// ============================================================
// EXPORT
// ============================================================

export {
  app,
  auth,
  database,
  firebaseConfig,
  authReady
};