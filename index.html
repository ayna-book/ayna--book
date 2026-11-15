<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AYNA BOOK</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#0a1030;color:#fff;font-family:Arial}
header{padding:16px;display:flex;justify-content:space-between}
.logo{font-size:32px;font-weight:900;color:#FFF;position:relative}
.star{position:absolute;top:-4px;right:-16px;font-size:10px;color:#FFD700;text-shadow:0 0 8px #FFF,0 0 16px #FFF}
.card{background:#fff;color:#111;margin:14px;border-radius:18px;padding:16px}
input{width:100%;padding:13px;border:1px solid #ddd;border-radius:12px;margin:6px 0}
.wrap{position:relative}.eye{position:absolute;right:12px;top:18px;cursor:pointer}
button{width:100%;padding:14px;border:0;border-radius:30px;background:#1877F2;color:#fff;font-weight:800;margin-top:10px}
button:disabled{opacity:.5}.gray{background:#eee;color:#333}
.hidden{display:none}.err{color:#d00;font-size:13px}.ok{color:#0a8a4a;font-size:13px}
nav{position:fixed;bottom:0;left:0;right:0;background:#11163f;display:flex;justify-content:space-around;padding:12px 0}
nav div{text-align:center;font-size:12px;cursor:pointer}
</style>
</head>
<body>
<header><div><div class="logo">AYNA BOOK<span class="star">★</span></div><div style="font-size:11px">Moment News • Live TV • Live Radio • No Fake News</div></div><div>🔔</div></header>

<div id="loginPage" class="card">
<h2>Login</h2>
<label>Phone (11 digits)</label><input id="loginPhone" maxlength="11" oninput="checkLogin()">
<label>Password (11 digits)</label><div class="wrap"><input id="loginPass" type="password" maxlength="11" oninput="checkLogin()"><span class="eye" onclick="toggle('loginPass')">👁️</span></div>
<div id="loginMsg" class="err"></div>
<button id="loginBtn" disabled onclick="doLogin()">Login</button>
<button class="gray" onclick="showPage('regPage')">Create New Account</button>
</div>

<div id="regPage" class="card hidden">
<h2>Create New Account</h2>
<label>Full Name</label><input id="regName">
<label>Phone (11 digits)</label><input id="regPhone" maxlength="11" oninput="checkReg()">
<label>Password</label><div class="wrap"><input id="regPass" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regPass')">👁️</span></div>
<label>Re-Password</label><div class="wrap"><input id="regRe" type="password" maxlength="11" oninput="checkReg()"><span class="eye" onclick="toggle('regRe')">👁️</span></div>
<div id="regMsg" class="err"></div>
<button id="regBtn" disabled onclick="doRegister()">Register</button>
<button class="gray" onclick="showPage('loginPage')">Back to Login</button>
</div>

<div id="homePage" class="card hidden">
<h2 id="welcome">Welcome</h2>
<p>✅ Account Opened - AYNA BOOK is Live</p>
<p>News • Live TV • Live Radio • Viral News</p>
<button class="gray" onclick="doLogout()">Logout</button>
</div>
<div style="height:80px"></div>
<nav><div onclick="showHome()">📰<br>News</div><div onclick="showHome()">📺<br>Live</div><div onclick="showHome()">⭐<br>Viral</div><div>📷<br>QR</div><div onclick="showHome()">⚙️<br>Settings</div></nav>

<script>
function showPage(id){document.getElementById('loginPage').classList.add('hidden');document.getElementById('regPage').classList.add('hidden');document.getElementById('homePage').classList.add('hidden');document.getElementById(id).classList.remove('hidden')}
function showHome(){showPage('homePage')}
function toggle(id){var e=document.getElementById(id);e.type=e.type==='password'?'text':'password'}
function checkLogin(){var p=document.getElementById('loginPhone').value;var w=document.getElementById('loginPass').value;document.getElementById('loginBtn').disabled=!(p.length===11&&w.length===11)}
function checkReg(){var p=document.getElementById('regPhone').value;var w=document.getElementById('regPass').value;var r=document.getElementById('regRe').value;var m=document.getElementById('regMsg');if(p.length!==11){m.textContent='Phone must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w.length!==11||r.length!==11){m.textContent='Password must be 11 digits';document.getElementById('regBtn').disabled=true;return}if(w!==r){m.textContent='Passwords do not match';document.getElementById('regBtn').disabled=true;return}m.textContent='Passwords matched ✓';m.className='ok';document.getElementById('regBtn').disabled=false}
function doRegister(){var n=document.getElementById('regName').value||'User';localStorage.setItem('ayna_phone',document.getElementById('regPhone').value);localStorage.setItem('ayna_pass',document.getElementById('regPass').value);localStorage.setItem('ayna_name',n);document.getElementById('welcome').innerText='Welcome, '+n;showPage('homePage');alert('Account Created - Success')}
function doLogin(){var p=document.getElementById('loginPhone').value;var w=document.getElementById('loginPass').value;var sp=localStorage.getItem('ayna_phone');var sw=localStorage.getItem('ayna_pass');if(sp&&sp===p&&sw===w){document.getElementById('welcome').innerText='Welcome, '+localStorage.getItem('ayna_name');showPage('homePage');}else if(!sp){alert('No account found. Please Create New Account first.')}else{alert('Wrong Password')}}
function doLogout(){showPage('loginPage')}
</script>
</body>
</html>