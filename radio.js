
// =====================================================
// AYNA BOOK — RADIO LIVE
// File: radio.js
// =====================================================

const stations = [
  {
    name: "AYNA Radio",
    url: ""
  }

  // নিজের অনুমোদিত Radio Stream URL এখানে যোগ করুন:
  // {
  //   name: "Radio Station Name",
  //   url: "https://your-authorized-stream-url"
  // }
];

const player = document.getElementById("radioPlayer");
const select = document.getElementById("stationSelect");
const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const status = document.getElementById("status");
const stationName = document.getElementById("stationName");

stations.forEach((station, index) => {
  if (!station.url) return;

  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = station.name;
  select.appendChild(option);
});

function showStatus(message) {
  status.textContent = message;
}

select.addEventListener("change", () => {
  const station = stations[Number(select.value)];

  if (!station || !station.url) return;

  player.pause();
  player.src = station.url;
  player.load();

  stationName.textContent = station.name;
  showStatus("Station selected. Press Play.");
});

playButton.addEventListener("click", async () => {
  if (!player.src) {
    showStatus("Please select a valid radio station.");
    return;
  }

  try {
    await player.play();
    showStatus("Radio is playing live.");
  } catch (error) {
    console.error(error);
    showStatus("Playback failed. Check the stream URL.");
  }
});

stopButton.addEventListener("click", () => {
  player.pause();
  player.currentTime = 0;
  showStatus("Radio stopped.");
});

player.addEventListener("playing", () => {
  showStatus("Playing live radio.");
});

player.addEventListener("waiting", () => {
  showStatus("Connecting to radio...");
});

player.addEventListener("error", () => {
  showStatus("Radio stream unavailable.");
});
