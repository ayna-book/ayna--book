
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

import { app, auth } from "./app.js";

const storage = getStorage(app);

// Upload profile photo
export async function uploadProfilePhoto(file) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (!file) {
    throw new Error("Please select a profile photo.");
  }

  // Image validation
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  // Maximum 5 MB
  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Image size must be under 5 MB.");
  }

  const extension = file.name.split(".").pop().toLowerCase();

  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

  if (!allowedExtensions.includes(extension)) {
    throw new Error("Use JPG, JPEG, PNG or WEBP.");
  }

  const filePath =
    `profilePhotos/${user.uid}/profile_${Date.now()}.${extension}`;

  const imageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(imageRef, file, {
    contentType: file.type
  });

  const downloadURL = await getDownloadURL(snapshot.ref);

  return {
    success: true,
    url: downloadURL,
    path: filePath
  };
}

// Delete profile photo
export async function deleteProfilePhoto(storagePath) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  if (
    typeof storagePath !== "string" ||
    !storagePath.startsWith(`profilePhotos/${user.uid}/`)
  ) {
    throw new Error("You cannot delete another user's photo.");
  }

  const imageRef = ref(storage, storagePath);

  await deleteObject(imageRef);

  return {
    success: true,
    message: "Profile photo deleted successfully."
  };
}

// Get storage instance
export { storage };
