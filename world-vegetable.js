/* =========================================================
   AYNA BOOK — World Vegetable Market
   File: world-vegetable.js

   Features:
   ✓ Country filter
   ✓ Category filter
   ✓ Product search
   ✓ Daily price table
   ✓ Price up/down statistics
   ✓ Product cards
   ✓ Refresh button
   ✓ Update timestamp
   ✓ Fast local rendering
   ✓ API-ready architecture
   ✓ Demo fallback data
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const AYNA_VEGETABLE_CONFIG = {
  mode: "DEMO",

  /*
    বাস্তব API ব্যবহার করতে চাইলে এখানে URL বসাতে পারবেন।

    Example:
    apiUrl: "https://your-api.example.com/vegetables"

    নিরাপত্তার কারণে Firebase/API secret কখনো
    এই public JavaScript ফাইলে রাখবেন না।
  */
  apiUrl: "",

  currency: "BDT",
  currencySymbol: "৳",

  marketLabel: "World Vegetable Market",

  /*
    DEMO data notice
  */
  demoNotice:
    "বর্তমান তালিকার দামগুলো DEMO/sample data। বাস্তব দৈনিক বাজারদরের জন্য verified market API বা Firebase data source যুক্ত করতে হবে."
};


/* =========================================================
   DEMO VEGETABLE DATA
========================================================= */

