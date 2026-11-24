import { auth, database } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

const $ = (id) => document.getElementById(id);

const CURRENCY_META = {
  BDT: { symbol: "৳", label: "বাংলাদেশ (BDT)", fallbackRate: 1 },
  SAR: { symbol: "SAR ", label: "সৌদি আরব (SAR)", fallbackRate: 0.031 },
  AED: { symbol: "AED ", label: "সংযুক্ত আরব আমিরাত (AED)", fallbackRate: 0.0305 },
  GBP: { symbol: "£", label: "যুক্তরাজ্য (GBP)", fallbackRate: 0.0065 },
  USD: { symbol: "$", label: "যুক্তরাষ্ট্র (USD)", fallbackRate: 0.0083 },
  INR: { symbol: "₹", label: "ভারত (INR)", fallbackRate: 0.70 }
};

// নিত্যপ্রয়োজনীয় মুদি পণ্যের দৈনিক ভিত্তি তালিকা (BDT ভিত্তিক)
const DEFAULT_GROCERY_ITEMS = [
  { id: "g1", emoji: "🍚", category: "চাল ও আটা", name: "মিনিকেট চাল", unit: "প্রতি কেজি", baseBdt: 72, trend: "স্থিতিশীল" },
  { id: "g2", emoji: "🌾", category: "চাল ও আটা", name: "আমন চাল (গুটি স্বর্ণা)", unit: "প্রতি কেজি", baseBdt: 54, trend: "কমেছে ▼" },
  { id: "g3", emoji: "🥖", category: "চাল ও আটা", name: "প্যাকেট আটা", unit: "প্রতি কেজি", baseBdt: 55, trend: "স্থিতিশীল" },
  { id: "g4", emoji: "🫘", category: "ডাল ও ছোলা", name: "মসুর ডাল (দেশি/মাঝারি)", unit: "প্রতি কেজি", baseBdt: 115, trend: "কমেছে ▼" },
  { id: "g5", emoji: "🟡", category: "ডাল ও ছোলা", name: "ছোলা বুট", unit: "প্রতি কেজি", baseBdt: 95, trend: "স্থিতিশীল" },
  { id: "g6", emoji: "🛢️", category: "তেল ও চিনি", name: "বোতলজাত সয়াবিন তেল", unit: "প্রতি লিটার", baseBdt: 168, trend: "আপডেটেড" },
  { id: "g7", emoji: "🍬", category: "তেল ও চিনি", name: "সাদা চিনি", unit: "প্রতি কেজি", baseBdt: 125, trend: "কমেছে ▼" },
  { id: "g8", emoji: "🧅", category: "পেঁয়াজ ও মসলা", name: "দেশি পেঁয়াজ", unit: "প্রতি কেজি", baseBdt: 105, trend: "আপডেটেড" },
  { id: "g9", emoji: "🧄", category: "পেঁয়াজ ও মসলা", name: "দেশি রসুন", unit: "প্রতি কেজি", baseBdt: 85, trend: "কমেছে ▼" },
  { id: "g10", emoji: "🫚", category: "পেঁয়াজ ও মসলা", name: "আদা (আমদানিকৃত)", unit: "প্রতি কেজি", baseBdt: 140, trend: "স্থিতিশীল" },
  { id: "g11", emoji: "🥚", category: "ডিম, দুধ ও চা", name: "ফার্মের ডিম", unit: "প্রতি ডজন (১২টি)", baseBdt: 144, trend: "স্থিতিশীল" },
  { id: "g12", emoji: "🍵", category: "ডিম, দুধ ও চা", name: "চা পাতা (দানাদার)", unit: "প্রতি ৫০০ গ্রাম", baseBdt: 210, trend: "স্থিতিশীল" }
];

let currentUser = null;
let liveRates = {
  BDT: 1,
  SAR: 0.031,
  AED: 0.0305,
  GBP: 0.0065,
  USD: 0.0083,
  INR: 0.70
};
let customDbItems = [];
let lastRateUpdatedText = "";

function showNotice(msg) {
  const box = $("notice");
  if (!box) return alert(msg);
  box.textContent = msg;
  box.style.display = "block";
  clearTimeout(showNotice.timer);
  showNotice.timer = setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// ==================================================
// AUTO UPDATE EXCHANGE RATES & DAILY CACHE
// ==================================================

async function fetchAutoDailyRates(forceRefresh = false) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const cacheKey = "ayna_grocery_rates_" + todayKey;

  if (!forceRefresh) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && cached.rates) {
        liveRates = { ...liveRates, ...cached.rates };
        lastRateUpdatedText = `আজকের তারিখ: ${new Date().toLocaleDateString("bn-BD")} • দৈনিক মূল্য অটো-আপডেটেড`;
        updateBanner();
        renderGroceryList();
        return;
      }
    } catch (e) {
      console.warn("Cache read skipped", e);
    }
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/BDT");
    const data = await res.json();
    if (data && data.result === "success" && data.rates) {
      liveRates = {
        BDT: 1,
        SAR: data.rates.SAR || liveRates.SAR,
        AED: data.rates.AED || liveRates.AED,
        GBP: data.rates.GBP || liveRates.GBP,
        USD: data.rates.USD || liveRates.USD,
        INR: data.rates.INR || liveRates.INR
      };
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ rates: liveRates, updatedAt: Date.now() })
      );
    }
    lastRateUpdatedText = `আজকের তারিখ: ${new Date().toLocaleDateString("bn-BD")} • লাইভ বাজার ও মুদ্রা হার আপডেটেড`;
  } catch (err) {
    console.warn("Offline fallback rates used:", err);
    lastRateUpdatedText = `আজকের তারিখ: ${new Date().toLocaleDateString("bn-BD")} • স্ট্যান্ডার্ড দৈনিক মূল্য তালিকা`;
  }

  updateBanner();
  renderGroceryList();
}

