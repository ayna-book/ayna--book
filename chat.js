// chat.js
import { db, auth } from './firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const messagesRef = collection(db, "ayna_messages");

// মেসেজ পাঠানো
export async function sendMessage(text) {
    if (!text.trim() || !auth.currentUser) return;
    await addDoc(messagesRef, {
        text: text,
        sender: auth.currentUser.email,
        createdAt: serverTimestamp()
    });
}

// রিয়েল-টাইম মেসেজ রিসিভ করা
export function listenMessages(callback) {
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
        callback(msgs);
    });
}