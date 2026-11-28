/* =========================================================
   AYNA BOOK — World Construction Market
   File: construction-market.js
   Version: 1.0
   ========================================================= */

const CONSTRUCTION_MARKET = [
  {
    id: 1,
    name: "Cement",
    category: "cement",
    unit: "50 kg bag",
    country: "Bangladesh",
    price: 520,
    currency: "BDT",
    trend: "stable",
    description: "General construction cement.",
    stock: "Available"
  },
  {
    id: 2,
    name: "Portland Cement",
    category: "cement",
    unit: "50 kg bag",
    country: "India",
    price: 410,
    currency: "INR",
    trend: "up",
    description: "Portland cement for building construction.",
    stock: "Available"
  },
  {
    id: 3,
    name: "Rebar Steel Rod",
    category: "steel",
    unit: "1 ton",
    country: "Bangladesh",
    price: 92000,
    currency: "BDT",
    trend: "up",
    description: "Construction reinforcement steel rod.",
    stock: "Available"
  },
  {
    id: 4,
    name: "Structural Steel",
    category: "steel",
    unit: "1 ton",
    country: "USA",
    price: 980,
    currency: "USD",
    trend: "stable",
    description: "Structural steel for commercial and industrial buildings.",
    stock: "Available"
  },
  {
    id: 5,
    name: "Bricks",
    category: "brick",
    unit: "1000 pcs",
    country: "Bangladesh",
    price: 12500,
    currency: "BDT",
    trend: "stable",
    description: "Standard construction bricks.",
    stock: "Available"
  },
  {
    id: 6,
    name: "Concrete Blocks",
    category: "brick",
    unit: "100 pcs",
    country: "UAE",
    price: 850,
    currency: "AED",
    trend: "down",
    description: "Concrete masonry blocks.",
    stock: "Available"
  },
  {
    id: 7,
    name: "River Sand",
    category: "sand",
    unit: "1 truck",
    country: "Bangladesh",
    price: 18000,
    currency: "BDT",
    trend: "up",
    description: "Construction-grade river sand.",
    stock: "Available"
  },
  {
    id: 8,
    name: "Crushed Stone",
    category: "stone",
    unit: "1 ton",
    country: "India",
    price: 2200,
    currency: "INR",
    trend: "stable",
    description: "Crushed aggregate stone for concrete.",
    stock: "Available"
  },
  {
    id: 9,
    name: "Granite Stone",
    category: "stone",
    unit: "1 ton",
    country: "India",
    price: 4800,
    currency: "INR",
    trend: "up",
    description: "Granite stone for construction and finishing.",
    stock: "Available"
  },
  {
    id: 10,
    name: "Ceramic Tiles",
    category: "tiles",
    unit: "1 m²",
    country: "China",
    price: 9,
    currency: "USD",
    trend: "stable",
    description: "Ceramic floor and wall tiles.",
    stock: "Available"
  },
  {
    id: 11,
    name: "Porcelain Tiles",
    category: "tiles",
    unit: "1 m²",
    country: "Italy",
    price: 24,
    currency: "EUR",
    trend: "up",
    description: "Premium porcelain tiles.",
    stock: "Available"
  },
  {
    id: 12,
    name: "PVC Pipe",
    category: "pipe",
    unit: "4 meter",
    country: "Bangladesh",
    price: 650,
    currency: "BDT",
    trend: "stable",
    description: "PVC plumbing pipe.",
    stock: "Available"
  },
  {
    id: 13,
    name: "Steel Pipe",
    category: "pipe",
    unit: "6 meter",
    country: "China",
    price: 720,
    currency: "USD",
    trend: "up",
    description: "Steel pipe for construction projects.",
    stock: "Available"
  },
  {
    id: 14,
    name: "Plywood",
    category: "wood",
    unit: "1 sheet",
    country: "Malaysia",
    price: 32,
    currency: "USD",
    trend: "stable",
    description: "Construction and interior plywood.",
    stock: "Available"
  },
  {
    id: 15,
    name: "Construction Timber",
    category: "wood",
    unit: "1 m³",
    country: "Canada",
    price: 480,
    currency: "CAD",
    trend: "down",
    description: "Structural construction timber.",
    stock: "Available"
  },
  {
    id: 16,
    name: "Glass",
    category: "glass",
    unit: "1 m²",
    country: "China",
    price: 18,
    currency: "USD",
    trend: "stable",
    description: "Construction glass for windows and buildings.",
    stock: "Available"
  },
  {
    id: 17,
    name: "Aluminium Sheet",
    category: "metal",
    unit: "1 sheet",
    country: "UAE",
    price: 210,
    currency: "AED",
    trend: "up",
    description: "Aluminium construction sheet.",
    stock: "Available"
  },
  {
    id: 18,
    name: "Copper Wire",
    category: "electrical",
    unit: "100 meter",
    country: "China",
    price: 115,
    currency: "USD",
    trend: "up",
    description: "Electrical copper wire.",
    stock: "Available"
  },
  {
    id: 19,
    name: "Electrical Cable",
    category: "electrical",
    unit: "100 meter",
    country: "Bangladesh",
    price: 12500,
    currency: "BDT",
    trend: "stable",
    description: "Electrical construction cable.",
    stock: "Available"
  },
  {
    id: 20,
    name: "Paint",
    category: "paint",
    unit: "20 liter",
    country: "Bangladesh",
    price: 5200,
    currency: "BDT",
    trend: "stable",
    description: "Interior and exterior construction paint.",
    stock: "Available"
  },
  {
    id: 21,
    name: "Waterproofing Material",
    category: "chemical",
    unit: "20 kg",
    country: "Germany",
    price: 95,
    currency: "EUR",
    trend: "up",
    description: "Waterproofing construction material.",
    stock: "Available"
  },
  {
    id: 22,
    name: "Insulation Board",
    category: "insulation",
    unit: "1 sheet",
    country: "Germany",
    price: 18,
    currency: "EUR",
    trend: "stable",
    description: "Thermal and acoustic insulation board.",
    stock: "Available"
  }
];


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {
  currency: "BDT",

  /*
   Live API চাইলে এখানে API URL বসানো যাবে।
   খালি থাকলে built-in market data ব্যবহার হবে।
  */
  marketApiUrl: "",

  autoRefreshMinutes: 30
};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentProducts = [...CONSTRUCTION_MARKET];
let selectedProduct = null;


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(price, currency) {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "N/A";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2
    }).format(value) + " " + currency;
  } catch {
    return value + " " + currency;
  }
}


