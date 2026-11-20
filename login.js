// =========================================================
// AYNA BOOK
// Login Controller
// Firebase SDK: 13.4.0
// =========================================================

import {
  loginUser,
  watchAuthState,
  getAuthErrorMessage
} from "./auth.js";


// =========================================================
// ELEMENTS
// =========================================================

const form =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const togglePassword =
  document.getElementById("togglePassword");

const loginBtn =
  document.getElementById("loginBtn");

const message =
  document.getElementById("message");


// =========================================================
// ELEMENT CHECK
// =========================================================

if (
  !form ||
  !emailInput ||
  !passwordInput ||
  !loginBtn ||
  !message
) {

  console.error(
    "AYNA BOOK — Login page elements missing."
  );

  throw new Error(
    "AYNA BOOK Login page elements are missing."
  );
}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(text) {

  message.textContent =
    text || "";

}


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

if (togglePassword) {

  togglePassword.addEventListener(
    "click",
    () => {

      if (
        passwordInput.type === "password"
      ) {

        passwordInput.type = "text";

        togglePassword.textContent =
          "🙈";

        togglePassword.setAttribute(
          "aria-label",
          "Hide password"
        );

      } else {

        passwordInput.type = "password";

        togglePassword.textContent =
          "👁";

        togglePassword.setAttribute(
          "aria-label",
          "Show password"
        );

      }

    }
  );

}


// =========================================================
// LOGIN FORM
// =========================================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    // -----------------------------------------------------
    // GET VALUES
    // -----------------------------------------------------

    const email =
      emailInput.value
        .trim()
        .toLowerCase();

    const password =
      passwordInput.value;


    // -----------------------------------------------------
    // VALIDATE GMAIL
    // -----------------------------------------------------

    if (!email) {

      showMessage(
        "Gmail address দিন।"
      );

      emailInput.focus();

      return;
    }


    if (
      !/^[a-z0-9._%+-]+@gmail\.com$/.test(
        email
      )
    ) {

      showMessage(
        "সঠিক Gmail address দিন।"
      );

      emailInput.focus();

      return;
    }


    // -----------------------------------------------------
    // VALIDATE PASSWORD
    // -----------------------------------------------------

    if (!password) {

      showMessage(
        "Password দিন।"
      );

      passwordInput.focus();

      return;
    }


    if (password.length < 11) {

      showMessage(
        "Password কমপক্ষে ১১ অক্ষরের হতে হবে।"
      );

      passwordInput.focus();

      return;
    }


    // -----------------------------------------------------
    // DISABLE BUTTON
    // -----------------------------------------------------

    loginBtn.disabled =
      true;

    loginBtn.textContent =
      "LOGIN হচ্ছে...";

    showMessage("");


    // -----------------------------------------------------
    // FIREBASE LOGIN
    // -----------------------------------------------------

    try {

      const result =
        await loginUser(
          email,
          password
        );


      // ---------------------------------------------------
      // LOGIN FAILED
      // ---------------------------------------------------

      if (!result.success) {

        showMessage(
          result.message ||
          "Login ব্যর্থ হয়েছে।"
        );

        return;
      }


      // ---------------------------------------------------
      // LOGIN SUCCESS
      // ---------------------------------------------------

      showMessage(
        "Login সফল হয়েছে। Dashboard-এ নেওয়া হচ্ছে..."
      );


      // ছোট delay যাতে success message দেখা যায়
      setTimeout(
        () => {

          window.location.replace(
            "./dashboard.html"
          );

        },
        600
      );


    } catch (error) {

      console.error(
        "AYNA BOOK — Login Controller Error:",
        error
      );

      showMessage(
        getAuthErrorMessage(error)
      );

    } finally {

      loginBtn.disabled =
        false;

      loginBtn.textContent =
        "LOGIN";

    }

  }
);


// =========================================================
// AUTH STATE
// =========================================================

watchAuthState(
  (user) => {

    // Login page-এ already authenticated user
    // থাকলে Dashboard-এ পাঠানো হবে।

    if (
      user &&
      window.location.pathname.endsWith(
        "/login.html"
      )
    ) {

      window.location.replace(
        "./dashboard.html"
      );

    }

  }
);


// =========================================================
// MODULE READY
// =========================================================

console.log(
  "AYNA BOOK — Login controller loaded successfully."
);