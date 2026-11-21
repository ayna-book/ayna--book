// =========================================================
// AYNA BOOK
// FIREBASE SERVICE CONNECTOR
// Firebase SDK: 13.4.0
// =========================================================

import {
  app,
  auth,
  db,
  database,
  storage
} from "./firebase-init.js";


// =========================================================
// EXPORT FIREBASE SERVICES
// =========================================================

export {
  app,
  auth,
  db,
  database,
  storage
};


// =========================================================
// CONNECTION STATUS
// =========================================================

console.log("========================================");
console.log("AYNA BOOK - Firebase Service Connector");
console.log("========================================");

console.log("Firebase App:", !!app);
console.log("Firebase Auth:", !!auth);
console.log("Cloud Firestore:", !!db);
console.log("Realtime Database:", !!database);
console.log("Firebase Storage:", !!storage);

console.log("========================================");
console.log("Firebase connector loaded successfully.");
console.log("========================================");