/* =========================================================
   TREND
   ========================================================= */

function trendLabel(trend) {
  if (trend === "up") {
    return "▲ Rising";
  }

  if (trend === "down") {
    return "▼ Falling";
  }

  return "● Stable";
}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(product) {
  const card = document.createElement("article");

  card.className = "market-card";

  card.innerHTML = `
    <div class="market-card-top">
      <span class="market-category">
        ${escapeHTML(product.category)}
      </span>

      <span class="market-trend ${escapeHTML(product.trend)}">
        ${trendLabel(product.trend)}
      </span>
    </div>

    <h3>${escapeHTML(product.name)}</h3>

    <div class="market-price">
      ${formatPrice(product.price, product.currency)}
    </div>

    <div class="market-unit">
      ${escapeHTML(product.unit)}
    </div>

    <div class="market-country">
      🌍 ${escapeHTML(product.country)}
    </div>

    <p>
      ${escapeHTML(product.description)}
    </p>

    <div class="market-stock">
      ${escapeHTML(product.stock)}
    </div>

    <button
      class="details-btn"
      type="button"
      data-product-id="${product.id}"
    >
      View Details
    </button>
  `;

  return card;
}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(products = currentProducts) {
  const container = $("productsContainer");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = `
      <div class="empty-market">
        <div>🔎</div>
        <strong>No construction products found</strong>
        <p>Try another search or category.</p>
      </div>
    `;

    updateStats(0);
    return;
  }

  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    fragment.appendChild(createProductCard(product));
  });

  container.appendChild(fragment);

  updateStats(products.length);
}


