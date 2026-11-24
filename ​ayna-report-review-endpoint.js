// =====================================================================
// AYNA BOOK — REPORT REVIEW & FCM ENDPOINT (ayna-report-review-endpoint.js)
// =====================================================================
import express from "express";
import admin from "firebase-admin";
import {
  initAynaAdmin,
  sendPushToUsers
} from "./ayna-admin-reports-fcm.js";

const app = express();
app.use(express.json({ limit: "256kb" }));

const aynaAdmin = initAynaAdmin({
  serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./service-account.json",
  databaseURL:
    process.env.FIREBASE_DATABASE_URL ||
    "https://<YOUR-PROJECT-ID>-default-rtdb.firebaseio.com"
});

const ALLOWED_DECISIONS = new Set(["dismissed", "warned", "removed"]);

async function verifyAdminCaller(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { ok: false, status: 401, error: "Missing Bearer ID token" };
  }

  try {
    const decoded = await admin.auth().verifyIdToken(match[1]);
    const adminSnap = await aynaAdmin.db.ref(`admins/${decoded.uid}`).get();
    if (adminSnap.val() !== true) {
      return { ok: false, status: 403, error: "Caller is not an AYNA BOOK admin" };
    }
    return { ok: true, adminUid: decoded.uid };
  } catch {
    return { ok: false, status: 401, error: "Invalid or expired ID token" };
  }
}

app.post("/api/admin/reports/review", async (req, res) => {
  const caller = await verifyAdminCaller(req);
  if (!caller.ok) {
    return res.status(caller.status).json({ ok: false, error: caller.error });
  }

  const postId = String(req.body?.postId || "").trim();
  const reportId = String(req.body?.reportId || "").trim();
  const decision = String(req.body?.decision || "").trim().toLowerCase();
  const note = String(req.body?.note || "").trim().slice(0, 500);
  const notifyReporter = Boolean(req.body?.notifyReporter);

  if (!postId || !reportId) {
    return res.status(400).json({ ok: false, error: "postId and reportId are required" });
  }
  if (!ALLOWED_DECISIONS.has(decision)) {
    return res.status(400).json({
      ok: false,
      error: "decision must be one of: dismissed, warned, removed"
    });
  }

  try {
    const reportRef = aynaAdmin.db.ref(`postReports/${postId}/${reportId}`);
    const reportSnap = await reportRef.get();
    if (!reportSnap.exists()) {
      return res.status(404).json({ ok: false, error: "Report not found" });
    }

    const reportData = reportSnap.val() || {};
    const reviewedAt = Date.now();

    const postSnap = await aynaAdmin.db.ref(`posts/${postId}`).get();
    const postData = postSnap.exists() ? postSnap.val() || {} : {};
    const authorUid = String(postData.uid || "").trim();
    const reporterUid = String(reportData.reporterUid || "").trim();

    if (decision === "removed" && postSnap.exists()) {
      await aynaAdmin.db.ref(`posts/${postId}`).remove();
    }

    const reviewPayload = {
      status: "reviewed",
      decision,
      note,
      reviewedBy: caller.adminUid,
      reviewedAt
    };
    await reportRef.update(reviewPayload);

    const authorPush = authorUid
      ? await sendPushToUsers(aynaAdmin, {
          targetUids: [authorUid],
          title: "AYNA BOOK — Post Moderation Update",
          body:
            decision === "removed"
              ? "Your post was removed after a community report review."
              : decision === "warned"
                ? "A moderation warning was issued on one of your posts."
                : "A report on your post was reviewed and closed.",
          data: {
            route: "feed",
            postId,
            decision
          }
        })
      : { sentCount: 0, failureCount: 0, prunedCount: 0 };

    const reporterPush =
      notifyReporter && reporterUid
        ? await sendPushToUsers(aynaAdmin, {
            targetUids: [reporterUid],
            title: "AYNA BOOK — Report Reviewed",
            body: `Your report on post ${postId} has been reviewed (${decision}).`,
            data: {
              route: "reports",
              postId,
              reportId,
              decision
            }
          })
        : { sentCount: 0, failureCount: 0, prunedCount: 0 };

    return res.status(200).json({
      ok: true,
      postId,
      reportId,
      decision,
      reviewedAt,
      notifications: {
        author: authorPush,
        reporter: reporterPush
      }
    });
  } catch (err) {
    console.error("Report review endpoint error:", err);
    return res.status(500).json({ ok: false, error: "Failed to review report" });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`AYNA BOOK moderation endpoint listening on port ${port}`);
});