/* =========================================================
   AYNA BOOK — World Beef Market
   File: beef-market.js
   Version: 1.0
   ========================================================= */

const BEEF_MARKET = [

  {
    id: 1,
    name: "Fresh Beef",
    category: "fresh",
    unit: "1 kg",
    country: "Bangladesh",
    price: 780,
    currency: "BDT",
    trend: "stable",
    description: "Fresh beef for household and restaurant use.",
    stock: "Available"
  },

  {
    id: 2,
    name: "Premium Fresh Beef",
    category: "premium",
    unit: "1 kg",
    country: "Bangladesh",
    price: 980,
    currency: "BDT",
    trend: "up",
    description: "Premium quality fresh beef.",
    stock: "Available"
  },

  {
    id: 3,
    name: "Frozen Beef",
    category: "frozen",
    unit: "1 kg",
    country: "India",
    price: 520,
    currency: "INR",
    trend: "stable",
    description: "Frozen beef for wholesale and food service.",
    stock: "Available"
  },

  {
    id: 4,
    name: "Beef Steak",
    category: "steak",
    unit: "1 kg",
    country: "USA",
    price: 24,
    currency: "USD",
    trend: "up",
    description: "Beef steak cut for restaurants and home cooking.",
    stock: "Available"
  },

  {
    id: 5,
    name: "Premium Angus Beef",
    category: "premium",
    unit: "1 kg",
    country: "USA",
    price: 38,
    currency: "USD",
    trend: "up",
    description: "Premium Angus beef product.",
    stock: "Available"
  },

  {
    id: 6,
    name: "Ground Beef",
    category: "mince",
    unit: "1 kg",
    country: "USA",
    price: 13,
    currency: "USD",
    trend: "stable",
    description: "Ground or minced beef.",
    stock: "Available"
  },

  {
    id: 7,
    name: "Beef Brisket",
    category: "fresh",
    unit: "1 kg",
    country: "Australia",
    price: 19,
    currency: "AUD",
    trend: "up",
    description: "Beef brisket suitable for slow cooking.",
    stock: "Available"
  },

  {
    id: 8,
    name: "Australian Premium Beef",
    category: "premium",
    unit: "1 kg",
    country: "Australia",
    price: 34,
    currency: "AUD",
    trend: "stable",
    description: "Premium Australian beef.",
    stock: "Available"
  },

  {
    id: 9,
    name: "Frozen Beef Cuts",
    category: "frozen",
    unit: "1 kg",
    country: "Brazil",
    price: 7.5,
    currency: "USD",
    trend: "down",
    description: "Frozen beef cuts for international food markets.",
    stock: "Available"
  },

  {
    id: 10,
    name: "Brazilian Beef",
    category: "fresh",
    unit: "1 kg",
    country: "Brazil",
    price: 8.2,
    currency: "USD",
    trend: "stable",
    description: "Brazilian beef market product.",
    stock: "Available"
  },

  {
    id: 11,
    name: "Argentine Beef Steak",
    category: "steak",
    unit: "1 kg",
    country: "Argentina",
    price: 21,
    currency: "USD",
    trend: "up",
    description: "Argentine-style premium steak.",
    stock: "Available"
  },

  {
    id: 12,
    name: "Argentine Beef",
    category: "fresh",
    unit: "1 kg",
    country: "Argentina",
    price: 17,
    currency: "USD",
    trend: "stable",
    description: "Fresh Argentine beef.",
    stock: "Available"
  },

  {
    id: 13,
    name: "New Zealand Beef",
    category: "fresh",
    unit: "1 kg",
    country: "New Zealand",
    price: 25,
    currency: "NZD",
    trend: "stable",
    description: "New Zealand beef product.",
    stock: "Available"
  },

  {
    id: 14,
    name: "Japanese Wagyu",
    category: "premium",
    unit: "1 kg",
    country: "Japan",
    price: 180,
    currency: "USD",
    trend: "up",
    description: "Premium Japanese Wagyu beef.",
    stock: "Limited"
  },

  {
    id: 15,
    name: "Japanese Beef Steak",
    category: "steak",
    unit: "1 kg",
    country: "Japan",
    price: 95,
    currency: "USD",
    trend: "up",
    description: "Premium Japanese steak cut.",
    stock: "Limited"
  },

  {
    id: 16,
    name: "UK Beef",
    category: "fresh",
    unit: "1 kg",
    country: "UK",
    price: 15,
    currency: "GBP",
    trend: "stable",
    description: "Fresh UK beef product.",
    stock: "Available"
  },

  {
    id: 17,
    name: "Canadian Beef",
    category: "fresh",
    unit: "1 kg",
    country: "Canada",
    price: 18,
    currency: "CAD",
    trend: "stable",
    description: "Canadian beef market product.",
    stock: "Available"
  },

  {
    id: 18,
    name: "Canadian Beef Steak",
    category: "steak",
    unit: "1 kg",
    country: "Canada",
    price: 27,
    currency: "CAD",
    trend: "up",
    description: "Canadian beef steak.",
    stock: "Available"
  },

  {
    id: 19,
    name: "Beef Liver",
    category: "offal",
    unit: "1 kg",
    country: "Bangladesh",
    price: 650,
    currency: "BDT",
    trend: "stable",
    description: "Beef liver for food markets.",
    stock: "Available"
  },

  {
    id: 20,
    name: "Beef Offal",
    category: "offal",
    unit: "1 kg",
    country: "India",
    price: 350,
    currency: "INR",
    trend: "down",
    description: "Beef offal product.",
    stock: "Available"
  },

  {
    id: 21,
    name: "Beef Sausage",
    category: "processed",
    unit: "1 kg",
    country: "Germany",
    price: 12,
    currency: "EUR",
    trend: "stable",
    description: "Processed beef sausage.",
    stock: "Available"
  },

  {
    id: 22,
    name: "Processed Beef",
    category: "processed",
    unit: "1 kg",
    country: "Germany",
    price: 16,
    currency: "EUR",
    trend: "up",
    description: "Processed beef food product.",
    stock: "Available"
  }

];


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {

  /*
   Real market API যুক্ত করতে এখানে URL বসানো যাবে।
   এখন খালি রাখা হয়েছে যাতে demo data নিরাপদে চলে।
  */
  marketApiUrl: "",

  autoRefreshMinutes: 30

};


