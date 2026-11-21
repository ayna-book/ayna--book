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
// FIREBASE APP
// =========================================================

export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


// =========================================================
// FIREBASE SERVICES
// =========================================================

export const auth = getAuth(app);

export const db = getFirestore(app);

export const database = getDatabase(app);

export const storage = getStorage(app);


// =========================================================
// STATUS
// =========================================================

console.log("========================================");
console.log("AYNA BOOK - Firebase Initialized");
console.log("========================================");

console.log("App:", !!app);
console.log("Auth:", !!auth);
console.log("Firestore:", !!db);
console.log("Realtime Database:", !!database);
console.log("Storage:", !!storage);

console.log("========================================");