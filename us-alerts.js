"use strict";

/*
  AYNA BOOK
  US Government Alerts
  FEMA / IPAWS Archive Viewer

  IMPORTANT:
  This uses FEMA's public IPAWS ARCHIVE.
  It is NOT a live WEA/EAS sending system.
*/

const API_URL =
  "https://gis.fema.gov/arcgis/rest/services/FEMA/IPAWS_Archive/FeatureServer/1/query";


const els = {
  backBtn: document.getElementById("backBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  loadBtn: document.getElementById("loadBtn"),
  voiceBtn: document.getElementById("voiceBtn"),

  eventFilter: document.getElementById("eventFilter"),
  stateFilter: document.getElementById("stateFilter"),
  searchInput: document.getElementById("searchInput"),

  status: document.getElementById("status"),
  alertsList: document.getElementById("alertsList")
};


let allAlerts = [];

let voiceEnabled =
  localStorage.getItem("aynaUSAlertVoice") === "1";


/* ---------------------------------------
   Utility
--------------------------------------- */

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function safeText(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return String(value).trim();
}


function formatDate(value) {

  if (!value) {
    return "সময় পাওয়া যায়নি";
  }

  let date;

  if (typeof value === "number") {
    date = new Date(value);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  ).format(date);
}


function getSeverityClass(severity) {

  const s = String(severity || "").toLowerCase();

  if (
    s.includes("extreme") ||
    s.includes("severe")
  ) {
    return "red";
  }

  if (
    s.includes("moderate") ||
    s.includes("minor")
  ) {
    return "yellow";
  }

  return "";
}


function getAlertIcon(event) {

  const e = String(event || "").toLowerCase();

  if (e.includes("tornado")) return "🌪️";
  if (e.includes("hurricane")) return "🌀";
  if (e.includes("flood")) return "🌊";
  if (e.includes("wildfire")) return "🔥";
  if (e.includes("fire")) return "🔥";
  if (e.includes("earthquake")) return "🌎";
  if (e.includes("tsunami")) return "🌊";
  if (e.includes("thunderstorm")) return "⛈️";
  if (e.includes("winter")) return "❄️";
  if (e.includes("heat")) return "🌡️";
  if (e.includes("amber")) return "🚨";
  if (e.includes("hazard")) return "☣️";
  if (e.includes("public safety")) return "🚨";

  return "⚠️";
}


/* ---------------------------------------
   API
--------------------------------------- */

async function loadAlerts() {

  setStatus("⏳ FEMA alert data loading...");

  els.alertsList.innerHTML = `
    <div class="loading">
      ⏳ Alert data loading...
    </div>
  `;

  try {

    const params = new URLSearchParams({

      where: "1=1",

      outFields:
        "objectid,identifier,sender,sent,status,msgtype,source,scope,addresses,code,note,incidents,cogid,info_language,info_category,info_event,info_urgency,info_severity,info_certainty,info_audience,info_effective,info_onset,info_expires,info_sendername,info_headline,info_web,info_contact,area_areadesc,info_description,info_area_areadesc,info_instruction,originalmessage",

      orderByFields:
        "sent DESC",

      resultRecordCount:
        "100",

      returnGeometry:
        "false",

      f:
        "json"
    });


    const response = await fetch(
      API_URL + "?" + params.toString(),
      {
        method: "GET",
        cache: "no-store"
      }
    );


    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }


    const data = await response.json();


    if (data.error) {

      throw new Error(
        data.error.message ||
        "FEMA API error"
      );
    }


    const features =
      Array.isArray(data.features)
        ? data.features
        : [];


    allAlerts = features
      .map(item => item.attributes || {})
      .filter(item => {

        return (
          item.info_headline ||
          item.info_event ||
          item.info_description
        );

      });


    setStatus(
      `✅ ${allAlerts.length}টি alert পাওয়া গেছে`
    );


    renderAlerts();


  } catch (error) {

    console.error(
      "FEMA IPAWS error:",
      error
    );


    allAlerts = [];


    els.alertsList.innerHTML = `
      <div class="error">
        ❌ Alert data পাওয়া যায়নি।<br><br>
        ${escapeHTML(error.message)}
        <br><br>
        ইন্টারনেট সংযোগ পরীক্ষা করে আবার
        Refresh চাপুন।
      </div>
    `;


    setStatus("❌ Data loading failed");

  }

}


