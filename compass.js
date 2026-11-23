
const compassNeedle = document.getElementById("needle");
const compassHeading = document.getElementById("heading");

let compassActive = false;

async function startCompass() {
  if (compassActive) return;

  try {
    if (!window.isSecureContext) {
      throw new Error("HTTPS প্রয়োজন");
    }

    if (typeof DeviceOrientationEvent === "undefined") {
      throw new Error("ফোনে Compass Sensor পাওয়া যায়নি");
    }

    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission =
        await DeviceOrientationEvent.requestPermission();

      if (permission !== "granted") {
        throw new Error("Sensor permission denied");
      }
    }

    window.addEventListener("deviceorientation", handleCompass);

    compassActive = true;
    compassHeading.textContent = "Compass চালু হয়েছে";

  } catch (error) {
    compassHeading.textContent = error.message;
  }
}

function handleCompass(event) {
  let angle;

  if (typeof event.webkitCompassHeading === "number") {
    angle = event.webkitCompassHeading;
  } else if (event.alpha !== null) {
    angle = (360 - event.alpha) % 360;
  } else {
    compassHeading.textContent = "Compass data পাওয়া যায়নি";
    return;
  }

  compassNeedle.style.transform =
    `translate(-50%, -50%) rotate(${angle}deg)`;

  compassHeading.textContent =
    "Direction: " + Math.round(angle) + "°";
}

function stopCompass() {
  window.removeEventListener("deviceorientation", handleCompass);
  compassActive = false;
  compassHeading.textContent = "Compass বন্ধ";
}
