
const radarStatus = document.getElementById("status");
const gpsDisplay = document.getElementById("gps");

let radarWatchId = null;

function startGPS() {
  if (!navigator.geolocation) {
    radarStatus.textContent = "GPS সমর্থিত নয়";
    return;
  }

  if (radarWatchId !== null) return;

  radarStatus.textContent = "GPS CONNECTING...";

  radarWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      gpsDisplay.textContent =
        `LAT: ${lat.toFixed(5)} | LNG: ${lng.toFixed(5)}`;

      radarStatus.textContent = "GPS CONNECTED";
    },
    (error) => {
      radarStatus.textContent = "GPS ERROR: " + error.message;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 20000
    }
  );
}

function stopRadarGPS() {
  if (radarWatchId !== null) {
    navigator.geolocation.clearWatch(radarWatchId);
    radarWatchId = null;
  }

  radarStatus.textContent = "GPS STOPPED";
}
