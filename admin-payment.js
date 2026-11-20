// ============================================================
// AYNA BOOK — ADMIN PAYMENT PANEL
// File: admin-payment.js
// ============================================================

import {
  auth,
  db,
  app
} from "./firebase.js";

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
  getDocs,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-functions.js";


// ============================================================
// FIREBASE FUNCTIONS
// ============================================================

const functions = getFunctions(app);

const approvePayment = httpsCallable(
  functions,
  "approvePayment"
);

const rejectPayment = httpsCallable(
  functions,
  "rejectPayment"
);


// ============================================================
// DOM
// ============================================================

const accessStatus =
  document.getElementById("accessStatus");

const adminPanel =
  document.getElementById("adminPanel");

const paymentTableBody =
  document.getElementById("paymentTableBody");

const refreshButton =
  document.getElementById("refreshButton");


// ============================================================
// STATE
// ============================================================

let currentUser = null;
let loading = false;


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(timestamp) {

  if (!timestamp) {
    return "—";
  }

  try {

    const date =
      typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);

    return date.toLocaleString(
      "en-BD",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  } catch (error) {

    console.warn(
      "Date formatting failed:",
      error
    );

    return "—";
  }
}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
  message,
  type = "info"
) {

  if (!accessStatus) {
    return;
  }

  accessStatus.textContent = message;

  accessStatus.dataset.type = type;
}


// ============================================================
// ADMIN CHECK
// ============================================================

async function checkAdmin(user) {

  if (!user) {
    throw new Error(
      "আপনি লগইন করা নেই।"
    );
  }

  const tokenResult =
    await getIdTokenResult(
      user,
      true
    );

  if (
    tokenResult.claims &&
    tokenResult.claims.admin === true
  ) {

    return true;
  }

  throw new Error(
    "আপনার Admin permission নেই।"
  );
}


// ============================================================
// LOAD PAYMENT REQUESTS
// ============================================================

async function loadPaymentRequests() {

  if (loading) {
    return;
  }

  loading = true;

  try {

    showMessage(
      "Payment requests লোড হচ্ছে...",
      "info"
    );

    if (!paymentTableBody) {
      throw new Error(
        "paymentTableBody পাওয়া যায়নি।"
      );
    }

    paymentTableBody.innerHTML = `
      <tr>
        <td colspan="8"
            style="text-align:center;padding:25px;">
          Loading...
        </td>
      </tr>
    `;


    // --------------------------------------------------------
    // Pending payment requests
    // --------------------------------------------------------

    const paymentQuery = query(

      collectionGroup(
        db,
        "paymentRequests"
      ),

      where(
        "status",
        "==",
        "pending"
      ),

      orderBy(
        "submittedAt",
        "desc"
      ),

      limit(100)
    );


    const snapshot =
      await getDocs(paymentQuery);


    // --------------------------------------------------------
    // No requests
    // --------------------------------------------------------

    if (snapshot.empty) {

      paymentTableBody.innerHTML = `
        <tr>
          <td colspan="8"
              style="text-align:center;padding:25px;">
            কোনো Pending Payment Request নেই।
          </td>
        </tr>
      `;

      showMessage(
        "Payment panel online.",
        "success"
      );

      return;
    }


    // --------------------------------------------------------
    // Render
    // --------------------------------------------------------

    paymentTableBody.innerHTML = "";


    snapshot.forEach(
      paymentDoc => {

        const data =
          paymentDoc.data();

        const paymentId =
          paymentDoc.id;

        const uid =
          data.uid || "";

        const accountName =
          data.accountName ||
          data.accountType ||
          "—";

        const email =
          data.email ||
          "—";

        const method =
          data.paymentMethod ||
          "—";

        const amount =
          data.amount ||
          "—";

        const transactionId =
          data.transactionId ||
          "—";

        const status =
          data.status ||
          "—";

        const submittedAt =
          formatDate(
            data.submittedAt
          );


        const row =
          document.createElement("tr");


        row.innerHTML = `

          <td>
            ${escapeHTML(paymentId)}
          </td>

          <td>
            ${escapeHTML(accountName)}
          </td>

          <td>
            <div>
              ${escapeHTML(email)}
            </div>

            <small>
              UID:
              ${escapeHTML(uid)}
            </small>
          </td>

          <td>
            ${escapeHTML(method)}
          </td>

          <td>
            ${escapeHTML(amount)}
          </td>

          <td>
            ${escapeHTML(transactionId)}
          </td>

          <td>
            ${escapeHTML(status)}
          </td>

          <td>

            <button
              type="button"
              class="approve-payment-btn"
              data-user-id="${escapeHTML(uid)}"
              data-payment-id="${escapeHTML(paymentId)}"
            >
              APPROVE
            </button>

            <button
              type="button"
              class="reject-payment-btn"
              data-user-id="${escapeHTML(uid)}"
              data-payment-id="${escapeHTML(paymentId)}"
            >
              REJECT
            </button>

          </td>
        `;


        paymentTableBody.appendChild(
          row
        );
      }
    );


    // --------------------------------------------------------
    // Buttons
    // --------------------------------------------------------

    document
      .querySelectorAll(
        ".approve-payment-btn"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            handlePaymentAction(
              "approve",
              button.dataset.userId,
              button.dataset.paymentId,
              button
            );

          }
        );

      });


    document
      .querySelectorAll(
        ".reject-payment-btn"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            handlePaymentAction(
              "reject",
              button.dataset.userId,
              button.dataset.paymentId,
              button
            );

          }
        );

      });


    showMessage(
      `${snapshot.size}টি pending payment request পাওয়া গেছে।`,
      "success"
    );


  } catch (error) {

    console.error(
      "Payment request loading error:",
      error
    );


    paymentTableBody.innerHTML = `
      <tr>
        <td colspan="8"
            style="text-align:center;padding:25px;">
          Payment requests লোড করা যায়নি।
          <br>
          <small>
            ${escapeHTML(
              error.message || "Unknown error"
            )}
          </small>
        </td>
      </tr>
    `;


    showMessage(
      error.message ||
      "Payment requests লোড করা যায়নি।",
      "error"
    );

  } finally {

    loading = false;
  }
}


