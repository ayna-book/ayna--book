// =========================================================
// AYNA BOOK
// FIREBASE APP COMPATIBILITY FILE
// Firebase SDK: 13.4.0
// Main initialization: firebase-init.js
// =========================================================

import {
  app,
  auth,
  database,
  firebaseConfig,
  authReady,
  watchFirebaseConnection,
  setUserPresence,
  setUserOffline
} from "./firebase-init.js";

// =========================================================
// GLOBAL ACCESS
// =========================================================

window.AYNA_APP = {
  app,
  auth,
  database,
  firebaseConfig,
  authReady,
  watchFirebaseConnection,
  setUserPresence,
  setUserOffline
};

window.AYNA_AUTH = auth;
window.AYNA_DATABASE = database;
window.AYNA_FIREBASE = window.AYNA_APP;

// =========================================================
// EXPORT
// =========================================================

export {
  app,
  auth,
  database,
  firebaseConfig,
  authReady,
  watchFirebaseConnection,
  setUserPresence,
  setUserOffline
};

console.log("AYNA BOOK Firebase connected successfully.");