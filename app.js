"use strict";

const $ = (selector) => document.querySelector(selector);

const postForm = $("#postForm");
const postText = $("#postText");
const postsContainer = $("#posts");

let posts = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("aynaBookPosts") || "[]"
  );

  if (Array.isArray(saved)) {
    posts = saved.map((post) => ({
      id: post.id || Date.now() + Math.random(),
      text: String(post.text || ""),
      likes: Number(post.likes) || 0,
      comments: Array.isArray(post.comments)
        ? post.comments
        : [],
      date: post.date || new Date().toLocaleString()
    }));
  }
} catch (error) {
  console.error("পোস্ট লোড করা যায়নি:", error);
}

function savePosts() {
  try {
    localStorage.setItem(
      "aynaBookPosts",
      JSON.stringify(posts)
    );
    return true;
  } catch (error) {
    alert(
      "ডিভাইসে তথ্য সংরক্ষণ করা যায়নি। স্টোরেজ পরীক্ষা করুন।"
    );
    return false;
  }
}

function createButton(label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function renderPosts() {
  if (!postsContainer) return;

  postsContainer.replaceChildren();

  if (posts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent =
      "এখনো কোনো পোস্ট নেই। AYNA BOOK-এ প্রথম পোস্টটি আপনিই করুন!";
    postsContainer.appendChild(empty);
    return;
  }

  [...posts].reverse().forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";

    const heading = document.createElement("h3");
    heading.textContent = "AYNA BOOK পোস্ট";

    const content = document.createElement("p");
    content.textContent = post.text;

    const date = document.createElement("p");
    date.className = "muted";
    date.textContent = post.date;

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const likeButton = createButton(
      `👍 লাইক (${post.likes})`,
      () => {
        post.likes += 1;
        savePosts();
        renderPosts();
      }
    );

    const shareButton = createButton("↗ শেয়ার", async () => {
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

    const commentButton = createButton(
      `💬 মন্তব্য (${post.comments.length})`,
      () => {
        const comment = prompt("আপনার মন্তব্য লিখুন:");

        if (comment === null || !comment.trim()) return;

        post.comments.push({
          text: comment.trim(),
          date: new Date().toLocaleString()
        });

        savePosts();
        renderPosts();
      }
    );

    const deleteButton = createButton("🗑 মুছুন", () => {
      const confirmed = confirm("আপনি কি পোস্টটি মুছতে চান?");

      if (!confirmed) return;

      posts = posts.filter((item) => item.id !== post.id);
      savePosts();
      renderPosts();
    });

    actions.append(
      likeButton,
      commentButton,
      shareButton,
      deleteButton
    );

    article.append(heading, content, date, actions);

    if (post.comments.length > 0) {
      const commentList = document.createElement("div");
      commentList.className = "post-comments";

      const title = document.createElement("h4");
      title.textContent = "মন্তব্যসমূহ";
      commentList.appendChild(title);

      post.comments.forEach((comment) => {
        const item = document.createElement("p");
        item.textContent = "💬 " + comment.text;
        commentList.appendChild(item);
      });

      article.appendChild(commentList);
    }

    postsContainer.appendChild(article);
  });
}

if (postForm && postText) {
  postForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = postText.value.trim();

    if (!text) {
      alert("পোস্ট লেখার ঘরে কিছু লিখুন।");
      return;
    }

    posts.push({
      id: Date.now() + Math.random(),
      text,
      likes: 0,
      comments: [],
      date: new Date().toLocaleString()
    });

    savePosts();
    renderPosts();
    postText.value = "";
  });
}

/* নেভিগেশন */

document.querySelectorAll("[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    const targetScreen = document.getElementById(target);

    if (!targetScreen) {
      console.warn("স্ক্রিন পাওয়া যায়নি:", target);
      return;
    }

    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("hidden", screen !== targetScreen);
    });
  });
});

/* মেনু */

const menuButton = $("#menuButton");
const navigation = $("#navigation");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    navigation.classList.toggle("hidden");
  });
}

/* অনুবাদ: আপাতত ডেমো */

const translateButton = $("#translateButton");

if (translateButton) {
  translateButton.addEventListener("click", () => {
    const message = $("#messageText");
    const result = $("#translationResult");

    if (!message || !result) return;

    if (!message.value.trim()) {
      result.textContent = "আগে একটি মেসেজ লিখুন।";
      return;
    }

    result.textContent =
      "এটি অনুবাদের ডেমো। প্রকৃত AI অনুবাদের জন্য " +
      "নিরাপদ অনুবাদ API বা ব্যাকএন্ড সংযুক্ত করতে হবে।";
  });
}

/* লোকেশন */

const locationButton = $("#locationButton");

if (locationButton) {
  locationButton.addEventListener("click", () => {
    const result = $("#locationResult");

    if (!result) return;

    if (!navigator.geolocation) {
      result.textContent =
        "আপনার ব্রাউজারে লোকেশন সুবিধা পাওয়া যাচ্ছে না।";
      return;
    }

    result.textContent =
      "লোকেশন জানতে আপনার অনুমতি প্রয়োজন হতে পারে।";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        result.textContent =
          "অক্ষাংশ: " +
          position.coords.latitude.toFixed(5) +
          " | দ্রাঘিমাংশ: " +
          position.coords.longitude.toFixed(5);
      },
      () => {
        result.textContent =
          "লোকেশন পাওয়া যায়নি। GPS ও ব্রাউজারের অনুমতি পরীক্ষা করুন।";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/* ছবি, ভিডিও ও অডিও প্রিভিউ */

let currentMediaUrl = null;

const mediaFile = $("#mediaFile");
const mediaPreview = $("#mediaPreview");

if (mediaFile && mediaPreview) {
  mediaFile.addEventListener("change", (event) => {
    const file = event.target.files[0];

    mediaPreview.replaceChildren();

    if (currentMediaUrl) {
      URL.revokeObjectURL(currentMediaUrl);
      currentMediaUrl = null;
    }

    if (!file) return;

    const supported =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/");

    if (!supported) {
      mediaPreview.textContent =
        "একটি ছবি, ভিডিও অথবা অডিও ফাইল নির্বাচন করুন।";
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
      element.playsInline = true;
    } else {
      element = document.createElement("audio");
      element.controls = true;
    }

    element.src = currentMediaUrl;
    element.style.maxWidth = "100%";

    mediaPreview.appendChild(element);
  });
}

/* বর্তমান বছর */

const yearElement = $("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* পোস্ট দেখানো */

renderPosts();

/* PWA Service Worker */

if ("serviceWorker" in navigator &&
    location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((error) => {
        console.error(
          "Service Worker চালু হয়নি:",
          error
        );
      });
  });
}