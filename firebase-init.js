// ============================================================
// AYNA BOOK ★
// FIREBASE INITIALIZATION
// File: firebase-init.js
// Firebase SDK: 13.4.0
// ============================================================

// ------------------------------------------------------------
// Firebase App
// ------------------------------------------------------------

import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";


// ------------------------------------------------------------
// Firebase Authentication
// ------------------------------------------------------------

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ------------------------------------------------------------
// Firebase Realtime Database
// ------------------------------------------------------------

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// আপনার AYNA BOOK Firebase Console-এর Web App config এখানে
// ব্যবহার করতে হবে। API Key-এর জায়গায় আপনার আসল Web API Key
// বসানো থাকতে হবে।
// ============================================================

const firebaseConfig = {

  apiKey: "YOUR_FIREBASE_WEB_API_KEY",

  authDomain:
    "ayna-book.firebaseapp.com",

  databaseURL:
    "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "ayna-book",

  storageBucket:
    "ayna-book.firebasestorage.app",

  messagingSenderId:
    "805601138500",

  appId:
    "YOUR_FIREBASE_WEB_APP_ID",

  measurementId:
    "YOUR_FIREBASE_MEASUREMENT_ID"
};


// ============================================================
// INITIALIZE FIREBASE APP
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
    "AYNA BOOK Firebase initialization failed:",
    error
  );

  throw error;
}


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
// Browser বন্ধ করলেও login session রাখার চেষ্টা করবে।
// ============================================================

const authReady = setPersistence(
  auth,
  browserLocalPersistence
).catch((error) => {

  console.warn(
    "Firebase Auth persistence could not be enabled:",
    error
  );

  /*
    Persistence ব্যর্থ হলেও Authentication ব্যবহার
    করা যাবে। তাই এখানে throw করছি না।
  */

  return null;

});


// ============================================================
// EXPORTS
// ============================================================

export {
  app,
  auth,
  database,
  firebaseConfig,
  authReady
};