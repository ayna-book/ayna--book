// =========================================================
// AYNA BOOK
// NOTIFICATION SYSTEM
// File: notifications.js
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
// CREATE NOTIFICATION
// =========================================================

export async function createNotification(data) {

  try {

    const user = getUser();

    const targetUid = data?.targetUid;
    const type = data?.type;
    const message = String(data?.message || "").trim();

    const allowedTypes = [
      "follow",
      "like",
      "comment"
    ];

    if (!targetUid || !allowedTypes.includes(type)) {
      throw new Error("Invalid notification information.");
    }

    if (targetUid === user.uid) {
      return {
        success: true,
        skipped: true,
        message: "Self notification skipped."
      };
    }

    if (!message || message.length > 300) {
      throw new Error("Notification message is invalid.");
    }

    // Get sender profile
    const profileSnapshot = await get(
      ref(database, `users/${user.uid}`)
    );

    if (!profileSnapshot.exists()) {
      throw new Error("Sender profile not found.");
    }

    const profile = profileSnapshot.val();

    const notificationRef = push(
      ref(database, `notifications/${targetUid}`)
    );

    const notification = {

      notificationId: notificationRef.key,

      type: type,

      fromUid: user.uid,

      fromAynaId: profile.aynaId,

      fromFullName: profile.fullName,

      fromPhotoURL: profile.photoURL || "",

      postId: data.postId || "",

      message: message,

      createdAt: Date.now(),

      read: false

    };

    await set(notificationRef, notification);

    return {
      success: true,
      notificationId: notificationRef.key,
      message: "Notification created successfully."
    };

  } catch (error) {

    console.error("Create Notification Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// GET NOTIFICATIONS
// =========================================================

export async function getNotifications() {

  try {

    const user = getUser();

    const notificationsRef = query(
      ref(database, `notifications/${user.uid}`),
      orderByChild("createdAt")
    );

    const snapshot = await get(notificationsRef);

    const notifications = [];

    if (snapshot.exists()) {

      snapshot.forEach((child) => {
        notifications.push(child.val());
      });

    }

    notifications.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    return {
      success: true,
      notifications,
      count: notifications.length
    };

  } catch (error) {

    console.error("Get Notifications Error:", error);

    return {
      success: false,
      notifications: [],
      count: 0,
      message: error.message
    };

  }

}


// =========================================================
// MARK AS READ
// =========================================================

export async function markNotificationRead(notificationId) {

  try {

    const user = getUser();

    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }

    const notificationRef = ref(
      database,
      `notifications/${user.uid}/${notificationId}`
    );

    const snapshot = await get(notificationRef);

    if (!snapshot.exists()) {
      throw new Error("Notification not found.");
    }

    await update(notificationRef, {
      read: true
    });

    return {
      success: true,
      message: "Notification marked as read."
    };

  } catch (error) {

    console.error("Mark Read Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// MARK ALL AS READ
// =========================================================

export async function markAllNotificationsRead() {

  try {

    const user = getUser();

    const snapshot = await get(
      ref(database, `notifications/${user.uid}`)
    );

    if (!snapshot.exists()) {
      return {
        success: true,
        message: "No notifications found."
      };
    }

    const updates = {};

    snapshot.forEach((child) => {

      if (child.val().read !== true) {
        updates[`${child.key}/read`] = true;
      }

    });

    if (Object.keys(updates).length > 0) {

      await update(
        ref(database, `notifications/${user.uid}`),
        updates
      );

    }

    return {
      success: true,
      message: "All notifications marked as read."
    };

  } catch (error) {

    console.error("Mark All Read Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// GET UNREAD COUNT
// =========================================================

export async function getUnreadNotificationCount() {

  try {

    const user = getUser();

    const snapshot = await get(
      ref(database, `notifications/${user.uid}`)
    );

    let count = 0;

    if (snapshot.exists()) {

      snapshot.forEach((child) => {

        if (child.val().read !== true) {
          count++;
        }

      });

    }

    return {
      success: true,
      count
    };

  } catch (error) {

    console.error("Unread Count Error:", error);

    return {
      success: false,
      count: 0,
      message: error.message
    };

  }

}


// =========================================================
// DELETE NOTIFICATION
// =========================================================

export async function deleteNotification(notificationId) {

  try {

    const user = getUser();

    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }

    await remove(
      ref(
        database,
        `notifications/${user.uid}/${notificationId}`
      )
    );

    return {
      success: true,
      message: "Notification deleted successfully."
    };

  } catch (error) {

    console.error("Delete Notification Error:", error);

    return {
      success: false,
      message: error.message
    };

  }

}


// =========================================================
// DELETE ALL NOTIFICATIONS
// =========================================================

export async function deleteAllNotifications() {

  try {

    const user = getUser();

    await remove(
      ref(database, `notifications/${user.uid}`)
    );

    return {
      success: true,
      message: "All notifications deleted."
    };

  } catch (error) {

    console.error("Delete All Notifications Error:", error);

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