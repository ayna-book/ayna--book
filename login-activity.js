
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

  if (/ipad|tablet/i.test(userAgent)) {
    return "tablet";
  }

  if (/mobile|android|iphone|ipod|windows phone/i.test(userAgent)) {
    return "mobile";
  }

  return "desktop";
}


// =========================================================
// BROWSER INFORMATION
// =========================================================

function getBrowserInformation() {

  const userAgent = navigator.userAgent;

  if (/edg/i.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/opr|opera/i.test(userAgent)) {
    return "Opera";
  }

  if (/firefox/i.test(userAgent)) {
    return "Mozilla Firefox";
  }

  if (/chrome/i.test(userAgent)) {
    return "Google Chrome";
  }

  if (/safari/i.test(userAgent)) {
    return "Safari";
  }

  return "Unknown";
}


// =========================================================
// GET CURRENT USER
// =========================================================

function getValidUser(user = null) {

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

  return currentUser;
}


// =========================================================
// ACTIVITY COLLECTION
// =========================================================

function getActivityCollection(user) {

  return collection(
    db,
    "users",
    user.uid,
    "loginActivity"
  );
}


// =========================================================
// CREATE ACTIVITY DATA
// =========================================================

function createActivityData(user, eventName) {

  return {

    uid: user.uid,

    email: user.email || "",

    emailVerified:
      user.emailVerified === true,

    event: eventName,

    deviceType:
      getDeviceType(),

    browserInformation:
      getBrowserInformation(),

    createdAt:
      serverTimestamp()

  };
}


// =========================================================
// RECORD LOGIN ACTIVITY
// =========================================================

export async function recordLoginActivity(user = null) {

  const currentUser =
    getValidUser(user);

  const activityRef =
    getActivityCollection(currentUser);

  const activityData =
    createActivityData(
      currentUser,
      "login"
    );

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
// RECORD CUSTOM AUTH ACTIVITY
// =========================================================

export async function recordAuthActivity(
  eventName,
  user = null
) {

  const currentUser =
    getValidUser(user);

  const normalizedEvent =
    String(eventName || "unknown")
      .trim()
      .slice(0, 50);

  const activityRef =
    getActivityCollection(currentUser);

  const activityData =
    createActivityData(
      currentUser,
      normalizedEvent
    );

  const documentReference =
    await addDoc(
      activityRef,
      activityData
    );

  console.log(
    "AYNA BOOK Auth Activity recorded:",
    documentReference.id
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
