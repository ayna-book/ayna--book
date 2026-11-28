
/* =====================================================
   AYNA BOOK — WORLD GOLD MARKET
   File: gold-market.js
   Version: 1.0
   Sample prices — not live market quotations
===================================================== */

"use strict";

const TOLA_GRAMS = 11.6638;

const GOLD_MARKET = [
  {id:1,country:"Bangladesh",name:"বাংলাদেশ",currency:"BDT",base24:15500},
  {id:2,country:"India",name:"ভারত",currency:"INR",base24:12500},
  {id:3,country:"USA",name:"যুক্তরাষ্ট্র",currency:"USD",base24:125},
  {id:4,country:"UK",name:"যুক্তরাজ্য",currency:"GBP",base24:96},
  {id:5,country:"Saudi Arabia",name:"সৌদি আরব",currency:"SAR",base24:460},
  {id:6,country:"UAE",name:"সংযুক্ত আরব আমিরাত",currency:"AED",base24:450},
  {id:7,country:"Japan",name:"জাপান",currency:"JPY",base24:19000},
  {id:8,country:"Australia",name:"অস্ট্রেলিয়া",currency:"AUD",base24:195},
  {id:9,country:"Canada",name:"কানাডা",currency:"CAD",base24:175},
  {id:10,country:"Singapore",name:"সিঙ্গাপুর",currency:"SGD",base24:165},
  {id:11,country:"Malaysia",name:"মালয়েশিয়া",currency:"MYR",base24:550},
  {id:12,country:"Germany",name:"জার্মানি",currency:"EUR",base24:115},
  {id:13,country:"Switzerland",name:"সুইজারল্যান্ড",currency:"CHF",base24:110},
  {id:14,country:"China",name:"চীন",currency:"CNY",base24:900},
  {id:15,country:"Turkey",name:"তুরস্ক",currency:"TRY",base24:5500}
];

const PURITIES = [
  {karat:24,purity:1,label:"২৪ ক্যারেট"},
  {karat:22,purity:22/24,label:"২২ ক্যারেট"},
  {karat:21,purity:21/24,label:"২১ ক্যারেট"},
  {karat:18,purity:18/24,label:"১৮ ক্যারেট"}
];

const CONFIG = {
  goldApiUrl:"",
  autoRefreshMinutes:30
};

let visibleGold = [];
let selectedGold = null;

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  })[char]);
}

function money(value,currency) {
  return `${Number(value).toLocaleString("en-US",{maximumFractionDigits:2})} ${escapeHTML(currency)}`;
}

function getGoldPrice(country,purity) {
  return country.base24 * purity.purity;
}

function getTolaPrice(country,purity) {
  return getGoldPrice(country,purity) * TOLA_GRAMS;
}

function createGoldCard(country,purity) {
  const gram = getGoldPrice(country,purity);
  const tola = getTolaPrice(country,purity);

  return `
    <article class="gold-card">
      <div class="gold-icon">🥇</div>

      <h3>${escapeHTML(country.name)} — ${purity.karat}K</h3>

      <span class="badge">${purity.karat} ক্যারেট স্বর্ণ</span>

      <p>🌍 দেশ: ${escapeHTML(country.country)}</p>

      <p class="gold-price">
        ${money(gram,country.currency)}
      </p>

      <p>প্রতি গ্রাম</p>

      <p>
        <strong>${money(tola,country.currency)}</strong>
      </p>

      <p>প্রতি ভরি / তোলা (${TOLA_GRAMS} গ্রাম)</p>

      <button type="button"
        data-gold-details="${country.id}-${purity.karat}">
        বিস্তারিত দেখুন
      </button>
    </article>
  `;
}

function getAllGold() {
  const results = [];

  GOLD_MARKET.forEach(country => {
    PURITIES.forEach(purity => {
      results.push({
        country,
        purity,
        gramPrice:getGoldPrice(country,purity),
        tolaPrice:getTolaPrice(country,purity)
      });
    });
  });

  return results;
}

function renderGold(items = visibleGold) {
  const container = $("goldProductsContainer");
  if (!container) return;

  if (!items.length) {
    container.innerHTML = "<p>কোনো স্বর্ণের তথ্য পাওয়া যায়নি।</p>";
  } else {
    container.innerHTML = items.map(item =>
      createGoldCard(item.country,item.purity)
    ).join("");
  }

  updateStats(items);
}

function updateStats(items = visibleGold) {
  const countries = new Set(items.map(x => x.country.country));
  const karats = new Set(items.map(x => x.purity.karat));

  if ($("totalGoldItems")) {
    $("totalGoldItems").textContent = items.length;
  }

  if ($("goldCountryCount")) {
    $("goldCountryCount").textContent = countries.size;
  }

  if ($("goldResultCount")) {
    $("goldResultCount").textContent = items.length;
  }

  if ($("goldKaratCount")) {
    $("goldKaratCount").textContent = karats.size;
  }

  if ($("resultCountTop")) {
    $("resultCountTop").textContent = items.length;
  }
}

