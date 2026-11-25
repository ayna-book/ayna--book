// login.js — AYNA BOOK Login & Account Lookup Logic Module

import { AynaVoiceSignal } from "./ayna-voice-signal.js";
import { auth, database } from "./firebase-init.js";

const $ = id => document.getElementById(id);

export function initLoginPage() {
  // হেডার ও সিগন্যাল বাটন
  $("speakClockBtn")?.addEventListener("click", () => AynaVoiceSignal.speakCurrentTime());
  $("toggleClockBtn")?.addEventListener("click", () => AynaVoiceSignal.toggleClock("toggleClockBtn"));
  $("repeatSignalBtn")?.addEventListener("click", () => AynaVoiceSignal.repeatLast());

  // আলাদা রেজিস্ট্রেশন বাটন
  $("registerPageBtn")?.addEventListener("click", () => {
    window.location.href = "register.html";
  });

  // লগইন পাসওয়ার্ড দেখাও / লুকাও বাটন
  bindPasswordToggle(
    "toggleLoginPassBtn",
    "loginPassword",
    "👁️ পাসওয়ার্ড দেখাও",
    "🙈 পাসওয়ার্ড লুকাও"
  );

  // অ্যাকাউন্ট লুকআপ (AYNA ID বা জিমেইল)
  $("lookupAccountBtn")?.addEventListener("click", handleAccountLookup);

  // লগইন বাটন সাবমিট
  $("loginSubmitBtn")?.addEventListener("click", handleLoginSubmit);
}

function bindPasswordToggle(btnId, inputId, showText, hideText) {
  $(btnId)?.addEventListener("click", () => {
    const input = $(inputId);
    const btn = $(btnId);
    if (!input || !btn) return;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    btn.textContent = isHidden ? hideText : showText;
  });
}

async function handleAccountLookup() {
  const query = ($("lookupAccountInput")?.value || "").trim();
  if (!query) {
    AynaVoiceSignal.error(
      "অ্যাকাউন্ট লুকআপের ঘরে ভুল হয়েছে। AYNA ID অথবা জিমেইল ঠিকানা লিখুন।",
      "loginSignalBox"
    );
    $("lookupAccountInput")?.focus();
    return;
  }

  if (query === "2026-----10000001") {
    AynaVoiceSignal.success(
      "অ্যাকাউন্ট লুকআপ সফল হয়েছে। AYNA ID 2026-----10000001 পাওয়া গেছে।",
      "loginSignalBox"
    );
    return;
  }

  try {
    const localAcc = JSON.parse(localStorage.getItem("ayna_registered_account") || "null");
    if (
      localAcc &&
      ((localAcc.aynaId && String(localAcc.aynaId).trim() === query) ||
        (localAcc.email && String(localAcc.email).trim().toLowerCase() === query.toLowerCase()))
    ) {
      AynaVoiceSignal.success(
        `অ্যাকাউন্ট পাওয়া গেছে। জিমেইল ${localAcc.email} এবং আইডি ${localAcc.aynaId || "2026-----10000001"}।`,
        "loginSignalBox"
      );
      return;
    }
  } catch (_) {}

  if (database) {
    try {
      const { ref, get, child } = await import(
        "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js"
      );
      const snap = await get(child(ref(database), "users"));
      if (snap.exists()) {
        const users = Object.values(snap.val() || {});
        const found = users.find(
          u =>
            (u.aynaId && String(u.aynaId).trim() === query) ||
            (u.email && String(u.email).trim().toLowerCase() === query.toLowerCase())
        );
        if (found) {
          AynaVoiceSignal.success(
            `অ্যাকাউন্ট পাওয়া গেছে। সদস্য ${found.fullName || found.email || "AYNA সদস্য"}।`,
            "loginSignalBox"
          );
          return;
        }
      }
    } catch (_) {}
  }

  AynaVoiceSignal.error(
    `অ্যাকাউন্ট লুকাপে "${query}" খুঁজে পাওয়া যায়নি। AYNA ID বা জিমেইল ঠিক আছে কি না যাচাই করুন।`,
    "loginSignalBox"
  );
}