const VEGETABLE_DATA = [

  /* ================= BANGLADESH ================= */

  {
    id: "bd-potato",
    product: "Potato",
    localName: "আলু",
    country: "Bangladesh",
    market: "Dhaka",
    category: "vegetable",
    today: 38,
    previous: 36,
    unit: "kg"
  },

  {
    id: "bd-tomato",
    product: "Tomato",
    localName: "টমেটো",
    country: "Bangladesh",
    market: "Dhaka",
    category: "vegetable",
    today: 70,
    previous: 65,
    unit: "kg"
  },

  {
    id: "bd-onion",
    product: "Onion",
    localName: "পেঁয়াজ",
    country: "Bangladesh",
    market: "Chattogram",
    category: "vegetable",
    today: 85,
    previous: 88,
    unit: "kg"
  },

  {
    id: "bd-eggplant",
    product: "Eggplant",
    localName: "বেগুন",
    country: "Bangladesh",
    market: "Dhaka",
    category: "vegetable",
    today: 60,
    previous: 55,
    unit: "kg"
  },

  {
    id: "bd-cucumber",
    product: "Cucumber",
    localName: "শসা",
    country: "Bangladesh",
    market: "Chattogram",
    category: "vegetable",
    today: 55,
    previous: 58,
    unit: "kg"
  },

  {
    id: "bd-carrot",
    product: "Carrot",
    localName: "গাজর",
    country: "Bangladesh",
    market: "Dhaka",
    category: "root",
    today: 75,
    previous: 70,
    unit: "kg"
  },

  {
    id: "bd-cabbage",
    product: "Cabbage",
    localName: "বাঁধাকপি",
    country: "Bangladesh",
    market: "Dhaka",
    category: "vegetable",
    today: 45,
    previous: 48,
    unit: "kg"
  },

  {
    id: "bd-cauliflower",
    product: "Cauliflower",
    localName: "ফুলকপি",
    country: "Bangladesh",
    market: "Chattogram",
    category: "vegetable",
    today: 50,
    previous: 45,
    unit: "kg"
  },

  {
    id: "bd-spinach",
    product: "Spinach",
    localName: "পালং শাক",
    country: "Bangladesh",
    market: "Dhaka",
    category: "leafy",
    today: 35,
    previous: 32,
    unit: "kg"
  },

  {
    id: "bd-pumpkin",
    product: "Pumpkin",
    localName: "মিষ্টি কুমড়া",
    country: "Bangladesh",
    market: "Dhaka",
    category: "vegetable",
    today: 48,
    previous: 50,
    unit: "kg"
  },

  {
    id: "bd-green-chili",
    product: "Green Chili",
    localName: "কাঁচা মরিচ",
    country: "Bangladesh",
    market: "Chattogram",
    category: "vegetable",
    today: 140,
    previous: 125,
    unit: "kg"
  },

  {
    id: "bd-okra",
    product: "Okra",
    localName: "ঢেঁড়স",
    country: "Bangladesh",
    market: "Dhaka",
    category: "vegetable",
    today: 65,
    previous: 68,
    unit: "kg"
  },

  {
    id: "bd-bottle-gourd",
    product: "Bottle Gourd",
    localName: "লাউ",
    country: "Bangladesh",
    market: "Dhaka",
    category: "vegetable",
    today: 55,
    previous: 52,
    unit: "kg"
  },

  {
    id: "bd-bitter-gourd",
    product: "Bitter Gourd",
    localName: "করলা",
    country: "Bangladesh",
    market: "Chattogram",
    category: "vegetable",
    today: 80,
    previous: 85,
    unit: "kg"
  },

  {
    id: "bd-radish",
    product: "Radish",
    localName: "মূলা",
    country: "Bangladesh",
    market: "Dhaka",
    category: "root",
    today: 42,
    previous: 40,
    unit: "kg"
  },


  /* ================= INDIA ================= */

  {
    id: "in-potato",
    product: "Potato",
    localName: "আলু",
    country: "India",
    market: "Kolkata",
    category: "vegetable",
    today: 32,
    previous: 30,
    unit: "kg"
  },

  {
    id: "in-tomato",
    product: "Tomato",
    localName: "টমেটো",
    country: "India",
    market: "Kolkata",
    category: "vegetable",
    today: 48,
    previous: 52,
    unit: "kg"
  },

  {
    id: "in-onion",
    product: "Onion",
    localName: "পেঁয়াজ",
    country: "India",
    market: "Delhi",
    category: "vegetable",
    today: 42,
    previous: 40,
    unit: "kg"
  },

  {
    id: "in-carrot",
    product: "Carrot",
    localName: "গাজর",
    country: "India",
    market: "Delhi",
    category: "root",
    today: 55,
    previous: 58,
    unit: "kg"
  },

  {
    id: "in-cucumber",
    product: "Cucumber",
    localName: "শসা",
    country: "India",
    market: "Mumbai",
    category: "vegetable",
    today: 45,
    previous: 42,
    unit: "kg"
  },

  {
    id: "in-spinach",
    product: "Spinach",
    localName: "পালং শাক",
    country: "India",
    market: "Delhi",
    category: "leafy",
    today: 30,
    previous: 28,
    unit: "kg"
  },


  /* ================= PAKISTAN ================= */

  {
    id: "pk-potato",
    product: "Potato",
    localName: "আলু",
    country: "Pakistan",
    market: "Lahore",
    category: "vegetable",
    today: 70,
    previous: 68,
    unit: "kg"
  },

  {
    id: "pk-tomato",
    product: "Tomato",
    localName: "টমেটো",
    country: "Pakistan",
    market: "Lahore",
    category: "vegetable",
    today: 95,
    previous: 100,
    unit: "kg"
  },

  {
    id: "pk-onion",
    product: "Onion",
    localName: "পেঁয়াজ",
    country: "Pakistan",
    market: "Karachi",
    category: "vegetable",
    today: 78,
    previous: 75,
    unit: "kg"
  },


  /* ================= SAUDI ARABIA ================= */

  {
    id: "sa-potato",
    product: "Potato",
    localName: "Potato",
    country: "Saudi Arabia",
    market: "Riyadh",
    category: "vegetable",
    today: 5.5,
    previous: 5.2,
    unit: "kg"
  },

  {
    id: "sa-tomato",
    product: "Tomato",
    localName: "Tomato",
    country: "Saudi Arabia",
    market: "Riyadh",
    category: "vegetable",
    today: 7.2,
    previous: 7.5,
    unit: "kg"
  },

  {
    id: "sa-cucumber",
    product: "Cucumber",
    localName: "Cucumber",
    country: "Saudi Arabia",
    market: "Jeddah",
    category: "vegetable",
    today: 6.4,
    previous: 6.0,
    unit: "kg"
  },


  /* ================= UAE ================= */

  {
    id: "ae-potato",
    product: "Potato",
    localName: "Potato",
    country: "UAE",
    market: "Dubai",
    category: "vegetable",
    today: 4.8,
    previous: 4.6,
    unit: "kg"
  },

  {
    id: "ae-tomato",
    product: "Tomato",
    localName: "Tomato",
    country: "UAE",
    market: "Dubai",
    category: "vegetable",
    today: 6.5,
    previous: 6.8,
    unit: "kg"
  },


  /* ================= UK ================= */

  {
    id: "uk-potato",
    product: "Potato",
    localName: "Potato",
    country: "UK",
    market: "London",
    category: "vegetable",
    today: 1.4,
    previous: 1.35,
    unit: "kg"
  },

  {
    id: "uk-tomato",
    product: "Tomato",
    localName: "Tomato",
    country: "UK",
    market: "London",
    category: "vegetable",
    today: 2.2,
    previous: 2.3,
    unit: "kg"
  },

  {
    id: "uk-carrot",
    product: "Carrot",
    localName: "Carrot",
    country: "UK",
    market: "Manchester",
    category: "root",
    today: 1.5,
    previous: 1.45,
    unit: "kg"
  },


  /* ================= USA ================= */

  {
    id: "us-potato",
    product: "Potato",
    localName: "Potato",
    country: "US",
    market: "New York",
    category: "vegetable",
    today: 2.1,
    previous: 2.0,
    unit: "kg"
  },

  {
    id: "us-tomato",
    product: "Tomato",
    localName: "Tomato",
    country: "US",
    market: "New York",
    category: "vegetable",
    today: 3.4,
    previous: 3.2,
    unit: "kg"
  },

  {
    id: "us-onion",
    product: "Onion",
    localName: "Onion",
    country: "US",
    market: "Chicago",
    category: "vegetable",
    today: 2.3,
    previous: 2.4,
    unit: "kg"
  }

];


