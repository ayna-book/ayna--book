import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

import {
  firebaseConfig
} from "../firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Cloud Firestore Database
export const db = getFirestore(app);

// Firebase Storage
export const storage = getStorage(app);

// Export Firebase App
export { app };