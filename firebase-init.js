
/* ======================================================
   AYNA BOOK — FIREBASE INITIALIZATION
   Firebase SDK Version: 13.4.0
   ====================================================== */

import {
  initializeApp,
  getApp,
  getApps
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

import { firebaseConfig } from "./firebase-config.js";


// Initialize Firebase App only once
export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);


// Firebase Authentication
export const auth = getAuth(app);


// Cloud Firestore
export const db = getFirestore(app);


// Realtime Database
export const database = getDatabase(app);


// Firebase Storage
export const storage = getStorage(app);


console.log("AYNA BOOK Firebase initialized.");