function applyGoldFilters() {
  const query = $("goldSearch")?.value.trim().toLowerCase() || "";
  const country = $("goldCountryFilter")?.value || "all";
  const karat = $("goldKaratFilter")?.value || "all";

  visibleGold = getAllGold().filter(item => {
    const searchable = [
      item.country.name,
      item.country.country,
      item.purity.karat + "k",
      item.purity.label
    ].join(" ").toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (country === "all" || item.country.country === country) &&
      (karat === "all" || String(item.purity.karat) === karat)
    );
  });

  renderGold();
}

function resetGoldFilters() {
  if ($("goldSearch")) $("goldSearch").value = "";
  if ($("goldCountryFilter")) $("goldCountryFilter").value = "all";
  if ($("goldKaratFilter")) $("goldKaratFilter").value = "all";

  visibleGold = getAllGold();
  renderGold();
}

function showGoldDetails(id,karat) {
  const country = GOLD_MARKET.find(item => item.id === Number(id));
  const purity = PURITIES.find(item => item.karat === Number(karat));

  if (!country || !purity) return;

  selectedGold = {country,purity};

  const gram = getGoldPrice(country,purity);
  const tola = getTolaPrice(country,purity);

  $("goldModalTitle").textContent =
    `${country.name} — ${purity.label}`;

  $("goldModalBody").innerHTML = `
    <p><strong>দেশ:</strong> ${escapeHTML(country.country)}</p>
    <p><strong>ক্যারেট:</strong> ${purity.karat}K</p>
    <p><strong>বিশুদ্ধতা:</strong> ${(purity.purity*100).toFixed(2)}%</p>
    <p><strong>প্রতি গ্রাম:</strong> ${money(gram,country.currency)}</p>
    <p><strong>প্রতি ভরি:</strong> ${money(tola,country.currency)}</p>
    <p><strong>এক ভরি:</strong> ${TOLA_GRAMS} গ্রাম</p>
    <p class="notice">
      এগুলো নমুনা হিসাব। প্রকৃত বিক্রয়মূল্যে মজুরি,
      VAT, কর, দোকানের চার্জ ও বাজারের পার্থক্য থাকতে পারে।
    </p>
  `;

  $("goldModal").style.display = "block";
}

function closeGoldModal() {
  if ($("goldModal")) $("goldModal").style.display = "none";
}

/* AI Assistant — rule-based demo */

function runGoldAI() {
  const question = $("goldAIQuestion")?.value.trim().toLowerCase() || "";
  const answer = $("goldAIAnswer");

  if (!answer) return;

  if (!question) {
    answer.textContent = "প্রথমে আপনার প্রশ্ন লিখুন।";
    return;
  }

  let response;

  if (question.includes("২২") || question.includes("22")) {
    response = "২২ ক্যারেট স্বর্ণে তাত্ত্বিকভাবে ৯১.৬৭% বিশুদ্ধ স্বর্ণ থাকে।";
  } else if (question.includes("২১") || question.includes("21")) {
    response = "২১ ক্যারেট স্বর্ণে তাত্ত্বিকভাবে ৮৭.৫০% বিশুদ্ধ স্বর্ণ থাকে।";
  } else if (question.includes("১৮") || question.includes("18")) {
    response = "১৮ ক্যারেট স্বর্ণে ৭৫% বিশুদ্ধ স্বর্ণ থাকে।";
  } else if (question.includes("২৪") || question.includes("24")) {
    response = "২৪ ক্যারেট স্বর্ণকে প্রায় বিশুদ্ধ স্বর্ণ হিসেবে ধরা হয়।";
  } else if (
    question.includes("ভরি") ||
    question.includes("তোলা") ||
    question.includes("tola")
  ) {
    response = `১ ভরি বা ১ তোলা = ${TOLA_GRAMS} গ্রাম। প্রতি গ্রামের মূল্যকে ${TOLA_GRAMS} দিয়ে গুণ করলে ভরির আনুমানিক মূল্য পাওয়া যায়।`;
  } else if (
    question.includes("বাংলাদেশ") ||
    question.includes("bangladesh")
  ) {
    response = "বাংলাদেশে স্বর্ণের মূল্য নির্ধারণে ক্যারেট, স্থানীয় বাজারদর, মজুরি ও প্রযোজ্য কর বিবেচনা করতে হয়। স্থানীয় স্বর্ণ ব্যবসায়ী সমিতির প্রকাশিত দর যাচাই করুন।";
  } else if (
    question.includes("দাম") ||
    question.includes("price") ||
    question.includes("live")
  ) {
    response = "এই সংস্করণে নমুনা মূল্য দেখানো হচ্ছে, লাইভ আন্তর্জাতিক স্বর্ণের দাম নয়। নির্ভরযোগ্য লাইভ ডেটা API যুক্ত করলে প্রকৃত বাজারদর দেখানো যাবে।";
  } else {
    response = `বর্তমানে ${GOLD_MARKET.length}টি দেশের জন্য ২৪K, ২২K, ২১K ও ১৮K নমুনা হিসাব রয়েছে। ক্যারেট, বিশুদ্ধতা, ভরি বা বাজারদর সম্পর্কে প্রশ্ন করুন।`;
  }

  answer.textContent = response;
}

