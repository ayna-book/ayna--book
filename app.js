// AYNA BOOK - app.js WITH 4 ACCOUNT TYPES
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

let auth=null,db=null,storage=null;
try{ firebase.initializeApp(firebaseConfig); auth=firebase.auth(); db=firebase.firestore(); storage=firebase.storage(); }catch(e){}

function getOrCreateID(){
  let id=localStorage.getItem('ayna_id');
  if(!id){ id="AYNA-"+Math.floor(100000+Math.random()*900000); localStorage.setItem('ayna_id',id); }
  return id;
}

const ACCOUNT_TYPES = {
  personal: { label: "👤 ব্যক্তিগত", color: "#00d4ff", price: "ফ্রি" },
  business: { label: "🏢 ব্যবসায়ীক", color: "#ff9a00", price: "৫০০ টাকা" },
  vip: { label: "⭐ VIP", color: "#ff5a8e", price: "১০০০ টাকা" },
  vvip: { label: "👑 VVIP", color: "#ffd700", price: "২০০০ টাকা" }
};

let selectedType = localStorage.getItem('ayna_account_type') || 'personal';

function loadAll(){
  const id=getOrCreateID();
  const idEl=document.getElementById('userID');
  if(idEl){
    const typeInfo = ACCOUNT_TYPES[selectedType];
    idEl.innerHTML = `🆔 ID: ${id} <br> <span style="color:${typeInfo.color}">${typeInfo.label} - ${typeInfo.price}</span>`;
  }
  // পুরনো ডাটা লোড
  const p=JSON.parse(localStorage.getItem('ayna_profile')||'{}');
  if(p.name) document.getElementById('fullName')&&(document.getElementById('fullName').value=p.name);
  if(p.accountType) { selectedType=p.accountType; updateTypeUI(); }
  const pic=localStorage.getItem('ayna_profile_pic');
  if(pic){ const pr=document.getElementById('preview'); if(pr){ pr.src=pic; pr.style.display='block'; } }
}

function updateTypeUI(){
  document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('active'));
  const activeBtn = document.getElementById('type-'+selectedType);
  if(activeBtn) activeBtn.classList.add('active');
  localStorage.setItem('ayna_account_type', selectedType);
  const idEl=document.getElementById('userID');
  if(idEl){
    const t=ACCOUNT_TYPES[selectedType];
    idEl.innerHTML=`🆔 ID: ${getOrCreateID()} <br> <span style="color:${t.color}">${t.label}</span>`;
  }
}

window.selectAccountType = function(type){
  selectedType=type;
  updateTypeUI();
  if(type==='personal') alert("ব্যক্তিগত একাউন্ট ফ্রি");
  if(type==='business') alert("ব্যবসায়ীক একাউন্ট - ব্যবসার তথ্য যোগ করুন");
  if(type==='vip') alert("VIP একাউন্ট - বিশেষ সুবিধা পাবেন");
  if(type==='vvip') alert("VVIP - সর্বোচ্চ সুবিধা");
}

window.handleImageSelect = function(input){
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    localStorage.setItem('ayna_profile_pic', e.target.result);
    const pr=document.getElementById('preview'); if(pr){ pr.src=e.target.result; pr.style.display='block'; }
  };
  reader.readAsDataURL(file);
}

window.saveProfile = async function(){
  const id=getOrCreateID();
  const data={
    id:id,
    accountType:selectedType,
    accountLabel:ACCOUNT_TYPES[selectedType].label,
    name:document.getElementById('fullName')?.value||"",
    email:document.getElementById('gmail')?.value||"",
    phone:document.getElementById('phone')?.value||"",
    city:document.getElementById('city')?.value||"",
    bio:document.getElementById('bio')?.value||"",
    updated:new Date().toISOString()
  };
  localStorage.setItem('ayna_profile', JSON.stringify(data));
  localStorage.setItem('ayna_account_type', selectedType);
  
  if(db && auth?.currentUser){
    try{ await db.collection('users').doc(auth.currentUser.uid).set(data,{merge:true}); alert(`✅ ${data.accountLabel} - ID:${id} অনলাইন সেভ!`); }
    catch(e){ alert(`✅ ${data.accountLabel} - ID:${id} লোকাল সেভ!`); }
  }else{ alert(`✅ ${data.accountLabel} - ID:${id} সেভ হয়েছে!`); }
}

window.logout = async function(){ try{ await auth.signOut(); }catch(e){} alert("লগআউট - ID সংরক্ষিত"); location.href='index.html'; }

document.addEventListener('DOMContentLoaded', ()=>{
  loadAll();
  const fi=document.getElementById('fileInput');
  if(fi) fi.addEventListener('change', function(){ handleImageSelect(this); });
});