function updateBanner() {
  const banner = $("autoUpdateBanner");
  if (!banner) return;
  const curCode = $("groceryCountrySelect")?.value || "BDT";
  const meta = CURRENCY_META[curCode] || CURRENCY_META.BDT;
  banner.textContent = `✅ ${lastRateUpdatedText} (${meta.label})`;
}

function formatConvertedPrice(bdtAmount, currencyCode) {
  const rate = liveRates[currencyCode] || CURRENCY_META[currencyCode]?.fallbackRate || 1;
  const meta = CURRENCY_META[currencyCode] || CURRENCY_META.BDT;
  const converted = Number(bdtAmount) * rate;

  if (currencyCode === "BDT") {
    return `${meta.symbol}${Math.round(converted).toLocaleString("bn-BD")}`;
  }
  return `${meta.symbol}${converted.toFixed(2)}`;
}

// ==================================================
// REALTIME DATABASE LISTENER FOR DAILY PRICE UPDATES
// ==================================================

onValue(ref(database, "worldGrocery"), (snap) => {
  const data = snap.val() || {};
  customDbItems = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  renderGroceryList();
});

$("saveGroceryPriceBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showNotice("দৈনিক মূল্য আপডেট করতে আগে লগইন করুন।");
    return;
  }

  const category = $("newGroceryCat")?.value || "চাল ও আটা";
  const emoji = $("newGroceryEmoji")?.value.trim() || "🛒";
  const name = $("newGroceryName")?.value.trim() || "";
  const unit = $("newGroceryUnit")?.value.trim() || "প্রতি কেজি";
  const baseBdt = parseFloat($("newGroceryBdtPrice")?.value || "0");

  if (!name || !baseBdt || baseBdt <= 0) {
    showNotice("অনুগ্রহ করে পণ্যের নাম এবং সঠিক দাম লিখুন।");
    return;
  }

  const itemRef = push(ref(database, "worldGrocery"));
  await set(itemRef, {
    emoji,
    category,
    name,
    unit,
    baseBdt,
    trend: `আপডেট (${new Date().toLocaleDateString("bn-BD")})`,
    uid: currentUser.uid,
    updatedAt: Date.now()
  });

  if ($("newGroceryName")) $("newGroceryName").value = "";
  if ($("newGroceryUnit")) $("newGroceryUnit").value = "";
  if ($("newGroceryBdtPrice")) $("newGroceryBdtPrice").value = "";
  showNotice("নতুন দৈনিক মূল্য বিশ্ব মুদির দোকানে যুক্ত হয়েছে!");
});

// ==================================================
// RENDER GROCERY CARDS
// ==================================================

function renderGroceryList() {
  const grid = $("groceryGrid");
  if (!grid) return;

  const currencyCode = $("groceryCountrySelect")?.value || "BDT";
  const catFilter = $("groceryCategoryFilter")?.value || "ALL";
  const searchQ = ($("grocerySearch")?.value || "").trim().toLowerCase();

  // ডাটাবেজের নতুন আপডেট করা পণ্য ও ডিফল্ট দৈনিক তালিকা একত্র করা
  const mergedMap = new Map();
  DEFAULT_GROCERY_ITEMS.forEach((item) => mergedMap.set(item.name, item));
  customDbItems.forEach((item) => mergedMap.set(item.name, item));

  const items = Array.from(mergedMap.values()).filter((item) => {
    const matchCat = catFilter === "ALL" || item.category === catFilter;
    const matchSearch =
      !searchQ ||
      (item.name && item.name.toLowerCase().includes(searchQ)) ||
      (item.category && item.category.toLowerCase().includes(searchQ));
    return matchCat && matchSearch;
  });

  grid.innerHTML = "";

  if (!items.length) {
    grid.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো মুদি পণ্য পাওয়া যায়নি।</div>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d grocery-card";
    const priceStr = formatConvertedPrice(item.baseBdt, currencyCode);

    card.innerHTML = `
      <div>
        <div class="item-emoji">${escapeHTML(item.emoji || "🛒")}</div>
        <div class="item-cat">${escapeHTML(item.category || "")}</div>
        <div class="item-name">${escapeHTML(item.name)}</div>
        <div class="item-unit">${escapeHTML(item.unit || "")}</div>
      </div>
      <div>
        <div class="item-price">${escapeHTML(priceStr)}</div>
        <div class="item-trend">${escapeHTML(item.trend || "দৈনিক দর")}</div>
      </div>
    `;

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("groceryCountrySelect")?.addEventListener("change", () => {
    updateBanner();
    renderGroceryList();
  });
  $("groceryCategoryFilter")?.addEventListener("change", renderGroceryList);
  $("grocerySearch")?.addEventListener("input", renderGroceryList);
  $("refreshRatesBtn")?.addEventListener("click", () => {
    fetchAutoDailyRates(true);
    showNotice("আজকের বাজার দর ও মুদ্রা হার রিফ্রেশ হয়েছে!");
  });

  fetchAutoDailyRates(false);
});