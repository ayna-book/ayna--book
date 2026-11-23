// =========================================================
// AYNA BOOK
// USER PROFILE CONTROLLER
// File: profile.js
// =========================================================

import {
  getCurrentUser,
  logoutUser
} from "./auth.js";

import {
  getUserProfile,
  saveUserProfile
} from "./database.js";


// =========================================================
// ELEMENTS
// =========================================================

const loadingBox = document.getElementById("loadingBox");
const profileContent = document.getElementById("profileContent");

const profileForm = document.getElementById("profileForm");

const displayNameInput =
  document.getElementById("displayName");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const birthDateInput =
  document.getElementById("birthDate");

const bioInput =
  document.getElementById("bio");

const saveButton =
  document.getElementById("saveButton");

const messageBox =
  document.getElementById("message");

const profileImage =
  document.getElementById("profileImage");

const avatarInitial =
  document.getElementById("avatarInitial");

const emailStatus =
  document.getElementById("emailStatus");

const backButton =
  document.getElementById("backButton");


// =========================================================
// MESSAGE
// =========================================================

function showMessage(text, type = "error") {

  if (!messageBox) {
    return;
  }

  messageBox.textContent = text;

  messageBox.className =
    "message show " + type;

}


// =========================================================
// GET INITIAL
// =========================================================

function getInitial(name, email) {

  const value =
    (name || email || "A").trim();

  if (!value) {
    return "A";
  }

  return value
    .charAt(0)
    .toUpperCase();

}


// =========================================================
// DISPLAY AVATAR
// =========================================================

function updateAvatar(name, photoURL) {

  const initial =
    getInitial(
      name,
      emailInput ? emailInput.value : ""
    );


  if (avatarInitial) {

    avatarInitial.textContent =
      initial;

  }


  if (
    profileImage &&
    photoURL
  ) {

    profileImage.src = photoURL;

    profileImage.style.display =
      "block";

    if (avatarInitial) {

      avatarInitial.style.display =
        "none";

    }

  } else {

    if (profileImage) {

      profileImage.src = "";

      profileImage.style.display =
        "none";

    }

    if (avatarInitial) {

      avatarInitial.style.display =
        "block";

    }

  }

}


// =========================================================
// LOAD PROFILE
// =========================================================

async function loadProfile() {

  try {

    const user =
      getCurrentUser();


    // -----------------------------------------------------
    // NO USER
    // -----------------------------------------------------

    if (!user) {

      window.location.replace(
        "login.html"
      );

      return;

    }


    // -----------------------------------------------------
    // EMAIL VERIFICATION
    // -----------------------------------------------------

    if (!user.emailVerified) {

      window.location.replace(
        "verify-email.html"
      );

      return;

    }


    // -----------------------------------------------------
    // BASIC AUTH DATA
    // -----------------------------------------------------

    if (emailInput) {

      emailInput.value =
        user.email || "";

    }


    if (emailStatus) {

      if (user.emailVerified) {

        emailStatus.textContent =
          "✓ Email verified";

        emailStatus.className =
          "email-status verified";

      } else {

        emailStatus.textContent =
          "Email not verified";

        emailStatus.className =
          "email-status";

      }

    }


    // -----------------------------------------------------
    // DATABASE PROFILE
    // -----------------------------------------------------

    const result =
      await getUserProfile(user.uid);


    if (
      result &&
      result.success &&
      result.data
    ) {

      const profile =
        result.data;


      if (displayNameInput) {

        displayNameInput.value =
          profile.displayName ||
          user.displayName ||
          "";

      }


      if (phoneInput) {

        phoneInput.value =
          profile.phone || "";

      }


      if (birthDateInput) {

        birthDateInput.value =
          profile.birthDate || "";

      }


      if (bioInput) {

        bioInput.value =
          profile.bio || "";

      }


      updateAvatar(
        profile.displayName ||
        user.displayName ||
        user.email,
        profile.photoURL || ""
      );


    } else {

      // ---------------------------------------------------
      // NEW PROFILE
      // ---------------------------------------------------

      if (displayNameInput) {

        displayNameInput.value =
          user.displayName || "";

      }

      if (phoneInput) {

        phoneInput.value = "";

      }

      if (birthDateInput) {

        birthDateInput.value = "";

      }

      if (bioInput) {

        bioInput.value = "";

      }

      updateAvatar(
        user.displayName ||
        user.email,
        user.photoURL || ""
      );

    }


    // -----------------------------------------------------
    // SHOW PAGE
    // -----------------------------------------------------

    if (loadingBox) {

      loadingBox.style.display =
        "none";

    }

    if (profileContent) {

      profileContent.style.display =
        "block";

    }


  } catch (error) {

    console.error(
      "AYNA BOOK Profile Load Error:",
      error
    );


    if (loadingBox) {

      loadingBox.style.display =
        "none";

    }

    if (profileContent) {

      profileContent.style.display =
        "block";

    }

    showMessage(
      "Unable to load your profile. Please try again.",
      "error"
    );

  }

}


