/* =========================================================
   AYNA BOOK
   SMART TRAFFIC NAVIGATOR
   =========================================================

   Features:
   - GPS location
   - Leaflet map
   - Destination search
   - OpenStreetMap Nominatim search
   - Route calculation
   - Alternative route comparison
   - Traffic-aware architecture
   - Voice guidance
   - Route clearing

   IMPORTANT:
   This version does NOT pretend that ordinary GPS
   automatically knows live traffic.

   For true live traffic, connect a traffic/routing
   provider that supplies current traffic information.
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = {

  APP_NAME: "AYNA BOOK Smart Traffic Navigator",

  NOMINATIM_URL:
    "https://nominatim.openstreetmap.org/search",

  ROUTING_URL:
    "https://router.project-osrm.org/route/v1/driving",

  DEFAULT_ZOOM: 13,

  GPS_ZOOM: 16,

  MAX_SEARCH_RESULTS: 5,

  SPEECH_LANGUAGE: "bn-BD"

};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let map = null;

let userMarker = null;

let destinationMarker = null;

let routeLayers = [];

let currentPosition = null;

let destinationPosition = null;

let voiceEnabled = true;

let watchId = null;


/* =========================================================
   DOM
   ========================================================= */

const destinationInput =
  document.getElementById(
    "destinationInput"
  );

const searchDestinationBtn =
  document.getElementById(
    "searchDestinationBtn"
  );

const locateBtn =
  document.getElementById(
    "locateBtn"
  );

const routeBtn =
  document.getElementById(
    "routeBtn"
  );

const avoidTrafficBtn =
  document.getElementById(
    "avoidTrafficBtn"
  );

const clearBtn =
  document.getElementById(
    "clearBtn"
  );

const voiceBtn =
  document.getElementById(
    "voiceBtn"
  );

const statusBox =
  document.getElementById(
    "statusBox"
  );

const mapState =
  document.getElementById(
    "mapState"
  );

const bestTime =
  document.getElementById(
    "bestTime"
  );

const bestDistance =
  document.getElementById(
    "bestDistance"
  );

const altTime =
  document.getElementById(
    "altTime"
  );

const altDistance =
  document.getElementById(
    "altDistance"
  );

const trafficState =
  document.getElementById(
    "trafficState"
  );


/* =========================================================
   INITIALIZE MAP
   ========================================================= */

function initMap() {

  map = L.map("map", {

    zoomControl: true,

    attributionControl: true

  }).setView(

    [23.8103, 90.4125],

    CONFIG.DEFAULT_ZOOM

  );


  L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

      maxZoom: 19,

      attribution:
        '&copy; OpenStreetMap contributors'

    }

  ).addTo(map);


  map.on(
    "click",
    handleMapClick
  );


  setMapState(
    "Map প্রস্তুত। আপনার GPS location শুরু করুন।"
  );

}


/* =========================================================
   MAP CLICK
   ========================================================= */

function handleMapClick(event) {

  const {
    lat,
    lng
  } = event.latlng;


  destinationPosition = {
    lat,
    lng
  };


  setDestinationMarker(
    lat,
    lng,
    "Selected destination"
  );


  setStatus(
    "🗺️ Map থেকে গন্তব্য নির্বাচন করা হয়েছে। এখন Route তৈরি করুন।"
  );


  map.setView(
    [lat, lng],
    CONFIG.DEFAULT_ZOOM
  );

}


/* =========================================================
   GPS
   ========================================================= */

function getCurrentLocation() {

  if (!navigator.geolocation) {

    setStatus(
      "❌ এই browser GPS Geolocation support করে না।",
      "danger"
    );

    return;

  }


  setStatus(
    "📍 GPS location নেওয়া হচ্ছে..."
  );


  navigator.geolocation.getCurrentPosition(

    position => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;


      currentPosition = {
        lat,
        lng,
        accuracy:
          position.coords.accuracy
      };


      setUserMarker(
        lat,
        lng
      );


      map.setView(
        [lat, lng],
        CONFIG.GPS_ZOOM
      );


      setMapState(
        "🟢 GPS connected — আপনার অবস্থান পাওয়া গেছে।"
      );


      setStatus(
        "🟢 GPS পাওয়া গেছে। এখন গন্তব্য লিখুন অথবা map-এ tap করুন।"
      );


      speak(
        "আপনার বর্তমান অবস্থান পাওয়া গেছে। এখন গন্তব্য নির্বাচন করুন।"
      );


      startGPSWatch();

    },

    error => {

      handleGPSError(
        error
      );

    },

    {

      enableHighAccuracy: true,

      timeout: 15000,

      maximumAge: 5000

    }

  );

}


