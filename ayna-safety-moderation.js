// =====================================================================
// AYNA BOOK — USER BLOCK/MUTE & POST REPORT (ayna-safety-moderation.js)
// =====================================================================

const BLOCKED_USERS_KEY = "ayna_blocked_users_v1";

export function getBlockedUserIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(BLOCKED_USERS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function blockUserLocally(targetUid) {
  if (!targetUid) return [];
  const setIds = new Set(getBlockedUserIds());
  setIds.add(targetUid);
  const list = Array.from(setIds);
  localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(list));
  return list;
}

export function unblockUserLocally(targetUid) {
  const list = getBlockedUserIds().filter(id => id !== targetUid);
  localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(list));
  return list;
}

export function filterOutBlockedUsers(posts = []) {
  const blocked = new Set(getBlockedUserIds());
  if (!blocked.size) return posts;
  return posts.filter(post => !blocked.has(post?.uid));
}

export async function submitPostReport(database, reporterUid, postId, reason = "অনুপযুক্ত কনটেন্ট") {
  if (!database || !reporterUid || !postId) return false;
  const { ref, push, set } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
  const reportRef = push(ref(database, `postReports/${postId}`));
  await set(reportRef, {
    reporterUid,
    postId,
    reason: String(reason || "").trim() || "অনুপযুক্ত কনটেন্ট",
    createdAt: Date.now()
  });
  return true;
}