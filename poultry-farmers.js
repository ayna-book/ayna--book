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
// AYNA BOOK - POULTRY FARMERS & TRADERS (poultry-farmers.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const CURRENCY_CONFIG = {
  BDT: { symbol: "৳", label: "বাংলাদেশ (BDT)", rate: 1 },
  SAR: { symbol: "SAR ", label: "সৌদি আরব (SAR)", rate: 0.031 },
  AED: { symbol: "AED ", label: "সংযুক্ত আরব আমিরাত (AED)", rate: 0.0305 },
  GBP: { symbol: "£", label: "যুক্তরাজ্য (GBP)", rate: 0.0065 },
  USD: { symbol: "USD ", label: "যুক্তরাষ্ট্র (USD)", rate: 0.0083 },
  INR: { symbol: "₹", label: "ভারত (INR)", rate: 0.70 }
};

// পোলোট্রি পণ্যের দৈনিক অটো-আপডেটেবল স্ট্যান্ডার্ড তালিকা (BDT ভিত্তিক)
const DEFAULT_POULTRY_ITEMS = [
  {
    id: "p1",
    category: "ব্রয়লার ও সোনালী মুরগি",
    location: "বাংলাদেশ — চট্টগ্রাম ও ঢাকা",
    ownerName: "পোলোট্রি বাজার পর্যবেক্ষণ",
    productName: "ব্রয়লার মুরগি (জীবন্ত)",
    title: "ব্রয়লার মুরগির দৈনিক খামার ও বাজার দর",
    priceBdt: 175,
    unit: "প্রতি কেজি",
    phone: "",
    desc: "খামার ও স্থানীয় পাইকারি বাজারের দৈনিক দর অনুযায়ী স্বয়ংক্রিয়ভাবে আপডেটেড।"
  },
  {
    id: "p2",
    category: "ব্রয়লার ও সোনালী মুরগি",
    location: "বাংলাদেশ — বগুড়া ও গাজীপুর",
    ownerName: "পোলোট্রি বাজার পর্যবেক্ষণ",
    productName: "সোনালী মুরগি",
    title: "সোনালী মুরগির দৈনিক দর",
    priceBdt: 265,
    unit: "প্রতি কেজি",
    phone: "",
    desc: "দৈনিক বাজার দর ও মুদ্রা হার অনুযায়ী আপডেট হয়।"
  },
  {
    id: "p3",
    category: "ডিম ও লেয়ার খামার",
    location: "বাংলাদেশ — তেজগাঁও ও চট্টগ্রাম",
    ownerName: "লেয়ার খামার সমিতি",
    productName: "মুরগির ডিম (লাল/সাদা)",
    title: "ডিমের দৈনিক পাইকারি দর (১০০ পিস)",
    priceBdt: 1150,
    unit: "প্রতি ১০০ পিস",
    phone: "",
    desc: "খামার পর্যায় থেকে সংগৃহীত দৈনিক ডিমের বাজার দর।"
  },
  {
    id: "p4",
    category: "পোলোট্রি ফিড ও বাচ্চা (DOC)",
    location: "বাংলাদেশ — সারাদেশ",
    ownerName: "পোলোট্রি ফিড ও হ্যাচারি ডেস্ক",
    productName: "পোলোট্রি স্টার্টার/গ্রোয়ার ফিড",
    title: "পোলোট্রি ফিডের আনুমানিক বাজার দর",
    priceBdt: 3150,
    unit: "প্রতি ৫০ কেজি বস্তা",
    phone: "",
    desc: "ফিড মিল ও ডিলার পর্যায়ের স্ট্যান্ডার্ড দৈনিক হিসাব।"
  }
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
let dbPoultryItems = [];
let lastPoultrySyncText = "";

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

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatPoultryPrice(priceBdt, currencyCode = "BDT") {
  if (!priceBdt || Number(priceBdt) <= 0) return "";
  const rate = liveRates[currencyCode] || CURRENCY_CONFIG[currencyCode]?.rate || 1;
  const meta = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.BDT;
  const converted = Number(priceBdt) * rate;
  return currencyCode === "BDT"
    ? `${meta.symbol}${Math.round(converted).toLocaleString("bn-BD")}`
    : `${meta.symbol}${converted.toFixed(2)}`;
}

function renderPoultryStatus() {
  const banner = $("poultryAutoStatus");
  if (!banner) return;
  const curCode = $("poultryCurrencySelect")?.value || "BDT";
  const curLabel = CURRENCY_CONFIG[curCode]?.label || "বাংলাদেশ (BDT)";
  banner.textContent = `🐔 ${lastPoultrySyncText || "পোলোট্রি দর অটো-আপডেটেড"} • ${curLabel}`;
}

// ==================================================
// AUTO UPDATE DAILY RATES & CURRENCY
// ==================================================

async function runPoultryAutoUpdate(forceNetwork = false) {
  const cacheKey = `ayna_poultry_rates_${getTodayKey()}`;

  if (!forceNetwork) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && cached.rates) {
        liveRates = { ...liveRates, ...cached.rates };
        lastPoultrySyncText = `আজকের তারিখ (${new Date().toLocaleDateString("bn-BD")}) অনুযায়ী পোলোট্রি দর অটো-আপডেটেড`;
        renderPoultryStatus();
        renderPoultryList();
        return;
      }
    } catch (e) {
      console.warn("Poultry cache read error:", e);
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
    lastPoultrySyncText = `আজকের তারিখ (${new Date().toLocaleDateString("bn-BD")}) অনুযায়ী লাইভ মুদ্রা ও পোলোট্রি দর আপডেটেড`;
  } catch (err) {
    console.warn("Using fallback rates:", err);
    lastPoultrySyncText = `আজকের তারিখ (${new Date().toLocaleDateString("bn-BD")}) অনুযায়ী দৈনিক পোলোট্রি দর সক্রিয়`;
  }

  renderPoultryStatus();
  renderPoultryList();
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
// ADD NEW POULTRY ENTRY
// ==================================================

