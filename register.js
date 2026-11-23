
import { registerUser } from "./auth.js";
import { saveUserProfile } from "./database.js";
import { uploadProfilePhoto } from "./storage.js";

const registerForm = document.getElementById("registerForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");
const phoneInput = document.getElementById("phone");
const photoInput = document.getElementById("photo");
const passwordInput = document.getElementById("password");
const confirmPasswordInput =
  document.getElementById("confirmPassword");

const termsInput = document.getElementById("terms");
const registerButton =
  document.getElementById("registerButton");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (registerButton.disabled) return;

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const country = countryInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const photoFile = photoInput?.files?.[0];

  // Required field validation
  if (!fullName || !email || !country || !password) {
    message.textContent = "সব প্রয়োজনীয় তথ্য পূরণ করুন।";
    return;
  }

  if (fullName.length < 2 || fullName.length > 100) {
    message.textContent = "নাম ২ থেকে ১০০ অক্ষরের মধ্যে দিন।";
    return;
  }

  if (!photoFile) {
    message.textContent = "Profile Photo নির্বাচন করুন।";
    return;
  }

  if (!photoFile.type.startsWith("image/")) {
    message.textContent = "শুধু Image File নির্বাচন করুন।";
    return;
  }

  if (photoFile.size > 5 * 1024 * 1024) {
    message.textContent = "ছবির সাইজ সর্বোচ্চ ৫ MB হতে পারবে।";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password কমপক্ষে ৬ অক্ষরের দিন।";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "দুটি Password মিলছে না।";
    return;
  }

  if (!termsInput.checked) {
    message.textContent =
      "Terms & Conditions গ্রহণ করতে হবে।";
    return;
  }

  registerButton.disabled = true;
  registerButton.textContent = "CREATING ACCOUNT...";
  message.textContent = "অ্যাকাউন্ট তৈরি হচ্ছে...";

  try {
    // 1. Create Firebase Authentication Account
    const credential = await registerUser(email, password);

    const user = credential.user || credential;

    if (!user || !user.uid) {
      throw new Error("Firebase User পাওয়া যায়নি।");
    }

    // 2. Upload Profile Photo
    message.textContent = "Profile Photo Upload হচ্ছে...";

    const uploadResult = await uploadProfilePhoto(photoFile);

    if (!uploadResult || !uploadResult.success || !uploadResult.url) {
      throw new Error("Profile Photo Upload ব্যর্থ হয়েছে।");
    }

    // 3. Create User Profile
    const profile = {
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
    };

    // 4. Save Profile in Realtime Database
    message.textContent = "Profile Save হচ্ছে...";

    await saveUserProfile(profile);

    // 5. Go to Email Verification
    message.textContent =
      "Registration সফল হয়েছে। Email Verify করুন।";

    window.location.replace("./verify-email.html");

  } catch (error) {
    console.error("Registration Error:", error);

    const errors = {
      "auth/email-already-in-use":
        "এই Email দিয়ে আগে Account তৈরি হয়েছে।",

      "auth/invalid-email":
        "সঠিক Email Address দিন।",

      "auth/weak-password":
        "আরও শক্তিশালী Password ব্যবহার করুন।",

      "auth/network-request-failed":
        "Internet Connection পরীক্ষা করুন।",

      "storage/unauthorized":
        "Photo Upload অনুমতি নেই। Storage Rules পরীক্ষা করুন।"
    };

    message.textContent =
      errors[error.code] ||
      error.message ||
      "Registration ব্যর্থ হয়েছে।";

  } finally {
    registerButton.disabled = false;
    registerButton.textContent = "CREATE ACCOUNT";
  }
});
