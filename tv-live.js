const FALLBACK_CHANNELS = [
  { id: "bd-01", name: "BTV National", country: "BD", scope: ["BD", "ALL"], freq: "CH-01", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
  { id: "de-02", name: "DW English", country: "DE", scope: ["WORLD", "NEWS", "ALL"], freq: "CH-02", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
  { id: "fr-03", name: "France 24", country: "FR", scope: ["WORLD", "NEWS", "ALL"], freq: "CH-03", url: "https://stream.france24.com/hls/live/2037279/F24_EN_HI_HLS/master.m3u8" },
  { id: "sa-04", name: "Al Jazeera", country: "SA", scope: ["WORLD", "NEWS", "ALL"], freq: "CH-04", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8" },
  { id: "us-05", name: "Sports Demo", country: "US", scope: ["WORLD", "SPORTS", "ALL"], freq: "CH-05", url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" }
];

const M3U_SOURCES = [
  "https://iptv-org.github.io/iptv/countries/bd.m3u",
  "https://iptv-org.github.io/iptv/index.m3u"
];

const FAV_STORAGE_KEY = "ayna_tv_favs_v1";
const videoEl = document.getElementById("tvVideo");
const channelSelect = document.getElementById("channelSelect");
const countryFilter = document.getElementById("countryFilter");
const channelSearch = document.getElementById("channelSearch");
const qualityMode = document.getElementById("qualityMode");
const customStreamUrl = document.getElementById("customStreamUrl");
const freqSlider = document.getElementById("freqSlider");
const freqReadout = document.getElementById("freqReadout");
const streamTag = document.getElementById("streamTag");
const tvStatus = document.getElementById("tvStatus");
const favoritesList = document.getElementById("favoritesList");

const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const nextBtn = document.getElementById("nextBtn");
const favSaveBtn = document.getElementById("favSaveBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const reloadBtn = document.getElementById("reloadBtn");
const scopeBtns = document.querySelectorAll(".filter-btn[data-scope]");

let allChannels = [...FALLBACK_CHANNELS];
let filteredChannels = [...FALLBACK_CHANNELS];
let currentScope = "ALL";
let hlsInstance = null;
let autoSkipTimer = null;

function setStatus(msg, tag) {
  if (tvStatus) tvStatus.textContent = msg;
  if (streamTag && tag) streamTag.textContent = tag;
}

function clearAutoSkip() {
  if (autoSkipTimer) {
    clearTimeout(autoSkipTimer);
    autoSkipTimer = null;
  }
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function renderFavorites() {
  if (!favoritesList) return;
  const favs = getFavorites();
  favoritesList.innerHTML = "";
  if (favs.length === 0) {
    favoritesList.innerHTML = `<div class="fav-item">_</div>`;
    return;
  }
  favs.forEach(item => {
    const div = document.createElement("div");
    div.className = "fav-item";
    div.textContent = `${item.freq} • ${item.name}`;
    div.addEventListener("click", () => playStream(item.url, `${item.freq} ${item.name}`, false));
    favoritesList.appendChild(div);
  });
}

function parseM3U(text, forcedCountry = "") {
  const lines = text.split(/\r?\n/);
  const list = [];
  let meta = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF:")) {
      const titleMatch = line.match(/,(.*)$/);
      const countryMatch = line.match(/tvg-country="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const name = titleMatch ? titleMatch[1].trim() : `CH ${list.length + 1}`;
      const country = forcedCountry || (countryMatch && countryMatch[1] ? countryMatch[1].toUpperCase() : "WORLD");
      const group = groupMatch ? groupMatch[1].toUpperCase() : "";
      const scopes = ["ALL"];
      scopes.push(country === "BD" ? "BD" : "WORLD");
      if (group.includes("NEWS")) scopes.push("NEWS");
      if (group.includes("SPORT")) scopes.push("SPORTS");
      meta = { name, country, scopes };
    } else if (!line.startsWith("#") && meta) {
      const n = list.length + 1;
      list.push({
        id: `ch-${n}`,
        name: meta.name,
        country: meta.country,
        scope: meta.scopes,
        freq: `CH-${String(n).padStart(3, "0")}`,
        url: line
      });
      meta = null;
    }
  }
  return list;
}

async function fetchSingleM3U(url, forcedCountry = "") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const txt = await res.text();
    return parseM3U(txt, forcedCountry);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function loadChannels() {
  setStatus("...", "LOADING");
  const merged = [...FALLBACK_CHANNELS];
  const seenUrls = new Set(merged.map(c => c.url));

  const bdList = await fetchSingleM3U(M3U_SOURCES[0], "BD");
  for (const ch of bdList) {
    if (!seenUrls.has(ch.url)) {
      seenUrls.add(ch.url);
      merged.push(ch);
    }
  }

  const worldList = await fetchSingleM3U(M3U_SOURCES[1], "");
  for (const ch of worldList) {
    if (!seenUrls.has(ch.url)) {
      seenUrls.add(ch.url);
      merged.push(ch);
    }
  }

  allChannels = merged.map((ch, idx) => ({
    ...ch,
    freq: `CH-${String(idx + 1).padStart(3, "0")}`
  }));

  setStatus(`${allChannels.length}`, allChannels.length > FALLBACK_CHANNELS.length ? "LIVE LIST" : "FALLBACK");
  applyFilters();
}

function applyFilters() {
  const q = (channelSearch?.value || "").trim().toLowerCase();
  const c = (countryFilter?.value || "").trim().toUpperCase();
  filteredChannels = allChannels.filter(ch => {
    const okScope = currentScope === "ALL" || ch.scope.includes(currentScope);
    const okCountry = !c || ch.country === c;
    const okQuery = !q || ch.name.toLowerCase().includes(q) || ch.freq.toLowerCase().includes(q) || ch.country.toLowerCase().includes(q);
    return okScope && okCountry && okQuery;
  });
  if (freqSlider) {
    freqSlider.max = String(Math.max(0, filteredChannels.length - 1));
    freqSlider.value = "0";
  }
  renderSelect();
}

function syncReadout(idx) {
  const ch = filteredChannels[idx];
  if (freqReadout) {
    freqReadout.textContent = ch ? `${ch.freq} • ${ch.country} • ${(qualityMode?.value || "HIGH").toUpperCase()}` : "_";
  }
}

function renderSelect() {
  if (!channelSelect) return;
  channelSelect.innerHTML = "";
  if (!filteredChannels.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "_";
    channelSelect.appendChild(opt);
    syncReadout(0);
    return;
  }
  filteredChannels.forEach((ch, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = `${ch.freq} • ${ch.name} (${ch.country})`;
    channelSelect.appendChild(opt);
  });
  syncReadout(0);
}

function destroyHls() {
  clearAutoSkip();
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

function scheduleNextOnFail(label) {
  setStatus(label, "SKIP");
  clearAutoSkip();
  autoSkipTimer = setTimeout(() => {
    nextCurrent();
  }, 1500);
}

function playStream(url, label, allowAutoSkip = true) {
  if (!url || !videoEl) return;
  destroyHls();
  setStatus(label, "BUFFER");

  if (url.includes(".m3u8") && window.Hls && window.Hls.isSupported()) {
    hlsInstance = new window.Hls({
      enableWorker: true,
      lowLatencyMode: qualityMode?.value === "high"
    });
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(videoEl);
    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
      clearAutoSkip();
      videoEl.play().then(() => setStatus(label, "LIVE")).catch(() => setStatus(label, "READY"));
    });
    hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
      if (data && data.fatal) {
        if (allowAutoSkip) scheduleNextOnFail(label);
        else setStatus(label, "ERROR");
      }
    });
  } else {
    videoEl.src = url;
    videoEl.play()
      .then(() => {
        clearAutoSkip();
        setStatus(label, "LIVE");
      })
      .catch(() => {
        if (allowAutoSkip) scheduleNextOnFail(label);
        else setStatus(label, "ERROR");
      });
  }
}

function playCurrent() {
  const custom = (customStreamUrl?.value || "").trim();
  if (custom) {
    playStream(custom, "CUSTOM", false);
    return;
  }
  const idx = Number(channelSelect?.value || 0);
  const ch = filteredChannels[idx];
  if (!ch) return;
  syncReadout(idx);
  playStream(ch.url, `${ch.freq} ${ch.name}`, true);
}

function stopCurrent() {
  destroyHls();
  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }
  setStatus("_", "STOP");
}

function nextCurrent() {
  if (!filteredChannels.length) return;
  const idx = (Number(channelSelect?.value || 0) + 1) % filteredChannels.length;
  channelSelect.value = String(idx);
  if (freqSlider) freqSlider.value = String(idx);
  syncReadout(idx);
  playCurrent();
}

function saveCurrentFav() {
  const idx = Number(channelSelect?.value || 0);
  const ch = filteredChannels[idx];
  if (!ch) return;
  const favs = getFavorites();
  if (!favs.some(x => x.url === ch.url)) {
    favs.unshift({ name: ch.name, freq: ch.freq, url: ch.url });
    saveFavorites(favs.slice(0, 12));
    renderFavorites();
  }
}

scopeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    scopeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentScope = btn.dataset.scope || "ALL";
    applyFilters();
  });
});

countryFilter?.addEventListener("change", applyFilters);
channelSearch?.addEventListener("input", applyFilters);
channelSelect?.addEventListener("change", () => {
  const idx = Number(channelSelect.value || 0);
  if (freqSlider) freqSlider.value = String(idx);
  syncReadout(idx);
});
freqSlider?.addEventListener("input", () => {
  const idx = Number(freqSlider.value || 0);
  if (channelSelect && filteredChannels[idx]) channelSelect.value = String(idx);
  syncReadout(idx);
});
qualityMode?.addEventListener("change", () => syncReadout(Number(channelSelect?.value || 0)));

playBtn?.addEventListener("click", playCurrent);
stopBtn?.addEventListener("click", stopCurrent);
nextBtn?.addEventListener("click", nextCurrent);
favSaveBtn?.addEventListener("click", saveCurrentFav);
reloadBtn?.addEventListener("click", loadChannels);
fullscreenBtn?.addEventListener("click", () => {
  const box = document.getElementById("playerBox") || videoEl;
  if (box?.requestFullscreen) box.requestFullscreen().catch(() => {});
});

renderFavorites();
loadChannels();