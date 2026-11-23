// =========================================================
// AYNA BOOK
// POST SYSTEM CONTROLLER
// File: posts.js
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
  orderByChild,
  equalTo
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
// CREATE POST
// =========================================================

export async function createPost(postData) {

  try {

    const user = getUser();

    const postRef = push(ref(database, "posts"));

    const post = {

      postId: postRef.key,

      uid: user.uid,

      aynaId: postData.aynaId,

      fullName: postData.fullName,

      photoURL: postData.photoURL || "",

      text: postData.text || "",

      imageURL: postData.imageURL || "",

      imagePath: postData.imagePath || "",

      createdAt: Date.now(),

      updatedAt: Date.now()

    };

    if (!post.text.trim() && !post.imageURL) {
      return {
        success: false,
        message: "Write something or select a photo."
      };
    }

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

export async function getAllPosts() {

  try {

    const user = getUser();

    const postsRef = ref(database, "posts");

    const snapshot = await get(postsRef);

    if (!snapshot.exists()) {
      return {
        success: true,
        posts: []
      };
    }

    const posts = [];

    snapshot.forEach((child) => {

      const post = child.val();

      posts.push(post);

    });

    posts.sort((a, b) => b.createdAt - a.createdAt);

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

    const user = getUser();

    const postsRef = query(
      ref(database, "posts"),
      orderByChild("uid"),
      equalTo(user.uid)
    );

    const snapshot = await get(postsRef);

    const posts = [];

    if (snapshot.exists()) {

      snapshot.forEach((child) => {
        posts.push(child.val());
      });

    }

    posts.sort((a, b) => b.createdAt - a.createdAt);

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

export async function updatePost(postId, updates) {

  try {

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
      allowedUpdates.imageURL = updates.imageURL;
    }

    if (typeof updates.imagePath === "string") {
      allowedUpdates.imagePath = updates.imagePath;
    }

    if (!allowedUpdates.text && !allowedUpdates.imageURL) {
      throw new Error("Post cannot be empty.");
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

export { database };