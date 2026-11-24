// =====================================================================
// AYNA BOOK — MODERATION REVIEW CLIENT (ayna-report-review-client.js)
// =====================================================================

export async function resolveAynaFirebase() {
  const [initMod, jsFbMod, authMod, rtdbMod] = await Promise.all([
    import("./firebase-init.js").catch(() => null),
    import("./js/firebase.js").catch(() => null),
    import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js")
  ]);

  const auth = initMod?.auth || jsFbMod?.auth || authMod.getAuth();
  const database = initMod?.database || jsFbMod?.database || rtdbMod.getDatabase();

  return { auth, database, authMod, rtdbMod };
}

export async function resolveAynaAuth() {
  const { auth } = await resolveAynaFirebase();
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("Please sign in first to review reports.");
  }
  return { auth, user };
}

export async function isCurrentUserAdmin() {
  try {
    const { auth, database, rtdbMod } = await resolveAynaFirebase();
    const user = auth?.currentUser;
    if (!user?.uid || !database) {
      return false;
    }

    const adminSnap = await rtdbMod.get(rtdbMod.ref(database, `admins/${user.uid}`));
    return adminSnap.val() === true;
  } catch {
    return false;
  }
}

export async function submitModerationReview({
  postId,
  reportId,
  decision,
  note = "",
  notifyReporter = false,
  apiBaseUrl = ""
}) {
  const cleanPostId = String(postId || "").trim();
  const cleanReportId = String(reportId || "").trim();
  const cleanDecision = String(decision || "").trim().toLowerCase();
  const cleanNote = String(note || "").trim().slice(0, 500);

  if (!cleanPostId || !cleanReportId) {
    throw new Error("Both Post ID and Report ID are required.");
  }
  if (!["dismissed", "warned", "removed"].includes(cleanDecision)) {
    throw new Error("Decision must be dismissed, warned, or removed.");
  }

  const { user } = await resolveAynaAuth();
  const idToken = await user.getIdToken();

  const base = String(apiBaseUrl || "").replace(/\/+$/, "");
  const endpoint = `${base}/api/admin/reports/review`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({
      postId: cleanPostId,
      reportId: cleanReportId,
      decision: cleanDecision,
      note: cleanNote,
      notifyReporter: Boolean(notifyReporter)
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || `Review request failed (${response.status})`);
  }

  return payload;
}