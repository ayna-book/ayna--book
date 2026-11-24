import { auth, database } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  push,
  set,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// ==================================================
// AYNA BOOK - DAILY WORLD MARKET PRICE LIST (world-market.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const CURRENCY_MAP = {
  BDT: { symbol: "৳", label: "বাংলাদেশ (BDT)", rate: 1 },
  USD: { symbol: "$", label: "যুক্তরাষ্ট্র (USD)", rate: 0.0083 },
  SAR: { symbol: "SAR ", label: "সৌদি আরব (SAR)", rate: 0.031 },
  AED: { symbol: "AED ", label: "সংযুক্ত আরব আমিরাত (AED)", rate: 0.0305 },
  GBP: { symbol: "£", label: "যুক্তরাজ্য (GBP)", rate: 0.0065 },
  INR: { symbol: "₹", label: "ভারত (INR)", rate: 0.70 }
};

// দৈনিক বিশ্ব বাজারের ভিত্তি মূল্যতালিকা (BDT ভিত্তিক, মুদ্রা রূপান্তরসহ)
const DEFAULT_WORLD_MARKET_ITEMS = [
  {
    id: "wm1",
    category: "শস্য ও কৃষি পণ্য",
    region: "বিশ্ববাজার ও বাংলাদেশ",
    name: "গম (আন্তর্জাতিক মান)",
    unit: "প্রতি কেজি",
    baseBdt: 46,
    trend: "দৈনিক দর",
    note: "আন্তর্জাতিক শস্য বাজার ও স্থানীয় আমদানি দরের সাথে সামঞ্জস্যপূর্ণ।"
  },
  {
    id: "wm2",
    category: "নিত্যপ্রয়োজনীয় মুদি ও খাদ্য",
    region: "বিশ্ববাজার ও বাংলাদেশ",
    name: "সয়াবিন ও পাম তেল",
    unit: "প্রতি লিটার",
    baseBdt: 168,
    trend: "দৈনিক দর",
    note: "ভোজ্যতেলের দৈনিক বাজার ও মুদ্রা হার অনুযায়ী রূপান্তরযোগ্য।"
  },
  {
    id: "wm3",
    category: "জ্বালানি ও ধাতু",
    region: "আন্তর্জাতিক বাজার",
    name: "২২ ক্যারেট স্বর্ণ (হিসাব একক)",
    unit: "প্রতি গ্রাম",
    baseBdt: 11200,
    trend: "লাইভ মুদ্রা সিঙ্ক",
    note: "আন্তর্জাতিক বিনিময় হার অনুযায়ী বিভিন্ন মুদ্রায় দেখা যায়।"
  },
  {
    id: "wm4",
    category: "শস্য ও কৃষি পণ্য",
    region: "বাংলাদেশ ও দক্ষিণ এশিয়া",
    name: "মিনিকেট চাল",
    unit: "প্রতি কেজি",
    baseBdt: 72,
    trend: "দৈনিক দর",
    note: "প্রধান খাদ্যশস্যের দৈনিক খুচরা/পাইকারি হিসাব।"
  },
  {
    id: "wm5",
    category: "পোলোট্রি ও প্রাণিসম্পদ",
    region: "বাংলাদেশ ও অঞ্চলভিত্তিক",
    name: "ব্রয়লার মুরগি ও ডিম",
    unit: "ব্রয়লার প্রতি কেজি",
    baseBdt: 175,
    trend: "দৈনিক দর",
    note: "খামার ও বাজার পর্যায়ের দৈনিক পোলোট্রি সূচক।"
  },
  {
    id: "wm6",
    category: "নির্মাণ ও শিল্প উপকরণ",
    region: "দেশীয় ও বিশ্ববাজার",
    name: "সিমেন্ট (৫০ কেজি ব্যাগ)",
    unit: "প্রতি ব্যাগ",
    baseBdt: 540,
    trend: "দৈনিক দর",
    note: "নির্মাণ সামগ্রীর দৈনিক বাজার সূচক।"
  }
];

let currentUser = null;
let userProfile = {};
let liveRates = {
  BDT: 1,
  USD: 0.0083,
  SAR: 0.031,
  AED: 0.0305,
  GBP: 0.0065,
  INR: 0.70
};
let dbMarketItems = [];
let activeDateKey = getTodayKey();
let statusPrefix = "দৈনিক বিশ্ব বাজার মূল্যতালিকা অটো-আপডেটেড";

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

function getTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatWorldPrice(baseBdt, currencyCode = "BDT") {
  const amount = Number(baseBdt);
  if (Number.isNaN(amount) || amount <= 0) return "দর নির্ধারিত নয়";
  const rate = liveRates[currencyCode] || CURRENCY_MAP[currencyCode]?.rate || 1;
  const meta = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.BDT;
  const converted = amount * rate;

  if (currencyCode === "BDT") {
    return `${meta.symbol}${Math.round(converted).toLocaleString("bn-BD")}`;
  }
  return `${meta.symbol}${converted.toFixed(2)}`;
}

function renderMarketStatus() {
  const el = $("worldMarketStatus");
  if (!el) return;
  const curCode = $("marketCurrencySelect")?.value || "BDT";
  const curLabel = CURRENCY_MAP[curCode]?.label || "বাংলাদেশ (BDT)";
  const dateBn = new Date().toLocaleDateString("bn-BD");
  const timeBn = new Date().toLocaleTimeString("bn-BD", {
    hour: "2-digit",
    minute: "2-digit"
  });
  el.textContent = `🌍 ${statusPrefix} • ${dateBn} (${timeBn}) • ${curLabel}`;
}

// ==================================================
// DAILY AUTO-UPDATE RATES & DATE CYCLE
// ==================================================

async function syncDailyWorldMarket(forceRefresh = false) {
  const todayKey = getTodayKey();
  activeDateKey = todayKey;
  const cacheKey = `ayna_world_market_${todayKey}`;

  if (!forceRefresh) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && cached.rates) {
        liveRates = { ...liveRates, ...cached.rates };
        statusPrefix = "আজকের বিশ্ব বাজার মূল্যতালিকা দৈনিক অটো-আপডেটেড";
        renderMarketStatus();
        renderWorldMarketList();
        return;
      }
    } catch (e) {
      console.warn("Market cache read error:", e);
    }
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/BDT");
    const data = await res.json();
    if (data && data.result === "success" && data.rates) {
      liveRates = {
        BDT: 1,
        USD: data.rates.USD || liveRates.USD,
        SAR: data.rates.SAR || liveRates.SAR,
        AED: data.rates.AED || liveRates.AED,
        GBP: data.rates.GBP || liveRates.GBP,
        INR: data.rates.INR || liveRates.INR
      };
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ rates: liveRates, dateKey: todayKey, updatedAt: Date.now() })
        );
      } catch (e) {
        console.warn("Market cache write error:", e);
      }
      statusPrefix = "দৈনিক লাইভ মুদ্রা ও বিশ্ব বাজার দর আপডেটেড";
    } else {
      statusPrefix = "দৈনিক বিশ্ব বাজার মূল্যতালিকা সক্রিয়";
    }
  } catch (err) {
    console.warn("Using fallback currency rates:", err);
    statusPrefix = "দৈনিক নির্ধারিত বিশ্ব বাজার মূল্যতালিকা সক্রিয়";
  }

  renderMarketStatus();
  renderWorldMarketList();
}

// ==================================================
// AUTHENTICATION
// ==================================================

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) return;
  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile load error:", err);
  }
});

// ==================================================
// ADD OR UPDATE DAILY MARKET ITEM IN FIREBASE
// ==================================================

$("addMarketItemBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showNotice("দৈনিক মূল্যতালিকায় তথ্য যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const category = $("newMarketCategory")?.value || "নিত্যপ্রয়োজনীয় মুদি ও খাদ্য";
  const region = $("newMarketRegion")?.value.trim() || "বিশ্ববাজার ও বাংলাদেশ";
  const name = $("newMarketName")?.value.trim() || "";
  const unit = $("newMarketUnit")?.value.trim() || "প্রতি কেজি";
  const baseBdt = parseFloat($("newMarketBdt")?.value || "0");
  const trend =
    $("newMarketTrend")?.value.trim() ||
    `আপডেট (${new Date().toLocaleDateString("bn-BD")})`;
  const note = $("newMarketNote")?.value.trim() || "";

  if (!name || Number.isNaN(baseBdt) || baseBdt <= 0) {
    showNotice("অনুগ্রহ করে পণ্যের নাম এবং সঠিক দাম লিখুন।");
    return;
  }

  const newRef = push(ref(database, "worldMarketPrices"));
  await set(newRef, {
    category,
    region,
    name,
    unit,
    baseBdt,
    trend,
    note,
    uid: currentUser.uid,
    updatedBy:
      userProfile.fullName ||
      currentUser.displayName ||
      currentUser.email ||
      "AYNA Member",
    updatedAt: Date.now(),
    createdAt: Date.now()
  });

  if ($("newMarketRegion")) $("newMarketRegion").value = "";
  if ($("newMarketName")) $("newMarketName").value = "";
  if ($("newMarketUnit")) $("newMarketUnit").value = "";
  if ($("newMarketBdt")) $("newMarketBdt").value = "";
  if ($("newMarketTrend")) $("newMarketTrend").value = "";
  if ($("newMarketNote")) $("newMarketNote").value = "";

  showNotice("দৈনিক বিশ্ব বাজার মূল্যতালিকায় যুক্ত হয়েছে!");
});

