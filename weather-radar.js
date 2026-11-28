/* =========================================================
   AYNA BOOK — WEATHER RADAR
   File: weather-radar.js

   Features:
   1. Leaflet radar map
   2. RainViewer radar data
   3. GPS current location
   4. Bangladesh center
   5. Radar refresh
   6. Map fullscreen
   7. User location marker
   8. Latest radar frame
   9. Radar timestamp
   10. AI Weather Analysis interface
   11. Automatic radar refresh
   12. Graceful error handling

   IMPORTANT:
   - No Firebase / RTDB required.
   - No API key required for RainViewer public API.
   - RainViewer attribution is required.
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const AYNA_WEATHER_CONFIG = {

  // Bangladesh
  BANGLADESH: {
    lat: 23.6850,
    lon: 90.3563,
    zoom: 6
  },

  // Default map
  DEFAULT: {
    lat: 23.6850,
    lon: 90.3563,
    zoom: 6
  },

  // RainViewer public API
  API:
    "https://api.rainviewer.com/public/weather-maps.json",

  // Radar refresh interval
  // 5 minutes
  REFRESH_MS: 5 * 60 * 1000,

  // Maximum Leaflet zoom because current
  // RainViewer public radar tiles have max zoom 7.
  MAX_RADAR_ZOOM: 7,

  // Radar tile appearance
  TILE_SIZE: 256,

  // Universal Blue is the currently available
  // public color scheme.
  COLOR: 2,

  // Smooth radar image
  SMOOTH: 1,

  // Snow option
  SNOW: 0

};


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let radarMap = null;

let radarLayer = null;

let userMarker = null;

let userAccuracyCircle = null;

let userLatitude = null;

let userLongitude = null;

let radarFrames = [];

let latestRadarFrame = null;

let radarRefreshTimer = null;

let isRadarLoading = false;

let lastRadarGenerated = null;


/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {
  return document.getElementById(id);
}


function setText(id, value) {

  const element = getElement(id);

  if (!element) return;

  element.textContent = value;
}


function setStatus(message, type = "warning") {

  const status = getElement("radarStatus");

  if (!status) return;

  status.textContent = message;

  status.classList.remove(
    "success",
    "warning",
    "error"
  );

  status.classList.add(type);
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeWeatherRadar();

  }
);


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

async function initializeWeatherRadar() {

  try {

    setupButtons();

    initializeMap();

    addRainViewerAttribution();

    await loadRadarData();

    startAutomaticRefresh();

    setStatus(
      "✅ Weather Radar প্রস্তুত। সর্বশেষ radar frame দেখানো হচ্ছে।",
      "success"
    );

  } catch (error) {

    console.error(
      "AYNA Weather Radar initialization error:",
      error
    );

    setStatus(
      "⚠️ Weather Radar চালু করতে সমস্যা হয়েছে। Internet connection পরীক্ষা করুন।",
      "error"
    );

    hideMapLoading();

  }

}


/* =========================================================
   INITIALIZE LEAFLET MAP
========================================================= */

function initializeMap() {

  const mapElement = getElement("radarMap");

  if (!mapElement) {

    console.error(
      "radarMap element not found."
    );

    return;

  }


  radarMap = L.map(
    "radarMap",
    {
      center: [
        AYNA_WEATHER_CONFIG.DEFAULT.lat,
        AYNA_WEATHER_CONFIG.DEFAULT.lon
      ],

      zoom: AYNA_WEATHER_CONFIG.DEFAULT.zoom,

      minZoom: 2,

      maxZoom: 18,

      zoomControl: true,

      attributionControl: true
    }
  );


  /* -------------------------------------------------------
     OpenStreetMap base map
  ------------------------------------------------------- */

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,

      attribution:
        '&copy; OpenStreetMap contributors'
    }
  ).addTo(radarMap);


  hideMapLoading();

}


/* =========================================================
   RAINVIEWER ATTRIBUTION
========================================================= */

function addRainViewerAttribution() {

  if (!radarMap) return;

  /*
    RainViewer requires visible attribution
    when using its public radar API.
  */

  const attributionControl =
    radarMap.attributionControl;

  if (!attributionControl) return;

  attributionControl.addAttribution(
    'Weather data by <a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer">RainViewer</a>'
  );

}


/* =========================================================
   LOAD RADAR JSON
========================================================= */

