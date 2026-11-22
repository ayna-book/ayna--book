// =========================================================
// AYNA BOOK — PROFILE PHOTO CONTROLLER
// File: signup-photo.js
// =========================================================

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const photoInput = document.getElementById("photo");
const previewBox = document.getElementById("photoPreviewBox");
const preview = document.getElementById("photoPreview");
const status = document.getElementById("photoStatus");

let selectedPhoto = null;
let previewUrl = null;

function setStatus(message, success = false) {
  if (!status) return;

  status.textContent = message;

  status.style.marginTop = "8px";
  status.style.fontSize = "13px";
  status.style.color = success
    ? "#d4af37"
    : "#ff6b6b";
}

function clearPreview() {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (preview) {
    preview.removeAttribute("src");
  }

  if (previewBox) {
    previewBox.style.display = "none";
  }
}

function validatePhoto(file) {
  if (!file) {
    return "Profile Photo নির্বাচন করুন।";
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return "শুধু JPG, PNG অথবা WebP ছবি ব্যবহার করুন।";
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return "ছবির আকার সর্বোচ্চ 5 MB হতে হবে।";
  }

  return "";
}

photoInput?.addEventListener("change", () => {
  selectedPhoto = null;
  clearPreview();

  const file = photoInput.files?.[0];

  const error = validatePhoto(file);

  if (error) {
    photoInput.value = "";
    setStatus(error);
    return;
  }

  selectedPhoto = file;

  previewUrl = URL.createObjectURL(file);

  if (preview) {
    preview.src = previewUrl;
  }

  if (previewBox) {
    previewBox.style.display = "block";
  }

  setStatus("Profile photo প্রস্তুত।", true);
});


export function getSelectedProfilePhoto() {
  return selectedPhoto;
}


export function validateSelectedProfilePhoto() {
  const file = selectedPhoto;

  const error = validatePhoto(file);

  if (error) {
    setStatus(error);
    return false;
  }

  return true;
}


export function resetProfilePhoto() {
  selectedPhoto = null;

  if (photoInput) {
    photoInput.value = "";
  }

  clearPreview();
  setStatus("");
};