/* =========================================================
   DOM ELEMENTS
========================================================= */

const countrySelect =
  document.getElementById("countrySelect");

const categorySelect =
  document.getElementById("categorySelect");

const searchInput =
  document.getElementById("searchInput");

const updateBtn =
  document.getElementById("updateBtn");

const updatedTime =
  document.getElementById("updatedTime");

const totalProducts =
  document.getElementById("totalProducts");

const totalCountries =
  document.getElementById("totalCountries");

const priceUp =
  document.getElementById("priceUp");

const priceDown =
  document.getElementById("priceDown");

const vegetableTableBody =
  document.getElementById("vegetableTableBody");

const productGrid =
  document.getElementById("productGrid");

const homeBtn =
  document.getElementById("homeBtn");

const refreshBtnTop =
  document.getElementById("refreshBtnTop");


/* =========================================================
   STATE
========================================================= */

let currentData = [...VEGETABLE_DATA];

let lastUpdateTime = null;


/* =========================================================
   HELPER — PRICE CHANGE
========================================================= */

function calculateChange(today, previous) {

  if (
    typeof today !== "number" ||
    typeof previous !== "number" ||
    previous === 0
  ) {
    return {
      amount: 0,
      percent: 0,
      direction: "same"
    };
  }

  const amount = today - previous;

  const percent =
    (amount / previous) * 100;

  let direction = "same";

  if (amount > 0) {
    direction = "up";
  }

  if (amount < 0) {
    direction = "down";
  }

  return {
    amount,
    percent,
    direction
  };
}


/* =========================================================
   HELPER — FORMAT PRICE
========================================================= */

function formatPrice(value) {

  if (typeof value !== "number") {
    return "—";
  }

  return value.toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 2
    }
  );
}


/* =========================================================
   HELPER — CHANGE TEXT
========================================================= */

