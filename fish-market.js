
/* =====================================================
   AYNA BOOK — WORLD FISH MARKET
   File: fish-market.js
   Version: 1.0
   Demo market data — no Firebase required
===================================================== */

"use strict";

const FISH_MARKET = [
  {
    id: 1,
    name: "ইলিশ মাছ (Hilsa)",
    english: "Hilsa Fish",
    country: "Bangladesh",
    category: "freshwater",
    price: 1200,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "উচ্চ চাহিদা",
    description: "বাংলাদেশের জনপ্রিয় ইলিশ মাছ। নদী ও সমুদ্রের ইলিশের দাম আলাদা হতে পারে।",
    stock: "বাজারভেদে পাওয়া যায়"
  },
  {
    id: 2,
    name: "রুই মাছ (Rohu)",
    english: "Rohu Fish",
    country: "Bangladesh",
    category: "freshwater",
    price: 350,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐠",
    trend: "সাধারণ",
    description: "বাংলাদেশ ও দক্ষিণ এশিয়ার জনপ্রিয় মিঠাপানির মাছ।",
    stock: "সাধারণত পাওয়া যায়"
  },
  {
    id: 3,
    name: "কাতলা মাছ (Catla)",
    english: "Catla Fish",
    country: "India",
    category: "freshwater",
    price: 420,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "সাধারণ",
    description: "দক্ষিণ এশিয়ার পুকুর ও নদীতে চাষ করা হয়।",
    stock: "বাজারভেদে পাওয়া যায়"
  },
  {
    id: 4,
    name: "পাঙ্গাস মাছ (Pangasius)",
    english: "Pangasius",
    country: "Vietnam",
    category: "freshwater",
    price: 280,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "সাধারণ",
    description: "চাষকৃত মিঠাপানির মাছ।",
    stock: "বাজারভেদে পাওয়া যায়"
  },
  {
    id: 5,
    name: "তেলাপিয়া মাছ (Tilapia)",
    english: "Tilapia",
    country: "Thailand",
    category: "freshwater",
    price: 300,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐠",
    trend: "সাধারণ",
    description: "বিশ্বজুড়ে চাষ করা জনপ্রিয় মাছ।",
    stock: "বাজারভেদে পাওয়া যায়"
  },
  {
    id: 6,
    name: "স্যামন মাছ (Salmon)",
    english: "Atlantic Salmon",
    country: "Norway",
    category: "seafood",
    price: 2200,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "প্রিমিয়াম",
    description: "আন্তর্জাতিক বাজারে জনপ্রিয় সামুদ্রিক মাছ।",
    stock: "আমদানিনির্ভর"
  },
  {
    id: 7,
    name: "টুনা মাছ (Tuna)",
    english: "Yellowfin Tuna",
    country: "Japan",
    category: "seafood",
    price: 1800,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "উচ্চ চাহিদা",
    description: "বিশ্ববাজারে তাজা ও প্রক্রিয়াজাত অবস্থায় বিক্রি হয়।",
    stock: "বাজারভেদে পাওয়া যায়"
  },
  {
    id: 8,
    name: "কড মাছ (Cod)",
    english: "Atlantic Cod",
    country: "Norway",
    category: "seafood",
    price: 1600,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "প্রিমিয়াম",
    description: "উত্তর আটলান্টিক অঞ্চলের পরিচিত মাছ।",
    stock: "আমদানিনির্ভর"
  },
  {
    id: 9,
    name: "চিংড়ি (Tiger Shrimp)",
    english: "Black Tiger Shrimp",
    country: "Bangladesh",
    category: "shellfish",
    price: 950,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🦐",
    trend: "রপ্তানিমুখী",
    description: "বাংলাদেশের গুরুত্বপূর্ণ রপ্তানি পণ্যগুলোর একটি।",
    stock: "আকার ও মানভেদে পাওয়া যায়"
  },
  {
    id: 10,
    name: "গলদা চিংড়ি",
    english: "Freshwater Prawn",
    country: "Bangladesh",
    category: "shellfish",
    price: 1100,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🦐",
    trend: "প্রিমিয়াম",
    description: "মিঠাপানির বড় আকারের চিংড়ি।",
    stock: "মৌসুমভেদে পাওয়া যায়"
  },
  {
    id: 11,
    name: "কাঁকড়া (Mud Crab)",
    english: "Mud Crab",
    country: "Bangladesh",
    category: "shellfish",
    price: 850,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🦀",
    trend: "রপ্তানিমুখী",
    description: "উপকূলীয় অঞ্চলের পরিচিত সামুদ্রিক খাবার।",
    stock: "আকারভেদে পাওয়া যায়"
  },
  {
    id: 12,
    name: "ফ্রোজেন চিংড়ি",
    english: "Frozen Shrimp",
    country: "India",
    category: "frozen",
    price: 780,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "❄️",
    trend: "সাধারণ",
    description: "হিমায়িত অবস্থায় সংরক্ষিত চিংড়ি।",
    stock: "সরবরাহভেদে পাওয়া যায়"
  },
  {
    id: 13,
    name: "ফ্রোজেন স্যামন",
    english: "Frozen Salmon",
    country: "Norway",
    category: "frozen",
    price: 1900,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "❄️",
    trend: "প্রিমিয়াম",
    description: "হিমায়িত সামুদ্রিক মাছ।",
    stock: "আমদানিনির্ভর"
  },
  {
    id: 14,
    name: "ওয়াগিউ টুনা",
    english: "Premium Bluefin Tuna",
    country: "Japan",
    category: "premium",
    price: 6500,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "⭐",
    trend: "অতি প্রিমিয়াম",
    description: "বিশেষ মানের ব্লুফিন টুনা। প্রকৃত মূল্য মান ও উৎসভেদে ব্যাপক পরিবর্তিত হয়।",
    stock: "বিশেষ বাজারে পাওয়া যায়"
  },
  {
    id: 15,
    name: "শুঁটকি লইট্টা",
    english: "Dried Bombay Duck",
    country: "Bangladesh",
    category: "dried",
    price: 900,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "☀️",
    trend: "মৌসুমি",
    description: "বাংলাদেশের উপকূলীয় অঞ্চলের পরিচিত শুঁটকি মাছ।",
    stock: "মৌসুমভেদে পাওয়া যায়"
  },
  {
    id: 16,
    name: "শুঁটকি চিংড়ি",
    english: "Dried Shrimp",
    country: "Bangladesh",
    category: "dried",
    price: 1300,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "☀️",
    trend: "সাধারণ",
    description: "রান্নায় ব্যবহৃত শুকনো চিংড়ি।",
    stock: "বাজারভেদে পাওয়া যায়"
  },
  {
    id: 17,
    name: "ম্যাকারেল",
    english: "Mackerel",
    country: "Australia",
    category: "seafood",
    price: 750,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "সাধারণ",
    description: "সামুদ্রিক মাছ, তাজা ও হিমায়িত দুইভাবেই পাওয়া যায়।",
    stock: "সরবরাহভেদে পাওয়া যায়"
  },
  {
    id: 18,
    name: "সার্ডিন",
    english: "Sardine",
    country: "USA",
    category: "seafood",
    price: 600,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐟",
    trend: "সাধারণ",
    description: "ছোট আকারের সামুদ্রিক মাছ।",
    stock: "সরবরাহভেদে পাওয়া যায়"
  },
  {
    id: 19,
    name: "স্ন্যাপার",
    english: "Red Snapper",
    country: "Australia",
    category: "premium",
    price: 1700,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "⭐",
    trend: "প্রিমিয়াম",
    description: "উচ্চমানের সামুদ্রিক মাছ হিসেবে পরিচিত।",
    stock: "বাজারভেদে পাওয়া যায়"
  },
  {
    id: 20,
    name: "মাহি-মাহি",
    english: "Mahi Mahi",
    country: "USA",
    category: "seafood",
    price: 1400,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐠",
    trend: "সাধারণ",
    description: "উষ্ণ সামুদ্রিক অঞ্চলে পাওয়া যায়।",
    stock: "আমদানিনির্ভর"
  },
  {
    id: 21,
    name: "মাসেল",
    english: "Mussels",
    country: "Norway",
    category: "shellfish",
    price: 1250,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐚",
    trend: "বিশেষ পণ্য",
    description: "খাদ্য হিসেবে ব্যবহৃত সামুদ্রিক শেলফিশ।",
    stock: "বিশেষ বাজারে পাওয়া যায়"
  },
  {
    id: 22,
    name: "অয়েস্টার",
    english: "Oyster",
    country: "Japan",
    category: "shellfish",
    price: 2000,
    currency: "BDT",
    unit: "প্রতি কেজি",
    icon: "🐚",
    trend: "প্রিমিয়াম",
    description: "বিশ্বের বিভিন্ন দেশে জনপ্রিয় সামুদ্রিক শেলফিশ।",
    stock: "বিশেষ বাজারে পাওয়া যায়"
  }
];

