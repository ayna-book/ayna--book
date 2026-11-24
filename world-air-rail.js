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
// AYNA BOOK - WORLD AIR & RAIL TRANSPORT (world-air-rail.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const CURRENCY_META = {
  USD: { symbol: "$", label: "বিশ্ব মানদণ্ড (USD)", rate: 0.0083 },
  BDT: { symbol: "৳", label: "বাংলাদেশ (BDT)", rate: 1 },
  SAR: { symbol: "SAR ", label: "সৌদি আরব (SAR)", rate: 0.031 },
  AED: { symbol: "AED ", label: "সংযুক্ত আরব আমিরাত (AED)", rate: 0.0305 },
  GBP: { symbol: "£", label: "যুক্তরাজ্য (GBP)", rate: 0.0065 },
  INR: { symbol: "₹", label: "ভারত (INR)", rate: 0.70 }
};

// বিশ্ব ও আঞ্চলিক বিমান ও রেল পরিবহণের প্রিসেট তথ্য (BDT ভিত্তিক, লাইভ মুদ্রায় রূপান্তরযোগ্য)
const DEFAULT_WORLD_AIR_RAIL = [
  {
    id: "war1",
    type: "বিশ্ব বিমান",
    country: "সৌদি আরব ও আন্তর্জাতিক",
    name: "সৌদিয়া (Saudia)",
    phone: "+966 9200 22222",
    email: "care@saudia.com",
    route: "আন্তর্জাতিক ও মধ্যপ্রাচ্য রুট (ইকোনমি রেফারেন্স)",
    priceBdt: 56000,
    note: "আন্তর্জাতিক বিমানভাড়া রুট, তারিখ ও সিট শ্রেণি অনুযায়ী পরিবর্তনশীল।"
  },
  {
    id: "war2",
    type: "বিশ্ব বিমান",
    country: "সংযুক্ত আরব আমিরাত ও বিশ্ব",
    name: "এমিরেটস (Emirates)",
    phone: "+971 600 555 555",
    email: "customer.affairs@emirates.com",
    route: "দুবাই ও বৈশ্বিক সংযোগ রুট (ইকোনমি রেফারেন্স)",
    priceBdt: 64000,
    note: "ভাড়া মৌসুম ও বুকিংয়ের সময়ের ওপর নির্ভর করে পরিবর্তিত হয়।"
  },
  {
    id: "war3",
    type: "বিশ্ব বিমান",
    country: "বাংলাদেশ ও আন্তর্জাতিক",
    name: "বিমান বাংলাদেশ এয়ারলাইন্স (Biman Bangladesh)",
    phone: "13636 / +88 096109-13636",
    email: "ibebiman@biman.gov.bd",
    route: "দেশীয় ও আন্তর্জাতিক রুট (ইকোনমি রেফারেন্স)",
    priceBdt: 48500,
    note: "অভ্যন্তরীণ ও আন্তর্জাতিক রুটের ভাড়া প্রাপ্যতা অনুযায়ী ভিন্ন হতে পারে।"
  },
  {
    id: "war4",
    type: "বিশ্ব রেল",
    country: "যুক্তরাজ্য ও ইউরোপ",
    name: "ইউরোস্টার (Eurostar)",
    phone: "+44 1233 617575",
    email: "support@eurostar.com",
    route: "লন্ডন - প্যারিস / ব্রাসেলস (স্ট্যান্ডার্ড রেফারেন্স)",
    priceBdt: 14500,
    note: "আন্তর্জাতিক উচ্চগতির রেলভাড়া অগ্রিম বুকিং অনুযায়ী পরিবর্তিত হয়।"
  },
  {
    id: "war5",
    type: "বিশ্ব রেল",
    country: "ভারত",
    name: "ইন্ডিয়ান রেলওয়েজ (Indian Railways)",
    phone: "139",
    email: "care@irctc.co.in",
    route: "আন্তঃনগর ও দীর্ঘ দূরত্বের রুট (স্লিপার/এসি রেফারেন্স)",
    priceBdt: 1850,
    note: "ট্রেন ও শ্রেণি অনুযায়ী সরকারি নির্ধারিত ভাড়া প্রযোজ্য।"
  },
  {
    id: "war6",
    type: "বিশ্ব রেল",
    country: "বাংলাদেশ",
    name: "বাংলাদেশ রেলওয়ে (Bangladesh Railway)",
    phone: "131",
    email: "info@railway.gov.bd",
    route: "আন্তঃনগর রুট (শোভন চেয়ার / স্নিগ্ধা রেফারেন্স)",
    priceBdt: 660,
    note: "রুট ও শ্রেণিভেদে বাংলাদেশ রেলওয়ের নির্ধারিত ভাড়া প্রযোজ্য।"
  }
];

