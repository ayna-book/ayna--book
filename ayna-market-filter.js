// =====================================================================
// AYNA BOOK — MARKET & GROCERY MULTI-FILTER (ayna-market-filter.js)
// =====================================================================

export function extractNumericPrice(priceText = "") {
  const digits = String(priceText || "").replace(/[^\d.]/g, "");
  const num = Number(digits);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function filterMarketItems(items = [], options = {}) {
  const {
    query = "",
    condition = "all",
    maxPrice = null
  } = options;

  const q = String(query || "").trim().toLowerCase();
  const limitNum = Number(maxPrice);
  const hasMaxPrice = Number.isFinite(limitNum) && limitNum > 0;

  return items.filter(item => {
    const condMatch = condition === "all" || item?.cond === condition;
    if (!condMatch) return false;

    if (q) {
      const title = String(item?.title || item?.name || "").toLowerCase();
      const priceStr = String(item?.price || item?.brand || "").toLowerCase();
      const extraStr = String(item?.extra || item?.quantity || "").toLowerCase();
      if (!title.includes(q) && !priceStr.includes(q) && !extraStr.includes(q)) {
        return false;
      }
    }

    if (hasMaxPrice) {
      const numeric = extractNumericPrice(item?.price);
      if (numeric !== null && numeric > limitNum) {
        return false;
      }
    }

    return true;
  });
}