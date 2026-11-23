// =========================================================
// AYNA BOOK
// REGISTRATION CONTROLLER
// File: register.js
// =========================================================

import { registerUser } from "./auth.js";


// =========================================================
// ELEMENTS
// =========================================================

const registerForm = document.getElementById("registerForm");

const displayNameInput =
  document.getElementById("displayName");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const registerButton =
  document.getElementById("registerButton");

const messageBox =
  document.getElementById("message");


// =========================================================
// MESSAGE FUNCTION
// =========================================================

function showMessage(text, type = "error") {

  if (!messageBox) return;

  messageBox.textContent = text;

  messageBox.className =
    "message show " + type;
}


// =========================================================
// FORM SUBMIT
// =========================================================

if (registerForm) {

  registerForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      // ---------------------------------------------------
      // GET VALUES
      // ---------------------------------------------------

      const displayName =
        displayNameInput.value.trim();

      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;

      const confirmPassword =
        confirmPasswordInput.value;


      // ---------------------------------------------------
      // VALIDATION
      // ---------------------------------------------------

      if (!email) {

        showMessage(
          "Please enter your email address.",
          "error"
        );

        emailInput.focus();

        return;
      }


      if (!password) {

        showMessage(
          "Please enter a password.",
          "error"
        );

        passwordInput.focus();

        return;
      }


      if (password.length < 6) {

        showMessage(
          "Password must contain at least 6 characters.",
          "error"
        );

        passwordInput.focus();

        return;
      }


      if (!confirmPassword) {

        showMessage(
          "Please confirm your password.",
          "error"
        );

        confirmPasswordInput.focus();

        return;
      }


      if (password !== confirmPassword) {

        showMessage(
          "Passwords do not match.",
          "error"
        );

        confirmPasswordInput.focus();

        return;
      }


      // ---------------------------------------------------
      // DISABLE BUTTON
      // ---------------------------------------------------

      registerButton.disabled = true;

      registerButton.textContent =
        "Creating Account...";


      // ---------------------------------------------------
      // FIREBASE REGISTRATION
      // ---------------------------------------------------

      try {

        const result =
          await registerUser(
            email,
            password,
            displayName
          );


        // -------------------------------------------------
        // REGISTRATION FAILED
        // -------------------------------------------------

        if (!result.success) {

          showMessage(
            result.message ||
            "Registration failed. Please try again.",
            "error"
          );

          return;
        }


        // -------------------------------------------------
        // REGISTRATION SUCCESS
        // -------------------------------------------------

        sessionStorage.setItem(
          "verificationEmail",
          email
        );


        showMessage(
          "Account created successfully. Please verify your email address.",
          "success"
        );


        // -------------------------------------------------
        // GO TO VERIFICATION PAGE
        // -------------------------------------------------

        setTimeout(function () {

          window.location.replace(
            "verify-email.html"
          );

        }, 1000);


      } catch (error) {

        console.error(
          "AYNA BOOK Registration Error:",
          error
        );


        showMessage(
          "An unexpected error occurred. Please try again.",
          "error"
        );


      } finally {

        registerButton.disabled = false;

        registerButton.textContent =
          "Create Account";

      }

    }
  );

}