/* =========================================================
   STATS
   ========================================================= */

function updateStats(resultCount = currentProducts.length) {
  const total = $("totalProducts");
  const countries = $("countryCount");
  const results = $("resultCount");

  const countrySet = new Set(
    currentProducts.map(item => item.country)
  );

  if (total) {
    total.textContent = CONSTRUCTION_MARKET.length;
  }

  if (countries) {
    countries.textContent = countrySet.size;
  }

  if (results) {
    results.textContent = resultCount;
  }
}


/* =========================================================
   SEARCH + FILTER
   ========================================================= */

function applyFilters() {
  const search = ($("marketSearch")?.value || "")
    .trim()
    .toLowerCase();

  const category = $("categoryFilter")?.value || "all";
  const country = $("countryFilter")?.value || "all";
  const trend = $("trendFilter")?.value || "all";

  currentProducts = CONSTRUCTION_MARKET.filter(product => {

    const searchableText = [
      product.name,
      product.category,
      product.country,
      product.description,
      product.unit
    ]
      .join(" ")
      .toLowerCase();

    const searchMatch =
      !search ||
      searchableText.includes(search);

    const categoryMatch =
      category === "all" ||
      product.category === category;

    const countryMatch =
      country === "all" ||
      product.country === country;

    const trendMatch =
      trend === "all" ||
      product.trend === trend;

    return (
      searchMatch &&
      categoryMatch &&
      countryMatch &&
      trendMatch
    );
  });

  renderProducts(currentProducts);
}


/* =========================================================
   RESET FILTERS
   ========================================================= */

function resetFilters() {
  if ($("marketSearch")) {
    $("marketSearch").value = "";
  }

  if ($("categoryFilter")) {
    $("categoryFilter").value = "all";
  }

  if ($("countryFilter")) {
    $("countryFilter").value = "all";
  }

  if ($("trendFilter")) {
    $("trendFilter").value = "all";
  }

  currentProducts = [...CONSTRUCTION_MARKET];

  renderProducts(currentProducts);
}


/* =========================================================
   PRODUCT DETAILS
   ========================================================= */

