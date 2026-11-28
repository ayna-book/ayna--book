const FALLBACK_CHANNELS = [
  {
    id: "bd-01",
    name: "BTV National",
    country: "BD",
    scope: ["BD", "ALL"],
    category: "NEWS",
    freq: "CH-01",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  },
  {
    id: "intl-02",
    name: "DW English Live",
    country: "DE",
    scope: ["WORLD", "NEWS", "ALL"],
    category: "NEWS",
    freq: "CH-02",
    url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8"
  },
  {
    id: "intl-03",
    name: "France 24 English",
    country: "FR",
    scope: ["WORLD", "NEWS", "ALL"],
    category: "NEWS",
    freq: "CH-03",
    url: "https://stream.france24.com/hls/live/2037279/F24_EN_HI_HLS/master.m3u8"
  },
  {
    id: "intl-04",
    name: "Al Jazeera English",
    country: "SA",
    scope: ["WORLD", "NEWS", "ALL"],
    category: "NEWS",
    freq: "CH-04",
    url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8"
  },
  {
    id: "intl-05",
    name: "Sports & Live Demo",
    country: "US",
    scope: ["WORLD", "SPORTS", "ALL"],
    category: "SPORTS",
    freq: "CH-05",
    url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
  }
];

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

const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const nextBtn = document.getElementById("nextBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const reloadBtn = document.getElementById("reloadBtn");
const filterBtns = document.querySelectorAll(".filter-btn");

let allChannels = [...FALLBACK_CHANNELS];
let filteredChannels = [...FALLBACK_CHANNELS];
let currentScope = "ALL";
let hlsInstance = null;

function setStatus(msg, tagText) {
  if (tvStatus) tvStatus.textContent = msg;
  if (streamTag && tagText) streamTag.textContent = tagText;
}

function parseM3U(m3uText) {
  const lines = m3uText.split(/\r?\n/);
  const parsed = [];
  let pendingMeta = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const titleMatch = line.match(/,(.*)$/);
      const countryMatch = line.match(/tvg-country="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const name = titleMatch ? titleMatch[1].trim() : `Channel ${parsed.length + 1}`;
      const country = countryMatch && countryMatch[1] ? countryMatch[1].toUpperCase() : "WORLD";
      const group = groupMatch ? groupMatch[1].toUpperCase() : "";

      let category = "GENERAL";
      if (group.includes("NEWS")) category = "NEWS";
      else if (group.includes("SPORT")) category = "SPORTS";

      const scopes = ["ALL"];
      if (country === "BD") scopes.push("BD");
      else scopes.push("WORLD");
      if (category === "NEWS") scopes.push("NEWS");
      if (category === "SPORTS") scopes.push("SPORTS");

      pendingMeta = { name, country, category, scopes };
    } else if (!line.startsWith("#") && pendingMeta) {
      const idx = parsed.length + 1;
      parsed.push({
        id: `iptv-${idx}`,
        name: pendingMeta.name,
        country: pendingMeta.country,
        category: pendingMeta.category,
        scope: pendingMeta.scopes,
        freq: `CH-${String(idx).padStart(2, "0")}`,
        url: line
      });
      pendingMeta = null;
    }
  }
  return parsed;
}

async function fetchGlobalChannels() {
  setStatus("বিশ্ব ও বাংলাদেশ চ্যানেলের তালিকা লোড হচ্ছে...", "LOADING GLOBAL STREAMS");
  try {
    const res = await fetch("https://iptv-org.github.io/iptv/index.m3u");
    if (!res.ok) throw new Error("Network response was not ok");
    const text = await res.text();
    const remoteChannels = parseM3U(text);
    if (remoteChannels.length > 0) {
      allChannels = [...FALLBACK_CHANNELS, ...remoteChannels];
      setStatus(`মোট ${allChannels.length}টি চ্যানেল প্রস্তুত।`, "LIVE PLAYLIST READY");
    } else {
      allChannels = [...FALLBACK_CHANNELS];
      setStatus("ব্যাকআপ চ্যানেল তালিকা লোড হয়েছে।", "FALLBACK READY");
    }
  } catch (err) {
    allChannels = [...FALLBACK_CHANNELS];
    setStatus("সরাসরি তালিকা আনা যায়নি; ব্যাকআপ চ্যানেল তালিকা চালু আছে।", "OFFLINE / FALLBACK MODE");
  }
  applyFilters();
}

