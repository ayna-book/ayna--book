// =========================================================
// AYNA BOOK
// LOGIN CONTROLLER
// Firebase SDK: 13.4.0
// Gmail Verification + Login Activity
// =========================================================

import {
  loginUser,
  watchAuthState,
  getAuthErrorMessage
} from "./auth.js";

import {
  recordLoginActivity
} from "./login-activity.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");


// =========================================================
// REQUIRED ELEMENT CHECK
// =========================================================

if (
  !form ||
  !emailInput ||
  !passwordInput ||
  !togglePassword ||
  !loginBtn ||
  !message
) {
  throw new Error(
    "AYNA BOOK: Login HTML elements missing."
  );
}


// =========================================================
// STATE
// =========================================================

let loginInProgress = false;
let redirectStarted = false;


// =========================================================
// MESSAGE
// =========================================================

function showMessage(text) {
  message.textContent = text || "";
}


// =========================================================
// LOGIN BUTTON LOADING
// =========================================================

function setLoading(loading) {

  loginBtn.disabled = loading;

  loginBtn.textContent =
    loading
      ? "LOGIN হচ্ছে..."
      : "LOGIN";
}


// =========================================================
// DASHBOARD REDIRECT
// =========================================================

function goToDashboard() {

  if (redirectStarted) {
    return;
  }

  redirectStarted = true;

  showMessage(
    "Login সফল হয়েছে। Dashboard খুলছে..."
  );

  window.location.replace(
    "./dashboard.html"
  );
}


// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================

togglePassword.addEventListener(
  "click",
  () => {

    const isHidden =
      passwordInput.type === "password";


    if (isHidden) {

      passwordInput.type = "text";

      togglePassword.textContent = "Hide";

      togglePassword.setAttribute(
        "aria-label",
        "Hide password"
      );

      togglePassword.setAttribute(
        "aria-pressed",
        "true"
      );

    } else {

      passwordInput.type = "password";

      togglePassword.textContent = "Show";

      togglePassword.setAttribute(
        "aria-label",
        "Show password"
      );

      togglePassword.setAttribute(
        "aria-pressed",
        "false"
      );
    }
  }
);


// =========================================================
// LOGIN FORM
// =========================================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    // -----------------------------------------------------
    // PREVENT DOUBLE LOGIN
    // -----------------------------------------------------

    if (
      loginInProgress ||
      redirectStarted
    ) {
      return;
    }


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
    // EMAIL REQUIRED
    // -----------------------------------------------------

    if (!email) {

      showMessage(
        "Gmail Address দিন।"
      );

      emailInput.focus();

      return;
    }


    // -----------------------------------------------------
    // GMAIL VALIDATION
    // -----------------------------------------------------

    if (
      !/^[a-z0-9._%+-]+@gmail\.com$/.test(email)
    ) {

      showMessage(
        "সঠিক Gmail Address দিন।"
      );

      emailInput.focus();

      return;
    }


    // -----------------------------------------------------
    // PASSWORD REQUIRED
    // -----------------------------------------------------

    if (!password) {

      showMessage(
        "Password দিন।"
      );

      passwordInput.focus();

      return;
    }


    // -----------------------------------------------------
    // PASSWORD LENGTH
    // -----------------------------------------------------

    if (password.length < 11) {

      showMessage(
        "Password কমপক্ষে ১১ অক্ষরের হতে হবে।"
      );

      passwordInput.focus();

      return;
    }


    // -----------------------------------------------------
    // START LOGIN
    // -----------------------------------------------------

    loginInProgress = true;

    setLoading(true);

    showMessage(
      "Firebase Login যাচাই হচ্ছে..."
    );


    try {

      // ---------------------------------------------------
      // FIREBASE LOGIN
      // ---------------------------------------------------

      const result =
        await loginUser(
          email,
          password
        );


      // ---------------------------------------------------
      // LOGIN FAILED
      // ---------------------------------------------------

      if (
        !result ||
        !result.success
      ) {

        showMessage(
          result?.message ||
          "Login ব্যর্থ হয়েছে।"
        );

        return;
      }


      // ---------------------------------------------------
      // EMAIL VERIFICATION
      // ---------------------------------------------------

      if (
        result.emailVerified !== true
      ) {

        showMessage(
          "আপনার Gmail Verify করা হয়নি। Gmail Inbox অথবা Spam Folder থেকে Verification Link-এ ক্লিক করুন।"
        );

        return;
      }


      // ---------------------------------------------------
      // USER CHECK
      // ---------------------------------------------------

      if (
        !result.user ||
        !result.user.uid
      ) {

        showMessage(
          "Firebase User পাওয়া যায়নি। আবার Login চেষ্টা করুন।"
        );

        return;
      }


      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      showMessage(
        "Login সফল হয়েছে। Dashboard খুলছে..."
      );


      // ---------------------------------------------------
      // LOGIN ACTIVITY
      // ---------------------------------------------------

      const userForActivity =
        result.user;


      recordLoginActivity(
        userForActivity
      )
        .then(
          (activityResult) => {

            if (
              !activityResult?.success
            ) {

              console.warn(
                "AYNA BOOK: Login Activity not recorded.",
                activityResult?.message
              );
            }
          }
        )
        .catch(
          (activityError) => {

            console.warn(
              "AYNA BOOK: Login Activity Error:",
              activityError
            );
          }
        );


      // ---------------------------------------------------
      // GO TO DASHBOARD
      // ---------------------------------------------------

      goToDashboard();

    }


    // -----------------------------------------------------
    // ERROR
    // -----------------------------------------------------

    catch (error) {

      console.error(
        "AYNA BOOK Login Error:",
        error
      );

      showMessage(
        getAuthErrorMessage(error) ||
        "Login ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
      );

    }


    // -----------------------------------------------------
    // FINALLY
    // -----------------------------------------------------

    finally {

      loginInProgress = false;

      if (!redirectStarted) {
        setLoading(false);
      }
    }
  }
);


// =========================================================
// AUTH STATE
// =========================================================

watchAuthState(
  async (user) => {

    if (!user) {
      return;
    }


    if (
      loginInProgress ||
      redirectStarted
    ) {
      return;
    }


    try {

      // ---------------------------------------------------
      // REFRESH USER
      // ---------------------------------------------------

      await user.reload();


      // ---------------------------------------------------
      // EMAIL NOT VERIFIED
      // ---------------------------------------------------

      if (!user.emailVerified) {
        return;
      }


      // ---------------------------------------------------
      // ALREADY LOGGED IN
      // ---------------------------------------------------

      if (
        window.location.pathname
          .endsWith("/login.html")
      ) {

        goToDashboard();
      }

    }


    catch (error) {

      console.error(
        "AYNA BOOK Auth State Error:",
        error
      );
    }
  }
);


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — Login Controller Ready."
);