
// =========================================================
// AYNA BOOK
// Privacy Controller
// Firebase SDK: 13.4.0
// STEP 20
// Privacy Load + Save + Reset
// =========================================================

import {
  auth
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  loadPrivacySettings,
  savePrivacySettings,
  resetPrivacySettings
} from "./privacy-settings.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const profileVisibility =
  document.getElementById("profileVisibility");

const emailVisibility =
  document.getElementById("emailVisibility");

const phoneVisibility =
  document.getElementById("phoneVisibility");

const messagePermission =
  document.getElementById("messagePermission");

const searchVisibility =
  document.getElementById("searchVisibility");

const activityVisibility =
  document.getElementById("activityVisibility");

const saveButton =
  document.getElementById("savePrivacyButton");

const resetButton =
  document.getElementById("resetPrivacyButton");

const statusMessage =
  document.getElementById("statusMessage");


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(
  message,
  type = "info"
) {

  if (!statusMessage) {
    return;
  }

  statusMessage.textContent =
    message;

  statusMessage.className =
    type;
}


// =========================================================
// LOADING
// =========================================================

function setLoading(loading) {

  if (saveButton) {

    saveButton.disabled =
      loading;

    saveButton.textContent =
      loading
        ? "SAVING..."
        : "SAVE PRIVACY SETTINGS";
  }

  if (resetButton) {

    resetButton.disabled =
      loading;

    resetButton.textContent =
      loading
        ? "PLEASE WAIT..."
        : "RESET SETTINGS";
  }
}


// =========================================================
// GET FORM SETTINGS
// =========================================================

function getFormSettings() {

  return {

    profileVisibility:
      profileVisibility.value,

    emailVisibility:
      emailVisibility.checked,

    phoneVisibility:
      phoneVisibility.checked,

    messagePermission:
      messagePermission.value,

    searchVisibility:
      searchVisibility.checked,

    activityVisibility:
      activityVisibility.checked

  };

}


// =========================================================
// APPLY SETTINGS TO FORM
// =========================================================

function applySettings(settings) {

  profileVisibility.value =
    settings.profileVisibility;

  emailVisibility.checked =
    settings.emailVisibility;

  phoneVisibility.checked =
    settings.phoneVisibility;

  messagePermission.value =
    settings.messagePermission;

  searchVisibility.checked =
    settings.searchVisibility;

  activityVisibility.checked =
    settings.activityVisibility;

}


// =========================================================
// LOAD SETTINGS
// =========================================================

async function initializePrivacySettings() {

  try {

    showStatus(
      "আপনার Privacy Settings লোড হচ্ছে...",
      "info"
    );

    const result =
      await loadPrivacySettings();

    if (!result.success) {

      throw new Error(
        result.message
      );
    }

    applySettings(
      result.settings
    );

    showStatus(
      "Privacy Settings লোড হয়েছে।",
      "success"
    );

  } catch (error) {

    console.error(
      "AYNA BOOK — Privacy Initialization Error:",
      error
    );

    showStatus(
      error.message ||
      "Privacy Settings লোড করা যায়নি।",
      "error"
    );

  }

}


// =========================================================
// SAVE BUTTON
// =========================================================

if (saveButton) {

  saveButton.addEventListener(
    "click",
    async function () {

      try {

        setLoading(true);

        showStatus(
          "Privacy Settings সংরক্ষণ হচ্ছে...",
          "info"
        );

        const settings =
          getFormSettings();

        const result =
          await savePrivacySettings(
            settings
          );

        if (!result.success) {

          throw new Error(
            result.message
          );
        }

        showStatus(
          "Privacy Settings সফলভাবে সংরক্ষণ হয়েছে।",
          "success"
        );

      } catch (error) {

        console.error(
          "AYNA BOOK — Privacy Save Error:",
          error
        );

        showStatus(
          error.message ||
          "Settings সংরক্ষণ করা যায়নি।",
          "error"
        );

      } finally {

        setLoading(false);

      }

    }
  );

}


// =========================================================
// RESET BUTTON
// =========================================================

if (resetButton) {

  resetButton.addEventListener(
    "click",
    async function () {

      const confirmed =
        window.confirm(
          "আপনি কি Privacy Settings Default অবস্থায় ফিরিয়ে নিতে চান?"
        );

      if (!confirmed) {
        return;
      }

      try {

        setLoading(true);

        showStatus(
          "Default Privacy Settings পুনরুদ্ধার হচ্ছে...",
          "info"
        );

        const result =
          await resetPrivacySettings();

        if (!result.success) {

          throw new Error(
            result.message
          );
        }

        await initializePrivacySettings();

        showStatus(
          "Default Privacy Settings পুনরুদ্ধার হয়েছে।",
          "success"
        );

      } catch (error) {

        console.error(
          "AYNA BOOK — Privacy Reset Error:",
          error
        );

        showStatus(
          error.message ||
          "Settings Reset করা যায়নি।",
          "error"
        );

      } finally {

        setLoading(false);

      }

    }
  );

}


// =========================================================
// AUTHENTICATION
// =========================================================

onAuthStateChanged(
  auth,
  async function (user) {

    if (!user) {

      window.location.href =
        "./login.html";

      return;
    }

    try {

      await user.reload();

      if (!auth.currentUser) {

        window.location.href =
          "./login.html";

        return;
      }

      await initializePrivacySettings();

    } catch (error) {

      console.error(
        "AYNA BOOK — Privacy Auth Error:",
        error
      );

      showStatus(
        "Account যাচাই করা যায়নি। আবার Login করুন।",
        "error"
      );

    }

  }
);


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — Privacy Save & Reset Controller Loaded."
);
