
/* ========================================================
   AYNA BOOK
   Privacy Controller
   Firebase SDK: 13.4.0
   STEP 36
======================================================== */

import { auth } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  loadPrivacySettings,
  savePrivacySettings,
  resetPrivacySettings
} from "./privacy-settings.js";


// ========================================================
// HTML ELEMENTS
// ========================================================

const profileVisibility = document.getElementById("profileVisibility");
const emailVisibility = document.getElementById("emailVisibility");
const phoneVisibility = document.getElementById("phoneVisibility");
const messagePermission = document.getElementById("messagePermission");
const searchVisibility = document.getElementById("searchVisibility");
const activityVisibility = document.getElementById("activityVisibility");

const saveButton = document.getElementById("savePrivacyButton");
const resetButton = document.getElementById("resetPrivacyButton");
const statusMessage = document.getElementById("statusMessage");


// ========================================================
// ELEMENT VALIDATION
// ========================================================

const requiredElements = [
  profileVisibility,
  emailVisibility,
  phoneVisibility,
  messagePermission,
  searchVisibility,
  activityVisibility,
  saveButton,
  resetButton,
  statusMessage
];

if (requiredElements.some(element => !element)) {
  console.error("AYNA BOOK — Privacy HTML elements missing.");
  throw new Error("Privacy page HTML elements are missing.");
}


// ========================================================
// STATUS MESSAGE
// ========================================================

function showStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}


// ========================================================
// LOADING STATE
// ========================================================

function setLoading(loading) {
  saveButton.disabled = loading;
  resetButton.disabled = loading;

  saveButton.textContent = loading
    ? "SAVING..."
    : "SAVE PRIVACY SETTINGS";

  resetButton.textContent = loading
    ? "PLEASE WAIT..."
    : "RESET SETTINGS";
}


// ========================================================
// GET FORM SETTINGS
// ========================================================

function getFormSettings() {
  return {
    profileVisibility: profileVisibility.value,
    emailVisibility: emailVisibility.checked,
    phoneVisibility: phoneVisibility.checked,
    messagePermission: messagePermission.value,
    searchVisibility: searchVisibility.checked,
    activityVisibility: activityVisibility.checked
  };
}


// ========================================================
// APPLY SETTINGS
// ========================================================

function applySettings(settings) {
  profileVisibility.value = settings.profileVisibility;
  emailVisibility.checked = settings.emailVisibility;
  phoneVisibility.checked = settings.phoneVisibility;
  messagePermission.value = settings.messagePermission;
  searchVisibility.checked = settings.searchVisibility;
  activityVisibility.checked = settings.activityVisibility;
}


// ========================================================
// LOAD SETTINGS
// ========================================================

async function initializePrivacySettings() {
  try {
    showStatus("আপনার Privacy Settings লোড হচ্ছে...", "info");

    const result = await loadPrivacySettings();

    if (!result.success) {
      throw new Error(result.message);
    }

    applySettings(result.settings);

    showStatus("Privacy Settings লোড হয়েছে।", "success");

  } catch (error) {
    console.error("AYNA BOOK — Privacy Load Error:", error);

    showStatus(
      error.message || "Privacy Settings লোড করা যায়নি।",
      "error"
    );
  }
}


// ========================================================
// SAVE SETTINGS
// ========================================================

saveButton.addEventListener("click", async () => {
  if (saveButton.disabled) return;

  try {
    setLoading(true);

    showStatus("Privacy Settings সংরক্ষণ হচ্ছে...", "info");

    const result = await savePrivacySettings(getFormSettings());

    if (!result.success) {
      throw new Error(result.message);
    }

    showStatus(
      "Privacy Settings সফলভাবে সংরক্ষণ হয়েছে।",
      "success"
    );

  } catch (error) {
    console.error("AYNA BOOK — Privacy Save Error:", error);

    showStatus(
      error.message || "Settings সংরক্ষণ করা যায়নি।",
      "error"
    );

  } finally {
    setLoading(false);
  }
});


// ========================================================
// RESET SETTINGS
// ========================================================

resetButton.addEventListener("click", async () => {
  if (resetButton.disabled) return;

  const confirmed = window.confirm(
    "আপনি কি Privacy Settings Default অবস্থায় ফিরিয়ে নিতে চান?"
  );

  if (!confirmed) return;

  try {
    setLoading(true);

    showStatus("Default Privacy Settings পুনরুদ্ধার হচ্ছে...", "info");

    const result = await resetPrivacySettings();

    if (!result.success) {
      throw new Error(result.message);
    }

    await initializePrivacySettings();

    showStatus(
      "Default Privacy Settings পুনরুদ্ধার হয়েছে।",
      "success"
    );

  } catch (error) {
    console.error("AYNA BOOK — Privacy Reset Error:", error);

    showStatus(
      error.message || "Settings Reset করা যায়নি।",
      "error"
    );

  } finally {
    setLoading(false);
  }
});


// ========================================================
// AUTHENTICATION
// ========================================================

let authCheckStarted = false;

onAuthStateChanged(auth, async (user) => {
  if (authCheckStarted) return;

  if (!user) {
    window.location.replace("./login.html");
    return;
  }

  authCheckStarted = true;

  try {
    await user.reload();

    if (!auth.currentUser) {
      window.location.replace("./login.html");
      return;
    }

    await initializePrivacySettings();

  } catch (error) {
    console.error("AYNA BOOK — Privacy Auth Error:", error);

    showStatus(
      "Account যাচাই করা যায়নি। আবার Login করুন।",
      "error"
    );

  }
});


// ========================================================
// SYSTEM READY
// ========================================================

console.log(
  "AYNA BOOK — Privacy Controller Loaded Successfully."
);
