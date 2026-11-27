// ============================================================
// AYNA BOOK — HOME / FEED
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
  get
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


let currentUser = null;
let currentProfile = null;


// ============================================================
// DOM
// ============================================================

const $ = (id) =>
  document.getElementById(id);


// ============================================================
// TOAST
// ============================================================

function toast(message) {

  const box = $("toast");

  if (!box) return;

  box.textContent = message;

  box.classList.add("show");

  clearTimeout(
    window.__aynaToastTimer
  );

  window.__aynaToastTimer =
    setTimeout(() => {

      box.classList.remove("show");

    }, 2500);

}


// ============================================================
// NAVIGATION
// ============================================================

function go(page) {

  if (!page) return;

  window.location.href = page;

}


document
  .querySelectorAll("[data-page]")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;

        go(page);

      }
    );

  });


// ============================================================
// DRAWER
// ============================================================

const drawer =
  $("drawer");

const drawerBackdrop =
  $("drawerBackdrop");

const menuBtn =
  $("menuBtn");


function openDrawer() {

  drawer?.classList.add("open");

  drawerBackdrop?.classList.add("open");

}


function closeDrawer() {

  drawer?.classList.remove("open");

  drawerBackdrop?.classList.remove("open");

}


menuBtn?.addEventListener(
  "click",
  openDrawer
);


drawerBackdrop?.addEventListener(
  "click",
  closeDrawer
);


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {
      return;
    }


    currentUser = user;


    await loadProfile(
      user.uid
    );

  }
);


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadProfile(uid) {

  try {

    const snapshot =
      await get(
        ref(
          database,
          `users/${uid}`
        )
      );


    currentProfile =
      snapshot.exists()
        ? snapshot.val()
        : {};


    updateUserUI();

  } catch (error) {

    console.error(
      "AYNA HOME profile error:",
      error
    );

  }

}


// ============================================================
// UPDATE USER UI
// ============================================================

function updateUserUI() {

  if (!currentUser) {
    return;
  }


  const profile =
    currentProfile || {};


  const name =
    profile.fullName ||
    profile.name ||
    currentUser.displayName ||
    "AYNA User";


  const photo =
    profile.photoURL ||
    profile.photoUrl ||
    currentUser.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10234d&color=fff`;


  const avatar =
    $("myAvatar");

  const bottomAvatar =
    $("bottomAvatar");

  const storyPhoto =
    $("storyMyPhoto");


  if (avatar) {
    avatar.src = photo;
  }


  if (bottomAvatar) {
    bottomAvatar.src = photo;
  }


  if (storyPhoto) {
    storyPhoto.src = photo;
  }

}


// ============================================================
// LOGOUT
// ============================================================

$("logoutBtnDrawer")
  ?.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        window.location.href =
          "./login.html";

      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

        toast(
          "Logout করা যাচ্ছে না।"
        );

      }

    }
  );


// ============================================================
// POST COMPOSER
// ============================================================

$("openPostBtn")
  ?.addEventListener(
    "click",
    () => {

      toast(
        "Post composer পরবর্তী ধাপে Firebase-এর সঙ্গে যুক্ত হবে।"
      );

    }
  );


$("photoBtn")
  ?.addEventListener(
    "click",
    () => {

      toast(
        "Photo Post খুলতে প্রস্তুত।"
      );

    }
  );


$("videoBtn")
  ?.addEventListener(
    "click",
    () => {

      toast(
        "Video Post খুলতে প্রস্তুত।"
      );

    }
  );


$("audioBtn")
  ?.addEventListener(
    "click",
    () => {

      toast(
        "Audio Post খুলতে প্রস্তুত।"
      );

    }
  );


$("liveBtn")
  ?.addEventListener(
    "click",
    () => {

      toast(
        "Live system পরবর্তী ধাপে যুক্ত হবে।"
      );

    }
  );


$("createStoryBtn")
  ?.addEventListener(
    "click",
    () => {

      toast(
        "Story creator পরবর্তী ধাপে যুক্ত হবে।"
      );

    }
  );


// ============================================================
// POST BUTTONS
// ============================================================

document
  .querySelectorAll(".like-btn")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        button.classList.toggle(
          "liked"
        );


        button.textContent =
          button.classList.contains("liked")
            ? "👍 Liked"
            : "👍 Like";

      }
    );

  });


document
  .querySelectorAll(".comment-btn")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        toast(
          "Comment system পরবর্তী ধাপে যুক্ত হবে।"
        );

      }
    );

  });


document
  .querySelectorAll(".share-btn")
  .forEach((button) => {

    button.addEventListener(
      "click",
      async () => {

        if (
          navigator.share
        ) {

          try {

            await navigator.share({
              title: "AYNA BOOK",
              text: "Connect • Share • Create",
              url: window.location.href
            });

          } catch (_) {}

        } else {

          toast(
            "Share অপশন এই browser-এ নেই।"
          );

        }

      }
    );

  });


document
  .querySelectorAll(".save-btn")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        button.textContent =
          "🔖 Saved";

        toast(
          "Post saved."
        );

      }
    );

  });


// ============================================================
// FEED FILTER
// ============================================================

document
  .querySelectorAll(".feed-tab")
  .forEach((tab) => {

    tab.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".feed-tab")
          .forEach((item) => {

            item.classList.remove(
              "active"
            );

          });


        tab.classList.add(
          "active"
        );


        toast(
          `${tab.textContent.trim()} feed selected.`
        );

      }
    );

  });


// ============================================================
// SEARCH
// ============================================================

$("searchBtn")
  ?.addEventListener(
    "click",
    () => {

      const query =
        prompt(
          "AYNA BOOK-এ কী খুঁজবেন?"
        );


      if (
        query &&
        query.trim()
      ) {

        window.location.href =
          `./search.html?q=${encodeURIComponent(query.trim())}`;

      }

    }
  );


// ============================================================
// MORE
// ============================================================

$("moreBtn")
  ?.addEventListener(
    "click",
    () => {

      openDrawer();

    }
  );


// ============================================================
// AI DEMO
// ============================================================

$("aiRunBtn")
  ?.addEventListener(
    "click",
    () => {

      const input =
        $("aiInput")?.value.trim();


      const output =
        $("aiOutput");


      if (!input) {

        output.textContent =
          "আপনার প্রশ্ন লিখুন।";

        return;

      }


      output.textContent =
        "AYNA AI: আপনার অনুরোধ গ্রহণ করা হয়েছে। Real AI service পরবর্তী ধাপে API/AI backend-এর সঙ্গে যুক্ত করা হবে।";

    }
  );


// ============================================================
// KEYBOARD / BACK
// ============================================================

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape"
    ) {

      closeDrawer();

    }

  }
);


// ============================================================
// SERVICE WORKER
// ============================================================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .catch((error) => {

          console.warn(
            "Service Worker:",
            error
          );

        });

    }
  );

}


// ============================================================
// GLOBAL AYNA API
// ============================================================

window.AYNA_BOOK = {

  getCurrentUser() {
    return currentUser;
  },


  getProfile() {
    return currentProfile;
  },


  navigate(page) {
    go(page);
  },


  toast

};


console.log(
  "AYNA BOOK Home loaded."
);