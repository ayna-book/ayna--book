// =========================================================
// AYNA BOOK
// LIKE SYSTEM
// File: likes.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  getDatabase,
  ref,
  get,
  set,
  remove,
  runTransaction
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  app,
  auth
} from "./app.js";

const database = getDatabase(app);


// =========================================================
// CHECK CURRENT USER
// =========================================================

function getUser() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return user;

}


// =========================================================
// LIKE POST
// =========================================================

export async function likePost(postId) {

  try {

    const user = getUser();

    if (!postId) {
      throw new Error("Post ID is required.");
    }

    // Check post exists
    const postSnapshot = await get(
      ref(database, `posts/${postId}`)
    );

    if (!postSnapshot.exists()) {
      throw new Error("Post not found.");
    }

    const likeRef = ref(
      database,
      `likes/${postId}/${user.uid}`
    );

    await set(likeRef, true);

    return {
      success: true,
      liked: true,
      message: "Post liked successfully."
    };

  } catch (error) {

    console.error("Like Post Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// UNLIKE POST
// =========================================================

export async function unlikePost(postId) {

  try {

    const user = getUser();

    if (!postId) {
      throw new Error("Post ID is required.");
    }

    const likeRef = ref(
      database,
      `likes/${postId}/${user.uid}`
    );

    await remove(likeRef);

    return {
      success: true,
      liked: false,
      message: "Post unliked successfully."
    };

  } catch (error) {

    console.error("Unlike Post Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// TOGGLE LIKE
// =========================================================

export async function toggleLike(postId) {

  try {

    const user = getUser();

    if (!postId) {
      throw new Error("Post ID is required.");
    }

    const postSnapshot = await get(
      ref(database, `posts/${postId}`)
    );

    if (!postSnapshot.exists()) {
      throw new Error("Post not found.");
    }

    const likeRef = ref(
      database,
      `likes/${postId}/${user.uid}`
    );

    const result = await runTransaction(
      likeRef,
      (currentValue) => {
        return currentValue === true ? null : true;
      }
    );

    return {
      success: true,
      liked: result.snapshot.val() === true,
      message: result.snapshot.val() === true
        ? "Post liked successfully."
        : "Post unliked successfully."
    };

  } catch (error) {

    console.error("Toggle Like Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// CHECK IF USER LIKED POST
// =========================================================

export async function hasLikedPost(postId) {

  try {

    const user = getUser();

    const snapshot = await get(
      ref(database, `likes/${postId}/${user.uid}`)
    );

    return {
      success: true,
      liked: snapshot.val() === true
    };

  } catch (error) {

    console.error("Check Like Error:", error);

    return {
      success: false,
      liked: false,
      message: error.message
    };

  }

}


// =========================================================
// GET POST LIKE COUNT
// =========================================================

export async function getLikeCount(postId) {

  try {

    const snapshot = await get(
      ref(database, `likes/${postId}`)
    );

    if (!snapshot.exists()) {
      return {
        success: true,
        count: 0
      };
    }

    const count = Object.keys(snapshot.val()).length;

    return {
      success: true,
      count
    };

  } catch (error) {

    console.error("Like Count Error:", error);

    return {
      success: false,
      count: 0,
      message: error.message
    };

  }

}


// =========================================================
// GET LIKED USERS
// =========================================================

export async function getLikedUsers(postId) {

  try {

    const snapshot = await get(
      ref(database, `likes/${postId}`)
    );

    if (!snapshot.exists()) {
      return {
        success: true,
        users: []
      };
    }

    const users = Object.keys(snapshot.val());

    return {
      success: true,
      users
    };

  } catch (error) {

    console.error("Liked Users Error:", error);

    return {
      success: false,
      users: [],
      message: error.message
    };

  }

}


// =========================================================
// EXPORT DATABASE
// =========================================================

export { database };