/* =========================================================
   CONTINUOUS GPS WATCH
   ========================================================= */

function startGPSWatch() {

  if (
    watchId !== null
  ) {

    return;

  }


  watchId =
    navigator.geolocation.watchPosition(

      position => {

        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;


        currentPosition = {
          lat,
          lng,
          accuracy:
            position.coords.accuracy
        };


        updateUserMarker(
          lat,
          lng
        );

      },

      error => {

        console.warn(
          "GPS watch error:",
          error
        );

      },

      {

        enableHighAccuracy: true,

        maximumAge: 5000,

        timeout: 15000

      }

    );

}


/* =========================================================
   GPS ERROR
   ========================================================= */

function handleGPSError(
  error
) {

  let message =
    "GPS পাওয়া যায়নি।";


  if (
    error.code ===
    error.PERMISSION_DENIED
  ) {

    message =
      "❌ GPS permission দেওয়া হয়নি। Browser location permission চালু করুন.";

  }

  else if (
    error.code ===
    error.POSITION_UNAVAILABLE
  ) {

    message =
      "⚠️ GPS position পাওয়া যাচ্ছে না।";

  }

  else if (
    error.code ===
    error.TIMEOUT
  ) {

    message =
      "⏱️ GPS request timeout হয়েছে। আবার চেষ্টা করুন.";

  }


  setStatus(
    message,
    "danger"
  );

}


/* =========================================================
   USER MARKER
   ========================================================= */

function setUserMarker(
  lat,
  lng
) {

  if (
    userMarker
  ) {

    map.removeLayer(
      userMarker
    );

  }


  userMarker =
    L.marker(
      [lat, lng]
    )
      .addTo(map)
      .bindPopup(
        "<strong>📍 You are here</strong>"
      );


  userMarker.openPopup();

}


/* =========================================================
   UPDATE USER MARKER
   ========================================================= */

function updateUserMarker(
  lat,
  lng
) {

  if (
    !userMarker
  ) {

    setUserMarker(
      lat,
      lng
    );

    return;

  }


  userMarker.setLatLng(
    [lat, lng]
  );

}


/* =========================================================
   DESTINATION MARKER
   ========================================================= */

function setDestinationMarker(
  lat,
  lng,
  title = "Destination"
) {

  if (
    destinationMarker
  ) {

    map.removeLayer(
      destinationMarker
    );

  }


  destinationMarker =
    L.marker(
      [lat, lng]
    )
      .addTo(map)
      .bindPopup(
        `<strong>🎯 ${escapeHTML(title)}</strong>`
      );

}


/* =========================================================
   DESTINATION SEARCH
   ========================================================= */

