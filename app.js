// ==========================================
// AYNA BOOK - app.js Final Full Version
// ID + Online/Offline + 500KB Image Support
// ==========================================

// 1. আপনার Firebase Config এখানে বসান
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_KEY",
  authDomain: "ayna-book-xxxx.firebaseapp.com",
  projectId: "ayna-book-xxxx",
  storageBucket: "ayna-book-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:xxxx"
};

// 2. Firebase চালু
let auth = null, db = null, storage = null;
try {
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  console.log("Firebase Online");
} catch (e) {
  console.log("Offline Mode:", e.message);
}

// 3. ID তৈরি / লোড
function getOrCreateID() {
  let id = localStorage.getItem('ayna_id');
  if (!id) {
    id = "AYNA-" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('ayna_id', id);
  }
  return id;
}

// 4. অ্যাকাউন্ট চেক - আর আটকাবে না
let authChecked = false;
if (auth) {
  auth.onAuthStateChanged((user) => {
    authChecked = true;
    const statusEl = document.getElementById('auth-status');
    const idEl = document.getElementById('userID');
    const id = getOrCreateID();
    
    if (user) {
      if (statusEl) statusEl.innerText = "✅ Online: " + user.email;
      if (idEl) idEl.innerText = "🆔 ID: " + id + " (Online)";
      // Gmail auto fill
      const gmailInput = document.getElementById('gmail');
      if (gmailInput) gmailInput.value = user.email || "";
      
      // Firestore থেকে ডাটা লোড
      if (db) {
        db.collection('users').doc(user.uid).get().then(doc => {
          if (doc.exists) {
            const d = doc.data();
            loadProfileToForm(d);
            if (idEl) idEl.innerText = "🆔 ID: " + d.id + " (Online ✅)";
          }
        });
      }
    } else {
      if (statusEl) statusEl.innerText = "📴 Offline Mode";
      if (idEl) idEl.innerText = "🆔 ID: " + id + " (Offline)";
    }
    loadLocalProfile();
  });
}

// 5. 3 সেকেন্ডে Firebase না এলে অফলাইন আনলক
setTimeout(() => {
  if (!authChecked) {
    const statusEl = document.getElementById('auth-status');
    const idEl = document.getElementById('userID');
    const id = getOrCreateID();
    if (statusEl) statusEl.innerText = "📴 Offline Mode - লোকালে সেভ হবে";
    if (idEl) idEl.innerText = "🆔 ID: " + id + " (Offline)";
    loadLocalProfile();
  }
}, 3000);

function loadProfileToForm(d) {
  if (!d) return;
  document.getElementById('fullName') && (document.getElementById('fullName').value = d.name || "");
  document.getElementById('phone') && (document.getElementById('phone').value = d.phone || "");
  document.getElementById('city') && (document.getElementById('city').value = d.city || "");
  document.getElementById('bio') && (document.getElementById('bio').value = d.bio || "");
}

function loadLocalProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem('ayna_profile') || '{}');
    if (Object.keys(saved).length > 0) loadProfileToForm(saved);
  } catch(e) {}
  
  const pic = localStorage.getItem('ayna_profile_pic');
  if (pic) {
    const preview = document.getElementById('preview');
    if (preview) { preview.src = pic; preview.style.display = 'block'; }
  }
  
  // ID দেখাও
  const idEl = document.getElementById('userID');
  if (idEl) {
    const id = getOrCreateID();
    if (!idEl.innerText.includes('AYNA')) {
      idEl.innerText = "🆔 ID: " + id;
    }
  }
}

// 6. ছবি নির্বাচন - 500KB সাপোর্ট
window.handleImageSelect = function(input) {
  const file = input.files[0];
  if (!file) return;
  
  if (file.size > 600 * 1024) {
    alert("ছবি 600KB এর বেশি! 500KB এর নিচে দিন");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    localStorage.setItem('ayna_profile_pic', e.target.result);
    const preview = document.getElementById('preview');
    if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
    const msg = document.getElementById('storage-msg');
    if (msg) msg.innerText = "✅ ছবি রেডি! " + Math.round(file.size/1024) + "KB";
  };
  reader.readAsDataURL(file);
}

