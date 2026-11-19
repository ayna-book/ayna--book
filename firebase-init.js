// firebase-init.js - AYNA BOOK

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
const storage = getStorage(app);

export {
  app,
  auth,
  db,
  database,
  storage
};

console.log("AYNA BOOK — Firebase initialized successfully.");
console.log("Firebase Project:", firebaseConfig.projectId);