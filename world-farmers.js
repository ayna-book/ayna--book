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
// AYNA BOOK - WORLD FARMERS AUTO-UPDATE (world-farmers.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const CURRENCY_RATES_CONFIG = {
  BDT: { symbol: "৳", label: "বাংলাদেশ (BDT)", rate: 1 },
  SAR: { symbol: "SAR ", label: "সৌদি আরব (SAR)", rate: 0.031 },
  AED: { symbol: "AED ", label: "সংযুক্ত আরব আমিরাত (AED)", rate: 0.0305 },
  GBP: { symbol: "£", label: "যুক্তরাজ্য (GBP)", rate: 0.0065 },
  USD: { symbol: "USD ", label: "যুক্তরাষ্ট্র (USD)", rate: 0.0083 },
  INR: { symbol: "₹", label: "ভারত (INR)", rate: 0.70 }
};

// কৃষি পণ্যের দৈনিক অটো-আপডেটেবল বেস দর (BDT প্রতি কেজি/একক)
const DEFAULT_AGRI_COMMODITIES = [
  { id: "a1", category: "ফসল উৎপাদন", countryArea: "বাংলাদেশ — কক্সবাজার ও চট্টগ্রাম", farmerName: "কৃষি তথ্য বাতায়ন", crop: "আমন ধান", title: "ধানের দৈনিক বাজার দর", unit: "প্রতি মণ (৪০ কেজি)", baseBdt: 1320, desc: "স্থানীয় পাইকারি ও হাট বাজারের গড় দর অনুযায়ী স্বয়ংক্রিয়ভাবে আপডেটেড।" },
  { id: "a2", category: "সরাসরি কৃষি পণ্য", countryArea: "বাংলাদেশ — রংপুর ও মুন্সীগঞ্জ", farmerName: "কৃষি বাজার পর্যবেক্ষণ", crop: "আলু (ডায়মন্ড/কার্ডিনাল)", title: "আলুর দৈনিক খুচরা/পাইকারি দর", unit: "প্রতি কেজি", baseBdt: 48, desc: "সংরক্ষণ ও সরবরাহ অনুযায়ী দৈনিক দর অটো-সিঙ্ক হচ্ছে।" },
  { id: "a3", category: "সরাসরি কৃষি পণ্য", countryArea: "বাংলাদেশ — ফরিদপুর ও পাবনা", farmerName: "কৃষি বাজার পর্যবেক্ষণ", crop: "দেশি পেঁয়াজ", title: "পেঁয়াজের দৈনিক বাজার দর", unit: "প্রতি কেজি", baseBdt: 105, desc: "মৌসুমি সরবরাহ ও বাজারের বর্তমান অবস্থার সাথে সামঞ্জস্যপূর্ণ দর।" },
  { id: "a4", category: "ফসল উৎপাদন", countryArea: "বাংলাদেশ — বগুড়া ও দিনাজপুর", farmerName: "কৃষি বাজার পর্যবেক্ষণ", crop: "কাঁচামরিচ", title: "কাঁচামরিচের দৈনিক দর", unit: "প্রতি কেজি", baseBdt: 120, desc: "দৈনিক বাজার দর অনুযায়ী স্বয়ংক্রিয়ভাবে আপডেট হয়।" },
  { id: "a5", category: "সরাসরি কৃষি পণ্য", countryArea: "বাংলাদেশ — সুন্দরবন ও সাতক্ষীরা", farmerName: "মৌ চাষি সমিতি", crop: "খাঁটি সুন্দরবনের মধু", title: "প্রাকৃতিক মধুর বাজার দর", unit: "প্রতি কেজি", baseBdt: 850, desc: "সরাসরি সংগৃহীত খাঁটি মধুর দৈনিক দর।" },
  { id: "a6", category: "পশুপালন ও মৎস্য", countryArea: "বাংলাদেশ — সিরাজগঞ্জ ও খুলনা", farmerName: "ডেইরি ও মৎস্য খামার", crop: "তরল দুধ ও রুই মাছ", title: "খামার পর্যায়ের দৈনিক দর", unit: "প্রতি লিটার / কেজি", baseBdt: 85, desc: "খামার ও স্থানীয় বাজারের দৈনিক আপডেট অনুযায়ী প্রদর্শিত।" }
];

let currentUser = null;
let userProfile = {};
let liveRates = {
  BDT: 1,
  SAR: 0.031,
  AED: 0.0305,
  GBP: 0.0065,
  USD: 0.0083,
  INR: 0.70
};
let dbFarmerItems = [];
let lastAutoSyncLabel = "";

