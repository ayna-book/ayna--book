
import { auth, db, app } from "./firebase.js";

import {
  onAuthStateChanged,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-functions.js";

// Functions region: default Firebase region
const functions = getFunctions(app);

const approvePayment = httpsCallable(
  functions,
  "approvePayment"
);

const rejectPayment = httpsCallable(
  functions,
  "rejectPayment"
);

const statusBox = document.getElementById("accessStatus");
const adminPanel = document.getElementById("adminPanel");
const tableBody = document.getElementById("paymentTableBody");
const refreshButton = document.getElementById("refreshButton");

let currentUser = null;
let loading = false;

function showStatus(message, type = "info") {
  statusBox.textContent = message;
  statusBox.dataset.type = type;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatDate(value) {
  if (!value) return "—";

  try {
    const date = typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

    return date.toLocaleString("en-BD");
  } catch {
    return "—";
  }
}

async function verifyAdmin(user) {
  if (!user) {
    throw new Error("প্রথমে Admin account দিয়ে Login করুন।");
  }

  const token = await getIdTokenResult(user, true);

  if (token.claims.admin !== true) {
    throw new Error("Admin permission পাওয়া যায়নি।");
  }

  return true;
}

async function loadPayments() {
  if (loading || !currentUser) return;

  loading = true;
  refreshButton.disabled = true;

  showStatus("Payment requests লোড হচ্ছে...");

  try {
    await verifyAdmin(currentUser);

    const paymentQuery = query(
      collectionGroup(db, "paymentRequests"),
      where("status", "==", "pending"),
      orderBy("submittedAt", "desc"),
      limit(100)
    );

    const snapshot = await getDocs(paymentQuery);

    tableBody.replaceChildren();

    if (snapshot.empty) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 8;
      cell.textContent = "কোনো Pending Payment Request নেই।";

      row.appendChild(cell);
      tableBody.appendChild(row);

      showStatus("কোনো pending payment নেই।", "success");
      return;
    }

    snapshot.forEach(paymentDoc => {
      const data = paymentDoc.data();

      // Require exact nested document path:
      // users/{uid}/paymentRequests/{paymentId}
      const parts = paymentDoc.ref.path.split("/");

      if (
        parts.length !== 4 ||
        parts[0] !== "users" ||
        parts[2] !== "paymentRequests"
      ) {
        return;
      }

      const uid = parts[1];
      const paymentId = paymentDoc.id;

      if (data.uid !== uid) {
        console.warn("Payment UID mismatch:", paymentId);
        return;
      }

      const row = document.createElement("tr");

      const values = [
        paymentId,
        data.accountName || data.accountType || "—",
        data.email || uid,
        data.paymentMethod || "—",
        data.amount || "—",
        data.transactionId || "—",
        data.status || "—",
        formatDate(data.submittedAt)
      ];

      values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      const actionCell = document.createElement("td");

      const approveButton = document.createElement("button");
      approveButton.type = "button";
      approveButton.className = "approve-payment-btn";
      approveButton.textContent = "APPROVE";

      const rejectButton = document.createElement("button");
      rejectButton.type = "button";
      rejectButton.className = "reject-payment-btn";
      rejectButton.textContent = "REJECT";

      approveButton.addEventListener("click", () =>
        handleAction("approve", uid, paymentId, approveButton, rejectButton)
      );

      rejectButton.addEventListener("click", () =>
        handleAction("reject", uid, paymentId, rejectButton, approveButton)
      );

      actionCell.append(approveButton, rejectButton);
      row.appendChild(actionCell);
      tableBody.appendChild(row);
    });

    showStatus(
      `${snapshot.size}টি payment request পাওয়া গেছে।`,
      "success"
    );

  } catch (error) {
    console.error("Load payment error:", error);

    tableBody.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 8;
    cell.textContent = error.message || "Payment load করা যায়নি।";

    row.appendChild(cell);
    tableBody.appendChild(row);

    showStatus(error.message || "Payment load failed.", "error");

  } finally {
    loading = false;
    refreshButton.disabled = false;
  }
}

async function handleAction(action, userId, paymentId, button, otherButton) {
  if (!currentUser) return;

  const approved = action === "approve";

  let reason = "";

  if (approved) {
    if (!window.confirm("এই payment APPROVE করবেন?")) return;
  } else {
    const answer = window.prompt("REJECT করার কারণ লিখুন:");

    if (answer === null) return;

    reason = answer.trim();

    if (!reason) {
      alert("Reject করার কারণ লিখুন।");
      return;
    }
  }

  button.disabled = true;
  otherButton.disabled = true;

  const oldText = button.textContent;
  button.textContent = "Processing...";

  try {
    await verifyAdmin(currentUser);

    const callable = approved ? approvePayment : rejectPayment;

    const result = await callable(
      approved
        ? { userId, paymentId }
        : { userId, paymentId, reason }
    );

    if (result.data?.success !== true) {
      throw new Error("Server operation সফল হয়নি।");
    }

    alert(approved ? "Payment APPROVED হয়েছে।" : "Payment REJECTED হয়েছে।");

    await loadPayments();

  } catch (error) {
    console.error("Payment action error:", error);

    alert(error.message || "Payment action ব্যর্থ হয়েছে।");

    button.disabled = false;
    otherButton.disabled = false;
    button.textContent = oldText;
  }
}

refreshButton.addEventListener("click", loadPayments);

onAuthStateChanged(auth, async user => {
  currentUser = user;

  if (!user) {
    adminPanel.style.display = "none";
    showStatus("Admin panel ব্যবহারের জন্য Login করুন।", "error");
    return;
  }

  try {
    await verifyAdmin(user);

    adminPanel.style.display = "block";

    showStatus("Admin access verified.", "success");

    await loadPayments();

  } catch (error) {
    adminPanel.style.display = "none";
    showStatus(error.message, "error");
  }
});

console.log("AYNA BOOK Admin Payment Panel initialized.");
