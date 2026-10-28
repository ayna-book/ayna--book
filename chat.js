
"use strict";

const contact = document.getElementById("contact");
const messages = document.getElementById("messages");
const form = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const translateButton = document.getElementById("translate");
const translationResult = document.getElementById("translationResult");

function storageKey() {
  return "aynaBookChat_" + contact.value;
}

function loadMessages() {
  messages.replaceChildren();
  let list = [];

  try {
    list = JSON.parse(localStorage.getItem(storageKey()) || "[]");
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }

  if (!list.length) {
    const empty = document.createElement("p");
    empty.textContent = "এখনো কোনো মেসেজ নেই। প্রথম মেসেজটি লিখুন!";
    messages.appendChild(empty);
    return;
  }

  list.forEach(item => {
    const bubble = document.createElement("div");
    bubble.className = "bubble mine";

    const text = document.createElement("p");
    text.textContent = item.text;

    const time = document.createElement("small");
    time.textContent = item.time;

    bubble.append(text, time);
    messages.appendChild(bubble);
  });

  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  let list = [];

  try {
    list = JSON.parse(localStorage.getItem(storageKey()) || "[]");
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }

  list.push({
    text,
    time: new Date().toLocaleString()
  });

  try {
    localStorage.setItem(storageKey(), JSON.stringify(list));
    messageInput.value = "";
    translationResult.textContent = "";
    loadMessages();
  } catch {
    alert("মেসেজ সংরক্ষণ করা যায়নি।");
  }
});

contact.addEventListener("change", loadMessages);

translateButton.addEventListener("click", () => {
  if (!messageInput.value.trim()) {
    translationResult.textContent = "আগে একটি মেসেজ লিখুন।";
    return;
  }

  translationResult.textContent =
    "অনুবাদ API এখনো যুক্ত করা হয়নি। প্রকৃত স্বয়ংক্রিয় অনুবাদের জন্য পরবর্তী ধাপে নিরাপদ অনুবাদ সেবা যুক্ত করতে হবে।";
});

loadMessages();
