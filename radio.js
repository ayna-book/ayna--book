(() => {
  const PRESET_STATIONS = [
    {
      name: "Bangladesh Betar — Dhaka AM 693",
      country: "BD",
      band: "AM",
      freq: "693 AM",
      url: ""
    },
    {
      name: "Bangladesh Betar — Chattogram AM 873 / FM 88.8",
      country: "BD",
      band: "FM",
      freq: "873 AM / 88.8 FM",
      url: ""
    },
    {
      name: "Bangladesh Betar — Cox's Bazar AM 1314 / FM 100.8",
      country: "BD",
      band: "FM",
      freq: "1314 AM / 100.8 FM",
      url: ""
    },
    {
      name: "Bangladesh Betar — Sylhet AM 963 / FM 88.8",
      country: "BD",
      band: "AM",
      freq: "963 AM / 88.8 FM",
      url: ""
    },
    {
      name: "Bangladesh Betar — Rajshahi AM 1080 / FM 88.8",
      country: "BD",
      band: "AM",
      freq: "1080 AM / 88.8 FM",
      url: ""
    },
    {
      name: "Bangladesh Betar — Khulna AM 558 / FM 88.8",
      country: "BD",
      band: "AM",
      freq: "558 AM / 88.8 FM",
      url: ""
    },
    {
      name: "WRUF 98.1 FM (Live Stream)",
      country: "US",
      band: "FM",
      freq: "98.1 FM",
      url: "https://ais-sa1.streamon.fm/7644_64k.mp3"
    },
    {
      name: "WRUF 850 AM (Live Stream)",
      country: "US",
      band: "AM",
      freq: "850 AM",
      url: "https://ais-sa1.streamon.fm/7644_48k.aac"
    }
  ];

  const PRIMARY_API_HOST = "https://all.api.radio-browser.info";
  const BACKUP_API_HOSTS = [
    "https://de1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://at1.api.radio-browser.info"
  ];

  const audio = document.getElementById("radioAudio");
  const selectEl = document.getElementById("stationSelect");
  const searchEl = document.getElementById("stationSearch");
  const countryEl = document.getElementById("countryFilter");
  const customUrlEl = document.getElementById("customRadioUrl");
  const playBtn = document.getElementById("playRadioBtn");
  const stopBtn = document.getElementById("stopRadioBtn");
  const nextBtn = document.getElementById("nextStationBtn");
  const reloadBtn = document.getElementById("reloadListBtn");
  const volumeRange = document.getElementById("volumeRange");
  const statusEl = document.getElementById("radioStatus");
  const bandTagEl = document.getElementById("stationBandTag");
  const scopeButtons = document.querySelectorAll(".filter-btn");

  let activeScope = "BD";
  let combinedStations = [...PRESET_STATIONS];
  let visibleStations = [];
  let hlsInstance = null;
  let errorRetryTimer = null;
  let resolvedApiHost = PRIMARY_API_HOST;

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

  function detectBand(name = "", tags = "") {
    const text = `${name} ${tags}`.toUpperCase();
    if (/\bAM\b|\b\d+\s*AM\b|MEDIUM WAVE|MW\b/.test(text)) return "AM";
    return "FM";
  }

  async function resolveApiHost() {
    try {
      const res = await fetch(`${PRIMARY_API_HOST}/json/servers`, {
        headers: { "User-Agent": "AynaBookRadio/2026" }
      });
      if (res.ok) {
        const servers = await res.json();
        if (Array.isArray(servers) && servers.length && servers[0].name) {
          resolvedApiHost = `https://${servers[0].name}`;
          return resolvedApiHost;
        }
      }
    } catch (_) {
      // ব্যাকআপ হোস্টে যাওয়া হবে
    }
    resolvedApiHost = PRIMARY_API_HOST;
    return resolvedApiHost;
  }

  async function fetchRadioBrowserStations(countryCode = "") {
    const queryPath = countryCode
      ? `/json/stations/bycountrycodeexact/${encodeURIComponent(countryCode)}?limit=120&hidebroken=true&order=clickcount&reverse=true`
      : `/json/stations/topclick/150?hidebroken=true`;

    const hostOrder = [resolvedApiHost, PRIMARY_API_HOST, ...BACKUP_API_HOSTS].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    );

    for (const host of hostOrder) {
      try {
        const res = await fetch(`${host}${queryPath}`, {
          headers: { "User-Agent": "AynaBookRadio/2026" }
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (!Array.isArray(data) || !data.length) continue;

        return data
          .filter(item => item && (item.url_resolved || item.url))
          .map(item => {
            const streamUrl = (item.url_resolved || item.url || "").trim();
            const band = detectBand(item.name, item.tags);
            return {
              name: `${item.name || "Live Station"}${item.bitrate ? ` (${item.bitrate}kbps)` : ""}`,
              country: item.countrycode || countryCode || "WORLD",
              band,
              freq: band,
              url: streamUrl
            };
          });
      } catch (_) {
        // পরবর্তী সার্ভার চেষ্টা করা হবে
      }
    }
    return [];
  }

  function applyFiltersAndRender() {
    const keyword = (searchEl.value || "").trim().toLowerCase();
    const countryVal = (countryEl.value || "").trim().toUpperCase();

    visibleStations = combinedStations.filter(st => {
      if (activeScope === "BD" && st.country !== "BD") return false;
      if (activeScope === "FM" && st.band !== "FM") return false;
      if (activeScope === "AM" && st.band !== "AM") return false;
      if (countryVal && activeScope !== "FM" && activeScope !== "AM" && st.country !== countryVal) {
        return false;
      }
      if (keyword) {
        const hay = `${st.name} ${st.band} ${st.freq || ""} ${st.country}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

    selectEl.innerHTML = `<option value="">Select AM / FM Radio Station (${visibleStations.length})</option>`;

    visibleStations.forEach((st, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = `${idx + 1}. [${st.band} • ${st.country}] ${st.name}${st.url ? "" : " [লিংক দিন]"}`;
      selectEl.appendChild(opt);
    });

    setStatus(`${visibleStations.length}টি স্টেশন প্রস্তুত। প্লে করতে একটি স্টেশন বেছে নিন।`);
  }

  async function refreshStations() {
    setStatus("all.api.radio-browser.info থেকে লাইভ স্টেশন তালিকা লোড হচ্ছে...");
    await resolveApiHost();
    const countryToFetch = activeScope === "BD" ? "BD" : countryEl.value;
    const remoteList = await fetchRadioBrowserStations(countryToFetch);

    const seenUrls = new Set(PRESET_STATIONS.map(s => s.url).filter(Boolean));
    const uniqueRemote = remoteList.filter(item => {
      if (!item.url || seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    });

    combinedStations = [...PRESET_STATIONS, ...uniqueRemote];
    applyFiltersAndRender();
  }

  function getSelectedStation() {
    const customUrl = customUrlEl.value.trim();
    if (customUrl) {
      return {
        name: "Custom Live Stream",
        band: "LIVE",
        country: "CUSTOM",
        url: customUrl
      };
    }

    const idx = Number(selectEl.value);
    if (Number.isInteger(idx) && visibleStations[idx]) {
      return visibleStations[idx];
    }
    return null;
  }

  function playStation(station, allowAutoNext = true) {
    if (!station) {
      setStatus("একটি রেডিও স্টেশন নির্বাচন করুন অথবা কাস্টম স্ট্রিম লিংক দিন।");
      return;
    }

    if (!station.url) {
      setStatus(`"${station.name}"-এর সরাসরি স্ট্রিম লিংক নেই। কাস্টম লিংক বক্সে স্ট্রিম URL দিন বা NEXT চাপুন।`);
      return;
    }

    destroyHls();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    bandTagEl.textContent = `⚡ ${station.band} • ${station.country} • ALL.API.RADIO-BROWSER.INFO`;
    setStatus(`চালু হচ্ছে: ${station.name}...`);

    const isHls = station.url.toLowerCase().includes(".m3u8");

    if (isHls && window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 15
      });
      hlsInstance.loadSource(station.url);
      hlsInstance.attachMedia(audio);

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
        audio.play().then(() => {
          setStatus(`লাইভ চলছে: ${station.name}`);
        }).catch(() => {
          setStatus(`প্রস্তুত: ${station.name} — ▶ PLAY চাপুন।`);
        });
      });

      hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          destroyHls();
          setStatus(`"${station.name}" স্ট্রিমে সমস্যা হয়েছে।`);
          if (allowAutoNext) {
            errorRetryTimer = setTimeout(() => playNextStation(), 1200);
          }
        }
      });
    } else {
      audio.src = station.url;
      audio.preload = "auto";
      audio.play().then(() => {
        setStatus(`লাইভ চলছে: ${station.name}`);
      }).catch(() => {
        setStatus(`স্ট্রিম চালু করতে ▶ PLAY চাপুন: ${station.name}`);
      });
    }
  }

  function stopStation() {
    destroyHls();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    bandTagEl.textContent = "ALL.API.RADIO-BROWSER.INFO • HIGH-SPEED ENGINE";
    setStatus("রেডিও বন্ধ করা হয়েছে।");
  }

  function playNextStation() {
    if (!visibleStations.length) return;
    const currentIdx = Number(selectEl.value);
    const startIdx = Number.isInteger(currentIdx) && currentIdx >= 0 ? currentIdx : -1;

    for (let offset = 1; offset <= visibleStations.length; offset++) {
      const nextIdx = (startIdx + offset) % visibleStations.length;
      const candidate = visibleStations[nextIdx];
      if (candidate && candidate.url) {
        selectEl.value = String(nextIdx);
        customUrlEl.value = "";
        playStation(candidate, false);
        return;
      }
    }
  }

  scopeButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      scopeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeScope = btn.dataset.scope || "BD";

      if (activeScope === "BD") {
        countryEl.value = "BD";
      } else if (activeScope === "WORLD" && countryEl.value === "BD") {
        countryEl.value = "";
      }

      await refreshStations();
    });
  });

  countryEl.addEventListener("change", refreshStations);
  searchEl.addEventListener("input", applyFiltersAndRender);
  reloadBtn.addEventListener("click", refreshStations);

  selectEl.addEventListener("change", () => {
    if (selectEl.value === "") return;
    customUrlEl.value = "";
    playStation(getSelectedStation(), true);
  });

  playBtn.addEventListener("click", () => {
    const st = getSelectedStation();
    if (audio.src && st && audio.src === st.url && audio.paused) {
      audio.play().then(() => setStatus(`লাইভ চলছে: ${st.name}`)).catch(() => playStation(st, true));
    } else {
      playStation(st, true);
    }
  });

  stopBtn.addEventListener("click", stopStation);
  nextBtn.addEventListener("click", playNextStation);

  volumeRange.addEventListener("input", () => {
    audio.volume = Number(volumeRange.value);
  });

  audio.addEventListener("error", () => {
    if (audio.src) {
      setStatus("এই স্ট্রিমটি চালু করা যায়নি (সার্ভার বা CORS ব্লক হতে পারে)।");
    }
  });

  applyFiltersAndRender();
  refreshStations();
})();