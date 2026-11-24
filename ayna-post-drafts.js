// =====================================================================
// AYNA BOOK — POST DRAFTS MANAGER (ayna-post-drafts.js)
// =====================================================================

const DRAFTS_STORAGE_KEY = "ayna_post_drafts_v1";

export function getPostDrafts() {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function savePostDraft(draft = {}) {
  const text = String(draft.text || "").trim();
  const category = String(draft.category || "সাধারণ পোস্ট").trim();
  if (!text) return null;

  const list = getPostDrafts();
  const item = {
    id: draft.id || "draft_" + Date.now(),
    text,
    category,
    updatedAt: Date.now()
  };

  const existingIdx = list.findIndex(d => d.id === item.id);
  if (existingIdx >= 0) {
    list[existingIdx] = item;
  } else {
    list.unshift(item);
  }

  localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(list));
  return item;
}

export function deletePostDraft(draftId) {
  if (!draftId) return [];
  const updated = getPostDrafts().filter(d => d.id !== draftId);
  localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}