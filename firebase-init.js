
// =========================================================
// AYNA BOOK — FIREBASE INITIALIZATION
// Firebase SDK: 13.4.0
// Authentication + Firestore + RTDB + Storage
// File: firebase-init.js
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

// CHECK CONFIGURATION

if (
  !firebaseConfig ||
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.databaseURL ||
  !firebaseConfig.appId
) {
  throw new Error(
    "AYNA BOOK: Firebase configuration is incomplete. Check databaseURL."
  );
}

// INITIALIZE APP ONLY ONCE

export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// FIREBASE SERVICES

export const auth = getAuth(app);

// FIRESTORE
export const db = getFirestore(app);

// REALTIME DATABASE
export const database = getDatabase(app);

// STORAGE
export const storage = getStorage(app);

// CONFIRMATION

console.log("AYNA BOOK Firebase initialized successfully.");
