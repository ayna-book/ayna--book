
/* ========================================================
   AYNA BOOK
   Security Dashboard Controller
   Step 24
   Firebase SDK: 13.4.0
======================================================== */

import { auth } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  runSecurityAudit
} from "./security.js";


// ========================================================
// HTML ELEMENTS
// ========================================================

const loginStatus =
  document.getElementById("loginStatus");

const emailStatus =
  document.getElementById("emailStatus");

const profileStatus =
  document.getElementById("profileStatus");

const accountType =
  document.getElementById("accountType");

const accountStatus =
  document.getElementById("accountStatus");

const statusMessage =
  document.getElementById("statusMessage");

const auditButton =
  document.getElementById("auditButton");


// ========================================================
// DISPLAY HELPERS
// ========================================================

function setText(element, value) {

  if (element) {
    element.textContent = value;
  }

}


function showStatus(message) {

  setText(statusMessage, message);

}


function resetDashboard() {

  setText(loginStatus, "Not logged in");
  setText(emailStatus, "Unknown");
  setText(profileStatus, "Unknown");
  setText(accountType, "Unknown");
  setText(accountStatus, "Unknown");

}


// ========================================================
// DISPLAY AUDIT RESULT
// ========================================================

function displayAuditResult(result) {

  setText(
    loginStatus,
    result.authenticated
      ? "Logged in"
      : "Not logged in"
  );

  setText(
    emailStatus,
    result.emailVerified
      ? "Verified"
      : "Not verified"
  );

  setText(
    profileStatus,
    result.profileAvailable
      ? "Available"
      : "Not found"
  );

  setText(
    accountType,
    result.accountType || "Unknown"
  );

  setText(
    accountStatus,
    result.accountStatus || "Unknown"
  );

}


// ========================================================
// RUN SECURITY AUDIT
// ========================================================

async function performAudit() {

  if (auditButton) {
    auditButton.disabled = true;
    auditButton.textContent = "Checking...";
  }

  showStatus(
    "AYNA BOOK Security Audit চলছে..."
  );

  try {

    const audit = await runSecurityAudit();

    if (!audit.success) {

      showStatus(
        audit.message ||
        "Security Audit সম্পন্ন হয়নি।"
      );

      return;

    }

    displayAuditResult(
      audit.result
    );

    const result = audit.result;

    if (!result.emailVerified) {

      showStatus(
        "আপনার Gmail এখনো Verify করা হয়নি।"
      );

    } else if (!result.profileAvailable) {

      showStatus(
        "আপনার Profile পাওয়া যায়নি। Profile তৈরি বা পরীক্ষা করুন।"
      );

    } else {

      showStatus(
        "Security Audit সম্পন্ন হয়েছে।"
      );

    }

  } catch (error) {

    console.error(
      "AYNA BOOK Dashboard Error:",
      error
    );

    showStatus(
      "Security Audit-এ সমস্যা হয়েছে। আবার চেষ্টা করুন।"
    );

  } finally {

    if (auditButton) {
      auditButton.disabled = false;
      auditButton.textContent = "Run Security Audit";
    }

  }

}


// ========================================================
// AUTHENTICATION CHECK
// ========================================================

onAuthStateChanged(
  auth,
  async function (user) {

    if (!user) {

      resetDashboard();

      showStatus(
        "Dashboard দেখতে Login করুন।"
      );

      window.location.replace(
        "./login.html"
      );

      return;

    }

    await performAudit();

  }
);


// ========================================================
// BUTTON EVENT
// ========================================================

if (auditButton) {

  auditButton.addEventListener(
    "click",
    performAudit
  );

}


// ========================================================
// SYSTEM READY
// ========================================================

console.log(
  "AYNA BOOK — Security Dashboard Loaded."
);
