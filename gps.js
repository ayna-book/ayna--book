const latitude =
  document.getElementById("latitude");

const longitude =
  document.getElementById("longitude");

const accuracy =
  document.getElementById("accuracy");

const altitude =
  document.getElementById("altitude");

const speed =
  document.getElementById("speed");

const gpsStatus =
  document.getElementById("gpsStatus");


function success(position) {

  const coords =
    position.coords;


  latitude.textContent =
    coords.latitude.toFixed(6);

  longitude.textContent =
    coords.longitude.toFixed(6);


  accuracy.textContent =
    `${Math.round(
      coords.accuracy
    )} m`;


  if (
    coords.altitude !== null
  ) {

    altitude.textContent =
      `${Math.round(
        coords.altitude
      )} m`;

  } else {

    altitude.textContent =
      "N/A";

  }


  if (
    coords.speed !== null
  ) {

    speed.textContent =
      `${(
        coords.speed * 3.6
      ).toFixed(1)} km/h`;

  } else {

    speed.textContent =
      "0 km/h";

  }


  gpsStatus.textContent =
    "GPS Active";

}


function error(err) {

  console.error(err);

  gpsStatus.textContent =
    "GPS permission/location unavailable";

}


function startGPS() {

  if (
    !navigator.geolocation
  ) {

    gpsStatus.textContent =
      "GPS supported নয়";

    return;

  }


  gpsStatus.textContent =
    "Searching GPS...";


  navigator.geolocation.watchPosition(
    success,
    error,
    {
      enableHighAccuracy: true,
      maximumAge: 2000,
      timeout: 15000
    }
  );

}


const gpsButton =
  document.getElementById(
    "startGPS"
  );


if (gpsButton) {

  gpsButton.addEventListener(
    "click",
    startGPS
  );

} else {

  startGPS();

}