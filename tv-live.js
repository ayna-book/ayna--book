(() => {
  // এখানে আপনার কার্যকর লাইভ টিভি চ্যানেল (.m3u8 বা .mp4) লিংকগুলো যুক্ত করুন
  const TV_CHANNELS = [
    {
      name: "NASA TV Public (Live HLS)",
      url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8"
    },
    {
      name: "DW English Live (HLS)",
      url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8"
    },
    {
      name: "France 24 English Live (HLS)",
      url: "https://stream.france24.com/hls/live/2037279/F24_EN_LO_HLS/master.m3u8"
    }
  ];

  const video = document.getElementById("tvVideo");
  const playerBox = document.getElementById("playerBox");
  const selectEl = document.getElementById("channelSelect");
  const customUrlEl = document.getElementById("customStreamUrl");
  const playBtn = document.getElementById("playBtn");
  const stopBtn = document.getElementById("stopBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const statusEl = document.getElementById("tvStatus");

  let hlsInstance = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function populateChannels() {
    TV_CHANNELS.forEach((ch, idx) => {
      const opt = document.createElement("option");
      opt.value = ch.url;
      opt.textContent = `${idx + 1}. ${ch.name}`;
      selectEl.appendChild(opt);
    });
  }

  function destroyHls() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  }

  function getActiveUrl() {
    const custom = customUrlEl.value.trim();
    if (custom) return custom;
    return selectEl.value.trim();
  }

  function loadAndPlay(url) {
    if (!url) {
      setStatus("Please select a valid TV channel.");
      return;
    }

    destroyHls();
    video.pause();
    video.removeAttribute("src");
    video.load();

    const isHls = url.toLowerCase().includes(".m3u8");

    if (isHls && window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);

      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => {
          setStatus("লাইভ স্ট্রিম চলছে...");
        }).catch(() => {
          setStatus("স্ট্রিমে ক্লিক করে বা PLAY চেপে চালু করুন।");
        });
      });

      hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStatus("স্ট্রিম লোড করা যায়নি (লিঙ্ক বা CORS/নেটওয়ার্ক পরীক্ষা করুন)।");
          destroyHls();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl") || !isHls) {
      video.src = url;
      video.play().then(() => {
        setStatus("লাইভ স্ট্রিম চলছে...");
      }).catch(() => {
        setStatus("স্ট্রিম লোড করা যায়নি বা চালু করতে PLAY চাপুন।");
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

  selectEl.addEventListener("change", () => {
    if (selectEl.value) {
      customUrlEl.value = "";
      loadAndPlay(selectEl.value);
    } else {
      setStatus("Please select a valid TV channel.");
    }
  });

  playBtn.addEventListener("click", () => {
    const url = getActiveUrl();
    if (!url) {
      setStatus("Please select a valid TV channel.");
      return;
    }
    if (video.src && video.src === url && video.paused) {
      video.play().then(() => setStatus("লাইভ স্ট্রিম চলছে...")).catch(() => loadAndPlay(url));
    } else {
      loadAndPlay(url);
    }
  });

  stopBtn.addEventListener("click", stopStream);
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  populateChannels();
})();