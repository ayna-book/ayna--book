// =====================================================================
// AYNA BOOK — GROUP PIN/SEARCH & BDT CURRENCY HELPER (ayna-group-pin-currency.js)
// =====================================================================

const PINNED_KEY = "ayna_pinned_group_msgs_v1";

export function getPinnedMessages() {
  try {
    const raw = JSON.parse(localStorage.getItem(PINNED_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function togglePinMessage(msgItem) {
  if (!msgItem || !msgItem.text) return [];
  const current = getPinnedMessages();
  const existsIndex = current.findIndex(
    m => m.text === msgItem.text && String(m.time || "") === String(msgItem.time || "")
  );

  let updated;
  if (existsIndex >= 0) {
    updated = current.filter((_, idx) => idx !== existsIndex);
  } else {
    updated = [{ ...msgItem, pinnedAt: Date.now() }, ...current];
  }

  localStorage.setItem(PINNED_KEY, JSON.stringify(updated));
  return updated;
}

export function searchGroupMessages(messages = [], query = "") {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return messages;
  return messages.filter(
    m =>
      String(m?.text || "").toLowerCase().includes(q) ||
      String(m?.sender || "").toLowerCase().includes(q)
  );
}

export function formatBdtAmount(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "আলোচনা সাপেক্ষে";
  return `৳${num.toLocaleString("bn-BD")}`;
}