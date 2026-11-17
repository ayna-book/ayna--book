// ======================================================
// AYNA BOOK — Firebase Initialization
// Firebase Web SDK 13.4.0
// ======================================================

// ------------------------------------------------------
// Firebase App
// ------------------------------------------------------

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";


// ------------------------------------------------------
// Firebase Authentication
// ------------------------------------------------------

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ------------------------------------------------------
// Firebase Firestore
// ------------------------------------------------------

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// ------------------------------------------------------
// Firebase Realtime Database
// ------------------------------------------------------

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ------------------------------------------------------
// Firebase Storage
// ------------------------------------------------------

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// ------------------------------------------------------
// AYNA BOOK Firebase Configuration
// ------------------------------------------------------

import {
  firebaseConfig
} from "./firebase-config.js";


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

let app;

try {

  // Prevent Firebase from being initialized twice
  if (getApps().length > 0) {

    app = getApp();

  } else {

    app = initializeApp(firebaseConfig);

  }

  console.log(
    "✅ AYNA BOOK Firebase App initialized"
  );

} catch (error) {

  console.error(
    "❌ Firebase App initialization failed:",
    error
  );

  throw error;
}


// ======================================================
// FIREBASE SERVICES
// ======================================================

let auth;
let db;
let realtimeDB;
let storage;


try {

  // Authentication
  auth = getAuth(app);

  // Firestore
  db = getFirestore(app);

  // Realtime Database
  realtimeDB = getDatabase(app);

  // Storage
  storage = getStorage(app);


  console.log(
    "✅ Firebase Authentication: READY"
  );

  console.log(
    "✅ Firestore Database: READY"
  );

  console.log(
    "✅ Realtime Database: READY"
  );

  console.log(
    "✅ Firebase Storage: READY"
  );

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
// GLOBAL AYNA BOOK FIREBASE OBJECT
// ======================================================

window.AYNA_FIREBASE = {

  app: app,

  auth: auth,

  db: db,

  realtimeDB: realtimeDB,

  storage: storage

};


// ======================================================
// CONNECTION INFORMATION
// ======================================================

window.AYNA_FIREBASE_STATUS = {

  connected: true,

  projectId:
    firebaseConfig.projectId,

  appId:
    firebaseConfig.appId,

  sdkVersion:
    "13.4.0",

  services: {

    authentication: true,

    firestore: true,

    realtimeDatabase: true,

    storage: true

  }

};


// ======================================================
// FINAL STATUS
// ======================================================

console.log(
  "=========================================="
);

console.log(
  "🚀 AYNA BOOK FIREBASE READY"
);

console.log(
  "🔥 SDK: 13.4.0"
);

console.log(
  "📌 Project: " +
  firebaseConfig.projectId
);

console.log(
  "🔐 Authentication: READY"
);

console.log(
  "🗄️ Firestore: READY"
);

console.log(
  "⚡ Realtime Database: READY"
);

console.log(
  "📦 Storage: READY"
);

console.log(
  "=========================================="
);