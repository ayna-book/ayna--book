// =========================================================
// AYNA BOOK
// COMMENT SYSTEM
// File: comments.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  app,
  auth
} from "./app.js";

const database = getDatabase(app);


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
// CREATE COMMENT
// =========================================================

export async function createComment(postId, commentData) {

  try {

    const user = getUser();

    if (!postId) {
      throw new Error("Post ID is required.");
    }

    const text = String(commentData?.text || "").trim();

    if (!text) {
      throw new Error("Comment cannot be empty.");
    }

    if (text.length > 1000) {
      throw new Error("Comment must be within 1000 characters.");
    }

    // Verify post exists
    const postSnapshot = await get(
      ref(database, `posts/${postId}`)
    );

    if (!postSnapshot.exists()) {
      throw new Error("Post not found.");
    }

    // Get current user's profile
    const profileSnapshot = await get(
      ref(database, `users/${user.uid}`)
    );

    if (!profileSnapshot.exists()) {
      throw new Error("User profile not found.");
    }

    const profile = profileSnapshot.val();

    const commentRef = push(
      ref(database, `comments/${postId}`)
    );

    const comment = {

      commentId: commentRef.key,

      postId: postId,

      uid: user.uid,

      aynaId: profile.aynaId,

      fullName: profile.fullName,

      photoURL: profile.photoURL || "",

      text: text,

      createdAt: Date.now()

    };

    await set(commentRef, comment);

    return {
      success: true,
      commentId: commentRef.key,
      message: "Comment added successfully."
    };

  } catch (error) {

    console.error("Create Comment Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// GET COMMENTS
// =========================================================

export async function getComments(postId) {

  try {

    getUser();

    if (!postId) {
      throw new Error("Post ID is required.");
    }

    const commentsRef = query(
      ref(database, `comments/${postId}`),
      orderByChild("createdAt")
    );

    const snapshot = await get(commentsRef);

    const comments = [];

    if (snapshot.exists()) {

      snapshot.forEach((child) => {

        comments.push(child.val());

      });

    }

    comments.sort(
      (a, b) => a.createdAt - b.createdAt
    );

    return {
      success: true,
      comments
    };

  } catch (error) {

    console.error("Get Comments Error:", error);

    return {
      success: false,
      comments: [],
      message: error.message
    };

  }

}


// =========================================================
// UPDATE COMMENT
// =========================================================

export async function updateComment(
  postId,
  commentId,
  newText
) {

  try {

    const user = getUser();

    const text = String(newText || "").trim();

    if (!postId || !commentId) {
      throw new Error("Post ID and Comment ID are required.");
    }

    if (!text || text.length > 1000) {
      throw new Error("Comment must contain 1–1000 characters.");
    }

    const commentRef = ref(
      database,
      `comments/${postId}/${commentId}`
    );

    const snapshot = await get(commentRef);

    if (!snapshot.exists()) {
      throw new Error("Comment not found.");
    }

    const comment = snapshot.val();

    if (comment.uid !== user.uid) {
      throw new Error("You cannot edit this comment.");
    }

    await update(commentRef, {
      text: text,
      updatedAt: Date.now()
    });

    return {
      success: true,
      message: "Comment updated successfully."
    };

  } catch (error) {

    console.error("Update Comment Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// DELETE COMMENT
// =========================================================

export async function deleteComment(
  postId,
  commentId
) {

  try {

    const user = getUser();

    if (!postId || !commentId) {
      throw new Error("Post ID and Comment ID are required.");
    }

    const commentRef = ref(
      database,
      `comments/${postId}/${commentId}`
    );

    const snapshot = await get(commentRef);

    if (!snapshot.exists()) {
      throw new Error("Comment not found.");
    }

    const comment = snapshot.val();

    if (comment.uid !== user.uid) {
      throw new Error("You cannot delete this comment.");
    }

    await remove(commentRef);

    return {
      success: true,
      message: "Comment deleted successfully."
    };

  } catch (error) {

    console.error("Delete Comment Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// GET COMMENT COUNT
// =========================================================

export async function getCommentCount(postId) {

  try {

    const snapshot = await get(
      ref(database, `comments/${postId}`)
    );

    const count = snapshot.exists()
      ? Object.keys(snapshot.val()).length
      : 0;

    return {
      success: true,
      count
    };

  } catch (error) {

    console.error("Comment Count Error:", error);

    return {
      success: false,
      count: 0,
      message: error.message
    };

  }

}


// =========================================================
// EXPORT
// =========================================================

export { database };