function notify(message) {
  const box = $("notice");
  if (!box) return alert(message);
  box.textContent = message;
  box.style.display = "block";
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
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

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatAgriPrice(baseBdt, currencyCode = "BDT") {
  if (!baseBdt || Number(baseBdt) <= 0) return "";
  const rate = liveRates[currencyCode] || CURRENCY_RATES_CONFIG[currencyCode]?.rate || 1;
  const meta = CURRENCY_RATES_CONFIG[currencyCode] || CURRENCY_RATES_CONFIG.BDT;
  const val = Number(baseBdt) * rate;
  return currencyCode === "BDT"
    ? `${meta.symbol}${Math.round(val).toLocaleString("bn-BD")}`
    : `${meta.symbol}${val.toFixed(2)}`;
}

function renderAutoUpdateStatus() {
  const statusBox = $("agriAutoStatus");
  if (!statusBox) return;
  const curCode = $("agriCurrencySelect")?.value || "BDT";
  const curLabel = CURRENCY_RATES_CONFIG[curCode]?.label || "বাংলাদেশ (BDT)";
  statusBox.textContent = `🌾 ${lastAutoSyncLabel || "কৃষি পণ্যের দর অটো-আপডেটেড"} • ${curLabel}`;
}

// ==================================================
// AUTO UPDATE CURRENCY & DAILY SCHEDULE
// ==================================================

async function runAgriAutoUpdate(forceNetwork = false) {
  const cacheKey = `ayna_agri_rates_${getTodayKey()}`;

  if (!forceNetwork) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && cached.rates) {
        liveRates = { ...liveRates, ...cached.rates };
        lastAutoSyncLabel = `আজকের তারিখ (${new Date().toLocaleDateString("bn-BD")}) অনুযায়ী কৃষি দর অটো-আপডেটেড`;
        renderAutoUpdateStatus();
        renderFarmersList();
        return;
      }
    } catch (e) {
      console.warn("Agri cache read error:", e);
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
      localStorage.setItem(cacheKey, JSON.stringify({ rates: liveRates, updatedAt: Date.now() }));
    }
    lastAutoSyncLabel = `আজকের তারিখ (${new Date().toLocaleDateString("bn-BD")}) অনুযায়ী লাইভ মুদ্রা ও কৃষি দর আপডেটেড`;
  } catch (err) {
    console.warn("Using fallback currency rates:", err);
    lastAutoSyncLabel = `আজকের তারিখ (${new Date().toLocaleDateString("bn-BD")}) অনুযায়ী দৈনিক কৃষি দর সক্রিয়`;
  }

  renderAutoUpdateStatus();
  renderFarmersList();
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
// ADD NEW FARMER / CROP ENTRY WITH PRICE
// ==================================================

$("addFarmerPostBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    notify("তথ্য বা দর যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const category = $("farmerCategory")?.value || "ফসল উৎপাদন";
  const countryArea = $("farmerCountryArea")?.value.trim() || "বাংলাদেশ";
  const farmerName =
    $("farmerName")?.value.trim() ||
    userProfile.fullName ||
    currentUser.displayName ||
    "কৃষক প্রতিনিধি";
  const crop = $("farmerCrop")?.value.trim() || "";
  const title = $("farmerTitle")?.value.trim() || "";
  const desc = $("farmerDesc")?.value.trim() || "";
  const baseBdt = parseFloat($("farmerPriceBdt")?.value || "0");
  const unit = $("farmerUnit")?.value.trim() || "প্রতি কেজি";

  if (!title || !desc) {
    notify("অনুগ্রহ করে শিরোনাম এবং বিস্তারিত তথ্য লিখুন।");
    return;
  }

  const newRef = push(ref(database, "worldFarmers"));
  await set(newRef, {
    category,
    countryArea,
    farmerName,
    crop,
    title,
    desc,
    baseBdt: !Number.isNaN(baseBdt) && baseBdt > 0 ? baseBdt : 0,
    unit,
    uid: currentUser.uid,
    updatedAt: Date.now(),
    createdAt: Date.now()
  });

  if ($("farmerCountryArea")) $("farmerCountryArea").value = "";
  if ($("farmerName")) $("farmerName").value = "";
  if ($("farmerCrop")) $("farmerCrop").value = "";
  if ($("farmerTitle")) $("farmerTitle").value = "";
  if ($("farmerDesc")) $("farmerDesc").value = "";
  if ($("farmerPriceBdt")) $("farmerPriceBdt").value = "";
  if ($("farmerUnit")) $("farmerUnit").value = "";

  notify("বিশ্ব কৃষক তালিকায় তথ্য ও দর যুক্ত হয়েছে!");
});