$("addPoultryPostBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    notify("তথ্য বা দর যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const category = $("poultryCategory")?.value || "ব্রয়লার ও সোনালী মুরগি";
  const location = $("poultryLocation")?.value.trim() || "বাংলাদেশ";
  const ownerName =
    $("poultryOwnerName")?.value.trim() ||
    userProfile.fullName ||
    currentUser.displayName ||
    "পোলোট্রি খামারি/ব্যবসায়ী";
  const productName = $("poultryProductName")?.value.trim() || "";
  const priceBdt = parseFloat($("poultryPriceBdt")?.value || "0");
  const unit = $("poultryUnit")?.value.trim() || "প্রতি কেজি";
  const title = $("poultryTitle")?.value.trim() || "";
  const phone = $("poultryPhone")?.value.trim() || "";
  const desc = $("poultryDesc")?.value.trim() || "";

  if (!title || !desc) {
    notify("অনুগ্রহ করে শিরোনাম এবং বিস্তারিত বিবরণ লিখুন।");
    return;
  }

  const newRef = push(ref(database, "poultryFarmers"));
  await set(newRef, {
    category,
    location,
    ownerName,
    productName,
    priceBdt: !Number.isNaN(priceBdt) && priceBdt > 0 ? priceBdt : 0,
    unit,
    title,
    phone,
    desc,
    uid: currentUser.uid,
    updatedAt: Date.now(),
    createdAt: Date.now()
  });

  if ($("poultryLocation")) $("poultryLocation").value = "";
  if ($("poultryOwnerName")) $("poultryOwnerName").value = "";
  if ($("poultryProductName")) $("poultryProductName").value = "";
  if ($("poultryPriceBdt")) $("poultryPriceBdt").value = "";
  if ($("poultryUnit")) $("poultryUnit").value = "";
  if ($("poultryTitle")) $("poultryTitle").value = "";
  if ($("poultryPhone")) $("poultryPhone").value = "";
  if ($("poultryDesc")) $("poultryDesc").value = "";

  notify("পোলোট্রি কৃষক ও ব্যবসায়ী তালিকায় প্রকাশ হয়েছে!");
});