async function loadRadarData() {

  if (isRadarLoading) {

    return;

  }

  isRadarLoading = true;

  setStatus(
    "🛰️ সর্বশেষ Weather Radar data লোড হচ্ছে...",
    "warning"
  );


  try {

    const response = await fetch(
      AYNA_WEATHER_CONFIG.API +
      "?t=" +
      Date.now(),
      {
        method: "GET",

        cache: "no-store"
      }
    );


    if (!response.ok) {

      throw new Error(
        "Radar API HTTP " +
        response.status
      );

    }


    const data =
      await response.json();


    /*
      Current RainViewer API provides
      radar.past frames.
    */

    if (
      !data ||
      !data.radar ||
      !Array.isArray(data.radar.past) ||
      data.radar.past.length === 0
    ) {

      throw new Error(
        "No radar frames available."
      );

    }


    radarFrames =
      data.radar.past;


    latestRadarFrame =
      radarFrames[
        radarFrames.length - 1
      ];


    if (
      !latestRadarFrame ||
      !latestRadarFrame.path
    ) {

      throw new Error(
        "Latest radar frame unavailable."
      );

    }


    lastRadarGenerated =
      latestRadarFrame.time;


    renderLatestRadar(
      data.host,
      latestRadarFrame
    );


    updateRadarInformation(
      latestRadarFrame
    );


    setText(
      "radarBadge",
      "RADAR UPDATED"
    );


    setStatus(
      "✅ Radar data সফলভাবে আপডেট হয়েছে।",
      "success"
    );


    setTimeout(
      () => {

        setText(
          "radarBadge",
          "RADAR READY"
        );

      },
      4000
    );


  } catch (error) {

    console.error(
      "Radar data loading failed:",
      error
    );


    setStatus(
      "⚠️ Radar data এখন পাওয়া যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      "error"
    );


  } finally {

    isRadarLoading = false;

  }

}


/* =========================================================
   RENDER LATEST RADAR
========================================================= */

function renderLatestRadar(
  host,
  frame
) {

  if (!radarMap) return;

  if (!host || !frame || !frame.path) {

    return;

  }


  /*
    Remove previous radar layer.
  */

  if (radarLayer) {

    radarMap.removeLayer(
      radarLayer
    );

    radarLayer = null;

  }


  /*
    RainViewer current public API tile format:

    host/path/size/z/x/y/color/options.png

    Current public radar supports maximum
    zoom level 7.
  */

  const tileUrl =
    host +
    frame.path +
    "/" +
    AYNA_WEATHER_CONFIG.TILE_SIZE +
    "/{z}/{x}/{y}/" +
    AYNA_WEATHER_CONFIG.COLOR +
    "/" +
    AYNA_WEATHER_CONFIG.SMOOTH +
    "_" +
    AYNA_WEATHER_CONFIG.SNOW +
    ".png";


  radarLayer =
    L.tileLayer(
      tileUrl,
      {
        opacity: 0.72,

        tileSize:
          AYNA_WEATHER_CONFIG.TILE_SIZE,

        minZoom: 2,

        maxZoom:
          AYNA_WEATHER_CONFIG.MAX_RADAR_ZOOM,

        zIndex: 500,

        updateWhenIdle: true,

        updateWhenZooming: false,

        keepBuffer: 2
      }
    );


  radarLayer.addTo(
    radarMap
  );


  /*
    Keep radar below markers.
  */

  if (userMarker) {

    userMarker.setZIndexOffset(
      1000
    );

  }

}


/* =========================================================
   UPDATE RADAR INFORMATION
========================================================= */

function updateRadarInformation(frame) {

  if (!frame || !frame.time) {

    return;

  }


  const date =
    new Date(
      frame.time * 1000
    );


  const formatted =
    date.toLocaleString(
      undefined,
      {
        year: "numeric",

        month: "short",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit",

        hour12: false
      }
    );


  setText(
    "lastUpdate",
    formatted
  );


  /*
    Update AI panel with radar frame
    information.
  */

  const aiStatus =
    getElement("aiStatus");

  if (aiStatus) {

    aiStatus.textContent =
      "Radar frame: " +
      formatted +
      " • AI analysis প্রস্তুত।";

  }

}


/* =========================================================
   GPS LOCATION
========================================================= */

