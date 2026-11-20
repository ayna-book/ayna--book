
// =========================================================
// AYNA BOOK
// Privacy Settings Controller
// Firebase SDK: 13.4.0
// Step 35
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
  activityVisibility: false
};


// =========================================================
// AUTH STATE READY
// =========================================================

let currentUser = null;
let authReadyResolve;

const authReady = new Promise((resolve) => {
  authReadyResolve = resolve;
});

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  authReadyResolve(currentUser);

  console.log(
    user
      ? "AYNA BOOK — Privacy Auth Ready."
      : "AYNA BOOK — No active Privacy Session."
  );
});


// =========================================================
// WAIT FOR AUTH
// =========================================================

async function getAuthenticatedUser() {
  const user = await authReady;

  if (!user) {
    throw new Error("প্রথমে Login করুন।");
  }

  return user;
}


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
// VALIDATE PRIVACY SETTINGS
// =========================================================

function validatePrivacySettings(settings) {

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
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings)
  ) {
    throw new Error("সঠিক Privacy Settings দিন।");
  }

  if (
    !allowedVisibility.includes(
      settings.profileVisibility
    )
  ) {
    throw new Error("Profile Visibility সঠিক নয়।");
  }

  if (
    !allowedMessages.includes(
      settings.messagePermission
    )
  ) {
    throw new Error("Message Permission সঠিক নয়।");
  }

  const booleanFields = [
    "emailVisibility",
    "phoneVisibility",
    "searchVisibility",
    "activityVisibility"
  ];

  for (const field of booleanFields) {
    if (typeof settings[field] !== "boolean") {
      throw new Error(
        `Privacy Setting ${field} সঠিক নয়।`
      );
    }
  }

}


// =========================================================
// LOAD PRIVACY SETTINGS
// =========================================================

export async function loadPrivacySettings() {

  try {

    const user = await getAuthenticatedUser();

    const privacyRef = getPrivacyDocument(user.uid);

    const snapshot = await getDoc(privacyRef);

    if (!snapshot.exists()) {
      return {
        success: true,
        settings: {
          ...DEFAULT_PRIVACY_SETTINGS
        }
      };
    }

    const savedSettings = snapshot.data();

    const settings = {
      ...DEFAULT_PRIVACY_SETTINGS,
      ...savedSettings
    };

    validatePrivacySettings(settings);

    return {
      success: true,
      settings
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

export async function savePrivacySettings(settings) {

  try {

    const user = await getAuthenticatedUser();

    validatePrivacySettings(settings);

    const privacyData = {
      profileVisibility: settings.profileVisibility,
      emailVisibility: settings.emailVisibility,
      phoneVisibility: settings.phoneVisibility,
      messagePermission: settings.messagePermission,
      searchVisibility: settings.searchVisibility,
      activityVisibility: settings.activityVisibility,
      updatedAt: serverTimestamp()
    };

    await setDoc(
      getPrivacyDocument(user.uid),
      privacyData
    );

    console.log(
      "AYNA BOOK — Privacy Settings Saved."
    );

    return {
      success: true,
      message: "Privacy Settings সফলভাবে সংরক্ষণ হয়েছে।"
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

  return await savePrivacySettings({
    ...DEFAULT_PRIVACY_SETTINGS
  });

}


// =========================================================
// GET CURRENT PRIVACY USER
// =========================================================

export async function getPrivacyUser() {
  return await getAuthenticatedUser();
}


// =========================================================
// SYSTEM READY
// =========================================================

console.log(
  "AYNA BOOK — Privacy Settings Controller Loaded."
);