function changeHTML(item) {

  const change =
    calculateChange(
      item.today,
      item.previous
    );

  const percent =
    Math.abs(change.percent).toFixed(1);

  if (change.direction === "up") {

    return `
      <span class="price-up"
            style="
              color:#ff5b5b;
              font-weight:900;
              white-space:nowrap;
            ">
        ▲ ${percent}%
      </span>
    `;
  }

  if (change.direction === "down") {

    return `
      <span class="price-down"
            style="
              color:#32d583;
              font-weight:900;
              white-space:nowrap;
            ">
        ▼ ${percent}%
      </span>
    `;
  }

  return `
    <span
      style="
        color:#d4af37;
        font-weight:900;
      ">
      — 0%
    </span>
  `;
}


/* =========================================================
   FILTER DATA
========================================================= */

function getFilteredData() {

  const selectedCountry =
    countrySelect
      ? countrySelect.value
      : "all";

  const selectedCategory =
    categorySelect
      ? categorySelect.value
      : "all";

  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";

  return currentData.filter(item => {

    const countryMatch =
      selectedCountry === "all" ||
      item.country === selectedCountry;

    const categoryMatch =
      selectedCategory === "all" ||
      item.category === selectedCategory;

    const searchMatch =
      !search ||
      item.product
        .toLowerCase()
        .includes(search) ||
      item.localName
        .toLowerCase()
        .includes(search) ||
      item.country
        .toLowerCase()
        .includes(search) ||
      item.market
        .toLowerCase()
        .includes(search);

    return (
      countryMatch &&
      categoryMatch &&
      searchMatch
    );
  });
}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable(data) {

  if (!vegetableTableBody) {
    return;
  }

  if (!data.length) {

    vegetableTableBody.innerHTML = `
      <tr>
        <td
          colspan="7"
          style="
            text-align:center;
            padding:40px 20px;
            font-size:22px;
            font-weight:800;
          "
        >
          🔎 কোনো পণ্য পাওয়া যায়নি।
        </td>
      </tr>
    `;

    return;
  }

  vegetableTableBody.innerHTML =
    data.map(item => {

      const change =
        calculateChange(
          item.today,
          item.previous
        );

      return `
        <tr>

          <td>
            <strong>
              ${escapeHTML(item.localName)}
            </strong>

            <br>

            <small>
              ${escapeHTML(item.product)}
            </small>
          </td>

          <td>
            ${escapeHTML(item.country)}
          </td>

          <td>
            ${escapeHTML(item.market)}
          </td>

          <td>
            <strong>
              ${formatPrice(item.today)}
            </strong>
          </td>

          <td>
            ${formatPrice(item.previous)}
          </td>

          <td>
            ${changeHTML(item)}
          </td>

          <td>
            ${escapeHTML(item.unit)}
          </td>

        </tr>
      `;

    }).join("");
}


/* =========================================================
   RENDER PRODUCT CARDS
========================================================= */

