// =========================================================
// AYNA BOOK
// Main Application
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth
} from "./firebase-init.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ---------------------------------------------------------
// Authentication State
// ---------------------------------------------------------

onAuthStateChanged(auth, (user) => {

  if (!user) {
    console.log(
      "AYNA BOOK: User is not logged in."
    );
    return;
  }

  console.log(
    "AYNA BOOK: User authenticated:",
    user.uid
  );

});


// ---------------------------------------------------------
// Logout
// ---------------------------------------------------------

async function logoutUser() {

  try {

    await signOut(auth);

    console.log(
      "AYNA BOOK: Logout successful."
    );

    window.location.href = "login.html";

  } catch (error) {

    console.error(
      "AYNA BOOK Logout Error:",
      error
    );

    alert(
      "Logout করা যায়নি। আবার চেষ্টা করুন।"
    );

  }
}


// ---------------------------------------------------------
// Logout Buttons
// ---------------------------------------------------------

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const logoutButtons =
      document.querySelectorAll(
        "[data-action='logout'], #logoutButton, .logout-button"
      );

    logoutButtons.forEach((button) => {

      button.addEventListener(
        "click",
        logoutUser
      );

    });

  }
);


// ---------------------------------------------------------
// Global AYNA BOOK App Information
// ---------------------------------------------------------

window.AYNA_BOOK = {

  name: "AYNA BOOK",

  version: "1.0.0",

  firebaseSDK: "13.4.0",

  logout: logoutUser

};


console.log(
  "AYNA BOOK — app.js loaded successfully."
);