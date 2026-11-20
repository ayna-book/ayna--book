// =========================================================
// AYNA BOOK
// Admin Payment Verification Controller
// File: admin-payment.js
// Version: 1.0
//
// SECURITY:
// Only Firebase Authentication users with
// Custom Claim: admin === true
// can access this controller.
//
// Approve / Reject write operation is intentionally
// disabled until secure Firestore Admin Rules are added.
// =========================================================


import {
  auth,
  db
} from "./firebase.js";


import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


import {
  collectionGroup,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// DOM ELEMENTS
// =========================================================

const accessStatus =
  document.getElementById(
    "accessStatus"
  );


const adminPanel =
  document.getElementById(
    "adminPanel"
  );


const paymentList =
  document.getElementById(
    "paymentList"
  );


const refreshBtn =
  document.getElementById(
    "refreshBtn"
  );


const message =
  document.getElementById(
    "message"
  );


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
  text,
  type = "info"
) {

  if (!message) {
    return;
  }

  message.textContent =
    text || "";

  message.className =
    type + " show";

}


// =========================================================
// ACCESS STATUS
// =========================================================

function setAccessStatus(
  text,
  allowed = false
) {

  if (!accessStatus) {
    return;
  }

  accessStatus.textContent =
    text;

  accessStatus.className =
    allowed
      ? "access allowed"
      : "access denied";

}


// =========================================================
// ESCAPE HTML
// Prevent payment data from being interpreted
// as HTML inside the admin table.
// =========================================================

function escapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// =========================================================
// PAYMENT METHOD NAME
// =========================================================

function getPaymentMethodName(
  method
) {

  const methods = {

    bkash: "bKash",

    nagad: "Nagad",

    rocket: "Rocket",

    upay: "Upay",

    paypal: "PayPal",

    payoneer: "Payoneer"

  };

  return (
    methods[method] ||
    method ||
    "—"
  );

}


// =========================================================
// STATUS BADGE
// =========================================================

function getStatusBadge(
  status
) {

  const cleanStatus =
    String(
      status || "pending"
    ).toLowerCase();


  let className =
    "status";


  if (
    cleanStatus ===
      "approved" ||
    cleanStatus ===
      "verified"
  ) {

    className +=
      " approved";

  }


  if (
    cleanStatus ===
    "rejected"
  ) {

    className +=
      " rejected";

  }


  return `
    <span class="${className}">
      ${escapeHTML(
        cleanStatus.toUpperCase()
      )}
    </span>
  `;

}


// =========================================================
// ACCOUNT NAME
// =========================================================

function getAccountName(
  data
) {

  if (
    data.accountName &&
    data.accountNameBn
  ) {

    return (
      escapeHTML(
        data.accountName
      ) +
      "<br>" +
      `<span class="muted">${
        escapeHTML(
          data.accountNameBn
        )
      }</span>`
    );

  }


  return escapeHTML(
    data.accountName ||
    data.accountType ||
    "—"
  );

}


// =========================================================
// RENDER EMPTY
// =========================================================

function renderEmpty() {

  if (!paymentList) {
    return;
  }

  paymentList.innerHTML = `

    <tr>

      <td
        colspan="8"
        class="muted"
      >

        কোনো Payment Request পাওয়া যায়নি।

      </td>

    </tr>

  `;

}


// =========================================================
// RENDER LOADING
// =========================================================

function renderLoading() {

  if (!paymentList) {
    return;
  }

  paymentList.innerHTML = `

    <tr>

      <td
        colspan="8"
        class="muted"
      >

        Payment Requests loading...

      </td>

    </tr>

  `;

}


// =========================================================
// RENDER PAYMENT REQUESTS
// =========================================================

function renderPayments(
  documents
) {

  if (!paymentList) {
    return;
  }


  if (
    !documents ||
    documents.length === 0
  ) {

    renderEmpty();

    return;

  }


  paymentList.innerHTML =
    "";


  documents.forEach(
    snapshot => {

      const data =
        snapshot.data();


      const requestId =
        data.requestId ||
        snapshot.id;


      const status =
        data.status ||
        "pending";


      const row =
        document.createElement(
          "tr"
        );


      row.innerHTML = `

        <td>

          <strong>
            ${escapeHTML(
              requestId
            )}
          </strong>

        </td>


        <td>

          ${getAccountName(
            data
          )}

        </td>


        <td>

          <div>
            ${escapeHTML(
              data.email ||
              "—"
            )}
          </div>

          <div class="muted">
            ${escapeHTML(
              data.uid ||
              "—"
            )}
          </div>

        </td>


        <td>

          ${escapeHTML(
            getPaymentMethodName(
              data.paymentMethod
            )
          )}

        </td>


        <td>

          ${escapeHTML(
            data.amount ||
            "—"
          )}

        </td>


        <td>

          ${escapeHTML(
            data.transactionId ||
            "—"
          )}

        </td>


        <td>

          ${getStatusBadge(
            status
          )}

        </td>


        <td>

          <button
            type="button"
            class="approve"
            data-action="approve"
            data-request-id="${escapeHTML(
              requestId
            )}"
            disabled
          >
            APPROVE
          </button>


          <button
            type="button"
            class="reject"
            data-action="reject"
            data-request-id="${escapeHTML(
              requestId
            )}"
            disabled
          >
            REJECT
          </button>

        </td>

      `;


      paymentList.appendChild(
        row
      );

    }
  );

}


