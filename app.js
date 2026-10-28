"use strict";

/* =========================================
   AYNA BOOK — Main Application
   Version: 1.1.0
   ========================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

/* =========================================
   1. নিরাপদভাবে স্থানীয় পোস্ট লোড করা
   ========================================= */

const STORAGE_KEY = "aynaBookPosts";

const postForm = $("#postForm");
const postText = $("#postText");
const postsContainer = $("#posts");

let posts = [];

function loadPosts() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved
      .filter((post) => post && typeof post === "object")
      .map((post) => ({
        id: String(post.id || (
          Date.now() + Math.random()
        )),

        text: String(post.text || ""),

        likes: Math.max(
          0,
          Number.isFinite(Number(post.likes))
            ? Number(post.likes)
            : 0
        ),

        comments: Array.isArray(post.comments)
          ? post.comments
              .filter(
                (comment) =>
                  comment &&
                  typeof comment === "object"
              )
              .map((comment) => ({
                text: String(comment.text || ""),
                date: String(
                  comment.date || ""
                )
              }))
          : [],

        date: String(
          post.date || new Date().toLocaleString()
        )
      }));
  } catch (error) {
    console.error("পোস্ট লোড করা যায়নি:", error);
    return [];
  }
}

posts = loadPosts();

function savePosts() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(posts)
    );

    return true;
  } catch (error) {
    console.error("পোস্ট সংরক্ষণ করা যায়নি:", error);

    alert(
      "পোস্ট সংরক্ষণ করা যায়নি। " +
      "আপনার ফোনের স্টোরেজ পরীক্ষা করুন।"
    );

    return false;
  }
}

/* =========================================
   2. বোতাম তৈরি
   ========================================= */

function createButton(label, action, className = "") {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = label;

  if (className) {
    button.className = className;
  }

  button.addEventListener("click", action);

  return button;
}

/* =========================================
   3. পোস্ট দেখানো
   ========================================= */

function renderPosts() {
  if (!postsContainer) return;

  postsContainer.replaceChildren();

  if (posts.length === 0) {
    const empty = document.createElement("p");

    empty.className = "muted";
    empty.textContent =
      "এখনো কোনো পোস্ট নেই। " +
      "AYNA BOOK-এ প্রথম পোস্টটি আপনিই করুন!";

    postsContainer.appendChild(empty);
    return;
  }

  [...posts].reverse().forEach((post) => {
    const article = document.createElement("article");

    article.className = "post";

    const heading = document.createElement("h3");

    heading.textContent = "✨ AYNA BOOK পোস্ট";

    const content = document.createElement("p");

    // textContent ব্যবহার করায় পোস্টের লেখা HTML হিসেবে
    // চালানো হবে না।
    content.textContent = post.text;
    content.style.whiteSpace = "pre-wrap";
    content.style.overflowWrap = "anywhere";

    const date = document.createElement("p");

    date.className = "muted";
    date.textContent = post.date;

    const actions = document.createElement("div");

    actions.className = "post-actions";

    /* লাইক */

    const likeButton = createButton(
      `👍 লাইক (${post.likes})`,
      () => {
        post.likes += 1;

        if (savePosts()) {
          renderPosts();
        }
      }
    );

    /* মন্তব্য */

    const commentButton = createButton(
      `💬 মন্তব্য (${post.comments.length})`,
      () => {
        const comment = prompt(
          "আপনার মন্তব্য লিখুন:"
        );

        if (comment === null) return;

        const cleanComment = comment.trim();

        if (!cleanComment) {
          alert("মন্তব্যের ঘরে কিছু লিখুন।");
          return;
        }

        if (cleanComment.length > 1000) {
          alert(
            "মন্তব্য সর্বোচ্চ ১০০০ অক্ষরের মধ্যে লিখুন।"
          );
          return;
        }

        post.comments.push({
          text: cleanComment,
          date: new Date().toLocaleString()
        });

        if (savePosts()) {
          renderPosts();
        }
      }
    );

    /* শেয়ার */

    const shareButton = createButton(
      "↗ শেয়ার",
      async () => {
        try {
          if (navigator.share) {
            await navigator.share({
              title: "AYNA BOOK",
              text: post.text
            });
          } else if (
            navigator.clipboard &&
            window.isSecureContext
          ) {
            await navigator.clipboard.writeText(
              post.text
            );

            alert("পোস্টের লেখা কপি হয়েছে।");
          } else {
            prompt(
              "পোস্টের লেখা কপি করুন:",
              post.text
            );
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("শেয়ার করা যায়নি:", error);

            alert(
              "শেয়ার করা যায়নি। লেখাটি কপি করে চেষ্টা করুন।"
            );
          }
        }
      }
    );

    /* পোস্ট মুছে ফেলা */

    const deleteButton = createButton(
      "🗑 মুছুন",
      () => {
        const confirmed = confirm(
          "আপনি কি এই পোস্টটি মুছে ফেলতে চান?"
        );

        if (!confirmed) return;

        const previousPosts = posts;

        posts = posts.filter(
          (item) => item.id !== post.id
        );

        if (savePosts()) {
          renderPosts();
        } else {
          posts = previousPosts;
        }
      }
    );

    actions.append(
      likeButton,
      commentButton,
      shareButton,
      deleteButton
    );

    article.append(
      heading,
      content,
      date,
      actions
    );

    /* মন্তব্যের তালিকা */

    if (post.comments.length > 0) {
      const commentList =
        document.createElement("div");

      commentList.className = "post-comments";

      const commentTitle =
        document.createElement("h