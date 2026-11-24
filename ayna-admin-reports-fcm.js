// =====================================================================
// AYNA BOOK — FIREBASE ADMIN REPORTS & FCM HELPER (ayna-admin-reports-fcm.js)
// =====================================================================
import admin from "firebase-admin";
import fs from "node:fs";

export function initAynaAdmin({ serviceAccountPath, databaseURL }) {
  if (!admin.apps.length) {
    const options = { databaseURL };
    if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      options.credential = admin.credential.cert(serviceAccount);
    } else {
      options.credential = admin.credential.applicationDefault();
    }
    admin.initializeApp(options);
  }
  return {
    db: admin.database(),
    messaging: admin.messaging()
  };
}

export async function listPostReports(db, limit = 50) {
  const snap = await db
    .ref("postReports")
    .orderByKey()
    .limitToLast(limit)
    .once("value");

  const raw = snap.val() || {};
  const reports = [];

  for (const [postId, entries] of Object.entries(raw)) {
    if (!entries || typeof entries !== "object") continue;
    for (const [reportId, detail] of Object.entries(entries)) {
      reports.push({
        postId,
        reportId,
        reporterUid: detail?.reporterUid || "",
        reason: detail?.reason || "",
        createdAt: detail?.createdAt || 0
      });
    }
  }

  return reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function getTokensForUsers(db, targetUids = []) {
  const tokenMap = new Map(); // token -> { uid, tokenKey }

  for (const uid of targetUids) {
    if (!uid) continue;
    const snap = await db.ref(`fcmTokens/${uid}`).once("value");
    const entries = snap.val() || {};
    for (const [tokenKey, rec] of Object.entries(entries)) {
      const token = typeof rec === "string" ? rec : rec?.token;
      if (token && typeof token === "string") {
        tokenMap.set(token, { uid, tokenKey });
      }
    }
  }

  return tokenMap;
}

export async function sendPushToUsers(
  { db, messaging },
  { targetUids = [], title, body, data = {}, pruneInvalidTokens = true }
) {
  const tokenMap = await getTokensForUsers(db, targetUids);
  const tokens = Array.from(tokenMap.keys());

  if (!tokens.length) {
    return { sentCount: 0, failureCount: 0, prunedCount: 0 };
  }

  const stringData = Object.fromEntries(
    Object.entries(data || {}).map(([k, v]) => [String(k), String(v ?? "")])
  );

  const batchResponse = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: String(title || "AYNA BOOK"),
      body: String(body || "")
    },
    data: stringData
  });

  let prunedCount = 0;

  if (pruneInvalidTokens && batchResponse.failureCount > 0) {
    const invalidCodes = new Set([
      "messaging/registration-token-not-registered",
      "messaging/invalid-registration-token"
    ]);

    for (let i = 0; i < batchResponse.responses.length; i++) {
      const resp = batchResponse.responses[i];
      if (!resp.success && invalidCodes.has(resp.error?.code)) {
        const meta = tokenMap.get(tokens[i]);
        if (meta?.uid && meta?.tokenKey) {
          await db.ref(`fcmTokens/${meta.uid}/${meta.tokenKey}`).remove();
          prunedCount += 1;
        }
      }
    }
  }

  return {
    sentCount: batchResponse.successCount,
    failureCount: batchResponse.failureCount,
    prunedCount
  };
}