function locateUser() {

  if (!navigator.geolocation) {

    setStatus(
      "❌ এই browser/device GPS Geolocation support করে না।",
      "error"
    );

    return;

  }


  setStatus(
    "📍 আপনার বর্তমান অবস্থান খোঁজা হচ্ছে...",
    "warning"
  );


  navigator.geolocation.getCurrentPosition(

    position => {

      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;

      const accuracy =
        position.coords.accuracy;


      userLatitude =
        latitude;

      userLongitude =
        longitude;


      updateLocationInformation(
        latitude,
        longitude,
        accuracy
      );


      showUserLocation(
        latitude,
        longitude,
        accuracy
      );


      if (radarMap) {

        radarMap.setView(
          [
            latitude,
            longitude
          ],
          Math.min(
            8,
            AYNA_WEATHER_CONFIG.MAX_RADAR_ZOOM
          ),
          {
            animate: true
          }
        );

      }


      setStatus(
        "✅ আপনার বর্তমান অবস্থান পাওয়া গেছে।",
        "success"
      );


      runLocalWeatherGuidance();

    },


    error => {

      handleLocationError(
        error
      );

    },


    {
      enableHighAccuracy: true,

      timeout: 15000,

      maximumAge: 60000
    }

  );

}


/* =========================================================
   SHOW USER LOCATION
========================================================= */

function showUserLocation(
  latitude,
  longitude,
  accuracy
) {

  if (!radarMap) return;


  /*
    Remove old marker.
  */

  if (userMarker) {

    radarMap.removeLayer(
      userMarker
    );

  }


  if (userAccuracyCircle) {

    radarMap.removeLayer(
      userAccuracyCircle
    );

  }


  /*
    User marker
  */

  userMarker =
    L.marker(
      [
        latitude,
        longitude
      ],
      {
        title:
          "Your current location"
      }
    ).addTo(
      radarMap
    );


  userMarker.bindPopup(
    `
      <strong>📍 AYNA BOOK Location</strong>
      <br>
      Latitude: ${latitude.toFixed(6)}
      <br>
      Longitude: ${longitude.toFixed(6)}
      <br>
      Accuracy: ${Math.round(accuracy)} m
    `
  );


  /*
    Accuracy circle
  */

  userAccuracyCircle =
    L.circle(
      [
        latitude,
        longitude
      ],
      {
        radius: accuracy,

        color: "#00e5ff",

        fillColor: "#00e5ff",

        fillOpacity: 0.08,

        weight: 2
      }
    ).addTo(
      radarMap
    );


  /*
    Open popup once.
  */

  userMarker.openPopup();

}


/* =========================================================
   LOCATION INFORMATION
========================================================= */

function updateLocationInformation(
  latitude,
  longitude,
  accuracy
) {

  setText(
    "latitude",
    latitude.toFixed(6)
  );


  setText(
    "longitude",
    longitude.toFixed(6)
  );


  setText(
    "accuracy",
    Math.round(accuracy) +
    " m"
  );


  setText(
    "lastUpdate",
    new Date().toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit"
      }
    )
  );

}


/* =========================================================
   LOCATION ERROR
========================================================= */

function handleLocationError(
  error
) {

  let message =
    "📍 Location পাওয়া যায়নি।";


  if (error) {

    switch (error.code) {

      case error.PERMISSION_DENIED:

        message =
          "❌ Location permission দেওয়া হয়নি। Browser settings থেকে Location Allow করুন.";

        break;


      case error.POSITION_UNAVAILABLE:

        message =
          "⚠️ GPS location বর্তমানে পাওয়া যাচ্ছে না।";

        break;


      case error.TIMEOUT:

        message =
          "⏱️ GPS location পেতে সময় শেষ হয়ে গেছে। আবার চেষ্টা করুন.";

        break;


      default:

        message =
          "❌ GPS location পাওয়া যায়নি।";

    }

  }


  setStatus(
    message,
    "error"
  );

}


/* =========================================================
   CENTER BANGLADESH
========================================================= */

function centerBangladesh() {

  if (!radarMap) return;


  radarMap.setView(
    [
      AYNA_WEATHER_CONFIG.BANGLADESH.lat,

      AYNA_WEATHER_CONFIG.BANGLADESH.lon
    ],

    AYNA_WEATHER_CONFIG.BANGLADESH.zoom,

    {
      animate: true
    }
  );


  setStatus(
    "🇧🇩 বাংলাদেশ অঞ্চলে Weather Radar কেন্দ্রীভূত করা হয়েছে।",
    "success"
  );

}


