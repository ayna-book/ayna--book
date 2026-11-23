
import { registerUser } from "./auth.js";
import { saveUserProfile } from "./database.js";
import { uploadProfilePhoto } from "./storage.js";

const registerForm = document.getElementById("registerForm");
const registerButton = document.getElementById("registerButton");
const message = document.getElementById("message");

function showMessage(text, success = false) {
  message.textContent = text;
  message.style.color = success ? "#4caf50" : "#ff5252";
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const country = document.getElementById("country").value;
  const phone = document.getElementById("phone").value.trim();

  const photoFile = document.getElementById("photo").files[0];

  const password = document.getElementById("password").value;
  const confirmPassword =
    document.getElementById("confirmPassword").value;

  const terms = document.getElementById("terms").checked;

  // Validation
  if (fullName.length < 2) {
    showMessage("Please enter your full name.");
    return;
  }

  if (!email || !country || !photoFile) {
    showMessage("Please complete all required fields.");
    return;
  }

  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.");
    return;
  }

  if (!terms) {
    showMessage("Please accept Terms & Conditions.");
    return;
  }

  registerButton.disabled = true;
  registerButton.textContent = "CREATING ACCOUNT...";
  showMessage("Please wait. Creating your account...", true);

  let accountCreated = false;

  try {
    // 1. Create Firebase Auth account
    const credential = await registerUser(email, password);

    const user = credential.user;
    accountCreated = true;

    // 2. Upload profile photo
    showMessage("Uploading profile photo...", true);

    const uploadResult = await uploadProfilePhoto(photoFile);

    // 3. Save profile in Realtime Database
    showMessage("Saving your profile...", true);

    await saveUserProfile({
      uid: user.uid,
      aynaId: "AYNA-" + user.uid,
      fullName: fullName,
      email: user.email,
      country: country,
      phone: phone,
      photoURL: uploadResult.url,
      privacy: "public",
      bio: "",
      plan: "free",
      createdAt: Date.now()
    });

    // 4. Registration completed
    showMessage(
      "Account created successfully! Verification email sent.",
      true
    );

    registerButton.textContent = "SUCCESS";

    // 5. Go to email verification page
    setTimeout(() => {
      window.location.href = "verify-email.html";
    }, 1500);

  } catch (error) {
    console.error("Registration error:", error);

    let errorMessage = "Registration failed. Please try again.";

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Please enter a valid email address.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Please use a stronger password.";
    } else if (error.code === "auth/network-request-failed") {
      errorMessage = "Network error. Check your internet connection.";
    } else if (error.code === "storage/unauthorized" ||
               error.code === "storage/unauthenticated") {
      errorMessage = "Photo upload permission denied. Check Storage Rules.";
    } else if (error.code === "storage/quota-exceeded") {
      errorMessage = "Firebase Storage quota exceeded.";
    } else if (accountCreated) {
      errorMessage =
        "Your login account was created, but profile setup failed. " +
        "Please contact support before trying to register again.";
    }

    showMessage(errorMessage);

  } finally {
    if (!accountCreated || message.textContent.includes("failed") ||
        message.textContent.includes("denied")) {
      registerButton.disabled = false;
      registerButton.textContent = "CREATE ACCOUNT";
    }
  }
});
