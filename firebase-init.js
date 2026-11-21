
// =========================================================
// AYNA BOOK
// Firebase Initialization
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
// FIREBASE APP INITIALIZATION
// =========================================================

export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// =========================================================
// AUTHENTICATION
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

console.log("AYNA BOOK Firebase initialized.");

console.log("Project ID:", app.options.projectId);

console.log(
  "Database URL:",
  app.options.databaseURL || "DATABASE URL NOT CONFIGURED"
);

console.log("Authentication:", !!auth);
console.log("Firestore:", !!db);
console.log("Realtime Database:", !!database);
console.log("Storage:", !!storage);
