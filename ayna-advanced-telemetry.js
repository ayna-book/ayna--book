// =====================================================================
// AYNA BOOK — ADVANCED PRESENCE, VIDEO THUMB & SHARE (ayna-advanced-telemetry.js)
// =====================================================================

export function subscribeUserPresence(database, uid, onStatusChange) {
  if (!database || !uid) return () => {};

  let cleanup = () => {};
  import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js").then(
    ({ ref, set, onValue, onDisconnect, serverTimestamp }) => {
      const connectedRef = ref(database, ".info/connected");
      const presenceRef = ref(database, `presence/${uid}`);

      const unsub = onValue(connectedRef, snap => {
        if (snap.val() === true) {
          onDisconnect(presenceRef).set({
            online: false,
            lastSeen: serverTimestamp()
          });
          set(presenceRef, {
            online: true,
            lastSeen: serverTimestamp()
          });
          if (typeof onStatusChange === "function") onStatusChange(true);
        } else if (typeof onStatusChange === "function") {
          onStatusChange(false);
        }
      });

      cleanup = () => {
        if (typeof unsub === "function") unsub();
      };
    }
  );

  return () => cleanup();
}

export function extractVideoThumbnail(videoFile, seekSecond = 1) {
  return new Promise(resolve => {
    if (!videoFile || !videoFile.type?.startsWith("video/")) {
      resolve("");
      return;
    }

    const video = document.createElement("video");
    const url = URL.createObjectURL(videoFile);
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const finish = dataUrl => {
      URL.revokeObjectURL(url);
      resolve(dataUrl || "");
    };

    video.onloadedmetadata = () => {
      const targetTime = Math.min(seekSecond, Math.max(0.1, (video.duration || 1) * 0.1));
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(640, video.videoWidth || 640);
        canvas.height = Math.round(
          (canvas.width / Math.max(1, video.videoWidth || 640)) * (video.videoHeight || 360)
        );
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.75));
      } catch {
        finish("");
      }
    };

    video.onerror = () => finish("");
  });
}

export async function smartShareOrCopy({ title = "AYNA BOOK", text = "", url = "" }) {
  const shareUrl = url || window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return { ok: true, method: "share" };
    } catch (err) {
      if (err?.name === "AbortError") {
        return { ok: false, method: "cancelled" };
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareUrl);
    return { ok: true, method: "clipboard" };
  }

  return { ok: false, method: "unsupported" };
}