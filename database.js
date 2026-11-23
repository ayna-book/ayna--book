
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import { app, auth } from "./app.js";

const db = getDatabase(app);

// Save user profile
export async function saveUserProfile(profile) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (profile.uid !== user.uid) {
    throw new Error("User ID does not match.");
  }

  if (profile.email !== user.email) {
    throw new Error("Email does not match.");
  }

  const userData = {
    uid: user.uid,
    aynaId: "AYNA-" + user.uid,
    fullName: profile.fullName,
    email: user.email,
    country: profile.country,
    createdAt: profile.createdAt || Date.now()
  };

  // Optional fields allowed by the current RTDB rules
  if (profile.phone) userData.phone = profile.phone;
  if (profile.photoURL) userData.photoURL = profile.photoURL;
  if (profile.privacy) userData.privacy = profile.privacy;
  if (profile.bio) userData.bio = profile.bio;
  if (profile.plan) userData.plan = profile.plan;

  await set(ref(db, "users/" + user.uid), userData);

  return userData;
}

// Get user profile
export async function getUserProfile(uid) {
  if (!uid) {
    throw new Error("User ID is required.");
  }

  const snapshot = await get(ref(db, "users/" + uid));

  if (snapshot.exists()) {
    return snapshot.val();
  }

  return null;
}

// Update user profile
export async function updateUserProfile(uid, updates) {
  const user = auth.currentUser;

  if (!user || user.uid !== uid) {
    throw new Error("Permission denied.");
  }

  const allowedFields = [
    "fullName",
    "country",
    "phone",
    "photoURL",
    "privacy",
    "bio",
    "plan"
  ];

  const cleanUpdates = {};

  for (const key of Object.keys(updates)) {
    if (!allowedFields.includes(key)) {
      throw new Error("Field not allowed: " + key);
    }

    cleanUpdates[key] = updates[key];
  }

  await update(ref(db, "users/" + uid), cleanUpdates);

  return true;
}

// Delete user profile data
export async function deleteUserProfile(uid) {
  const user = auth.currentUser;

  if (!user || user.uid !== uid) {
    throw new Error("Permission denied.");
  }

  await remove(ref(db, "users/" + uid));

  return true;
}

// Export database
export { db };
