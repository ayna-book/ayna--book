// =========================================================
// AYNA BOOK
// REGISTRATION CONTROLLER
// File: register.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  registerUser
} from "./auth.js";

import {
  saveUserProfile
} from "./database.js";

import {
  auth
} from "./app.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const registerForm = document.getElementById("registerForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const registerButton = document.getElementById("registerButton");
const messageBox = document.getElementById("message");


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(message, type = "error") {

  if (!messageBox) return;

  messageBox.style.display = "block";
  messageBox.textContent = message;

  if (type === "success") {

    messageBox.style.background = "#102b18";
    messageBox.style.color = "#75e69a";
    messageBox.style.border = "1px solid #287a42";

  } else {

    messageBox.style.background = "#351313";
    messageBox.style.color = "#ff8585";
    messageBox.style.border = "1px solid #803333";

  }
}


// =========================================================
// CLEAR MESSAGE
// =========================================================

function clearMessage() {

  if (!messageBox) return;

  messageBox.style.display = "none";
  messageBox.textContent = "";

}


// =========================================================
// VALIDATE FORM
// =========================================================

function validateRegistration(data) {

  if (!data.fullName || data.fullName.length < 2) {
    return "Please enter your full name.";
  }

  if (data.fullName.length > 100) {
    return "Full name must be within 100 characters.";
  }

  if (!data.email) {
    return "Please enter your email address.";
  }

  if (!data.country || data.country.length < 1) {
    return "Please enter your country.";
  }

  if (data.country.length > 100) {
    return "Country name is too long.";
  }

  if (data.phone.length > 30) {
    return "Phone number must be within 30 characters.";
  }

  if (data.password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (data.password !== data.confirmPassword) {
    return "Passwords do not match.";
  }

  if (!document.getElementById("terms")?.checked) {
    return "Please accept the Terms & Conditions.";
  }

  return null;
}


// =========================================================
// GENERATE AYNA ID
// =========================================================

function generateAynaId(uid) {

  return "AYNA-" + uid;

}


// =========================================================
// REGISTRATION SUBMIT
// =========================================================

registerForm?.addEventListener("submit", async (event) => {

  event.preventDefault();

  clearMessage();


  // -------------------------------------------------------
  // GET FORM DATA
  // -------------------------------------------------------

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const country = countryInput.value.trim();
  const phone = phoneInput.value.trim();

  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;


  const formData = {
    fullName,
    email,
    country,
    phone,
    password,
    confirmPassword
  };


  // -------------------------------------------------------
  // VALIDATION
  // -------------------------------------------------------

  const validationError = validateRegistration(formData);

  if (validationError) {

    showMessage(validationError);

    return;

  }


  // -------------------------------------------------------
  // BUTTON LOADING
  // -------------------------------------------------------

  registerButton.disabled = true;
  registerButton.textContent = "CREATING ACCOUNT...";


  try {

    // =====================================================
    // STEP 1: CREATE FIREBASE AUTH ACCOUNT
    // =====================================================

    const result = await registerUser(
      email,
      password
    );


    if (!result || result.success !== true || !result.user) {

      throw new Error(
        result?.message || "Account registration failed."
      );

    }


    const user = result.user;


    // =====================================================
    // STEP 2: GENERATE AYNA ID
    // =====================================================

    const aynaId = generateAynaId(user.uid);


    // =====================================================
    // STEP 3: SAVE USER PROFILE TO RTDB
    // =====================================================

    const profileData = {

      uid: user.uid,

      aynaId: aynaId,

      fullName: fullName,

      email: user.email,

      country: country,

      phone: phone,

      photoURL: "",

      privacy: "public",

      bio: "",

      plan: "free",

      createdAt: Date.now()

    };


    const databaseResult = await saveUserProfile(
      user.uid,
      profileData
    );


    if (!databaseResult || databaseResult.success !== true) {

      throw new Error(
        databaseResult?.message ||
        "Account created, but profile could not be saved."
      );

    }


    // =====================================================
    // STEP 4: EMAIL VERIFICATION
    // =====================================================

    sessionStorage.setItem(
      "verificationEmail",
      user.email
    );


    // =====================================================
    // STEP 5: SUCCESS
    // =====================================================

    showMessage(
      "Account created successfully! Redirecting...",
      "success"
    );


    setTimeout(() => {

      window.location.href = "./verify-email.html";

    }, 1200);


  } catch (error) {

    console.error(
      "AYNA BOOK Registration Error:",
      error
    );

    showMessage(
      error.message || "Registration failed. Please try again."
    );


    registerButton.disabled = false;
    registerButton.textContent = "CREATE ACCOUNT";

  }

});


// =========================================================
// CLEAR ERRORS WHEN USER TYPES
// =========================================================

[
  fullNameInput,
  emailInput,
  countryInput,
  phoneInput,
  passwordInput,
  confirmPasswordInput
].forEach((input) => {

  input?.addEventListener("input", clearMessage);

});


// =========================================================
// INITIALIZATION
// =========================================================

console.log("AYNA BOOK Registration Controller Loaded.");