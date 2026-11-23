
const gpsStatus = document.getElementById("status");
const latitudeDisplay = document.getElementById("lat");
const longitudeDisplay = document.getElementById("lng");
const accuracyDisplay = document.getElementById("accuracy");
const timeDisplay = document.getElementById("time");
const mapLink = document.getElementById("map");

let gpsWatchId = null;

function startGPS() {
  if (!navigator.geolocation) {
    gpsStatus.textContent = "GPS সমর্থিত নয়";
    return;
  }

  if (gpsWatchId !== null) return;

  gpsStatus.textContent = "GPS CONNECTING...";

  gpsWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const coords = position.coords;

      latitudeDisplay.textContent =
        "Latitude: " + coords.latitude;

      longitudeDisplay.textContent =
        "Longitude: " + coords.longitude;

      accuracyDisplay.textContent =
        "Accuracy: " + coords.accuracy + " মিটার";

      timeDisplay.textContent =
        "Updated: " + new Date().toLocaleTimeString();

      mapLink.href =
        `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;

      mapLink.hidden = false;
      gpsStatus.textContent = "GPS CONNECTED";
    },
    (error) => {
      gpsStatus.textContent = "GPS ERROR: " + error.message;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 20000
    }
  );
}

function stopGPS() {
  if (gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }

  gpsStatus.textContent = "GPS STOPPED";
}