let currentUser = null;
let userProfile = {};
let liveRates = {
  USD: 0.0083,
  BDT: 1,
  SAR: 0.031,
  AED: 0.0305,
  GBP: 0.0065,
  INR: 0.70
};
let dbItems = [];
let activeDateKey = getTodayKey();
let bannerPrefix = "বিশ্ব বিমান ও রেল টিকেট মূল্যতালিকা দৈনিক অটো-আপডেটেড";

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

function formatWorldTicketPrice(priceBdt, currencyCode = "USD") {
  const num = Number(priceBdt);
  if (Number.isNaN(num) || num <= 0) return "দর নির্ধারিত নয়";
  const rate = liveRates[currencyCode] || CURRENCY_META[currencyCode]?.rate || 1;
  const meta = CURRENCY_META[currencyCode] || CURRENCY_META.USD;
  const converted = num * rate;
  return currencyCode === "BDT"
    ? `${meta.symbol}${Math.round(converted).toLocaleString("bn-BD")}`
    : `${meta.symbol}${converted.toFixed(2)}`;
}

function renderBanner() {
  const banner = $("worldTransportStatus");
  if (!banner) return;
  const curCode = $("worldTransportCurrency")?.value || "USD";
  const curLabel = CURRENCY_META[curCode]?.label || "বিশ্ব মানদণ্ড (USD)";
  const dateBn = new Date().toLocaleDateString("bn-BD");
  banner.textContent = `🌍✈️🚆 ${bannerPrefix} • ${dateBn} • ${curLabel}`;
}

async function syncWorldTransportRates(forceRefresh = false) {
  const todayKey = getTodayKey();
  activeDateKey = todayKey;
  const cacheKey = `ayna_world_transport_${todayKey}`;

  if (!forceRefresh) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached && cached.rates) {
        liveRates = { ...liveRates, ...cached.rates };
        bannerPrefix = "আজকের বিশ্ব টিকেট মূল্যতালিকা দৈনিক অটো-আপডেটেড";
        renderBanner();
        renderWorldTransportList();
        return;
      }
    } catch (e) {
      console.warn("World transport cache read error:", e);
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
        console.warn("World transport cache write error:", e);
      }
      bannerPrefix = "দৈনিক লাইভ মুদ্রা ও বিশ্ব টিকেট মূল্যতালিকা আপডেটেড";
    } else {
      bannerPrefix = "দৈনিক বিশ্ব টিকেট মূল্যতালিকা সক্রিয়";
    }
  } catch (err) {
    console.warn("Using fallback rates:", err);
    bannerPrefix = "দৈনিক নির্ধারিত বিশ্ব টিকেট মূল্যতালিকা সক্রিয়";
  }

  renderBanner();
  renderWorldTransportList();
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (!user) return;
  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile fetch error:", err);
  }
});

$("addWorldTransportBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showNotice("তথ্য যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const type = $("newWorldTransportType")?.value || "বিশ্ব বিমান";
  const country = $("newWorldCountry")?.value.trim() || "আন্তর্জাতিক";
  const name = $("newWorldTransportName")?.value.trim() || "";
  const phone = $("newWorldPhone")?.value.trim() || "";
  const email = $("newWorldEmail")?.value.trim() || "";
  const route = $("newWorldRoute")?.value.trim() || "";
  const priceBdt = parseFloat($("newWorldPriceBdt")?.value || "0");
  const note = $("newWorldNote")?.value.trim() || "";

  if (!name || (!phone && !email)) {
    showNotice("অনুগ্রহ করে পরিবহণের নাম এবং ফোন বা জিমেইল/ইমেইল লিখুন।");
    return;
  }

  const newRef = push(ref(database, "worldAirRail"));
  await set(newRef, {
    type,
    country,
    name,
    phone,
    email,
    route,
    priceBdt: !Number.isNaN(priceBdt) && priceBdt > 0 ? priceBdt : 0,
    note,
    uid: currentUser.uid,
    addedBy:
      userProfile.fullName ||
      currentUser.displayName ||
      currentUser.email ||
      "AYNA Member",
    createdAt: Date.now()
  });

  if ($("newWorldCountry")) $("newWorldCountry").value = "";
  if ($("newWorldTransportName")) $("newWorldTransportName").value = "";
  if ($("newWorldPhone")) $("newWorldPhone").value = "";
  if ($("newWorldEmail")) $("newWorldEmail").value = "";
  if ($("newWorldRoute")) $("newWorldRoute").value = "";
  if ($("newWorldPriceBdt")) $("newWorldPriceBdt").value = "";
  if ($("newWorldNote")) $("newWorldNote").value = "";

  showNotice("বিশ্ব বিমান ও রেল তালিকায় যুক্ত হয়েছে!");
});

