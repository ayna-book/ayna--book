
/* ======================================================
   AYNA BOOK — FIREBASE INITIALIZATION
   Firebase App + Authentication + Firestore
   ====================================================== */

import { initializeApp, getApp, getApps } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ======================================================
// FIREBASE CONFIGURATION
// ======================================================

// এখানে Firebase Console থেকে পাওয়া সঠিক তথ্য বসান।

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


// ======================================================
// VALIDATE CONFIGURATION
// ======================================================

const requiredFields = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId"
];

for (const field of requiredFields) {
  if (
    !firebaseConfig[field] ||
    firebaseConfig[field].startsWith("YOUR_")
  ) {
    throw new Error(
      `AYNA BOOK Firebase configuration missing: ${field}`
    );
  }
}


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);


// ======================================================
// FIREBASE AUTHENTICATION
// ======================================================

export const auth = getAuth(app);


// ======================================================
// FIRESTORE DATABASE
// ======================================================

export const db = getFirestore(app);


// ======================================================
// EXPORT FIREBASE APP
// ======================================================

export { app };


// ======================================================
// INITIALIZATION COMPLETE
// ======================================================

console.log("AYNA BOOK Firebase initialized successfully.");
