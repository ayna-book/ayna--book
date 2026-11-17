// ======================================================
// AYNA BOOK — Firebase Initialization
// Firebase Web SDK 12.5.0
// ======================================================

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

import {
  firebaseConfig
} from "./firebase-config.js";


// ======================================================
// INITIALIZE FIREBASE APP
// ======================================================

let app;

try {
  app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

  console.log("✅ AYNA BOOK Firebase App initialized");

} catch (error) {
  console.error(
    "❌ Firebase App initialization failed:",
    error
  );

  throw error;
}


// ======================================================
// INITIALIZE FIREBASE SERVICES
// ======================================================

let auth;
let db;
let realtimeDB;
let storage;

try {

  auth = getAuth(app);

  db = getFirestore(app);

  realtimeDB = getDatabase(app);

  storage = getStorage(app);

  console.log("✅ Firebase Authentication: READY");
  console.log("✅ Firestore Database: READY");
  console.log("✅ Realtime Database: READY");
  console.log("✅ Firebase Storage: READY");

} catch (error) {

  console.error(
    "❌ Firebase services initialization failed:",
    error
  );

  throw error;
}


// ======================================================
// EXPORT FIREBASE SERVICES
// ======================================================

export {
  app,
  auth,
  db,
  realtimeDB,
  storage
};


// ======================================================
// GLOBAL AYNA FIREBASE OBJECT
// ======================================================

window.AYNA_FIREBASE = {
  app,
  auth,
  db,
  realtimeDB,
  storage
};


// ======================================================
// FIREBASE STATUS
// ======================================================

window.AYNA_FIREBASE_STATUS = {

  connected: true,

  projectId: firebaseConfig.projectId,

  appId: firebaseConfig.appId,

  sdkVersion: "12.5.0",

  services: {

    authentication: true,

    firestore: true,

    realtimeDatabase: true,

    storage: true

  }

};


// ======================================================
// CONSOLE STATUS
// ======================================================

console.log("==========================================");
console.log("🚀 AYNA BOOK FIREBASE READY");
console.log("🔥 Firebase Web SDK: 12.5.0");
console.log("📌 Project: " + firebaseConfig.projectId);
console.log("🔐 Authentication: READY");
console.log("🗄️ Firestore: READY");
console.log("⚡ Realtime Database: READY");
console.log("📦 Storage: READY");
console.log("==========================================");