async function handleLoginSubmit() {
  const email = ($("loginEmail")?.value || "").trim();
  const password = $("loginPassword")?.value || "";

  if (!email) {
    AynaVoiceSignal.error(
      "জিমেইল ঠিকানার ঘরে ভুল হয়েছে। জিমেইল ঘরটি খালি রয়েছে।",
      "loginSignalBox"
    );
    $("loginEmail")?.focus();
    return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    AynaVoiceSignal.error(
      "জিমেইল ঠিকানার ঘরে ভুল হয়েছে। সঠিক জিমেইল ফরম্যাট লিখুন।",
      "loginSignalBox"
    );
    $("loginEmail")?.focus();
    return;
  }
  if (!password) {
    AynaVoiceSignal.error(
      "লগইন পাসওয়ার্ডের ঘরে ভুল হয়েছে। পাসওয়ার্ড ঘরটি খালি রয়েছে।",
      "loginSignalBox"
    );
    $("loginPassword")?.focus();
    return;
  }
  if (password.length < 6) {
    AynaVoiceSignal.error(
      "লগইন পাসওয়ার্ডের ঘরে ভুল হয়েছে। পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।",
      "loginSignalBox"
    );
    $("loginPassword")?.focus();
    return;
  }

  if (!auth) {
    try {
      const localAcc = JSON.parse(localStorage.getItem("ayna_registered_account") || "null");
      if (localAcc && String(localAcc.email || "").toLowerCase() === email.toLowerCase()) {
        AynaVoiceSignal.success("লোকাল অ্যাকাউন্ট লগইন সফল হয়েছে। হোম পেজে যাওয়া হচ্ছে।", "loginSignalBox");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
        return;
      }
    } catch (_) {}

    AynaVoiceSignal.error(
      "ফায়ারবেস সংযোগ পাওয়া যায়নি। firebase-init.js-এ সঠিক API Key বসান বা আগে রেজিস্ট্রেশন সম্পন্ন করুন।",
      "loginSignalBox"
    );
    return;
  }

  const btn = $("loginSubmitBtn");
  try {
    const { signInWithEmailAndPassword } = await import(
      "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"
    );
    if (btn) {
      btn.disabled = true;
      btn.textContent = "লগইন হচ্ছে...";
    }

    await signInWithEmailAndPassword(auth, email, password);
    AynaVoiceSignal.success("লগইন সফল হয়েছে। AYNA BOOK হোমে যাওয়া হচ্ছে।", "loginSignalBox");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    const code = err?.code || "";
    if (code.includes("user-not-found") || code.includes("invalid-credential")) {
      AynaVoiceSignal.error(
        "জিমেইল বা লগইন পাসওয়ার্ডে ভুল হয়েছে। অ্যাকাউন্ট খুঁজে পাওয়া যায়নি বা তথ্য মিলছে না।",
        "loginSignalBox"
      );
      $("loginPassword")?.focus();
    } else if (code.includes("wrong-password")) {
      AynaVoiceSignal.error(
        "লগইন পাসওয়ার্ডে ভুল হয়েছে। সঠিক পাসওয়ার্ড আবার লিখুন।",
        "loginSignalBox"
      );
      $("loginPassword")?.focus();
    } else if (code.includes("invalid-email")) {
      AynaVoiceSignal.error(
        "জিমেইল ঠিকানার বানানে ভুল হয়েছে।",
        "loginSignalBox"
      );
      $("loginEmail")?.focus();
    } else {
      AynaVoiceSignal.error(
        "লগইন সম্পন্ন করা যায়নি। নেটওয়ার্ক বা ফায়ারবেস সংযোগ পরীক্ষা করুন।",
        "loginSignalBox"
      );
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "🚀 লগইন বাটন";
    }
  }
}

initLoginPage();