function showProductDetails(productId) {
  const product = CONSTRUCTION_MARKET.find(
    item => String(item.id) === String(productId)
  );

  if (!product) {
    return;
  }

  selectedProduct = product;

  const modal = $("productModal");

  if (!modal) {
    alert(
      `${product.name}\n\n` +
      `Price: ${formatPrice(product.price, product.currency)}\n` +
      `Unit: ${product.unit}\n` +
      `Country: ${product.country}\n` +
      `Trend: ${trendLabel(product.trend)}\n\n` +
      product.description
    );

    return;
  }

  const title = $("modalProductName");
  const body = $("modalProductBody");

  if (title) {
    title.textContent = product.name;
  }

  if (body) {
    body.innerHTML = `
      <div class="detail-row">
        <span>Category</span>
        <strong>${escapeHTML(product.category)}</strong>
      </div>

      <div class="detail-row">
        <span>Price</span>
        <strong>
          ${formatPrice(product.price, product.currency)}
        </strong>
      </div>

      <div class="detail-row">
        <span>Unit</span>
        <strong>${escapeHTML(product.unit)}</strong>
      </div>

      <div class="detail-row">
        <span>Country</span>
        <strong>${escapeHTML(product.country)}</strong>
      </div>

      <div class="detail-row">
        <span>Market Trend</span>
        <strong>${trendLabel(product.trend)}</strong>
      </div>

      <div class="detail-row">
        <span>Availability</span>
        <strong>${escapeHTML(product.stock)}</strong>
      </div>

      <p class="detail-description">
        ${escapeHTML(product.description)}
      </p>
    `;
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeProductModal() {
  const modal = $("productModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");

  selectedProduct = null;
}


/* =========================================================
   CATEGORY QUICK BUTTONS
   ========================================================= */

function setupCategoryButtons() {
  const buttons = document.querySelectorAll(
    "[data-market-category]"
  );

  buttons.forEach(button => {
    button.addEventListener("click", () => {

      const category =
        button.getAttribute("data-market-category");

      if ($("categoryFilter")) {
        $("categoryFilter").value = category || "all";
      }

      applyFilters();
    });
  });
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

function setupEvents() {

  $("searchBtn")?.addEventListener(
    "click",
    applyFilters
  );

  $("resetBtn")?.addEventListener(
    "click",
    resetFilters
  );

  $("marketSearch")?.addEventListener(
    "keydown",
    event => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyFilters();
      }
    }
  );

  $("categoryFilter")?.addEventListener(
    "change",
    applyFilters
  );

  $("countryFilter")?.addEventListener(
    "change",
    applyFilters
  );

  $("trendFilter")?.addEventListener(
    "change",
    applyFilters
  );

  $("productsContainer")?.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest("[data-product-id]");

      if (!button) {
        return;
      }

      showProductDetails(
        button.getAttribute("data-product-id")
      );
    }
  );

  $("closeModalBtn")?.addEventListener(
    "click",
    closeProductModal
  );

  $("productModal")?.addEventListener(
    "click",
    event => {
      if (event.target === event.currentTarget) {
        closeProductModal();
      }
    }
  );

  $("fullScreenBtn")?.addEventListener(
    "click",
    toggleFullscreen
  );

  $("homeBtn")?.addEventListener(
    "click",
    () => {
      window.location.href = "./index.html";
    }
  );

  $("aiAnalyzeBtn")?.addEventListener(
    "click",
    runMarketAI
  );

  $("refreshMarketBtn")?.addEventListener(
    "click",
    refreshMarket
  );
}


/* =========================================================
   FULL SCREEN
   ========================================================= */

async function toggleFullscreen() {

  try {

    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }

  } catch (error) {
    console.warn(
      "Fullscreen unavailable:",
      error
    );
  }
}


/* =========================================================
   AI MARKET ANALYSIS
   ========================================================= */

function runMarketAI() {

  const input =
    ($("aiMarketQuestion")?.value || "").trim();

  const output = $("aiMarketAnswer");

  if (!output) {
    return;
  }

  let answer = "";

  if (!input) {

    answer =
      "AI Market Assistant: একটি প্রশ্ন লিখুন। " +
      "উদাহরণ: বাংলাদেশে রডের বাজার কেমন?";

  } else {

    const q = input.toLowerCase();

    if (
      q.includes("cement") ||
      q.includes("সিমেন্ট")
    ) {

      const items =
        CONSTRUCTION_MARKET.filter(
          p => p.category === "cement"
        );

      answer =
        `সিমেন্ট বিভাগে ${items.length}টি পণ্য পাওয়া গেছে। ` +
        `বর্তমান তালিকায় বিভিন্ন দেশের সিমেন্টের দাম তুলনা করা যাচ্ছে।`;

    } else if (
      q.includes("steel") ||
      q.includes("rod") ||
      q.includes("রড") ||
      q.includes("স্টিল")
    ) {

      const items =
        CONSTRUCTION_MARKET.filter(
          p =>
            p.category === "steel" ||
            p.category === "metal"
        );

      answer =
        `স্টিল/রড বিভাগে ${items.length}টি পণ্য আছে। ` +
        `দামের পরিবর্তন দেখতে Rising/Falling/Stable filter ব্যবহার করুন।`;

    } else if (
      q.includes("tile") ||
      q.includes("টাইল")
    ) {

      answer =
        "টাইলসের ক্ষেত্রে country, unit এবং price " +
        "তুলনা করে আপনার প্রকল্পের জন্য উপযুক্ত পণ্য নির্বাচন করুন।";

    } else if (
      q.includes("bangladesh") ||
      q.includes("বাংলাদেশ")
    ) {

      const items =
        CONSTRUCTION_MARKET.filter(
          p => p.country === "Bangladesh"
        );

      answer =
        `বাংলাদেশের জন্য ${items.length}টি নির্মাণসামগ্রী পাওয়া গেছে। ` +
        `Search ও category filter দিয়ে আরও নির্দিষ্ট ফলাফল দেখুন।`;

    } else {

      answer =
        "AI-ready Market Analysis: আপনার প্রশ্ন অনুযায়ী " +
        "নির্মাণসামগ্রীর category, country, price এবং market trend " +
        "তুলনা করা যেতে পারে।";

    }
  }

  output.textContent = answer;
}


