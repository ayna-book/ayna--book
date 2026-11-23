
import Hls from "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/+esm";

// =====================================================
// AYNA BOOK — TV LIVE
// File: tv-live.js
// =====================================================

const channels = [
  {
    name: "AYNA TV",
    url: ""
  }

  // নিজের অনুমোদিত লাইভ TV Stream URL যোগ করুন:
  // {
  //   name: "Channel Name",
  //   url: "https://example.com/live/stream.m3u8"
  // }
];

const video = document.getElementById("tvPlayer");
const select = document.getElementById("channelSelect");
const nameElement = document.getElementById("channelName");
const status = document.getElementById("status");

const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const fullscreenButton =
  document.getElementById("fullscreenButton");

let hls = null;

channels.forEach((channel, index) => {
  if (!channel.url) return;

  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = channel.name;
  select.appendChild(option);
});

function destroyHls() {
  if (hls) {
    hls.destroy();
    hls = null;
  }
}

function loadChannel(channel) {
  destroyHls();

  video.pause();
  video.removeAttribute("src");
  video.load();

  nameElement.textContent = channel.name;

  if (channel.url.endsWith(".m3u8") ||
      channel.url.includes(".m3u8?")) {

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.loadSource(channel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        status.textContent = "Channel ready. Press Play.";
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          status.textContent = "TV stream unavailable.";
          destroyHls();
        }
      });

    } else if (video.canPlayType(
      "application/vnd.apple.mpegurl"
    )) {
      video.src = channel.url;
      status.textContent = "Channel ready.";
    } else {
      status.textContent = "HLS is not supported.";
    }

  } else {
    video.src = channel.url;
    status.textContent = "Channel ready.";
  }
}

select.addEventListener("change", () => {
  const channel = channels[Number(select.value)];

  if (!channel || !channel.url) return;

  loadChannel(channel);
});

playButton.addEventListener("click", async () => {
  if (!video.src && !hls) {
    status.textContent = "Please select a valid TV channel.";
    return;
  }

  try {
    await video.play();
    status.textContent = "TV is playing live.";
  } catch (error) {
    console.error(error);
    status.textContent = "Playback failed. Check the stream.";
  }
});

stopButton.addEventListener("click", () => {
  video.pause();
  status.textContent = "TV stopped.";
});

fullscreenButton.addEventListener("click", async () => {
  try {
    if (video.requestFullscreen) {
      await video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  } catch (error) {
    console.error(error);
    status.textContent = "Fullscreen unavailable.";
  }
});

video.addEventListener("playing", () => {
  status.textContent = "Playing live TV.";
});

video.addEventListener("waiting", () => {
  status.textContent = "Connecting to TV...";
});

video.addEventListener("error", () => {
  status.textContent = "TV stream error.";
});

window.addEventListener("beforeunload", destroyHls);