// =========================================================
// SAVE PROFILE
// =========================================================

if (profileForm) {

  profileForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const user =
        getCurrentUser();


      // ---------------------------------------------------
      // AUTH CHECK
      // ---------------------------------------------------

      if (!user) {

        window.location.replace(
          "login.html"
        );

        return;

      }


      // ---------------------------------------------------
      // VALUES
      // ---------------------------------------------------

      const displayName =
        displayNameInput
          ? displayNameInput.value.trim()
          : "";

      const phone =
        phoneInput
          ? phoneInput.value.trim()
          : "";

      const birthDate =
        birthDateInput
          ? birthDateInput.value
          : "";

      const bio =
        bioInput
          ? bioInput.value.trim()
          : "";


      // ---------------------------------------------------
      // VALIDATION
      // ---------------------------------------------------

      if (!displayName) {

        showMessage(
          "Please enter your name.",
          "error"
        );

        if (displayNameInput) {
          displayNameInput.focus();
        }

        return;

      }


      if (displayName.length < 2) {

        showMessage(
          "Name must contain at least 2 characters.",
          "error"
        );

        if (displayNameInput) {
          displayNameInput.focus();
        }

        return;

      }


      if (displayName.length > 100) {

        showMessage(
          "Name is too long.",
          "error"
        );

        if (displayNameInput) {
          displayNameInput.focus();
        }

        return;

      }


      if (bio.length > 500) {

        showMessage(
          "Bio cannot exceed 500 characters.",
          "error"
        );

        if (bioInput) {
          bioInput.focus();
        }

        return;

      }


      // ---------------------------------------------------
      // BUTTON STATE
      // ---------------------------------------------------

      saveButton.disabled = true;

      saveButton.textContent =
        "Saving...";


      try {

        // -------------------------------------------------
        // SAVE TO DATABASE
        // -------------------------------------------------

        const result =
          await saveUserProfile(
            user.uid,
            {
              displayName,
              email: user.email || "",
              phone,
              birthDate,
              bio,
              photoURL:
                user.photoURL || ""
            }
          );


        if (!result.success) {

          showMessage(
            result.message ||
            "Unable to save profile.",
            "error"
          );

          return;

        }


        // -------------------------------------------------
        // UPDATE AVATAR
        // -------------------------------------------------

        updateAvatar(
          displayName,
          user.photoURL || ""
        );


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        showMessage(
          "Profile saved successfully.",
          "success"
        );


      } catch (error) {

        console.error(
          "AYNA BOOK Profile Save Error:",
          error
        );


        showMessage(
          "Unable to save your profile. Please try again.",
          "error"
        );

      } finally {

        saveButton.disabled = false;

        saveButton.textContent =
          "Save Profile";

      }

    }
  );

}


// =========================================================
// BACK BUTTON
// =========================================================

if (backButton) {

  backButton.addEventListener(
    "click",
    function () {

      window.location.replace(
        "home.html"
      );

    }
  );

}


// =========================================================
// START
// =========================================================

loadProfile();