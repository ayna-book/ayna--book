// =========================================================
// AYNA BOOK
// Privacy Controller
// Firebase SDK: 13.4.0
//
// Step 16
// Login Session + Privacy Page Controller
// =========================================================

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// USER DATA
// =========================================================

let currentUser = null;
let currentProfile = null;


// =========================================================
// LOAD USER PROFILE
// =========================================================

async function loadUserProfile(user) {

  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );

    const snapshot =
      await getDoc(userRef);

    if (snapshot.exists()) {

      currentProfile =
        snapshot.data();

    } else {

      currentProfile =
        null;
    }

  } catch (error) {

    console.error(
      "AYNA BOOK — Privacy Profile Load Error:",
      error
    );

    currentProfile =
      null;
  }
}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
  auth,
  async function (user) {

    if (!user) {

      console.log(
        "AYNA BOOK — No authenticated user."
      );

      window.location.href =
        "./login.html";

      return;
    }


    currentUser =
      user;


    console.log(
      "AYNA BOOK — Privacy session active:",
      user.uid
    );


    await loadUserProfile(
      user
    );


    // -----------------------------------------------------
    // Verification Check
    // -----------------------------------------------------

    if (
      !user.emailVerified
    ) {

      console.warn(
        "AYNA BOOK — User email is not verified."
      );
    }


    console.log(
      "AYNA BOOK — Privacy Controller ready."
    );

  }
);


// =========================================================
// LOGOUT
// =========================================================

export async function logoutFromPrivacy() {

  try {

    await signOut(
      auth
    );

    window.location.href =
      "./login.html";

  } catch (error) {

    console.error(
      "AYNA BOOK — Privacy Logout Error:",
      error
    );
  }
}


// =========================================================
// GET CURRENT USER
// =========================================================

export function getPrivacyUser() {

  return currentUser;
}


// =========================================================
// GET CURRENT PROFILE
// =========================================================

export function getPrivacyProfile() {

  return currentProfile;
}


// =========================================================
// SECURITY INFORMATION
// =========================================================

export function getSecurityStatus() {

  if (!currentUser) {

    return {
      loggedIn: false,
      emailVerified: false
    };
  }


  return {

    loggedIn: true,

    emailVerified:
      currentUser.emailVerified,

    uid:
      currentUser.uid,

    accountType:
      currentProfile?.accountType ||
      "personal",

    accountStatus:
      currentProfile?.accountStatus ||
      "unknown"
  };
}


// =========================================================
// INITIAL MESSAGE
// =========================================================

console.log(
  "AYNA BOOK — privacy.js loaded successfully."
);

console.log(
  "AYNA BOOK — Privacy & Security controller active."
);