// =========================================================
// AYNA BOOK
// FIREBASE STORAGE CONTROLLER
// File: storage.js
// =========================================================

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

import {
  app,
  auth
} from "./app.js";


// =========================================================
// FIREBASE STORAGE
// =========================================================

const storage = getStorage(app);


// =========================================================
// UPLOAD PROFILE PHOTO
// =========================================================

export async function uploadProfilePhoto(file) {

  try {

    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "Please sign in first."
      };
    }


    if (!file) {
      return {
        success: false,
        message: "Please select a photo."
      };
    }


    // -----------------------------------------------------
    // FILE TYPE
    // -----------------------------------------------------

    if (!file.type.startsWith("image/")) {

      return {
        success: false,
        message:
          "Please select a valid image file."
      };

    }


    // -----------------------------------------------------
    // FILE SIZE
    // Maximum: 5 MB
    // -----------------------------------------------------

    const maxSize =
      5 * 1024 * 1024;


    if (file.size > maxSize) {

      return {
        success: false,
        message:
          "Profile photo must be 5 MB or smaller."
      };

    }


    // -----------------------------------------------------
    // FILE EXTENSION
    // -----------------------------------------------------

    const extension =
      getFileExtension(file.name);


    // -----------------------------------------------------
    // UNIQUE FILE NAME
    // -----------------------------------------------------

    const fileName =
      `profile_${Date.now()}.${extension}`;


    // -----------------------------------------------------
    // STORAGE PATH
    // -----------------------------------------------------

    const storagePath =
      `profilePhotos/${user.uid}/${fileName}`;


    const storageRef =
      ref(storage, storagePath);


    // -----------------------------------------------------
    // UPLOAD
    // -----------------------------------------------------

    await uploadBytes(
      storageRef,
      file,
      {
        contentType: file.type,
        cacheControl: "public,max-age=3600"
      }
    );


    // -----------------------------------------------------
    // DOWNLOAD URL
    // -----------------------------------------------------

    const downloadURL =
      await getDownloadURL(
        storageRef
      );


    return {
      success: true,
      url: downloadURL,
      path: storagePath,
      message:
        "Profile photo uploaded successfully."
    };


  } catch (error) {

    console.error(
      "AYNA BOOK Profile Photo Upload Error:",
      error
    );


    return {
      success: false,
      code: error.code || "",
      message:
        getStorageErrorMessage(error)
    };

  }

}


// =========================================================
// DELETE PROFILE PHOTO
// =========================================================

export async function deleteProfilePhoto(
  storagePath
) {

  try {

    const user = auth.currentUser;

    if (!user) {

      return {
        success: false,
        message:
          "Please sign in first."
      };

    }


    if (!storagePath) {

      return {
        success: false,
        message:
          "No photo path was provided."
      };

    }


    // Security check
    if (
      !storagePath.startsWith(
        `profilePhotos/${user.uid}/`
      )
    ) {

      return {
        success: false,
        message:
          "Unauthorized photo deletion."
      };

    }


    const photoRef =
      ref(
        storage,
        storagePath
      );


    await deleteObject(
      photoRef
    );


    return {
      success: true,
      message:
        "Profile photo deleted successfully."
    };


  } catch (error) {

    console.error(
      "AYNA BOOK Profile Photo Delete Error:",
      error
    );


    return {
      success: false,
      code: error.code || "",
      message:
        getStorageErrorMessage(error)
    };

  }

}


// =========================================================
// FILE EXTENSION
// =========================================================

function getFileExtension(
  fileName
) {

  const parts =
    fileName.split(".");


  if (parts.length < 2) {
    return "jpg";
  }


  const extension =
    parts.pop()
      .toLowerCase();


  const allowed = [
    "jpg",
    "jpeg",
    "png",
    "webp"
  ];


  if (
    !allowed.includes(extension)
  ) {

    return "jpg";

  }


  return extension;

}


// =========================================================
// STORAGE ERROR MESSAGE
// =========================================================

function getStorageErrorMessage(
  error
) {

  switch (error?.code) {

    case "storage/unauthorized":
      return (
        "Photo upload permission denied. " +
        "Please check Firebase Storage Rules."
      );

    case "storage/canceled":
      return "Photo upload was canceled.";

    case "storage/quota-exceeded":
      return "Firebase Storage quota has been exceeded.";

    case "storage/retry-limit-exceeded":
      return "Upload retry limit exceeded. Please try again.";

    case "storage/network-request-failed":
      return (
        "Network error. Please check your internet connection."
      );

    case "storage/object-not-found":
      return "Photo file was not found.";

    default:
      return (
        error?.message ||
        "Unable to upload profile photo."
      );

  }

}


// =========================================================
// EXPORT
// =========================================================

export {
  storage
};