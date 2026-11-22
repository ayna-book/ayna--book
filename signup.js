
import { registerUser, getAuthErrorMessage } from "./auth.js";

const form = document.getElementById("signupForm");
const photoInput = document.getElementById("profilePhoto");
const preview = document.getElementById("photoPreview");
const button = document.getElementById("signupButton");
const message = document.getElementById("statusMessage");

let previewUrl = null;

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;

  if (!file) {
    preview.hidden = true;
    preview.removeAttribute("src");
    return;
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    photoInput.value = "";
    preview.hidden = true;
    message.textContent = "Please select a JPG, PNG, or WebP image.";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    photoInput.value = "";
    preview.hidden = true;
    message.textContent = "Photo size must be 5 MB or less.";
    return;
  }

  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  preview.hidden = false;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const photo = photoInput.files?.[0];

  if (!photo) {
    message.textContent = "Profile photo is required.";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password must contain at least 6 characters.";
    return;
  }

  button.disabled = true;
  button.textContent = "CREATING ACCOUNT...";

  try {
    await registerUser({ fullName, email, phone, password, photo });
    message.textContent = "Account created. Check your Gmail inbox and verify your email.";
    form.reset();
    preview.hidden = true;

    setTimeout(() => {
      location.href = "./verify-email.html";
    }, 1800);
  } catch (error) {
    message.textContent = getAuthErrorMessage(error);
  } finally {
    button.disabled = false;
    button.textContent = "CREATE ACCOUNT";
  }
});