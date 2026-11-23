// =========================================================
// AYNA BOOK
// FIREBASE REALTIME DATABASE CONTROLLER
// File: database.js
// =========================================================

import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  app,
  auth
} from "./app.js";


// =========================================================
// FIREBASE REALTIME DATABASE
// =========================================================

const database = getDatabase(app);


// =========================================================
// GET CURRENT USER
// =========================================================

function getAuthenticatedUser() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("USER_NOT_AUTHENTICATED");
  }

  return user;
}


// =========================================================
// GET USER PROFILE
// =========================================================

export async function getUserProfile(uid = null) {

  try {

    const user = getAuthenticatedUser();

    const userId = uid || user.uid;


    // Security: user can only access own profile
    if (userId !== user.uid) {

      return {
        success: false,
        message: "Unauthorized profile access."
      };

    }


    const userRef =
      ref(database, `users/${userId}`);

    const snapshot =
      await get(userRef);


    if (!snapshot.exists()) {

      return {
        success: true,
        exists: false,
        data: null
      };

    }


    return {
      success: true,
      exists: true,
      data: snapshot.val()
    };


  } catch (error) {

    console.error(
      "AYNA BOOK Get User Profile Error:",
      error
    );


    return {
      success: false,
      code: error.code || "",
      message:
        getDatabaseErrorMessage(error)
    };

  }

}


// =========================================================
// SAVE USER PROFILE
// =========================================================

export async function saveUserProfile(
  uid,
  profileData = {}
) {

  try {

    const user =
      getAuthenticatedUser();


    // -----------------------------------------------------
    // SECURITY CHECK
    // -----------------------------------------------------

    if (uid !== user.uid) {

      return {
        success: false,
        message: "Unauthorized profile update."
      };

    }


    // -----------------------------------------------------
    // CLEAN DATA
    // -----------------------------------------------------

    const displayName =
      String(
        profileData.displayName || ""
      ).trim();

    const email =
      String(
        profileData.email ||
        user.email ||
        ""
      ).trim();

    const phone =
      String(
        profileData.phone || ""
      ).trim();

    const birthDate =
      String(
        profileData.birthDate || ""
      ).trim();

    const bio =
      String(
        profileData.bio || ""
      ).trim();

    const photoURL =
      String(
        profileData.photoURL || ""
      ).trim();


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!displayName) {

      return {
        success: false,
        message: "Name is required."
      };

    }


    if (displayName.length > 100) {

      return {
        success: false,
        message:
          "Name cannot exceed 100 characters."
      };

    }


    if (phone.length > 30) {

      return {
        success: false,
        message:
          "Phone number is too long."
      };

    }


    if (bio.length > 500) {

      return {
        success: false,
        message:
          "Bio cannot exceed 500 characters."
      };

    }


    // -----------------------------------------------------
    // USER REFERENCE
    // -----------------------------------------------------

    const userRef =
      ref(database, `users/${uid}`);


    // -----------------------------------------------------
    // CHECK EXISTING DATA
    // -----------------------------------------------------

    const snapshot =
      await get(userRef);


    const existingData =
      snapshot.exists()
        ? snapshot.val()
        : {};


    // -----------------------------------------------------
    // PROFILE DATA
    // -----------------------------------------------------

    const profile = {

      uid,

      displayName,

      email,

      phone,

      birthDate,

      bio,

      photoURL,

      createdAt:
        existingData.createdAt ||
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    };


    // -----------------------------------------------------
    // SAVE
    // -----------------------------------------------------

    await set(
      userRef,
      profile
    );


    return {
      success: true,
      data: profile,
      message:
        "Profile saved successfully."
    };


  } catch (error) {

    console.error(
      "AYNA BOOK Save User Profile Error:",
      error
    );


    return {
      success: false,
      code: error.code || "",
      message:
        getDatabaseErrorMessage(error)
    };

  }

}


// =========================================================
// UPDATE USER PROFILE
// =========================================================

export async function updateUserProfile(
  uid,
  updates = {}
) {

  try {

    const user =
      getAuthenticatedUser();


    // -----------------------------------------------------
    // SECURITY CHECK
    // -----------------------------------------------------

    if (uid !== user.uid) {

      return {
        success: false,
        message:
          "Unauthorized profile update."
      };

    }


    // -----------------------------------------------------
    // ALLOWED FIELDS ONLY
    // -----------------------------------------------------

    const allowedFields = [
      "displayName",
      "phone",
      "birthDate",
      "bio",
      "photoURL"
    ];


    const cleanUpdates = {};


    for (
      const field of allowedFields
    ) {

      if (
        Object.prototype.hasOwnProperty.call(
          updates,
          field
        )
      ) {

        cleanUpdates[field] =
          String(
            updates[field] ?? ""
          ).trim();

      }

    }


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      cleanUpdates.displayName &&
      cleanUpdates.displayName.length > 100
    ) {

      return {
        success: false,
        message:
          "Name cannot exceed 100 characters."
      };

    }


    if (
      cleanUpdates.phone &&
      cleanUpdates.phone.length > 30
    ) {

      return {
        success: false,
        message:
          "Phone number is too long."
      };

    }


    if (
      cleanUpdates.bio &&
      cleanUpdates.bio.length > 500
    ) {

      return {
        success: false,
        message:
          "Bio cannot exceed 500 characters."
      };

    }


    // -----------------------------------------------------
    // UPDATED TIME
    // -----------------------------------------------------

    cleanUpdates.updatedAt =
      serverTimestamp();


    // -----------------------------------------------------
    // UPDATE DATABASE
    // -----------------------------------------------------

    const userRef =
      ref(database, `users/${uid}`);


    await update(
      userRef,
      cleanUpdates
    );


    return {
      success: true,
      message:
        "Profile updated successfully."
    };


  } catch (error) {

    console.error(
      "AYNA BOOK Update User Profile Error:",
      error
    );


    return {
      success: false,
      code: error.code || "",
      message:
        getDatabaseErrorMessage(error)
    };

  }

}


// =========================================================
// DELETE USER PROFILE DATA
// =========================================================

export async function deleteUserProfile(
  uid
) {

  try {

    const user =
      getAuthenticatedUser();


    if (uid !== user.uid) {

      return {
        success: false,
        message:
          "Unauthorized profile deletion."
      };

    }


    const userRef =
      ref(database, `users/${uid}`);


    await remove(userRef);


    return {
      success: true,
      message:
        "Profile data deleted successfully."
    };


  } catch (error) {

    console.error(
      "AYNA BOOK Delete User Profile Error:",
      error
    );


    return {
      success: false,
      code: error.code || "",
      message:
        getDatabaseErrorMessage(error)
    };

  }

}


// =========================================================
// DATABASE ERROR MESSAGES
// =========================================================

function getDatabaseErrorMessage(error) {

  const code =
    error?.code || "";


  switch (code) {

    case "PERMISSION_DENIED":

    case "PERMISSION_DENIED: Permission denied":

      return (
        "Database permission denied. " +
        "Please check your Realtime Database Security Rules."
      );


    case "NETWORK_ERROR":

      return (
        "Network error. " +
        "Please check your internet connection."
      );


    case "NETWORK_REQUEST_FAILED":

      return (
        "Network error. " +
        "Please check your internet connection."
      );


    default:

      return (
        error?.message ||
        "Database operation failed. Please try again."
      );

  }

}


// =========================================================
// EXPORT
// =========================================================

export {
  database
};