/* =========================================================
   STATE
   ========================================================= */

let currentProducts = [
  ...BEEF_MARKET
];

let selectedProduct = null;


/* =========================================================
   DOM HELPER
   ========================================================= */

function $(id) {
  return document.getElementById(id);
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
   PRICE FORMAT
   ========================================================= */

function formatPrice(price, currency) {

  const value = Number(price);

  if (!Number.isFinite(value)) {
    return "N/A";
  }

  try {

    return (
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2
      }).format(value) +
      " " +
      currency
    );

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
   CREATE PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

  const card =
    document.createElement("article");

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


    <h3>
      ${escapeHTML(product.name)}
    </h3>


    <div class="market-price">
      ${formatPrice(
        product.price,
        product.currency
      )}
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
      type="button"
      class="details-btn"
      data-product-id="${product.id}"
    >
      View Beef Details
    </button>

  `;

  return card;

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(
  products = currentProducts
) {

  const container =
    $("productsContainer");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!products.length) {

    container.innerHTML = `

      <div class="empty-market">

        <div>
          🔎
        </div>

        <strong>
          No beef products found
        </strong>

        <p>
          Try another search or category.
        </p>

      </div>

    `;

    updateStats(0);

    return;
  }


  const fragment =
    document.createDocumentFragment();


  products.forEach(product => {

    fragment.appendChild(
      createProductCard(product)
    );

  });


  container.appendChild(fragment);

  updateStats(products.length);

}


/* =========================================================
   UPDATE STATS
   ========================================================= */

function updateStats(
  resultCount = currentProducts.length
) {

  const total =
    $("totalProducts");

  const countries =
    $("countryCount");

  const results =
    $("resultCount");

  const resultTop =
    $("resultCountTop");

  const categories =
    $("categoryCount");


  const countrySet =
    new Set(
      currentProducts.map(
        item => item.country
      )
    );


  const categorySet =
    new Set(
      BEEF_MARKET.map(
        item => item.category
      )
    );


  if (total) {
    total.textContent =
      BEEF_MARKET.length;
  }


  if (countries) {
    countries.textContent =
      countrySet.size;
  }


  if (results) {
    results.textContent =
      resultCount;
  }


  if (resultTop) {
    resultTop.textContent =
      resultCount;
  }


  if (categories) {
    categories.textContent =
      categorySet.size;
  }

}


/* =========================================================
   SEARCH + FILTER
   ========================================================= */

function applyFilters() {

  const search =
    (
      $("marketSearch")?.value ||
      ""
    )
      .trim()
      .toLowerCase();


  const category =
    $("categoryFilter")?.value ||
    "all";


  const country =
    $("countryFilter")?.value ||
    "all";


  currentProducts =
    BEEF_MARKET.filter(product => {

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


      return (
        searchMatch &&
        categoryMatch &&
        countryMatch
      );

    });


  renderProducts(
    currentProducts
  );

}


/* =========================================================
   RESET
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


  currentProducts =
    [...BEEF_MARKET];


  renderProducts(
    currentProducts
  );

}


/* =========================================================
   PRODUCT DETAILS
   ========================================================= */

function showProductDetails(productId) {

  const product =
    BEEF_MARKET.find(
      item =>
        String(item.id) ===
        String(productId)
    );


  if (!product) {
    return;
  }


  selectedProduct =
    product;


  const modal =
    $("productModal");


  if (!modal) {

    alert(

      `${product.name}\n\n` +

      `Price: ${
        formatPrice(
          product.price,
          product.currency
        )
      }\n` +

      `Unit: ${product.unit}\n` +

      `Country: ${product.country}\n` +

      `Trend: ${
        trendLabel(product.trend)
      }\n\n` +

      product.description

    );

    return;
  }


  const title =
    $("modalProductName");


  const body =
    $("modalProductBody");


  if (title) {
    title.textContent =
      product.name;
  }


  if (body) {

    body.innerHTML = `

      <div class="detail-row">

        <span>
          Category
        </span>

        <strong>
          ${escapeHTML(
            product.category
          )}
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Price
        </span>

        <strong>
          ${formatPrice(
            product.price,
            product.currency
          )}
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Unit
        </span>

        <strong>
          ${escapeHTML(
            product.unit
          )}
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Country
        </span>

        <strong>
          ${escapeHTML(
            product.country
          )}
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Market Trend
        </span>

        <strong>
          ${trendLabel(
            product.trend
          )}
        </strong>

      </div>


      <div class="detail-row">

        <span>
          Availability
        </span>

        <strong>
          ${escapeHTML(
            product.stock
          )}
        </strong>

      </div>


      <p class="detail-description">

        ${escapeHTML(
          product.description
        )}

      </p>

    `;

  }


  modal.classList.add("show");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeProductModal() {

  const modal =
    $("productModal");


  if (!modal) {
    return;
  }


  modal.classList.remove("show");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  selectedProduct =
    null;

}


/* =========================================================
   CATEGORY BUTTONS
   ========================================================= */

function setupCategoryButtons() {

  const buttons =
    document.querySelectorAll(
      "[data-market-category]"
    );


  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const category =
          button.getAttribute(
            "data-market-category"
          );


        if ($("categoryFilter")) {

          $("categoryFilter").value =
            category || "all";

        }


        applyFilters();

      }
    );

  });

}


/* =========================================================
   EVENTS
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


  $("productsContainer")?.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-product-id]"
        );


      if (!button) {
        return;
      }


      showProductDetails(
        button.getAttribute(
          "data-product-id"
        )
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

      if (
        event.target ===
        event.currentTarget
      ) {

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

      window.location.href =
        "./index.html";

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

      await document.documentElement
        .requestFullscreen();

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
   AI MARKET ASSISTANT
   ========================================================= */

function runMarketAI() {

  const input =
    (
      $("aiMarketQuestion")?.value ||
      ""
    ).trim();


  const output =
    $("aiMarketAnswer");


  if (!output) {
    return;
  }


  let answer = "";


  if (!input) {

    answer =
      "🤖 AI Market Assistant:\n\n" +
      "একটি প্রশ্ন লিখুন।\n\n" +
      "উদাহরণ:\n" +
      "• বাংলাদেশে Beef-এর বাজার কেমন?\n" +
      "• Premium Beef কোথায় পাওয়া যাচ্ছে?\n" +
      "• Steak সম্পর্কে বলুন।";

  } else {

    const q =
      input.toLowerCase();


    /* Bangladesh */

    if (
      q.includes("bangladesh") ||
      q.includes("বাংলাদেশ")
    ) {

      const items =
        BEEF_MARKET.filter(
          product =>
            product.country ===
            "Bangladesh"
        );


      answer =
        "🇧🇩 Bangladesh Beef Market\n\n" +

        `বর্তমান তালিকায় ` +
        `${items.length}টি পণ্য পাওয়া গেছে।\n\n` +

        items
          .map(
            item =>
              `• ${item.name}: ` +
              `${formatPrice(
                item.price,
                item.currency
              )}`
          )
          .join("\n") +

        "\n\nনোট: এগুলো demo/sample data।";

    }

    /* Premium */

    else if (
      q.includes("premium") ||
      q.includes("wagyu")
    ) {

      const items =
        BEEF_MARKET.filter(
          product =>
            product.category ===
            "premium"
        );


      answer =
        "👑 Premium Beef Analysis\n\n" +

        `${items.length}টি premium product পাওয়া গেছে।\n\n` +

        items
          .map(
            item =>
              `• ${item.name} — ` +
              `${formatPrice(
                item.price,
                item.currency
              )} — ${item.country}`
          )
          .join("\n") +

        "\n\nPremium products সাধারণত standard beef-এর চেয়ে বেশি দামের হয়।";

    }

    /* Steak */

    else if (
      q.includes("steak")
    ) {

      const items =
        BEEF_MARKET.filter(
          product =>
            product.category ===
            "steak"
        );


      answer =
        "🥩 Steak Market\n\n" +

        `${items.length}টি steak product পাওয়া গেছে।\n\n` +

        items
          .map(
            item =>
              `• ${item.name} — ` +
              `${formatPrice(
                item.price,
                item.currency
              )} — ${item.country}`
          )
          .join("\n");

    }

    /* Frozen */

    else if (
      q.includes("frozen") ||
      q.includes("ফ্রোজেন")
    ) {

      const items =
        BEEF_MARKET.filter(
          product =>
            product.category ===
            "frozen"
        );


      answer =
        "❄️ Frozen Beef Market\n\n" +

        `${items.length}টি frozen product পাওয়া গেছে।\n\n` +

        items
          .map(
            item =>
              `• ${item.name} — ` +
              `${formatPrice(
                item.price,
                item.currency
              )}`
          )
          .join("\n");

    }

    /* Mince */

    else if (
      q.includes("mince") ||
      q.includes("minced") ||
      q.includes("মিন্স")
    ) {

      const items =
        BEEF_MARKET.filter(
          product =>
            product.category ===
            "mince"
        );


      answer =
        "🍔 Minced Beef Market\n\n" +

        `${items.length}টি minced beef product পাওয়া গেছে।\n\n` +

        items
          .map(
            item =>
              `• ${item.name} — ` +
              `${formatPrice(
                item.price,
                item.currency
              )}`
          )
          .join("\n");

    }

    /* General */

    else {

      const rising =
        BEEF_MARKET.filter(
          item =>
            item.trend === "up"
        ).length;


      const falling =
        BEEF_MARKET.filter(
          item =>
            item.trend === "down"
        ).length;


      const stable =
        BEEF_MARKET.filter(
          item =>
            item.trend === "stable"
        ).length;


      answer =
        "🤖 AYNA AI Beef Market Analysis\n\n" +

        `মোট পণ্য: ${BEEF_MARKET.length}\n` +

        `Rising: ${rising}\n` +

        `Falling: ${falling}\n` +

        `Stable: ${stable}\n\n` +

        "আপনি country, premium, steak, " +
        "frozen অথবা minced beef সম্পর্কে " +
        "আরও নির্দিষ্ট প্রশ্ন করতে পারেন।";

    }

  }


  output.textContent =
    answer;

}


/* =========================================================
   EXTERNAL API
   ========================================================= */

async function tryLoadExternalMarket() {

  if (!CONFIG.marketApiUrl) {

    return false;

  }


  try {

    const response =
      await fetch(
        CONFIG.marketApiUrl,
        {
          method: "GET",

          headers: {
            "Accept":
              "application/json"
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        "Invalid market API response"
      );

    }


    console.log(
      "External beef market data:",
      data.length
    );


    return true;

  } catch (error) {

    console.warn(
      "External beef market API unavailable:",
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

    refreshBtn.disabled =
      true;

    refreshBtn.textContent =
      "Refreshing...";

  }


  try {

    const apiLoaded =
      await tryLoadExternalMarket();


    currentProducts =
      [...BEEF_MARKET];


    renderProducts(
      currentProducts
    );


    const status =
      $("marketStatus");


    if (status) {

      status.textContent =
        apiLoaded
          ? "● Live API Data"
          : "● Demo Market Data";

    }

  } finally {

    if (refreshBtn) {

      refreshBtn.disabled =
        false;

      refreshBtn.textContent =
        "🔄 Refresh Market";

    }

  }

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

async function initBeefMarket() {

  setupEvents();

  setupCategoryButtons();

  renderProducts(
    BEEF_MARKET
  );


  const status =
    $("marketStatus");


  if (status) {

    status.textContent =
      "● Demo Market Data";

  }


  await tryLoadExternalMarket();


  if (
    CONFIG.autoRefreshMinutes > 0
  ) {

    setInterval(
      refreshMarket,
      CONFIG.autoRefreshMinutes *
      60 *
      1000
    );

  }

}


/* =========================================================
   PUBLIC AYNA API
   ========================================================= */

window.AYNA_BEEF_MARKET = {

  products() {

    return [
      ...BEEF_MARKET
    ];

  },


  search(query = "") {

    const q =
      String(query)
        .trim()
        .toLowerCase();


    if (!q) {

      return [
        ...BEEF_MARKET
      ];

    }


    return BEEF_MARKET.filter(
      product =>
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

      return [
        ...BEEF_MARKET
      ];

    }


    return BEEF_MARKET.filter(
      product =>
        product.category ===
        category
    );

  },


  byCountry(country = "all") {

    if (country === "all") {

      return [
        ...BEEF_MARKET
      ];

    }


    return BEEF_MARKET.filter(
      product =>
        product.country ===
        country
    );

  },


  reset() {

    resetFilters();

  },


  ai(question = "") {

    const input =
      $("aiMarketQuestion");


    if (input) {

      input.value =
        question;

    }


    runMarketAI();


    return (
      $("aiMarketAnswer")
        ?.textContent ||
      ""
    );

  }

};


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initBeefMarket
  );

} else {

  initBeefMarket();

}