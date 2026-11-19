
/* =========================================================
   AYNA BOOK
   Automatic Update Manager
   ========================================================= */

(() => {
  "use strict";

  const APP_NAME = "AYNA BOOK";
  const SW_PATH = "./sw.js";

  let registration = null;
  let updateBanner = null;

  // Update notification
  function showUpdateBanner() {
    if (updateBanner) return;

    updateBanner = document.createElement("div");

    Object.assign(updateBanner.style, {
      position: "fixed",
      left: "12px",
      right: "12px",
      bottom: "15px",
      zIndex: "999999",
      background: "#1A2233",
      color: "#FFFFFF",
      padding: "18px",
      border: "1px solid #FFD700",
      borderRadius: "14px",
      boxShadow: "0 5px 25px rgba(0,0,0,.5)",
      fontFamily: "Arial, sans-serif",
      textAlign: "center"
    });

    const message = document.createElement("p");

    message.textContent =
      "নতুন AYNA BOOK আপডেট পাওয়া গেছে।";

    const button = document.createElement("button");

    button.textContent = "Update Now";

    Object.assign(button.style, {
      background: "#FFD700",
      color: "#0A0F1E",
      padding: "12px 25px",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      cursor: "pointer"
    });

    button.addEventListener("click", () => {
      button.disabled = true;
      button.textContent = "আপডেট হচ্ছে...";

      if (registration?.waiting) {
        registration.waiting.postMessage({
          type: "SKIP_WAITING"
        });
      } else {
        window.location.reload();
      }
    });

    updateBanner.append(message, button);

    document.body.appendChild(updateBanner);
  }

  // Service Worker controller change
  function listenControllerChange() {
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.location.reload();
      },
      { once: true }
    );
  }

  // Detect new Service Worker
  function monitorUpdate() {
    if (!registration) return;

    if (registration.waiting) {
      showUpdateBanner();
    }

    registration.addEventListener(
      "updatefound",
      () => {
        const newWorker = registration.installing;

        if (!newWorker) return;

        newWorker.addEventListener(
          "statechange",
          () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              showUpdateBanner();
            }
          }
        );
      }
    );
  }

  // Register Service Worker
  async function startUpdateManager() {
    if (!("serviceWorker" in navigator)) {
      console.warn(
        APP_NAME + ": Service Worker supported নয়।"
      );
      return;
    }

    if (location.protocol !== "https:" &&
        location.hostname !== "localhost") {
      console.warn(
        APP_NAME + ": HTTPS প্রয়োজন।"
      );
      return;
    }

    try {
      listenControllerChange();

      registration =
        await navigator.serviceWorker.register(
          SW_PATH
        );

      await registration.update();

      monitorUpdate();

      // প্রতি ৫ মিনিটে আপডেট পরীক্ষা
      window.setInterval(async () => {
        if (!navigator.onLine) return;

        try {
          await registration.update();
        } catch (error) {
          console.warn(
            APP_NAME + " Update Check:",
            error
          );
        }
      }, 5 * 60 * 1000);

      // অ্যাপ আবার চালু হলে আপডেট পরীক্ষা
      document.addEventListener(
        "visibilitychange",
        async () => {
          if (
            document.visibilityState === "visible" &&
            navigator.onLine
          ) {
            try {
              await registration.update();
            } catch (error) {
              console.warn(
                APP_NAME + " Update Check:",
                error
              );
            }
          }
        }
      );

      console.log(
        APP_NAME + " Update Manager Started."
      );

    } catch (error) {
      console.error(
        APP_NAME + " Update Error:",
        error
      );
    }
  }

  window.addEventListener(
    "load",
    startUpdateManager,
    { once: true }
  );

})();
