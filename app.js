

// Firebase লোড হলে
firebase.auth().onAuthStateChanged((user) => {
  authChecked = true;
  const statusText = document.querySelector('p'); // "অ্যাকাউন্ট যাচাই হচ্ছে..." লেখাটা
  
  if (user) {
    // লগইন থাকলে তথ্য দেখাবে
    if(statusText) statusText.textContent = "লগইন করা আছে";
    document.querySelectorAll('input')[0].value = user.displayName || "";
    document.querySelectorAll('input')[1].value = user.email || "";
  } else {
    if(statusText) statusText.textContent = "কোনো অ্যাকাউন্টে লগইন নেই, অনুগ্রহ করে লগইন করুন";
    // Gmail না পেলেও বাকি ফর্ম যাতে কাজ করে
    document.querySelectorAll('input')[1].placeholder = "আপনার Gmail লিখুন";
  }
});

// 5 সেকেন্ডেও যদি Firebase রেসপন্স না দেয়, জোর করে আনলক করবে
setTimeout(() => {
  if (!authChecked) {
    const statusText = document.querySelector('p');
    if(statusText) statusText.textContent = "অফলাইন মোড - আপনি এখনও প্রোফাইল সেভ করতে পারবেন";
    console.log("Firebase timeout - offline mode enabled");
  }
}, 5000);

// লগআউট ও সেভ বাটন যাতে সবসময় কাজ করে
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.querySelector('button'); // প্রোফাইল সংরক্ষণ
  const logoutBtn = document.querySelectorAll('button')[1]; // লগআউট
  
  if(saveBtn) saveBtn.onclick = saveProfile;
  if(logoutBtn) logoutBtn.onclick = logout;
});