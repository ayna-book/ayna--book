<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AYNA BOOK</title>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<style>
*{box-sizing:border-box}body{margin:0;background:#0a1030;color:#fff;font-family:Arial}
header{position:fixed;top:0;left:0;right:0;z-index:100;background:#0a1030;padding:16px;display:flex;justify-content:space-between}
body{padding-top:100px;padding-bottom:90px}
.logo{position:relative;display:inline-block;font-size:38px;font-weight:900;color:#FFFFFF}
.star{position:absolute;top:-6px;right:-16px;font-size:10px;color:#FFFFFF;animation:glow 1.1s infinite}
@keyframes glow{0%{text-shadow:0 0 3px #FFF}50%{text-shadow:0 0 16px #FFF,0 0 30px #FFF,0 0 42px #FFF}100%{text-shadow:0 0 3px #FFF}}
.tag{font-size:13px;opacity:.85}.bell{font-size:24px}
.card{background:#fff;color:#111;margin:14px;border-radius:18px;padding:24px}
h2{font-size:28px}p{font-size:19px;line-height:1.6}label{font-size:18px;font-weight:700}
input{width:100%;padding:18px;border:1px solid #ddd;border-radius:12px;margin:6px 0;font-size:20px}
.wrap{position:relative}.eye{position:absolute;right:12px;top:22px;cursor:pointer;font-size:22px}
button{width:100%;padding:18px;border:0;border-radius:30px;background:#1877F2;color:#fff;font-weight:800;font-size:20px;margin-top:10px}
button:disabled{opacity:.5}.gray{background:#eee;color:#333}.red{background:#ff2e63}
.hidden{display:none}.err{color:#d00}.ok{color:#0a8a4a}
nav{position:fixed;bottom:0;left:0;right:0;background:#11163f;display:flex;justify-content:space-around;padding:14px 0}
nav div{text-align:center;font-size:13px;cursor:pointer}
.pimg{width:95px;height:95px;border-radius:50%;object-fit:cover;background:#ddd;display:block;margin:0 auto}
.idcard{background:#fff;color:#111;overflow:hidden;text-align:center;margin:14px;border-radius:12px;padding-bottom:10px}
/* সোনালী ফ্রেম স্কয়ার, সরু - ছবি বড় */
.photobox{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;border:3px solid #FFD700}
.idphoto{width:100%;height:135%;object-fit:cover;object-position:top center;display:block;transform:translateY(-24%)}
/* WELCOME বাদ - ছবির পরেই নাম */
.fullname{font-size:clamp(19px,5.8vw,26px);font-weight:900;white-space:nowrap;margin:10px 8px 4px;line-height:1.2}
.small{font-size:14px;color:#333;margin:2px 10px;line-height:1.4}
.qrBig{width:105px;height:105px;display:block;margin:8px auto 2px;border:2px solid #FFD700;padding:2px;background:#fff}
.newsbox{background:#fff;color:#111;margin:14px;border-radius:16px;padding:16px}
.badge{background:#ff2e63;color:#fff;padding:4px 8px;border-radius:20px;font-size:12px}
.switch{display:flex;justify-content:space-between;align-items:center;background:#f5f5f5;padding:14px;border-radius:12px;margin:10px 0}
</style>
</head>
<body>
<header><div><div class="logo">AYNA BOOK<span class="star">★</span></div><div class="tag">Moment News • Live TV • Live Radio • No Fake News</div></div><div class="bell">🔔</div></header>
<div id="loginPage" class="card">
<h2>Login</h2>
<label>Phone (11 digits)</label><input id="loginPhone" maxlength="11" placeholder="01XXXXXXXXX" oninput="checkLogin()">
<label>Password (11 digits)</label><div class="wrap"><input id="loginPass" type="password" maxlength="11" oninput="checkLogin()"><span class="eye" onclick="toggle('loginPass')">👁️</span></div>
<div id="loginMsg" class="err"></div>
<button id="loginBtn" disabled onclick="doLogin()">Login</button>
<button class="gray" onclick="showPage('regPage')">Create New Account</button>
</div>
<div id="regPage" class="card hidden">
<h2>Create New Account</h2>
<img id="previewImg" class="pimg">
<label>Cover Photo / Profile Photo</label><input type="file" accept="image/*" onchange="previewPhoto(event)">
<label>Full Name</label><input id="regName" placeholder="Full Name">
<label>Gmail</label><input id="regGmail" type="email" placeholder="example@gmail.com">
<label>Phone (11 digits)</label><input id="regPhone" maxlength="11" placeholder="01XXXXXXXXX" oninput="checkReg()">
<label>Password (11 digits)</label><div class="wrap"><input id="regPass" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regPass')">👁️</span></div>
<label>Re-Password</label><div class="wrap"><input id="regRe" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regRe')">👁️</span></div>
<div id="regMsg" class="err"></div>
<button id="regBtn" disabled onclick="doRegister()">Register</button>
<button class="gray" onclick="showPage('loginPage')">Back to Login</button>
</div>
<div id="homePage" class="hidden">
<div class="idcard">
<div class="photobox"><img id="homeImg" class="idphoto"></div>
<div class="fullname" id="welcome">Mohammed Mahabub Alam</div>
<p class="small" id="regLine">AB:- 2026----10000001</p>
<p class="small" id="homePhone">Phone:- 01400751906</p>
<p class="small" id="homeGmail">Gmail:- mahbub.uk.cox@gmail.com</p>
<p class="small">Ukhiya, Cox's Bazar, Bangladesh</p>
<img id="idQR" class="qrBig">
<p style="font-size:16px;margin:6px 0 0">✅ Account Opened - AYNA BOOK is Live</p>
</div>
<div class="newsbox"><span class="badge">VERIFIED</span><h3>Moment News</h3><p>Every news has source + time. No fake news.</p></div>
<div class="newsbox"><h3>📺 Live TV • 📻 Live Radio</h3><p>Watch Live TV and Listen Live Radio inside app.</p><button onclick="document.getElementById('liveMsg').innerText='Live Player Opening...'">▶ Play Live</button><p id="liveMsg"></p></div>
<div class="newsbox"><h3>⭐ Viral News</h3><p>Verified viral news will show here.</p></div>
<div class="card"><h3>Settings</h3>
<label>New Password</label><div class="wrap"><input id="newPass" type="password" maxlength="11" oninput="checkSet()"><span class="eye" onclick="toggle('newPass')">👁️</span></div>
<label>Re-Password</label><div class="wrap"><input id="newRe" type="password" maxlength="11" oninput="checkSet()"><span class="eye" onclick="toggle('newRe')">👁️</span></div>
<div id="setMsg" class="err"></div><button id="setBtn" disabled onclick="doUpdate()">Update Password</button>
<hr>
<div class="switch"><span>🔒 Lock My Account<br><small>যদি চান তবেই ON করুন</small></span><input type="checkbox" id="lockOpt" style="width:28px;height:28px" onchange="saveLockOpt()"></div>
<button class="gray" onclick="doLockNow()">🔒 Lock Now (Optional)</button>
</div>
<div class="card"><button class="red" onclick="doLogout()">Logout</button></div>
</div>
<div id="lockPage" class="card hidden">
<h2>🔒 Account Locked</h2><p>You locked your account. Enter Password to Unlock.</p>
<div class="wrap"><input id="unlockPass" type="password" maxlength="11" placeholder="11-digit Password"><span class="eye" onclick="toggle('unlockPass')">👁️</span></div>
<div id="unlockMsg" class="err"></div>
<button onclick="doUnlock()">Unlock</button>
<button class="gray" onclick="showPage('loginPage')">Back to Login</button>
</div>
<nav><div onclick="goHome()">📰<br>News</div><div onclick="goHome()">📺<br>Live</div><div onclick="goHome()">⭐<br>Viral</div><div onclick="goHome()">📷<br>QR</div><div onclick="goHome()">⚙️<br>Settings</div></nav>
<script>
const APP_NAME = "AYNA BOOK";
const APP_REG_NO = "2026----10000001";
const APP_REG_CODE = "AYNA-8K-1906";
const APP_WEBSITE = "https://ayna-book.github.io/ayna--book/";
const APP_FIREBASE = "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app/";
const firebaseConfig={databaseURL:APP_FIREBASE};
try{firebase.initializeApp(firebaseConfig)}catch(e){}
let db=null;try{db=firebase.database()}catch(e){}
let photoData="";let currentPhone="";let currentPass="";
function showPage(id){['loginPage','regPage','homePage','lockPage'].forEach(x=>document.getElementById(x).classList.add('hidden'));document.getElementById(id).classList.remove('hidden')}
function goHome(){if(!currentPhone){showPage('loginPage');return}showPage('homePage')}
function toggle(id){let e=document.getElementById(id);e.type=e.type==='password'?'text':'password'}
function previewPhoto(e){let r=new FileReader();r.onload=function(){photoData=r.result;document.getElementById('previewImg').src=photoData};r.readAsDataURL(e.target.files[0])}
function checkLogin(){let p=document.getElementById('loginPhone').value;let w=document.getElementById('loginPass').value;document.getElementById('loginBtn').disabled=!(p.length===11&&w.length===11)}
function checkReg(){let p=document.getElementById('regPhone').value;let w=document.getElementById('regPass').value;let r=document.getElementById('regRe').value;let g=document.getElementById('regGmail').value;let m=document.getElementById('regMsg');if(!g.includes('@')){m.textContent='Please enter valid Gmail';document.getElementById('regBtn').disabled=true;return}if(p.length!==11){m.textContent='Phone must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w.length!==11||r.length!==11){m.textContent='Password must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w!==r){m.textContent='Passwords do not match';document.getElementById('regBtn').disabled=true;return}m.textContent='Passwords matched ✓';m.className='ok';document.getElementById('regBtn').disabled=false}
function checkSet(){let w=document.getElementById('newPass').value;let r=document.getElementById('newRe').value;let m=document.getElementById('setMsg');if(w.length!==11||r.length!==11){m.textContent='Password must be 11 digits';document.getElementById('setBtn').disabled=true;return}if(w!==r){m.textContent='Passwords do not match';document.getElementById('setBtn').disabled=true;return}m.textContent='Passwords matched ✓';m.className='ok';document.getElementById('setBtn').disabled=false}
function updateID(user){document.getElementById('welcome').innerText=user.name;document.getElementById('homeGmail').innerText="Gmail:- "+(user.gmail||'');document.getElementById('homePhone').innerText="Phone:- "+(user.phone||'');document.getElementById('regLine').innerText="AB:- "+APP_REG_NO;if(user.photo) document.getElementById('homeImg').src=user.photo;document.getElementById('idQR').src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="+encodeURIComponent(APP_NAME+" | "+user.name+" | "+user.phone+" | AB:- "+APP_REG_NO+" | "+APP_WEBSITE);document.getElementById('lockOpt').checked=(localStorage.getItem('ayna_lock_opt')==='1')}
function saveLockOpt(){localStorage.setItem('ayna_lock_opt',document.getElementById('lockOpt').checked?'1':'0')}
function doLockNow(){showPage('lockPage')}
async function doRegister(){let name=document.getElementById('regName').value||'User';let gmail=document.getElementById('regGmail').value;let phone=document.getElementById('regPhone').value;let pass=document.getElementById('regPass').value;let data={name:name,gmail:gmail,phone:phone,password:pass,photo:photoData,appName:APP_NAME,appRegNo:APP_REG_NO,appRegCode:APP_REG_CODE,appWebsite:APP_WEBSITE,created:Date.now()};try{if(db) await db.ref('users/'+phone).set(data)}catch(e){}localStorage.setItem('ayna_user',JSON.stringify(data));localStorage.setItem('ayna_lock_opt','0');currentPhone=phone;currentPass=pass;updateID(data);showPage('homePage');alert('Account Created - Success | AB:- '+APP_REG_NO)}
async function doLogin(){let phone=document.getElementById('loginPhone').value;let pass=document.getElementById('loginPass').value;let user=null;try{if(db){let s=await db.ref('users/'+phone).get();if(s.exists()) user=s.val()}}catch(e){}if(!user){let l=localStorage.getItem('ayna_user');if(l){let u=JSON.parse(l);if(u.phone===phone) user=u}}if(!user){document.getElementById('loginMsg').innerText='No account found. Please Create New Account.';return}if(user.password!==pass){document.getElementById('loginMsg').innerText='Wrong Password';return}currentPhone=phone;currentPass=pass;localStorage.setItem('ayna_user',JSON.stringify(user));updateID(user);showPage('homePage')}
async function doUpdate(){let np=document.getElementById('newPass').value;try{if(db) await db.ref('users/'+currentPhone+'/password').set(np)}catch(e){}let u=JSON.parse(localStorage.getItem('ayna_user')||'{}');u.password=np;localStorage.setItem('ayna_user',JSON.stringify(u));currentPass=np;alert('Password Updated - Success')}
function doLogout(){currentPhone="";currentPass="";localStorage.removeItem('ayna_user');showPage('loginPage')}
function doUnlock(){let entered=document.getElementById('unlockPass').value;let saved=localStorage.getItem('ayna_user');let realPass=currentPass;if(saved){try{let u=JSON.parse(saved);realPass=u.password;currentPhone=u.phone;currentPass=u.password}catch(e){}}if(entered!==""&&entered===realPass){showPage('homePage')}else{document.getElementById('unlockMsg').innerText='Wrong Password'}}
window.onload=function(){let saved=localStorage.getItem('ayna_user');if(saved){let u=JSON.parse(saved);currentPhone=u.phone;currentPass=u.password;updateID(u);if(localStorage.getItem('ayna_lock_opt')==='1'){showPage('lockPage')}else{showPage('homePage')}}}
</script>
</body>
</html>