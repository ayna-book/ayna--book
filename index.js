// ============================================================
// AYNA BOOK* — index.js
// MASTER HOME / GLOBAL HUB
// Firebase 13.4.0
// ============================================================

import {
  auth,
  database
} from "./firebase-init.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  set,
  update
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// GLOBAL CONFIG
// ============================================================

const AYNA = {
  appName: "AYNA BOOK",
  version: "2026.11",
  home: "index.html",
  login: "login.html",
  register: "register.html",
  profile: "profile.html",
  messenger: "messenger.html"
};


// ============================================================
// SHORTCUT
// ============================================================

const $ = (id) => document.getElementById(id);


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;
let currentProfile = null;


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  console.log("====================================");
  console.log("AYNA BOOK index.js started");
  console.log("Version:", AYNA.version);
  console.log("====================================");

  initAuth();
  initSearch();
  initButtons();
  initClock();
  initKeyboard();
  initServiceWorker();

});


// ============================================================
// FIREBASE AUTH
// ============================================================

function initAuth() {

  if (!auth) {

    console.error(
      "AYNA BOOK: Firebase Auth unavailable."
    );

    showSystemMessage(
      "Firebase Auth সংযোগ পাওয়া যায়নি।",
      "error"
    );

    return;
  }


  onAuthStateChanged(
    auth,
    async (user) => {

      currentUser = user || null;

      if (user) {

        console.log(
          "AYNA BOOK logged in:",
          user.email
        );

        await loadUserProfile(user.uid);

        updateLoggedInUI(user);

      } else {

        console.log(
          "AYNA BOOK visitor mode."
        );

        updateLoggedOutUI();

      }

    },
    (error) => {

      console.error(
        "Auth state error:",
        error
      );

      showSystemMessage(
        "অ্যাকাউন্ট স্ট্যাটাস পরীক্ষা করা যায়নি।",
        "error"
      );

    }
  );

}


// ============================================================
// LOAD USER PROFILE
// ============================================================

async function loadUserProfile(uid) {

  if (!database || !uid) return;

  try {

    const userRef =
      ref(database, `users/${uid}`);

    const snapshot =
      await get(userRef);

    if (snapshot.exists()) {

      currentProfile =
        snapshot.val();

      console.log(
        "AYNA BOOK profile loaded:",
        currentProfile
      );

    } else {

      currentProfile = null;

    }

  } catch (error) {

    console.warn(
      "Profile loading failed:",
      error
    );

    currentProfile = null;

  }

}


// ============================================================
// LOGGED IN UI
// ============================================================

function updateLoggedInUI(user) {

  document.body.classList.add(
    "ayna-user-logged-in"
  );

  document.body.classList.remove(
    "ayna-user-logged-out"
  );


  const status =
    document.querySelector(".status");

  if (status) {

    status.innerHTML = `
      <span class="status-dot"></span>
      🟢 LOGGED IN —
      ${escapeHtml(
        currentProfile?.fullName ||
        user.displayName ||
        user.email ||
        "AYNA MEMBER"
      )}
    `;

  }


  const loginButtons =
    document.querySelectorAll(
      'a[href="login.html"]'
    );

  loginButtons.forEach(
    button => {

      button.textContent =
        "🚪 Logout";

      button.href = "#";

      button.addEventListener(
        "click",
        async (event) => {

          event.preventDefault();

          await logoutUser();

        },
        { once: true }
      );

    }
  );


  const registerButtons =
    document.querySelectorAll(
      'a[href="register.html"]'
    );

  registerButtons.forEach(
    button => {

      button.textContent =
        "👤 My Profile";

      button.href =
        "profile.html";

    }
  );

}


// ============================================================
// LOGGED OUT UI
// ============================================================

function updateLoggedOutUI() {

  document.body.classList.add(
    "ayna-user-logged-out"
  );

  document.body.classList.remove(
    "ayna-user-logged-in"
  );

  const status =
    document.querySelector(".status");

  if (status) {

    status.innerHTML = `
      <span class="status-dot"></span>
      🔵 AYNA BOOK SYSTEM READY
    `;

  }

}


// ============================================================
// LOGOUT
// ============================================================

async function logoutUser() {

  if (!auth) return;

  try {

    await signOut(auth);

    showSystemMessage(
      "লগআউট সফল হয়েছে।",
      "success"
    );

    setTimeout(
      () => {
        window.location.href =
          "login.html";
      },
      800
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    showSystemMessage(
      "লগআউট সম্পন্ন করা যায়নি।",
      "error"
    );

  }

}


// ============================================================
// SEARCH
// ============================================================

function initSearch() {

  const input =
    $("globalSearch");

  const button =
    $("searchBtn");

  if (!input || !button) return;


  button.addEventListener(
    "click",
    () => {

      performSearch(
        input.value
      );

    }
  );


  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        performSearch(
          input.value
        );

      }

    }
  );

}


// ============================================================
// PERFORM SEARCH
// ============================================================