const CONFIG = {
  marketApiUrl: "",
  autoRefreshMinutes: 30
};

let visibleProducts = [...FISH_MARKET];

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatPrice(product) {
  return `${Number(product.price).toLocaleString("en-US")} ${escapeHTML(product.currency)} ${escapeHTML(product.unit)}`;
}

function getCategoryName(category) {
  const names = {
    freshwater: "মিঠাপানির মাছ",
    seafood: "সামুদ্রিক মাছ",
    frozen: "হিমায়িত মাছ",
    premium: "প্রিমিয়াম মাছ",
    shellfish: "চিংড়ি ও শেলফিশ",
    dried: "শুঁটকি মাছ"
  };

  return names[category] || "অন্যান্য";
}

function createProductCard(product) {
  return `
    <article class="product-card">
      <div class="fish-icon">
        ${escapeHTML(product.icon)}
      </div>

      <h3>${escapeHTML(product.name)}</h3>

      <p><strong>${escapeHTML(product.english)}</strong></p>

      <p>🌍 দেশ: ${escapeHTML(product.country)}</p>

      <p>📦 ক্যাটাগরি: ${getCategoryName(product.category)}</p>

      <p class="price">${formatPrice(product)}</p>

      <p>📊 বাজার অবস্থা: ${escapeHTML(product.trend)}</p>

      <button type="button" data-details-id="${product.id}">
        বিস্তারিত দেখুন
      </button>
    </article>
  `;
}

