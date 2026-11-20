// =========================================================
// AYNA BOOK
// Login Controller
// Firebase SDK: 13.4.0
// Free Plan + Gmail Verification
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

        passwordInput.type =
          "text";

        togglePassword.textContent =
          "🙈";

        togglePassword.setAttribute(
          "aria-label",
          "Hide password"
        );

      } else {

        passwordInput.type =
          "password";

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
      // EMAIL VERIFICATION CHECK
      // ---------------------------------------------------

      if (
        result.emailVerified !== true
      ) {

        showMessage(
          "আপনার Gmail এখনো Verify করা হয়নি। Gmail Inbox/Spam Folder থেকে Verification Link-এ ক্লিক করুন।"
        );

        return;
      }


      // ---------------------------------------------------
      // LOGIN SUCCESS
      // ---------------------------------------------------

      showMessage(
        "Login সফল হয়েছে। Dashboard-এ নেওয়া হচ্ছে..."
      );


      // ---------------------------------------------------
      // DASHBOARD REDIRECT
      // ---------------------------------------------------

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
  async (user) => {

    // -----------------------------------------------------
    // NO USER
    // -----------------------------------------------------

    if (!user) {
      return;
    }


    // -----------------------------------------------------
    // RELOAD FIREBASE USER
    // -----------------------------------------------------

    try {

      await user.reload();

    } catch (error) {

      console.error(
        "AYNA BOOK — User reload error:",
        error
      );

      return;
    }


    const currentUser =
      user;


    // -----------------------------------------------------
    // EMAIL NOT VERIFIED
    // -----------------------------------------------------

    if (
      !currentUser.emailVerified
    ) {

      return;
    }


    // -----------------------------------------------------
    // VERIFIED USER → DASHBOARD
    // -----------------------------------------------------

    if (
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

console.log(
  "AYNA BOOK — Gmail Verification Login mode active."
);