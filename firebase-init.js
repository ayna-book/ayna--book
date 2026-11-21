// =========================================================
// AYNA BOOK
// FIREBASE INITIALIZATION
// Firebase SDK: 13.4.0
// =========================================================

import { firebaseConfig } from "./firebase-config.js";

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// VALIDATE FIREBASE CONFIGURATION
// =========================================================

if (
  !firebaseConfig ||
  typeof firebaseConfig !== "object" ||
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  throw new Error(
    "AYNA BOOK: Firebase configuration is incomplete."
  );
}


// =========================================================
// FIREBASE APP
// =========================================================

export const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);


// =========================================================
// FIREBASE AUTHENTICATION
// =========================================================

export const auth = getAuth(app);


// =========================================================
// CLOUD FIRESTORE
// =========================================================

export const db = getFirestore(app);


// =========================================================
// REALTIME DATABASE
// =========================================================

export const database = getDatabase(app);


// =========================================================
// FIREBASE STORAGE
// =========================================================

export const storage = getStorage(app);


// =========================================================
// INITIALIZATION STATUS
// =========================================================

console.log("========================================");
console.log("AYNA BOOK - Firebase Initialized");
console.log("========================================");

console.log("Firebase App:", !!app);
console.log("Authentication:", !!auth);
console.log("Cloud Firestore:", !!db);
console.log("Realtime Database:", !!database);
console.log("Firebase Storage:", !!storage);
console.log("Project ID:", firebaseConfig.projectId);

console.log("========================================");