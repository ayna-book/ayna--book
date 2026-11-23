const canvas = document.getElementById("radarCanvas");
const ctx = canvas.getContext("2d");

let angle = 0;
let targets = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createTargets() {
  targets = [];

  for (let i = 0; i < 8; i++) {
    targets.push({
      angle: Math.random() * Math.PI * 2,
      distance: 0.15 + Math.random() * 0.75
    });
  }
}

createTargets();

function drawRadar() {

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius =
    Math.min(canvas.width, canvas.height) * 0.38;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#020b08";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.strokeStyle = "#21d879";
  ctx.lineWidth = 2;

  for (let i = 1; i <= 4; i++) {

    ctx.beginPath();

    ctx.arc(
      cx,
      cy,
      radius * i / 4,
      0,
      Math.PI * 2
    );

    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cx - radius, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.moveTo(cx, cy - radius);
  ctx.lineTo(cx, cy + radius);
  ctx.stroke();

  const x =
    cx + Math.cos(angle) * radius;

  const y =
    cy + Math.sin(angle) * radius;

  const gradient =
    ctx.createLinearGradient(
      cx,
      cy,
      x,
      y
    );

  gradient.addColorStop(0, "rgba(33,216,121,.45)");
  gradient.addColorStop(1, "rgba(33,216,121,0)");

  ctx.strokeStyle = gradient;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x, y);
  ctx.stroke();

  targets.forEach(target => {

    const tx =
      cx +
      Math.cos(target.angle) *
      radius *
      target.distance;

    const ty =
      cy +
      Math.sin(target.angle) *
      radius *
      target.distance;

    const difference =
      Math.abs(
        Math.atan2(
          Math.sin(angle - target.angle),
          Math.cos(angle - target.angle)
        )
      );

    if (difference < 0.12) {

      ctx.fillStyle = "#ff4040";

      ctx.beginPath();

      ctx.arc(
        tx,
        ty,
        5,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

  });

  angle += 0.025;

  requestAnimationFrame(drawRadar);
}

drawRadar();