function renderCards(data) {

  if (!productGrid) {
    return;
  }

  if (!data.length) {

    productGrid.innerHTML = `
      <div
        style="
          grid-column:1/-1;
          padding:40px;
          text-align:center;
          font-size:22px;
          font-weight:800;
        "
      >
        🔎 কোনো পণ্য পাওয়া যায়নি।
      </div>
    `;

    return;
  }

  productGrid.innerHTML =
    data.map(item => {

      const change =
        calculateChange(
          item.today,
          item.previous
        );

      let trendText =
        "দাম অপরিবর্তিত";

      let trendColor =
        "#d4af37";

      if (change.direction === "up") {
        trendText =
          `▲ ${Math.abs(change.percent).toFixed(1)}% বৃদ্ধি`;
        trendColor =
          "#ff5b5b";
      }

      if (change.direction === "down") {
        trendText =
          `▼ ${Math.abs(change.percent).toFixed(1)}% কমেছে`;
        trendColor =
          "#32d583";
      }

      return `
        <article
          class="vegetable-product-card"
          style="
            border:1px solid rgba(212,175,55,.65);
            border-radius:22px;
            padding:22px;
            background:
              linear-gradient(
                145deg,
                rgba(19,39,82,.95),
                rgba(5,10,24,.98)
              );
            box-shadow:
              0 12px 35px rgba(0,0,0,.25);
          "
        >

          <div
            style="
              font-size:48px;
              margin-bottom:10px;
            "
          >
            ${getVegetableIcon(item.product)}
          </div>

          <h3
            style="
              margin:0 0 8px;
              font-size:25px;
              color:#fff;
            "
          >
            ${escapeHTML(item.localName)}
          </h3>

          <div
            style="
              color:#cbd5e1;
              font-size:16px;
              margin-bottom:8px;
            "
          >
            ${escapeHTML(item.product)}
          </div>

          <div
            style="
              color:#d4af37;
              font-size:17px;
              font-weight:800;
              margin-bottom:4px;
            "
          >
            🌍 ${escapeHTML(item.country)}
          </div>

          <div
            style="
              color:#aebbd0;
              font-size:16px;
              margin-bottom:16px;
            "
          >
            🏪 ${escapeHTML(item.market)}
          </div>

          <div
            style="
              font-size:31px;
              font-weight:900;
              color:#fff;
            "
          >
            ${formatPrice(item.today)}
            <span
              style="
                font-size:16px;
                color:#b8c3d6;
              "
            >
              / ${escapeHTML(item.unit)}
            </span>
          </div>

          <div
            style="
              margin-top:8px;
              color:${trendColor};
              font-size:17px;
              font-weight:900;
            "
          >
            ${trendText}
          </div>

          <div
            style="
              margin-top:14px;
              padding-top:12px;
              border-top:1px solid rgba(255,255,255,.12);
              color:#91a0b8;
              font-size:14px;
            "
          >
            Previous:
            ${formatPrice(item.previous)}
            ${escapeHTML(item.unit)}
          </div>

        </article>
      `;

    }).join("");
}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary(data) {

  const countries =
    new Set(
      data.map(item => item.country)
    );

  let up = 0;
  let down = 0;

  data.forEach(item => {

    const change =
      calculateChange(
        item.today,
        item.previous
      );

    if (change.direction === "up") {
      up++;
    }

    if (change.direction === "down") {
      down++;
    }

  });


  if (totalProducts) {
    totalProducts.textContent =
      data.length.toLocaleString();
  }


  if (totalCountries) {
    totalCountries.textContent =
      countries.size.toLocaleString();
  }


  if (priceUp) {
    priceUp.textContent =
      up.toLocaleString();
  }


  if (priceDown) {
    priceDown.textContent =
      down.toLocaleString();
  }
}


/* =========================================================
   UPDATE TIME
========================================================= */

