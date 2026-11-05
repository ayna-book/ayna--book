
// =============================================
// AYNA BOOK — Firebase Online Connection
// File: js/firebase.js
// Firebase SDK: 12.5.0
// Founder: Mohammed Mahabub Alam
// =============================================

// Firebase App
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

// Firebase Authentication
import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Cloud Firestore
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase Storage
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// Firebase Configuration
import {
  firebaseConfig
} from "../firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);

// Firebase Storage
export const storage = getStorage(app);

// Export Firebase App
export { app };
