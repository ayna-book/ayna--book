// =========================================================
// AYNA BOOK
// PROFILE PHOTO VALIDATION
// File: signup.js
// =========================================================

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const photoPreviewBox = document.getElementById("photoPreviewBox");
const photoStatus = document.getElementById("photoStatus");

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

let selectedPhoto = null;

function showPhotoStatus(message, success = false) {
  if (!photoStatus) return;

  photoStatus.textContent = message;

  photoStatus.style.marginTop = "8px";
  photoStatus.style.fontSize = "13px";
  photoStatus.style.color = success
    ? "#d4af37"
    : "#ff6b6b";
}

photoInput?.addEventListener("change", () => {
  const file = photoInput.files?.[0];

  selectedPhoto = null;

  if (!file) {
    photoPreviewBox.style.display = "none";
    showPhotoStatus("");
    return;
  }

  // File type check
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    photoInput.value = "";
    photoPreviewBox.style.display = "none";

    showPhotoStatus(
      "শুধু JPG, PNG অথবা WebP ছবি ব্যবহার করুন।"
    );

    return;
  }

  // File size check
  if (file.size > MAX_PHOTO_SIZE) {
    photoInput.value = "";
    photoPreviewBox.style.display = "none";

    showPhotoStatus(
      "ছবির আকার সর্বোচ্চ 5 MB হতে হবে।"
    );

    return;
  }

  selectedPhoto = file;

  const objectURL = URL.createObjectURL(file);

  photoPreview.src = objectURL;
  photoPreviewBox.style.display = "block";

  photoPreview.onload = () => {
    URL.revokeObjectURL(objectURL);
  };

  showPhotoStatus(
    "Profile photo প্রস্তুত।",
    true
  );
});

export function getSelectedProfilePhoto() {
  return selectedPhoto;
}