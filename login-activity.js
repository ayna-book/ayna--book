
/* ========================================================
   AYNA BOOK
   Login Activity Controller
   Step 31
   Firebase SDK: 13.4.0

   NOTE:
   This is a client-side activity logger.
   It is not a trusted security audit log.
======================================================== */

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// ========================================================
// DEVICE INFORMATION
// ========================================================

function getDeviceInformation() {

  const userAgent =
    navigator.userAgent || "Unknown";

  let deviceType = "Unknown";

  if (/Android/i.test(userAgent)) {

    deviceType = "Android";

  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {

    deviceType = "iOS";

  } else if (/Windows/i.test(userAgent)) {

    deviceType = "Windows";

  } else if (/Macintosh|Mac OS/i.test(userAgent)) {

    deviceType = "macOS";

  } else if (/Linux/i.test(userAgent)) {

    deviceType = "Linux";

  }

  return {
    deviceType,
    browserInformation: userAgent.substring(0, 250)
  };

}


// ========================================================
// RECORD LOGIN ACTIVITY
// ========================================================

export async function recordLoginActivity(user) {

  if (!user || !user.uid) {

    return {
      success: false,
      message: "Authenticated user required."
    };

  }

  try {

    const device = getDeviceInformation();

    const activityCollection = collection(
      db,
      "users",
      user.uid,
      "loginActivity"
    );

    await addDoc(
      activityCollection,
      {
        event: "login",
        deviceType: device.deviceType,
        browserInformation: device.browserInformation,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp()
      }
    );

    console.info(
      "AYNA BOOK — Login Activity Recorded."
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Login Activity Error:",
      error
    );

    return {
      success: false,
      message: "Activity could not be recorded."
    };

  }

}


// ========================================================
// AUTHENTICATION MONITOR
// ========================================================

// IMPORTANT:
// This observer also fires when an existing session is
// restored. Therefore it does not prove a fresh login.

onAuthStateChanged(
  auth,
  function (user) {

    if (!user) {

      console.info(
        "AYNA BOOK — No active user session."
      );

    }

  }
);


// ========================================================
// SYSTEM READY
// ========================================================

console.log(
  "AYNA BOOK — Login Activity Controller Loaded."
);
