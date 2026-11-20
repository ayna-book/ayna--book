
/* ========================================================
   AYNA BOOK
   Session Security Controller
   Step 25
   Firebase SDK: 13.4.0
======================================================== */

import { auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ========================================================
// CONFIGURATION
// ========================================================

// নিষ্ক্রিয় অবস্থায় ৩০ মিনিট পর সতর্ক করবে।
// এটি সার্ভার-সাইড Session Expiration নয়।

const INACTIVITY_WARNING_MS =
  30 * 60 * 1000;


// ========================================================
// SESSION STATE
// ========================================================

let currentUser = null;

let inactivityTimer = null;

let warningShown = false;


// ========================================================
// SECURITY MESSAGE
// ========================================================

function showSecurityMessage(message) {

  console.info(
    "[AYNA BOOK SECURITY]",
    message
  );

}


// ========================================================
// RESET INACTIVITY TIMER
// ========================================================

function resetInactivityTimer() {

  if (inactivityTimer) {

    clearTimeout(inactivityTimer);

  }

  warningShown = false;

  inactivityTimer = setTimeout(
    function () {

      if (!currentUser) {
        return;
      }

      warningShown = true;

      showSecurityMessage(
        "User inactive for 30 minutes."
      );

      const continueSession = window.confirm(
        "আপনি ৩০ মিনিট নিষ্ক্রিয় ছিলেন। Login চালু রাখতে OK চাপুন।"
      );

      if (continueSession) {

        resetInactivityTimer();

      } else {

        logoutSecurely();

      }

    },
    INACTIVITY_WARNING_MS
  );

}


// ========================================================
// SECURE LOGOUT
// ========================================================

export async function logoutSecurely() {

  try {

    if (inactivityTimer) {

      clearTimeout(inactivityTimer);

      inactivityTimer = null;

    }

    await signOut(auth);

    currentUser = null;

    showSecurityMessage(
      "User signed out successfully."
    );

    window.location.replace(
      "./login.html"
    );

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


// ========================================================
// SESSION STATUS
// ========================================================

export function getSessionStatus() {

  return {

    authenticated: !!currentUser,

    userId: currentUser
      ? currentUser.uid
      : null,

    emailVerified: currentUser
      ? currentUser.emailVerified
      : false

  };

}


// ========================================================
// USER ACTIVITY MONITOR
// ========================================================

const activityEvents = [
  "click",
  "keydown",
  "touchstart",
  "scroll"
];

activityEvents.forEach(
  function (eventName) {

    window.addEventListener(
      eventName,
      function () {

        if (currentUser) {

          resetInactivityTimer();

        }

      },
      { passive: true }
    );

  }
);


// ========================================================
// AUTHENTICATION MONITOR
// ========================================================

onAuthStateChanged(
  auth,
  function (user) {

    currentUser = user;

    if (!user) {

      if (inactivityTimer) {

        clearTimeout(inactivityTimer);

        inactivityTimer = null;

      }

      showSecurityMessage(
        "No active authenticated session."
      );

      return;

    }

    showSecurityMessage(
      "Authenticated session detected."
    );

    resetInactivityTimer();

  }
);


// ========================================================
// SYSTEM READY
// ========================================================

showSecurityMessage(
  "Session Security Controller Initialized."
);

console.log(
  "AYNA BOOK — Session Security Ready."
);