async function performSearch(value) {

  const query =
    String(value || "").trim();


  const result =
    $("searchResult");


  if (!result) return;


  if (!query) {

    result.innerHTML = `
      <div class="feature">
        <div class="feature-icon">🔎</div>
        <div class="feature-title">
          Search box empty
        </div>
        <div class="feature-desc">
          কিছু লিখে আবার Search করুন।
        </div>
      </div>
    `;

    return;
  }


  result.innerHTML = `
    <div class="feature">
      <div class="feature-icon">
        ⏳
      </div>

      <div class="feature-title">
        Searching...
      </div>

      <div class="feature-desc">
        AYNA BOOK: ${escapeHtml(query)}
      </div>
    </div>
  `;


  /*
   * প্রথমে local feature search
   */

  const features = [

    "AYNA AI",
    "AYNA Messenger",
    "Profile",
    "Business",
    "VIP",
    "VVIP",
    "Marketplace",
    "Radar",
    "Weather",
    "Civil Aviation",
    "Prayer Times",
    "Ramadan",
    "World Calendar",
    "Radio",
    "TV",
    "Live Video",
    "Creator Studio",
    "Quantum Hub",
    "Supercomputer",
    "Government Alerts"

  ];


  const matches =
    features.filter(
      item =>
        item
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );


  if (matches.length) {

    result.innerHTML = `
      <div class="feature">

        <div class="feature-icon">
          🔎
        </div>

        <div class="feature-title">
          ${matches.length} result found
        </div>

        <div class="feature-desc">
          ${matches
            .map(
              item =>
                `• ${escapeHtml(item)}`
            )
            .join("<br>")}
        </div>

      </div>
    `;

    return;
  }


  /*
   * Firebase users search
   */

  if (database) {

    try {

      const usersSnapshot =
        await get(
          ref(database, "users")
        );

      if (usersSnapshot.exists()) {

        const users =
          Object.values(
            usersSnapshot.val() || {}
          );


        const found =
          users.filter(user => {

            const name =
              String(
                user.fullName || ""
              ).toLowerCase();

            const email =
              String(
                user.email || ""
              ).toLowerCase();

            const aynaId =
              String(
                user.aynaId || ""
              ).toLowerCase();

            const q =
              query.toLowerCase();

            return (
              name.includes(q) ||
              email.includes(q) ||
              aynaId.includes(q)
            );

          });


        if (found.length) {

          result.innerHTML = `
            <div class="feature">

              <div class="feature-icon">
                👤
              </div>

              <div class="feature-title">
                ${found.length}
                AYNA account found
              </div>

              <div class="feature-desc">

                ${found
                  .slice(0, 10)
                  .map(
                    user => `
                      • ${escapeHtml(
                        user.fullName ||
                        user.email ||
                        "AYNA Member"
                      )}
                      ${
                        user.aynaId
                          ? " — " +
                            escapeHtml(
                              user.aynaId
                            )
                          : ""
                      }
                    `
                  )
                  .join("<br>")}

              </div>

            </div>
          `;

          return;

        }

      }

    } catch (error) {

      console.warn(
        "Firebase search failed:",
        error
      );

    }

  }


  result.innerHTML = `
    <div class="feature">

      <div class="feature-icon">
        🔎
      </div>

      <div class="feature-title">
        No result found
      </div>

      <div class="feature-desc">
        "${escapeHtml(query)}"
        নামে কোনো feature বা account পাওয়া যায়নি।
      </div>

    </div>
  `;

}


// ============================================================
// BUTTON INITIALIZATION
// ============================================================

function initButtons() {

  /*
   * Login
   */

  document
    .querySelectorAll(
      'a[href="login.html"]'
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            if (!currentUser) {

              return;

            }

            event.preventDefault();

            logoutUser();

          }
        );

      }
    );


  /*
   * Profile
   */

  document
    .querySelectorAll(
      'a[href="profile.html"]'
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            if (!currentUser) {

              event.preventDefault();

              window.location.href =
                "login.html";

            }

          }
        );

      }
    );


  /*
   * Messenger
   */

  document
    .querySelectorAll(
      'a[href="messenger.html"]'
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            if (!currentUser) {

              event.preventDefault();

              showSystemMessage(
                "Messenger ব্যবহার করতে আগে Login করুন।",
                "error"
              );

              setTimeout(
                () => {
                  window.location.href =
                    "login.html";
                },
                1000
              );

            }

          }
        );

      }
    );


  /*
   * Plan buttons
   */

  document
    .querySelectorAll(
      ".price-card button"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const title =
              button
                .closest(".price-card")
                ?.querySelector("h3")
                ?.textContent
                ?.trim() ||
              "AYNA PLAN";

            choosePlan(
              title
            );

          }
        );

      }
    );

}


// ============================================================
// PLAN SELECTION
// ============================================================

function choosePlan(plan) {

  const cleanPlan =
    String(plan)
      .replace(/[^\w\s]/g, "")
      .trim();


  if (!currentUser) {

    showSystemMessage(
      `${cleanPlan} নিতে আগে Login করুন।`,
      "error"
    );

    setTimeout(
      () => {
        window.location.href =
          "login.html";
      },
      1000
    );

    return;

  }


  localStorage.setItem(
    "ayna_selected_plan",
    cleanPlan
  );


  showSystemMessage(
    `${cleanPlan} plan নির্বাচন করা হয়েছে।`,
    "success"
  );

}


