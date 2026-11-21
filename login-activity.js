// =========================================================
// AYNA BOOK
// LOGIN ACTIVITY
// File: login-activity.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  db
} from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// DEVICE TYPE
// =========================================================

function getDeviceType() {

  const userAgent =
    navigator.userAgent.toLowerCase();

  if (
    /mobile|android|iphone|ipod|windows phone/i
      .test(userAgent)
  ) {
    return "mobile";
  }

  if (
    /ipad|tablet/i
      .test(userAgent)
  ) {
    return "tablet";
  }

  return "desktop";
}


// =========================================================
// BROWSER INFORMATION
// =========================================================

function getBrowserInformation() {

  const userAgent =
    navigator.userAgent;

  let browser = "Unknown";


  if (/edg/i.test(userAgent)) {
    browser = "Microsoft Edge";
  }

  else if (/opr|opera/i.test(userAgent)) {
    browser = "Opera";
  }

  else if (/chrome/i.test(userAgent)) {
    browser = "Google Chrome";
  }

  else if (/firefox/i.test(userAgent)) {
    browser = "Mozilla Firefox";
  }

  else if (/safari/i.test(userAgent)) {
    browser = "Safari";
  }


  return browser;
}


// =========================================================
// RECORD LOGIN ACTIVITY
// =========================================================

export async function recordLoginActivity(user = null) {

  const currentUser =
    user || auth.currentUser;


  if (!currentUser) {

    throw new Error(
      "LOGIN_ACTIVITY_USER_MISSING"
    );
  }


  if (!currentUser.uid) {

    throw new Error(
      "LOGIN_ACTIVITY_UID_MISSING"
    );
  }


  const activityRef =
    collection(
      db,
      "users",
      currentUser.uid,
      "loginActivity"
    );


  const activityData = {

    // Firebase user information
    uid: currentUser.uid,

    email:
      currentUser.email || "",

    emailVerified:
      currentUser.emailVerified === true,


    // Login information
    event: "login",

    deviceType:
      getDeviceType(),

    browserInformation:
      getBrowserInformation(),


    // Server timestamp
    createdAt:
      serverTimestamp()

  };


  const documentReference =
    await addDoc(
      activityRef,
      activityData
    );


  console.log(
    "AYNA BOOK Login Activity recorded:",
    documentReference.id
  );


  return documentReference;
}


// =========================================================
// OPTIONAL — RECORD CUSTOM AUTH EVENT
// =========================================================

export async function recordAuthActivity(
  eventName,
  user = null
) {

  const currentUser =
    user || auth.currentUser;


  if (!currentUser?.uid) {

    throw new Error(
      "AUTH_ACTIVITY_USER_MISSING"
    );
  }


  const activityRef =
    collection(
      db,
      "users",
      currentUser.uid,
      "loginActivity"
    );


  const documentReference =
    await addDoc(
      activityRef,
      {

        uid:
          currentUser.uid,

        email:
          currentUser.email || "",

        emailVerified:
          currentUser.emailVerified === true,

        event:
          String(eventName || "unknown"),

        deviceType:
          getDeviceType(),

        browserInformation:
          getBrowserInformation(),

        createdAt:
          serverTimestamp()

      }
    );


  return documentReference;
}


// =========================================================
// EXPORT DEVICE HELPERS
// =========================================================

export {
  getDeviceType,
  getBrowserInformation
};


// =========================================================
// DEBUG
// =========================================================

console.log(
  "========================================"
);

console.log(
  "AYNA BOOK - Login Activity"
);

console.log(
  "login-activity.js loaded successfully."
);

console.log(
  "========================================"
);