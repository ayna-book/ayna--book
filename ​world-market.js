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
// STATE & DOM HELPERS
// ==================================================

let currentUser = null;
let userProfile = {};
let allItems = [];

const $ = (id) => document.getElementById(id);

function showAlert(message) {
  const noticeBox = $("notice");
  if (noticeBox) {
    noticeBox.textContent = message;
    noticeBox.style.display = "block";
    clearTimeout(showAlert.timer);
    showAlert.timer = setTimeout(() => {
      noticeBox.style.display = "none";
    }, 3000);
  } else {
    alert(message);
  }
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

// ==================================================
// AUTHENTICATION CHECK
// ==================================================

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  const submitBtn = $("addMarketItem");
  if (!user) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "🔒 পণ্য যুক্ত করতে লগইন করুন";
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "🚀 বিশ্ববাজারে প্রকাশ করুন";
  }

  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile fetch error:", err);
  }
});

// ==================================================
// ADD NEW PRODUCT TO WORLD MARKET
// ==================================================

const addBtn = $("addMarketItem");
if (addBtn) {
  addBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showAlert("পণ্য যুক্ত করতে আগে লগইন করুন।");
      return;
    }

    const country = $("itemCountry")?.value || "বাংলাদেশ (BD)";
    const title = $("itemTitle")?.value.trim() || "";
    const price = $("itemPrice")?.value.trim() || "";
    const image = $("itemImage")?.value.trim() || "";
    const desc = $("itemDesc")?.value.trim() || "";

    if (!title || !price) {
      showAlert("অনুগ্রহ করে পণ্যের নাম এবং দাম লিখুন।");
      return;
    }

    addBtn.disabled = true;
    addBtn.textContent = "প্রকাশ করা হচ্ছে...";

    try {
      const marketRef = push(ref(database, "worldMarket"));

      await set(marketRef, {
        country,
        title,
        price,
        image,
        desc,
        sellerUid: currentUser.uid,
        sellerName:
          userProfile.fullName ||
          currentUser.displayName ||
          currentUser.email ||
          "AYNA Seller",
        sellerAynaId: userProfile.aynaId || "",
        createdAt: Date.now()
      });

      if ($("itemTitle")) $("itemTitle").value = "";
      if ($("itemPrice")) $("itemPrice").value = "";
      if ($("itemImage")) $("itemImage").value = "";
      if ($("itemDesc")) $("itemDesc").value = "";

      showAlert("বিশ্ববাজারে আপনার পণ্য সফলভাবে প্রকাশ হয়েছে!");
    } catch (error) {
      console.error("Publish error:", error);
      showAlert(
        error.code === "PERMISSION_DENIED"
          ? "Firebase Rules অনুমতি দেয়নি।"
          : "পণ্য প্রকাশ করা যায়নি।"
      );
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = "🚀 বিশ্ববাজারে প্রকাশ করুন";
    }
  });
}

// ==================================================
// REALTIME LISTENER & FILTERING
// ==================================================

const countryFilter = $("countryFilter");
if (countryFilter) {
  countryFilter.addEventListener("change", renderItems);
}

const searchInput = $("marketSearch");
if (searchInput) {
  searchInput.addEventListener("input", renderItems);
}

onValue(
  ref(database, "worldMarket"),
  (snapshot) => {
    const data = snapshot.val() || {};
    allItems = Object.entries(data)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    renderItems();
  },
  (error) => {
    console.error("World Market load error:", error);
    const container = $("marketList");
    if (container) {
      container.innerHTML =
        '<div class="gold-3d empty-msg">তথ্য লোড করা যায়নি। Firebase Rules পরীক্ষা করুন।</div>';
    }
  }
);

function renderItems() {
  const container = $("marketList");
  if (!container) return;

  const selectedCountry = countryFilter ? countryFilter.value : "ALL";
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filtered = allItems.filter((item) => {
    const matchCountry =
      selectedCountry === "ALL" || item.country === selectedCountry;
    const matchSearch =
      !keyword ||
      (item.title && item.title.toLowerCase().includes(keyword)) ||
      (item.desc && item.desc.toLowerCase().includes(keyword)) ||
      (item.country && item.country.toLowerCase().includes(keyword));

    return matchCountry && matchSearch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d empty-msg">নির্বাচিত দেশে এখনও কোনো পণ্য যুক্ত করা হয়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d product-card";

    const isOwner = currentUser && item.sellerUid === currentUser.uid;
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("bn-BD")
      : "";

    card.innerHTML = `
      <div>
        <span class="country-badge">${escapeHTML(item.country)}</span>
        ${
          item.image
            ? `<img class="product-img" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" loading="lazy">`
            : ""
        }
        <h3 class="product-title">${escapeHTML(item.title)}</h3>
        <div class="product-price">${escapeHTML(item.price)}</div>
        <p class="product-desc">${escapeHTML(item.desc || "")}</p>
      </div>
      <div>
        <div class="product-seller">
          বিক্রেতা: <strong>${escapeHTML(item.sellerName || "AYNA User")}</strong>
          ${dateStr ? ` • ${dateStr}` : ""}
        </div>
        ${
          isOwner
            ? `<button class="delete-item-btn" data-id="${item.id}" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner) {
      const delBtn = card.querySelector(".delete-item-btn");
      delBtn?.addEventListener("click", () => deleteMarketItem(item.id));
    }

    container.appendChild(card);
  });
}

// ==================================================
// DELETE OWN ITEM
// ==================================================

async function deleteMarketItem(itemId) {
  if (!currentUser) return;
  if (!confirm("আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?")) return;

  try {
    await remove(ref(database, `worldMarket/${itemId}`));
    showAlert("পণ্যটি মুছে ফেলা হয়েছে।");
  } catch (error) {
    console.error("Delete error:", error);
    showAlert("মুছে ফেলা যায়নি।");
  }
}