async function searchDestination() {

  const query =
    destinationInput.value.trim();


  if (
    !query
  ) {

    setStatus(
      "⚠️ আগে একটি গন্তব্য লিখুন।",
      "warning"
    );

    return;

  }


  searchDestinationBtn.disabled =
    true;

  searchDestinationBtn.textContent =
    "🔎 খোঁজা হচ্ছে...";


  try {

    /*
      Nominatim search is user-triggered.
      Do not use this code for autocomplete
      or continuous searches.
    */

    const params =
      new URLSearchParams({

        q: query,

        format: "json",

        limit:
          String(
            CONFIG.MAX_SEARCH_RESULTS
          ),

        addressdetails: "1"

      });


    const response =
      await fetch(
        `${CONFIG.NOMINATIM_URL}?${params.toString()}`,
        {

          headers: {

            "Accept":
              "application/json",

            "Accept-Language":
              "bn,en"

          }

        }
      );


    if (
      !response.ok
    ) {

      throw new Error(
        "Destination search failed."
      );

    }


    const results =
      await response.json();


    if (
      !results.length
    ) {

      setStatus(
        "❌ গন্তব্য পাওয়া যায়নি। অন্যভাবে লিখে চেষ্টা করুন।",
        "danger"
      );

      return;

    }


    const result =
      results[0];


    const lat =
      Number(result.lat);

    const lng =
      Number(result.lon);


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {

      throw new Error(
        "Invalid destination coordinates."
      );

    }


    destinationPosition = {
      lat,
      lng
    };


    setDestinationMarker(
      lat,
      lng,
      result.display_name
    );


    map.setView(
      [lat, lng],
      CONFIG.DEFAULT_ZOOM
    );


    setStatus(
      `🎯 Destination পাওয়া গেছে: ${result.display_name}`
    );


    setMapState(
      "🎯 Destination selected."
    );


    /*
      Automatically calculate route if GPS
      is already available.
    */

    if (
      currentPosition
    ) {

      await calculateRoutes();

    }

  }

  catch (error) {

    console.error(
      "Destination search error:",
      error
    );


    setStatus(
      "❌ Destination search ব্যর্থ হয়েছে। Internet connection পরীক্ষা করুন।",
      "danger"
    );

  }

  finally {

    searchDestinationBtn.disabled =
      false;

    searchDestinationBtn.textContent =
      "🔎 গন্তব্য খুঁজুন";

  }

}


/* =========================================================
   ROUTE CALCULATION
   ========================================================= */

async function calculateRoutes() {

  if (
    !currentPosition
  ) {

    setStatus(
      "📍 আগে আপনার GPS location চালু করুন।",
      "warning"
    );

    return;

  }


  if (
    !destinationPosition
  ) {

    setStatus(
      "🎯 আগে destination নির্বাচন করুন।",
      "warning"
    );

    return;

  }


  clearRouteLayers();


  setStatus(
    "🗺️ Route হিসাব করা হচ্ছে..."
  );


  setMapState(
    "Route calculation চলছে..."
  );


  try {

    const start =
      `${currentPosition.lng},${currentPosition.lat}`;

    const end =
      `${destinationPosition.lng},${destinationPosition.lat}`;


    /*
      OSRM public routing service.

      alternatives=true asks the router
      to return alternative routes when available.
    */

    const url =
      `${CONFIG.ROUTING_URL}/` +
      `${start};${end}` +
      `?overview=full` +
      `&geometries=geojson` +
      `&steps=true` +
      `&alternatives=true`;


    const response =
      await fetch(url);


    if (
      !response.ok
    ) {

      throw new Error(
        "Routing service unavailable."
      );

    }


    const data =
      await response.json();


    if (
      data.code !== "Ok" ||
      !data.routes ||
      !data.routes.length
    ) {

      throw new Error(
        "No route found."
      );

    }


    renderRoutes(
      data.routes
    );


    setStatus(
      `🟢 ${data.routes.length}টি route পাওয়া গেছে।`
    );


    setMapState(
      "🟢 Route ready."
    );


    speakBestRoute(
      data.routes
    );

  }

  catch (error) {

    console.error(
      "Routing error:",
      error
    );


    setStatus(
      "❌ Route তৈরি করা যায়নি। Internet connection অথবা routing service পরীক্ষা করুন।",
      "danger"
    );


    setMapState(
      "Route unavailable."
    );

  }

}


/* =========================================================
   RENDER ROUTES
   ========================================================= */

function renderRoutes(
  routes
) {

  clearRouteLayers();


  const sorted =
    [...routes].sort(
      (
        a,
        b
      ) =>
        a.duration -
        b.duration
    );


  const best =
    sorted[0];

  const alternative =
    sorted[1] ||
    null;


  /* ======================
     BEST ROUTE
     ====================== */

  drawRoute(
    best,
    true
  );


  updateBestRouteInfo(
    best
  );


  /* ======================
     ALTERNATIVE
     ====================== */

  if (
    alternative
  ) {

    drawRoute(
      alternative,
      false
    );


    updateAlternativeInfo(
      alternative
    );

  }

  else {

    altTime.textContent =
      "পাওয়া যায়নি";

    altDistance.textContent =
      "—";

  }


  /*
    IMPORTANT:
    OSRM public routing does NOT automatically
    provide current live traffic congestion.

    Therefore this UI does not falsely label
    a route as "traffic" simply because it is
    longer.
  */

  trafficState.textContent =
    "Live traffic API প্রয়োজন";


  trafficState.style.color =
    "var(--yellow)";


  fitRoutesToMap();

}


