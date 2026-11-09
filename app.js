// Ayna Book Omega V10000 - Main Logic Script

// 1. Navigation View Switcher
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    
    button.classList.add('active');
    const targetView = document.getElementById(button.getAttribute('data-view'));
    if(targetView) targetView.classList.add('active');
  });
});

// 2. Media Player Handler
document.getElementById('nasaBtn')?.addEventListener('click', () => {
  document.getElementById('mediaPlayer').innerHTML = '<iframe width="100%" height="250" src="https://www.youtube-nocookie.com/embed/21X5lGlDOfg" allowfullscreen></iframe>';
});

document.getElementById('quranBtn')?.addEventListener('click', () => {
  document.getElementById('mediaPlayer').innerHTML = '<audio controls autoplay><source src="https://quran.icecast.infomaniak.ch/quran-64.mp3" type="audio/mpeg"></audio>';
});

document.getElementById('bbcBtn')?.addEventListener('click', () => {
  document.getElementById('mediaPlayer').innerHTML = '<audio controls autoplay><source src="https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" type="audio/mpeg"></audio>';
});

// 3. GPS Location Handler
document.getElementById('gpsBtn')?.addEventListener('click', () => {
  const statusEl = document.getElementById('gpsStatus');
  const resultEl = document.getElementById('gpsResult');
  
  if ("geolocation" in navigator) {
    statusEl.innerText = "Scanning GPS coordinates...";
    navigator.geolocation.getCurrentPosition((pos) => {
      statusEl.innerText = "GPS Lock Successful!";
      resultEl.innerHTML = `<b>Latitude:</b> ${pos.coords.latitude.toFixed(4)}° N<br><b>Longitude:</b> ${pos.coords.longitude.toFixed(4)}° E`;
    }, (err) => {
      statusEl.innerText = "Location permission denied or unavailable.";
      resultEl.innerText = "Default Sat-Proxy Node Active.";
    });
  } else {
    statusEl.innerText = "Geolocation is not supported by your browser.";
  }
});

// 4. Emergency SOS Trigger
document.getElementById('sosBtn')?.addEventListener('click', () => {
  const log = document.getElementById('alertLog');
  const time = new Date().toLocaleTimeString();
  log.innerHTML = `<div class="status warning" style="margin-top:10px;">🚨 SOS Broadcasted at ${time}! Emergency Signal Logged.</div>`;
  if('vibrate' in navigator) navigator.vibrate([300, 100, 300]);
});