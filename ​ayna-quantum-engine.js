// =====================================================================
// AYNA BOOK — QUANTUM MASTER ENGINE (ayna-quantum-engine.js)
// Auto Clock • Leaders • Grocery • Radar/Weather • Bazaar • Groups • Posts
// =====================================================================

export const AynaVault = {
  privateKey: "ayna_private_personal_docs_v1",
  blockedFolderName: "AYNA BOOK",

  isPersonalFolderProtected(name = "") {
    return String(name || "").trim().toLowerCase() === this.blockedFolderName.toLowerCase();
  },

  filterOutPersonalDocs(items = []) {
    return items.filter(item => {
      const label = typeof item === "string" ? item : (item?.name || item?.path || "");
      return !this.isPersonalFolderProtected(label);
    });
  },

  savePrivateDoc(docItem = {}) {
    const current = this.getPrivateDocs();
    const entry = {
      id: "doc_" + Date.now(),
      title: docItem.title || "ব্যক্তিগত ডকুমেন্ট",
      note: docItem.note || "",
      updatedAt: Date.now()
    };
    current.unshift(entry);
    localStorage.setItem(this.privateKey, JSON.stringify(current));
    return entry;
  },

  getPrivateDocs() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.privateKey) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }
};

export const AynaHourlyClock = {
  enabled: true,
  sehriTime: { hour: 4, minute: 58 },
  iftarTime: { hour: 17, minute: 12 },
  lastHourlyKey: "",
  lastIftarKey: "",
  sehriSpoken: false,
  timer: null,

  formatTimeBn(date = new Date()) {
    return date.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  },

  pickVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    return (
      voices.find(v => /bn/i.test(v.lang)) ||
      voices.find(v => /en/i.test(v.lang)) ||
      voices[0] ||
      null
    );
  },

  speak(text, force = false) {
    if ((!this.enabled && !force) || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voice = this.pickVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "bn-BD";
      }
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error("Speech error:", err);
    }
  },

  tick(onUpdate) {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const nowMin = h * 60 + m;

    const nextHourDate = new Date(now);
    nextHourDate.setMinutes(0, 0, 0);
    nextHourDate.setHours(h + 1);

    if (typeof onUpdate === "function") {
      onUpdate({
        now,
        liveText: now.toLocaleTimeString("bn-BD", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }),
        nextHourText: this.formatTimeBn(nextHourDate),
        enabled: this.enabled
      });
    }

    if (!this.enabled) return;

    const sehriMin = this.sehriTime.hour * 60 + this.sehriTime.minute;
    const iftarMin = this.iftarTime.hour * 60 + this.iftarTime.minute;

    const sehriAlertMin = sehriMin - 90;
    if (nowMin === sehriAlertMin && !this.sehriSpoken) {
      this.sehriSpoken = true;
      this.speak(`সতর্কতা: সেহরির আর দেড় ঘণ্টা বাকি। এখন সময় ${this.formatTimeBn(now)}।`);
    } else if (nowMin !== sehriAlertMin) {
      this.sehriSpoken = false;
    }

    const iftarWindowStart = iftarMin - 60;
    if (nowMin >= iftarWindowStart && nowMin <= iftarMin) {
      const diff = nowMin - iftarWindowStart;
      const slotKey = `${now.toDateString()}-${h}:${m}`;
      if (diff % 5 === 0 && this.lastIftarKey !== slotKey) {
        this.lastIftarKey = slotKey;
        const left = iftarMin - nowMin;
        this.speak(
          left === 0
            ? `এখন ইফতারের সময়, ${this.formatTimeBn(now)}।`
            : `ইফতারের আর ${left} মিনিট বাকি। এখন সময় ${this.formatTimeBn(now)}।`
        );
      }
      return;
    }

    const hourKey = `${now.toDateString()}-${h}`;
    if (m === 0 && this.lastHourlyKey !== hourKey) {
      this.lastHourlyKey = hourKey;
      this.speak(`এখন সময় ${this.formatTimeBn(now)}।`);
    }
  },

  start(onUpdate) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    this.tick(onUpdate);
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(onUpdate), 1000);
  }
};

export async function fetchWorldLeadersAuto() {
  const res = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,cca2,capital");
  const data = await res.json();
  return data
    .map(c => {
      const country = c?.name?.common || "Unknown";
      const code = (c?.cca2 || "UN").toLowerCase();
      return {
        country,
        capital: (c?.capital && c.capital[0]) || "—",
        flag: c?.flags?.png || `https://flagcdn.com/w160/${code}.png`,
        contactDesk: `Diplomatic / Official Desk (${country})`,
        email: `info@${code}.gov.org`
      };
    })
    .sort((a, b) => a.country.localeCompare(b.country));
}

export async function fetchThousandsGroceryAuto(pages = [1, 2, 3, 4, 5]) {
  const allProducts = [];
  const calls = pages.map(p =>
    fetch(`https://world.openfoodfacts.org/api/v2/search?page_size=250&page=${p}&fields=product_name,brands,quantity`)
      .then(r => r.json())
      .catch(() => null)
  );
  const responses = await Promise.allSettled(calls);
  responses.forEach(item => {
    if (item.status === "fulfilled" && Array.isArray(item.value?.products)) {
      item.value.products.forEach(prod => {
        const name = (prod?.product_name || "").trim();
        if (name) {
          allProducts.push({
            name,
            brand: (prod?.brands || "Global Grocery").split(",")[0].trim(),
            quantity: prod?.quantity || "Standard Pack"
          });
        }
      });
    }
  });
  return allProducts;
}

export async function fetchWeatherAndRadar(lat = 21.21, lon = 92.26) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
  );
  const json = await res.json();
  return {
    current: json?.current || {},
    coords: { lat, lon },
    syncedAt: Date.now()
  };
}

export const AynaGroups = {
  storageKey: "ayna_groups_hub_v1",

  getGroups() {
    try {
      const list = JSON.parse(localStorage.getItem(this.storageKey) || "null");
      if (Array.isArray(list) && list.length) return list;
    } catch {}
    return [
      { id: "grp_ayna_book_all", platform: "AYNA BOOK", name: "AYNA BOOK Global Community" },
      { id: "grp_ayna_msg_main", platform: "AYNA MESSENGER", name: "AYNA MESSENGER VIP Group" }
    ];
  },

  createGroup(platform, name) {
    const cleanName = String(name || "").trim();
    if (!cleanName) return null;
    const list = this.getGroups();
    const created = {
      id: "grp_" + Date.now(),
      platform: platform === "AYNA MESSENGER" ? "AYNA MESSENGER" : "AYNA BOOK",
      name: cleanName
    };
    list.unshift(created);
    localStorage.setItem(this.storageKey, JSON.stringify(list));
    return created;
  }
};

export async function editPostInDb(database, postId, newText) {
  const { ref, update } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
  await update(ref(database, `posts/${postId}`), {
    text: String(newText || "").trim(),
    editedAt: Date.now()
  });
}

export async function deletePostInDb(database, postId) {
  const { ref, remove } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
  await remove(ref(database, `posts/${postId}`));
}