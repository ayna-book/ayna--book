// ============================================================
// AYNA BOOK ★
// LOGIN SYSTEM
// File: login.js
// Firebase SDK: 13.4.0
// ============================================================

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reload
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  auth,
  authReady
} from "./firebase-init.js";


// ============================================================
// DOM
// ============================================================

const $ = (id) => document.getElementById(id);

const loginForm = $("loginForm");
const loginEmail = $("loginEmail");
const loginPassword = $("loginPassword");
const loginButton = $("loginButton");
const loginMessage = $("loginMessage");

const resetEmail = $("resetEmail");
const resetPasswordButton = $("resetPasswordButton");
const resetMessage = $("resetMessage");


// ============================================================
// MESSAGE
// ============================================================

function showMessage(element, message, type = "info") {

  if (!element) return;

  element.textContent = message;

  element.className = "message show " + type;
}


// ============================================================
// CLEAR MESSAGE
// ============================================================

function clearMessage(element) {

  if (!element) return;

  element.textContent = "";
  element.className = "message";
}


// ============================================================
// BUTTON LOADING
// ============================================================

function setLoginLoading(loading) {

  if (!loginButton) return;

  loginButton.disabled = loading;

  if (loading) {

    loginButton.innerHTML = `
      লগইন হচ্ছে
      <span class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;

  } else {

    loginButton.textContent = "লগইন";

  }
}


// ============================================================
// RESET BUTTON LOADING
// ============================================================

function setResetLoading(loading) {

  if (!resetPasswordButton) return;

  resetPasswordButton.disabled = loading;

  resetPasswordButton.textContent =
    loading
      ? "রিসেট লিংক পাঠানো হচ্ছে..."
      : "পাসওয়ার্ড রিসেট লিংক পাঠান";
}


// ============================================================
// EMAIL VALIDATION
// ============================================================

function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


// ============================================================
// FIREBASE ERROR → BANGLA MESSAGE
// ============================================================

function getFirebaseErrorMessage(error) {

  const code = error?.code || "";

  switch (code) {

    case "auth/invalid-email":
      return "ইমেইল ঠিকানাটি সঠিক নয়।";

    case "auth/user-not-found":
      return "এই ইমেইল দিয়ে কোনো AYNA BOOK অ্যাকাউন্ট পাওয়া যায়নি।";

    case "auth/wrong-password":
      return "পাসওয়ার্ড সঠিক নয়।";

    case "auth/invalid-credential":
      return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";

    case "auth/invalid-api-key":
      return "Firebase API Key সঠিক নয়। firebase-init.js পরীক্ষা করুন।";

    case "auth/api-key-not-valid":
      return "Firebase API Key সঠিক নয়। Firebase Configuration পরীক্ষা করুন।";

    case "auth/network-request-failed":
      return "ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন।";

    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/user-disabled":
      return "এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় করা হয়েছে।";

    case "auth/operation-not-allowed":
      return "Firebase Console-এ Email/Password Authentication চালু নেই।";

    case "auth/unauthorized-domain":
      return "এই Website Domain Firebase Authentication-এ অনুমোদিত নয়।";

    case "auth/requires-recent-login":
      return "নিরাপত্তার জন্য আবার Login করুন।";

    default:
      return (
        "Login করা যায়নি। আবার চেষ্টা করুন।" +
        (code ? `\nError: ${code}` : "")
      );
  }
}


// ============================================================
// AUTH READY
// ============================================================

async function waitForFirebase() {

  try {

    if (authReady) {
      await authReady;
    }

    return true;

  } catch (error) {

    console.error(
      "Firebase Auth initialization error:",
      error
    );

    showMessage(
      loginMessage,
      "Firebase Authentication চালু করা যায়নি।\n" +
      "firebase-init.js পরীক্ষা করুন।",
      "error"
    );

    return false;
  }
}


// ============================================================
// CHECK EXISTING LOGIN
// ============================================================

async function checkExistingUser() {

  const ready = await waitForFirebase();

  if (!ready || !auth) return;

  const user = auth.currentUser;

  if (!user) return;

  try {

    await reload(user);

    const currentUser = auth.currentUser;

    if (!currentUser) return;

    /*
      যদি Gmail verification না হয়ে থাকে,
      verify-email.html-এ পাঠানো হবে।
    */

    if (!currentUser.emailVerified) {

      window.location.replace(
        "./verify-email.html"
      );

      return;
    }

    /*
      Already verified হলে profile page।
    */

    window.location.replace(
      "./profile.html"
    );

  } catch (error) {

    console.warn(
      "Existing user check failed:",
      error
    );

  }
}


// ============================================================
// LOGIN
// ============================================================

async function handleLogin(event) {

  event.preventDefault();

  clearMessage(loginMessage);

  const email =
    loginEmail?.value.trim().toLowerCase() || "";

  const password =
    loginPassword?.value || "";


  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  if (!email) {

    showMessage(
      loginMessage,
      "আপনার Gmail ঠিকানা লিখুন।",
      "error"
    );

    loginEmail?.focus();

    return;
  }


  if (!isValidEmail(email)) {

    showMessage(
      loginMessage,
      "সঠিক ইমেইল ঠিকানা লিখুন।",
      "error"
    );

    loginEmail?.focus();

    return;
  }


  if (!password) {

    showMessage(
      loginMessage,
      "আপনার লগইন পাসওয়ার্ড লিখুন।",
      "error"
    );

    loginPassword?.focus();

    return;
  }


  // ----------------------------------------------------------
  // Firebase Ready
  // ----------------------------------------------------------

  const ready = await waitForFirebase();

  if (!ready || !auth) {

    showMessage(
      loginMessage,
      "Firebase Authentication প্রস্তুত নয়।\n" +
      "কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      "error"
    );

    return;
  }


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  setLoginLoading(true);


  try {

    // --------------------------------------------------------
    // Firebase Login
    // --------------------------------------------------------

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    let user = credential.user;


    // --------------------------------------------------------
    // Refresh user information
    // --------------------------------------------------------

    try {
      await reload(user);
      user = auth.currentUser || user;
    } catch (reloadError) {
      console.warn(
        "User reload warning:",
        reloadError
      );
    }


    // --------------------------------------------------------
    // Gmail Verification
    // --------------------------------------------------------

    if (!user.emailVerified) {

      showMessage(
        loginMessage,
        "Login সফল হয়েছে।\n" +
        "আপনার Gmail এখনো Verify করা হয়নি।\n" +
        "Verification সম্পন্ন করুন।",
        "info"
      );


      setTimeout(() => {

        window.location.replace(
          "./verify-email.html"
        );

      }, 900);

      return;
    }


    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    showMessage(
      loginMessage,
      "Login সফল হয়েছে। AYNA BOOK খুলছে...",
      "success"
    );


    setTimeout(() => {

      window.location.replace(
        "./profile.html"
      );

    }, 500);


  } catch (error) {

    console.error(
      "AYNA LOGIN ERROR:",
      error
    );

    showMessage(
      loginMessage,
      getFirebaseErrorMessage(error),
      "error"
    );

  } finally {

    setLoginLoading(false);

  }
}


// ============================================================
// PASSWORD RESET
// ============================================================

async function handlePasswordReset() {

  clearMessage(resetMessage);

  const email =
    resetEmail?.value.trim().toLowerCase() || "";


  if (!email) {

    showMessage(
      resetMessage,
      "Password Reset-এর জন্য আপনার ইমেইল লিখুন।",
      "error"
    );

    resetEmail?.focus();

    return;
  }


  if (!isValidEmail(email)) {

    showMessage(
      resetMessage,
      "সঠিক ইমেইল ঠিকানা লিখুন।",
      "error"
    );

    resetEmail?.focus();

    return;
  }


  const ready = await waitForFirebase();

  if (!ready || !auth) {

    showMessage(
      resetMessage,
      "Firebase Authentication প্রস্তুত নয়।",
      "error"
    );

    return;
  }


  setResetLoading(true);


  try {

    await sendPasswordResetEmail(
      auth,
      email
    );


    showMessage(
      resetMessage,
      "Password Reset Link আপনার ইমেইলে পাঠানো হয়েছে।\n" +
      "Gmail Inbox এবং Spam/Junk folder পরীক্ষা করুন।",
      "success"
    );


  } catch (error) {

    console.error(
      "PASSWORD RESET ERROR:",
      error
    );

    showMessage(
      resetMessage,
      getFirebaseErrorMessage(error),
      "error"
    );

  } finally {

    setResetLoading(false);

  }
}


// ============================================================
// REGISTER LINK
// ============================================================

function setupRegisterLinks() {

  const links = [
    $("registerLink"),
    $("createAccountButton")
  ];

  links.forEach((link) => {

    if (!link) return;

    link.addEventListener("click", () => {

      /*
        register.html অবশ্যই GitHub repository-তে
        একই folder-এ থাকতে হবে।
      */

      console.log(
        "Opening AYNA BOOK registration..."
      );

    });

  });

}


// ============================================================
// EMAIL ENTER KEY
// ============================================================

function setupKeyboard() {

  if (resetEmail) {

    resetEmail.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {

          event.preventDefault();

          handlePasswordReset();

        }

      }
    );

  }

}


// ============================================================
// AUTH STATE OBSERVER
// ============================================================

function setupAuthObserver() {

  if (!auth) return;

  onAuthStateChanged(
    auth,
    async (user) => {

      /*
        Login page-এ user থাকলে শুধু যাচাই করছি।
        এখানে সরাসরি redirect করার আগে Firebase
        initialization সম্পূর্ণ হওয়া জরুরি।
      */

      if (!user) return;

      try {

        await reload(user);

        const currentUser =
          auth.currentUser;

        if (!currentUser) return;

        /*
          Verified user login page-এ এলে profile-এ পাঠানো হবে।
        */

        if (currentUser.emailVerified) {

          /*
            Form submit চলার সময় redirect-এর সাথে
            conflict এড়াতে সামান্য delay।
          */

          if (
            document.visibilityState === "visible" &&
            !loginButton?.disabled
          ) {

            window.location.replace(
              "./profile.html"
            );

          }

        }

      } catch (error) {

        console.warn(
          "Auth observer warning:",
          error
        );

      }

    }
  );

}


// ============================================================
// START
// ============================================================

async function startLoginPage() {

  console.log(
    "AYNA BOOK Login System starting..."
  );


  // Firebase initialization অপেক্ষা

  await waitForFirebase();


  // Existing session check

  await checkExistingUser();


  // Login form

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      handleLogin
    );

  }


  // Password reset

  if (resetPasswordButton) {

    resetPasswordButton.addEventListener(
      "click",
      handlePasswordReset
    );

  }


  // Register links

  setupRegisterLinks();


  // Keyboard

  setupKeyboard();


  // Auth observer

  setupAuthObserver();


  console.log(
    "AYNA BOOK Login System ready."
  );

}


// ============================================================
// RUN
// ============================================================

startLoginPage();