// ============================================================
// APPROVE / REJECT
// ============================================================

async function handlePaymentAction(
  action,
  userId,
  paymentId,
  button
) {

  if (!userId || !paymentId) {

    alert(
      "User ID অথবা Payment ID পাওয়া যায়নি।"
    );

    return;
  }


  // ----------------------------------------------------------
  // Confirmation
  // ----------------------------------------------------------

  if (action === "approve") {

    const confirmed =
      window.confirm(
        "এই payment request APPROVE করবেন?"
      );

    if (!confirmed) {
      return;
    }

  } else {

    const confirmed =
      window.confirm(
        "এই payment request REJECT করবেন?"
      );

    if (!confirmed) {
      return;
    }

  }


  // ----------------------------------------------------------
  // Disable button
  // ----------------------------------------------------------

  const originalText =
    button.textContent;

  button.disabled = true;

  button.textContent =
    "Processing...";


  try {

    let result;


    // --------------------------------------------------------
    // APPROVE
    // --------------------------------------------------------

    if (action === "approve") {

      result =
        await approvePayment({
          userId,
          paymentId
        });

    }


    // --------------------------------------------------------
    // REJECT
    // --------------------------------------------------------

    else {

      const reason =
        window.prompt(
          "Reject করার কারণ লিখুন:",
          "Payment verification failed."
        );


      if (reason === null) {

        button.disabled = false;

        button.textContent =
          originalText;

        return;
      }


      result =
        await rejectPayment({

          userId,

          paymentId,

          reason:
            reason.trim() ||
            "Payment rejected by admin."
        });

    }


    console.log(
      "Payment action result:",
      result
    );


    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    if (
      result &&
      result.data &&
      result.data.success === true
    ) {

      alert(
        action === "approve"
          ? "Payment APPROVED হয়েছে।"
          : "Payment REJECTED হয়েছে।"
      );


      await loadPaymentRequests();


    } else {

      throw new Error(
        "Server থেকে সফল response পাওয়া যায়নি।"
      );
    }


  } catch (error) {

    console.error(
      "Payment action error:",
      error
    );


    alert(
      error.message ||
      "Payment action সম্পন্ন করা যায়নি।"
    );


    button.disabled = false;

    button.textContent =
      originalText;
  }
}


// ============================================================
// REFRESH
// ============================================================

if (refreshButton) {

  refreshButton.addEventListener(
    "click",
    async () => {

      if (!currentUser) {
        return;
      }

      try {

        await checkAdmin(
          currentUser
        );

        await loadPaymentRequests();

      } catch (error) {

        console.error(
          error
        );

        showMessage(
          error.message,
          "error"
        );
      }

    }
  );
}


// ============================================================
// AUTH STATE
// ============================================================

onAuthStateChanged(
  auth,
  async user => {

    currentUser = user;


    // --------------------------------------------------------
    // Not logged in
    // --------------------------------------------------------

    if (!user) {

      if (adminPanel) {
        adminPanel.style.display =
          "none";
      }

      showMessage(
        "Admin panel ব্যবহার করতে Login করুন।",
        "error"
      );

      return;
    }


    // --------------------------------------------------------
    // Check admin
    // --------------------------------------------------------

    try {

      await checkAdmin(
        user
      );


      if (adminPanel) {
        adminPanel.style.display =
          "block";
      }


      showMessage(
        `Admin access verified: ${user.email}`,
        "success"
      );


      await loadPaymentRequests();


    } catch (error) {

      console.error(
        "Admin verification failed:",
        error
      );


      if (adminPanel) {
        adminPanel.style.display =
          "none";
      }


      showMessage(
        "ACCESS DENIED — Admin permission প্রয়োজন।",
        "error"
      );

    }

  }
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

window.addEventListener(
  "error",
  event => {

    console.error(
      "AYNA BOOK Admin Panel Error:",
      event.error || event.message
    );

  }
);


window.addEventListener(
  "unhandledrejection",
  event => {

    console.error(
      "AYNA BOOK Admin Panel Promise Error:",
      event.reason
    );

  }
);


console.log(
  "AYNA BOOK — Admin Payment Panel loaded."
);