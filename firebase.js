// =========================================================
// AYNA BOOK
// FIREBASE SERVICE CONNECTOR
// Firebase SDK: 13.4.0
// =========================================================

// Firebase services initialized in firebase-init.js
export {
  app,
  auth,
  db,
  database,
  storage
} from "./firebase-init.js";


// =========================================================
// STATUS
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