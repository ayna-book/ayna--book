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

// ---------------------------------------------------------
// Firebase App
// ---------------------------------------------------------

export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// ---------------------------------------------------------
// Firebase Authentication
// Login / Registration / SMS OTP
// ---------------------------------------------------------

export const auth = getAuth(app);

// ---------------------------------------------------------
// Cloud Firestore
// Users / Posts / Messages / Data
// ---------------------------------------------------------

export const db = getFirestore(app);

// ---------------------------------------------------------
// Realtime Database
// Chat / Online Status / Realtime Data
// ---------------------------------------------------------

export const database = getDatabase(app);

// ---------------------------------------------------------
// Firebase Storage
// Profile Photos / Images / Videos
// ---------------------------------------------------------

export const storage = getStorage(app);

// ---------------------------------------------------------
// AYNA BOOK Firebase Ready
// ---------------------------------------------------------

console.log("AYNA BOOK — Firebase initialized successfully.");