// AYNA BOOK - Final Fixed Version - Offline First
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase চালু করার চেষ্টা, না হলে অফলাইন মোড
let db = null, auth = null, storage = null;
try {
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
} catch(e) {
  console.log("Offline mode:", e.message);
}

// ===== অ্যাকাউন্ট যাচাই - আটকে থাকবে না =====
let authChecked = false;
if (auth) {
  auth.onAuthStateChanged((user) => {
    authChecked = true;
    const statusEl = document.getElementById('auth-status');
    if (user) {
      if(statusEl) statusEl.innerText = "✅ লগইন করা আছে: " + user.email;
      document.getElementById('fullName') && (document.getElementById('fullName').value = user.displayName || localStorage.getItem('ayna_name') || "");
      document.getElementById('gmail') && (document.getElementById('gmail').value = user.email || "");
    } else {
      if(statusEl) statusEl.innerText = "⚠️ লগইন নেই - অফলাইন মোডে তথ্য সেভ হবে";
    }
    loadLocalProfile();
  });
}

// 4 সেকেন্ডে Firebase না এলে অফলাইন আনলক
setTimeout(() => {
  if (!authChecked) {
    const statusEl = document.getElementById('auth-status');
    if(statusEl) statusEl.innerText = "📴 অফলাইন মোড - প্রোফাইল লোকালে সেভ হবে";
    loadLocalProfile();
  }
}, 4000);

function loadLocalProfile(){
  document.getElementById('fullName')?.value && (document.getElementById('fullName').value = localStorage.getItem('ayna_name') || document.getElementById('fullName').value);
  document.getElementById('phone') && (document.getElementById('phone').value = localStorage.getItem('ayna_phone') || "");
  document.getElementById('city') && (document.getElementById('city').value = localStorage.getItem('ayna_city') || "");
  document.getElementById('bio') && (document.getElementById('bio').value = localStorage.getItem('ayna_bio') || "");
  const pic = localStorage.getItem('ayna_profile_pic');
  if(pic){
    const preview = document.getElementById('preview');
    if(preview){ preview.src = pic; preview.style.display = 'block'; }
  }
}

// ===== ছবি নির্বাচন =====
window.handleImageSelect = function(input){
  const file = input.files[0];
  if(!file) return;
  if(file.size > 200*1024){
    alert("ছবি ২০০KB এর বেশি! আমি যে ১৫০KB বানিয়ে দিয়েছি সেটা ব্যবহার করুন।");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    localStorage.setItem('ayna_profile_pic', e.target.result);
    const preview = document.getElementById('preview');
    if(preview){ preview.src = e.target.result; preview.style.display = 'block'; }
    document.getElementById('storage-msg').innerText = "✅ ছবি রেডি! এখন প্রোফাইল সংরক্ষণ করুন";
  };
  reader.readAsDataURL(file);
}

// ===== প্রোফাইল সংরক্ষণ - ১০০% কাজ করবে =====
window.saveProfile = async function(){
  const data = {
    name: document.getElementById('fullName')?.value || "",
    email: document.getElementById('gmail')?.value || "",
    phone: document.getElementById('phone')?.value || "",
    city: document.getElementById('city')?.value || "",
    bio: document.getElementById('bio')?.value || "",
    pic: localStorage.getItem('ayna_profile_pic') || "",
    updated: new Date().toISOString()
  };
  
  // 1. লোকালে সেভ (সবসময় হবে)
  localStorage.setItem('ayna_name', data.name);
  localStorage.setItem('ayna_phone', data.phone);
  localStorage.setItem('ayna_city', data.city);
  localStorage.setItem('ayna_bio', data.bio);
  localStorage.setItem('ayna_profile', JSON.stringify(data));

  // 2. Firebase এ চেষ্টা (থাকলে)
  if (auth && auth.currentUser && db) {
    try {
      await db.collection('users').doc(auth.currentUser.uid).set(data, {merge:true});
      alert("✅ প্রোফাইল Firebase ও লোকালে সংরক্ষিত হয়েছে!");
    } catch(e){
      alert("✅ প্রোফাইল লোকালে সংরক্ষিত হয়েছে! (Firebase: "+e.message+")");
    }
  } else {
    alert("✅ প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে! (অফলাইন মোড)");
  }
  window.location.href = 'index.html';
}

// ===== লগআউট - ১০০% কাজ করবে =====
window.logout = async function(){
  try{ if(auth) await auth.signOut(); }catch(e){}
  // লোকাল ডাটা ক্লিয়ার না করে শুধু লগইন ফ্ল্যাগ মুছবে, চাইলে clear() দিন
  localStorage.removeItem('ayna_profile');
  alert("লগআউট সম্পন্ন");
  window.location.href = 'index.html';
}

// ===== Gmail লগইন =====
window.loginWithGmail = function(){
  if(!auth){
    alert("Firebase চালু নেই, Email ফিল্ডে সরাসরি Gmail লিখে সেভ করুন");
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => alert("Gmail লগইন সমস্যা: "+e.message+" \n\n Firebase > Authorized domains এ aysbd07.github.io যোগ করুন"));
}