// =========================================================
// AYNA BOOK
// Firebase Main Configuration
// Firebase SDK: 13.4.0
// =========================================================

import {
  initializeApp
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

import {
  firebaseConfig
} from "./firebase-config.js";


// ---------------------------------------------------------
// Firebase App
// ---------------------------------------------------------

const app = initializeApp(firebaseConfig);


// ---------------------------------------------------------
// Firebase Services
// ---------------------------------------------------------

const auth = getAuth(app);

const db = getFirestore(app);

const database = getDatabase(app);

const storage = getStorage(app);


// ---------------------------------------------------------
// Exports
// ---------------------------------------------------------

export {
  app,
  auth,
  db,
  database,
  storage
};


// ---------------------------------------------------------
// Console information
// ---------------------------------------------------------

console.log(
  "AYNA BOOK — Firebase initialized."
);

console.log(
  "Firebase Project:",
  firebaseConfig.projectId
);