// ============================================================
// AI DEMO
// ============================================================

window.aiDemo = function () {

  const output =
    $("aiOutput");

  if (!output) return;


  output.innerHTML =
    "🤖 AYNA AI প্রস্তুত। আপনি প্রশ্ন করতে পারেন।";


  speakText(
    "AYNA AI is ready."
  );

};


// ============================================================
// VOICE TIME
// ============================================================

window.speakTime = function () {

  const now =
    new Date();


  const time =
    now.toLocaleTimeString(
      "en-US",
      {
        hour:"numeric",
        minute:"2-digit",
        second:"2-digit"
      }
    );


  const output =
    $("aiOutput");


  if (output) {

    output.textContent =
      `🕐 Current time: ${time}`;

  }


  speakText(
    `The current time is ${time}`
  );

};


// ============================================================
// CLOCK
// ============================================================

function initClock() {

  updateClock();

  setInterval(
    updateClock,
    1000
  );

}


function updateClock() {

  const elements =
    document.querySelectorAll(
      "[data-ayna-clock]"
    );


  if (!elements.length) return;


  const now =
    new Date();


  const time =
    now.toLocaleTimeString();


  elements.forEach(
    element => {

      element.textContent =
        time;

    }
  );

}


// ============================================================
// SPEECH
// ============================================================

function speakText(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  try {

    speechSynthesis.cancel();


    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    utterance.rate =
      0.9;

    utterance.pitch =
      1;


    speechSynthesis.speak(
      utterance
    );

  } catch (error) {

    console.warn(
      "Speech error:",
      error
    );

  }

}


// ============================================================
// REACTION
// ============================================================

window.react = function (type) {

  if (!currentUser) {

    showSystemMessage(
      "Reaction দিতে আগে Login করুন।",
      "error"
    );

    return;

  }


  showSystemMessage(
    `${type} reaction selected.`,
    "success"
  );

};


// ============================================================
// INFORMATION
// ============================================================

window.showInfo = function () {

  showSystemMessage(
    "AYNA BOOK Global Information Hub খুলতে প্রস্তুত।",
    "success"
  );

};


// ============================================================
// SYSTEM MESSAGE
// ============================================================

function showSystemMessage(
  message,
  type = "info"
) {

  let box =
    $("aynaSystemMessage");


  if (!box) {

    box =
      document.createElement(
        "div"
      );

    box.id =
      "aynaSystemMessage";


    box.style.position =
      "fixed";

    box.style.left =
      "15px";

    box.style.right =
      "15px";

    box.style.bottom =
      "20px";

    box.style.zIndex =
      "99999";

    box.style.padding =
      "22px";

    box.style.border =
      "3px solid #ffd84a";

    box.style.borderRadius =
      "20px";

    box.style.background =
      "#08152f";

    box.style.color =
      "#fff";

    box.style.fontSize =
      "1.25rem";

    box.style.fontWeight =
      "900";

    box.style.textAlign =
      "center";

    box.style.boxShadow =
      "0 10px 35px rgba(0,0,0,.6)";


    document.body.appendChild(
      box
    );

  }


  box.textContent =
    message;


  if (type === "error") {

    box.style.borderColor =
      "#ff5c6c";

  } else if (
    type === "success"
  ) {

    box.style.borderColor =
      "#40e58b";

  } else {

    box.style.borderColor =
      "#ffd84a";

  }


  clearTimeout(
    box._timer
  );


  box._timer =
    setTimeout(
      () => {

        box.remove();

      },
      3500
    );

}


// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

function initKeyboard() {

  document.addEventListener(
    "keydown",
    event => {

      /*
       * Ctrl + K = Search
       */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "k"
      ) {

        event.preventDefault();

        const input =
          $("globalSearch");

        input?.focus();

      }


      /*
       * Escape = Stop Speech
       */

      if (
        event.key === "Escape"
      ) {

        if (
          "speechSynthesis" in window
        ) {

          speechSynthesis.cancel();

        }

      }

    }
  );

}


// ============================================================
// SERVICE WORKER
// ============================================================

function initServiceWorker() {

  if (
    !("serviceWorker" in navigator)
  ) {

    return;

  }


  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          "./sw.js"
        )
        .then(
          registration => {

            console.log(
              "AYNA BOOK Service Worker ready:",
              registration.scope
            );

          }
        )
        .catch(
          error => {

            console.warn(
              "Service Worker unavailable:",
              error
            );

          }
        );

    }
  );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// ============================================================
// GLOBAL API
// ============================================================

window.AYNA_BOOK = {

  getUser: () =>
    currentUser,

  getProfile: () =>
    currentProfile,

  search: performSearch,

  speak: speakText,

  speakTime: window.speakTime,

  logout: logoutUser,

  choosePlan,

  version:
    AYNA.version

};


// ============================================================
// READY
// ============================================================

console.log(
  "AYNA BOOK index.js fully loaded."
);