// =========================================================
// LOAD PAYMENT REQUESTS
//
// Current Firestore structure:
//
// users/{uid}/paymentRequests/{paymentId}
//
// collectionGroup() allows an Admin backend/rules
// to query all "paymentRequests" subcollections.
//
// IMPORTANT:
// Current Firestore Rules do not yet grant Admin
// collectionGroup access. Therefore this function
// may return a permission error until File 12 Rules
// are deployed.
// =========================================================

async function loadPaymentRequests() {

  if (!paymentList) {
    return;
  }


  renderLoading();


  showMessage(
    "Payment Requests loading...",
    "info"
  );


  try {

    const paymentQuery =
      query(

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
      await getDocs(
        paymentQuery
      );


    const documents =
      snapshot.docs;


    renderPayments(
      documents
    );


    showMessage(
      documents.length +
      "টি Pending Payment Request পাওয়া গেছে।",
      "success"
    );


  } catch (error) {

    console.error(
      "AYNA BOOK — Load Payment Requests Error:",
      error
    );


    renderEmpty();


    if (
      error?.code ===
      "permission-denied"
    ) {

      showMessage(
        "Firestore Rules এখনো Admin access অনুমোদন করছে না। পরের Rules update প্রয়োজন।",
        "error"
      );

    } else {

      showMessage(
        error?.message ||
        "Payment Requests load করা যায়নি।",
        "error"
      );

    }

  }

}


// =========================================================
// APPROVE / REJECT PLACEHOLDER
// =========================================================

function handlePaymentAction(
  action,
  requestId
) {

  /*
   * SECURITY NOTICE:
   *
   * এখানে এখনো Firestore update করা হচ্ছে না।
   *
   * কারণ:
   *
   * 1. Admin Firestore Rules এখনো তৈরি হয়নি।
   * 2. User account activation trusted operation।
   * 3. Paid account active করার সময় paymentStatus
   *    এবং accountStatus নিরাপদভাবে পরিবর্তন করতে হবে।
   *
   * File 12+ এ secure Admin Rules এবং
   * verification flow যুক্ত করা হবে।
   */


  console.warn(
    "AYNA BOOK — Admin action blocked until secure Rules are deployed.",
    {
      action,
      requestId
    }
  );


  showMessage(
    "APPROVE/REJECT এখনো নিরাপত্তার কারণে চালু করা হয়নি। Admin Rules সম্পন্ন হওয়ার পর এটি চালু হবে।",
    "info"
  );

}


// =========================================================
// BUTTON EVENT
// =========================================================

if (paymentList) {

  paymentList.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "button[data-action]"
        );


      if (!button) {
        return;
      }


      const action =
        button.dataset.action;


      const requestId =
        button.dataset.requestId;


      if (
        action !== "approve" &&
        action !== "reject"
      ) {

        return;

      }


      handlePaymentAction(
        action,
        requestId
      );

    }
  );

}


// =========================================================
// REFRESH
// =========================================================

if (refreshBtn) {

  refreshBtn.addEventListener(
    "click",
    async () => {

      refreshBtn.disabled =
        true;

      refreshBtn.textContent =
        "LOADING...";


      try {

        await loadPaymentRequests();

      } finally {

        refreshBtn.disabled =
          false;

        refreshBtn.textContent =
          "REFRESH";

      }

    }
  );

}


// =========================================================
// AUTH + ADMIN CLAIM
// =========================================================

onAuthStateChanged(
  auth,

  async user => {

    if (!user) {

      setAccessStatus(
        "LOGIN REQUIRED — Admin login প্রয়োজন।",
        false
      );


      if (adminPanel) {

        adminPanel.style.display =
          "none";

      }


      showMessage(
        "প্রথমে Firebase Authentication দিয়ে Login করুন।",
        "error"
      );


      return;

    }


    try {

      /*
       * Force-refresh ID token so that a newly
       * assigned admin Custom Claim is detected.
       */

      const tokenResult =
        await user.getIdTokenResult(
          true
        );


      const isAdmin =
        tokenResult.claims.admin === true;


      if (!isAdmin) {

        setAccessStatus(
          "ACCESS DENIED — Admin permission নেই।",
          false
        );


        if (adminPanel) {

          adminPanel.style.display =
            "none";

        }


        showMessage(
          "আপনার Firebase account-এ admin:true Custom Claim নেই।",
          "error"
        );


        return;

      }


      /*
       * Admin verified
       */

      setAccessStatus(
        "ADMIN ACCESS VERIFIED",
        true
      );


      if (adminPanel) {

        adminPanel.style.display =
          "block";

      }


      showMessage(
        "Admin permission সফলভাবে যাচাই হয়েছে।",
        "success"
      );


      /*
       * Load pending payments.
       */

      await loadPaymentRequests();


    } catch (error) {

      console.error(
        "AYNA BOOK — Admin authentication error:",
        error
      );


      setAccessStatus(
        "ADMIN VERIFICATION FAILED",
        false
      );


      if (adminPanel) {

        adminPanel.style.display =
          "none";

      }


      showMessage(
        "Admin permission যাচাই করা যায়নি।",
        "error"
      );

    }

  }
);


console.log(
  "AYNA BOOK — Admin Payment Controller loaded successfully."
);