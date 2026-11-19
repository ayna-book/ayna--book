/* =========================================================
   AYNA BOOK
   Login Controller
   Firebase SDK: 13.4.0
   ========================================================= */

import {
  loginUser,
  watchAuthState,
  getAuthErrorMessage
} from "./auth.js";


/* =========================================================
   ELEMENTS
   ========================================================= */

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


/* =========================================================
   SAFETY CHECK
   ========================================================= */

if (
  !form ||
  !emailInput ||
  !passwordInput ||
  !loginBtn ||
  !message
) {

  console.error(
    "AYNA BOOK — Login elements not found."
  );

  throw new Error(
    "Login page elements are missing."
  );
}


/* =========================================================
   PASSWORD SHOW / HIDE
   ========================================================= */

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


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(text) {

  message.textContent =
    text || "";

}


/* =========================================================
   LOGIN
   ========================================================= */

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const email =
      emailInput.value
        .trim()
        .toLowerCase();


    const password =
      passwordInput.value;


    /* -----------------------------------------------
       Validation
       ----------------------------------------------- */

    if (!email) {

      showMessage(
        "Gmail address দিন।"
      );

      emailInput.focus();

      return;
    }


    if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(email)) {

      showMessage(
        "সঠিক Gmail address দিন।"
      );

      emailInput.focus();

      return;
    }


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


    /* -----------------------------------------------
       Login শুরু
       ----------------------------------------------- */

    loginBtn.disabled =
      true;

    loginBtn.textContent =
      "LOGIN হচ্ছে...";

    showMessage("");


    try {

      const result =
        await loginUser(
          email,
          password
        );


      if (!result.success) {

        showMessage(
          result.message ||
          "Login ব্যর্থ হয়েছে।"
        );

        return;
      }


      showMessage(
        "Login সফল হয়েছে। Dashboard-এ নেওয়া হচ্ছে..."
      );


      /*
       * Firebase Auth session তৈরি হওয়ার পর
       * Dashboard-এ redirect।
       */

      setTimeout(() => {

        window.location.replace(
          "./dashboard.html"
        );

      }, 500);


    } catch (error) {

      console.error(
        "AYNA BOOK — Login Error:",
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


/* =========================================================
   AUTH STATE PROTECTION
   ========================================================= */

watchAuthState(
  (user) => {

    /*
     * Login page-এ আগে থেকেই valid Firebase
     * session থাকলে Dashboard-এ পাঠানো হবে।
     */

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


/* =========================================================
   PAGE READY
   ========================================================= */

console.log(
  "AYNA BOOK — Login controller loaded successfully."
);