function renderProducts(products = visibleProducts) {
  const container = $("productsContainer");

  if (!container) return;

  if (!products.length) {
    container.innerHTML = `
      <p>দুঃখিত! আপনার অনুসন্ধানে কোনো মাছ পাওয়া যায়নি।</p>
    `;
  } else {
    container.innerHTML = products.map(createProductCard).join("");
  }

  updateStats(products);
}

function updateStats(products = visibleProducts) {
  const countries = new Set(
    FISH_MARKET.map(product => product.country)
  );

  const categories = new Set(
    FISH_MARKET.map(product => product.category)
  );

  $("totalProducts").textContent = FISH_MARKET.length;
  $("countryCount").textContent = countries.size;
  $("resultCount").textContent = products.length;
  $("resultCountTop").textContent = products.length;
  $("categoryCount").textContent = categories.size;
}

function applyFilters() {
  const query = $("marketSearch").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const country = $("countryFilter").value;

  visibleProducts = FISH_MARKET.filter(product => {
    const searchable = [
      product.name,
      product.english,
      product.country,
      product.description,
      product.trend
    ].join(" ").toLowerCase();

    const matchesSearch = !query || searchable.includes(query);
    const matchesCategory =
      category === "all" || product.category === category;
    const matchesCountry =
      country === "all" || product.country === country;

    return matchesSearch && matchesCategory && matchesCountry;
  });

  renderProducts();
}

function resetFilters() {
  $("marketSearch").value = "";
  $("categoryFilter").value = "all";
  $("countryFilter").value = "all";

  visibleProducts = [...FISH_MARKET];
  renderProducts();
}

