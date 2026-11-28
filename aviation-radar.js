/* =========================================================
   AYNA BOOK — CIVIL AVIATION RADAR
   File: aviation-radar.js

   Features:
   1. Leaflet aviation map
   2. OpenSky Network aircraft data
   3. GPS current location
   4. Bangladesh center
   5. Aircraft refresh
   6. Aircraft markers
   7. Aircraft information popup
   8. Callsign / ICAO24 search
   9. Full-screen map
   10. Aircraft list
   11. AI Aviation Analysis
   12. Automatic refresh
   13. No Firebase / RTDB required

   IMPORTANT:
   Aircraft tracking depends on external ADS-B / Mode-S
   data coverage and API availability.
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const AYNA_AVIATION_CONFIG = {

  // Bangladesh center
  BANGLADESH: {
    lat: 23.6850,
    lon: 90.3563,
    zoom: 6
  },

  // Default map
  DEFAULT: {
    lat: 23.6850,
    lon: 90.3563,
    zoom: 5
  },

  /*
    OpenSky public API.

    Bounding box:
    lamin = minimum latitude
    lamax = maximum latitude
    lomin = minimum longitude
    lomax = maximum longitude

    We start with a large South Asia / nearby region.
  */

  API_BASE:
    "https://opensky-network.org/api/states/all",

  REGION: {
    lamin: 5,
    lamax: 38,
    lomin: 55,
    lomax: 105
  },

  /*
    Public API requests should not be made too frequently.
  */

  REFRESH_MS:
    60 * 1000,

  /*
    Maximum aircraft rendered on the map/list.
  */

  MAX_AIRCRAFT:
    250,

  /*
    Marker size.
  */

  MARKER_SIZE:
    34

};


/* =========================================================
   GLOBAL STATE
========================================================= */

let aviationMap = null;

let aircraftMarkers = new Map();

let aircraftData = [];

let filteredAircraft = [];

let userMarker = null;

let userAccuracyCircle = null;

let userLatitude = null;

let userLongitude = null;

let aviationRefreshTimer = null;

let isLoadingAircraft = false;

let lastAircraftUpdate = null;


/* =========================================================
   DOM HELPER
========================================================= */

function getElement(id) {

  return document.getElementById(id);

}


function setText(id, value) {

  const element = getElement(id);

  if (!element) return;

  element.textContent = value;

}


/* =========================================================
   STATUS
========================================================= */

function setAviationStatus(
  message,
  type = "warning"
) {

  const status =
    getElement("aviationStatus");

  if (!status) return;

  status.textContent =
    message;

  status.classList.remove(
    "success",
    "warning",
    "error"
  );

  status.classList.add(
    type
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeAviationRadar();

  }
);


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

async function initializeAviationRadar() {

  try {

    setupButtons();

    initializeAviationMap();

    setAviationStatus(
      "🛰️ Aircraft data loading হচ্ছে...",
      "warning"
    );

    await loadAircraftData();

    startAutomaticRefresh();

  } catch (error) {

    console.error(
      "AYNA Aviation Radar error:",
      error
    );

    setAviationStatus(
      "⚠️ Aviation Radar interface চালু হয়েছে, কিন্তু aircraft data এখন পাওয়া যাচ্ছে না।",
      "error"
    );

  }

}


/* =========================================================
   INITIALIZE MAP
========================================================= */

function initializeAviationMap() {

  const mapElement =
    getElement("aviationMap");

  if (!mapElement) {

    console.error(
      "aviationMap element not found."
    );

    return;

  }


  aviationMap =
    L.map(
      "aviationMap",
      {

        center: [
          AYNA_AVIATION_CONFIG.DEFAULT.lat,
          AYNA_AVIATION_CONFIG.DEFAULT.lon
        ],

        zoom:
          AYNA_AVIATION_CONFIG.DEFAULT.zoom,

        minZoom: 2,

        maxZoom: 18,

        zoomControl: true,

        attributionControl: true

      }
    );


  /*
    OpenStreetMap base map.
  */

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {

      maxZoom: 19,

      attribution:
        '&copy; OpenStreetMap contributors'

    }
  ).addTo(
    aviationMap
  );


  /*
    Aviation data attribution.
  */

  aviationMap.attributionControl.addAttribution(
    'Aircraft data: <a href="https://opensky-network.org/" target="_blank" rel="noopener noreferrer">OpenSky Network</a>'
  );

}


