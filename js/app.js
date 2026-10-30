
import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// AYNA BOOK App
const $ = (id) => document.getElementById(id);

const postForm = $("postForm");
const postText = $("postText");
const postMedia = $("postMedia");
const postsContainer = $("posts");
const statusElement = $("status");

let currentUser = null;
let unsubscribePosts = null;
let submitting = false;

function showStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// Display posts safely
function displayPosts(snapshot) {
  if (!postsContainer) return;

  postsContainer.replaceChildren();

  if (snapshot.empty) {
    const empty = document.createElement("p");
    empty.textContent = "এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!";
    postsContainer.appendChild(empty);
    return;
  }

  snapshot.forEach((documentSnapshot) => {
    const post = documentSnapshot.data();

    const card = document.createElement("article");
    card.className = "post";

    const author = document.createElement("strong");
    author.textContent = post.authorName || "AYNA BOOK User";

    const message = document.createElement("p");
    message.textContent = post.text || "";

    card.append(author, message);

    if (post.mediaUrl && post.mediaType) {
      let mediaElement;

      if (post.mediaType.startsWith("image/")) {
        mediaElement = document.createElement("img");
        mediaElement.alt = "Post image";
      } else if (post.mediaType.startsWith("video/")) {
        mediaElement = document.createElement("video");
        mediaElement.controls = true;
        mediaElement.playsInline = true;
      } else if (post.mediaType.startsWith("audio/")) {
        mediaElement = document.createElement("audio");
        mediaElement.controls = true;
      }

      if (mediaElement) {
        mediaElement.src = post.mediaUrl;
        mediaElement.className = "post-media";
        card.appendChild(mediaElement);
      }
    }

    const date = document.createElement("small");

    date.textContent = post.createdAt?.toDate
      ? post.createdAt.toDate().toLocaleString()
      : "সময় নির্ধারিত হচ্ছে...";

    card.appendChild(date);
    postsContainer.appendChild(card);
  });
}

// Listen for public posts
function listenForPosts() {
  if (unsubscribePosts) {
    unsubscribePosts();
  }

  const postsQuery = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  unsubscribePosts = onSnapshot(
    postsQuery,
    displayPosts,
    (error) => {
      console.error("Post loading error:", error);
      showStatus("পোস্ট লোড হয়নি। Firestore Rules পরীক্ষা করুন।");
    }
  );
}

// Create a new post
if (postForm) {
  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
      showStatus("পোস্ট করতে প্রথমে লগইন করুন।");
      return;
    }

    if (submitting) return;

    const text = postText?.value.trim() || "";
    const file = postMedia?.files?.[0] || null;

    if (!text && !file) {
      showStatus("লেখা অথবা একটি ছবি/ভিডিও/অডিও নির্বাচন করুন।");
      return;
    }

    if (text.length > 5000) {
      showStatus("পোস্ট সর্বোচ্চ ৫০০০ অক্ষরের হতে পারবে।");
      return;
    }

    if (file) {
      const allowedTypes = [
        "image/",
        "video/",
        "audio/"
      ];

      if (!allowedTypes.some((type) => file.type.startsWith(type))) {
        showStatus("শুধু ছবি, ভিডিও অথবা অডিও ফাইল নির্বাচন করুন।");
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        showStatus("মিডিয়া ফাইল সর্বোচ্চ ২০ MB হতে পারবে।");
        return;
      }
    }

    submitting = true;
    const submitButton = postForm.querySelector('[type="submit"]');

    if (submitButton) submitButton.disabled = true;

    showStatus("আপনার পোস্ট প্রকাশ করা হচ্ছে...");

    try {
      let mediaUrl = "";
      let mediaType = "";

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const mediaRef = ref(
          storage,
          `posts/${currentUser.uid}/${Date.now()}_${safeName}`
        );

        await uploadBytes(mediaRef, file);

        mediaUrl = await getDownloadURL(mediaRef);
        mediaType = file.type;
      }

      await addDoc(collection(db, "posts"), {
        text,
        mediaUrl,
        mediaType,
        uid: currentUser.uid,
        authorName: currentUser.displayName || "AYNA BOOK User",
        createdAt: serverTimestamp()
      });

      postForm.reset();
      showStatus("✅ আপনার পোস্ট প্রকাশিত হয়েছে!");

    } catch (error) {
      console.error("Post publishing error:", error);
      showStatus("পোস্ট প্রকাশ হয়নি। Firebase Rules ও ইন্টারনেট পরীক্ষা করুন।");

    } finally {
      submitting = false;
      if (submitButton) submitButton.disabled = false;
    }
  });
}

// Check signed-in user
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    showStatus("AYNA BOOK-এ স্বাগতম!");
    listenForPosts();
  } else {
    if (unsubscribePosts) {
      unsubscribePosts();
      unsubscribePosts = null;
    }

    showStatus("পোস্ট করতে লগইন করুন।");
  }
});
