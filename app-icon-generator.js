// AYNA BOOK — App Icon Generator (app-icon-generator.js)
function generateAynaAppIcon(size = 512, download = false) {
  const px = Math.max(64, Number(size) || 512);
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");

  const bgGrad = ctx.createLinearGradient(0, 0, px, px);
  bgGrad.addColorStop(0, "#1a3575");
  bgGrad.addColorStop(1, "#050a18");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, px, px);

  ctx.strokeStyle = "#ffe64d";
  ctx.lineWidth = Math.max(6, px * 0.025);
  ctx.strokeRect(px * 0.05, px * 0.05, px * 0.9, px * 0.9);

  ctx.strokeStyle = "#38f2ff";
  ctx.lineWidth = Math.max(3, px * 0.012);
  ctx.beginPath();
  ctx.arc(px * 0.5, px * 0.52, px * 0.30, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#fff6b3";
  ctx.font = `900 ${Math.round(px * 0.14)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AYNA", px * 0.5, px * 0.50);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(px * 0.13)}px Arial, sans-serif`;
  ctx.fillText("★", px * 0.77, px * 0.24);

  const dataUrl = canvas.toDataURL("image/png");

  if (download) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `icon-${px}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return dataUrl;
}

window.generateAynaAppIcon = generateAynaAppIcon;