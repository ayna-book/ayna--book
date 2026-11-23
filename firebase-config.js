
/* =========================================================
   AYNA BOOK — FIREBASE CONFIGURATION
   Firebase SDK: 13.4.0
   File: firebase-config.js

   Services:
   1. Firebase Authentication
   2. Cloud Firestore
   3. Realtime Database
   4. Firebase Storage
   ========================================================= */

export const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",

  databaseURL: "YOUR_REALTIME_DATABASE_URL",

  projectId: "YOUR_PROJECT_ID",

  storageBucket: "YOUR_STORAGE_BUCKET",

  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

  appId: "YOUR_APP_ID"

};

// Configuration check

if (!firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.databaseURL ||
    !firebaseConfig.appId) {

  throw new Error(
    "AYNA BOOK: Firebase configuration is incomplete."
  );

}

console.log("AYNA BOOK Firebase configuration loaded.");
