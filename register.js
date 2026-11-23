
import { app, auth } from "./app.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

const db = getDatabase(app);
const storage = getStorage(app);

const form = document.getElementById("registerForm");
const button = document.getElementById("registerButton");
const message = document.getElementById("message");

let accountCreated = false;

function showMessage(text, success = false) {
  message.style.display = "block";
  message.textContent = text;
  message.style.color = success ? "#8ee6a0" : "#ff8d8d";
  message.style.background = success ? "#102719" : "#301414";
}

// Password show/hide
document.querySelectorAll(".toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const showing = input.type === "password";

    input.type = showing ? "text" : "password";
    btn.textContent = showing ? "🙈" : "👁";
  });
});

// Registration
form.addEventListener("submit", async event => {
  event.preventDefault();

  if (accountCreated) {
    showMessage("Account already created. Please login.");
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const photo = document.getElementById("photo").files[0];
  const password = document.getElementById("password").value;
  const confirmPassword =
    document.getElementById("confirmPassword").value;
  const terms = document.getElementById("terms").checked;

  // Validation
  if (fullName.length < 2 || fullName.length > 100) {
    showMessage("Please enter a valid full name.");
    return;
  }

  if (!email) {
    showMessage("Please enter your email.");
    return;
  }

  if (!country || country.length > 100) {
    showMessage("Please enter your country.");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.");
    return;
  }

  if (!photo) {
    showMessage("Please select a profile photo.");
    return;
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
    showMessage("Only JPG, PNG and WEBP images are allowed.");
    return;
  }

  if (photo.size > 5 * 1024 * 1024) {
    showMessage("Photo must be smaller than 5 MB.");
    return;
  }

  if (!terms) {
    showMessage("Please accept Terms & Conditions.");
    return;
  }

  button.disabled = true;
  button.textContent = "PLEASE WAIT...";

  let user = null;

  try {
    // 1. Create Firebase Auth account
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    user = credential.user;
    accountCreated = true;

    // 2. Upload profile photo
    const extension =
      photo.type === "image/png" ? "png" :
      photo.type === "image/webp" ? "webp" : "jpg";

    const path =
      `profilePhotos/${user.uid}/profile_${Date.now()}.${extension}`;

    const photoRef = storageRef(storage, path);

    await uploadBytes(photoRef, photo, {
      contentType: photo.type
    });

    const photoURL = await getDownloadURL(photoRef);

    // 3. Save profile in Realtime Database
    const profile = {
      uid: user.uid,
      aynaId: "AYNA-" + user.uid,
      fullName,
      email: user.email,
      country,
      phone,
      photoURL,
      createdAt: Date.now(),
      privacy: "public",
      bio: "",
      plan: "free"
    };

    await set(ref(db, "users/" + user.uid), profile);

    // 4. Send verification email
    await sendEmailVerification(user);

    showMessage(
      "Account created successfully! Check your email for verification.",
      true
    );

    button.textContent = "ACCOUNT CREATED";

    setTimeout(() => {
      window.location.href = "verify-email.html";
    }, 1800);

  } catch (error) {
    console.error("Registration error:", error);

    const errorMessages = {
      "auth/email-already-in-use":
        "This email is already registered. Please login.",
      "auth/invalid-email":
        "Please enter a valid email address.",
      "auth/weak-password":
        "Please choose a stronger password.",
      "auth/network-request-failed":
        "Network error. Check your internet connection.",
      "storage/unauthorized":
        "Photo upload permission denied. Check Storage Rules.",
      "database/permission-denied":
        "Profile save permission denied. Check RTDB Rules."
    };

    if (user) {
      showMessage(
        "Your account was created, but profile setup did not finish. Do not register again with this email. Please login and complete profile recovery. Error: " +
        (errorMessages[error.code] || error.message)
      );

      button.textContent = "ACCOUNT CREATED";
    } else {
      showMessage(
        errorMessages[error.code] || error.message
      );

      button.disabled = false;
      button.textContent = "CREATE ACCOUNT";
    }
  }
});
