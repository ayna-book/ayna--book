// ============================================================
// AYNA BOOK — login.js
// Robust Firebase Login + Account Lookup
// Firebase Web SDK 13.4.0
// ============================================================

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  child
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  auth,
  database
} from "./firebase-init.js";


// ============================================================
// BASIC HELPERS
// ============================================================

const $ = id => document.getElementById(id);

let lastSignal = "";


// ============================================================
// SAFE VOICE
// Voice module থাকলেও Login তার উপর নির্ভর করবে না
// ============================================================

let AynaVoiceSignal = null;

try {

  const voice =
    await import("./ayna-voice-signal.js");

  AynaVoiceSignal =
    voice.AynaVoiceSignal || null;

} catch (error) {

  console.warn(
    "AYNA Voice module unavailable:",
    error
  );

}


// ============================================================
// SAFE SPEECH
// ============================================================

function speak(text) {

  lastSignal = text;

  try {

    if (
      window.speechSynthesis &&
      typeof SpeechSynthesisUtterance !== "undefined"
    ) {

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(text);

      speech.lang = "bn-BD";
      speech.rate = 0.92;
      speech.pitch = 1;

      window.speechSynthesis.speak(speech);

    }

  } catch (error) {

    console.warn(
      "Browser speech unavailable:",
      error
    );

  }

}


// ============================================================
// SIGNAL BOX
// ============================================================

function showSignal(
  text,
  type = "normal",
  targetId = "loginSignalBox"
) {

  lastSignal = text;

  const box =
    $(targetId);

  if (box) {

    box.textContent =
      text;

    box.style.borderColor =
      type === "error"
        ? "#ff6675"
        : type === "success"
          ? "#35e08a"
          : "#38f2ff";

  }


  // Voice module থাকলে ব্যবহার করবে
  try {

    if (
      AynaVoiceSignal &&
      typeof AynaVoiceSignal.success === "function" &&
      type === "success"
    ) {

      AynaVoiceSignal.success(
        text,
        targetId
      );

      return;

    }


    if (
      AynaVoiceSignal &&
      typeof AynaVoiceSignal.error === "function" &&
      type === "error"
    ) {

      AynaVoiceSignal.error(
        text,
        targetId
      );

      return;

    }

  } catch (error) {

    console.warn(
      "AYNA Voice signal error:",
      error
    );

  }


  speak(text);

}


// ============================================================
// HEADER CLOCK
// ============================================================

$("speakClockBtn")?.addEventListener(
  "click",
  () => {

    const now =
      new Date();

    const time =
      now.toLocaleTimeString(
        "bn-BD",
        {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit"
        }
      );

    speak(
      "এখন সময় " + time
    );

  }
);


// ============================================================
// CLOCK TOGGLE
// ============================================================

let clockEnabled = true;

$("toggleClockBtn")?.addEventListener(
  "click",
  () => {

    clockEnabled =
      !clockEnabled;

    const button =
      $("toggleClockBtn");

    if (button) {

      button.textContent =
        clockEnabled
          ? "🔊 ঘড়ি: চালু"
          : "🔇 ঘড়ি: বন্ধ";

    }

    speak(
      clockEnabled
        ? "ঘড়ি চালু হয়েছে।"
        : "ঘড়ি বন্ধ হয়েছে।"
    );

  }
);


// ============================================================
// REPEAT LAST SIGNAL
// ============================================================

$("repeatSignalBtn")?.addEventListener(
  "click",
  () => {

    if (!lastSignal) {

      speak(
        "কোনো পূর্বের সিগন্যাল নেই।"
      );

      return;

    }

    speak(
      lastSignal
    );

  }
);


// ============================================================
// REGISTER BUTTON
// ============================================================

$("registerPageBtn")?.addEventListener(
  "click",
  () => {

    window.location.href =
      "register.html";

  }
);


// ============================================================
// PASSWORD SHOW / HIDE
// ============================================================

function bindPasswordToggle(
  buttonId,
  inputId,
  showText,
  hideText
) {

  const button =
    $(buttonId);

  const input =
    $(inputId);

  if (!button || !input) {

    console.warn(
      "Password toggle element missing:",
      buttonId,
      inputId
    );

    return;

  }


  button.addEventListener(
    "click",
    () => {

      const hidden =
        input.type === "password";

      input.type =
        hidden
          ? "text"
          : "password";

      button.textContent =
        hidden
          ? hideText
          : showText;

    }
  );

}


bindPasswordToggle(
  "toggleLoginPassBtn",
  "loginPassword",
  "👁️ পাসওয়ার্ড দেখাও",
  "🙈 পাসওয়ার্ড লুকাও"
);


// ============================================================
// FIREBASE AUTH STATUS
// ============================================================

if (auth) {

  onAuthStateChanged(
    auth,
    user => {

      console.log(
        "AYNA Firebase Auth State:",
        user
          ? user.email
          : "Signed out"
      );

    }
  );

} else {

  console.error(
    "AYNA BOOK: Firebase auth is null."
  );

}


// ============================================================
// ACCOUNT LOOKUP
// ============================================================