/* ---------------------------------------
   Filtering
--------------------------------------- */

function getFilteredAlerts() {

  const event =
    els.eventFilter.value
      .trim()
      .toLowerCase();


  const state =
    els.stateFilter.value
      .trim()
      .toLowerCase();


  const search =
    els.searchInput.value
      .trim()
      .toLowerCase();


  return allAlerts.filter(alert => {

    const eventText =
      [
        alert.info_event,
        alert.info_category,
        alert.code,
        alert.info_headline
      ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    const areaText =
      [
        alert.info_area_areadesc,
        alert.area_areadesc,
        alert.info_audience,
        alert.addresses
      ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    const fullText =
      [
        alert.info_event,
        alert.info_headline,
        alert.info_description,
        alert.info_instruction,
        alert.info_sendername,
        alert.info_area_areadesc,
        alert.area_areadesc,
        alert.addresses,
        alert.source
      ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();


    if (
      event &&
      !eventText.includes(event)
    ) {
      return false;
    }


    if (
      state &&
      !areaText.includes(state) &&
      !fullText.includes(state)
    ) {
      return false;
    }


    if (
      search &&
      !fullText.includes(search)
    ) {
      return false;
    }


    return true;

  });

}


/* ---------------------------------------
   Render
--------------------------------------- */

function renderAlerts() {

  const alerts =
    getFilteredAlerts();


  if (!alerts.length) {

    els.alertsList.innerHTML = `
      <div class="empty">
        🔎 কোনো matching alert পাওয়া যায়নি।
      </div>
    `;

    return;
  }


  els.alertsList.innerHTML =
    alerts
      .map(
        (alert, index) =>
          createAlertCard(alert, index)
      )
      .join("");


  attachCardButtons();

}


function createAlertCard(alert, index) {

  const event =
    safeText(alert.info_event);


  const headline =
    safeText(alert.info_headline);


  const sender =
    safeText(alert.info_sendername);


  const severity =
    safeText(alert.info_severity);


  const urgency =
    safeText(alert.info_urgency);


  const certainty =
    safeText(alert.info_certainty);


  const area =
    safeText(
      alert.info_area_areadesc ||
      alert.area_areadesc ||
      alert.info_audience
    );


  const description =
    safeText(alert.info_description);


  const instruction =
    safeText(alert.info_instruction);


  const sent =
    formatDate(alert.sent);


  const effective =
    formatDate(alert.info_effective);


  const expires =
    formatDate(alert.info_expires);


  const source =
    safeText(
      alert.info_sendername ||
      alert.sender ||
      alert.source
    );


  const web =
    safeText(alert.info_web);


  const severityClass =
    getSeverityClass(severity);


  return `

    <article
      class="alert-card"
      data-index="${index}"
    >

      <div class="alert-top">

        <div class="alert-icon">
          ${getAlertIcon(event)}
        </div>


        <div class="alert-main">

          <div class="alert-event">
            ${escapeHTML(event)}
          </div>


          <div class="alert-headline">
            ${escapeHTML(headline)}
          </div>


          <div class="badges">

            <span class="badge">
              🇺🇸 US
            </span>

            ${
              severity !== "—"
                ? `
                  <span class="badge ${severityClass}">
                    ${escapeHTML(severity)}
                  </span>
                `
                : ""
            }

            ${
              urgency !== "—"
                ? `
                  <span class="badge">
                    Urgency: ${escapeHTML(urgency)}
                  </span>
                `
                : ""
            }

            ${
              certainty !== "—"
                ? `
                  <span class="badge">
                    ${escapeHTML(certainty)}
                  </span>
                `
                : ""
            }

          </div>

        </div>

      </div>


      <div class="alert-section">

        <div class="section-title">
          📍 Area
        </div>

        <div class="section-text">
          ${escapeHTML(area)}
        </div>

      </div>


      <div class="alert-section">

        <div class="section-title">
          📝 Description
        </div>

        <div class="section-text">
          ${escapeHTML(description)}
        </div>

      </div>


      ${
        instruction !== "—"
          ? `
            <div class="alert-section">

              <div class="section-title">
                🛡️ Instructions
              </div>

              <div class="section-text">
                ${escapeHTML(instruction)}
              </div>

            </div>
          `
          : ""
      }


      <div class="alert-section">

        <div class="section-title">
          🕒 Time
        </div>

        <div class="section-text">
          Sent: ${escapeHTML(sent)}

          <br>

          Effective: ${escapeHTML(effective)}

          <br>

          Expires: ${escapeHTML(expires)}
        </div>

      </div>


      <div class="alert-section">

        <div class="section-title">
          🏛️ Sender
        </div>

        <div class="section-text">
          ${escapeHTML(source)}
        </div>

      </div>


      <div class="alert-actions">

        <button
          class="small-btn speak-btn"
          data-index="${index}">
          🔊 শুনুন
        </button>


        ${
          web !== "—"
            ? `
              <button
                class="small-btn web-btn"
                data-index="${index}">
                🌐 Website
              </button>
            `
            : ""
        }

      </div>

    </article>

  `;

}


/* ---------------------------------------
   Buttons
--------------------------------------- */

function attachCardButtons() {

  document
    .querySelectorAll(".speak-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.index);

          const filtered =
            getFilteredAlerts();

          const alert =
            filtered[index];

          if (alert) {
            speakAlert(alert);
          }

        }
      );

    });


  document
    .querySelectorAll(".web-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.index);

          const filtered =
            getFilteredAlerts();

          const alert =
            filtered[index];

          if (
            alert &&
            alert.info_web
          ) {

            let url =
              String(alert.info_web).trim();


            if (
              !/^https?:\/\//i.test(url)
            ) {
              url =
                "https://" + url;
            }


            window.open(
              url,
              "_blank",
              "noopener,noreferrer"
            );

          }

        }
      );

    });

}


