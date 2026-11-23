
/* =========================================================
   AYNA BOOK — COMPLETE REGISTER.JS
   Firebase Authentication + Storage + Realtime Database
   ========================================================= */

import {
  auth,
  database,
  storage
} from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref as dbRef,
  set
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

// ---------------------------------------------------------
// ELEMENTS
// ---------------------------------------------------------

const form =
  document.getElementById("registerForm") ||
  document.getElementById("signupForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");
const phoneInput = document.getElementById("phone");

const photoInput =
  document.getElementById("photo") ||
  document.getElementById("profilePhoto");

const passwordInput = document.getElementById("password");
const confirmPasswordInput =
  document.getElementById("confirmPassword");

const termsInput =
  document.getElementById("terms") ||
  document.getElementById("agreeTerms");

const submitButton =
  document.getElementById("submitBtn") ||
  document.getElementById("registerBtn");

const statusMessage =
  document.getElementById("statusMsg") ||
  document.getElementById("statusMessage");

// ---------------------------------------------------------
// STATUS MESSAGE
// ---------------------------------------------------------

function showMessage(message, type = "error") {

  if (!statusMessage) {
    alert(message);
    return;
  }

  statusMessage.textContent = message;

  statusMessage.style.display = "block";
  statusMessage.style.padding = "14px";
  statusMessage.style.marginTop = "15px";
  statusMessage.style.borderRadius = "10px";

  if (type === "success") {
    statusMessage.style.background = "#123d24";
    statusMessage.style.color = "#8df5a9";
  } else {
    statusMessage.style.background = "#351515";
    statusMessage.style.color = "#ff9999";
  }
}

// ---------------------------------------------------------
// LOADING BUTTON
// ---------------------------------------------------------

function setLoading(loading) {

  if (!submitButton) return;

  submitButton.disabled = loading;

  if (loading) {
    submitButton.textContent = "PLEASE WAIT...";
  } else {
    submitButton.textContent = "CREATE ACCOUNT";
  }
}

// ---------------------------------------------------------
// PASSWORD SHOW / HIDE
// ---------------------------------------------------------

function togglePassword(buttonId, inputId) {

  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);

  if (!button || !input) return;

  button.addEventListener("click", () => {

    if (input.type === "password") {
      input.type = "text";
      button.textContent = "🙈";
    } else {
      input.type = "password";
      button.textContent = "👁️";
    }

  });
}

togglePassword("togglePassword", "password");

togglePassword(
  "toggleConfirmPassword",
  "confirmPassword"
);

// ---------------------------------------------------------
// FIREBASE ERROR HANDLING
// ---------------------------------------------------------

function getFriendlyError(error) {

  switch (error.code) {

    case "auth/email-already-in-use":
      return "This email is already registered. Please login.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password must contain at least 6 characters.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "storage/unauthorized":
      return "Photo upload permission denied. Please check Storage Rules.";

    case "storage/canceled":
      return "Photo upload was cancelled.";

    case "storage/retry-limit-exceeded":
      return "Photo upload timed out. Please try again.";

    case "PERMISSION_DENIED":
      return "Database permission denied. Please check RTDB Rules.";

    default:
      return error.message || "Registration failed. Please try again.";
  }
}

// ---------------------------------------------------------
// REGISTRATION
// ---------------------------------------------------------

if (!form) {

  console.error("Registration form not found.");

  showMessage("Registration form not found. Check register.html.");

} else {

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!submitButton) {
      showMessage("Submit button not found.");
      return;
    }

    // -----------------------------------------------
    // GET FORM VALUES
    // -----------------------------------------------

    const fullName = fullNameInput?.value.trim() || "";
    const email = emailInput?.value.trim().toLowerCase() || "";
    const country = countryInput?.value.trim() || "";
    const phone = phoneInput?.value.trim() || "";

    const password = passwordInput?.value || "";
    const confirmPassword =
      confirmPasswordInput?.value || "";

    const photo = photoInput?.files?.[0];

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!fullName || !email || !country) {
      showMessage("Please complete all required fields.");
      return;
    }

    if (!photo) {
      showMessage("Please select your profile photo.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(photo.type)) {
      showMessage("Only JPG, PNG or WEBP images are allowed.");
      return;
    }

    if (photo.size > 5 * 1024 * 1024) {
      showMessage("Profile photo must be 5 MB or smaller.");
      return;
    }

    if (password.length < 6) {
      showMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.");
      return;
    }

    if (!termsInput?.checked) {
      showMessage("Please accept Terms & Conditions and Privacy Policy.");
      return;
    }

    // -----------------------------------------------
    // START REGISTRATION
    // -----------------------------------------------

    setLoading(true);

    if (statusMessage) {
      statusMessage.style.display = "none";
    }

    try {

      // ---------------------------------------------
      // 1. CREATE FIREBASE AUTH ACCOUNT
      // ---------------------------------------------

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // ---------------------------------------------
      // 2. UPDATE USER PROFILE
      // ---------------------------------------------

      await updateProfile(user, {
        displayName: fullName
      });

      // ---------------------------------------------
      // 3. UPLOAD PROFILE PHOTO
      // ---------------------------------------------

      const extension = photo.name.split(".").pop().toLowerCase();

      const photoPath =
        `profilePhotos/${user.uid}/profile.${extension}`;

      const photoReference = storageRef(
        storage,
        photoPath
      );

      await uploadBytes(photoReference, photo, {
        contentType: photo.type
      });

      const photoURL =
        await getDownloadURL(photoReference);

      // ---------------------------------------------
      // 4. SAVE USER DATA IN REALTIME DATABASE
      // ---------------------------------------------

      const userData = {

        uid: user.uid,

        fullName: fullName,

        email: email,

        country: country,

        phone: phone,

        photoURL: photoURL,

        photoPath: photoPath,

        emailVerified: user.emailVerified,

        accountStatus: "active",

        createdAt: Date.now(),

        updatedAt: Date.now()

      };

      await set(
        dbRef(database, `users/${user.uid}`),
        userData
      );

      // ---------------------------------------------
      // 5. SEND EMAIL VERIFICATION
      // ---------------------------------------------

      let verificationSent = true;

      try {

        await sendEmailVerification(user);

      } catch (verificationError) {

        verificationSent = false;

        console.error(
          "Email verification error:",
          verificationError
        );

      }

      // ---------------------------------------------
      // 6. SUCCESS MESSAGE
      // ---------------------------------------------

      if (verificationSent) {

        showMessage(
          "Account created successfully! Please check your email for verification.",
          "success"
        );

      } else {

        showMessage(
          "Account created, but verification email could not be sent. Please try again from your account.",
          "success"
        );

      }

      // ---------------------------------------------
      // 7. REDIRECT TO LOGIN
      // ---------------------------------------------

      submitButton.textContent = "ACCOUNT CREATED";

      setTimeout(() => {

        window.location.href = "./login.html";

      }, 2500);

    } catch (error) {

      console.error("AYNA BOOK Registration Error:", error);

      showMessage(getFriendlyError(error));

    } finally {

      // ---------------------------------------------
      // ALWAYS STOP LOADING
      // ---------------------------------------------

      if (
        submitButton &&
        submitButton.textContent !== "ACCOUNT CREATED"
      ) {
        setLoading(false);
      }

    }

  });

}
