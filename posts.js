
// =========================================================
// AYNA BOOK
// POST SYSTEM CONTROLLER
// File: posts.js
// Firebase SDK: 13.4.0
// Database: Realtime Database
// =========================================================

import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  limitToLast
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  app,
  auth,
  database,
  authReady
} from "./app.js";

// =========================================================
// CURRENT USER
// =========================================================

function getUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return user;
}

// =========================================================
// CREATE POST
// =========================================================

export async function createPost(postData = {}) {
  try {
    await authReady;

    const user = getUser();

    const text = String(postData.text || "").trim();
    const imageURL = String(postData.imageURL || "").trim();
    const videoURL = String(postData.videoURL || "").trim();

    if (!text && !imageURL && !videoURL) {
      throw new Error("Write something or select a photo/video.");
    }

    const postRef = push(ref(database, "posts"));
    const now = Date.now();

    const post = {
      postId: postRef.key,
      uid: user.uid,

      aynaId: String(postData.aynaId || ""),
      fullName: String(postData.fullName || user.displayName || ""),
      photoURL: String(postData.photoURL || user.photoURL || ""),

      text,
      imageURL,
      imagePath: String(postData.imagePath || ""),
      videoURL,
      videoPath: String(postData.videoPath || ""),

      type: videoURL ? "video" : imageURL ? "image" : "text",

      createdAt: now,
      updatedAt: now
    };

    await set(postRef, post);

    return {
      success: true,
      postId: postRef.key,
      message: "Post published successfully."
    };

  } catch (error) {
    console.error("Create Post Error:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

// =========================================================
// GET ALL POSTS
// =========================================================

export async function getAllPosts(maxPosts = 100) {
  try {
    await authReady;
    getUser();

    const safeLimit = Math.min(
      Math.max(Number(maxPosts) || 100, 1),
      200
    );

    const postsQuery = query(
      ref(database, "posts"),
      orderByChild("createdAt"),
      limitToLast(safeLimit)
    );

    const snapshot = await get(postsQuery);

    const posts = [];

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        posts.push(child.val());
      });
    }

    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return {
      success: true,
      posts
    };

  } catch (error) {
    console.error("Get Posts Error:", error);

    return {
      success: false,
      posts: [],
      message: error.message
    };
  }
}

// =========================================================
// GET MY POSTS
// =========================================================

export async function getMyPosts() {
  try {
    await authReady;

    const user = getUser();

    const postsQuery = query(
      ref(database, "posts"),
      orderByChild("uid"),
      equalTo(user.uid)
    );

    const snapshot = await get(postsQuery);
    const posts = [];

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        posts.push(child.val());
      });
    }

    posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return {
      success: true,
      posts
    };

  } catch (error) {
    console.error("Get My Posts Error:", error);

    return {
      success: false,
      posts: [],
      message: error.message
    };
  }
}

// =========================================================
// UPDATE POST
// =========================================================

export async function updatePost(postId, updates = {}) {
  try {
    await authReady;

    const user = getUser();

    if (!postId) {
      throw new Error("Post ID is required.");
    }

    const postRef = ref(database, `posts/${postId}`);
    const snapshot = await get(postRef);

    if (!snapshot.exists()) {
      throw new Error("Post not found.");
    }

    const post = snapshot.val();

    if (post.uid !== user.uid) {
      throw new Error("You cannot edit this post.");
    }

    const allowedUpdates = {};

    if (typeof updates.text === "string") {
      allowedUpdates.text = updates.text.trim();
    }

    if (typeof updates.imageURL === "string") {
      allowedUpdates.imageURL = updates.imageURL.trim();
    }

    if (typeof updates.imagePath === "string") {
      allowedUpdates.imagePath = updates.imagePath;
    }

    if (typeof updates.videoURL === "string") {
      allowedUpdates.videoURL = updates.videoURL.trim();
    }

    if (typeof updates.videoPath === "string") {
      allowedUpdates.videoPath = updates.videoPath;
    }

    const finalText =
      allowedUpdates.text ?? post.text ?? "";

    const finalImage =
      allowedUpdates.imageURL ?? post.imageURL ?? "";

    const finalVideo =
      allowedUpdates.videoURL ?? post.videoURL ?? "";

    if (!finalText && !finalImage && !finalVideo) {
      throw new Error("Post cannot be empty.");
    }

    if (finalVideo) {
      allowedUpdates.type = "video";
    } else if (finalImage) {
      allowedUpdates.type = "image";
    } else {
      allowedUpdates.type = "text";
    }

    allowedUpdates.updatedAt = Date.now();

    await update(postRef, allowedUpdates);

    return {
      success: true,
      message: "Post updated successfully."
    };

  } catch (error) {
    console.error("Update Post Error:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

// =========================================================
// DELETE POST
// =========================================================

export async function deletePost(postId) {
  try {
    await authReady;

    const user = getUser();

    if (!postId) {
      throw new Error("Post ID is required.");
    }

    const postRef = ref(database, `posts/${postId}`);
    const snapshot = await get(postRef);

    if (!snapshot.exists()) {
      throw new Error("Post not found.");
    }

    const post = snapshot.val();

    if (post.uid !== user.uid) {
      throw new Error("You cannot delete this post.");
    }

    await remove(postRef);

    return {
      success: true,
      message: "Post deleted successfully."
    };

  } catch (error) {
    console.error("Delete Post Error:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

// =========================================================
// EXPORT
// =========================================================

export { app, auth, database };
