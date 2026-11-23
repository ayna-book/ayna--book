// =========================================================
// AYNA BOOK
// FOLLOW & UNFOLLOW SYSTEM
// File: follow.js
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
// CHECK TARGET USER
// =========================================================

async function checkTargetUser(targetUid) {

  const user = getUser();

  if (!targetUid) {
    throw new Error("Target user ID is required.");
  }

  if (user.uid === targetUid) {
    throw new Error("You cannot follow yourself.");
  }

  const snapshot = await get(
    ref(database, `users/${targetUid}`)
  );

  if (!snapshot.exists()) {
    throw new Error("User profile not found.");
  }

  return user;
}


// =========================================================
// FOLLOW USER
// =========================================================

export async function followUser(targetUid) {

  try {

    const user = await checkTargetUser(targetUid);

    const followingRef = ref(
      database,
      `following/${user.uid}/${targetUid}`
    );

    const followerRef = ref(
      database,
      `followers/${targetUid}/${user.uid}`
    );

    // Write both relationships
    await Promise.all([
      set(followingRef, true),
      set(followerRef, true)
    ]);

    return {
      success: true,
      following: true,
      message: "User followed successfully."
    };

  } catch (error) {

    console.error("Follow User Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// UNFOLLOW USER
// =========================================================

export async function unfollowUser(targetUid) {

  try {

    const user = getUser();

    if (!targetUid) {
      throw new Error("Target user ID is required.");
    }

    if (user.uid === targetUid) {
      throw new Error("Invalid user.");
    }

    const followingRef = ref(
      database,
      `following/${user.uid}/${targetUid}`
    );

    const followerRef = ref(
      database,
      `followers/${targetUid}/${user.uid}`
    );

    await Promise.all([
      remove(followingRef),
      remove(followerRef)
    ]);

    return {
      success: true,
      following: false,
      message: "User unfollowed successfully."
    };

  } catch (error) {

    console.error("Unfollow User Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// TOGGLE FOLLOW
// =========================================================

export async function toggleFollow(targetUid) {

  try {

    const user = await checkTargetUser(targetUid);

    const followingRef = ref(
      database,
      `following/${user.uid}/${targetUid}`
    );

    const snapshot = await get(followingRef);

    if (snapshot.val() === true) {

      return await unfollowUser(targetUid);

    }

    return await followUser(targetUid);

  } catch (error) {

    console.error("Toggle Follow Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// CHECK FOLLOW STATUS
// =========================================================

export async function isFollowing(targetUid) {

  try {

    const user = getUser();

    if (!targetUid) {
      throw new Error("Target user ID is required.");
    }

    const snapshot = await get(
      ref(database, `following/${user.uid}/${targetUid}`)
    );

    return {
      success: true,
      following: snapshot.val() === true
    };

  } catch (error) {

    console.error("Follow Status Error:", error);

    return {
      success: false,
      following: false,
      message: error.message
    };

  }

}


// =========================================================
// GET FOLLOWERS
// =========================================================

export async function getFollowers(uid) {

  try {

    getUser();

    if (!uid) {
      throw new Error("User ID is required.");
    }

    const snapshot = await get(
      ref(database, `followers/${uid}`)
    );

    const followers = snapshot.exists()
      ? Object.keys(snapshot.val())
      : [];

    return {
      success: true,
      followers,
      count: followers.length
    };

  } catch (error) {

    console.error("Get Followers Error:", error);

    return {
      success: false,
      followers: [],
      count: 0,
      message: error.message
    };

  }

}


// =========================================================
// GET FOLLOWING
// =========================================================

export async function getFollowing(uid) {

  try {

    getUser();

    if (!uid) {
      throw new Error("User ID is required.");
    }

    const snapshot = await get(
      ref(database, `following/${uid}`)
    );

    const following = snapshot.exists()
      ? Object.keys(snapshot.val())
      : [];

    return {
      success: true,
      following,
      count: following.length
    };

  } catch (error) {

    console.error("Get Following Error:", error);

    return {
      success: false,
      following: [],
      count: 0,
      message: error.message
    };

  }

}


// =========================================================
// GET FOLLOW COUNTS
// =========================================================

export async function getFollowCounts(uid) {

  try {

    getUser();

    if (!uid) {
      throw new Error("User ID is required.");
    }

    const [followersSnapshot, followingSnapshot] =
      await Promise.all([

        get(ref(database, `followers/${uid}`)),

        get(ref(database, `following/${uid}`))

      ]);

    const followersCount = followersSnapshot.exists()
      ? Object.keys(followersSnapshot.val()).length
      : 0;

    const followingCount = followingSnapshot.exists()
      ? Object.keys(followingSnapshot.val()).length
      : 0;

    return {
      success: true,
      followersCount,
      followingCount
    };

  } catch (error) {

    console.error("Follow Counts Error:", error);

    return {
      success: false,
      followersCount: 0,
      followingCount: 0,
      message: error.message
    };

  }

}


// =========================================================
// EXPORT
// =========================================================

export { database };