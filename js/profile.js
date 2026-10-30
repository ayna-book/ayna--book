
import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

const $ = (id) => document.getElementById(id);

const form = $("profileForm");
const photoInput = $("photo");
const preview = $("photoPreview");
const statusElement = $("profileStatus");
const saveButton = $("saveButton");
const logoutButton = $("logoutButton");

let currentUser = null;
let photoFile = null;
let loading = true;
let saving = false;

function showStatus(message) {
  statusElement.textContent = message;
}

function setFormEnabled(enabled) {
  for (const element of form.elements) {
    element.disabled = !enabled;
  }

  logoutButton.disabled = !enabled;
}

function showPhoto(url) {
  if (url) {
    preview.src = url;
    preview.hidden = false;
  } else {
    preview.removeAttribute("src");
    preview.hidden = true;
  }
}

// Load profile after authentication
setFormEnabled(false);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("./login.html");
    return;
  }

  currentUser = user;
  $("accountEmail").textContent =
    "লগইন করা অ্যাকাউন্ট: " + (user.email || "Email unavailable");

  showStatus("প্রোফাইল লোড হচ্ছে...");

  try {
    const profileRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(profileRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      $("name").value = data.name || "";
      $("username").value = data.username || "";
      $("bio").value = data.bio || "";
      $("location").value = data.location || "";

      showPhoto(data.photo || "");
    } else {
      $("name").value = user.displayName || "";
    }

    showStatus("আপনার প্রোফাইল প্রস্তুত।");
  } catch (error) {
    console.error("Profile loading error:", error);
    showStatus("প্রোফাইল লোড হয়নি। Firebase Rules পরীক্ষা করুন।");
  } finally {
    loading = false;
    setFormEnabled(true);
  }
});

// Select and preview photo
photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];

  if (!file) {
    photoFile = null;
    return;
  }

  if (!file.type.startsWith("image/")) {
    showStatus("একটি বৈধ ছবি নির্বাচন করুন।");
    photoInput.value = "";
    photoFile = null;
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showStatus("ছবির আকার সর্বোচ্চ ২ MB হতে পারবে।");
    photoInput.value = "";
    photoFile = null;
    return;
  }

  photoFile = file;

  const reader = new FileReader();

  reader.onload = () => {
    if (typeof reader.result === "string") {
      preview.src = reader.result;
      preview.hidden = false;
      showStatus("ছবির প্রিভিউ তৈরি হয়েছে। সংরক্ষণ করতে Save চাপুন।");
    }
  };

  reader.onerror = () => {
    showStatus("ছবি পড়া যায়নি। আবার চেষ্টা করুন।");
  };

  reader.readAsDataURL(file);
});

// Save profile
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser || loading || saving) {
    showStatus("অ্যাকাউন্ট প্রস্তুত হলে আবার চেষ্টা করুন।");
    return;
  }

  const name = $("name").value.trim();

  const username = $("username")
    .value.trim()
    .replace(/^@/, "")
    .toLowerCase();

  const bio = $("bio").value.trim();
  const location = $("location").value.trim();

  if (!name || !username) {
    showStatus("নাম ও ইউজারনেম লিখুন।");
    return;
  }

  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
    showStatus(
      "ইউজারনেম ৩–৩০ অক্ষরের হতে হবে। ইংরেজি অক্ষর, সংখ্যা, _, . অথবা - ব্যবহার করুন।"
    );
    return;
  }

  saving = true;
  saveButton.disabled = true;
  logoutButton.disabled = true;

  showStatus("প্রোফাইল সংরক্ষণ হচ্ছে...");

  try {
    const profileRef = doc(db, "users", currentUser.uid);
    const oldSnapshot = await getDoc(profileRef);

    let photoUrl = "";

    if (oldSnapshot.exists()) {
      photoUrl = oldSnapshot.data().photo || "";
    }

    // Upload a new photo only when one is selected
    if (photoFile) {
      const safeName = photoFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const photoRef = ref(
        storage,
        `profilePhotos/${currentUser.uid}/${Date.now()}_${safeName}`
      );

      await uploadBytes(photoRef, photoFile);
      photoUrl = await getDownloadURL(photoRef);
    }

    await setDoc(
      profileRef,
      {
        name,
        username,
        bio,
        location,
        photo: photoUrl,
        email: currentUser.email || "",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    photoFile = null;
    photoInput.value = "";

    showPhoto(photoUrl);
    showStatus("✅ আপনার AYNA BOOK প্রোফাইল সংরক্ষিত হয়েছে!");

  } catch (error) {
    console.error("Profile saving error:", error);

    showStatus(
      "প্রোফাইল সংরক্ষণ হয়নি। Firestore Rules, Storage Rules ও ইন্টারনেট পরীক্ষা করুন।"
    );

  } finally {
    saving = false;
    saveButton.disabled = false;
    logoutButton.disabled = false;
  }
});

// Log out
logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  showStatus("লগআউট হচ্ছে...");

  try {
    await signOut(auth);
    window.location.replace("./login.html");
  } catch (error) {
    console.error("Logout error:", error);
    showStatus("লগআউট করা যায়নি। আবার চেষ্টা করুন।");
    logoutButton.disabled = false;
  }
});
