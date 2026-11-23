const compass =
  document.getElementById("compass");

const degreeText =
  document.getElementById("degree");

function updateCompass(event) {

  let heading;

  if (
    typeof event.webkitCompassHeading ===
    "number"
  ) {

    heading =
      event.webkitCompassHeading;

  } else if (
    typeof event.alpha ===
    "number"
  ) {

    heading =
      360 - event.alpha;

  } else {

    return;

  }


  heading =
    (heading + 360) % 360;


  compass.style.transform =
    `rotate(${-heading}deg)`;


  degreeText.textContent =
    `${Math.round(heading)}°`;

}


async function startCompass() {

  if (
    typeof DeviceOrientationEvent !==
    "undefined" &&
    typeof DeviceOrientationEvent
      .requestPermission ===
      "function"
  ) {

    try {

      const permission =
        await DeviceOrientationEvent
          .requestPermission();

      if (
        permission !==
        "granted"
      ) {

        alert(
          "Compass permission দেওয়া হয়নি।"
        );

        return;

      }

    } catch (error) {

      console.error(error);

      return;

    }

  }


  window.addEventListener(
    "deviceorientation",
    updateCompass,
    true
  );

}


const startButton =
  document.getElementById(
    "startCompass"
  );


if (startButton) {

  startButton.addEventListener(
    "click",
    startCompass
  );

} else {

  startCompass();

}