/* =========================================================
   EXTERNAL MARKET API
   ========================================================= */

async function tryLoadExternalMarket() {

  if (!CONFIG.marketApiUrl) {
    return false;
  }

  try {

    const response =
      await fetch(CONFIG.marketApiUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid market API response"
      );
    }

    /*
      API data mapping এখানে প্রয়োজন অনুযায়ী করা যাবে।
      নিরাপত্তার জন্য অজানা API data সরাসরি render করা হচ্ছে না।
    */

    console.log(
      "External market data received:",
      data.length
    );

    return true;

  } catch (error) {

    console.warn(
      "External market API unavailable:",
      error
    );

    return false;
  }
}


/* =========================================================
   REFRESH
   ========================================================= */

async function refreshMarket() {

  const refreshBtn =
    $("refreshMarketBtn");

  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "Refreshing...";
  }

  try {

    await tryLoadExternalMarket();

    currentProducts = [...CONSTRUCTION_MARKET];

    renderProducts(currentProducts);

    const status = $("marketStatus");

    if (status) {
      status.textContent =
        "Market data refreshed";
    }

  } finally {

    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = "Refresh Market";
    }
  }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      closeProductModal();
    }

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initConstructionMarket() {

  setupEvents();

  setupCategoryButtons();

  renderProducts(CONSTRUCTION_MARKET);

  await tryLoadExternalMarket();

  /*
    Auto refresh শুধু local/demo data re-render করবে
    যতক্ষণ না একটি real API CONFIG.marketApiUrl-এ
    সংযুক্ত করা হচ্ছে।
  */

  if (CONFIG.autoRefreshMinutes > 0) {

    setInterval(
      refreshMarket,
      CONFIG.autoRefreshMinutes * 60 * 1000
    );
  }
}


/* =========================================================
   PUBLIC AYNA API
   ========================================================= */

window.AYNA_CONSTRUCTION_MARKET = {

  products() {
    return [...CONSTRUCTION_MARKET];
  },

  search(query = "") {

    const q =
      String(query)
        .trim()
        .toLowerCase();

    if (!q) {
      return [...CONSTRUCTION_MARKET];
    }

    return CONSTRUCTION_MARKET.filter(product =>
      [
        product.name,
        product.category,
        product.country,
        product.description
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  },

  filter(category = "all") {

    if (category === "all") {
      return [...CONSTRUCTION_MARKET];
    }

    return CONSTRUCTION_MARKET.filter(
      product => product.category === category
    );
  },

  reset() {
    resetFilters();
  },

  ai(question = "") {
    const input =
      $("aiMarketQuestion");

    if (input) {
      input.value = question;
    }

    runMarketAI();

    return $("aiMarketAnswer")?.textContent || "";
  }
};


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initConstructionMarket
  );

} else {

  initConstructionMarket();

}