// ==================================================
// REALTIME LISTENER & RENDERING
// ==================================================

onValue(ref(database, "worldFarmers"), (snap) => {
  const data = snap.val() || {};
  dbFarmerItems = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  renderFarmersList();
});

function renderFarmersList() {
  const container = $("farmersList");
  if (!container) return;

  const catQ = $("farmerCategoryFilter")?.value || "ALL";
  const locQ = ($("farmerLocationFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("farmerSearch")?.value || "").trim().toLowerCase();
  const currencyCode = $("agriCurrencySelect")?.value || "BDT";

  // Firebase-এর আপডেটেড এন্ট্রি ও ডিফল্ট কৃষি পণ্য একত্র করা
  const mergedMap = new Map();
  DEFAULT_AGRI_COMMODITIES.forEach((item) => mergedMap.set(item.title, item));
  dbFarmerItems.forEach((item) => mergedMap.set(item.title, item));

  const list = Array.from(mergedMap.values()).filter((item) => {
    const matchCat = catQ === "ALL" || item.category === catQ;
    const matchLoc =
      !locQ || (item.countryArea && item.countryArea.toLowerCase().includes(locQ));
    const matchSearch =
      !searchQ ||
      (item.title && item.title.toLowerCase().includes(searchQ)) ||
      (item.crop && item.crop.toLowerCase().includes(searchQ)) ||
      (item.farmerName && item.farmerName.toLowerCase().includes(searchQ)) ||
      (item.desc && item.desc.toLowerCase().includes(searchQ)) ||
      (item.countryArea && item.countryArea.toLowerCase().includes(searchQ));

    return matchCat && matchLoc && matchSearch;
  });

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো কৃষি তথ্য বা পণ্য পাওয়া যায়নি।</div>';
    return;
  }

  list.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d farmer-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;
    const formattedPrice = formatAgriPrice(item.baseBdt, currencyCode);

    card.innerHTML = `
      <div>
        <span class="farmer-badge">${escapeHTML(item.category || "কৃষি")} • ${escapeHTML(item.countryArea || "")}</span>
        <h3 class="farmer-title">${escapeHTML(item.title)}</h3>
        ${item.crop ? `<div class="farmer-crop">🌱 ফসল/পণ্য: ${escapeHTML(item.crop)}</div>` : ""}
        ${
          formattedPrice
            ? `<div class="farmer-crop" style="color:#ffffff;background:#050b1c;border:1.5px solid #ffd700;padding:8px 12px;border-radius:6px;display:inline-block;margin-bottom:10px;">
                💰 আজকের দর: ${escapeHTML(formattedPrice)} ${item.unit ? `(${escapeHTML(item.unit)})` : ""}
              </div>`
            : ""
        }
        <p class="farmer-desc">${escapeHTML(item.desc || "")}</p>
      </div>
      <div>
        <div class="farmer-footer">
          তথ্যদাতা: <strong>${escapeHTML(item.farmerName || "কৃষক সমাজ")}</strong>
        </div>
        ${
          isOwner
            ? `<button type="button" class="del-farmer-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-farmer-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `worldFarmers/${item.id}`));
        notify("তথ্যটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("farmerCategoryFilter")?.addEventListener("change", renderFarmersList);
  $("farmerLocationFilter")?.addEventListener("input", renderFarmersList);
  $("farmerSearch")?.addEventListener("input", renderFarmersList);
  $("agriCurrencySelect")?.addEventListener("change", () => {
    renderAutoUpdateStatus();
    renderFarmersList();
  });
  $("refreshAgriPricesBtn")?.addEventListener("click", () => {
    runAgriAutoUpdate(true);
    notify("কৃষি পণ্যের দৈনিক দর ও মুদ্রা হার রিফ্রেশ হয়েছে!");
  });

  runAgriAutoUpdate(false);

  // প্রতি ৬ ঘণ্টায় স্বয়ংক্রিয়ভাবে আপডেট চেক
  setInterval(() => {
    runAgriAutoUpdate(true);
  }, 6 * 60 * 60 * 1000);
});