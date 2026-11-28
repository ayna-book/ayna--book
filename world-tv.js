/* =========================================================
   AYNA BOOK ★ WORLD FREE LIVE TV
   File: world-tv.js

   Features:
   - Worldwide country filter
   - Language filter
   - Category filter
   - Channel search
   - Favorite channels
   - HTML5 live player
   - Fullscreen
   - Mute / unmute
   - Mobile friendly
   - Official/free stream support
   - External official player support
   ========================================================= */

import {
  auth,
  authReady
} from "./firebase-init.js";


/* =========================================================
   CONFIG
   ========================================================= */

const FAVORITES_KEY =
  "ayna_book_world_tv_favorites_v1";

const LAST_CHANNEL_KEY =
  "ayna_book_world_tv_last_channel_v1";

const DEFAULT_POSTER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg"
         width="800"
         height="450"
         viewBox="0 0 800 450">
      <rect width="800" height="450" fill="#050914"/>
      <rect x="20" y="20"
            width="760"
            height="410"
            rx="25"
            fill="#0b1935"
            stroke="#d4af37"
            stroke-width="3"/>
      <text x="400"
            y="205"
            text-anchor="middle"
            fill="#ffd84d"
            font-family="Arial"
            font-size="54"
            font-weight="900">
        AYNA BOOK
      </text>
      <text x="400"
            y="270"
            text-anchor="middle"
            fill="#ffffff"
            font-family="Arial"
            font-size="30">
        WORLD LIVE TV
      </text>
    </svg>
  `);


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) =>
  document.getElementById(id);


/* =========================================================
   DOM
   ========================================================= */

const tvSearch =
  $("tvSearch");

const tvCategoryFilters =
  $("tvCategoryFilters");

const tvCountrySelect =
  $("tvCountrySelect");

const tvLanguageSelect =
  $("tvLanguageSelect");

const tvChannels =
  $("tvChannels");

const tvFavorites =
  $("tvFavorites");

const tvFavoritesSection =
  $("tvFavoritesSection");

const tvEmpty =
  $("tvEmpty");

const tvVideo =
  $("tvVideo");

const tvVideoWrap =
  $("tvVideoWrap");

const tvNowTitle =
  $("tvNowTitle");

const tvPlayerMessage =
  $("tvPlayerMessage");

const tvMuteButton =
  $("tvMuteButton");

const tvFullscreenButton =
  $("tvFullscreenButton");

const tvHomeButton =
  $("tvHomeButton");

const tvBackButton =
  $("tvBackButton");

const tvLoading =
  $("tvLoading");

const tvLoadingText =
  $("tvLoadingText");


/* =========================================================
   STATE
   ========================================================= */

let allChannels = [];

let filteredChannels = [];

let activeCategory = "all";

let activeCountry = "all";

let activeLanguage = "all";

let searchTerm = "";

let currentChannel = null;

let hlsInstance = null;

let favorites = new Set();

let currentUser = null;


/* =========================================================
   AUTH
   ========================================================= */

async function waitForAuth() {
  try {
    await authReady;
  } catch (_) {
    // TV page does not require login.
  }

  currentUser = auth?.currentUser || null;
}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading(
  text = "Live TV loading..."
) {
  if (!tvLoading) return;

  tvLoadingText.textContent = text;

  tvLoading.classList.add("show");

  tvLoading.setAttribute(
    "aria-hidden",
    "false"
  );
}


function hideLoading() {
  if (!tvLoading) return;

  tvLoading.classList.remove("show");

  tvLoading.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =========================================================
   CHANNEL DATABASE
   ========================================================= */

/*
  These are safe placeholder/demo records.

  IMPORTANT:
  Real stream URLs should only be inserted when:
  - publicly available
  - legally permitted
  - official/public broadcaster stream
  - compatible with browser playback

  streamType:
  - hls
  - mp4
  - webm
  - external

  playable:
  true  = player can attempt direct playback
  false = official page/link only
*/

const BUILT_IN_CHANNELS = [

  {
    id: "ayna-bd-news",
    name: "Bangladesh News",
    country: "Bangladesh",
    countryCode: "BD",
    flag: "🇧🇩",
    language: "Bengali",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-bd-public",
    name: "Bangladesh Public TV",
    country: "Bangladesh",
    countryCode: "BD",
    flag: "🇧🇩",
    language: "Bengali",
    category: "government",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-in-news",
    name: "India News",
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    language: "Hindi",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-pk-news",
    name: "Pakistan News",
    country: "Pakistan",
    countryCode: "PK",
    flag: "🇵🇰",
    language: "Urdu",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-np-news",
    name: "Nepal News",
    country: "Nepal",
    countryCode: "NP",
    flag: "🇳🇵",
    language: "Nepali",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-lk-news",
    name: "Sri Lanka News",
    country: "Sri Lanka",
    countryCode: "LK",
    flag: "🇱🇰",
    language: "Sinhala",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-jp-news",
    name: "Japan News",
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    language: "Japanese",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-kr-news",
    name: "Korea News",
    country: "South Korea",
    countryCode: "KR",
    flag: "🇰🇷",
    language: "Korean",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-cn-news",
    name: "China News",
    country: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    language: "Chinese",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-au-news",
    name: "Australia News",
    country: "Australia",
    countryCode: "AU",
    flag: "🇦🇺",
    language: "English",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-uk-news",
    name: "United Kingdom News",
    country: "United Kingdom",
    countryCode: "GB",
    flag: "🇬🇧",
    language: "English",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-fr-news",
    name: "France News",
    country: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    language: "French",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-de-news",
    name: "Germany News",
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    language: "German",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-it-news",
    name: "Italy News",
    country: "Italy",
    countryCode: "IT",
    flag: "🇮🇹",
    language: "Italian",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-es-news",
    name: "Spain News",
    country: "Spain",
    countryCode: "ES",
    flag: "🇪🇸",
    language: "Spanish",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-us-news",
    name: "United States News",
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    language: "English",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-ca-news",
    name: "Canada News",
    country: "Canada",
    countryCode: "CA",
    flag: "🇨🇦",
    language: "English",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-br-news",
    name: "Brazil News",
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    language: "Portuguese",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-sa-news",
    name: "Saudi Arabia News",
    country: "Saudi Arabia",
    countryCode: "SA",
    flag: "🇸🇦",
    language: "Arabic",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-ae-news",
    name: "UAE News",
    country: "United Arab Emirates",
    countryCode: "AE",
    flag: "🇦🇪",
    language: "Arabic",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-tr-news",
    name: "Türkiye News",
    country: "Türkiye",
    countryCode: "TR",
    flag: "🇹🇷",
    language: "Turkish",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-za-news",
    name: "South Africa News",
    country: "South Africa",
    countryCode: "ZA",
    flag: "🇿🇦",
    language: "English",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  },

  {
    id: "ayna-ng-news",
    name: "Nigeria News",
    country: "Nigeria",
    countryCode: "NG",
    flag: "🇳🇬",
    language: "English",
    category: "news",
    streamType: "external",
    streamUrl: "",
    officialUrl: "",
    playable: false
  }

];


/* =========================================================
   LOAD OPTIONAL DATA FILE
   ========================================================= */

async function loadExternalChannelDatabase() {

  try {

    const module =
      await import("./world-tv-data.js");

    if (
      module &&
      Array.isArray(module.worldTVChannels)
    ) {

      return module.worldTVChannels;

    }

    if (
      module &&
      Array.isArray(module.channels)
    ) {

      return module.channels;

    }

  } catch (error) {

    console.info(
      "world-tv-data.js not found or not ready. Using built-in database.",
      error
    );

  }

  return [];
}


/* =========================================================
   NORMALIZE CHANNEL
   ========================================================= */

function normalizeChannel(channel, index = 0) {

  const safe =
    channel || {};

  return {

    id:
      String(
        safe.id ||
        `world-tv-${index}`
      ),

    name:
      String(
        safe.name ||
        "Unknown Channel"
      ),

    country:
      String(
        safe.country ||
        "Unknown"
      ),

    countryCode:
      String(
        safe.countryCode ||
        ""
      ),

    flag:
      String(
        safe.flag ||
        "🌍"
      ),

    language:
      String(
        safe.language ||
        "International"
      ),

    category:
      String(
        safe.category ||
        "news"
      ).toLowerCase(),

    streamType:
      String(
        safe.streamType ||
        "external"
      ).toLowerCase(),

    streamUrl:
      String(
        safe.streamUrl ||
        ""
      ),

    officialUrl:
      String(
        safe.officialUrl ||
        ""
      ),

    poster:
      String(
        safe.poster ||
        DEFAULT_POSTER
      ),

    playable:
      safe.playable !== false,

    description:
      String(
        safe.description ||
        ""
      )

  };

}


/* =========================================================
   LOAD CHANNELS
   ========================================================= */

async function loadChannels() {

  showLoading(
    "World TV channels loading..."
  );

  try {

    const externalChannels =
      await loadExternalChannelDatabase();

    const combined = [
      ...BUILT_IN_CHANNELS,
      ...externalChannels
    ];

    const unique =
      new Map();

    combined.forEach(
      (channel, index) => {

        const normalized =
          normalizeChannel(
            channel,
            index
          );

        if (
          !unique.has(
            normalized.id
          )
        ) {

          unique.set(
            normalized.id,
            normalized
          );

        }

      }
    );

    allChannels =
      Array.from(
        unique.values()
      );

    populateCountrySelect();

    populateLanguageSelect();

    applyFilters();

  } catch (error) {

    console.error(
      "AYNA BOOK World TV load error:",
      error
    );

    allChannels =
      BUILT_IN_CHANNELS.map(
        normalizeChannel
      );

    populateCountrySelect();

    populateLanguageSelect();

    applyFilters();

  } finally {

    hideLoading();

  }

}


/* =========================================================
   FAVORITES
   ========================================================= */

function loadFavorites() {

  try {

    const raw =
      localStorage.getItem(
        FAVORITES_KEY
      );

    if (!raw) {

      favorites =
        new Set();

      return;

    }

    const parsed =
      JSON.parse(raw);

    if (
      Array.isArray(parsed)
    ) {

      favorites =
        new Set(
          parsed.map(
            String
          )
        );

    }

  } catch (error) {

    console.warn(
      "Favorite loading error:",
      error
    );

    favorites =
      new Set();

  }

}


function saveFavorites() {

  try {

    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(
        Array.from(favorites)
      )
    );

  } catch (error) {

    console.warn(
      "Favorite saving error:",
      error
    );

  }

}


function isFavorite(channelId) {

  return favorites.has(
    String(channelId)
  );

}


function toggleFavorite(channelId) {

  const id =
    String(channelId);

  if (
    favorites.has(id)
  ) {

    favorites.delete(id);

  } else {

    favorites.add(id);

  }

  saveFavorites();

  renderFavorites();

  renderChannels();

}


/* =========================================================
   COUNTRY SELECT
   ========================================================= */

function populateCountrySelect() {

  if (!tvCountrySelect) return;

  const countries =
    Array.from(
      new Set(
        allChannels
          .map(
            channel =>
              channel.country
          )
          .filter(Boolean)
      )
    )
    .sort(
      (a, b) =>
        a.localeCompare(
          b
        )
    );

  tvCountrySelect.innerHTML = `
    <option value="all">
      🌍 All Countries
    </option>
  `;

  countries.forEach(
    country => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        country;

      option.textContent =
        `🌍 ${country}`;

      tvCountrySelect.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   LANGUAGE SELECT
   ========================================================= */

function populateLanguageSelect() {

  if (!tvLanguageSelect) return;

  const languages =
    Array.from(
      new Set(
        allChannels
          .map(
            channel =>
              channel.language
          )
          .filter(Boolean)
      )
    )
    .sort(
      (a, b) =>
        a.localeCompare(
          b
        )
    );

  tvLanguageSelect.innerHTML = `
    <option value="all">
      🗣️ All Languages
    </option>
  `;

  languages.forEach(
    language => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        language;

      option.textContent =
        `🗣️ ${language}`;

      tvLanguageSelect.appendChild(
        option
      );

    }
  );

}


/* =========================================================
   FILTERS
   ========================================================= */

function applyFilters() {

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();

  filteredChannels =
    allChannels.filter(
      channel => {

        const categoryMatch =
          activeCategory === "all" ||
          channel.category ===
            activeCategory;

        const countryMatch =
          activeCountry === "all" ||
          channel.country ===
            activeCountry;

        const languageMatch =
          activeLanguage === "all" ||
          channel.language ===
            activeLanguage;

        const searchMatch =
          !normalizedSearch ||
          [
            channel.name,
            channel.country,
            channel.language,
            channel.category,
            channel.countryCode,
            channel.description
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              normalizedSearch
            );

        return (
          categoryMatch &&
          countryMatch &&
          languageMatch &&
          searchMatch
        );

      }
    );

  renderChannels();

  renderFavorites();

}


/* =========================================================
   CHANNEL CARD
   ========================================================= */

function createChannelCard(channel) {

  const article =
    document.createElement(
      "article"
    );

  article.className =
    "_tv_channel";

  const favorite =
    isFavorite(
      channel.id
    );

  const playable =
    Boolean(
      channel.streamUrl &&
      channel.playable
    );

  article.innerHTML = `

    <div class="_tv_channel_top">

      <div class="_tv_channel_flag">
        ${escapeHTML(channel.flag)}
      </div>

      <div class="_tv_channel_live">
        🔴 LIVE
      </div>

    </div>

    <div class="_tv_channel_name">
      ${escapeHTML(channel.name)}
    </div>

    <div class="_tv_channel_country">
      ${escapeHTML(channel.country)}
    </div>

    <div class="_tv_channel_category">
      ${escapeHTML(channel.category)}
      •
      ${escapeHTML(channel.language)}
    </div>

    <div class="_tv_channel_buttons">

      <button
        type="button"
        class="_tv_watch"
        data-action="watch"
      >
        ${
          playable
            ? "▶ Watch Live"
            : "🌐 Official"
        }
      </button>

      <button
        type="button"
        class="_tv_favorite ${
          favorite
            ? "active"
            : ""
        }"
        data-action="favorite"
        aria-label="Favorite"
        title="Favorite"
      >
        ${
          favorite
            ? "★"
            : "☆"
        }
      </button>

    </div>
  `;


  const watchButton =
    article.querySelector(
      '[data-action="watch"]'
    );

  const favoriteButton =
    article.querySelector(
      '[data-action="favorite"]'
    );


  watchButton.addEventListener(
    "click",
    () => {

      openChannel(
        channel
      );

    }
  );


  favoriteButton.addEventListener(
    "click",
    () => {

      toggleFavorite(
        channel.id
      );

    }
  );


  return article;

}


/* =========================================================
   RENDER CHANNELS
   ========================================================= */

function renderChannels() {

  if (!tvChannels) return;

  tvChannels.innerHTML = "";

  if (
    filteredChannels.length === 0
  ) {

    if (tvEmpty) {

      tvEmpty.hidden =
        false;

    }

    return;

  }

  if (tvEmpty) {

    tvEmpty.hidden =
      true;

  }

  const fragment =
    document.createDocumentFragment();

  filteredChannels.forEach(
    channel => {

      fragment.appendChild(
        createChannelCard(
          channel
        )
      );

    }
  );

  tvChannels.appendChild(
    fragment
  );

}


/* =========================================================
   RENDER FAVORITES
   ========================================================= */

function renderFavorites() {

  if (!tvFavorites) return;

  tvFavorites.innerHTML = "";

  const favoriteChannels =
    allChannels.filter(
      channel =>
        favorites.has(
          channel.id
        )
    );

  if (
    favoriteChannels.length === 0
  ) {

    if (tvFavoritesSection) {

      tvFavoritesSection.style.display =
        "none";

    }

    return;

  }

  if (tvFavoritesSection) {

    tvFavoritesSection.style.display =
      "";

  }

  favoriteChannels.forEach(
    channel => {

      tvFavorites.appendChild(
        createChannelCard(
          channel
        )
      );

    }
  );

}


/* =========================================================
   OPEN CHANNEL
   ========================================================= */

async function openChannel(
  channel
) {

  if (!channel) return;

  currentChannel =
    channel;

  saveLastChannel(
    channel.id
  );

  updatePlayerTitle(
    channel
  );

  showLoading(
    `${channel.name} loading...`
  );


  try {

    stopCurrentPlayback();


    /*
      DIRECT BROWSER PLAYBACK
    */

    if (
      channel.playable &&
      channel.streamUrl
    ) {

      await playDirectStream(
        channel
      );

      hidePlayerMessage();

      return;

    }


    /*
      OFFICIAL PAGE
    */

    showPlayerMessage(
      "🌐 Official Live Player",
      channel.officialUrl
        ? "এই channel-এর official live page খুলতে নিচের Official button ব্যবহার করুন।"
        : "এই channel-এর সরাসরি browser stream এখনো যোগ করা হয়নি।"
    );


    if (
      channel.officialUrl
    ) {

      const openOfficial =
        window.confirm(
          `${channel.name}\n\nOfficial Live Page খুলবেন?`
        );

      if (openOfficial) {

        window.open(
          channel.officialUrl,
          "_blank",
          "noopener,noreferrer"
        );

      }

    }

  } catch (error) {

    console.error(
      "TV playback error:",
      error
    );

    showPlayerMessage(
      "⚠️ Live stream চালানো যায়নি",
      "এই stream browser playback support করতে পারে না, অথবা stream বর্তমানে unavailable।"
    );

  } finally {

    hideLoading();

  }

}


/* =========================================================
   DIRECT STREAM
   ========================================================= */

async function playDirectStream(
  channel
) {

  if (!tvVideo) {

    throw new Error(
      "Video player not found."
    );

  }

  const url =
    channel.streamUrl;


  /*
    Native HLS support
  */

  if (
    channel.streamType === "hls" &&
    tvVideo.canPlayType(
      "application/vnd.apple.mpegurl"
    )
  ) {

    tvVideo.src =
      url;

    await safePlay();

    return;

  }


  /*
    MP4 / WebM / normal media
  */

  if (
    channel.streamType === "mp4" ||
    channel.streamType === "webm"
  ) {

    tvVideo.src =
      url;

    await safePlay();

    return;

  }


  /*
    Try native source anyway
  */

  tvVideo.src =
    url;

  await safePlay();

}


/* =========================================================
   SAFE PLAY
   ========================================================= */

async function safePlay() {

  try {

    await tvVideo.play();

  } catch (error) {

    /*
      Browser autoplay policy may block
      unmuted playback.
    */

    try {

      tvVideo.muted =
        true;

      updateMuteButton();

      await tvVideo.play();

    } catch (secondError) {

      throw secondError;

    }

  }

}


/* =========================================================
   STOP PLAYBACK
   ========================================================= */

function stopCurrentPlayback() {

  if (!tvVideo) return;

  try {

    tvVideo.pause();

  } catch (_) {}

  try {

    tvVideo.removeAttribute(
      "src"
    );

    tvVideo.load();

  } catch (_) {}

  if (hlsInstance) {

    try {

      hlsInstance.destroy();

    } catch (_) {}

    hlsInstance =
      null;

  }

}


/* =========================================================
   PLAYER TITLE
   ========================================================= */

function updatePlayerTitle(
  channel
) {

  if (!tvNowTitle) return;

  tvNowTitle.innerHTML = `
    <span>
      ${escapeHTML(channel.flag)}
      ${escapeHTML(channel.name)}
    </span>
    — ${escapeHTML(channel.country)}
  `;

}


/* =========================================================
   PLAYER MESSAGE
   ========================================================= */

function showPlayerMessage(
  title,
  text
) {

  if (!tvPlayerMessage) return;

  tvPlayerMessage.innerHTML = `

    <div class="_tv_player_message_content">

      <h2>
        ${escapeHTML(title)}
      </h2>

      <p>
        ${escapeHTML(text)}
      </p>

    </div>

  `;

  tvPlayerMessage.style.display =
    "flex";

}


function hidePlayerMessage() {

  if (!tvPlayerMessage) return;

  tvPlayerMessage.style.display =
    "none";

}


/* =========================================================
   MUTE
   ========================================================= */

function updateMuteButton() {

  if (!tvMuteButton) return;

  tvMuteButton.textContent =
    tvVideo.muted
      ? "🔇"
      : "🔊";

}


function toggleMute() {

  if (!tvVideo) return;

  tvVideo.muted =
    !tvVideo.muted;

  updateMuteButton();

}


/* =========================================================
   FULLSCREEN
   ========================================================= */

async function toggleFullscreen() {

  const target =
    tvVideoWrap ||
    tvVideo;

  if (!target) return;

  try {

    if (
      document.fullscreenElement
    ) {

      await document.exitFullscreen();

      return;

    }

    if (
      target.requestFullscreen
    ) {

      await target.requestFullscreen();

      return;

    }

    if (
      tvVideo.webkitEnterFullscreen
    ) {

      tvVideo.webkitEnterFullscreen();

    }

  } catch (error) {

    console.warn(
      "Fullscreen error:",
      error
    );

  }

}


/* =========================================================
   LAST CHANNEL
   ========================================================= */

function saveLastChannel(
  channelId
) {

  try {

    localStorage.setItem(
      LAST_CHANNEL_KEY,
      String(channelId)
    );

  } catch (_) {}

}


function getLastChannel() {

  try {

    return localStorage.getItem(
      LAST_CHANNEL_KEY
    );

  } catch (_) {

    return null;

  }

}


/* =========================================================
   RESTORE LAST CHANNEL
   ========================================================= */

function restoreLastChannel() {

  const lastId =
    getLastChannel();

  if (!lastId) return;

  const channel =
    allChannels.find(
      item =>
        item.id === lastId
    );

  if (!channel) return;

  /*
    Don't autoplay automatically.
    Just prepare the title.
  */

  currentChannel =
    channel;

  updatePlayerTitle(
    channel
  );

}


/* =========================================================
   CATEGORY BUTTONS
   ========================================================= */

function setupCategoryFilters() {

  if (!tvCategoryFilters) return;

  const buttons =
    tvCategoryFilters.querySelectorAll(
      "[data-category]"
    );

  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          buttons.forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

          button.classList.add(
            "active"
          );

          activeCategory =
            button.dataset.category ||
            "all";

          applyFilters();

        }
      );

    }
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  if (!tvSearch) return;

  tvSearch.addEventListener(
    "input",
    () => {

      searchTerm =
        tvSearch.value ||
        "";

      applyFilters();

    }
  );

}


/* =========================================================
   COUNTRY
   ========================================================= */

function setupCountryFilter() {

  if (!tvCountrySelect) return;

  tvCountrySelect.addEventListener(
    "change",
    () => {

      activeCountry =
        tvCountrySelect.value ||
        "all";

      applyFilters();

    }
  );

}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setupLanguageFilter() {

  if (!tvLanguageSelect) return;

  tvLanguageSelect.addEventListener(
    "change",
    () => {

      activeLanguage =
        tvLanguageSelect.value ||
        "all";

      applyFilters();

    }
  );

}


/* =========================================================
   HOME / BACK
   ========================================================= */

function setupNavigation() {

  if (tvHomeButton) {

    tvHomeButton.addEventListener(
      "click",
      () => {

        window.location.href =
          "./index.html";

      }
    );

  }


  if (tvBackButton) {

    tvBackButton.addEventListener(
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

  }

}


/* =========================================================
   PLAYER CONTROLS
   ========================================================= */

function setupPlayerControls() {

  if (tvMuteButton) {

    tvMuteButton.addEventListener(
      "click",
      toggleMute
    );

  }


  if (tvFullscreenButton) {

    tvFullscreenButton.addEventListener(
      "click",
      toggleFullscreen
    );

  }


  if (tvVideo) {

    tvVideo.addEventListener(
      "play",
      () => {

        hidePlayerMessage();

      }
    );


    tvVideo.addEventListener(
      "error",
      () => {

        if (
          currentChannel
        ) {

          showPlayerMessage(
            "⚠️ Stream unavailable",
            `${currentChannel.name} এর Live stream বর্তমানে browser-এ চালানো যাচ্ছে না।`
          );

        }

      }
    );


    tvVideo.addEventListener(
      "loadeddata",
      () => {

        hidePlayerMessage();

      }
    );

  }

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function setupKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      /*
        Escape
      */

      if (
        event.key === "Escape"
      ) {

        if (
          document.fullscreenElement
        ) {

          document.exitFullscreen()
            .catch(
              () => {}
            );

        }

      }


      /*
        Space = play/pause
      */

      if (
        event.code === "Space" &&
        document.activeElement !== tvSearch
      ) {

        event.preventDefault();

        if (!tvVideo) return;

        if (
          tvVideo.paused
        ) {

          tvVideo.play()
            .catch(
              () => {}
            );

        } else {

          tvVideo.pause();

        }

      }

    }
  );

}


/* =========================================================
   HTML ESCAPE
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
   PAGE VISIBILITY
   ========================================================= */

function setupVisibility() {

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.hidden &&
        tvVideo &&
        !tvVideo.paused
      ) {

        /*
          Do not force pause.
          Browser decides background
          playback policy.
        */

      }

    }
  );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initWorldTV() {

  console.log(
    "AYNA BOOK ★ World Free Live TV starting..."
  );

  loadFavorites();

  setupCategoryFilters();

  setupSearch();

  setupCountryFilter();

  setupLanguageFilter();

  setupNavigation();

  setupPlayerControls();

  setupKeyboard();

  setupVisibility();

  await waitForAuth();

  await loadChannels();

  restoreLastChannel();

  updateMuteButton();

  console.log(
    "AYNA BOOK ★ World Free Live TV ready.",
    {
      channels:
        allChannels.length,
      user:
        currentUser?.uid || null
    }
  );

}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initWorldTV,
    {
      once: true
    }
  );

} else {

  initWorldTV();

}