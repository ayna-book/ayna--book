// =====================================================================
// AYNA BOOK — MEDIA COMPRESSION & RESUMABLE UPLOAD (ayna-media-optimizer.js)
// =====================================================================

export async function compressImageIfLarge(file, maxWidth = 1440, quality = 0.82) {
  if (!file || !file.type.startsWith("image/") || file.size < 1.5 * 1024 * 1024) {
    return file;
  }

  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        blob => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: blob.type || "image/jpeg",
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export function uploadWithProgress(storage, storagePath, file, onProgress) {
  return import("https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js").then(
    ({ ref, uploadBytesResumable, getDownloadURL }) =>
      new Promise((resolve, reject) => {
        const fileRef = ref(storage, storagePath);
        const task = uploadBytesResumable(fileRef, file, {
          contentType: file.type || "application/octet-stream"
        });

        task.on(
          "state_changed",
          snap => {
            const pct = snap.totalBytes
              ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              : 0;
            if (typeof onProgress === "function") {
              onProgress(pct, snap.bytesTransferred, snap.totalBytes);
            }
          },
          err => reject(err),
          async () => {
            const downloadUrl = await getDownloadURL(task.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      })
  );
}