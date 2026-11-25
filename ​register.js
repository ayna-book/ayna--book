// register.js — AYNA BOOK Registration Logic Module

import { AynaVoiceSignal } from "./ayna-voice-signal.js";
import { auth, database } from "./firebase-init.js";

const $ = id => document.getElementById(id);

const DEFAULT_FRAME_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#0a1636"/><circle cx="80" cy="56" r="28" fill="#ffe64d"/><path d="M24 160 Q32 104 80 104 Q128 104 136 160" fill="#ffe64d"/></svg>'
  );

let photoDataUrl = "";

export function initRegisterPage() {
  if ($("regPhotoPreview") && !$("regPhotoPreview").src) {
    $("regPhotoPreview").src = DEFAULT_FRAME_SVG;
  }

  // হেডার ও সিগন্যাল বাটন
  $("speakClockBtn")?.addEventListener("click", () => AynaVoiceSignal.speakCurrentTime());
  $("toggleClockBtn")?.addEventListener("click", () => AynaVoiceSignal.toggleClock("toggleClockBtn"));
  $("repeatSignalBtn")?.addEventListener("click", () => AynaVoiceSignal.repeatLast());
  $("loginPageBtn")?.addEventListener("click", () => {
    window.location.href = "login.html";
  });

  // পাসওয়ার্ড ও রি-পাসওয়ার্ড দেখাও / লুকাও বাটন
  bindPasswordToggle("togglePasswordBtn", "regPassword", "👁️ পাসওয়ার্ড দেখাও", "🙈 পাসওয়ার্ড লুকাও");
  bindPasswordToggle(
    "toggleConfirmPasswordBtn",
    "regConfirmPassword",
    "👁️ রি-পাসওয়ার্ড দেখাও",
    "🙈 রি-পাসওয়ার্ড লুকাও"
  );

  // ১ নম্বর ঘর: প্রোফাইল ছবি নির্বাচন ও প্রিভিউ
  $("choosePhotoBtn")?.addEventListener("click", () => $("regPhotoInput")?.click());
  $("regPhotoInput")?.addEventListener("change", ev => {
    const file = ev.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      AynaVoiceSignal.error("১ নম্বর ছবির ঘরে ভুল হয়েছে। অনুগ্রহ করে সঠিক ছবি ফাইল নির্বাচন করুন।");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      photoDataUrl = String(reader.result || "");
      if ($("regPhotoPreview")) $("regPhotoPreview").src = photoDataUrl || DEFAULT_FRAME_SVG;
      if ($("regPhotoLabel")) $("regPhotoLabel").textContent = `নির্বাচিত ছবি: ${file.name}`;
    };
    reader.readAsDataURL(file);
  });

  // রেজিস্ট্রেশন বাটন সাবমিট
  $("registerSubmitBtn")?.addEventListener("click", handleRegisterSubmit);
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

async function handleRegisterSubmit() {
  const email = ($("regEmail")?.value || "").trim();
  const phone = ($("regPhone")?.value || "").trim();
  const password = $("regPassword")?.value || "";
  const confirmPassword = $("regConfirmPassword")?.value || "";

  if (!email) {
    AynaVoiceSignal.error("২ নম্বর জিমেইল ঠিকানার ঘরে ভুল হয়েছে। জিমেইল ঘরটি খালি রয়েছে।");
    $("regEmail")?.focus();
    return;
  }
  if (!email.includes("@") || !email.includes(".")) {
    AynaVoiceSignal.error("২ নম্বর জিমেইল ঠিকানার ঘরে ভুল হয়েছে। সঠিক জিমেইল ঠিকানা লিখুন।");
    $("regEmail")?.focus();
    return;
  }
  if (!phone || phone.replace(/\D/g, "").length < 8) {
    AynaVoiceSignal.error("৩ নম্বর ফোন নম্বরের ঘরে ভুল হয়েছে। সঠিক ফোন নম্বর লিখুন।");
    $("regPhone")?.focus();
    return;
  }
  if (!password || password.length < 6) {
    AynaVoiceSignal.error("পাসওয়ার্ডের ঘরে ভুল হয়েছে। পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
    $("regPassword")?.focus();
    return;
  }
  if (password !== confirmPassword) {
    AynaVoiceSignal.error("রি-পাসওয়ার্ডের ঘরে ভুল হয়েছে। পাসওয়ার্ড ও রি-পাসওয়ার্ড এক হতে হবে।");
    $("regConfirmPassword")?.focus();
    return;
  }

  const aynaId = `2026-----${String(Math.floor(10000001 + Math.random() * 89999999))}`;

  try {
    localStorage.setItem(
      "ayna_registered_account",
      JSON.stringify({
        email,
        phone,
        photoURL: photoDataUrl,
        aynaId,
        createdAt: Date.now()
      })
    );
  } catch (_) {}

  if (!auth || !database) {
    AynaVoiceSignal.error(
      "ফায়ারবেস সংযোগ পাওয়া যায়নি। firebase-init.js-এ সঠিক API Key বসান; লোকাল অ্যাকাউন্ট সংরক্ষিত হয়েছে।"
    );
    return;
  }

  const btn = $("registerSubmitBtn");
  try {
    const [{ createUserWithEmailAndPassword }, { ref, set }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js")
    ]);

    if (btn) {
      btn.disabled = true;
      btn.textContent = "রেজিস্ট্রেশন হচ্ছে...";
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    await set(ref(database, "users/" + uid), {
      uid,
      email,
      phone,
      photoURL: photoDataUrl,
      aynaId,
      createdAt: Date.now()
    });

    AynaVoiceSignal.success(`রেজিস্ট্রেশন সফল হয়েছে। আপনার AYNA ID ${aynaId}।`);
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  } catch (err) {
    const code = err?.code || "";
    if (code.includes("email-already-in-use")) {
      AynaVoiceSignal.error("২ নম্বর জিমেইল ঠিকানার ঘরে ভুল হয়েছে। এই জিমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে।");
    } else if (code.includes("invalid-email")) {
      AynaVoiceSignal.error("২ নম্বর জিমেইল ঠিকানার বানানে ভুল হয়েছে।");
    } else if (code.includes("weak-password")) {
      AynaVoiceSignal.error("পাসওয়ার্ড খুব দুর্বল হয়েছে। অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।");
    } else {
      AynaVoiceSignal.error("রেজিস্ট্রেশন সম্পন্ন করা যায়নি। নেটওয়ার্ক বা ফায়ারবেস নিয়ম পরীক্ষা করুন।");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "✅ রেজিস্ট্রেশন বাটন";
    }
  }
}

initRegisterPage();