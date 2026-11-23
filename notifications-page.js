// =========================================================
// AYNA BOOK
// NOTIFICATION PAGE CONTROLLER
// File: notifications-page.js
// Firebase SDK: 13.4.0
// =========================================================

import { auth } from "./app.js";

import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  deleteNotification,
  deleteAllNotifications
} from "./notifications.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const notificationList =
  document.getElementById("notificationList");

const unreadCountElement =
  document.getElementById("unreadCount");

const markAllButton =
  document.getElementById("markAllReadButton");

const deleteAllButton =
  document.getElementById("deleteAllButton");

const refreshButton =
  document.getElementById("refreshButton");

const messageElement =
  document.getElementById("notificationMessage");


// =========================================================
// MESSAGE
// =========================================================

function showMessage(message, type = "info") {

  if (!messageElement) return;

  messageElement.textContent = message;

  messageElement.style.color =
    type === "error" ? "#ff5555" : "#d4af37";

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value = "") {

  return String(value).replace(/[&<>"']/g, char => {

    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];

  });

}


// =========================================================
// NOTIFICATION ICON
// =========================================================

function getNotificationIcon(type) {

  const icons = {
    follow: "👤",
    like: "❤️",
    comment: "💬"
  };

  return icons[type] || "🔔";

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(timestamp) {

  if (!timestamp) return "";

  return new Date(timestamp).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  });

}


// =========================================================
// RENDER NOTIFICATIONS
// =========================================================

function renderNotifications(notifications) {

  if (!notificationList) return;

  notificationList.innerHTML = "";

  if (!notifications.length) {

    notificationList.innerHTML = `
      <div class="empty-notification">
        <div style="font-size:45px;">🔔</div>
        <h3>No Notifications</h3>
        <p>You are all caught up!</p>
      </div>
    `;

    return;

  }

  notifications.forEach(notification => {

    const item = document.createElement("div");

    item.className =
      notification.read
        ? "notification-item read"
        : "notification-item unread";

    const notificationId =
      escapeHTML(notification.notificationId || "");

    const name =
      escapeHTML(notification.fromFullName || "AYNA BOOK User");

    const photoURL =
      notification.fromPhotoURL || "";

    const safePhotoURL =
      /^https?:\/\//i.test(photoURL)
        ? escapeHTML(photoURL)
        : "";

    const message =
      escapeHTML(notification.message || "");

    const icon =
      getNotificationIcon(notification.type);

    const date =
      escapeHTML(formatDate(notification.createdAt));

    item.innerHTML = `

      <div class="notification-avatar">

        ${
          safePhotoURL
            ? `<img src="${safePhotoURL}" alt="Profile photo">`
            : `<span>${icon}</span>`
        }

      </div>

      <div class="notification-content">

        <strong>${name}</strong>

        <p>${message}</p>

        <small>${date}</small>

        <div class="notification-actions">

          ${
            notification.read
              ? ""
              : `<button class="read-button"
                  data-id="${notificationId}">
                  Mark Read
                </button>`
          }

          <button class="delete-button"
            data-id="${notificationId}">
            Delete
          </button>

        </div>

      </div>

      ${
        notification.read
          ? ""
          : `<span class="unread-dot"></span>`
      }

    `;

    notificationList.appendChild(item);

  });

}


// =========================================================
// LOAD UNREAD COUNT
// =========================================================

async function loadUnreadCount() {

  const result =
    await getUnreadNotificationCount();

  if (!result.success) return;

  if (unreadCountElement) {

    unreadCountElement.textContent =
      result.count;

    unreadCountElement.style.display =
      result.count > 0 ? "inline-flex" : "none";

  }

}


// =========================================================
// LOAD NOTIFICATIONS
// =========================================================

export async function loadNotifications() {

  try {

    if (!auth.currentUser) {

      showMessage("Please login first.", "error");

      return;

    }

    showMessage("Loading notifications...");

    const result =
      await getNotifications();

    if (!result.success) {

      showMessage(result.message, "error");

      return;

    }

    renderNotifications(result.notifications);

    await loadUnreadCount();

    showMessage("");

  } catch (error) {

    console.error(error);

    showMessage(
      "Unable to load notifications.",
      "error"
    );

  }

}


// =========================================================
// MARK SINGLE NOTIFICATION READ
// =========================================================

if (notificationList) {

  notificationList.addEventListener("click", async event => {

    const readButton =
      event.target.closest(".read-button");

    const deleteButton =
      event.target.closest(".delete-button");


    // MARK READ

    if (readButton) {

      const id = readButton.dataset.id;

      const result =
        await markNotificationRead(id);

      if (result.success) {

        showMessage("Notification marked as read.");

        await loadNotifications();

      } else {

        showMessage(result.message, "error");

      }

    }


    // DELETE

    if (deleteButton) {

      const id = deleteButton.dataset.id;

      if (!confirm("Delete this notification?")) {
        return;
      }

      const result =
        await deleteNotification(id);

      if (result.success) {

        showMessage("Notification deleted.");

        await loadNotifications();

      } else {

        showMessage(result.message, "error");

      }

    }

  });

}


// =========================================================
// MARK ALL READ
// =========================================================

if (markAllButton) {

  markAllButton.addEventListener("click", async () => {

    const result =
      await markAllNotificationsRead();

    if (result.success) {

      showMessage("All notifications marked as read.");

      await loadNotifications();

    } else {

      showMessage(result.message, "error");

    }

  });

}


// =========================================================
// DELETE ALL
// =========================================================

if (deleteAllButton) {

  deleteAllButton.addEventListener("click", async () => {

    if (!confirm("Delete all notifications?")) {
      return;
    }

    const result =
      await deleteAllNotifications();

    if (result.success) {

      showMessage("All notifications deleted.");

      await loadNotifications();

    } else {

      showMessage(result.message, "error");

    }

  });

}


// =========================================================
// REFRESH
// =========================================================

if (refreshButton) {

  refreshButton.addEventListener("click", () => {

    loadNotifications();

  });

}


// =========================================================
// AUTH STATE
// =========================================================

auth.onAuthStateChanged(user => {

  if (user) {

    loadNotifications();

  } else {

    if (notificationList) {

      notificationList.innerHTML = `
        <p>Please login to see notifications.</p>
      `;

    }

    if (unreadCountElement) {
      unreadCountElement.textContent = "0";
    }

  }

});


// =========================================================
// INITIAL LOAD
// =========================================================

export {
  loadUnreadCount
};