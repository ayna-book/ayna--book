// ============================================================
// AYNA BOOK — Firebase Initialization
// Firebase Web SDK 13.4.0
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",

  databaseURL:
    "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "ayna-book",

  storageBucket:
    "ayna-book.firebasestorage.app",

  messagingSenderId: "805601138500",

  appId:
    "1:805601138500:web:47acdc90cb0cb521626911",

  measurementId:
    "G-RKHHSKNB4B"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);


// ============================================================
// FIREBASE AUTH
// ============================================================

const auth = getAuth(app);


// ============================================================
// FIREBASE REALTIME DATABASE
// ============================================================

const database = getDatabase(app);


// ============================================================
// FIREBASE ANALYTICS
// Analytics is optional.
// If Analytics fails, Auth and RTDB will continue working.
// ============================================================

let analytics = null;

try {
  if (
    typeof window !== "undefined" &&
    typeof document !== "undefined"
  ) {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn(
    "AYNA BOOK: Firebase Analytics unavailable.",
    error
  );

  analytics = null;
}


// ============================================================
// DEBUG INFORMATION
// ============================================================

if (typeof window !== "undefined") {
  console.log("==============================================");
  console.log("AYNA BOOK Firebase initialized");
  console.log("Project:", firebaseConfig.projectId);
  console.log("Auth:", !!auth);
  console.log("Realtime Database:", !!database);
  console.log("Analytics:", !!analytics);
  console.log("==============================================");
}


// ============================================================
// EXPORT
// ============================================================

export {
  app,
  auth,
  database,
  analytics
};