function showProductDetails(id) {
  const product = FISH_MARKET.find(item => item.id === Number(id));

  if (!product) return;

  $("modalProductName").textContent =
    `${product.icon} ${product.name}`;

  $("modalProductBody").innerHTML = `
    <p><strong>ইংরেজি নাম:</strong> ${escapeHTML(product.english)}</p>
    <p><strong>দেশ:</strong> ${escapeHTML(product.country)}</p>
    <p><strong>ক্যাটাগরি:</strong> ${getCategoryName(product.category)}</p>
    <p><strong>নমুনা মূল্য:</strong> ${formatPrice(product)}</p>
    <p><strong>বাজার অবস্থা:</strong> ${escapeHTML(product.trend)}</p>
    <p><strong>সরবরাহ:</strong> ${escapeHTML(product.stock)}</p>
    <p><strong>বিবরণ:</strong> ${escapeHTML(product.description)}</p>
    <p class="notice">
      এই মূল্য নমুনা তথ্য। প্রকৃত বাজারদর যাচাই করে নিন।
    </p>
  `;

  $("productModal").style.display = "block";
}

function closeProductModal() {
  $("productModal").style.display = "none";
}

/* AI Assistant: rule-based demo, not a connected AI service */

function runMarketAI() {
  const question = $("aiMarketQuestion").value.trim().toLowerCase();
  const answer = $("aiMarketAnswer");

  if (!question) {
    answer.textContent = "প্রথমে আপনার প্রশ্ন লিখুন।";
    return;
  }

  let response = "";

  if (
    question.includes("বাংলাদেশ") ||
    question.includes("ইলিশ") ||
    question.includes("রুই")
  ) {
    const localFish = FISH_MARKET.filter(
      item => item.country === "Bangladesh"
    );

    response =
      "বাংলাদেশের নমুনা তালিকায় রয়েছে: " +
      localFish.map(item => item.name).join(", ") +
      "। স্থানীয় বাজারে প্রকৃত দাম যাচাই করুন।";
  } else if (
    question.includes("চিংড়ি") ||
    question.includes("shrimp")
  ) {
    const shrimp = FISH_MARKET.filter(
      item => item.category === "shellfish" &&
      (item.name.includes("চিংড়ি") || item.english.includes("Shrimp"))
    );

    response =
      "চিংড়ি পণ্যের নমুনা তালিকা: " +
      shrimp.map(item => `${item.name} — ${formatPrice(item)}`).join("; ");
  } else if (
    question.includes("সামুদ্রিক") ||
    question.includes("sea")
  ) {
    const seafood = FISH_MARKET.filter(
      item => item.category === "seafood"
    );

    response =
      "সামুদ্রিক মাছের তালিকা: " +
      seafood.map(item => item.name).join(", ");
  } else if (
    question.includes("হিমায়িত") ||
    question.includes("frozen")
  ) {
    const frozen = FISH_MARKET.filter(
      item => item.category === "frozen"
    );

    response =
      "হিমায়িত পণ্য: " +
      frozen.map(item => item.name).join(", ");
  } else if (
    question.includes("দাম") ||
    question.includes("price")
  ) {
    response =
      "এই পৃষ্ঠার দামগুলো নমুনা। এগুলোকে লাইভ বাজারদর মনে করবেন না। " +
      "সঠিক মূল্য জানতে স্থানীয় বাজার, বিক্রেতা বা নির্ভরযোগ্য বাজার API প্রয়োজন।";
  } else if (
    question.includes("তাজা") ||
    question.includes("fresh")
  ) {
    response =
      "তাজা মাছ কেনার সময় গন্ধ, চোখ, ফুলকা, মাংসের দৃঢ়তা এবং " +
      "সঠিকভাবে বরফে সংরক্ষণ করা হয়েছে কি না যাচাই করুন।";
  } else {
    response =
      `আমাদের তালিকায় ${FISH_MARKET.length}টি নমুনা পণ্য এবং ` +
      `${new Set(FISH_MARKET.map(p => p.country)).size}টি দেশের তথ্য রয়েছে। ` +
      "মাছের নাম, দেশ, দাম অথবা সংরক্ষণ বিষয়ে প্রশ্ন করুন।";
  }

  answer.textContent = response;
}

