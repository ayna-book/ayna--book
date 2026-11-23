 // =========================================================
// AYNA BOOK
// LOGIN CONTROLLER
// File: login.js
// =========================================================

import {
  loginUser
} from "./auth.js";


// =========================================================
// DOM ELEMENTS
// =========================================================

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginButton =
  document.getElementById("loginButton");

const messageBox =
  document.getElementById("message");


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(
  text,
  type = "error"
) {

  if (!messageBox) {
    return;
  }

  messageBox.textContent = text;

  messageBox.className =
    "message " + type;

}


// =========================================================
// LOGIN FORM
// =========================================================

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;


      // ---------------------------------------
      // VALIDATION
      // ---------------------------------------

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
          "Please enter your password.",
          "error"
        );

        passwordInput.focus();

        return;
      }


      // ---------------------------------------
      // LOADING
      // ---------------------------------------

      loginButton.disabled = true;

      loginButton.textContent =
        "Signing In...";


      try {

        const result =
          await loginUser(
            email,
            password
          );


        // -------------------------------------
        // LOGIN FAILED
        // -------------------------------------

        if (!result.success) {


          // Email verification required

          if (
            result.verificationRequired
          ) {

            sessionStorage.setItem(
              "verificationEmail",
              email
            );


            showMessage(
              "Please verify your email address first.",
              "error"
            );


            setTimeout(
              function () {

                window.location.replace(
                  "verify-email.html"
                );

              },
              1000
            );


            return;
          }


          // Normal login error

          showMessage(
            result.message ||
            "Login failed. Please try again.",
            "error"
          );


          return;
        }


        // -------------------------------------
        // LOGIN SUCCESS
        // -------------------------------------

        showMessage(
          "Login successful. Opening AYNA BOOK...",
          "success"
        );


        setTimeout(
          function () {

            window.location.replace(
              "home.html"
            );

          },
          500
        );


      } catch (error) {

        console.error(
          "AYNA BOOK Login Error:",
          error
        );


        showMessage(
          "An unexpected error occurred. Please try again.",
          "error"
        );


      } finally {

        loginButton.disabled = false;

        loginButton.textContent =
          "Sign In";

      }

    }
  );

}