// ==================================================
// REALTIME FIREBASE LISTENER & RENDERING
// ==================================================

onValue(ref(database, "worldMarketPrices"), (snapshot) => {
  const data = snapshot.val() || {};
  dbMarketItems = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  renderWorldMarketList();
});

function renderWorldMarketList() {
  const container = $("worldMarketList");
  if (!container) return;

  const curCode = $("marketCurrencySelect")?.value || "BDT";
  const catFilter = $("marketCategoryFilter")?.value || "ALL";
  const regionQ = ($("marketRegionFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("marketSearchInput")?.value || "").trim().toLowerCase();

  const mergedMap = new Map();
  DEFAULT_WORLD_MARKET_ITEMS.forEach((item) => mergedMap.set(item.name, item));
  dbMarketItems.forEach((item) => mergedMap.set(item.name, item));

  const items = Array.from(mergedMap.values()).filter((item) => {
    const matchCat = catFilter === "ALL" || item.category === catFilter;
    const matchRegion =
      !regionQ || (item.region && item.region.toLowerCase().includes(regionQ));
    const matchSearch =
      !searchQ ||
      (item.name && item.name.toLowerCase().includes(searchQ)) ||
      (item.category && item.category.toLowerCase().includes(searchQ)) ||
      (item.region && item.region.toLowerCase().includes(searchQ)) ||
      (item.note && item.note.toLowerCase().includes(searchQ));

    return matchCat && matchRegion && matchSearch;
  });

  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো বাজার পণ্যের দর পাওয়া যায়নি।</div>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d market-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;
    const priceText = formatWorldPrice(item.baseBdt, curCode);

    card.innerHTML = `
      <div>
        <div class="market-top">
          <span class="market-badge">${escapeHTML(item.category || "বিশ্ববাজার")}</span>
          <span class="market-trend">${escapeHTML(item.trend || "দৈনিক দর")}</span>
        </div>
        <h3 class="market-name">${escapeHTML(item.name)}</h3>
        <div class="market-region">🌍 ${escapeHTML(item.region || "আন্তর্জাতিক")} • ${escapeHTML(item.unit || "")}</div>
        <div class="market-price-box">💰 ${escapeHTML(priceText)}</div>
        ${item.note ? `<p class="market-note">${escapeHTML(item.note)}</p>` : ""}
      </div>
      <div>
        <div class="market-footer">
          আপডেট: <strong>${escapeHTML(item.updatedBy || "AYNA বাজার সূচক")}</strong>
        </div>
        ${
          isOwner && item.id
            ? `<button type="button" class="del-market-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-market-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই দরটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `worldMarketPrices/${item.id}`));
        showNotice("দরটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("marketCurrencySelect")?.addEventListener("change", () => {
    renderMarketStatus();
    renderWorldMarketList();
  });
  $("marketCategoryFilter")?.addEventListener("change", renderWorldMarketList);
  $("marketRegionFilter")?.addEventListener("input", renderWorldMarketList);
  $("marketSearchInput")?.addEventListener("input", renderWorldMarketList);
  $("refreshWorldMarketBtn")?.addEventListener("click", () => {
    syncDailyWorldMarket(true);
    showNotice("দৈনিক বিশ্ব বাজার মূল্যতালিকা রিফ্রেশ হয়েছে!");
  });

  syncDailyWorldMarket(false);

  // প্রতি ৬ ঘণ্টায় তারিখ বা বাজার হার পরিবর্তিত হয়েছে কি না চেক করবে
  setInterval(() => {
    const newDay = getTodayKey() !== activeDateKey;
    syncDailyWorldMarket(newDay);
  }, 6 * 60 * 60 * 1000);
});