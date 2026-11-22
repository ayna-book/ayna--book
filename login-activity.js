// =========================================================
// AYNA BOOK
// LOGIN ACTIVITY CONTROLLER
// File: login-activity.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  db
} from "./firebase.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// RECORD LOGIN ACTIVITY
// =========================================================

export async function recordLoginActivity(user) {

  // -------------------------------------------------------
  // Validate user
  // -------------------------------------------------------

  if (!user || !user.uid) {

    throw new Error(
      "AYNA BOOK: User information is missing."
    );

  }


  // -------------------------------------------------------
  // Firestore user document
  // -------------------------------------------------------

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );


  // -------------------------------------------------------
  // Save last login time
  // -------------------------------------------------------

  await setDoc(
    userRef,
    {
      lastLoginAt:
        serverTimestamp()
    },
    {
      merge: true
    }
  );


  // -------------------------------------------------------
  // Console
  // -------------------------------------------------------

  console.log(
    "AYNA BOOK: Login activity saved successfully.",
    user.uid
  );

}