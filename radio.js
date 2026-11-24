(() => {
  // এখানে আপনার সক্রিয় AM/FM লাইভ স্ট্রিম (.mp3 / .aac / .m3u8) লিংক যুক্ত করুন
  const RADIO_STATIONS = [
    {
      name: "WRUF 98.1 FM (Live MP3)",
      band: "FM",
      freq: "98.1 FM",
      url: "https://ais-sa1.streamon.fm/7644_64k.mp3"
    },
    {
      name: "WRUF 850 AM (Live AAC)",
      band: "AM",
      freq: "850 AM",
      url: "https://ais-sa1.streamon.fm/7644_48k.aac"
    },
    {
      name: "Radio Mast Reference 128K Stereo (MP3)",
      band: "FM",
      freq: "HD 128K",
      url: "https://streams.radiomast.io/ref-128k-mp3-stereo"
    },
    {
      name: "Radio Mast Reference AAC-LC (AAC)",
      band: "AM",
      freq: "HD AAC",
      url: "https://streams.radiomast.io/ref-128k-aaclc-stereo"
    }
  ];

  const audio = document.getElementById("radioAudio");
  const selectEl = document.getElementById("stationSelect");
  const customUrlEl = document.getElementById("customRadioUrl");
  const playBtn = document.getElementById("playRadioBtn");
  const stopBtn = document.getElementById("stopRadioBtn");
  const volumeRange = document.getElementById("volumeRange");
  const statusEl = document.getElementById("radioStatus");
  const bandTagEl = document.getElementById("stationBandTag");
  const bandButtons = document.querySelectorAll(".band-btn");

  let currentBand = "ALL";
  let hls = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  function populateStations() {
    const filtered = currentBand === "ALL"
      ? RADIO_STATIONS
      : RADIO_STATIONS.filter(st => st.band === currentBand);

    selectEl.innerHTML = '<option value="">Select AM / FM Radio Station</option>';

    filtered.forEach((st, idx) => {
      const option = document.createElement("option");
      option.value = st.url;
      option.dataset.band = st.band;
      option.dataset.freq = st.freq;
      option.textContent = `${idx + 1}. [${st.band}] ${st.name}`;
      selectEl.appendChild(option);
    });
  }

  function getSelectedStationMeta() {
    const custom = customUrlEl.value.trim();
    if (custom) {
      return {
        url: custom,
        label: "CUSTOM STREAM",
        band: "LIVE"
      };
    }

    const opt = selectEl.selectedOptions[0];
    if (!opt || !opt.value) return null;

    return {
      url: opt.value,
      label: opt.textContent,
      band: opt.dataset.band || "RADIO"
    };
  }

  function playStream(meta) {
    if (!meta || !meta.url) {
      setStatus("একটি FM বা AM রেডিও স্টেশন নির্বাচন করুন অথবা স্ট্রিম লিংক দিন।");
      return;
    }

    destroyHls();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    bandTagEl.textContent = `⚡ ${meta.band} • HIGH-SPEED LIVE`;
    setStatus(`সংযোগ হচ্ছে: ${meta.label}...`);

    const isHls = meta.url.toLowerCase().includes(".m3u8");

    if (isHls && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(meta.url);
      hls.attachMedia(audio);

      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        audio.play().then(() => {
          setStatus(`লাইভ চলছে: ${meta.label}`);
        }).catch(() => {
          setStatus("প্লে করতে ▶ PLAY বাটনে চাপ দিন।");
        });
      });

      hls.on(window.Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStatus("এই স্ট্রিমটি চালু করা যায়নি (URL বা নেটওয়ার্ক পরীক্ষা করুন)।");
          destroyHls();
        }
      });
    } else {
      audio.src = meta.url;
      audio.preload = "auto";
      audio.play().then(() => {
        setStatus(`লাইভ চলছে: ${meta.label}`);
      }).catch(() => {
        setStatus("স্ট্রিম লোড হয়নি বা চালু করতে ▶ PLAY চাপুন।");
      });
    }
  }

  function stopStream() {
    destroyHls();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    bandTagEl.textContent = "HIGH-SPEED STREAM ENGINE";
    setStatus("রেডিও বন্ধ করা হয়েছে।");
  }

  bandButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      bandButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentBand = btn.dataset.band || "ALL";
      populateStations();
    });
  });

  selectEl.addEventListener("change", () => {
    if (selectEl.value) {
      customUrlEl.value = "";
      playStream(getSelectedStationMeta());
    }
  });

  playBtn.addEventListener("click", () => {
    const meta = getSelectedStationMeta();
    if (audio.src && meta && audio.src === meta.url && audio.paused) {
      audio.play().then(() => setStatus(`লাইভ চলছে: ${meta.label}`)).catch(() => playStream(meta));
    } else {
      playStream(meta);
    }
  });

  stopBtn.addEventListener("click", stopStream);

  volumeRange.addEventListener("input", () => {
    audio.volume = Number(volumeRange.value);
  });

  audio.addEventListener("error", () => {
    if (audio.src) {
      setStatus("অডিও স্ট্রিম চালু করা যায়নি (HTTPS লিংক বা সার্ভার স্ট্যাটাস যাচাই করুন)।");
    }
  });

  populateStations();
})();