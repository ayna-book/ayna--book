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
// FIREBASE APP
// =========================================================

export const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);


// =========================================================
// FIREBASE AUTHENTICATION
// =========================================================

export const auth =
  getAuth(app);


// =========================================================
// CLOUD FIRESTORE
// =========================================================

export const db =
  getFirestore(app);


// =========================================================
// REALTIME DATABASE
// =========================================================

export const database =
  getDatabase(app);


// =========================================================
// FIREBASE STORAGE
// =========================================================

export const storage =
  getStorage(app);


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — Firebase initialized successfully."
);