onValue(ref(database, "worldAirRail"), (snapshot) => {
  const data = snapshot.val() || {};
  dbItems = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderWorldTransportList();
});

function renderWorldTransportList() {
  const container = $("worldTransportList");
  if (!container) return;

  const typeQ = $("worldTransportTypeFilter")?.value || "ALL";
  const curCode = $("worldTransportCurrency")?.value || "USD";
  const countryQ = ($("worldCountryFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("worldTransportSearch")?.value || "").trim().toLowerCase();

  const merged = [...dbItems, ...DEFAULT_WORLD_AIR_RAIL];

  const filtered = merged.filter((item) => {
    const matchType = typeQ === "ALL" || item.type === typeQ;
    const matchCountry =
      !countryQ || (item.country && item.country.toLowerCase().includes(countryQ));
    const matchSearch =
      !searchQ ||
      (item.name && item.name.toLowerCase().includes(searchQ)) ||
      (item.country && item.country.toLowerCase().includes(searchQ)) ||
      (item.phone && item.phone.toLowerCase().includes(searchQ)) ||
      (item.email && item.email.toLowerCase().includes(searchQ)) ||
      (item.route && item.route.toLowerCase().includes(searchQ));

    return matchType && matchCountry && matchSearch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো বিশ্ব বিমান বা রেল পরিবহণের তথ্য পাওয়া যায়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d transport-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;
    const priceStr = formatWorldTicketPrice(item.priceBdt, curCode);

    card.innerHTML = `
      <div>
        <span class="transport-badge">${escapeHTML(item.type || "বিশ্ব পরিবহণ")} • 🌍 ${escapeHTML(item.country || "")}</span>
        <h3 class="transport-name">${escapeHTML(item.name)}</h3>
        ${item.route ? `<div class="contact-line">🧭 রুট/ক্লাস: <strong>${escapeHTML(item.route)}</strong></div>` : ""}
        <div class="transport-price-box">🎫 টিকেট মূল্যতালিকা: ${escapeHTML(priceStr)}</div>
        ${item.phone ? `<div class="contact-line">📞 ফোন: <strong>${escapeHTML(item.phone)}</strong></div>` : ""}
        ${item.email ? `<div class="contact-line">✉️ জিমেইল/ইমেইল: <a href="mailto:${escapeHTML(item.email)}">${escapeHTML(item.email)}</a></div>` : ""}
        ${item.note ? `<div class="contact-line" style="margin-top:8px;">ℹ️ ${escapeHTML(item.note)}</div>` : ""}
      </div>
      <div>
        <div class="transport-footer">
          তথ্যসূত্র: <strong>${escapeHTML(item.addedBy || "AYNA বিশ্ব পরিবহণ")}</strong>
        </div>
        ${
          isOwner && item.id
            ? `<button type="button" class="del-world-tr-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-world-tr-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `worldAirRail/${item.id}`));
        showNotice("তথ্যটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("worldTransportTypeFilter")?.addEventListener("change", renderWorldTransportList);
  $("worldTransportCurrency")?.addEventListener("change", () => {
    renderBanner();
    renderWorldTransportList();
  });
  $("worldCountryFilter")?.addEventListener("input", renderWorldTransportList);
  $("worldTransportSearch")?.addEventListener("input", renderWorldTransportList);
  $("refreshWorldTransportBtn")?.addEventListener("click", () => {
    syncWorldTransportRates(true);
    showNotice("বিশ্ব টিকেট মূল্যতালিকা ও মুদ্রা হার রিফ্রেশ হয়েছে!");
  });

  syncWorldTransportRates(false);

  setInterval(() => {
    const isNewDay = getTodayKey() !== activeDateKey;
    syncWorldTransportRates(isNewDay);
  }, 6 * 60 * 60 * 1000);
});