/* =========================================================
   FULLSCREEN MAP
========================================================= */

function fullscreenMap() {

  const mapElement =
    getElement("radarMap");

  if (!mapElement) return;


  /*
    Browser native fullscreen.
  */

  if (
    document.fullscreenElement
  ) {

    document.exitFullscreen();

    return;

  }


  if (
    mapElement.requestFullscreen
  ) {

    mapElement.requestFullscreen();

  } else {

    /*
      Fallback for some browsers.
    */

    mapElement.classList.toggle(
      "ayna-map-fullscreen"
    );

  }

}


/* =========================================================
   FULLSCREEN CHANGE
========================================================= */

document.addEventListener(
  "fullscreenchange",
  () => {

    setTimeout(
      () => {

        if (radarMap) {

          radarMap.invalidateSize();

        }

      },
      300
    );

  }
);


/* =========================================================
   REFRESH RADAR
========================================================= */

async function refreshRadar() {

  if (isRadarLoading) {

    setStatus(
      "⏳ Radar ইতোমধ্যে update হচ্ছে...",
      "warning"
    );

    return;

  }


  setStatus(
    "🔄 Radar manually refresh করা হচ্ছে...",
    "warning"
  );


  await loadRadarData();


  if (radarMap) {

    setTimeout(
      () => {

        radarMap.invalidateSize();

      },
      300
    );

  }

}


/* =========================================================
   AUTOMATIC REFRESH
========================================================= */

function startAutomaticRefresh() {

  stopAutomaticRefresh();


  radarRefreshTimer =
    setInterval(
      () => {

        loadRadarData();

      },
      AYNA_WEATHER_CONFIG.REFRESH_MS
    );

}


/* =========================================================
   STOP AUTOMATIC REFRESH
========================================================= */

function stopAutomaticRefresh() {

  if (radarRefreshTimer) {

    clearInterval(
      radarRefreshTimer
    );

    radarRefreshTimer = null;

  }

}


/* =========================================================
   MAP RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (!radarMap) return;


    setTimeout(
      () => {

        radarMap.invalidateSize();

      },
      250
    );

  }
);


/* =========================================================
   AI WEATHER ANALYSIS
========================================================= */

function runAIWeatherAnalysis() {

  const aiAnswer =
    getElement("aiAnswer");

  const aiStatus =
    getElement("aiStatus");


  if (!aiAnswer) return;


  if (aiStatus) {

    aiStatus.textContent =
      "🤖 AYNA AI radar তথ্য বিশ্লেষণ করছে...";

  }


  /*
    IMPORTANT:

    This is an AI-ready analysis layer.
    It does NOT invent rainfall data.

    A real generative AI backend can later
    receive the actual radar/weather data.
  */


  let locationText =
    "আপনার অবস্থান এখনো নির্ধারণ করা হয়নি।";


  if (
    userLatitude !== null &&
    userLongitude !== null
  ) {

    locationText =
      "আপনার GPS অবস্থান: " +
      userLatitude.toFixed(5) +
      ", " +
      userLongitude.toFixed(5) +
      ".";

  }


  let radarText =
    "সর্বশেষ radar frame পাওয়া গেছে।";


  if (lastRadarGenerated) {

    const date =
      new Date(
        lastRadarGenerated * 1000
      );


    radarText =
      "সর্বশেষ radar frame: " +
      date.toLocaleString();

  }


  const answer =

`🤖 AYNA AI Weather Analysis

${locationText}

${radarText}

🌧️ Radar কী দেখায়:
Weather radar মূলত বৃষ্টিপাত/precipitation-এর অবস্থান ও গতিবিধি পর্যবেক্ষণে সাহায্য করে।

📡 বর্তমান data:
AYNA BOOK-এর radar layer বর্তমানে RainViewer-এর public weather-radar data ব্যবহার করছে।

⚠️ গুরুত্বপূর্ণ:
এই analysis কোনো নিশ্চিত দুর্যোগের পূর্বাভাস নয়। Radar coverage, source radar availability এবং data delay-এর কারণে তথ্য পরিবর্তিত হতে পারে।

🚨 যদি আপনার এলাকায় বজ্রঝড়, ঘূর্ণিঝড়, ভারী বৃষ্টি বা বন্যার সরকারি সতর্কতা থাকে, স্থানীয় আবহাওয়া কর্তৃপক্ষের নির্দেশনা অনুসরণ করুন।

📍 GPS + Radar + Weather API + AI একসঙ্গে ব্যবহার করলে AYNA BOOK ভবিষ্যতে আপনার অবস্থান অনুযায়ী আরও উন্নত weather guidance দিতে পারবে।`;


  setTimeout(
    () => {

      aiAnswer.textContent =
        answer;


      if (aiStatus) {

        aiStatus.textContent =
          "✅ AI Weather Analysis সম্পন্ন।";

      }

    },
    500
  );

}