// পুরাতন fileInput এর জন্য
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(){ handleImageSelect(this); });
  }
  loadLocalProfile();
});

// 7. প্রোফাইল সংরক্ষণ - ID সহ - 100% কাজ করবে
window.saveProfile = async function() {
  const id = getOrCreateID();
  const data = {
    id: id,
    name: document.getElementById('fullName')?.value || "Md.Mahabub Alam",
    email: document.getElementById('gmail')?.value || "mahbub.uk.cox@gmail.com",
    phone: document.getElementById('phone')?.value || "01400751906",
    city: document.getElementById('city')?.value || "Cox'sbazar",
    bio: document.getElementById('bio')?.value || "",
    updated: new Date().toISOString()
  };
  
  // লোকালে সেভ
  localStorage.setItem('ayna_profile', JSON.stringify(data));
  localStorage.setItem('ayna_id', id);
  Object.keys(data).forEach(k => {
    if(k !== 'id' && k !== 'updated') localStorage.setItem('ayna_'+k, data[k]);
  });
  
  const idEl = document.getElementById('userID');
  if (idEl) idEl.innerText = "🆔 ID: " + id + " (Saving...)";
  
  // Firebase এ সেভ (যদি থাকে)
  if (auth && auth.currentUser && db) {
    try {
      await db.collection('users').doc(auth.currentUser.uid).set(data, {merge:true});
      
      // ছবি আপলোড
      if (storage && localStorage.getItem('ayna_profile_pic')) {
        try {
          const blob = await (await fetch(localStorage.getItem('ayna_profile_pic'))).blob();
          await storage.ref('profiles/'+auth.currentUser.uid+'.jpg').put(blob);
        } catch(e){ console.log("Image upload skip:", e.message); }
      }
      
      alert("✅ ID: "+id+" অনলাইনে সংরক্ষিত হয়েছে!");
      if (idEl) idEl.innerText = "🆔 ID: " + id + " (Online ✅)";
    } catch(e) {
      alert("✅ ID: "+id+" লোকালে সেভ হয়েছে! (Firebase Rules ঠিক করুন: "+e.message+")");
      if (idEl) idEl.innerText = "🆔 ID: " + id + " (Local ✅)";
    }
  } else {
    alert("✅ ID: "+id+" সফলভাবে সংরক্ষিত! (Offline Mode)");
    if (idEl) idEl.innerText = "🆔 ID: " + id + " (Local ✅)";
  }
  
  // হোমে যাবে
  setTimeout(()=>{ window.location.href='index.html'; }, 800);
}

// 8. লগআউট
window.logout = async function() {
  try{ if(auth) await auth.signOut(); }catch(e){}
  // ID মুছবে না, যাতে আবার লগইন করলে একই ID থাকে
  // পুরো মুছতে চাইলে localStorage.clear() দিন
  localStorage.removeItem('ayna_profile');
  alert("লগআউট সম্পন্ন - ID: " + getOrCreateID() + " সংরক্ষিত আছে");
  window.location.href='index.html';
}

// 9. Gmail লগইন
window.loginWithGmail = function() {
  if (!auth) {
    alert("Firebase Config দিন আগে");
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(()=>{
    alert("Gmail লগইন সফল!");
  }).catch(e => {
    alert("Gmail সমস্যা: "+e.message+"\n\n Firebase > Authorized domains এ aysbd07.github.io যোগ করুন");
  });
}

// 10. হোম পেজে ID দেখানো
window.showProfileOnHome = function(){
  const id = localStorage.getItem('ayna_id');
  const profile = JSON.parse(localStorage.getItem('ayna_profile') || '{}');
  const pic = localStorage.getItem('ayna_profile_pic');
  
  if(document.getElementById('homeID') && id){
    document.getElementById('homeID').innerText = "ID: " + id;
  }
  if(document.getElementById('homeName') && profile.name){
    document.getElementById('homeName').innerText = profile.name;
  }
  if(document.getElementById('homePic') && pic){
    document.getElementById('homePic').src = pic;
  }
}