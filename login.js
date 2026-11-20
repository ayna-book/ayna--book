
// =========================================================
// AYNA BOOK
// Login Controller
// Firebase SDK: 13.4.0
// Free Plan + Gmail Verification
// Login Activity Integrated
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
// ELEMENTS
// =========================================================

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");


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
  console.error("AYNA BOOK — Login page elements missing.");
  throw new Error("AYNA BOOK Login page elements are missing.");
}


// =========================================================
// STATE
// =========================================================

let loginInProgress = false;


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(text) {
  message.textContent = text || "";
}


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

if (togglePassword) {
  togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.textContent = "🙈";
      togglePassword.setAttribute("aria-label", "Hide password");
    } else {
      passwordInput.type = "password";
      togglePassword.textContent = "👁";
      togglePassword.setAttribute("aria-label", "Show password");
    }

  });
}


// =========================================================
// LOGIN FORM
// =========================================================

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;


  // -------------------------------------------------------
  // VALIDATE GMAIL
  // -------------------------------------------------------

  if (!email) {
    showMessage("Gmail address দিন।");
    emailInput.focus();
    return;
  }

  if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(email)) {
    showMessage("সঠিক Gmail address দিন।");
    emailInput.focus();
    return;
  }


  // -------------------------------------------------------
  // VALIDATE PASSWORD
  // -------------------------------------------------------

  if (!password) {
    showMessage("Password দিন।");
    passwordInput.focus();
    return;
  }

  if (password.length < 11) {
    showMessage("Password কমপক্ষে ১১ অক্ষরের হতে হবে।");
    passwordInput.focus();
    return;
  }


  // -------------------------------------------------------
  // START LOGIN
  // -------------------------------------------------------

  loginInProgress = true;
  loginBtn.disabled = true;
  loginBtn.textContent = "LOGIN হচ্ছে...";
  showMessage("");


  try {

    // -----------------------------------------------------
    // FIREBASE LOGIN
    // -----------------------------------------------------

    const result = await loginUser(email, password);


    // -----------------------------------------------------
    // LOGIN FAILED
    // -----------------------------------------------------

    if (!result.success) {
      showMessage(result.message || "Login ব্যর্থ হয়েছে।");
      return;
    }


    // -----------------------------------------------------
    // EMAIL VERIFICATION CHECK
    // -----------------------------------------------------

    if (result.emailVerified !== true) {
      showMessage(
        "আপনার Gmail এখনো Verify করা হয়নি। Gmail Inbox/Spam Folder থেকে Verification Link-এ ক্লিক করুন।"
      );
      return;
    }


    // -----------------------------------------------------
    // RECORD LOGIN ACTIVITY
    // -----------------------------------------------------

    if (result.user) {

      const activityResult =
        await recordLoginActivity(result.user);

      if (!activityResult.success) {
        console.warn(
          "AYNA BOOK — Login Activity was not recorded:",
          activityResult.message
        );
      }

    } else {

      console.warn(
        "AYNA BOOK — Login succeeded but user data was unavailable for activity recording."
      );

    }


    // -----------------------------------------------------
    // LOGIN SUCCESS
    // -----------------------------------------------------

    showMessage(
      "Login সফল হয়েছে। Dashboard-এ নেওয়া হচ্ছে..."
    );


    // -----------------------------------------------------
    // DASHBOARD REDIRECT
    // -----------------------------------------------------

    window.location.replace("./dashboard.html");


  } catch (error) {

    console.error(
      "AYNA BOOK — Login Controller Error:",
      error
    );

    showMessage(getAuthErrorMessage(error));

  } finally {

    loginInProgress = false;

    loginBtn.disabled = false;
    loginBtn.textContent = "LOGIN";

  }

});


// =========================================================
// AUTH STATE
// =========================================================

watchAuthState(async (user) => {

  if (!user) {
    return;
  }


  // -------------------------------------------------------
  // DO NOT REDIRECT DURING LOGIN
  // Activity must be recorded first.
  // -------------------------------------------------------

  if (loginInProgress) {
    return;
  }


  try {

    await user.reload();

    if (!user.emailVerified) {
      return;
    }


    // -----------------------------------------------------
    // EXISTING VERIFIED SESSION
    // -----------------------------------------------------

    if (
      window.location.pathname.endsWith("/login.html")
    ) {

      window.location.replace("./dashboard.html");

    }

  } catch (error) {

    console.error(
      "AYNA BOOK — User reload error:",
      error
    );

  }

});


// =========================================================
// MODULE READY
// =========================================================

console.log(
  "AYNA BOOK — Login controller loaded successfully."
);

console.log(
  "AYNA BOOK — Gmail Verification Login mode active."
);

console.log(
  "AYNA BOOK — Login Activity integration enabled."
);