/* ---------------------------------------
   Voice
--------------------------------------- */

function updateVoiceButton() {

  if (voiceEnabled) {

    els.voiceBtn.textContent =
      "🔊 Voice ON";

  } else {

    els.voiceBtn.textContent =
      "🔇 Voice OFF";

  }

}


function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    alert(
      "এই Android browser-এ Text-to-Speech পাওয়া যায়নি।"
    );

    return;

  }


  window.speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(text);


  utterance.lang =
    "en-US";


  utterance.rate =
    0.92;


  utterance.pitch =
    1;


  utterance.volume =
    1;


  window.speechSynthesis.speak(
    utterance
  );

}


function speakAlert(alert) {

  const text = [

    "United States Government Alert.",

    safeText(alert.info_event),

    safeText(alert.info_headline),

    "Area:",

    safeText(
      alert.info_area_areadesc ||
      alert.area_areadesc
    ),

    "Instructions:",

    safeText(alert.info_instruction)

  ]
  .filter(Boolean)
  .join(". ");


  speak(text);

}


function toggleVoice() {

  voiceEnabled =
    !voiceEnabled;


  localStorage.setItem(
    "aynaUSAlertVoice",
    voiceEnabled ? "1" : "0"
  );


  updateVoiceButton();


  if (!voiceEnabled) {

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    return;

  }


  speak(
    "AYNA BOOK US Government Alert voice is now on."
  );

}


/* ---------------------------------------
   Status
--------------------------------------- */

function setStatus(text) {

  els.status.textContent =
    text;

}


/* ---------------------------------------
   Events
--------------------------------------- */

els.backBtn.addEventListener(
  "click",
  () => {

    if (
      window.history.length > 1
    ) {

      window.history.back();

    } else {

      window.location.href =
        "./index.html";

    }

  }
);


els.refreshBtn.addEventListener(
  "click",
  loadAlerts
);


els.loadBtn.addEventListener(
  "click",
  loadAlerts
);


els.voiceBtn.addEventListener(
  "click",
  toggleVoice
);


els.eventFilter.addEventListener(
  "change",
  renderAlerts
);


els.stateFilter.addEventListener(
  "input",
  renderAlerts
);


els.searchInput.addEventListener(
  "input",
  renderAlerts
);


/* ---------------------------------------
   Start
--------------------------------------- */

updateVoiceButton();

loadAlerts();


/*
  Automatic refresh:
  10 minutes পরপর archive data আবার চেক করবে।
  এটি live alert system নয়।
*/

setInterval(
  loadAlerts,
  10 * 60 * 1000
);