async function handleAccountLookup() {

  const input =
    $("lookupAccountInput");

  const query =
    (input?.value || "")
      .trim();


  if (!query) {

    showSignal(
      "অ্যাকাউন্ট লুকআপের ঘরে ভুল হয়েছে। AYNA ID অথবা Gmail ঠিকানা লিখুন।",
      "error"
    );

    input?.focus();

    return;

  }


  const normalizedQuery =
    query.toLowerCase();


  // ----------------------------------------------------------
  // Demo / Default AYNA ID
  // ----------------------------------------------------------

  if (
    query ===
    "2026-----10000001"
  ) {

    showSignal(
      "অ্যাকাউন্ট লুকআপ সফল হয়েছে। AYNA ID 2026-----10000001 পাওয়া গেছে।",
      "success"
    );

    return;

  }


  // ----------------------------------------------------------
  // LocalStorage account
  // ----------------------------------------------------------

  try {

    const localAccount =
      JSON.parse(
        localStorage.getItem(
          "ayna_registered_account"
        ) || "null"
      );


    if (localAccount) {

      const localId =
        String(
          localAccount.aynaId || ""
        )
          .trim()
          .toLowerCase();


      const localEmail =
        String(
          localAccount.email || ""
        )
          .trim()
          .toLowerCase();


      if (
        localId === normalizedQuery ||
        localEmail === normalizedQuery
      ) {

        showSignal(
          `অ্যাকাউন্ট পাওয়া গেছে। Gmail ${localAccount.email || "নেই"} এবং AYNA ID ${localAccount.aynaId || "নেই"}।`,
          "success"
        );

        return;

      }

    }

  } catch (error) {

    console.warn(
      "Local account lookup error:",
      error
    );

  }


  // ----------------------------------------------------------
  // Firebase RTDB
  // ----------------------------------------------------------

  if (!database) {

    showSignal(
      "Firebase Realtime Database সংযোগ পাওয়া যায়নি।",
      "error"
    );

    return;

  }


  try {

    const usersReference =
      child(
        ref(database),
        "users"
      );


    const snapshot =
      await get(
        usersReference
      );


    if (
      snapshot.exists()
    ) {

      const users =
        Object.values(
          snapshot.val() || {}
        );


      const found =
        users.find(
          user => {

            const userId =
              String(
                user?.aynaId || ""
              )
                .trim()
                .toLowerCase();


            const userEmail =
              String(
                user?.email || ""
              )
                .trim()
                .toLowerCase();


            return (
              userId === normalizedQuery ||
              userEmail === normalizedQuery
            );

          }
        );


      if (found) {

        showSignal(
          `অ্যাকাউন্ট পাওয়া গেছে। সদস্য ${found.fullName || found.email || "AYNA সদস্য"}।`,
          "success"
        );

        return;

      }

    }


    showSignal(
      `অ্যাকাউন্ট লুকআপে "${query}" পাওয়া যায়নি। AYNA ID অথবা Gmail ঠিক আছে কি না যাচাই করুন।`,
      "error"
    );


  } catch (error) {

    console.error(
      "RTDB lookup error:",
      error
    );


    showSignal(
      "অ্যাকাউন্ট লুকআপ সম্পন্ন করা যায়নি। Firebase Database Rules বা connection পরীক্ষা করুন।",
      "error"
    );

  }

}


$("lookupAccountBtn")?.addEventListener(
  "click",
  handleAccountLookup
);


// ============================================================
// LOGIN
// ============================================================

