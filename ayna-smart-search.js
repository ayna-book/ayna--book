// =====================================================================
// AYNA BOOK — SMART SEARCH & EXPORT/IMPORT ENGINE (ayna-smart-search.js)
// =====================================================================

export function smartTokenSearch(items = [], query = "", fields = []) {
  const cleanQuery = String(query || "").trim().toLowerCase();
  if (!cleanQuery) return items;

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  return items.filter(item => {
    const haystack = (
      fields.length
        ? fields.map(key => String(item?.[key] ?? "")).join(" ")
        : typeof item === "string"
          ? item
          : JSON.stringify(item || {})
    ).toLowerCase();

    return tokens.every(token => haystack.includes(token));
  });
}

export function downloadAsJson(filename = "ayna-export.json", data = {}) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadArrayAsCsv(filename = "ayna-export.csv", rows = []) {
  if (!Array.isArray(rows) || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const escapeCsv = val => `"${String(val ?? "").replace(/"/g, '""')}"`;

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map(row => headers.map(h => escapeCsv(row[h])).join(","))
  ];

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("কোনো ফাইল নির্বাচন করা হয়নি"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result || "null")));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}