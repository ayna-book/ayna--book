// =====================================================================
// AYNA BOOK — BOOKMARKS, REACTIONS & FEED SEARCH (ayna-bookmarks-reactions.js)
// =====================================================================

const BOOKMARKS_KEY = "ayna_saved_bookmarks_v1";

export function getSavedPostIds() {
  try {
    const raw = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function toggleBookmarkPost(postId) {
  if (!postId) return [];
  const current = new Set(getSavedPostIds());
  if (current.has(postId)) {
    current.delete(postId);
  } else {
    current.add(postId);
  }
  const updated = Array.from(current);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
}

export function isPostBookmarked(postId) {
  return getSavedPostIds().includes(postId);
}

export async function setPostReaction(database, postId, uid, reactionType = "helpful") {
  if (!database || !postId || !uid) return;
  const { ref, set } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
  const reactionRef = ref(database, `posts/${postId}/reactions/${reactionType}/${uid}`);
  await set(reactionRef, true);
}

export function filterPostsByText(posts = [], searchQuery = "") {
  const q = String(searchQuery || "").trim().toLowerCase();
  if (!q) return posts;
  return posts.filter(post => {
    const author = String(post?.authorName || "").toLowerCase();
    const content = String(post?.text || "").toLowerCase();
    const fileName = String(post?.fileName || "").toLowerCase();
    return author.includes(q) || content.includes(q) || fileName.includes(q);
  });
}