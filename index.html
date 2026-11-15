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
header{position:fixed;top:0;left:0;right:0;z-index:100;background:#0a1030;padding:16px;display:flex;justify-content:space-between;align-items:center}
body{padding-top:100px;padding-bottom:90px}
.logo{position:relative;display:inline-block;font-size:38px;font-weight:900;color:#FFFFFF}
.star{position:absolute;top:-8px;right:-20px;font-size:10px;color:#FFD700;animation:glow 1.2s infinite}
@keyframes glow{0%{text-shadow:0 0 4px #FFF}50%{text-shadow:0 0 14px #FFF,0 0 26px #FFF,0 0 34px #FFF}100%{text-shadow:0 0 4px #FFF}}
.tag{font-size:13px;opacity:.85}.bell{font-size:24px}
.card{background:#fff;color:#111;margin:14px;border-radius:18px;padding:24px}
h2{font-size:28px}p{font-size:19px;line-height:1.6}label{font-size:18px;font-weight:700}
input{width:100%;padding:18px;border:1px solid #ddd;border-radius:12px;margin:6px 0;font-size:20px}
.wrap{position:relative}.eye{position:absolute;right:12px;top:22px;cursor:pointer;font-size:22px}
button{width:100%;padding:18px;border:0;border-radius:30px;background:#1877F2;color:#fff;font-weight:800;font-size:20px;margin-top:10px}
button:disabled{opacity:.5}.gray{background:#eee;color:#333}.red{background:#ff2e63}
.hidden{display:none}.err{color:#d00;font-size:16px}.ok{color:#0a8a4a;font-size:16px}
nav{position:fixed;bottom:0;left:0;right:0;background:#11163f;display:flex;justify-content:space-around;padding:14px 0}
nav div{text-align:center;font-size:13px;cursor:pointer}
.pimg{width:95px;height:95px;border-radius:50%;object-fit:cover;background:#ddd;display:block;margin:0 auto}
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
<div id="lockMsg" class="err"></div>
</div>

<div id="regPage" class="card hidden">
<h2>Create New Account</h2>
<img id="previewImg" class="pimg">
<label>Profile Photo</label><input type="file" accept="image/*" onchange="previewPhoto(event)">
<label>Full Name</label><input id="regName" placeholder="Full Name">
<label>Gmail</label><input id="regGmail" type="email" placeholder="example@gmail.com">
<label>Phone (11 digits)</label><input id="regPhone" maxlength="11" placeholder="01XXXXXXXXX" oninput="checkReg()">
<label>Password (11 digits)</label><div class="wrap"><input id="regPass" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regPass')">👁️</span></div>
<label>Re-Password</label><div class="wrap"><input id="regRe" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regRe')">👁️</span></div>
<div id="regMsg" class="err"></div>
<button id="regBtn" disabled onclick="doRegister()">Register</button>
<button class="gray" onclick="showPage('loginPage')">Back to Login</button>
</div>

<div id="homePage" class="card hidden">
<img id="homeImg" class="pimg">
<h2 id="welcome">Welcome</h2>
<p id="homeGmail"></p>
<p>✅ Account Opened - AYNA BOOK is Live</p>
<p>News • Live TV • Live Radio • Viral News</p>
<button onclick="doLock()">🔒 Lock App</button>
<button class="red" onclick="doLogout()">Logout</button>
</div>

<div id="lockPage" class="card hidden">
<h2>🔒 App Locked</h2>
<p>Enter Password to Unlock</p>
<div class="wrap"><input id="unlockPass" type="password" maxlength="11"><span class="eye" onclick="toggle('unlockPass')">👁️</span></div>
<button onclick="doUnlock()">Unlock</button>
</div>

<nav><div onclick="goHome()">📰<br>News</div><div onclick="goHome()">📺<br>Live</div><div onclick="goHome()">⭐<br>Viral</div><div>📷<br>QR</div><div onclick="goHome()">⚙️<br>Settings</div></nav>

<script>
const firebaseConfig={databaseURL:"https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app/"};
try{firebase.initializeApp(firebaseConfig)}catch(e){}
let db=null;try{db=firebase.database()}catch(e){}
let photoData="";let currentPhone="";let currentPass="";let wrongTry=0;
function showPage(id){['loginPage','regPage','homePage','lockPage'].forEach(x=>document.getElementById(x).classList.add('hidden'));document.getElementById(id).classList.remove('hidden')}
function goHome(){if(!currentPhone){showPage('loginPage');return}showPage('homePage')}
function toggle(id){let e=document.getElementById(id);e.type=e.type==='password'?'text':'password'}
function previewPhoto(e){let r=new FileReader();r.onload=function(){photoData=r.result;document.getElementById('previewImg').src=photoData};r.readAsDataURL(e.target.files[0])}
function checkLogin(){let p=document.getElementById('loginPhone').value;let w=document.getElementById('loginPass').value;document.getElementById('loginBtn').disabled=!(p.length===11&&w.length===11)}
function checkReg(){let p=document.getElementById('regPhone').value;let w=document.getElementById('regPass').value;let r=document.getElementById('regRe').value;let g=document.getElementById('regGmail').value;let m=document.getElementById('regMsg');if(!g.includes('@')){m.textContent='Please enter valid Gmail';document.getElementById('regBtn').disabled=true;return}if(p.length!==11){m.textContent='Phone must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w.length!==11||r.length!==11){m.textContent='Password must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w!==r){m.textContent='Passwords do not match';document.getElementById('regBtn').disabled=true;return}m.textContent='Passwords matched ✓';m.className='ok';document.getElementById('regBtn').disabled=false}
async function doRegister(){let name=document.getElementById('regName').value||'User';let gmail=document.getElementById('regGmail').value;let phone=document.getElementById('regPhone').value;let pass=document.getElementById('regPass').value;let data={name:name,gmail:gmail,phone:phone,password:pass,photo:photoData,created:Date.now()};try{if(db) await db.ref('users/'+phone).set(data)}catch(e){}localStorage.setItem('ayna_user',JSON.stringify(data));currentPhone=phone;currentPass=pass;document.getElementById('welcome').innerText='Welcome, '+name;document.getElementById('homeGmail').innerText=gmail;if(photoData) document.getElementById('homeImg').src=photoData;showPage('homePage');alert('Account Created - Success')}
async function doLogin(){let phone=document.getElementById('loginPhone').value;let pass=document.getElementById('loginPass').value;if(wrongTry>=3){document.getElementById('lockMsg').innerText='Account Locked - Too many wrong tries';return}let user=null;try{if(db){let s=await db.ref('users/'+phone).get();if(s.exists()) user=s.val()}}catch(e){}if(!user){let l=localStorage.getItem('ayna_user');if(l){let u=JSON.parse(l);if(u.phone===phone) user=u}}if(!user){document.getElementById('loginMsg').innerText='No account found. Please Create New Account.';return}if(user.password!==pass){wrongTry++;document.getElementById('loginMsg').innerText='Wrong Password - Try '+(3-wrongTry)+' left';return}wrongTry=0;currentPhone=phone;currentPass=pass;localStorage.setItem('ayna_user',JSON.stringify(user));document.getElementById('welcome').innerText='Welcome, '+user.name;document.getElementById('homeGmail').innerText=user.gmail||'';if(user.photo) document.getElementById('homeImg').src=user.photo;showPage('homePage')}
function doLogout(){currentPhone="";currentPass="";localStorage.removeItem('ayna_user');showPage('loginPage')}
function doLock(){showPage('lockPage')}
function doUnlock(){if(document.getElementById('unlockPass').value===currentPass){showPage('homePage')}else{alert('Wrong Password')}}
window.onload=function(){let saved=localStorage.getItem('ayna_user');if(saved){let u=JSON.parse(saved);currentPhone=u.phone;currentPass=u.password;document.getElementById('welcome').innerText='Welcome, '+u.name;document.getElementById('homeGmail').innerText=u.gmail||'';if(u.photo) document.getElementById('homeImg').src=u.photo;showPage('homePage')}}
</script>
</body>
</html>