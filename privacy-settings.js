// =========================================================
// AYNA BOOK
// Privacy Settings Controller
// Firebase SDK: 13.4.0
// Step 18
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
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// DEFAULT PRIVACY SETTINGS
// =========================================================

const DEFAULT_PRIVACY_SETTINGS = {

  profileVisibility: "private",

  emailVisibility: false,

  phoneVisibility: false,

  messagePermission: "friends",

  searchVisibility: true,

  activityVisibility: false,

  updatedAt: null

};


// =========================================================
// CURRENT USER
// =========================================================

let currentUser = null;


// =========================================================
// GET PRIVACY DOCUMENT
// =========================================================

function getPrivacyDocument(userId) {

  return doc(
    db,
    "users",
    userId,
    "settings",
    "privacy"
  );

}


// =========================================================
// LOAD PRIVACY SETTINGS
// =========================================================

export async function loadPrivacySettings() {

  try {

    if (!currentUser) {

      throw new Error(
        "প্রথমে Login করুন।"
      );

    }

    const privacyRef =
      getPrivacyDocument(
        currentUser.uid
      );

    const snapshot =
      await getDoc(
        privacyRef
      );

    if (!snapshot.exists()) {

      return {
        success: true,

        settings: {
          ...DEFAULT_PRIVACY_SETTINGS
        }
      };

    }

    return {
      success: true,

      settings: {
        ...DEFAULT_PRIVACY_SETTINGS,
        ...snapshot.data()
      }
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Privacy Load Error:",
      error
    );

    return {
      success: false,

      message:
        error.message ||
        "Privacy Settings লোড করা যায়নি।"
    };

  }

}


// =========================================================
// SAVE PRIVACY SETTINGS
// =========================================================

export async function savePrivacySettings(
  settings
) {

  try {

    if (!currentUser) {

      throw new Error(
        "আপনার Login session পাওয়া যায়নি।"
      );

    }

    if (
      !settings ||
      typeof settings !== "object"
    ) {

      throw new Error(
        "সঠিক Privacy Settings দিন।"
      );

    }


    // -----------------------------------------------------
    // Validate Values
    // -----------------------------------------------------

    const allowedVisibility = [
      "public",
      "friends",
      "private"
    ];

    const allowedMessages = [
      "everyone",
      "friends",
      "nobody"
    ];


    if (
      !allowedVisibility.includes(
        settings.profileVisibility
      )
    ) {

      throw new Error(
        "Profile Visibility সঠিক নয়।"
      );

    }


    if (
      !allowedMessages.includes(
        settings.messagePermission
      )
    ) {

      throw new Error(
        "Message Permission সঠিক নয়।"
      );

    }


    if (
      typeof settings.emailVisibility !==
      "boolean" ||

      typeof settings.phoneVisibility !==
      "boolean" ||

      typeof settings.searchVisibility !==
      "boolean" ||

      typeof settings.activityVisibility !==
      "boolean"
    ) {

      throw new Error(
        "Privacy Boolean Settings সঠিক নয়।"
      );

    }


    // -----------------------------------------------------
    // Prepare Data
    // -----------------------------------------------------

    const privacyData = {

      profileVisibility:
        settings.profileVisibility,

      emailVisibility:
        settings.emailVisibility,

      phoneVisibility:
        settings.phoneVisibility,

      messagePermission:
        settings.messagePermission,

      searchVisibility:
        settings.searchVisibility,

      activityVisibility:
        settings.activityVisibility,

      updatedAt:
        serverTimestamp()

    };


    // -----------------------------------------------------
    // Save to Firestore
    // -----------------------------------------------------

    await setDoc(

      getPrivacyDocument(
        currentUser.uid
      ),

      privacyData,

      {
        merge: true
      }

    );


    console.log(
      "AYNA BOOK — Privacy Settings Saved."
    );


    return {

      success: true,

      message:
        "Privacy Settings সফলভাবে সংরক্ষণ হয়েছে।"

    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Privacy Save Error:",
      error
    );

    return {

      success: false,

      message:
        error.message ||
        "Privacy Settings সংরক্ষণ করা যায়নি।",

      error

    };

  }

}


// =========================================================
// RESET PRIVACY SETTINGS
// =========================================================

export async function resetPrivacySettings() {

  try {

    const result =
      await savePrivacySettings({

        ...DEFAULT_PRIVACY_SETTINGS

      });

    return result;

  } catch (error) {

    return {

      success: false,

      message:
        error.message

    };

  }

}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
  auth,
  function (user) {

    currentUser =
      user || null;

    if (user) {

      console.log(
        "AYNA BOOK — Privacy Settings User Ready:",
        user.uid
      );

    } else {

      console.log(
        "AYNA BOOK — Privacy Settings User Signed Out."
      );

    }

  }
);


// =========================================================
// SYSTEM READY
// =========================================================

console.log(
  "AYNA BOOK — Privacy Settings Controller Loaded."
);