
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
// ELEMENT VALIDATION
// =========================================================

if (
  !form ||
  !emailInput ||
  !passwordInput ||
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
// LOADING
// =========================================================

function setLoading(loading) {
  loginBtn.disabled = loading;
  loginBtn.textContent = loading
    ? "LOGIN হচ্ছে..."
    : "LOGIN";
}


// =========================================================
// REDIRECT
// =========================================================

function goToDashboard() {

  if (redirectStarted) return;

  redirectStarted = true;

  showMessage(
    "Login সফল হয়েছে। Dashboard খুলছে..."
  );

  window.location.replace("./dashboard.html");
}


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

if (togglePassword) {

  togglePassword.addEventListener("click", () => {

    const showing =
      passwordInput.type === "text";

    passwordInput.type =
      showing ? "password" : "text";

    togglePassword.textContent =
      showing ? "👁" : "🙈";

    togglePassword.setAttribute(
      "aria-label",
      showing ? "Show password" : "Hide password"
    );

  });

}


// =========================================================
// LOGIN SUBMIT
// =========================================================

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (loginInProgress || redirectStarted) return;

  const email =
    emailInput.value.trim().toLowerCase();

  const password =
    passwordInput.value;


  // -------------------------------------------------------
  // GMAIL VALIDATION
  // -------------------------------------------------------

  if (!email) {
    showMessage("Gmail Address দিন।");
    emailInput.focus();
    return;
  }

  if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(email)) {
    showMessage("সঠিক Gmail Address দিন।");
    emailInput.focus();
    return;
  }


  // -------------------------------------------------------
  // PASSWORD VALIDATION
  // -------------------------------------------------------

  if (!password) {
    showMessage("Password দিন।");
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


  // -------------------------------------------------------
  // START LOGIN
  // -------------------------------------------------------

  loginInProgress = true;
  setLoading(true);
  showMessage("Firebase Login যাচাই হচ্ছে...");


  try {

    // STEP 1: FIREBASE LOGIN

    const result =
      await loginUser(email, password);


    if (!result || !result.success) {

      showMessage(
        result?.message || "Login ব্যর্থ হয়েছে।"
      );

      return;
    }


    // STEP 2: VERIFY EMAIL

    if (result.emailVerified !== true) {

      showMessage(
        "আপনার Gmail Verify করা হয়নি। Gmail Inbox অথবা Spam Folder থেকে Verification Link-এ ক্লিক করুন।"
      );

      return;
    }


    // STEP 3: CHECK USER

    if (!result.user || !result.user.uid) {

      showMessage(
        "Firebase User পাওয়া যায়নি। আবার Login চেষ্টা করুন।"
      );

      return;
    }


    // STEP 4: LOGIN ACTIVITY
    // Activity failure must not block Login.

    showMessage(
      "Login সফল হয়েছে। Dashboard খুলছে..."
    );

    const userForActivity = result.user;

    recordLoginActivity(userForActivity)
      .then((activityResult) => {

        if (!activityResult?.success) {

          console.warn(
            "AYNA BOOK: Login Activity not recorded.",
            activityResult?.message
          );

        }

      })
      .catch((activityError) => {

        console.warn(
          "AYNA BOOK: Login Activity Error:",
          activityError
        );

      });


    // STEP 5: DASHBOARD REDIRECT

    goToDashboard();


  } catch (error) {

    console.error(
      "AYNA BOOK Login Error:",
      error
    );

    showMessage(
      getAuthErrorMessage(error) ||
      "Login ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
    );

  } finally {

    loginInProgress = false;

    // Redirect শুরু হলে Login Button আর পরিবর্তন নয়।

    if (!redirectStarted) {
      setLoading(false);
    }

  }

});


// =========================================================
// AUTH STATE LISTENER
// =========================================================

watchAuthState(async (user) => {

  if (!user) return;

  if (loginInProgress || redirectStarted) {
    return;
  }

  try {

    await user.reload();

    if (!user.emailVerified) {
      return;
    }

    if (
      window.location.pathname.endsWith("/login.html")
    ) {

      goToDashboard();

    }

  } catch (error) {

    console.error(
      "AYNA BOOK Auth State Error:",
      error
    );

  }

});


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — Login Controller Ready."
);
