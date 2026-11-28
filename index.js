
/* =====================================================
   AYNA BOOK — MAIN INDEX CONTROLLER
   File: index.js
   ===================================================== */

/* ---------- SETTINGS ---------- */

const AYNA_CONFIG = {
  appName: "AYNA BOOK",
  homePage: "./index.html",
  loginPage: "./login.html",
  profilePage: "./profile.html",
  checkLinks: false
};

/* ---------- HELPERS ---------- */

const $ = id => document.getElementById(id);

function showMessage(message) {
  let box = $("aynaMessage");

  if (!box) {
    box = document.createElement("div");
    box.id = "aynaMessage";

    Object.assign(box.style, {
      position: "fixed",
      bottom: "15px",
      left: "12px",
      right: "12px",
      zIndex: "99999",
      padding: "16px",
      border: "2px solid #ffd700",
      borderRadius: "12px",
      background: "#102342",
      color: "#ffffff",
      fontSize: "18px",
      textAlign: "center"
    });

    document.body.appendChild(box);
  }

  box.textContent = message;
  box.hidden = false;

  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => {
    box.hidden = true;
  }, 3500);
}

/* ---------- FEATURE SEARCH ---------- */

function initializeFeatureSearch() {
  const search = $("featureSearch");

  if (!search) return;

  const cards = [
    ...document.querySelectorAll(".feature")
  ];

  const noResults = $("noResults");

  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    let count = 0;

    cards.forEach(card => {
      const content = (
        card.innerText + " " +
        (card.dataset.search || "")
      ).toLowerCase();

      const matched = content.includes(query);

      card.classList.toggle("hidden", !matched);

      if (matched) count++;
    });

    if (noResults) {
      noResults.style.display = count ? "none" : "block";
    }
  });
}

/* ---------- FULL SCREEN ---------- */

async function toggleFullScreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    showMessage("Full Screen চালু করা যায়নি।");
    console.error(error);
  }
}

function initializeFullScreen() {
  $("fullScreenBtn")?.addEventListener(
    "click",
    toggleFullScreen
  );
}

/* ---------- ACCOUNT STATUS ---------- */

function initializeAccountStatus() {
  const status = $("accountStatus");
  const nameBox = $("accountName");

  /*
    Firebase Auth modular SDK 13.x
    Firebase initialize হওয়ার পর window.AYNA_AUTH
    অথবা window.AYNA_FIREBASE_AUTH-এ Auth instance
    প্রকাশ করা থাকলে এটি ব্যবহার করতে পারবে।
  */

  const auth =
    window.AYNA_AUTH ||
    window.AYNA_FIREBASE_AUTH ||
    null;

  if (!auth) {
    if (status) {
      status.textContent = "Account status: Login করুন";
    }
    return;
  }

  import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js")
    .then(({ onAuthStateChanged }) => {
      onAuthStateChanged(auth, user => {
        if (user) {
          if (status) {
            status.textContent = "✓ Logged In";
          }

          if (nameBox) {
            nameBox.textContent =
              user.displayName ||
              user.email ||
              "AYNA BOOK User";
          }
        } else {
          if (status) {
            status.textContent = "Login Required";
          }

          if (nameBox) {
            nameBox.textContent = "Guest User";
          }
        }
      });
    })
    .catch(error => {
      console.error("Firebase Auth:", error);

      if (status) {
        status.textContent = "Account status unavailable";
      }
    });
}

/* ---------- LINK VALIDATION ---------- */

async function checkFeatureLinks() {
  const links = [
    ...document.querySelectorAll("a.feature[href]")
  ];

  const results = [];

  for (const link of links) {
    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("http") ||
      href.startsWith("#")
    ) {
      continue;
    }

    try {
      const response = await fetch(href, {
        method: "HEAD",
        cache: "no-store"
      });

      results.push({
        href,
        ok: response.ok,
        status: response.status
      });
    } catch (error) {
      results.push({
        href,
        ok: false,
        status: "Network error"
      });
    }
  }

  const missing = results.filter(item => !item.ok);

  console.table(results);

  if (missing.length) {
    console.warn("Missing feature pages:", missing);
    showMessage(
      `${missing.length}টি পেজের লিংক পরীক্ষা করা দরকার।`
    );
  } else {
    showMessage("পরীক্ষা করা পেজগুলোর লিংক ঠিক আছে।");
  }

  return results;
}

/* ---------- QUICK NAVIGATION ---------- */

function initializeNavigation() {
  document.querySelectorAll("[data-ayna-home]")
    .forEach(button => {
      button.addEventListener("click", () => {
        window.location.href = AYNA_CONFIG.homePage;
      });
    });

  document.querySelectorAll("[data-ayna-profile]")
    .forEach(button => {
      button.addEventListener("click", () => {
        window.location.href = AYNA_CONFIG.profilePage;
      });
    });

  document.querySelectorAll("[data-ayna-login]")
    .forEach(button => {
      button.addEventListener("click", () => {
        window.location.href = AYNA_CONFIG.loginPage;
      });
    });
}

/* ---------- KEYBOARD SUPPORT ---------- */

function initializeKeyboardSupport() {
  document.addEventListener("keydown", event => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(
        document.activeElement?.tagName
      )
    ) {
      event.preventDefault();
      $("featureSearch")?.focus();
    }

    if (event.key === "Escape") {
      const search = $("featureSearch");

      if (search && search.value) {
        search.value = "";
        search.dispatchEvent(new Event("input"));
      }
    }
  });
}

/* ---------- ONLINE STATUS ---------- */

function initializeOnlineStatus() {
  function updateStatus() {
    if (navigator.onLine) {
      document.documentElement.dataset.connection = "online";
    } else {
      document.documentElement.dataset.connection = "offline";
      showMessage("ইন্টারনেট সংযোগ নেই।");
    }
  }

  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);

  updateStatus();
}

/* ---------- APP START ---------- */

function initializeAYNABook() {
  initializeFeatureSearch();
  initializeFullScreen();
  initializeAccountStatus();
  initializeNavigation();
  initializeKeyboardSupport();
  initializeOnlineStatus();

  if (AYNA_CONFIG.checkLinks) {
    checkFeatureLinks();
  }

  console.log(
    `${AYNA_CONFIG.appName} main controller loaded successfully.`
  );
}

/* ---------- PUBLIC API ---------- */

window.AYNA_BOOK = {
  config: AYNA_CONFIG,
  search: initializeFeatureSearch,
  fullScreen: toggleFullScreen,
  checkLinks: checkFeatureLinks,
  showMessage
};

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeAYNABook,
    { once: true }
  );
} else {
  initializeAYNABook();
}