async function handleLoginSubmit() {

  const emailInput =
    $("loginEmail");

  const passwordInput =
    $("loginPassword");

  const button =
    $("loginSubmitBtn");


  const email =
    (emailInput?.value || "")
      .trim()
      .toLowerCase();


  const password =
    passwordInput?.value || "";


  // ----------------------------------------------------------
  // EMAIL EMPTY
  // ----------------------------------------------------------

  if (!email) {

    showSignal(
      "জিমেইল ঠিকানার ঘর খালি রয়েছে। আপনার Gmail লিখুন।",
      "error"
    );

    emailInput?.focus();

    return;

  }


  // ----------------------------------------------------------
  // EMAIL FORMAT
  // ----------------------------------------------------------

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (
    !emailPattern.test(email)
  ) {

    showSignal(
      "জিমেইল ঠিকানায় ভুল হয়েছে। সঠিক Gmail লিখুন।",
      "error"
    );

    emailInput?.focus();

    return;

  }


  // ----------------------------------------------------------
  // PASSWORD EMPTY
  // ----------------------------------------------------------

  if (!password) {

    showSignal(
      "লগইন পাসওয়ার্ডের ঘর খালি রয়েছে।",
      "error"
    );

    passwordInput?.focus();

    return;

  }


  // ----------------------------------------------------------
  // PASSWORD LENGTH
  // ----------------------------------------------------------

  if (
    password.length < 6
  ) {

    showSignal(
      "লগইন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।",
      "error"
    );

    passwordInput?.focus();

    return;

  }


  // ----------------------------------------------------------
  // FIREBASE CHECK
  // ----------------------------------------------------------

  if (!auth) {

    showSignal(
      "Firebase Authentication পাওয়া যায়নি। firebase-init.js পরীক্ষা করুন।",
      "error"
    );

    return;

  }


  // ----------------------------------------------------------
  // BUTTON LOCK
  // ----------------------------------------------------------

  if (button) {

    button.disabled =
      true;

    button.textContent =
      "⏳ লগইন হচ্ছে...";

  }


  try {

    // --------------------------------------------------------
    // REAL FIREBASE LOGIN
    // --------------------------------------------------------

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      result.user;


    console.log(
      "AYNA LOGIN SUCCESS:",
      user.uid,
      user.email
    );


    showSignal(
      "✅ লগইন সফল হয়েছে। AYNA BOOK হোমে যাওয়া হচ্ছে।",
      "success"
    );


    // --------------------------------------------------------
    // Save safe session information
    // --------------------------------------------------------

    try {

      sessionStorage.setItem(
        "ayna_login_email",
        user.email || email
      );

      sessionStorage.setItem(
        "ayna_login_uid",
        user.uid || ""
      );

    } catch (_) {}


    // --------------------------------------------------------
    // GO HOME
    // --------------------------------------------------------

    setTimeout(
      () => {

        window.location.replace(
          "index.html"
        );

      },
      1000
    );


  } catch (error) {

    console.error(
      "AYNA BOOK LOGIN ERROR:",
      error
    );


    const code =
      String(
        error?.code || ""
      )
        .toLowerCase();


    // --------------------------------------------------------
    // WRONG USER / PASSWORD
    // --------------------------------------------------------

    if (
      code.includes(
        "invalid-credential"
      ) ||
      code.includes(
        "user-not-found"
      ) ||
      code.includes(
        "wrong-password"
      )
    ) {

      showSignal(
        "❌ Gmail অথবা password ভুল হয়েছে। আবার সঠিক তথ্য লিখুন।",
        "error"
      );

      passwordInput?.focus();

    }


    // --------------------------------------------------------
    // INVALID EMAIL
    // --------------------------------------------------------

    else if (
      code.includes(
        "invalid-email"
      )
    ) {

      showSignal(
        "❌ Gmail ঠিকানার ফরম্যাট ভুল হয়েছে।",
        "error"
      );

      emailInput?.focus();

    }


    // --------------------------------------------------------
    // TOO MANY REQUESTS
    // --------------------------------------------------------

    else if (
      code.includes(
        "too-many-requests"
      )
    ) {

      showSignal(
        "⚠️ অনেকবার Login চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।",
        "error"
      );

    }


    // --------------------------------------------------------
    // NETWORK
    // --------------------------------------------------------

    else if (
      code.includes(
        "network-request-failed"
      )
    ) {

      showSignal(
        "🌐 Internet connection সমস্যা হয়েছে। Internet পরীক্ষা করুন।",
        "error"
      );

    }


    // --------------------------------------------------------
    // USER DISABLED
    // --------------------------------------------------------

    else if (
      code.includes(
        "user-disabled"
      )
    ) {

      showSignal(
        "🔒 এই account বর্তমানে disabled করা হয়েছে।",
        "error"
      );

    }


    // --------------------------------------------------------
    // OPERATION NOT ALLOWED
    // --------------------------------------------------------

    else if (
      code.includes(
        "operation-not-allowed"
      )
    ) {

      showSignal(
        "⚠️ Firebase Console-এ Email/Password Authentication চালু করা হয়নি।",
        "error"
      );

    }


    // --------------------------------------------------------
    // API KEY / CONFIG
    // --------------------------------------------------------

    else if (
      code.includes(
        "api-key-not-valid"
      ) ||
      code.includes(
        "invalid-api-key"
      )
    ) {

      showSignal(
        "🔴 Firebase API Key ভুল বা Firebase configuration সঠিক নয়।",
        "error"
      );

    }


    // --------------------------------------------------------
    // UNKNOWN
    // --------------------------------------------------------

    else {

      showSignal(
        "❌ Login সম্পন্ন করা যায়নি। Firebase error: " +
        (error?.code || "unknown"),
        "error"
      );

    }


  } finally {

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "🚀 লগইন বাটন";

    }

  }

}


// ============================================================
// LOGIN BUTTON
// ============================================================

$("loginSubmitBtn")?.addEventListener(
  "click",
  handleLoginSubmit
);


// ============================================================
// ENTER KEY
// ============================================================

$("loginPassword")?.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      handleLoginSubmit();

    }

  }
);


// ============================================================
// EMAIL ENTER
// ============================================================

$("loginEmail")?.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      $("loginPassword")?.focus();

    }

  }
);


// ============================================================
// STARTUP
// ============================================================

console.log(
  "AYNA BOOK login.js loaded successfully."
);

console.log(
  "Firebase Auth:",
  auth ? "READY" : "NOT READY"
);

console.log(
  "Firebase Database:",
  database ? "READY" : "NOT READY"
);