function applyFilters() {
  const query = (channelSearch?.value || "").trim().toLowerCase();
  const countryVal = (countryFilter?.value || "").trim().toUpperCase();

  filteredChannels = allChannels.filter(ch => {
    const matchesScope = currentScope === "ALL" || ch.scope.includes(currentScope);
    const matchesCountry = !countryVal || ch.country === countryVal;
    const matchesQuery =
      !query ||
      ch.name.toLowerCase().includes(query) ||
      ch.freq.toLowerCase().includes(query) ||
      ch.country.toLowerCase().includes(query);
    return matchesScope && matchesCountry && matchesQuery;
  });

  if (freqSlider) {
    freqSlider.max = String(Math.max(0, filteredChannels.length - 1));
    freqSlider.value = "0";
  }

  renderChannelSelect();
}

function renderChannelSelect() {
  if (!channelSelect) return;
  channelSelect.innerHTML = "";

  if (filteredChannels.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "কোনো চ্যানেল পাওয়া যায়নি";
    channelSelect.appendChild(opt);
    if (freqReadout) freqReadout.textContent = "NO SIGNAL";
    return;
  }

  filteredChannels.forEach((ch, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = `${ch.freq} — ${ch.name} (${ch.country})`;
    channelSelect.appendChild(opt);
  });

  syncTunerReadout(0);
}

function syncTunerReadout(index) {
  const ch = filteredChannels[index];
  const mode = qualityMode?.value || "high";
  if (ch && freqReadout) {
    freqReadout.textContent = `${ch.freq} • ${ch.country} • ${mode.toUpperCase()}`;
  }
}

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
}

function playStream(url, labelText) {
  if (!url || !videoEl) {
    setStatus("চালানোর মতো কোনো স্ট্রিম লিংক পাওয়া যায়নি।", "NO STREAM URL");
    return;
  }

  destroyHls();

  const isHls = url.includes(".m3u8");
  if (isHls && window.Hls && window.Hls.isSupported()) {
    hlsInstance = new window.Hls({
      enableWorker: true,
      lowLatencyMode: qualityMode?.value === "high"
    });
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(videoEl);
    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
      videoEl.play().catch(() => {});
      setStatus(`চালু হচ্ছে: ${labelText}`, "HLS LIVE STREAM");
    });
    hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        setStatus(`স্ট্রিম ত্রুটি (${labelText}) — অন্য চ্যানেল বা লিংক চেষ্টা করুন।`, "STREAM ERROR");
      }
    });
  } else {
    videoEl.src = url;
    videoEl.play()
      .then(() => setStatus(`চালু হচ্ছে: ${labelText}`, "DIRECT STREAM"))
      .catch(() => setStatus(`লিংক লোড হয়েছে: ${labelText} (Play চাপুন)`, "READY"));
  }
}

function playSelectedChannel() {
  const customUrl = (customStreamUrl?.value || "").trim();
  if (customUrl) {
    playStream(customUrl, "Custom Stream");
    return;
  }
  const idx = Number(channelSelect?.value || 0);
  const ch = filteredChannels[idx];
  if (!ch) {
    setStatus("আগে একটি চ্যানেল নির্বাচন করুন।", "NO CHANNEL");
    return;
  }
  syncTunerReadout(idx);
  playStream(ch.url, `${ch.freq} - ${ch.name}`);
}

function stopStream() {
  destroyHls();
  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }
  setStatus("স্ট্রিম বন্ধ করা হয়েছে।", "STOPPED");
}

function playNextChannel() {
  if (filteredChannels.length === 0) return;
  const currentIdx = Number(channelSelect?.value || 0);
  const nextIdx = (currentIdx + 1) % filteredChannels.length;
  channelSelect.value = String(nextIdx);
  if (freqSlider) freqSlider.value = String(nextIdx);
  syncTunerReadout(nextIdx);
  playSelectedChannel();
}

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
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
  syncTunerReadout(idx);
});

freqSlider?.addEventListener("input", () => {
  const idx = Number(freqSlider.value || 0);
  if (channelSelect && filteredChannels[idx]) {
    channelSelect.value = String(idx);
  }
  syncTunerReadout(idx);
});

qualityMode?.addEventListener("change", () => {
  const idx = Number(channelSelect?.value || 0);
  syncTunerReadout(idx);
});

playBtn?.addEventListener("click", playSelectedChannel);
stopBtn?.addEventListener("click", stopStream);
nextBtn?.addEventListener("click", playNextChannel);
reloadBtn?.addEventListener("click", fetchGlobalChannels);

fullscreenBtn?.addEventListener("click", () => {
  const box = document.getElementById("playerBox") || videoEl;
  if (box?.requestFullscreen) {
    box.requestFullscreen().catch(() => {});
  }
});

fetchGlobalChannels();