function setupCategoryButtons() {
  document.querySelectorAll("[data-market-category]").forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.marketCategory;

      $("categoryFilter").value = category;
      $("marketSearch").value = "";
      $("countryFilter").value = "all";

      applyFilters();

      document.querySelector(".section:nth-of-type(5)")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {
      $("marketStatus").textContent =
        "এই ব্রাউজারে Full Screen চালু করা যায়নি।";
    });
  } else {
    document.exitFullscreen?.();
  }
}

function setupEvents() {
  $("searchBtn").addEventListener("click", applyFilters);
  $("resetBtn").addEventListener("click", resetFilters);
  $("refreshMarketBtn").addEventListener("click", refreshMarket);

  $("marketSearch").addEventListener("input", applyFilters);
  $("categoryFilter").addEventListener("change", applyFilters);
  $("countryFilter").addEventListener("change", applyFilters);

  $("aiAnalyzeBtn").addEventListener("click", runMarketAI);

  $("aiMarketQuestion").addEventListener("keydown", event => {
    if (event.key === "Enter") runMarketAI();
  });

  $("productsContainer").addEventListener("click", event => {
    const button = event.target.closest("[data-details-id]");

    if (button) {
      showProductDetails(button.dataset.detailsId);
    }
  });

  $("closeModalBtn").addEventListener("click", closeProductModal);

  $("productModal").addEventListener("click", event => {
    if (event.target.id === "productModal") {
      closeProductModal();
    }
  });

  $("fullScreenBtn").addEventListener("click", toggleFullscreen);

  $("homeBtn").addEventListener("click", () => {
    window.location.href = "./index.html";
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeProductModal();
  });

  setupCategoryButtons();
}

/* Optional external API connection.
   Leave marketApiUrl empty until a real provider is configured. */

async function tryLoadExternalMarket() {
  if (!CONFIG.marketApiUrl) return false;

  try {
    const response = await fetch(CONFIG.marketApiUrl);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected API data format");
    }

    console.info("External fish market data received.", data);
    return true;
  } catch (error) {
    console.error("Fish market API:", error);
    return false;
  }
}

async function refreshMarket() {
  $("marketStatus").textContent = "বাজারের তথ্য রিফ্রেশ হচ্ছে...";

  await tryLoadExternalMarket();

  $("marketStatus").textContent =
    "নমুনা বাজারের তথ্য প্রস্তুত — লাইভ মূল্য সংযুক্ত নয়।";

  applyFilters();
}

function initFishMarket() {
  if (!$("productsContainer")) {
    console.error("Fish Market HTML elements were not found.");
    return;
  }

  setupEvents();
  visibleProducts = [...FISH_MARKET];
  renderProducts();

  $("marketStatus").textContent =
    "নমুনা বাজারের তথ্য প্রস্তুত — লাইভ মূল্য সংযুক্ত নয়।";

  if (CONFIG.autoRefreshMinutes > 0) {
    setInterval(refreshMarket, CONFIG.autoRefreshMinutes * 60 * 1000);
  }

  console.log("AYNA BOOK World Fish Market initialized.");
}

/* Public interface for other AYNA BOOK pages */

window.AYNA_FISH_MARKET = {
  products: () => [...FISH_MARKET],
  search: query => {
    const q = String(query || "").toLowerCase();

    return FISH_MARKET.filter(product =>
      `${product.name} ${product.english} ${product.country}`
        .toLowerCase()
        .includes(q)
    );
  },
  filter: category =>
    FISH_MARKET.filter(product =>
      category === "all" || product.category === category
    ),
  byCountry: country =>
    FISH_MARKET.filter(product => product.country === country),
  reset: resetFilters,
  ai: question => {
    $("aiMarketQuestion").value = question;
    runMarketAI();
    return $("aiMarketAnswer").textContent;
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFishMarket);
} else {
  initFishMarket();
}
