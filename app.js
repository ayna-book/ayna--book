"use strict";

const $ = (selector) => document.querySelector(selector);

const postForm = $("#postForm");
const postText = $("#postText");
const postsContainer = $("#posts");

let posts = [];

try {
  posts = JSON.parse(localStorage.getItem("aynaBookPosts") || "[]");
  if (!Array.isArray(posts)) posts = [];
} catch {
  posts = [];
}

function savePosts() {
  try {
    localStorage.setItem("aynaBookPosts", JSON.stringify(posts));
  } catch {
    alert("পোস্টটি এই ডিভাইসে সংরক্ষণ করা যায়নি।");
  }
}

function renderPosts() {
  postsContainer.replaceChildren();

  if (posts.length === 0) {
    const message = document.createElement("p");
    message.className = "muted";
    message.textContent = "এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!";
    postsContainer.appendChild(message);
    return;
  }

  [...posts].reverse().forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";

    const text = document.createElement("p");
    text.textContent = post.text;

    const date = document.createElement("p");
    date.className = "muted";
    date.textContent = post.date;

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.textContent = `👍 লাইক (${post.likes})`;

    likeButton.addEventListener("click", () => {
      post.likes += 1;
      savePosts();
      renderPosts();
    });

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.textContent = "↗ শেয়ার";

    shareButton.addEventListener("click", async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: "AYNA BOOK",
            text: post.text
          });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(post.text);
          alert("পোস্টের লেখা কপি হয়েছে।");
        } else {
          alert("এই ব্রাউজারে শেয়ার সুবিধা পাওয়া যাচ্ছে না।");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          alert("শেয়ার করা যায়নি। আবার চেষ্টা করুন।");
        }
      }
    });

    actions.append(likeButton, shareButton);
    article.append(text, date, actions);
    postsContainer.appendChild(article);
  });
}

postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = postText.value.trim();
  if (!text) return;

  posts.push({
    id: Date.now(),
    text,
    likes: 0,
    date: new Date().toLocaleString()
  });

  savePosts();
  renderPosts();
  postText.value = "";
});

document.querySelectorAll("[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;

    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("hidden", screen.id !== target);
    });

    $("#navigation").scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  });
});

$("#menuButton").addEventListener("click", () => {
  $("#navigation").classList.toggle("hidden");
});

$("#translateButton").addEventListener("click", () => {
  const message = $("#messageText").value.trim();
  const result = $("#translationResult");

  if (!message) {
    result.textContent = "আগে একটি মেসেজ লিখুন।";
    return;
  }

  result.textContent =
    "এটি একটি প্রাথমিক ডেমো। প্রকৃত AI অনুবাদের জন্য অনুবাদ API সংযুক্ত করতে হবে।";
});

$("#locationButton").addEventListener("click", () => {
  const result = $("#locationResult");

  if (!("geolocation" in navigator)) {
    result.textContent = "আপনার ব্রাউজারে GPS/লোকেশন সুবিধা পাওয়া যাচ্ছে না।";
    return;
  }

  result.textContent = "লোকেশন খোঁজা হচ্ছে...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      result.textContent =
        `অক্ষাংশ: ${position.coords.latitude.toFixed(5)}, ` +
        `দ্রাঘিমাংশ: ${position.coords.longitude.toFixed(5)}`;
    },
    () => {
      result.textContent =
        "লোকেশন পাওয়া যায়নি। অনুমতি, GPS এবং নিরাপদ HTTPS সংযোগ পরীক্ষা করুন।";
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
});

let currentMediaUrl = null;

$("#mediaFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const preview = $("#mediaPreview");

  preview.replaceChildren();

  if (currentMediaUrl) {
    URL.revokeObjectURL(currentMediaUrl);
    currentMediaUrl = null;
  }

  if (!file) return;

  if (!file.type.startsWith("image/") &&
      !file.type.startsWith("video/") &&
      !file.type.startsWith("audio/")) {
    preview.textContent = "অনুগ্রহ করে একটি ছবি, ভিডিও বা অডিও ফাইল নির্বাচন করুন।";
    return;
  }

  currentMediaUrl = URL.createObjectURL(file);

  let element;

  if (file.type.startsWith("image/")) {
    element = document.createElement("img");
    element.alt = "নির্বাচিত ছবির প্রিভিউ";
  } else if (file.type.startsWith("video/")) {
    element = document.createElement("video");
    element.controls = true;
  } else {
    element = document.createElement("audio");
    element.controls = true;
  }

  element.src = currentMediaUrl;
  preview.appendChild(element);
});

$("#year").textContent = new Date().getFullYear();

renderPosts();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.error("Service worker চালু হয়নি:", error);
    });
  });
}