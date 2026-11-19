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

  if (user) {

    console.log(
      "AYNA BOOK: User authenticated:",
      user.uid
    );

    // Global user information
    window.AYNA_BOOK_USER = user;

  } else {

    console.log(
      "AYNA BOOK: User is not logged in."
    );

    window.AYNA_BOOK_USER = null;
  }

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

    window.location.replace("login.html");

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
        async (event) => {

          event.preventDefault();

          if (button.disabled) {
            return;
          }

          button.disabled = true;

          try {

            await logoutUser();

          } finally {

            button.disabled = false;

          }

        }
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

  logout: logoutUser,

  getCurrentUser: () => auth.currentUser

};


// ---------------------------------------------------------
// Console
// ---------------------------------------------------------

console.log(
  "AYNA BOOK — app.js loaded successfully."
);