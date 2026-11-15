<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AYNA BOOK</title>
<style>
*{box-sizing:border-box} body{margin:0;background:#0a1030;color:#fff;font-family:Arial,sans-serif}
header{padding:16px;display:flex;justify-content:space-between;align-items:center;background:#0a1030}
.logo{font-size:32px;font-weight:900;letter-spacing:-1px;color:#FFFFFF;position:relative}
.logo span{position:relative}
.star{position:absolute;top:-4px;right:-16px;font-size:10px;color:#FFD700;text-shadow:0 0 8px #FFFFFF,0 0 16px #FFFFFF,0 0 24px #FFFFFF}
.tag{font-size:12px;opacity:.8}
.bell{font-size:22px}
.card{background:#fff;color:#111;margin:14px;border-radius:18px;padding:16px}
input{width:100%;padding:13px;border:1px solid #ddd;border-radius:12px;margin:6px 0;font-size:16px}
.wrap{position:relative} .eye{position:absolute;right:12px;top:18px;cursor:pointer}
button{width:100%;padding:14px;border:0;border-radius:30px;background:#1877F2;color:#fff;font-weight:800;font-size:16px;margin-top:10px;cursor:pointer}
button:disabled{opacity:.5} .gray{background:#eee;color:#333}
nav{position:fixed;bottom:0;left:0;right:0;background:#11163f;display:flex;justify-content:space-around;padding:12px 0}
nav div{text-align:center;font-size:12px} .err{color:#d00;font-size:13px} .ok{color:#0a8a4a;font-size:13px}
.hidden{display:none} .news{background:#fff;color:#111;margin:12px;border-radius:16px;padding:14px}
.badge{background:#ff2e63;color:#fff;padding:4px 8px;border-radius:20px;font-size:11px}
</style>
</head>
<body>
<header>
<div><div class="logo">AYNA BOOK<span class="star">★</span></div><div class="tag">Moment News • Live TV • Live Radio • Viral News • No Fake News</div></div>
<div class="bell">🔔</div>
</header>

<div id="loginPage" class="card">
<h2>Choose a profile to continue</h2>
<p>No account yet — create one below.</p>
<label>Phone Number (11 digits)</label>
<div class="wrap"><input id="loginPhone" maxlength="11" placeholder="01XXXXXXXXX" oninput="checkLogin()"></div>
<label>Password (11 digits)</label>
<div class="wrap"><input id="loginPass" type="password" maxlength="11" placeholder="11-digit password" oninput="checkLogin()"><span class="eye" onclick="toggle('loginPass')">👁️</span></div>
<div id="loginMsg" class="err"></div>
<button id="loginBtn" disabled onclick="login()">Login</button>
<button class="gray" onclick="show('regPage')">Create New Account</button>
<button class="gray" onclick="show('regPage')">Use Another Profile</button>
</div>

<div id="regPage" class="card hidden">
<h2>Create New Account</h2>
<label>Full Name</label><input id="regName" placeholder="Full Name">
<label>Phone Number (11 digits)</label><input id="regPhone" maxlength="11" placeholder="01XXXXXXXXX" oninput="checkReg()">
<label>Password (11 digits)</label>
<div class="wrap"><input id="regPass" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regPass')">👁️</span></div>
<label>Re-Password</label>
<div class="wrap"><input id="regRe" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regRe')">👁️</span></div>
<div id="regMsg" class="err"></div>
<button id="regBtn" disabled onclick="register()">Register</button>
<button class="gray" onclick="show('loginPage')">Back to Login</button>
</div>

<div id="homePage" class="hidden">
<div class="news"><span class="badge">VERIFIED</span><h3>AYNA BOOK - No Fake News</h3><p>Every news has source + time. No false news will be published.</p><small>Source: AYNA BOOK • Just now</small></div>
<div class="news"><h3>Live TV • Live Radio</h3><p>Watch Live TV and Listen Live Radio inside the app.</p><button>▶ Play Live</button></div>
<div class="card"><h3>Account Settings</h3>
<label>New Password</label><div class="wrap"><input id="newPass" type="password" maxlength="11" oninput="checkSettings()"><span class="eye" onclick="toggle('newPass')">👁️</span></div>
<label>Re-Password</label><div class="wrap"><input id="newRe" type="password" maxlength="11" oninput="checkSettings()"><span class="eye" onclick="toggle('newRe')">👁️</span></div>
<div id="setMsg" class="err"></div><button id="setBtn" disabled>Update Password</button>
</div>
</div>

<nav><div>📰<br>News</div><div>📺<br>Live</div><div>⭐<br>Viral News</div><div>📷<br>QR</div><div>⚙️<br>Settings</div></nav>

<script>
function show(id){['loginPage','regPage','homePage'].forEach(x=>document.getElementById(x).classList.add('hidden'));document.getElementById(id).classList.remove('hidden')}
function toggle(id){let e=document.getElementById(id);e.type=e.type==='password'?'text':'password'}
function checkLogin(){let p=document.getElementById('loginPhone').value,w=document.getElementById('loginPass').value;let m=document.getElementById('loginMsg');if(p.length!==11){m.textContent='Phone must be 11 digits';document.getElementById('loginBtn').disabled=true;return}if(w.length!==11){m.textContent='Password must be 11 digits';document.getElementById('loginBtn').disabled=true;return}m.textContent='';document.getElementById('loginBtn').disabled=false}
function checkReg(){let p=document.getElementById('regPhone').value,w=document.getElementById('regPass').value,r=document.getElementById('regRe').value;let m=document.getElementById('regMsg');if(p.length!==11){m.textContent='Phone must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w.length!==11||r.length!==11){m.textContent='Password must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w!==r){m.textContent='Passwords do not match';document.getElementById('regBtn').disabled=true;return}m.textContent='Passwords matched ✓';m.className='ok';document.getElementById('regBtn').disabled=false}
function checkSettings(){let w=document.getElementById('newPass').value,r=document.getElementById('newRe').value;let m=document.getElementById('setMsg');if(w.length!==11||r.length!==11){m.textContent='Password must be 11 digits';document.getElementById('setBtn').disabled=true;return}if(w!==r){m.textContent='Passwords do not match';document.getElementById('setBtn').disabled=true;return}m.textContent='Passwords matched ✓';m.className='ok';document.getElementById('setBtn').disabled=false}
function login(){show('homePage')} function register(){show('homePage')}
</script>
</body>
</html>