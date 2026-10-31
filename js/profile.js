import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

const form = $("profileForm");
const photoInput = $("photo");
const preview = $("photoPreview");
const saveButton = $("saveButton");
const logoutButton = $("logoutButton");
const status = $("profileStatus");
const accountStatus = $("accountStatus");

let currentUser = null;
let previewUrl = "";
let saving = false;

function showStatus(message) {
  status.textContent = message;
}

function setFormEnabled(enabled) {
  for (const element of form.elements) {
    element.disabled = !enabled;
  }
  logoutButton.disabled = !enabled;
}

function showPhoto(file) {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  previewUrl = "";
  preview.removeAttribute("src");
  preview.hidden = true;

  if (!file) return;

  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  preview.hidden = false;
}

setFormEnabled(false);

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.replace("./login.html");
    return;
  }

  currentUser = user;
  $("email").value = user.email || "";

  accountStatus.textContent =
    "লগইন করা অ্যাকাউন্ট: " + (user.email || "ইমেইল নেই");

  showStatus("প্রোফাইল লোড হচ্ছে...");

  try {
    const snapshot = await getDoc(doc(db, "users", user.uid));

    if (snapshot.exists()) {
      const data = snapshot.data();

      $("name").value = data.name || user.displayName || "";
      $("phone").value = data.phone || user.phoneNumber || "";
      $("location").value = data.location || "";
      $("bio").value = data.bio || "";
    } else {
      $("name").value = user.displayName || "";
      $("phone").value = user.phoneNumber || "";
    }

    setFormEnabled(true);
    showStatus("প্রোফাইল প্রস্তুত। আপনার তথ্য লিখে সংরক্ষণ করুন।");

  } catch (error) {
    console.error("Profile load error:", error);

    setFormEnabled(true);

    showStatus(
      "প্রোফাইল লোড হয়নি। ইন্টারনেট ও Firestore Rules পরীক্ষা করুন।"
    );
  }
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];

  if (!file) {
    showPhoto(null);
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    photoInput.value = "";
    showPhoto(null);
    showStatus("JPG, PNG অথবা WebP ছবি নির্বাচন করুন।");
    return;
  }

  if (file.size > 200 * 1024) {
    photoInput.value = "";
    showPhoto(null);
    showStatus("আপাতত ২০০ KB-এর ছোট ছবি নির্বাচন করুন।");
    return;
  }

  showPhoto(file);

  showStatus(
    "ছবির প্রিভিউ তৈরি হয়েছে। Storage চালু না থাকায় ছবিটি অনলাইনে সংরক্ষণ হবে না।"
  );
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser) {
    showStatus("আগে লগইন করুন।");
    return;
  }

  if (saving) return;

  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const location = $("location").value.trim();
  const bio = $("bio").value.trim();

  if (!name) {
    showStatus("আপনার পূর্ণ নাম লিখুন।");
    $("name").focus();
    return;
  }

  if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
    showStatus(
      "ফোন নম্বর সঠিকভাবে লিখুন, যেমন +8801XXXXXXXXX।"
    );
    $("phone").focus();
    return;
  }

  saving = true;
  saveButton.disabled = true;
  logoutButton.disabled = true;

  showStatus("প্রোফাইল Firebase-এ সংরক্ষণ হচ্ছে...");

  try {
    await setDoc(
      doc(db, "users", currentUser.uid),
      {
        uid: currentUser.uid,
        name: name,
        email: currentUser.email || "",
        phone: phone,
        location: location,
        bio: bio,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    try {
      await updateProfile(currentUser, {
        displayName: name
      });
    } catch (profileError) {
      console.warn("Display name update failed:", profileError);
    }

    showStatus(
      "✅ প্রোফাইলের তথ্য সংরক্ষিত হয়েছে। " +
      "ছবি অনলাইনে সংরক্ষণ হয়নি, কারণ Firebase Storage সেটআপ করা নেই।"
    );

  } catch (error) {
    console.error("Profile save error:", error);

    showStatus(
      "সংরক্ষণ হয়নি। Firestore Rules, ইন্টারনেট ও Firebase সেটিংস পরীক্ষা করুন।"
    );

  } finally {
    saving = false;
    saveButton.disabled = false;
    logoutButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  try {
    await signOut(auth);
    window.location.replace("./login.html");

  } catch (error) {
    console.error("Logout error:", error);

    showStatus("লগআউট করা যায়নি। আবার চেষ্টা করুন।");
    logoutButton.disabled = false;
  }
});