// ============================================================
// AYNA BOOK ★
// FIREBASE INITIALIZATION
// File: firebase-init.js
// Firebase JS SDK: 13.4.0
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
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:47acdc90cb0cb521626911",
  measurementId: "G-RKHHSKNB4B"
};


// ============================================================
// FIREBASE APP
// ============================================================

let app;

try {

  if (getApps().length > 0) {

    app = getApp();

  } else {

    app = initializeApp(firebaseConfig);

  }

} catch (error) {

  console.error(
    "AYNA BOOK Firebase initialization error:",
    error
  );

  throw error;
}


// ============================================================
// FIREBASE AUTH
// ============================================================

const auth = getAuth(app);


// ============================================================
// FIREBASE REALTIME DATABASE
// ============================================================

const database = getDatabase(app);


// ============================================================
// AUTH PERSISTENCE
// ============================================================

const authReady = setPersistence(
  auth,
  browserLocalPersistence
).catch((error) => {

  console.warn(
    "AYNA BOOK Auth Persistence warning:",
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