// =========================================================
// AYNA BOOK
// Firebase Service Connector
// Firebase SDK: 13.4.0
// =========================================================

// Firebase initialization থেকে সব service নেওয়া হচ্ছে
export {
  app,
  auth,
  db,
  database,
  storage
} from "./firebase-init.js";


// =========================================================
// AYNA BOOK — Firebase Connector Ready
// =========================================================

console.log(
  "AYNA BOOK — Firebase service connector loaded successfully."
);