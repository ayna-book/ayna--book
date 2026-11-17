// ============================================
// AYNA BOOK - Firebase Configuration
// ============================================

import { initializeApp, getApp, getApps } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { getDatabase } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

import { getStorage } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// Firebase Project Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL:
    "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:81a9adacbedbc5f3626911",
  measurementId: "G-JWBYNXSBMZ"
};

// Initialize Firebase only once
export const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);
export const storage = getStorage(app);