/* =========================================================
   DRAW ROUTE
   ========================================================= */

function drawRoute(
  route,
  isBest
) {

  const coordinates =
    route.geometry.coordinates
      .map(
        point =>
          [
            point[1],
            point[0]
          ]
      );


  const line =
    L.polyline(
      coordinates,
      {

        color:
          isBest
            ? "#19d36b"
            : "#ffd54a",

        weight:
          isBest
            ? 8
            : 6,

        opacity:
          isBest
            ? .92
            : .65,

        lineCap:
          "round",

        lineJoin:
          "round"

      }
    ).addTo(map);


  line.bindPopup(
    isBest
      ? "<strong>🟢 Best Route</strong>"
      : "<strong>🟡 Alternative Route</strong>"
  );


  routeLayers.push(
    line
  );

}


/* =========================================================
   ROUTE INFO
   ========================================================= */

function updateBestRouteInfo(
  route
) {

  bestTime.textContent =
    formatDuration(
      route.duration
    );


  bestDistance.textContent =
    formatDistance(
      route.distance
    );

}


function updateAlternativeInfo(
  route
) {

  altTime.textContent =
    formatDuration(
      route.duration
    );


  altDistance.textContent =
    formatDistance(
      route.distance
    );

}


/* =========================================================
   FIT MAP
   ========================================================= */

function fitRoutesToMap() {

  if (
    !routeLayers.length
  ) {

    return;

  }


  const group =
    L.featureGroup(
      routeLayers
    );


  map.fitBounds(
    group.getBounds(),
    {

      padding: [
        40,
        40
      ]

    }
  );

}


/* =========================================================
   CLEAR ROUTES
   ========================================================= */

function clearRouteLayers() {

  routeLayers.forEach(
    layer => {

      try {

        map.removeLayer(
          layer
        );

      }

      catch (error) {

        console.warn(
          error
        );

      }

    }
  );


  routeLayers = [];

}


/* =========================================================
   CLEAR ALL
   ========================================================= */

function clearAll() {

  clearRouteLayers();


  if (
    destinationMarker
  ) {

    map.removeLayer(
      destinationMarker
    );

    destinationMarker =
      null;

  }


  destinationPosition =
    null;


  destinationInput.value =
    "";


  bestTime.textContent =
    "—";

  bestDistance.textContent =
    "—";

  altTime.textContent =
    "—";

  altDistance.textContent =
    "—";


  trafficState.textContent =
    "তথ্য অপেক্ষমাণ";


  trafficState.style.color =
    "";


  setStatus(
    "🧹 Route ও destination পরিষ্কার করা হয়েছে।"
  );


  if (
    currentPosition
  ) {

    map.setView(
      [
        currentPosition.lat,
        currentPosition.lng
      ],
      CONFIG.GPS_ZOOM
    );

  }

}


/* =========================================================
   AVOID TRAFFIC
   ========================================================= */

function avoidTraffic() {

  if (
    !currentPosition ||
    !destinationPosition
  ) {

    setStatus(
      "📍 GPS এবং destination দুটোই প্রয়োজন।",
      "warning"
    );

    return;

  }


  /*
    This button demonstrates the traffic-aware
    decision layer.

    A real production version should receive
    current traffic speeds / incidents from
    a traffic provider and then re-rank routes.
  */


  setStatus(
    "🚦 Traffic-aware route analysis চালু হয়েছে। তবে বর্তমান build-এ live traffic feed সংযুক্ত না থাকায় GPS/map route-কে live congestion হিসেবে দেখানো হচ্ছে না।",
    "warning"
  );


  trafficState.textContent =
    "Live traffic feed not connected";


  trafficState.style.color =
    "var(--yellow)";


  speak(
    "যানজট এড়ানোর ব্যবস্থা প্রস্তুত। লাইভ ট্রাফিক ডেটা সংযুক্ত করলে আরও নির্ভুল বিকল্প পথ দেওয়া যাবে।"
  );

}


