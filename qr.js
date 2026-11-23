
import { app, auth } from "./app.js";

import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const database = getDatabase(app);

const qrBox = document.getElementById("qrcode");
const userName = document.getElementById("userName");
const aynaId = document.getElementById("aynaId");
const profileLink = document.getElementById("profileLink");
const message = document.getElementById("message");

let generatedLink = "";

onAuthStateChanged(auth, async (user) => {
  qrBox.replaceChildren();

  if (!user) {
    message.textContent = "প্রথমে লগইন করুন।";
    return;
  }

  try {
    const snapshot = await get(
      ref(database, "users/" + user.uid)
    );

    if (!snapshot.exists()) {
      message.textContent = "প্রোফাইল পাওয়া যায়নি।";
      return;
    }

    const profile = snapshot.val();

    userName.textContent = profile.fullName || "AYNA USER";
    aynaId.textContent = profile.aynaId || "";

    generatedLink =
      window.location.origin +
      "/profile.html?uid=" +
      encodeURIComponent(user.uid);

    profileLink.textContent = generatedLink;

    if (typeof QRCode === "undefined") {
      message.textContent = "QR Code Library লোড হয়নি।";
      return;
    }

    new QRCode(qrBox, {
      text: generatedLink,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    message.textContent = "আপনার QR Code তৈরি হয়েছে।";

  } catch (error) {
    console.error(error);
    message.textContent = "QR Code তৈরি করা যায়নি।";
  }
});

// Download QR Code
document.getElementById("downloadQR").addEventListener("click", () => {
  const canvas = qrBox.querySelector("canvas");
  const image = qrBox.querySelector("img");

  let dataURL = "";

  if (canvas) {
    dataURL = canvas.toDataURL("image/png");
  } else if (image) {
    dataURL = image.src;
  }

  if (!dataURL) {
    message.textContent = "আগে QR Code তৈরি হতে দিন।";
    return;
  }

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "ayna-book-qr.png";
  link.click();
});

// Copy Profile Link
document.getElementById("copyLink").addEventListener("click", async () => {
  if (!generatedLink) {
    message.textContent = "প্রোফাইল লিংক পাওয়া যায়নি।";
    return;
  }

  try {
    await navigator.clipboard.writeText(generatedLink);
    message.textContent = "প্রোফাইল লিংক কপি হয়েছে।";
  } catch (error) {
    message.textContent = "লিংক কপি করা যায়নি। HTTPS ব্যবহার করুন।";
  }
});
