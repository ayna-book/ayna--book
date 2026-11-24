(() => {
  // বাংলাদেশ ও বিশ্বের লাইভ টিভি প্রেসেট ও ফ্রিকোয়েন্সি স্লট
  const PRESET_CHANNELS = [
    // --- বাংলাদেশ ---
    { name: "BTV National / BD Channel 01", country: "BD", category: "NEWS", freq: "CH-01 (BD)", url: "" },
    { name: "Bangladesh Parliament TV / BD Channel 02", country: "BD", category: "NEWS", freq: "CH-02 (BD)", url: "" },
    { name: "Somoy TV Live Relay / BD Channel 03", country: "BD", category: "NEWS", freq: "CH-03 (BD)", url: "" },
    { name: "Jamuna TV Live Relay / BD Channel 04", country: "BD", category: "NEWS", freq: "CH-04 (BD)", url: "" },
    { name: "Channel i Live Relay / BD Channel 05", country: "BD", category: "NEWS", freq: "CH-05 (BD)", url: "" },
    { name: "ATN Bangla Live Relay / BD Channel 06", country: "BD", category: "NEWS", freq: "CH-06 (BD)", url: "" },
    { name: "NTV Bangladesh Live Relay / BD Channel 07", country: "BD", category: "NEWS", freq: "CH-07 (BD)", url: "" },
    { name: "Independent TV Live Relay / BD Channel 08", country: "BD", category: "NEWS", freq: "CH-08 (BD)", url: "" },

    // --- বিশ্ব চ্যানেল ---
    { name: "DW English Live (HLS)", country: "DE", category: "NEWS", freq: "CH-101 (HD)", url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8" },
    { name: "NASA TV Public (Live HLS)", country: "US", category: "SPORTS", freq: "CH-102 (HD)", url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8" },
    { name: "France 24 English Live (HLS)", country: "FR", category: "NEWS", freq: "CH-103 (HD)", url: "https://stream.france24.com/hls/live/2037279/F24_EN_LO_HLS/master.m3u8" },
    { name: "Al Jazeera English Live (HLS)", country: "WORLD", category: "NEWS", freq: "CH-104 (HD)", url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8" },
    { name: "NHK World Japan Live (HLS)", country: "WORLD", category: "NEWS", freq: "CH-105 (HD)", url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8" }
  ];

  const PLAYLIST_URLS = {
    BD: "https://iptv-org.github.io/iptv/countries/bd.m3u",
    IN: "https://iptv-org.github.io/iptv/countries/in.m3u",
    GB: "https://iptv-org.github.io/iptv/countries/gb.m3u",
    US: "https://iptv-org.github.io/iptv/countries/us.m3u",
    SA: "https://iptv-org.github.io/iptv/countries/sa.m3u",
    AE: "https://iptv-org.github.io/iptv/countries/ae.m3u",
    DE: "https://iptv-org.github.io/iptv/countries/de.m3u",
    FR: "https://iptv-org.github.io/iptv/countries/fr.m3u",
    NEWS: "https://iptv-org.github.io/iptv/categories/news.m3u",
    SPORTS: "https://iptv-org.github.io/iptv/categories/sports.m3u",
    ALL: "https://iptv-org.github.io/iptv/index.m3u"
  };

  const video = document.getElementById("tvVideo");
  const playerBox = document.getElementById("playerBox");
  const selectEl = document.getElementById("channelSelect");
  const searchEl = document.getElementById("channelSearch");
  const countryEl = document.getElementById("countryFilter");
  const qualityModeEl = document.getElementById("qualityMode");
  const customUrlEl = document.getElementById("customStreamUrl");
  const freqSlider = document.getElementById("freqSlider");
  const freqReadout = document.getElementById("freqReadout");
  const playBtn = document.getElementById("playBtn");
  const stopBtn = document.getElementById("stopBtn");
  const nextBtn = document.getElementById("nextBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const reloadBtn = document.getElementById("reloadBtn");
  const statusEl = document.getElementById("tvStatus");
  const streamTagEl = document.getElementById("streamTag");
  const scopeButtons = document.querySelectorAll(".filter-btn");

  let activeScope = "ALL";
  let combinedChannels = [...PRESET_CHANNELS];
  let visibleChannels = [];
  let hlsInstance = null;
  let errorRetryTimer = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function destroyHls() {
    clearTimeout(errorRetryTimer);
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  }

  function detectCategory(name = "", group = "") {
    const text = `${name} ${group}`.toUpperCase();
    if (/SPORT|FOOTBALL|CRICKET|SOCCER|ESPN|BEIN/.test(text)) return "SPORTS";
    return "NEWS";
  }

  function parseM3U(m3uText, fallbackCountry = "WORLD", fallbackCategory = "NEWS", limit = 180) {
    const lines = m3uText.split(/\r?\n/);
    const items = [];
    let currentTitle = "";
    let currentGroup = "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith("#EXTINF:")) {
        const groupMatch = line.match(/group-title="([^"]*)"/i);
        currentGroup = groupMatch ? groupMatch[1] : fallbackCategory;
        const commaIdx = line.lastIndexOf(",");
        currentTitle = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : "Live TV Channel";
      } else if (!line.startsWith("#") && /^https?:\/\//i.test(line)) {
        const cat = detectCategory(currentTitle, currentGroup || fallbackCategory);
        items.push({
          name: currentTitle || "Live TV Channel",
          country: fallbackCountry,
          category: cat,
          freq: `CH-${String(items.length + 1).padStart(2, "0")}`,
          url: line
        });
        currentTitle = "";
        currentGroup = "";
        if (items.length >= limit) break;
      }
    }

    return items;
  }

  async function fetchPlaylistChannels() {
    const targets = [];

    if (activeScope === "BD") {
      targets.push({ url: PLAYLIST_URLS.BD, country: "BD", category: "NEWS", limit: 150 });
    } else if (activeScope === "NEWS") {
      targets.push({ url: PLAYLIST_URLS.NEWS, country: "WORLD", category: "NEWS", limit: 180 });
    } else if (activeScope === "SPORTS") {
      targets.push({ url: PLAYLIST_URLS.SPORTS, country: "WORLD", category: "SPORTS", limit: 180 });
    } else if (countryEl.value) {
      const code = countryEl.value;
      targets.push({ url: PLAYLIST_URLS[code] || PLAYLIST_URLS.ALL, country: code, category: "NEWS", limit: 180 });
    } else {
      targets.push({ url: PLAYLIST_URLS.BD, country: "BD", category: "NEWS", limit: 120 });
      targets.push({ url: PLAYLIST_URLS.ALL, country: "WORLD", category: "NEWS", limit: 220 });
    }

    const gathered = [];

    for (const t of targets) {
      if (!t.url) continue;
      try {
        const res = await fetch(t.url);
        if (!res.ok) continue;
        const txt = await res.text();
        const parsed = parseM3U(txt, t.country, t.category, t.limit);
        gathered.push(...parsed);
      } catch (_) {
        // প্লেলিস্ট লোড না হলে পরবর্তী সোর্স বা প্রেসেট ব্যবহার হবে
      }
    }

    return gathered;
  }

  function applyFiltersAndRender() {
    const keyword = (searchEl.value || "").trim().toLowerCase();
    const countryVal = (countryEl.value || "").trim().toUpperCase();

    visibleChannels = combinedChannels.filter(ch => {
      if (activeScope === "BD" && ch.country !== "BD") return false;
      if (activeScope === "WORLD" && ch.country === "BD") return false;
      if (activeScope === "NEWS" && ch.category !== "NEWS") return false;
      if (activeScope === "SPORTS" && ch.category !== "SPORTS") return false;
      if (countryVal && activeScope !== "NEWS" && activeScope !== "SPORTS" && ch.country !== countryVal) {
        return false;
      }
      if (keyword) {
        const hay = `${ch.name} ${ch.freq || ""} ${ch.country} ${ch.category}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

    selectEl.innerHTML = `<option value="">Select TV Channel (${visibleChannels.length}টি চ্যানেল)</option>`;

    visibleChannels.forEach((ch, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = `${idx + 1}. [${ch.freq || "LIVE"} • ${ch.country}] ${ch.name}${ch.url ? "" : " [লিংক দিন]"}`;
      selectEl.appendChild(opt);
    });

    if (visibleChannels.length > 0) {
      freqSlider.max = String(visibleChannels.length - 1);
      const cur = Number(selectEl.value);
      const activeIdx = Number.isInteger(cur) && cur >= 0 ? cur : 0;
      freqSlider.value = String(Math.min(activeIdx, visibleChannels.length - 1));
      const activeCh = visibleChannels[activeIdx];
      if (activeCh) {
        freqReadout.textContent = `${activeCh.freq || "LIVE"} • ${activeCh.country}`;
      }
    }

    setStatus(`${visibleChannels.length}টি টিভি চ্যানেল প্রস্তুত। একটি চ্যানেল বেছে নিন বা PLAY চাপুন।`);
  }

  async function refreshChannels() {
    setStatus("বাংলাদেশ ও বিশ্ব লাইভ টিভি চ্যানেল তালিকা আপডেট হচ্ছে...");
    const remoteList = await fetchPlaylistChannels();

    const seenUrls = new Set(PRESET_CHANNELS.map(c => c.url).filter(Boolean));
    const uniqueRemote = remoteList.filter(item => {
      if (!item.url || seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    });

    combinedChannels = [...PRESET_CHANNELS, ...uniqueRemote];
    applyFiltersAndRender();
  }

  function applyHlsQualityMode(hls) {
    const mode = qualityModeEl.value;
    if (!hls || !hls.levels || !hls.levels.length) return;

    if (mode === "high" || mode === "8k") {
      const highestIndex = hls.levels.length - 1;
      hls.currentLevel = highestIndex;
      hls.loadLevel = highestIndex;
    } else {
      hls.currentLevel = -1;
      hls.loadLevel = -1;
    }
  }

  function getActiveChannel() {
    const customUrl = customUrlEl.value.trim();
    if (customUrl) {
      return {
        name: "Custom Live TV Stream",
        country: "CUSTOM",
        category: "LIVE",
        freq: "CUSTOM",
        url: customUrl
      };
    }

    const idx = Number(selectEl.value);
    if (Number.isInteger(idx) && visibleChannels[idx]) {
      return visibleChannels[idx];
    }

    return visibleChannels.find(c => c.url) || null;
  }

  function loadAndPlay(channel, allowAutoNext = true) {
    if (!channel) {
      setStatus("Please select a valid TV channel.");
      return;
    }

    if (!channel.url) {
      setStatus(`"${channel.name}"-এর সরাসরি স্ট্রিম লিংক নেই। কাস্টম লিংক বক্সে .m3u8/.mp4 দিন বা NEXT চাপুন।`);
      return;
    }

    destroyHls();
    video.pause();
    video.removeAttribute("src");
    video.load();

    const modeLabel = qualityModeEl.value === "8k"
      ? "8K ULTRA PROFILE (MAX AVAILABLE)"
      : qualityModeEl.value === "high"
        ? "HIGH-SPEED MAX STREAM"
        : "AUTO ADAPTIVE STREAM";

    freqReadout.textContent = `${channel.freq || "LIVE"} • ${channel.country}`;
    streamTagEl.textContent = `⚡ ${channel.country} • ${channel.freq || "LIVE"} • ${modeLabel}`;
    setStatus(`লোড হচ্ছে: ${channel.name}...`);

    const isHls = channel.url.toLowerCase().includes(".m3u8");

    if (isHls && window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 20
      });

      hlsInstance.loadSource(channel.url);
      hlsInstance.attachMedia(video);

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, (_, data) => {
        applyHlsQualityMode(hlsInstance);
        const topLevel = data.levels && data.levels.length
          ? data.levels[data.levels.length - 1]
          : null;
        const resText = topLevel && topLevel.height
          ? `${topLevel.width || ""}x${topLevel.height}p`
          : "Live Stream";

        video.play().then(() => {
          setStatus(`চলছে: ${channel.name} (${resText})`);
        }).catch(() => {
          setStatus(`প্রস্তুত: ${channel.name} (${resText}) — চালু করতে ▶ PLAY চাপুন।`);
        });
      });

      hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          destroyHls();
          setStatus(`"${channel.name}" চালু করা যায়নি (CORS/Geo-block/স্ট্রিম অফলাইন হতে পারে)।`);
          if (allowAutoNext) {
            errorRetryTimer = setTimeout(() => playNextChannel(), 1200);
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl") || !isHls) {
      video.src = channel.url;
      video.play().then(() => {
        setStatus(`চলছে: ${channel.name}`);
      }).catch(() => {
        setStatus(`প্রস্তুত: ${channel.name} — চালু করতে ▶ PLAY চাপুন।`);
      });
    } else {
      setStatus("এই ব্রাউজারে HLS স্ট্রিম সাপোর্ট করছে না।");
    }
  }

  function stopStream() {
    destroyHls();
    video.pause();
    video.removeAttribute("src");
    video.load();
    streamTagEl.textContent = "HIGH-SPEED MULTI-CHANNEL TV ENGINE";
    setStatus("স্ট্রিম বন্ধ করা হয়েছে।");
  }

  function playNextChannel() {
    if (!visibleChannels.length) return;
    const currentIdx = Number(selectEl.value);
    const startIdx = Number.isInteger(currentIdx) && currentIdx >= 0 ? currentIdx : -1;

    for (let offset = 1; offset <= visibleChannels.length; offset++) {
      const nextIdx = (startIdx + offset) % visibleChannels.length;
      const candidate = visibleChannels[nextIdx];
      if (candidate && candidate.url) {
        selectEl.value = String(nextIdx);
        freqSlider.value = String(nextIdx);
        customUrlEl.value = "";
        loadAndPlay(candidate, false);
        return;
      }
    }
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (playerBox.requestFullscreen) {
          await playerBox.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (_) {
      setStatus("ফুলস্ক্রিন চালু করা যায়নি।");
    }
  }

  freqSlider.addEventListener("input", () => {
    const idx = Number(freqSlider.value);
    if (!visibleChannels[idx]) return;
    selectEl.value = String(idx);
    const ch = visibleChannels[idx];
    freqReadout.textContent = `${ch.freq || "LIVE"} • ${ch.country}`;
    setStatus(`টিউন করা হয়েছে: ${ch.name}`);
  });

  freqSlider.addEventListener("change", () => {
    const idx = Number(freqSlider.value);
    if (!visibleChannels[idx]) return;
    customUrlEl.value = "";
    loadAndPlay(visibleChannels[idx], true);
  });

  scopeButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      scopeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeScope = btn.dataset.scope || "ALL";

      if (activeScope === "BD") {
        countryEl.value = "BD";
      } else if (activeScope === "ALL" || activeScope === "WORLD") {
        countryEl.value = "";
      }

      await refreshChannels();
    });
  });

  countryEl.addEventListener("change", refreshChannels);
  searchEl.addEventListener("input", applyFiltersAndRender);
  reloadBtn.addEventListener("click", refreshChannels);

  selectEl.addEventListener("change", () => {
    if (selectEl.value === "") {
      setStatus("Please select a valid TV channel.");
      return;
    }
    const idx = Number(selectEl.value);
    if (Number.isInteger(idx) && visibleChannels[idx]) {
      freqSlider.value = String(idx);
    }
    customUrlEl.value = "";
    loadAndPlay(getActiveChannel(), true);
  });

  qualityModeEl.addEventListener("change", () => {
    if (hlsInstance) {
      applyHlsQualityMode(hlsInstance);
      setStatus("কোয়ালিটি মোড আপডেট করা হয়েছে।");
    }
  });

  playBtn.addEventListener("click", () => {
    const active = getActiveChannel();
    if (!active || !active.url) {
      setStatus("Please select a valid TV channel.");
      return;
    }
    if (video.src && video.src === active.url && video.paused) {
      video.play().then(() => setStatus(`চলছে: ${active.name}`)).catch(() => loadAndPlay(active, true));
    } else {
      loadAndPlay(active, true);
    }
  });

  stopBtn.addEventListener("click", stopStream);
  nextBtn.addEventListener("click", playNextChannel);
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  applyFiltersAndRender();
  refreshChannels();
})();