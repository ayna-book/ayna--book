// =========================================================
// AYNA BOOK
// FORGOT PASSWORD CONTROLLER
// File: forgot-password.js
// =========================================================

import { resetPassword } from "./auth.js";


// =========================================================
// ELEMENTS
// =========================================================

const forgotPasswordForm =
  document.getElementById("forgotPasswordForm");

const emailInput =
  document.getElementById("email");

const resetButton =
  document.getElementById("resetButton");

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

if (forgotPasswordForm) {

  forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      // ---------------------------------------------------
      // GET EMAIL
      // ---------------------------------------------------

      const email =
        emailInput.value.trim();


      // ---------------------------------------------------
      // VALIDATE EMAIL
      // ---------------------------------------------------

      if (!email) {

        showMessage(
          "Please enter your email address.",
          "error"
        );

        emailInput.focus();

        return;
      }


      // ---------------------------------------------------
      // BASIC EMAIL CHECK
      // ---------------------------------------------------

      if (
        !email.includes("@") ||
        !email.includes(".")
      ) {

        showMessage(
          "Please enter a valid email address.",
          "error"
        );

        emailInput.focus();

        return;
      }


      // ---------------------------------------------------
      // DISABLE BUTTON
      // ---------------------------------------------------

      resetButton.disabled = true;

      resetButton.textContent =
        "Sending...";


      // ---------------------------------------------------
      // SEND RESET EMAIL
      // ---------------------------------------------------

      try {

        const result =
          await resetPassword(email);


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        if (result.success) {

          showMessage(
            "Password reset email sent successfully. Please check your inbox and Spam/Junk folder.",
            "success"
          );

          emailInput.value = "";

          return;
        }


        // -------------------------------------------------
        // FAILED
        // -------------------------------------------------

        showMessage(
          result.message ||
          "Unable to send password reset email. Please try again.",
          "error"
        );


      } catch (error) {

        console.error(
          "AYNA BOOK Password Reset Error:",
          error
        );


        showMessage(
          "An unexpected error occurred. Please try again.",
          "error"
        );


      } finally {

        resetButton.disabled = false;

        resetButton.textContent =
          "Send Reset Email";

      }

    }
  );

}