/* =========================================================
   LOAD AIRCRAFT DATA
========================================================= */

async function loadAircraftData() {

  if (isLoadingAircraft) {

    return;

  }

  if (!navigator.onLine) {

    setAviationStatus(
      "📡 Internet connection নেই। Aircraft data load করা যাচ্ছে না।",
      "error"
    );

    return;

  }


  isLoadingAircraft = true;


  setAviationStatus(
    "✈️ সর্বশেষ aircraft অবস্থান সংগ্রহ করা হচ্ছে...",
    "warning"
  );


  setText(
    "liveBadge",
    "LOADING..."
  );


  try {

    const url =
      buildOpenSkyURL();


    const response =
      await fetch(
        url,
        {
          method: "GET",

          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "OpenSky HTTP " +
        response.status
      );

    }


    const data =
      await response.json();


    if (
      !data ||
      !Array.isArray(data.states)
    ) {

      throw new Error(
        "Invalid aircraft response."
      );

    }


    aircraftData =
      parseOpenSkyStates(
        data.states
      );


    lastAircraftUpdate =
      data.time ||
      Math.floor(
        Date.now() / 1000
      );


    renderAircraft(
      aircraftData
    );


    updateAircraftSummary(
      aircraftData
    );


    updateAircraftList(
      aircraftData
    );


    setText(
      "liveBadge",
      "AIRCRAFT LIVE"
    );


    setAviationStatus(
      "✅ Aircraft data সফলভাবে আপডেট হয়েছে।",
      "success"
    );


    setTimeout(
      () => {

        setText(
          "liveBadge",
          "RADAR READY"
        );

      },
      5000
    );


  } catch (error) {

    console.error(
      "Aircraft API error:",
      error
    );


    handleAircraftAPIError(
      error
    );


  } finally {

    isLoadingAircraft = false;

  }

}


/* =========================================================
   BUILD OPENSKY URL
========================================================= */

function buildOpenSkyURL() {

  const region =
    AYNA_AVIATION_CONFIG.REGION;


  const params =
    new URLSearchParams({

      lamin:
        String(region.lamin),

      lamax:
        String(region.lamax),

      lomin:
        String(region.lomin),

      lomax:
        String(region.lomax)

    });


  return (
    AYNA_AVIATION_CONFIG.API_BASE +
    "?" +
    params.toString()
  );

}


/* =========================================================
   PARSE OPENSKY STATES
========================================================= */

function parseOpenSkyStates(
  states
) {

  const result = [];


  for (
    let i = 0;
    i < states.length;
    i++
  ) {

    const state =
      states[i];


    /*
      OpenSky state vector indexes:

      0  icao24
      1  callsign
      2  origin_country
      3  time_position
      4  last_contact
      5  longitude
      6  latitude
      7  baro_altitude
      8  on_ground
      9  velocity
      10 true_track
      11 vertical_rate
      12 sensors
      13 geo_altitude
      14 squawk
      15 spi
      16 position_source
      17 category
    */


    if (!state) continue;


    const icao24 =
      state[0] || "";


    const callsign =
      (
        state[1] ||
        ""
      ).trim();


    const originCountry =
      state[2] ||
      "Unknown";


    const longitude =
      toNumber(
        state[5]
      );


    const latitude =
      toNumber(
        state[6]
      );


    /*
      Aircraft without valid position
      cannot be shown on the map.
    */

    if (
      latitude === null ||
      longitude === null
    ) {

      continue;

    }


    const altitude =
      toNumber(
        state[7]
      );


    const geoAltitude =
      toNumber(
        state[13]
      );


    const velocity =
      toNumber(
        state[9]
      );


    const heading =
      toNumber(
        state[10]
      );


    const verticalRate =
      toNumber(
        state[11]
      );


    const onGround =
      Boolean(
        state[8]
      );


    const squawk =
      state[14] ||
      "—";


    result.push({

      icao24,

      callsign:
        callsign ||
        "UNKNOWN",

      originCountry,

      latitude,

      longitude,

      altitude,

      geoAltitude,

      velocity,

      heading,

      verticalRate,

      onGround,

      squawk,

      category:
        state[17] ?? null

    });


    if (
      result.length >=
      AYNA_AVIATION_CONFIG.MAX_AIRCRAFT
    ) {

      break;

    }

  }


  return result;

}


