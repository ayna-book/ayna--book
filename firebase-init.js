
/* =====================================================
   AYNA BOOK - FIREBASE INITIALIZATION
   Firebase SDK Version: 13.4.0
===================================================== */

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

// =====================================================
// 1. FIREBASE CONFIGURATION
// =====================================================

import { firebaseConfig } from "./firebase-config.js";

// =====================================================
// 2. INITIALIZE FIREBASE APP
// =====================================================

export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// =====================================================
// 3. FIREBASE AUTHENTICATION
// =====================================================

export const auth = getAuth(app);

// =====================================================
// 4. FIRESTORE DATABASE
// =====================================================

export const db = getFirestore(app);

// =====================================================
// 5. REALTIME DATABASE
// =====================================================

export const database = getDatabase(app);

// =====================================================
// 6. FIREBASE STORAGE
// =====================================================

export const storage = getStorage(app);

// =====================================================
// 7. EXPORT ALL SERVICES
// =====================================================

export default app;

// =====================================================
// END FIREBASE INITIALIZATION
// =====================================================
