
// =========================================================
// AYNA BOOK
// Security Audit Controller
// Step 22
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// SECURITY STATE
// =========================================================

let securityState = {
  authenticated: false,
  emailVerified: false,
  profileAvailable: false,
  accountStatus: "unknown",
  accountType: "unknown"
};


// =========================================================
// SECURITY LOGGER
// =========================================================

function securityLog(event, details = {}) {

  console.info(
    "[AYNA BOOK SECURITY]",
    {
      event,
      time: new Date().toISOString(),
      ...details
    }
  );

}


// =========================================================
// CHECK USER PROFILE
// =========================================================

async function checkUserProfile(user) {

  try {

    const userRef = doc(
      db,
      "users",
      user.uid
    );

    const snapshot = await getDoc(
      userRef
    );

    if (!snapshot.exists()) {

      securityState.profileAvailable = false;

      securityLog(
        "PROFILE_NOT_FOUND"
      );

      return false;
    }

    const data = snapshot.data();

    securityState.profileAvailable = true;

    securityState.accountType =
      data.accountType || "unknown";

    securityState.accountStatus =
      data.accountStatus || "unknown";

    securityLog(
      "PROFILE_CHECKED",
      {
        accountType: securityState.accountType,
        accountStatus: securityState.accountStatus
      }
    );

    return true;

  } catch (error) {

    console.error(
      "AYNA BOOK — Profile Security Check Error:",
      error
    );

    return false;
  }

}


// =========================================================
// SECURITY AUDIT
// =========================================================

export async function runSecurityAudit() {

  const user = auth.currentUser;

  if (!user) {

    return {
      success: false,
      authenticated: false,
      message: "Login প্রয়োজন।"
    };

  }

  try {

    await user.reload();

    const refreshedUser = auth.currentUser;

    if (!refreshedUser) {

      return {
        success: false,
        authenticated: false,
        message: "Login session পাওয়া যায়নি।"
      };

    }

    securityState.authenticated = true;

    securityState.emailVerified =
      refreshedUser.emailVerified;

    await checkUserProfile(
      refreshedUser
    );

    const result = {

      authenticated: true,

      emailVerified:
        securityState.emailVerified,

      profileAvailable:
        securityState.profileAvailable,

      accountType:
        securityState.accountType,

      accountStatus:
        securityState.accountStatus

    };

    securityLog(
      "SECURITY_AUDIT_COMPLETED",
      result
    );

    return {
      success: true,
      result
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Security Audit Error:",
      error
    );

    return {
      success: false,
      message:
        "Security Audit সম্পন্ন করা যায়নি।"
    };

  }

}


// =========================================================
// GET SECURITY STATUS
// =========================================================

export function getSecurityState() {

  return {
    ...securityState
  };

}


// =========================================================
// AUTH MONITOR
// =========================================================

onAuthStateChanged(
  auth,
  function (user) {

    securityState.authenticated =
      !!user;

    securityState.emailVerified =
      !!user?.emailVerified;

    if (user) {

      securityLog(
        "USER_AUTHENTICATED",
        {
          uid: user.uid
        }
      );

    } else {

      securityState.profileAvailable = false;

      securityState.accountType = "unknown";

      securityState.accountStatus = "unknown";

      securityLog(
        "USER_SIGNED_OUT"
      );

    }

  }
);


// =========================================================
// SYSTEM READY
// =========================================================

securityLog(
  "SECURITY_CONTROLLER_INITIALIZED"
);

console.log(
  "AYNA BOOK — Security Audit Controller Loaded."
);
