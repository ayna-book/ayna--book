// =====================================================================
// AYNA BOOK & AYNA MESSENGER — GROUP MESSAGE ACTIONS (ayna-group-msg-actions.js)
// =====================================================================

const MSG_LOCAL_KEY = "ayna_group_messages_v1";

function readLocalMsgMap() {
  try {
    return JSON.parse(localStorage.getItem(MSG_LOCAL_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLocalMsgMap(map) {
  localStorage.setItem(MSG_LOCAL_KEY, JSON.stringify(map));
}

export async function replyToGroupMessage(database, dbApi, groupId, replyText, parentMsg, senderName, uid = "") {
  const cleanText = String(replyText || "").trim();
  if (!groupId || !cleanText) return false;

  const formattedText = parentMsg?.text
    ? `↩️ রিপ্লাই ("${String(parentMsg.text).slice(0, 45)}"): ${cleanText}`
    : cleanText;

  if (database && dbApi && uid) {
    const msgRef = dbApi.push(dbApi.ref(database, `aynaGroupMessages/${groupId}`));
    await dbApi.set(msgRef, {
      text: formattedText,
      sender: senderName || "AYNA Member",
      uid,
      replyToId: parentMsg?.id || "",
      time: Date.now()
    });
    return true;
  }

  const map = readLocalMsgMap();
  if (!Array.isArray(map[groupId])) map[groupId] = [];
  map[groupId].unshift({
    id: "local_" + Date.now(),
    text: formattedText,
    sender: senderName || "AYNA Member",
    uid: uid || "local_user",
    time: Date.now()
  });
  writeLocalMsgMap(map);
  return true;
}

export async function editGroupMessage(database, dbApi, groupId, msgId, newText) {
  const cleanText = String(newText || "").trim();
  if (!groupId || !msgId || !cleanText) return false;

  if (database && dbApi && !String(msgId).startsWith("local_")) {
    await dbApi.update(dbApi.ref(database, `aynaGroupMessages/${groupId}/${msgId}`), {
      text: cleanText,
      editedAt: Date.now()
    });
    return true;
  }

  const map = readLocalMsgMap();
  const list = Array.isArray(map[groupId]) ? map[groupId] : [];
  const target = list.find(m => m.id === msgId || String(m.time) === String(msgId));
  if (target) {
    target.text = cleanText;
    target.editedAt = Date.now();
    writeLocalMsgMap(map);
    return true;
  }
  return false;
}

export async function deleteGroupMessage(database, dbApi, groupId, msgId) {
  if (!groupId || !msgId) return false;

  if (database && dbApi && !String(msgId).startsWith("local_")) {
    await dbApi.remove(dbApi.ref(database, `aynaGroupMessages/${groupId}/${msgId}`));
    return true;
  }

  const map = readLocalMsgMap();
  const list = Array.isArray(map[groupId]) ? map[groupId] : [];
  map[groupId] = list.filter(m => m.id !== msgId && String(m.time) !== String(msgId));
  writeLocalMsgMap(map);
  return true;
}