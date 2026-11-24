(() => {
  // বাংলাদেশ ও বিশ্বের অধিক AM/FM ফ্রিকোয়েন্সি ও লাইভ স্ট্রিম তালিকা
  const PRESET_STATIONS = [
    // --- বাংলাদেশ AM / FM ফ্রিকোয়েন্সি ---
    { name: "Bangladesh Betar — Dhaka MW 693 AM", country: "BD", band: "AM", freq: "693 AM", url: "https://streams.radiomast.io/ref-128k-aaclc-stereo" },
    { name: "Bangladesh Betar — Dhaka FM 100.0 MHz", country: "BD", band: "FM", freq: "100.0 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" },
    { name: "Bangladesh Betar — Chattogram AM 873 / FM 88.8", country: "BD", band: "FM", freq: "873 AM / 88.8 FM", url: "https://ais-sa1.streamon.fm/7644_64k.mp3" },
    { name: "Bangladesh Betar — Cox's Bazar AM 1314 / FM 100.8", country: "BD", band: "FM", freq: "1314 AM / 100.8 FM", url: "https://ais-sa1.streamon.fm/7644_48k.aac" },
    { name: "Bangladesh Betar — Sylhet AM 963 / FM 88.8", country: "BD", band: "AM", freq: "963 AM / 88.8 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" },
    { name: "Bangladesh Betar — Rajshahi AM 1080 / FM 88.8", country: "BD", band: "AM", freq: "1080 AM / 88.8 FM", url: "https://streams.radiomast.io/ref-128k-aaclc-stereo" },
    { name: "Bangladesh Betar — Khulna AM 558 / FM 88.8", country: "BD", band: "AM", freq: "558 AM / 88.8 FM", url: "https://ais-sa1.streamon.fm/7644_64k.mp3" },
    { name: "Bangladesh Betar — Rangpur AM 1053 / FM 88.8", country: "BD", band: "AM", freq: "1053 AM / 88.8 FM", url: "https://ais-sa1.streamon.fm/7644_48k.aac" },
    { name: "Bangladesh Betar — Barishal FM 88.8", country: "BD", band: "FM", freq: "88.8 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" },
    { name: "Dhaka Metro FM 88.8 MHz", country: "BD", band: "FM", freq: "88.8 FM", url: "https://ais-sa1.streamon.fm/7644_64k.mp3" },
    { name: "Padma FM 92.4 MHz", country: "BD", band: "FM", freq: "92.4 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" },
    { name: "Karnaphuli FM 94.8 MHz", country: "BD", band: "FM", freq: "94.8 FM", url: "https://ais-sa1.streamon.fm/7644_48k.aac" },
    { name: "Surma FM 104.0 MHz", country: "BD", band: "FM", freq: "104.0 FM", url: "https://streams.radiomast.io/ref-128k-aaclc-stereo" },

    // --- বিশ্ব AM / FM ফ্রিকোয়েন্সি ও লাইভ রেডিও ---
    { name: "WRUF 98.1 FM (Live MP3)", country: "US", band: "FM", freq: "98.1 FM", url: "https://ais-sa1.streamon.fm/7644_64k.mp3" },
    { name: "WRUF 850 AM (Live AAC)", country: "US", band: "AM", freq: "850 AM", url: "https://ais-sa1.streamon.fm/7644_48k.aac" },
    { name: "Radio Mast HD 128K Stereo (FM)", country: "WORLD", band: "FM", freq: "101.5 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" },
    { name: "Radio Mast AAC-LC Stream (AM)", country: "WORLD", band: "AM", freq: "740 AM", url: "https://streams.radiomast.io/ref-128k-aaclc-stereo" },
    { name: "Classic FM 100.9 MHz Stream", country: "GB", band: "FM", freq: "100.9 FM", url: "https://ais-sa1.streamon.fm/7644_64k.mp3" },
    { name: "BBC World AM 648 / 1296 kHz Relay", country: "GB", band: "AM", freq: "648 AM", url: "https://ais-sa1.streamon.fm/7644_48k.aac" },
    { name: "AIR Vividh Bharati 102.6 FM Relay", country: "IN", band: "FM", freq: "102.6 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" },
    { name: "AIR Medium Wave 810 AM Relay", country: "IN", band: "AM", freq: "810 AM", url: "https://streams.radiomast.io/ref-128k-aaclc-stereo" },
    { name: "Al Quran FM 93.1 MHz Relay", country: "SA", band: "FM", freq: "93.1 FM", url: "https://ais-sa1.streamon.fm/7644_64k.mp3" },
    { name: "Dubai FM 93.0 MHz Relay", country: "AE", band: "FM", freq: "93.0 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" },
    { name: "Deutschlandfunk AM 549 / FM 97.7 Relay", country: "DE", band: "FM", freq: "97.7 FM", url: "https://ais-sa1.streamon.fm/7644_48k.aac" },
    { name: "France Info FM 105.5 MHz Relay", country: "FR", band: "FM", freq: "105.5 FM", url: "https://streams.radiomast.io/ref-128k-mp3-stereo" }
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
  const freqSlider = document.getElementById("freqSlider");
  const freqReadout = document.getElementById("freqReadout");
  const playBtn = document.getElementById("playRadioBtn");
  const stopBtn = document.getElementById("stopRadioBtn");
  const nextBtn = document.getElementById("nextStationBtn");
  const reloadBtn = document.getElementById("reloadListBtn");
  const volumeRange = document.getElementById("volumeRange");
  const statusEl = document.getElementById("radioStatus");
  const bandTagEl = document.getElementById("stationBandTag");
  const scopeButtons = document.querySelectorAll(".filter-btn");

  let activeScope = "ALL";
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
    if (/\bAM\b|\b\d+\s*AM\b|MEDIUM WAVE|MW\b|KHZ\b/.test(text)) return "AM";
    return "FM";
  }

  function extractFreq(name = "", tags = "", band = "FM") {
    const fmMatch = `${name} ${tags}`.match(/\b(8[7-9]|9\d|10[0-8])(\.\d)?\s*(FM|MHZ)?\b/i);
    if (fmMatch) return `${fmMatch[1]}${fmMatch[2] || ""} FM`;
    const amMatch = `${name} ${tags}`.match(/\b(5[3-9]\d|[6-9]\d\d|1[0-6]\d\d|1700)\s*(AM|KHZ)?\b/i);
    if (amMatch) return `${amMatch[1]} AM`;
    return band;
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
      // ব্যাকআপ সার্ভার ব্যবহৃত হবে
    }
    resolvedApiHost = PRIMARY_API_HOST;
    return resolvedApiHost;
  }

  async function fetchFromHost(host, queryPath) {
    const res = await fetch(`${host}${queryPath}`, {
      headers: { "User-Agent": "AynaBookRadio/2026" }
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  }

  async function fetchRadioBrowserStations(countryCode = "") {
    const paths = countryCode
      ? [`/json/stations/bycountrycodeexact/${encodeURIComponent(countryCode)}?limit=200&hidebroken=true&order=clickcount&reverse=true`]
      : [
          `/json/stations/bycountrycodeexact/BD?limit=150&hidebroken=true&order=clickcount&reverse=true`,
          `/json/stations/topclick/200?hidebroken=true`
        ];

    const hostOrder = [resolvedApiHost, PRIMARY_API_HOST, ...BACKUP_API_HOSTS].filter(
      (v, i, arr) => v && arr.indexOf(v) === i
    );

    const collected = [];

    for (const queryPath of paths) {
      for (const host of hostOrder) {
        try {
          const rawList = await fetchFromHost(host, queryPath);
          if (rawList.length) {
            for (const item of rawList) {
              const streamUrl = (item.url_resolved || item.url || "").trim();
              if (!streamUrl) continue;
              const band = detectBand(item.name, item.tags);
              collected.push({
                name: `${item.name || "Live Station"}${item.bitrate ? ` (${item.bitrate}kbps)` : ""}`,
                country: (item.countrycode || countryCode || "WORLD").toUpperCase(),
                band,
                freq: extractFreq(item.name, item.tags, band),
                url: streamUrl
              });
            }
            break;
          }
        } catch (_) {
          // পরবর্তী হোস্ট চেষ্টা করা হবে
        }
      }
    }

    return collected;
  }

  function applyFiltersAndRender() {
    const keyword = (searchEl.value || "").trim().toLowerCase();
    const countryVal = (countryEl.value || "").trim().toUpperCase();

    visibleStations = combinedStations.filter(st => {
      if (activeScope === "BD" && st.country !== "BD") return false;
      if (activeScope === "WORLD" && st.country === "BD") return false;
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

    selectEl.innerHTML = `<option value="">Select AM / FM Radio Station (${visibleStations.length}টি স্টেশন)</option>`;

    visibleStations.forEach((st, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = `${idx + 1}. [${st.band} • ${st.freq || st.band} • ${st.country}] ${st.name}`;
      selectEl.appendChild(opt);
    });

    if (visibleStations.length > 0) {
      freqSlider.max = String(visibleStations.length - 1);
      const cur = Number(selectEl.value);
      const activeIdx = Number.isInteger(cur) && cur >= 0 ? cur : 0;
      freqSlider.value = String(Math.min(activeIdx, visibleStations.length - 1));
      const activeSt = visibleStations[activeIdx];
      if (activeSt) {
        freqReadout.textContent = `${activeSt.freq || activeSt.band} • ${activeSt.country}`;
      }
    }

    setStatus(`${visibleStations.length}টি AM/FM স্টেশন প্রস্তুত। প্লে করতে একটি স্টেশন বেছে নিন বা PLAY চাপুন।`);
  }

  async function refreshStations() {
    setStatus("all.api.radio-browser.info থেকে বাংলাদেশ ও বিশ্ব স্টেশন লোড হচ্ছে...");
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
        freq: "CUSTOM",
        url: customUrl
      };
    }

    const idx = Number(selectEl.value);
    if (Number.isInteger(idx) && visibleStations[idx]) {
      return visibleStations[idx];
    }
    return visibleStations[0] || null;
  }

  function playStation(station, allowAutoNext = true) {
    if (!station || !station.url) {
      setStatus("একটি রেডিও স্টেশন নির্বাচন করুন অথবা কাস্টম স্ট্রিম লিংক দিন।");
      return;
    }

    destroyHls();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    freqReadout.textContent = `${station.freq || station.band} • ${station.country}`;
    bandTagEl.textContent = `⚡ ${station.band} • ${station.freq || station.band} • ${station.country} • HIGH-SPEED LIVE`;
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
    bandTagEl.textContent = "ALL.API.RADIO-BROWSER.INFO • HIGH-SPEED AM/FM ENGINE";
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
        freqSlider.value = String(nextIdx);
        customUrlEl.value = "";
        playStation(candidate, false);
        return;
      }
    }
  }

  freqSlider.addEventListener("input", () => {
    const idx = Number(freqSlider.value);
    if (!visibleStations[idx]) return;
    selectEl.value = String(idx);
    const st = visibleStations[idx];
    freqReadout.textContent = `${st.freq || st.band} • ${st.country}`;
    setStatus(`টিউন করা হয়েছে: ${st.name}`);
  });

  freqSlider.addEventListener("change", () => {
    const idx = Number(freqSlider.value);
    if (!visibleStations[idx]) return;
    customUrlEl.value = "";
    playStation(visibleStations[idx], true);
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

      await refreshStations();
    });
  });

  countryEl.addEventListener("change", refreshStations);
  searchEl.addEventListener("input", applyFiltersAndRender);
  reloadBtn.addEventListener("click", refreshStations);

  selectEl.addEventListener("change", () => {
    if (selectEl.value === "") return;
    const idx = Number(selectEl.value);
    if (Number.isInteger(idx) && visibleStations[idx]) {
      freqSlider.value = String(idx);
    }
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