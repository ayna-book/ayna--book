(() => {
  // বাংলাদেশ ও বিশ্বের লাইভ টিভি তালিকা (.m3u8 / .mp4)
  // প্রয়োজন অনুযায়ী এখানে আরও সক্রিয় স্ট্রিম লিংক যুক্ত করতে পারবেন
  const TV_CHANNELS = [
    // --- বাংলাদেশ ---
    {
      name: "BTV National Live (BD)",
      region: "BD",
      url: "https://iptv-org.github.io/iptv/countries/bd.m3u"
    },
    {
      name: "Somoy TV / BD Stream Slot 1",
      region: "BD",
      url: ""
    },
    {
      name: "Jamuna TV / BD Stream Slot 2",
      region: "BD",
      url: ""
    },
    {
      name: "Channel i / BD Stream Slot 3",
      region: "BD",
      url: ""
    },

    // --- বিশ্ব চ্যানেল ---
    {
      name: "NASA TV Public (Live HLS)",
      region: "WORLD",
      url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8"
    },
    {
      name: "DW English Live (HLS)",
      region: "WORLD",
      url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8"
    },
    {
      name: "France 24 English Live (HLS)",
      region: "WORLD",
      url: "https://stream.france24.com/hls/live/2037279/F24_EN_LO_HLS/master.m3u8"
    },
    {
      name: "Al Jazeera English Live (HLS)",
      region: "WORLD",
      url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8"
    },
    {
      name: "NHK World Japan Live (HLS)",
      region: "WORLD",
      url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8"
    }
  ];

  const video = document.getElementById("tvVideo");
  const playerBox = document.getElementById("playerBox");
  const selectEl = document.getElementById("channelSelect");
  const qualityModeEl = document.getElementById("qualityMode");
  const customUrlEl = document.getElementById("customStreamUrl");
  const playBtn = document.getElementById("playBtn");
  const stopBtn = document.getElementById("stopBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const statusEl = document.getElementById("tvStatus");
  const streamTagEl = document.getElementById("streamTag");
  const regionButtons = document.querySelectorAll(".filter-btn");

  let currentRegion = "ALL";
  let hlsInstance = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function destroyHls() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  }

  function populateChannels() {
    const filtered = currentRegion === "ALL"
      ? TV_CHANNELS
      : TV_CHANNELS.filter(ch => ch.region === currentRegion);

    selectEl.innerHTML = '<option value="">Select TV Channel</option>';

    filtered.forEach((ch, idx) => {
      const opt = document.createElement("option");
      opt.value = ch.url || "";
      opt.dataset.name = ch.name;
      opt.dataset.region = ch.region;
      opt.textContent = `${idx + 1}. ${ch.name}${ch.url ? "" : " (লিংক দিন)"}`;
      selectEl.appendChild(opt);
    });
  }

  function applyHlsQualityMode(hls) {
    const mode = qualityModeEl.value;
    if (!hls || !hls.levels || !hls.levels.length) return;

    if (mode === "high" || mode === "8k") {
      // উপলব্ধ সর্বোচ্চ কোয়ালিটি/বিটরেট লেভেল নির্বাচন
      const highestIndex = hls.levels.length - 1;
      hls.currentLevel = highestIndex;
      hls.loadLevel = highestIndex;
    } else {
      hls.currentLevel = -1;
      hls.loadLevel = -1;
    }
  }

  function getActiveChannel() {
    const custom = customUrlEl.value.trim();
    if (custom) {
      return {
        url: custom,
        name: "Custom Live Stream",
        region: "CUSTOM"
      };
    }

    const opt = selectEl.selectedOptions[0];
    if (!opt || !opt.value) return null;

    return {
      url: opt.value.trim(),
      name: opt.dataset.name || opt.textContent,
      region: opt.dataset.region || "LIVE"
    };
  }

  function loadAndPlay(channel) {
    if (!channel || !channel.url) {
      setStatus("এই চ্যানেলের সরাসরি .m3u8/.mp4 লিংক দিন অথবা অন্য একটি কার্যকর চ্যানেল বেছে নিন।");
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

    streamTagEl.textContent = `⚡ ${channel.region} • ${modeLabel}`;
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
          setStatus(`"${channel.name}" চালু করা যায়নি (Geo-block/CORS/লিংক সমস্যা হতে পারে)।`);
          destroyHls();
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
    streamTagEl.textContent = "HIGH-SPEED LIVE ENGINE";
    setStatus("স্ট্রিম বন্ধ করা হয়েছে।");
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

  regionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      regionButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRegion = btn.dataset.region || "ALL";
      populateChannels();
    });
  });

  selectEl.addEventListener("change", () => {
    if (!selectEl.value) {
      setStatus("Please select a valid TV channel.");
      return;
    }
    customUrlEl.value = "";
    loadAndPlay(getActiveChannel());
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
      video.play().then(() => setStatus(`চলছে: ${active.name}`)).catch(() => loadAndPlay(active));
    } else {
      loadAndPlay(active);
    }
  });

  stopBtn.addEventListener("click", stopStream);
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  populateChannels();
})();