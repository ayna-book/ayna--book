// =========================================================
// AYNA BOOK
// FIREBASE REALTIME DATABASE CONTROLLER
// File: database.js
// RTDB Rules Compatible Version
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
// AUTHENTICATED USER
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


    // Security check
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
      message: getDatabaseErrorMessage(error)
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
    // REQUIRED DATA
    // -----------------------------------------------------

    const fullName =
      String(
        profileData.fullName ||
        profileData.displayName ||
        ""
      ).trim();


    const country =
      String(
        profileData.country || ""
      ).trim();


    const email =
      String(
        user.email || ""
      ).trim();


    const aynaId =
      "AYNA-" + user.uid;


    // -----------------------------------------------------
    // OPTIONAL DATA
    // -----------------------------------------------------

    const phone =
      String(
        profileData.phone || ""
      ).trim();


    const photoURL =
      String(
        profileData.photoURL || ""
      ).trim();


    const privacy =
      profileData.privacy === "private"
        ? "private"
        : "public";


    const bio =
      String(
        profileData.bio || ""
      ).trim();


    const plan =
      [
        "free",
        "business",
        "vip",
        "vvip"
      ].includes(profileData.plan)
        ? profileData.plan
        : "free";


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!fullName) {

      return {
        success: false,
        message: "Full name is required."
      };

    }


    if (
      fullName.length < 2 ||
      fullName.length > 100
    ) {

      return {
        success: false,
        message:
          "Full name must contain 2 to 100 characters."
      };

    }


    if (!country) {

      return {
        success: false,
        message: "Country is required."
      };

    }


    if (country.length > 100) {

      return {
        success: false,
        message:
          "Country cannot exceed 100 characters."
      };

    }


    if (phone.length > 30) {

      return {
        success: false,
        message:
          "Phone number cannot exceed 30 characters."
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
    // USER DATABASE REFERENCE
    // -----------------------------------------------------

    const userRef =
      ref(database, `users/${uid}`);


    // -----------------------------------------------------
    // CHECK EXISTING PROFILE
    // -----------------------------------------------------

    const snapshot =
      await get(userRef);


    const existingData =
      snapshot.exists()
        ? snapshot.val()
        : {};


    // -----------------------------------------------------
    // CREATED TIME
    // -----------------------------------------------------

    const createdAt =
      existingData.createdAt ||
      Date.now();


    // -----------------------------------------------------
    // PROFILE OBJECT
    // -----------------------------------------------------

    const profile = {

      uid: user.uid,

      aynaId,

      fullName,

      email,

      country,

      phone,

      photoURL,

      privacy,

      bio,

      plan,

      createdAt,

      updatedAt: Date.now()

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
      exists: true,
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
      message: getDatabaseErrorMessage(error)
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
    // GET EXISTING PROFILE
    // -----------------------------------------------------

    const userRef =
      ref(database, `users/${uid}`);


    const snapshot =
      await get(userRef);


    if (!snapshot.exists()) {

      return {
        success: false,
        message:
          "Profile does not exist yet."
      };

    }


    const existing =
      snapshot.val();


    // -----------------------------------------------------
    // ALLOWED FIELDS
    // -----------------------------------------------------

    const cleanUpdates = {};


    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "fullName"
      )
    ) {

      const fullName =
        String(
          updates.fullName || ""
        ).trim();


      if (
        fullName.length < 2 ||
        fullName.length > 100
      ) {

        return {
          success: false,
          message:
            "Full name must contain 2 to 100 characters."
        };

      }


      cleanUpdates.fullName =
        fullName;

    }


    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "country"
      )
    ) {

      const country =
        String(
          updates.country || ""
        ).trim();


      if (
        country.length < 1 ||
        country.length > 100
      ) {

        return {
          success: false,
          message:
            "Country must contain 1 to 100 characters."
        };

      }


      cleanUpdates.country =
        country;

    }


    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "phone"
      )
    ) {

      const phone =
        String(
          updates.phone || ""
        ).trim();


      if (phone.length > 30) {

        return {
          success: false,
          message:
            "Phone number cannot exceed 30 characters."
        };

      }


      cleanUpdates.phone =
        phone;

    }


    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "photoURL"
      )
    ) {

      cleanUpdates.photoURL =
        String(
          updates.photoURL || ""
        ).trim();

    }


    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "privacy"
      )
    ) {

      const privacy =
        updates.privacy === "private"
          ? "private"
          : updates.privacy === "public"
            ? "public"
            : null;


      if (!privacy) {

        return {
          success: false,
          message:
            "Invalid privacy setting."
        };

      }


      cleanUpdates.privacy =
        privacy;

    }


    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "bio"
      )
    ) {

      const bio =
        String(
          updates.bio || ""
        ).trim();


      if (bio.length > 500) {

        return {
          success: false,
          message:
            "Bio cannot exceed 500 characters."
        };

      }


      cleanUpdates.bio =
        bio;

    }


    if (
      Object.prototype.hasOwnProperty.call(
        updates,
        "plan"
      )
    ) {

      const allowedPlans = [
        "free",
        "business",
        "vip",
        "vvip"
      ];


      if (
        !allowedPlans.includes(
          updates.plan
        )
      ) {

        return {
          success: false,
          message:
            "Invalid account plan."
        };

      }


      cleanUpdates.plan =
        updates.plan;

    }


    // -----------------------------------------------------
    // NEVER ALLOW CLIENT TO CHANGE THESE
    // -----------------------------------------------------

    cleanUpdates.uid =
      existing.uid || user.uid;

    cleanUpdates.aynaId =
      existing.aynaId ||
      ("AYNA-" + user.uid);

    cleanUpdates.email =
      user.email || existing.email || "";

    cleanUpdates.createdAt =
      existing.createdAt || Date.now();

    cleanUpdates.updatedAt =
      Date.now();


    // -----------------------------------------------------
    // UPDATE
    // -----------------------------------------------------

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
      message: getDatabaseErrorMessage(error)
    };

  }

}


// =========================================================
// DELETE USER PROFILE
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
        "Profile deleted successfully."
    };


  } catch (error) {

    console.error(
      "AYNA BOOK Delete User Profile Error:",
      error
    );

    return {
      success: false,
      code: error.code || "",
      message: getDatabaseErrorMessage(error)
    };

  }

}


// =========================================================
// DATABASE ERROR HANDLER
// =========================================================

function getDatabaseErrorMessage(error) {

  const code =
    error?.code || "";


  switch (code) {

    case "PERMISSION_DENIED":

      return (
        "Database permission denied. " +
        "Please check your Realtime Database Rules."
      );


    case "NETWORK_ERROR":

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
// EXPORT DATABASE
// =========================================================

export {
  database
};