/* =========================================================
   VOICE
   ========================================================= */

function speak(
  text
) {

  if (
    !voiceEnabled
  ) {

    return;

  }


  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  window.speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  utterance.lang =
    CONFIG.SPEECH_LANGUAGE;


  utterance.rate =
    0.95;


  utterance.pitch =
    1;


  window.speechSynthesis.speak(
    utterance
  );

}


/* =========================================================
   BEST ROUTE VOICE
   ========================================================= */

function speakBestRoute(
  routes
) {

  if (
    !routes ||
    !routes.length
  ) {

    return;

  }


  const sorted =
    [...routes].sort(
      (
        a,
        b
      ) =>
        a.duration -
        b.duration
    );


  const best =
    sorted[0];


  const minutes =
    Math.max(
      1,
      Math.round(
        best.duration / 60
      )
    );


  const km =
    (
      best.distance /
      1000
    ).toFixed(1);


  speak(
    `সেরা পাওয়া route-এর আনুমানিক সময় ${minutes} মিনিট এবং দূরত্ব ${km} কিলোমিটার।`
  );

}


/* =========================================================
   FORMAT DURATION
   ========================================================= */

function formatDuration(
  seconds
) {

  const totalMinutes =
    Math.round(
      seconds / 60
    );


  if (
    totalMinutes < 60
  ) {

    return (
      totalMinutes +
      " মিনিট"
    );

  }


  const hours =
    Math.floor(
      totalMinutes / 60
    );


  const minutes =
    totalMinutes % 60;


  if (
    minutes === 0
  ) {

    return (
      hours +
      " ঘণ্টা"
    );

  }


  return (
    hours +
    " ঘণ্টা " +
    minutes +
    " মিনিট"
  );

}


/* =========================================================
   FORMAT DISTANCE
   ========================================================= */

function formatDistance(
  meters
) {

  if (
    meters < 1000
  ) {

    return (
      Math.round(meters) +
      " m"
    );

  }


  return (
    (
      meters / 1000
    ).toFixed(1) +
    " km"
  );

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(
  message,
  type = ""
) {

  statusBox.innerHTML =
    `<strong>STATUS:</strong> ${escapeHTML(message)}`;


  statusBox.className =
    "status";


  if (
    type === "danger"
  ) {

    statusBox.classList.add(
      "status-danger"
    );

  }


  if (
    type === "warning"
  ) {

    statusBox.classList.add(
      "status-warning"
    );

  }


  if (
    type === "good"
  ) {

    statusBox.classList.add(
      "status-good"
    );

  }

}


/* =========================================================
   MAP STATE
   ========================================================= */

function setMapState(
  message
) {

  mapState.textContent =
    message;

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   EVENTS
   ========================================================= */

locateBtn.addEventListener(
  "click",
  getCurrentLocation
);


searchDestinationBtn.addEventListener(
  "click",
  searchDestination
);


routeBtn.addEventListener(
  "click",
  calculateRoutes
);


avoidTrafficBtn.addEventListener(
  "click",
  avoidTraffic
);


clearBtn.addEventListener(
  "click",
  clearAll
);


voiceBtn.addEventListener(
  "click",
  () => {

    voiceEnabled =
      !voiceEnabled;


    if (
      voiceEnabled
    ) {

      voiceBtn.textContent =
        "🔊 Voice ON";

      speak(
        "ভয়েস নেভিগেশন চালু হয়েছে।"
      );

    }

    else {

      voiceBtn.textContent =
        "🔇 Voice OFF";

      window.speechSynthesis?.cancel();

    }

  }
);


/* =========================================================
   ENTER KEY
   ========================================================= */

destinationInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      searchDestination();

    }

  }
);


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initMap();

    console.log(
      `${CONFIG.APP_NAME} initialized.`
    );

  }
);


/* =========================================================
   PREVENT PAGE CRASH FROM SPEECH API
   ========================================================= */

window.addEventListener(
  "error",
  event => {

    console.error(
      "AYNA Smart Traffic error:",
      event.error ||
      event.message
    );

  }
);