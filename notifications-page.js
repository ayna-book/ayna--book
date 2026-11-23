
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

const notificationList = document.getElementById("notificationList");
const unreadCountElement = document.getElementById("unreadCount");
const markAllButton = document.getElementById("markAllReadButton");
const deleteAllButton = document.getElementById("deleteAllButton");
const refreshButton = document.getElementById("refreshButton");
const messageElement = document.getElementById("notificationMessage");

function showMessage(message, type = "info") {
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.style.color =
    type === "error" ? "#ff5555" : "#d4af37";
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getNotificationIcon(type) {
  return ({
    follow: "👤",
    like: "❤️",
    comment: "💬"
  })[type] || "🔔";
}

function formatDate(timestamp) {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

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

    item.className = notification.read
      ? "notification-item read"
      : "notification-item unread";

    const id = escapeHTML(notification.notificationId || "");
    const name = escapeHTML(
      notification.fromFullName || "AYNA BOOK User"
    );
    const message = escapeHTML(notification.message || "");
    const date = escapeHTML(formatDate(notification.createdAt));
    const icon = getNotificationIcon(notification.type);

    const photoURL =
      typeof notification.fromPhotoURL === "string"
        ? notification.fromPhotoURL
        : "";

    const safePhotoURL = /^https:\/\//i.test(photoURL)
      ? escapeHTML(photoURL)
      : "";

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
              : `<button type="button"
                   class="read-button"
                   data-id="${id}">
                   Mark Read
                 </button>`
          }

          <button type="button"
            class="delete-button"
            data-id="${id}">
            Delete
          </button>
        </div>
      </div>

      ${
        notification.read
          ? ""
          : '<span class="unread-dot"></span>'
      }
    `;

    notificationList.appendChild(item);
  });
}

async function loadUnreadCount() {
  const result = await getUnreadNotificationCount();

  if (!result.success) return;

  if (unreadCountElement) {
    unreadCountElement.textContent = String(result.count);

    unreadCountElement.style.display =
      result.count > 0 ? "inline-flex" : "none";
  }
}

export async function loadNotifications() {
  if (!auth.currentUser) {
    showMessage("Please login first.", "error");

    if (notificationList) {
      notificationList.textContent =
        "Please login to see notifications.";
    }

    return;
  }

  try {
    showMessage("Loading notifications...");

    const result = await getNotifications();

    if (!result.success) {
      showMessage(
        result.message || "Unable to load notifications.",
        "error"
      );
      return;
    }

    renderNotifications(result.notifications || []);

    await loadUnreadCount();

    showMessage("");

  } catch (error) {
    console.error("Load notifications error:", error);
    showMessage("Unable to load notifications.", "error");
  }
}

// MARK READ AND DELETE
if (notificationList) {
  notificationList.addEventListener("click", async event => {
    const readButton = event.target.closest(".read-button");
    const deleteButton = event.target.closest(".delete-button");

    try {
      if (readButton) {
        const result = await markNotificationRead(
          readButton.dataset.id
        );

        if (!result.success) throw new Error(result.message);

        showMessage("Notification marked as read.");
        await loadNotifications();
      }

      if (deleteButton) {
        if (!confirm("Delete this notification?")) return;

        const result = await deleteNotification(
          deleteButton.dataset.id
        );

        if (!result.success) throw new Error(result.message);

        showMessage("Notification deleted.");
        await loadNotifications();
      }

    } catch (error) {
      console.error(error);
      showMessage(error.message || "Action failed.", "error");
    }
  });
}

// MARK ALL READ
if (markAllButton) {
  markAllButton.addEventListener("click", async () => {
    try {
      const result = await markAllNotificationsRead();

      if (!result.success) throw new Error(result.message);

      showMessage("All notifications marked as read.");
      await loadNotifications();

    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

// DELETE ALL
if (deleteAllButton) {
  deleteAllButton.addEventListener("click", async () => {
    if (!confirm("Delete all notifications?")) return;

    try {
      const result = await deleteAllNotifications();

      if (!result.success) throw new Error(result.message);

      showMessage("All notifications deleted.");
      await loadNotifications();

    } catch (error) {
      showMessage(error.message, "error");
    }
  });
}

// REFRESH
if (refreshButton) {
  refreshButton.addEventListener("click", loadNotifications);
}

// AUTH STATE
auth.onAuthStateChanged(user => {
  if (user) {
    loadNotifications();
  } else {
    if (notificationList) {
      notificationList.textContent =
        "Please login to see notifications.";
    }

    if (unreadCountElement) {
      unreadCountElement.textContent = "0";
      unreadCountElement.style.display = "none";
    }
  }
});

export { loadUnreadCount };