/* =========================================================
   NUMBER HELPER
========================================================= */

function toNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return null;

  }


  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return null;

  }


  return number;

}


/* =========================================================
   RENDER AIRCRAFT
========================================================= */

function renderAircraft(
  aircraft
) {

  if (!aviationMap) return;


  const currentIds =
    new Set();


  aircraft.forEach(
    aircraftItem => {

      const id =
        aircraftItem.icao24 ||
        (
          aircraftItem.callsign +
          "_" +
          aircraftItem.latitude +
          "_" +
          aircraftItem.longitude
        );


      currentIds.add(
        id
      );


      if (
        aircraftMarkers.has(id)
      ) {

        updateAircraftMarker(
          id,
          aircraftItem
        );

      } else {

        createAircraftMarker(
          id,
          aircraftItem
        );

      }

    }
  );


  /*
    Remove aircraft that are no longer
    in current API response.
  */

  for (
    const [
      id,
      marker
    ] of aircraftMarkers
  ) {

    if (
      !currentIds.has(id)
    ) {

      aviationMap.removeLayer(
        marker
      );

      aircraftMarkers.delete(
        id
      );

    }

  }

}


/* =========================================================
   CREATE AIRCRAFT MARKER
========================================================= */

function createAircraftMarker(
  id,
  aircraft
) {

  if (!aviationMap) return;


  const icon =
    createAircraftIcon(
      aircraft.heading
    );


  const marker =
    L.marker(
      [
        aircraft.latitude,
        aircraft.longitude
      ],
      {
        icon,

        title:
          aircraft.callsign ||
          aircraft.icao24
      }
    );


  marker.bindPopup(
    createAircraftPopup(
      aircraft
    )
  );


  marker.addTo(
    aviationMap
  );


  aircraftMarkers.set(
    id,
    marker
  );

}


/* =========================================================
   UPDATE AIRCRAFT MARKER
========================================================= */

function updateAircraftMarker(
  id,
  aircraft
) {

  const marker =
    aircraftMarkers.get(
      id
    );


  if (!marker) {

    createAircraftMarker(
      id,
      aircraft
    );

    return;

  }


  marker.setLatLng(
    [
      aircraft.latitude,
      aircraft.longitude
    ]
  );


  marker.setIcon(
    createAircraftIcon(
      aircraft.heading
    )
  );


  marker.setPopupContent(
    createAircraftPopup(
      aircraft
    )
  );

}


/* =========================================================
   AIRCRAFT ICON
========================================================= */

function createAircraftIcon(
  heading
) {

  const safeHeading =
    Number.isFinite(heading)
      ? heading
      : 0;


  return L.divIcon({

    className:
      "ayna-aircraft-marker",

    html:
      `
        <div
          style="
            width:34px;
            height:34px;

            display:flex;
            align-items:center;
            justify-content:center;

            transform:
              rotate(${safeHeading}deg);

            font-size:28px;

            filter:
              drop-shadow(
                0 2px 4px
                rgba(0,0,0,.8)
              );

            user-select:none;
          "
        >
          ✈️
        </div>
      `,

    iconSize:
      [
        AYNA_AVIATION_CONFIG.MARKER_SIZE,
        AYNA_AVIATION_CONFIG.MARKER_SIZE
      ],

    iconAnchor:
      [
        17,
        17
      ],

    popupAnchor:
      [
        0,
        -18
      ]

  });

}


/* =========================================================
   AIRCRAFT POPUP
========================================================= */

