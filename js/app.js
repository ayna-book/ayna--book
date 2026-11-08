// Firebase SDK Imports (Modular v10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase Configuration (Replace with your google-services data if needed)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ayna-book.firebaseapp.com",
  projectId: "ayna-book",
  storageBucket: "ayna-book.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase safely to prevent splash screen lock
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Handle Splash Screen & App Loading
window.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splash-screen");
  const appContainer = document.getElementById("app-container");

  // Authenticate and bypass splash screen
  setTimeout(async () => {
    try {
      if (auth) {
        await signInAnonymously(auth);
        console.log("User signed in anonymously.");
      }
    } catch (err) {
      console.warn("Auth bypass warning:", err);
    }

    // Hide splash and show main app
    if (splashScreen) {
      splashScreen.style.opacity = "0";
      setTimeout(() => {
        splashScreen.style.display = "none";
        if (appContainer) appContainer.style.display = "block";
      }, 500);
    }
  }, 2000); // ২ সেকেন্ডের স্প্ল্যাশ টাইমআউট
});