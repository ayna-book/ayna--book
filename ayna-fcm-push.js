// =====================================================================
// AYNA BOOK — FCM PUSH NOTIFICATION TOKEN REGISTER (ayna-fcm-push.js)
// =====================================================================

export async function registerAynaPushToken(appInstance, database, uid, vapidKey = "") {
  if (!("Notification" in window)) {
    return { ok: false, reason: "Notification API supported nahi" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Notification permission deya hoyni" };
  }

  try {
    const [{ getMessaging, getToken }, { ref, set }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-messaging.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js")
    ]);

    const messaging = getMessaging(appInstance);
    const tokenOptions = vapidKey ? { vapidKey } : undefined;
    const fcmToken = await getToken(messaging, tokenOptions);

    if (!fcmToken) {
      return { ok: false, reason: "FCM token paoa jayni" };
    }

    if (database && uid) {
      const safeTokenKey = fcmToken.replace(/[.#$/[\]]/g, "_");
      await set(ref(database, `fcmTokens/${uid}/${safeTokenKey}`), {
        token: fcmToken,
        platform: "web",
        updatedAt: Date.now()
      });
    }

    return { ok: true, token: fcmToken };
  } catch (err) {
    console.error("FCM error:", err);
    return { ok: false, reason: err?.message || "FCM registration failed" };
  }
}