// =========================================================
// AYNA BOOK
// Login Application
// Firebase SDK: 13.4.0
// =========================================================

import {
  loginUser,
  watchAuthState
} from "./auth.js";


// ---------------------------------------------------------
// Elements
// ---------------------------------------------------------

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const message = document.getElementById("message");


// ---------------------------------------------------------
// Message
// ---------------------------------------------------------

function showMessage(text, type = "error") {

  if (!message) {
    console.log(text);
    return;
  }

  message.textContent = text;
  message.className = "message " + type;

}


// ---------------------------------------------------------
// Already Logged In
// ---------------------------------------------------------

watchAuthState((user) => {

  if (user) {

    console.log(
      "AYNA BOOK: Already logged in:",
      user.uid
    );

    window.location.replace("index.html");

  }

});


// ---------------------------------------------------------
// Login
// ---------------------------------------------------------

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const email =
        emailInput
          ? emailInput.value.trim()
          : "";

      const password =
        passwordInput
          ? passwordInput.value
          : "";


      // ---------------------------------------------------
      // Validation
      // ---------------------------------------------------

      if (!email) {

        showMessage(
          "আপনার ইমেইল লিখুন।",
          "error"
        );

        if (emailInput) {
          emailInput.focus();
        }

        return;
      }


      if (!password) {

        showMessage(
          "আপনার পাসওয়ার্ড লিখুন।",
          "error"
        );

        if (passwordInput) {
          passwordInput.focus();
        }

        return;
      }


      // ---------------------------------------------------
      // Loading
      // ---------------------------------------------------

      if (loginBtn) {

        loginBtn.disabled = true;
        loginBtn.textContent = "লগইন হচ্ছে...";

      }

      showMessage(
        "অ্যাকাউন্ট যাচাই করা হচ্ছে...",
        "success"
      );


      // ---------------------------------------------------
      // Firebase Login
      // ---------------------------------------------------

      try {

        const result =
          await loginUser(
            email,
            password
          );


        if (result && result.success) {

          showMessage(
            result.message ||
            "লগইন সফল হয়েছে।",
            "success"
          );

          console.log(
            "AYNA BOOK: Login successful."
          );


          // Dashboard
          setTimeout(() => {

            window.location.replace(
              "index.html"
            );

          }, 500);


        } else {

          showMessage(
            result?.message ||
            "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
            "error"
          );

          if (loginBtn) {

            loginBtn.disabled = false;
            loginBtn.textContent =
              "লগইন করুন";

          }

        }

      } catch (error) {

        console.error(
          "AYNA BOOK Login Error:",
          error
        );

        showMessage(
          "লগইন করার সময় একটি সমস্যা হয়েছে।",
          "error"
        );

        if (loginBtn) {

          loginBtn.disabled = false;
          loginBtn.textContent =
            "লগইন করুন";

        }

      }

    }
  );

}


// ---------------------------------------------------------
// Sign Up Button
// ---------------------------------------------------------

if (signupBtn) {

  signupBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "signup.html";

    }
  );

}


// ---------------------------------------------------------
// AYNA BOOK Login JS Ready
// ---------------------------------------------------------

console.log(
  "AYNA BOOK — login.js loaded successfully."
);