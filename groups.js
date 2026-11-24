// =====================================================================
// AYNA BOOK & AYNA MESSENGER — GROUPS MODULE (groups.js)
// =====================================================================
import { AynaGroups } from "./ayna-quantum-engine.js";

const MSG_LOCAL_KEY = "ayna_group_messages_v1";
let currentPlatformFilter = "all";
let currentUser = null;
let database = null;
let dbApi = null;
let liveGroupsList = [];
let liveMessagesMap = {};

function showStatus(text) {
  const el = document.getElementById("statusBanner");
  if (!el) return;
  el.textContent = text;
  el.style.display = "block";
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => {
    el.style.display = "none";
  }, 3200);
}

function getLocalMessages() {
  try {
    return JSON.parse(localStorage.getItem(MSG_LOCAL_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLocalMessages(map) {
  localStorage.setItem(MSG_LOCAL_KEY, JSON.stringify(map));
}

function populateGroupSelect(groups) {
  const select = document.getElementById("targetGroupSelect");
  if (!select) return;
  const prev = select.value;
  select.innerHTML = groups
    .map(g => `<option value="${g.id}">[${g.platform}] ${g.name}</option>`)
    .join("");
  if (prev && groups.some(g => g.id === prev)) {
    select.value = prev;
  }
}

function renderGroupsUI() {
  const groups = liveGroupsList.length ? liveGroupsList : AynaGroups.getGroups();
  populateGroupSelect(groups);

  const visible = currentPlatformFilter === "all"
    ? groups
    : groups.filter(g => g.platform === currentPlatformFilter);

  const container = document.getElementById("groupsContainer");
  if (!container) return;

  if (!visible.length) {
    container.innerHTML = '<div style="font-size:30px;color:#e6eeff;">এই ক্যাটাগরিতে কোনো গ্রুপ নেই।</div>';
    return;
  }

  const msgSource = Object.keys(liveMessagesMap).length ? liveMessagesMap : getLocalMessages();

  container.innerHTML = visible.map(g => {
    const rawMsgs = msgSource[g.id];
    const msgs = Array.isArray(rawMsgs)
      ? rawMsgs
      : rawMsgs && typeof rawMsgs === "object"
        ? Object.values(rawMsgs).sort((a, b) => (b.time || 0) - (a.time || 0))
        : [];

    const msgsHtml = msgs.length
      ? msgs.map(m => `
          <div class="msg-item">
            <div>${escapeHtml(m.text || "")}</div>
            <div class="msg-meta">${escapeHtml(m.sender || "AYNA Member")} • ${new Date(m.time || Date.now()).toLocaleString("bn-BD")}</div>
          </div>
        `).join("")
      : '<div class="msg-meta" style="margin-top:10px;">এখনও কোনো গ্রুপ বার্তা নেই।</div>';

    return `
      <div class="group-card">
        <span class="group-badge">${escapeHtml(g.platform)}</span>
        <div class="group-title">${escapeHtml(g.name)}</div>
        <div class="msg-list">${msgsHtml}</div>
      </div>
    `;
  }).join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function initFirebaseGroups() {
  try {
    const [initMod, jsFbMod] = await Promise.all([
      import("./firebase-init.js").catch(() => null),
      import("./js/firebase.js").catch(() => null)
    ]);

    const auth = initMod?.auth || jsFbMod?.auth || null;
    database = initMod?.database || jsFbMod?.database || null;
    if (!auth || !database) return;

    const [
      { onAuthStateChanged },
      { ref, push, set, onValue }
    ] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js")
    ]);

    dbApi = { ref, push, set, onValue };

    onAuthStateChanged(auth, user => {
      currentUser = user || null;
      if (!currentUser) return;

      onValue(ref(database, "aynaGroups"), snap => {
        const val = snap.val();
        if (val) {
          liveGroupsList = Object.entries(val)
            .map(([id, item]) => ({ id, ...item }))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          renderGroupsUI();
        }
      });

      onValue(ref(database, "aynaGroupMessages"), snap => {
        liveMessagesMap = snap.val() || {};
        renderGroupsUI();
      });
    });
  } catch (err) {
    console.warn("Groups running in local mode:", err);
  }
}

document.getElementById("createGroupBtn")?.addEventListener("click", async () => {
  const platform = document.getElementById("groupPlatformSelect")?.value || "AYNA BOOK";
  const nameInput = document.getElementById("newGroupNameInput");
  const name = (nameInput?.value || "").trim();

  if (!name) {
    showStatus("গ্রুপের নাম লিখুন");
    return;
  }

  if (currentUser && database && dbApi) {
    try {
      const newRef = dbApi.push(dbApi.ref(database, "aynaGroups"));
      await dbApi.set(newRef, {
        platform,
        name,
        createdBy: currentUser.uid,
        createdAt: Date.now()
      });
      nameInput.value = "";
      showStatus(`"${name}" (${platform}) লাইভ গ্রুপ তৈরি হয়েছে`);
      return;
    } catch (err) {
      console.error("Firebase group create error:", err);
    }
  }

  const created = AynaGroups.createGroup(platform, name);
  if (created) {
    nameInput.value = "";
    renderGroupsUI();
    showStatus(`"${created.name}" (${created.platform}) তৈরি হয়েছে`);
  }
});

document.getElementById("sendGroupMsgBtn")?.addEventListener("click", async () => {
  const groupId = document.getElementById("targetGroupSelect")?.value;
  const msgInput = document.getElementById("groupMessageInput");
  const text = (msgInput?.value || "").trim();

  if (!groupId || !text) {
    showStatus("গ্রুপ নির্বাচন করে বার্তা লিখুন");
    return;
  }

  const senderName = currentUser?.displayName || currentUser?.email || "AYNA Member";

  if (currentUser && database && dbApi) {
    try {
      const msgRef = dbApi.push(dbApi.ref(database, `aynaGroupMessages/${groupId}`));
      await dbApi.set(msgRef, {
        text,
        sender: senderName,
        uid: currentUser.uid,
        time: Date.now()
      });
      msgInput.value = "";
      showStatus("গ্রুপে লাইভ বার্তা পাঠানো হয়েছে");
      return;
    } catch (err) {
      console.error("Firebase group msg error:", err);
    }
  }

  const map = getLocalMessages();
  if (!Array.isArray(map[groupId])) map[groupId] = [];
  map[groupId].unshift({
    text,
    sender: senderName,
    time: Date.now()
  });
  saveLocalMessages(map);
  msgInput.value = "";
  renderGroupsUI();
  showStatus("গ্রুপে বার্তা পাঠানো হয়েছে");
});

document.querySelectorAll(".group-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentPlatformFilter = btn.getAttribute("data-platform") || "all";
    renderGroupsUI();
  });
});

renderGroupsUI();
initFirebaseGroups();