function updateTimestamp() {

  lastUpdateTime =
    new Date();

  if (!updatedTime) {
    return;
  }

  updatedTime.textContent =
    lastUpdateTime.toLocaleString(
      "bn-BD",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderAll() {

  const data =
    getFilteredData();

  renderTable(data);

  renderCards(data);

  updateSummary(data);

  updateTimestamp();
}


/* =========================================================
   VEGETABLE ICON
========================================================= */

function getVegetableIcon(product) {

  const name =
    String(product)
      .toLowerCase();

  if (name.includes("potato")) {
    return "🥔";
  }

  if (name.includes("tomato")) {
    return "🍅";
  }

  if (name.includes("onion")) {
    return "🧅";
  }

  if (
    name.includes("carrot") ||
    name.includes("radish")
  ) {
    return "🥕";
  }

  if (
    name.includes("cucumber")
  ) {
    return "🥒";
  }

  if (
    name.includes("eggplant")
  ) {
    return "🍆";
  }

  if (
    name.includes("cabbage")
  ) {
    return "🥬";
  }

  if (
    name.includes("spinach")
  ) {
    return "🌿";
  }

  if (
    name.includes("chili")
  ) {
    return "🌶️";
  }

  if (
    name.includes("pumpkin")
  ) {
    return "🎃";
  }

  if (
    name.includes("okra")
  ) {
    return "🥬";
  }

  if (
    name.includes("bottle gourd")
  ) {
    return "🥒";
  }

  if (
    name.includes("bitter gourd")
  ) {
    return "🥒";
  }

  if (
    name.includes("cauliflower")
  ) {
    return "🥦";
  }

  return "🥬";
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   API SUPPORT
========================================================= */

async function loadFromAPI() {

  if (
    !AYNA_VEGETABLE_CONFIG.apiUrl
  ) {

    return null;
  }

  try {

    const response =
      await fetch(
        AYNA_VEGETABLE_CONFIG.apiUrl,
        {
          method: "GET",
          cache: "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const json =
      await response.json();

    /*
      Expected format:

      [
        {
          id: "1",
          product: "Potato",
          localName: "আলু",
          country: "Bangladesh",
          market: "Dhaka",
          category: "vegetable",
          today: 40,
          previous: 38,
          unit: "kg"
        }
      ]
    */

    if (!Array.isArray(json)) {

      throw new Error(
        "API response must be an array."
      );
    }

    return json;

  } catch (error) {

    console.warn(
      "AYNA Vegetable API failed:",
      error
    );

    return null;
  }
}


/* =========================================================
   LOAD DATA
========================================================= */

async function loadVegetableMarket() {

  setLoadingState(true);

  const apiData =
    await loadFromAPI();

  if (
    Array.isArray(apiData) &&
    apiData.length
  ) {

    currentData =
      apiData;

  } else {

    /*
      API না থাকলে DEMO data ব্যবহার হবে।
    */

    currentData =
      [...VEGETABLE_DATA];
  }

  renderAll();

  setLoadingState(false);

  showUpdateMessage();
}


/* =========================================================
   LOADING STATE
========================================================= */

function setLoadingState(isLoading) {

  if (updateBtn) {

    updateBtn.disabled =
      isLoading;

    updateBtn.style.opacity =
      isLoading ? "0.65" : "1";
  }

  if (refreshBtnTop) {

    refreshBtnTop.disabled =
      isLoading;

    refreshBtnTop.style.opacity =
      isLoading ? "0.65" : "1";
  }
}


/* =========================================================
   UPDATE MESSAGE
========================================================= */

function showUpdateMessage() {

  const mode =
    AYNA_VEGETABLE_CONFIG.mode;

  if (mode === "DEMO") {

    console.info(
      "AYNA BOOK World Vegetable Market:",
      AYNA_VEGETABLE_CONFIG.demoNotice
    );
  }

}


/* =========================================================
   FILTER EVENTS
========================================================= */

if (countrySelect) {

  countrySelect.addEventListener(
    "change",
    renderAll
  );

}


if (categorySelect) {

  categorySelect.addEventListener(
    "change",
    renderAll
  );

}


if (searchInput) {

  searchInput.addEventListener(
    "input",
    renderAll
  );

}


/* =========================================================
   UPDATE BUTTON
========================================================= */

if (updateBtn) {

  updateBtn.addEventListener(
    "click",
    async () => {

      await loadVegetableMarket();

    }
  );

}


/* =========================================================
   TOP REFRESH
========================================================= */

if (refreshBtnTop) {

  refreshBtnTop.addEventListener(
    "click",
    async () => {

      await loadVegetableMarket();

    }
  );

}


/* =========================================================
   HOME BUTTON
========================================================= */

if (homeBtn) {

  homeBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "./index.html";

    }
  );

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
      Ctrl + K
      Search focus
    */

    if (
      (event.ctrlKey ||
       event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {

      event.preventDefault();

      if (searchInput) {
        searchInput.focus();
      }
    }


    /*
      Escape
      Clear search
    */

    if (
      event.key === "Escape" &&
      searchInput
    ) {

      searchInput.value = "";

      renderAll();
    }

  }
);


/* =========================================================
   PUBLIC API
========================================================= */

window.AYNA_VEGETABLE_MARKET = {

  getData() {

    return [...currentData];

  },

  refresh() {

    return loadVegetableMarket();

  },

  filter() {

    renderAll();

  },

  getLastUpdate() {

    return lastUpdateTime;

  },

  config:
    AYNA_VEGETABLE_CONFIG

};


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadVegetableMarket();

  }
);