function createAircraftPopup(
  aircraft
) {

  const altitude =
    formatAltitude(
      aircraft.altitude
    );


  const speed =
    formatSpeed(
      aircraft.velocity
    );


  const heading =
    Number.isFinite(
      aircraft.heading
    )
      ? Math.round(
          aircraft.heading
        ) + "°"
      : "—";


  const vertical =
    formatVerticalRate(
      aircraft.verticalRate
    );


  return `

    <div
      style="
        min-width:250px;
        font-family:Arial,sans-serif;
        font-size:16px;
        line-height:1.55;
      "
    >

      <div
        style="
          font-size:22px;
          font-weight:900;
          margin-bottom:8px;
        "
      >
        ✈️ ${
          escapeHTML(
            aircraft.callsign
          )
        }
      </div>

      <strong>ICAO24:</strong>
      ${escapeHTML(aircraft.icao24 || "—")}
      <br>

      <strong>Country:</strong>
      ${escapeHTML(aircraft.originCountry)}
      <br>

      <strong>Altitude:</strong>
      ${altitude}
      <br>

      <strong>Speed:</strong>
      ${speed}
      <br>

      <strong>Heading:</strong>
      ${heading}
      <br>

      <strong>Vertical rate:</strong>
      ${vertical}
      <br>

      <strong>Status:</strong>
      ${
        aircraft.onGround
          ? "🛬 On Ground"
          : "🛫 Airborne"
      }

    </div>

  `;

}


/* =========================================================
   FORMAT ALTITUDE
========================================================= */

function formatAltitude(
  meters
) {

  if (
    meters === null ||
    meters === undefined
  ) {

    return "—";

  }


  const feet =
    meters *
    3.28084;


  return (
    Math.round(
      feet
    ).toLocaleString() +
    " ft"
  );

}


/* =========================================================
   FORMAT SPEED
========================================================= */

function formatSpeed(
  metersPerSecond
) {

  if (
    metersPerSecond === null ||
    metersPerSecond === undefined
  ) {

    return "—";

  }


  const knots =
    metersPerSecond *
    1.94384;


  const kmh =
    metersPerSecond *
    3.6;


  return (
    Math.round(knots) +
    " kt / " +
    Math.round(kmh) +
    " km/h"
  );

}


/* =========================================================
   FORMAT VERTICAL RATE
========================================================= */