function setupGoldEvents() {
  $("goldSearch")?.addEventListener("input",applyGoldFilters);
  $("goldCountryFilter")?.addEventListener("change",applyGoldFilters);
  $("goldKaratFilter")?.addEventListener("change",applyGoldFilters);

  $("goldSearchBtn")?.addEventListener("click",applyGoldFilters);
  $("goldResetBtn")?.addEventListener("click",resetGoldFilters);
  $("goldRefreshBtn")?.addEventListener("click",refreshGoldMarket);

  $("goldAIButton")?.addEventListener("click",runGoldAI);

  $("goldAIQuestion")?.addEventListener("keydown",event => {
    if (event.key === "Enter") runGoldAI();
  });

  $("goldProductsContainer")?.addEventListener("click",event => {
    const button = event.target.closest("[data-gold-details]");
    if (!button) return;

    const [id,karat] = button.dataset.goldDetails.split("-");
    showGoldDetails(id,karat);
  });

  $("goldModalClose")?.addEventListener("click",closeGoldModal);

  $("goldModal")?.addEventListener("click",event => {
    if (event.target.id === "goldModal") closeGoldModal();
  });

  $("goldFullScreenBtn")?.addEventListener("click",() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  });

  $("goldHomeBtn")?.addEventListener("click",() => {
    location.href = "./index.html";
  });

  document.addEventListener("keydown",event => {
    if (event.key === "Escape") closeGoldModal();
  });
}

/* Optional API connection */

async function tryLoadGoldAPI() {
  if (!CONFIG.goldApiUrl) return false;

  try {
    const response = await fetch(CONFIG.goldApiUrl);

    if (!response.ok) {
      throw new Error("Gold API request failed");
    }

    const data = await response.json();
    console.info("External gold data received:",data);

    // Provider-specific data mapping must be added here.
    return true;
  } catch (error) {
    console.error("Gold API error:",error);
    return false;
  }
}

async function refreshGoldMarket() {
  if ($("goldMarketStatus")) {
    $("goldMarketStatus").textContent = "স্বর্ণের তথ্য রিফ্রেশ হচ্ছে...";
  }

  await tryLoadGoldAPI();

  if ($("goldMarketStatus")) {
    $("goldMarketStatus").textContent =
      "নমুনা হিসাব প্রস্তুত — লাইভ মূল্য সংযুক্ত নয়।";
  }

  applyGoldFilters();
}

function initGoldMarket() {
  if (!$("goldProductsContainer")) {
    console.error("Gold Market HTML elements not found.");
    return;
  }

  setupGoldEvents();

  visibleGold = getAllGold();
  renderGold();

  if ($("goldMarketStatus")) {
    $("goldMarketStatus").textContent =
      "নমুনা হিসাব প্রস্তুত — লাইভ মূল্য সংযুক্ত নয়।";
  }

  if (CONFIG.autoRefreshMinutes > 0) {
    setInterval(refreshGoldMarket,CONFIG.autoRefreshMinutes*60000);
  }

  console.log("AYNA BOOK World Gold Market initialized.");
}

/* Public API for AYNA BOOK */

window.AYNA_GOLD_MARKET = {
  countries:() => [...GOLD_MARKET],
  purities:() => [...PURITIES],
  products:getAllGold,
  search:query => {
    const q = String(query || "").toLowerCase();
    return getAllGold().filter(item =>
      `${item.country.name} ${item.country.country} ${item.purity.karat}K`
        .toLowerCase().includes(q)
    );
  },
  calculate:(countryName,karat) => {
    const country = GOLD_MARKET.find(
      item => item.country === countryName
    );
    const purity = PURITIES.find(
      item => item.karat === Number(karat)
    );

    if (!country || !purity) return null;

    return {
      perGram:getGoldPrice(country,purity),
      perTola:getTolaPrice(country,purity),
      currency:country.currency
    };
  },
  reset:resetGoldFilters
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded",initGoldMarket);
} else {
  initGoldMarket();
}
