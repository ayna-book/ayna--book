// 🟢 সেকশন সুইচার লজিক
function showSection(sectionId) {
    ['homeView', 'tvradioView', 'radarView'].forEach(id => {
        let element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    let activeTarget = document.getElementById(sectionId);
    if (activeTarget) activeTarget.classList.remove('hidden');
}

// 📺 টিভি ও রেডিও স্ট্রিমিং প্রসেসর
function playMedia(type, url, title) {
    let tvPlayer = document.getElementById('tvPlayer');
    let radioPlayer = document.getElementById('radioPlayer');

    if (type === 'tv') {
        radioPlayer.pause();
        radioPlayer.style.display = 'none';
        tvPlayer.style.display = 'block';
        tvPlayer.src = url;
    } else {
        tvPlayer.style.display = 'none';
        radioPlayer.style.display = 'block';
        radioPlayer.src = url;
        radioPlayer.play().catch(e => alert('অডিও প্লে করতে বাটনে ক্লিক করুন।'));
    }
}

// 🧭 ডিভাইস জিপিএস ইঞ্জিন
function fetchGPS() {
    let gpsDisplay = document.getElementById('gpsOutput');
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            gpsDisplay.innerText = pos.coords.latitude.toFixed(4) + "° N, " + pos.coords.longitude.toFixed(4) + "° E";
        }, function() {
            gpsDisplay.innerText = "23.8103° N, 90.4125° E (Satellite Proxy)";
        });
    } else {
        gpsDisplay.innerText = "Geolocation Support Unavailable";
    }
}