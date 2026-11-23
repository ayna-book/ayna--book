
const militaryStatus = document.querySelector(".panel");

const demoTargets = [
  { id: "DEMO 01", x: 68, y: 32 },
  { id: "DEMO 02", x: 30, y: 62 },
  { id: "DEMO 03", x: 54, y: 78 }
];

const radarScreen = document.querySelector(".radar");

function createDemoTargets() {
  if (!radarScreen) return;

  radarScreen.querySelectorAll(".dot").forEach(dot => dot.remove());

  demoTargets.forEach(target => {
    const dot = document.createElement("div");

    dot.className = "dot";
    dot.style.left = target.x + "%";
    dot.style.top = target.y + "%";
    dot.title = target.id;

    radarScreen.appendChild(dot);
  });
}

function updateMilitaryStatus() {
  if (!militaryStatus) return;

  militaryStatus.innerHTML = `
    <div>SIMULATION / DEMO ONLY</div>
    <div>CONTACTS: ${demoTargets.length} (SIMULATED)</div>
    <div>STATUS: SYSTEM ACTIVE</div>
  `;
}

function startMilitaryRadar() {
  createDemoTargets();
  updateMilitaryStatus();
}

function stopMilitaryRadar() {
  if (radarScreen) {
    radarScreen.querySelectorAll(".dot").forEach(dot => dot.remove());
  }

  if (militaryStatus) {
    militaryStatus.textContent = "RADAR STOPPED";
  }
}

startMilitaryRadar();
