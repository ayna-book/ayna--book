// AYNA BOOK — Instant Gold/Navy/Star App Icon Generator (pwa-icon-maker.js)
function generateAynaAppIcon(size = 512, downloadPng = false) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // নেভি ব্যাকগ্রাউন্ড
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#1a3575");
  grad.addColorStop(1, "#050a18");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // গোল্ড বর্ডার ও সায়ান রিং
  ctx.strokeStyle = "#ffe64d";
  ctx.lineWidth = Math.max(8, size * 0.03);
  ctx.strokeRect(size * 0.05, size * 0.05, size * 0.9, size * 0.9);

  ctx.strokeStyle = "#38f2ff";
  ctx.lineWidth = Math.max(4, size * 0.012);
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.52, size * 0.31, 0, Math.PI * 2);
  ctx.stroke();

  // কেন্দ্রের টেক্সট ও সাদা তারা
  ctx.fillStyle = "#fff6b3";
  ctx.font = `900 ${Math.round(size * 0.14)}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AYNA", size * 0.5, size * 0.50);

  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.round(size * 0.13)}px Arial, sans-serif`;
  ctx.fillText("★", size * 0.77, size * 0.25);

  const dataUrl = canvas.toDataURL("image/png");

  if (downloadPng) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `icon-${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return dataUrl;
}

window.generateAynaAppIcon = generateAynaAppIcon;