// ==================================================
// REALTIME LISTENER & RENDERING
// ==================================================

onValue(ref(database, "poultryFarmers"), (snap) => {
  const data = snap.val() || {};
  dbPoultryItems = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  renderPoultryList();
});

function renderPoultryList() {
  const container = $("poultryList");
  if (!container) return;

  const catQ = $("poultryCategoryFilter")?.value || "ALL";
  const locQ = ($("poultryLocationFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("poultrySearch")?.value || "").trim().toLowerCase();
  const currencyCode = $("poultryCurrencySelect")?.value || "BDT";

  const mergedMap = new Map();
  DEFAULT_POULTRY_ITEMS.forEach((item) => mergedMap.set(item.title, item));
  dbPoultryItems.forEach((item) => mergedMap.set(item.title, item));

  const list = Array.from(mergedMap.values()).filter((item) => {
    const matchCat = catQ === "ALL" || item.category === catQ;
    const matchLoc =
      !locQ || (item.location && item.location.toLowerCase().includes(locQ));
    const matchSearch =
      !searchQ ||
      (item.title && item.title.toLowerCase().includes(searchQ)) ||
      (item.productName && item.productName.toLowerCase().includes(searchQ)) ||
      (item.ownerName && item.ownerName.toLowerCase().includes(searchQ)) ||
      (item.desc && item.desc.toLowerCase().includes(searchQ)) ||
      (item.location && item.location.toLowerCase().includes(searchQ));

    return matchCat && matchLoc && matchSearch;
  });

  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো পোলোট্রি তথ্য বা দর পাওয়া যায়নি।</div>';
    return;
  }

  list.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d poultry-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;
    const priceText = formatPoultryPrice(item.priceBdt, currencyCode);

    card.innerHTML = `
      <div>
        <span class="poultry-badge">${escapeHTML(item.category || "পোলোট্রি")} • ${escapeHTML(item.location || "")}</span>
        <h3 class="poultry-title">${escapeHTML(item.title)}</h3>
        ${item.productName ? `<div style="color:#ffd700;font-weight:bold;margin-bottom:8px;">🐣 পণ্য: ${escapeHTML(item.productName)}</div>` : ""}
        ${
          priceText
            ? `<div class="poultry-rate">💰 আজকের দর: ${escapeHTML(priceText)} ${item.unit ? `(${escapeHTML(item.unit)})` : ""}</div>`
            : ""
        }
        <p class="poultry-desc">${escapeHTML(item.desc || "")}</p>
        ${item.phone ? `<div style="margin-top:8px;color:#ffd700;font-size:17px;">📞 যোগাযোগ: ${escapeHTML(item.phone)}</div>` : ""}
      </div>
      <div>
        <div class="poultry-footer">
          খামারি / ব্যবসায়ী: <strong>${escapeHTML(item.ownerName || "পোলোট্রি সমাজ")}</strong>
        </div>
        ${
          isOwner && item.id
            ? `<button type="button" class="del-poultry-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-poultry-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `poultryFarmers/${item.id}`));
        showNotice("তথ্যটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("poultryCategoryFilter")?.addEventListener("change", renderPoultryList);
  $("poultryLocationFilter")?.addEventListener("input", renderPoultryList);
  $("poultrySearch")?.addEventListener("input", renderPoultryList);
  $("poultryCurrencySelect")?.addEventListener("change", () => {
    renderPoultryStatus();
    renderPoultryList();
  });
  $("refreshPoultryBtn")?.addEventListener("click", () => {
    runPoultryAutoUpdate(true);
    showNotice("পোলোট্রি দর ও মুদ্রা হার রিফ্রেশ হয়েছে!");
  });

  runPoultryAutoUpdate(false);

  setInterval(() => {
    runPoultryAutoUpdate(true);
  }, 6 * 60 * 60 * 1000);
});