function formatVerticalRate(
  metersPerSecond
) {

  if (
    metersPerSecond === null ||
    metersPerSecond === undefined
  ) {

    return "—";

  }


  const feetPerMinute =
    metersPerSecond *
    196.8504;


  if (
    feetPerMinute > 50
  ) {

    return (
      "⬆️ +" +
      Math.round(
        feetPerMinute
      ) +
      " ft/min"
    );

  }


  if (
    feetPerMinute < -50
  ) {

    return (
      "⬇️ " +
      Math.round(
        feetPerMinute
      ) +
      " ft/min"
    );

  }


  return "➡️ Level";

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateAircraftSummary(
  aircraft
) {

  setText(
    "aircraftCount",
    aircraft.length.toString()
  );


  setText(
    "aircraftCountText",
    aircraft.length +
    "টি aircraft বর্তমানে map/list-এ পাওয়া গেছে।"
  );


  if (lastAircraftUpdate) {

    const date =
      new Date(
        lastAircraftUpdate * 1000
      );


    setText(
      "lastUpdate",
      date.toLocaleTimeString(
        undefined,
        {
          hour: "2-digit",

          minute: "2-digit",

          second: "2-digit"
        }
      )
    );

  }

}


/* =========================================================
   AIRCRAFT LIST
========================================================= */

function updateAircraftList(
  aircraft
) {

  const list =
    getElement("aircraftList");

  if (!list) return;


  if (
    aircraft.length === 0
  ) {

    list.innerHTML = `

      <div class="aircraft-empty">

        ✈️ এই অঞ্চলে বর্তমানে
        position সহ aircraft data পাওয়া যায়নি।

      </div>

    `;

    return;

  }


  list.innerHTML =
    aircraft
      .slice(
        0,
        60
      )
      .map(
        aircraftItem =>
          createAircraftCard(
            aircraftItem
          )
      )
      .join("");

}


/* =========================================================
   AIRCRAFT CARD
========================================================= */

function createAircraftCard(
  aircraft
) {

  const altitude =
    formatAltitude(
      aircraft.altitude
    );


  const speed =
    formatSpeed(
      aircraft.velocity
    );


  const heading =
    Number.isFinite(
      aircraft.heading
    )
      ? Math.round(
          aircraft.heading
        ) + "°"
      : "—";


  return `

    <article
      class="aircraft-card"
      data-icao24="${
        escapeHTML(
          aircraft.icao24
        )
      }"
    >

      <h3>
        ✈️ ${
          escapeHTML(
            aircraft.callsign ||
            "UNKNOWN"
          )
        }
      </h3>

      <p>
        <strong>ICAO24:</strong>
        ${
          escapeHTML(
            aircraft.icao24 ||
            "—"
          )
        }
      </p>

      <p>
        <strong>Country:</strong>
        ${
          escapeHTML(
            aircraft.originCountry
          )
        }
      </p>

      <p>
        <strong>Altitude:</strong>
        ${altitude}
      </p>

      <p>
        <strong>Speed:</strong>
        ${speed}
      </p>

      <p>
        <strong>Heading:</strong>
        ${heading}
      </p>

      <p>
        <strong>Status:</strong>
        ${
          aircraft.onGround
            ? "🛬 Ground"
            : "🛫 Airborne"
        }
      </p>

    </article>

  `;

}


/* =========================================================
   AIRCRAFT SEARCH
========================================================= */

function searchAircraft() {

  const input =
    getElement("aircraftSearch");

  if (!input) return;


  const query =
    input.value
      .trim()
      .toLowerCase();


  if (!query) {

    filteredAircraft =
      aircraftData;

    updateAircraftList(
      aircraftData
    );

    setAviationStatus(
      "🔎 Search field খালি। সব aircraft দেখানো হচ্ছে।",
      "success"
    );

    return;

  }


  filteredAircraft =
    aircraftData.filter(
      aircraft => {

        const callsign =
          String(
            aircraft.callsign ||
            ""
          ).toLowerCase();


        const icao =
          String(
            aircraft.icao24 ||
            ""
          ).toLowerCase();


        const country =
          String(
            aircraft.originCountry ||
            ""
          ).toLowerCase();


        return (
          callsign.includes(query) ||
          icao.includes(query) ||
          country.includes(query)
        );

      }
    );


  updateAircraftList(
    filteredAircraft
  );


  if (
    filteredAircraft.length === 0
  ) {

    setAviationStatus(
      "❌ এই search-এর সঙ্গে মিলে কোনো aircraft পাওয়া যায়নি।",
      "warning"
    );

    return;

  }


  setAviationStatus(
    "✅ " +
    filteredAircraft.length +
    "টি matching aircraft পাওয়া গেছে।",
    "success"
  );


  /*
    Center map on first result.
  */

  const first =
    filteredAircraft[0];


  if (first && aviationMap) {

    aviationMap.setView(
      [
        first.latitude,
        first.longitude
      ],
      8,
      {
        animate: true
      }
    );


    const markerId =
      first.icao24 ||
      (
        first.callsign +
        "_" +
        first.latitude +
        "_" +
        first.longitude
      );


    const marker =
      aircraftMarkers.get(
        markerId
      );


    if (marker) {

      marker.openPopup();

    }

  }

}


/* =========================================================
   GPS LOCATION
========================================================= */

function locateUser() {

  if (!navigator.geolocation) {

    setAviationStatus(
      "❌ এই device/browser Geolocation support করে না।",
      "error"
    );

    return;

  }


  setAviationStatus(
    "📍 GPS location খোঁজা হচ্ছে...",
    "warning"
  );


  navigator.geolocation.getCurrentPosition(

    position => {

      userLatitude =
        position.coords.latitude;

      userLongitude =
        position.coords.longitude;


      const accuracy =
        position.coords.accuracy;


      updateGPSInformation(
        userLatitude,
        userLongitude,
        accuracy
      );


      showUserLocation(
        userLatitude,
        userLongitude,
        accuracy
      );


      if (aviationMap) {

        aviationMap.setView(
          [
            userLatitude,
            userLongitude
          ],
          7,
          {
            animate: true
          }
        );

      }


      setAviationStatus(
        "✅ আপনার GPS location পাওয়া গেছে।",
        "success"
      );


      updateAIWithLocation();

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

  if (!aviationMap) return;


  if (userMarker) {

    aviationMap.removeLayer(
      userMarker
    );

  }


  if (userAccuracyCircle) {

    aviationMap.removeLayer(
      userAccuracyCircle
    );

  }


  userMarker =
    L.marker(
      [
        latitude,
        longitude
      ],
      {
        title:
          "Your GPS location"
      }
    ).addTo(
      aviationMap
    );


  userMarker.bindPopup(
    `
      <strong>📍 AYNA BOOK GPS</strong>
      <br>
      Latitude:
      ${latitude.toFixed(6)}
      <br>
      Longitude:
      ${longitude.toFixed(6)}
      <br>
      Accuracy:
      ${Math.round(accuracy)} m
    `
  );


  userAccuracyCircle =
    L.circle(
      [
        latitude,
        longitude
      ],
      {

        radius:
          accuracy,

        color:
          "#00e5ff",

        fillColor:
          "#00e5ff",

        fillOpacity:
          0.08,

        weight:
          2

      }
    ).addTo(
      aviationMap
    );


  userMarker.openPopup();

}


/* =========================================================
   GPS INFORMATION
========================================================= */

function updateGPSInformation(
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


  /*
    Keep aircraft update time in
    lastUpdate, so GPS does not
    erase useful aircraft timestamp.
  */

}


/* =========================================================
   GPS ERROR
========================================================= */

function handleLocationError(
  error
) {

  let message =
    "❌ GPS location পাওয়া যায়নি।";


  if (error) {

    if (
      error.code ===
      error.PERMISSION_DENIED
    ) {

      message =
        "❌ Location permission দেওয়া হয়নি। Browser settings থেকে Location Allow করুন.";

    }

    else if (
      error.code ===
      error.POSITION_UNAVAILABLE
    ) {

      message =
        "⚠️ GPS location বর্তমানে unavailable।";

    }

    else if (
      error.code ===
      error.TIMEOUT
    ) {

      message =
        "⏱️ GPS location পেতে সময় শেষ হয়েছে। আবার চেষ্টা করুন.";

    }

  }


  setAviationStatus(
    message,
    "error"
  );

}


/* =========================================================
   BANGLADESH CENTER
========================================================= */

function centerBangladesh() {

  if (!aviationMap) return;


  aviationMap.setView(
    [
      AYNA_AVIATION_CONFIG.BANGLADESH.lat,

      AYNA_AVIATION_CONFIG.BANGLADESH.lon
    ],

    AYNA_AVIATION_CONFIG.BANGLADESH.zoom,

    {
      animate: true
    }
  );


  setAviationStatus(
    "🇧🇩 Bangladesh aviation region দেখানো হচ্ছে।",
    "success"
  );

}


/* =========================================================
   FULL SCREEN
========================================================= */

function fullscreenMap() {

  const mapElement =
    getElement("aviationMap");

  if (!mapElement) return;


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

        if (aviationMap) {

          aviationMap.invalidateSize();

        }

      },
      300
    );

  }
);


