function testDirectStream(url, label = "TEST") {
  if (!url || !videoEl) return;
  destroyHls();
  if (url.includes(".m3u8") && window.Hls && window.Hls.isSupported()) {
    hlsInstance = new window.Hls({ enableWorker: true });
    hlsInstance.loadSource(url);
    hlsInstance.attachMedia(videoEl);
    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
      videoEl.play().catch(() => {});
      setStatus(label, "LIVE");
    });
  } else {
    videoEl.src = url;
    videoEl.play().then(() => setStatus(label, "LIVE")).catch(() => setStatus(label, "CHECK URL"));
  }
}