/* =========================================================
   LOCAL WEATHER GUIDANCE
========================================================= */

function runLocalWeatherGuidance() {

  const aiAnswer =
    getElement("aiAnswer");

  if (!aiAnswer) return;


  if (
    userLatitude === null ||
    userLongitude === null
  ) {

    return;

  }


  aiAnswer.textContent =

`📍 GPS Location পাওয়া গেছে।

Latitude:
${userLatitude.toFixed(6)}

Longitude:
${userLongitude.toFixed(6)}

🌧️ Radar এখন আপনার অবস্থানকে কেন্দ্র করে দেখানো হচ্ছে।

🤖 আরও উন্নত AI weather analysis-এর জন্য
real-time weather conditions, precipitation,
wind, temperature এবং alerts data যুক্ত করা যেতে পারে।`;

}


/* =========================================================
   HOME BUTTON
========================================================= */

function goHome() {

  window.location.href =
    "./index.html";

}


/* =========================================================
   BUTTON SETUP
========================================================= */

function setupButtons() {

  const locateBtn =
    getElement("locateBtn");

  const refreshRadarBtn =
    getElement("refreshRadarBtn");

  const centerBangladeshBtn =
    getElement("centerBangladeshBtn");

  const fullScreenMapBtn =
    getElement("fullScreenMapBtn");

  const aiAnalyzeBtn =
    getElement("aiAnalyzeBtn");

  const homeBtn =
    getElement("homeBtn");

  const fullScreenBtn =
    getElement("fullScreenBtn");


  if (locateBtn) {

    locateBtn.addEventListener(
      "click",
      locateUser
    );

  }


  if (refreshRadarBtn) {

    refreshRadarBtn.addEventListener(
      "click",
      refreshRadar
    );

  }


  if (centerBangladeshBtn) {

    centerBangladeshBtn.addEventListener(
      "click",
      centerBangladesh
    );

  }


  if (fullScreenMapBtn) {

    fullScreenMapBtn.addEventListener(
      "click",
      fullscreenMap
    );

  }


  if (fullScreenBtn) {

    fullScreenBtn.addEventListener(
      "click",
      fullscreenMap
    );

  }


  if (aiAnalyzeBtn) {

    aiAnalyzeBtn.addEventListener(
      "click",
      runAIWeatherAnalysis
    );

  }


  if (homeBtn) {

    homeBtn.addEventListener(
      "click",
      goHome
    );

  }

}


/* =========================================================
   MAP LOADING
========================================================= */

function hideMapLoading() {

  const loading =
    getElement("mapLoading");

  if (!loading) return;


  loading.style.display =
    "none";

}


/* =========================================================
   OPTIONAL: REFRESH WHEN PAGE BECOMES VISIBLE
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "visible"
    ) {

      /*
        Refresh only if the last radar
        update is older than 5 minutes.
      */

      if (
        lastRadarGenerated &&
        Date.now() -
        (lastRadarGenerated * 1000)
        >
        AYNA_WEATHER_CONFIG.REFRESH_MS
      ) {

        loadRadarData();

      }

    }

  }
);


/* =========================================================
   PUBLIC AYNA WEATHER OBJECT
========================================================= */

window.AYNA_WEATHER_RADAR = {

  refresh: refreshRadar,

  locate: locateUser,

  centerBangladesh:

    centerBangladesh,

  fullscreen:

    fullscreenMap,

  analyze:

    runAIWeatherAnalysis,

  getLocation: () => {

    return {

      latitude:
        userLatitude,

      longitude:
        userLongitude

    };

  },

  getLatestFrame: () => {

    return latestRadarFrame;

  }

};


/* =========================================================
   END
========================================================= */