/* =========================================================
   REFRESH
========================================================= */

async function refreshAircraft() {

  if (isLoadingAircraft) {

    setAviationStatus(
      "⏳ Aircraft data ইতোমধ্যে loading হচ্ছে...",
      "warning"
    );

    return;

  }


  await loadAircraftData();


  if (aviationMap) {

    setTimeout(
      () => {

        aviationMap.invalidateSize();

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


  aviationRefreshTimer =
    setInterval(
      () => {

        loadAircraftData();

      },
      AYNA_AVIATION_CONFIG.REFRESH_MS
    );

}


/* =========================================================
   STOP REFRESH
========================================================= */

function stopAutomaticRefresh() {

  if (
    aviationRefreshTimer
  ) {

    clearInterval(
      aviationRefreshTimer
    );

    aviationRefreshTimer =
      null;

  }

}


/* =========================================================
   AI AVIATION ANALYSIS
========================================================= */

function runAIAviationAnalysis() {

  const aiAnswer =
    getElement("aiAnswer");

  const aiStatus =
    getElement("aiStatus");


  if (!aiAnswer) return;


  if (aiStatus) {

    aiStatus.textContent =
      "🤖 AYNA AI aircraft data বিশ্লেষণ করছে...";

  }


  const total =
    aircraftData.length;


  const airborne =
    aircraftData.filter(
      aircraft =>
        !aircraft.onGround
    ).length;


  const onGround =
    aircraftData.filter(
      aircraft =>
        aircraft.onGround
    ).length;


  const withAltitude =
    aircraftData.filter(
      aircraft =>
        aircraft.altitude !== null
    );


  let averageAltitude =
    null;


  if (
    withAltitude.length > 0
  ) {

    averageAltitude =
      withAltitude.reduce(
        (
          totalAltitude,
          aircraft
        ) =>
          totalAltitude +
          aircraft.altitude,
        0
      ) /
      withAltitude.length;

  }


  const countries =
    new Set(
      aircraftData.map(
        aircraft =>
          aircraft.originCountry
      )
    );


  const countryCount =
    countries.size;


  const locationText =
    userLatitude !== null &&
    userLongitude !== null

      ? `GPS location:
Latitude ${userLatitude.toFixed(5)}
Longitude ${userLongitude.toFixed(5)}`

      : "GPS location এখনো পাওয়া যায়নি।";


  const altitudeText =
    averageAltitude !== null

      ? formatAltitude(
          averageAltitude
        )

      : "পর্যাপ্ত altitude data নেই।";


  const answer =

`🤖 AYNA AI Aviation Analysis

✈️ বর্তমান aircraft count:
${total}

🛫 Airborne:
${airborne}

🛬 On Ground:
${onGround}

🌍 Detected origin countries:
${countryCount}

📏 Average reported altitude:
${altitudeText}

${locationText}

📡 Data interpretation:
এই পেজে পাওয়া aircraft state vectors-এর ভিত্তিতে সাধারণ aviation information দেখানো হচ্ছে।

⚠️ গুরুত্বপূর্ণ:
Aircraft tracking data সম্পূর্ণ global coverage নিশ্চিত করে না। ADS-B/Mode-S receiver coverage, provider availability এবং network conditions অনুযায়ী aircraft দেখা বা না-দেখা যেতে পারে।

🚫 এই তথ্য Air Traffic Control, navigation বা collision-avoidance-এর বিকল্প নয়।

💡 ভবিষ্যতে AYNA BOOK-এর নিরাপদ AI backend যুক্ত করলে aircraft data থেকে আরও উন্নত search, summary, translation এবং aviation explanation তৈরি করা যাবে।`;


  setTimeout(
    () => {

      aiAnswer.textContent =
        answer;


      if (aiStatus) {

        aiStatus.textContent =
          "✅ AI Aviation Analysis সম্পন্ন।";

      }

    },
    500
  );

}


/* =========================================================
   AI GPS UPDATE
========================================================= */

function updateAIWithLocation() {

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

`📍 GPS location পাওয়া গেছে।

Latitude:
${userLatitude.toFixed(6)}

Longitude:
${userLongitude.toFixed(6)}

✈️ Aviation Radar এখন আপনার অবস্থানের সঙ্গে
aircraft map ব্যবহার করতে পারবে।

🤖 বিস্তারিত aviation analysis-এর জন্য
AI Analysis button চাপুন।`;

}


/* =========================================================
   API ERROR HANDLER
========================================================= */

function handleAircraftAPIError(
  error
) {

  const message =
    String(
      error?.message ||
      ""
    );


  if (
    message.includes("429")
  ) {

    setAviationStatus(
      "⏳ Aircraft API rate limit হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
      "warning"
    );

  }

  else if (
    message.includes("403")
  ) {

    setAviationStatus(
      "🔐 Aircraft API request blocked হয়েছে। Public API availability পরীক্ষা করুন।",
      "error"
    );

  }

  else if (
    message.includes("Failed to fetch")
  ) {

    setAviationStatus(
      "📡 Aircraft server-এ সংযোগ করা যাচ্ছে না। Internet/API availability পরীক্ষা করুন।",
      "error"
    );

  }

  else {

    setAviationStatus(
      "⚠️ বর্তমানে aircraft data পাওয়া যাচ্ছে না। Map interface চালু আছে।",
      "error"
    );

  }


  setText(
    "liveBadge",
    "DATA OFFLINE"
  );


  setText(
    "aircraftCountText",
    "Aircraft data বর্তমানে unavailable। পরে Refresh করুন।"
  );


  /*
    IMPORTANT:
    Do not clear existing markers immediately.
    Existing data can remain visible until
    a successful update.
  */

}


/* =========================================================
   HOME
========================================================= */

function goHome() {

  window.location.href =
    "./index.html";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
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
   BUTTON SETUP
========================================================= */

function setupButtons() {

  const homeBtn =
    getElement("homeBtn");

  const fullScreenBtn =
    getElement("fullScreenBtn");

  const locateBtn =
    getElement("locateBtn");

  const refreshBtn =
    getElement("refreshBtn");

  const bangladeshBtn =
    getElement("bangladeshBtn");

  const fullScreenMapBtn =
    getElement("fullScreenMapBtn");

  const aiAnalyzeBtn =
    getElement("aiAnalyzeBtn");

  const searchBtn =
    getElement("searchBtn");

  const searchInput =
    getElement("aircraftSearch");


  if (homeBtn) {

    homeBtn.addEventListener(
      "click",
      goHome
    );

  }


  if (fullScreenBtn) {

    fullScreenBtn.addEventListener(
      "click",
      fullscreenMap
    );

  }


  if (locateBtn) {

    locateBtn.addEventListener(
      "click",
      locateUser
    );

  }


  if (refreshBtn) {

    refreshBtn.addEventListener(
      "click",
      refreshAircraft
    );

  }


  if (bangladeshBtn) {

    bangladeshBtn.addEventListener(
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


  if (aiAnalyzeBtn) {

    aiAnalyzeBtn.addEventListener(
      "click",
      runAIAviationAnalysis
    );

  }


  if (searchBtn) {

    searchBtn.addEventListener(
      "click",
      searchAircraft
    );

  }


  if (searchInput) {

    searchInput.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          searchAircraft();

        }

      }
    );

  }

}


/* =========================================================
   NETWORK STATUS
========================================================= */

window.addEventListener(
  "online",
  () => {

    setAviationStatus(
      "🌐 Internet connection ফিরে এসেছে। Aircraft Refresh করুন।",
      "success"
    );

  }
);


window.addEventListener(
  "offline",
  () => {

    setAviationStatus(
      "📡 Internet connection নেই। নতুন aircraft data পাওয়া যাবে না।",
      "error"
    );

  }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "visible"
    ) {

      if (
        lastAircraftUpdate &&
        (
          Date.now() -
          lastAircraftUpdate * 1000
        ) >
        AYNA_AVIATION_CONFIG.REFRESH_MS
      ) {

        loadAircraftData();

      }

    }

  }
);


/* =========================================================
   MAP RESIZE
========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (!aviationMap) return;


    setTimeout(
      () => {

        aviationMap.invalidateSize();

      },
      250
    );

  }
);


/* =========================================================
   PUBLIC AYNA AVIATION OBJECT
========================================================= */

window.AYNA_AVIATION_RADAR = {

  refresh:
    refreshAircraft,

  locate:
    locateUser,

  centerBangladesh:
    centerBangladesh,

  fullscreen:
    fullscreenMap,

  search:
    searchAircraft,

  analyze:
    runAIAviationAnalysis,

  getAircraft:
    () =>
      aircraftData,

  getLocation:
    () => ({

      latitude:
        userLatitude,

      longitude:
        userLongitude

    })

};


/* =========================================================
   END OF AYNA BOOK AVIATION RADAR
========================================================= */