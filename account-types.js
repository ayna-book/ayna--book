// =========================================================
// AYNA BOOK
// Account Types & Payment Configuration
// Version: 1.0
// =========================================================

const AYNA_ACCOUNT_TYPES = {

  personal: {
    id: "personal",
    name: "Personal",
    nameBn: "ব্যক্তিগত",
    priceUSD: 0,
    paymentRequired: false,
    status: "free"
  },

  business: {
    id: "business",
    name: "Business",
    nameBn: "ব্যবসায়িক",
    priceUSD: 10,
    paymentRequired: true,
    status: "pending_payment"
  },

  vip: {
    id: "vip",
    name: "VIP",
    nameBn: "ভিআইপি",
    priceUSD: 10,
    paymentRequired: true,
    status: "pending_payment"
  },

  vvip: {
    id: "vvip",
    name: "VVIP",
    nameBn: "ভিভিআইপি",
    priceUSD: 20,
    paymentRequired: true,
    status: "pending_payment"
  }

};


// =========================================================
// PAYMENT INFORMATION
// =========================================================

const AYNA_PAYMENT = {

  bangladesh: {

    bkash: {
      name: "bKash",
      number: "01400751906"
    },

    nagad: {
      name: "Nagad",
      number: "01400751906"
    },

    rocket: {
      name: "Rocket",
      number: "01400751906"
    },

    upay: {
      name: "Upay",
      number: "01400751906"
    }

  },

  international: {

    paypal: {
      name: "PayPal",
      account: "aynabookofficeal@gmail.com"
    },

    payoneer: {
      name: "Payoneer",
      account: "aynabookofficeal@gmail.com"
    }

  }

};


// =========================================================
// STORAGE KEY
// =========================================================

const SELECTED_ACCOUNT_KEY =
  "AYNA_BOOK_SELECTED_ACCOUNT";


// =========================================================
// GET ACCOUNT
// =========================================================

export function getAccountType(accountId) {

  const id =
    String(accountId || "")
      .trim()
      .toLowerCase();

  return AYNA_ACCOUNT_TYPES[id] || null;
}


// =========================================================
// GET ALL ACCOUNT TYPES
// =========================================================

export function getAllAccountTypes() {

  return Object.values(
    AYNA_ACCOUNT_TYPES
  );

}


// =========================================================
// SAVE SELECTED ACCOUNT
// =========================================================

export function saveSelectedAccount(accountId) {

  const account =
    getAccountType(accountId);

  if (!account) {

    throw new Error(
      "সঠিক Account Type নির্বাচন করুন।"
    );

  }

  sessionStorage.setItem(
    SELECTED_ACCOUNT_KEY,
    account.id
  );

  return account;
}


// =========================================================
// GET SELECTED ACCOUNT
// =========================================================

export function getSelectedAccount() {

  const accountId =
    sessionStorage.getItem(
      SELECTED_ACCOUNT_KEY
    );

  if (!accountId) {
    return null;
  }

  return getAccountType(accountId);
}


// =========================================================
// CLEAR SELECTED ACCOUNT
// =========================================================

export function clearSelectedAccount() {

  sessionStorage.removeItem(
    SELECTED_ACCOUNT_KEY
  );

}


// =========================================================
// PAYMENT REQUIRED?
// =========================================================

export function isPaymentRequired(accountId) {

  const account =
    getAccountType(accountId);

  if (!account) {
    return false;
  }

  return account.paymentRequired === true;
}


// =========================================================
// ACCOUNT PRICE
// =========================================================

export function getAccountPriceUSD(accountId) {

  const account =
    getAccountType(accountId);

  if (!account) {
    return null;
  }

  return account.priceUSD;
}


// =========================================================
// PAYMENT STATUS
// =========================================================

export function getInitialPaymentStatus(accountId) {

  const account =
    getAccountType(accountId);

  if (!account) {
    return "invalid";
  }

  if (!account.paymentRequired) {
    return "not_required";
  }

  return "pending_payment";
}


// =========================================================
// GET PAYMENT INFORMATION
// =========================================================

export function getPaymentInformation() {

  return AYNA_PAYMENT;

}


// =========================================================
// COPY TO CLIPBOARD
// =========================================================

export async function copyPaymentValue(value) {

  const text =
    String(value || "").trim();

  if (!text) {

    return {
      success: false,
      message: "Copy করার মতো কোনো তথ্য পাওয়া যায়নি।"
    };

  }

  try {

    await navigator.clipboard.writeText(text);

    return {
      success: true,
      message: "Copy হয়েছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Clipboard Error:",
      error
    );

    return {
      success: false,
      message:
        "স্বয়ংক্রিয়ভাবে Copy করা যায়নি।"
    };

  }

}


// =========================================================
// ACCOUNT SELECTION
// =========================================================

export function selectAccount(accountId) {

  try {

    const account =
      saveSelectedAccount(accountId);

    return {
      success: true,
      account
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Account Selection Error:",
      error
    );

    return {
      success: false,
      message:
        error.message ||
        "Account নির্বাচন করা যায়নি।"
    };

  }

}


// =========================================================
// REGISTRATION URL
// =========================================================

export function getRegistrationURL(accountId) {

  const account =
    getAccountType(accountId);

  if (!account) {

    return "./signup.html";

  }

  return (
    "./signup.html?account=" +
    encodeURIComponent(account.id)
  );

}


// =========================================================
// PAYMENT FLOW
// =========================================================

export function getRegistrationFlow(accountId) {

  const account =
    getAccountType(accountId);

  if (!account) {

    return {
      valid: false,
      step: "account_selection",
      message:
        "প্রথমে Account Type নির্বাচন করুন।"
    };

  }


  // Personal = Free

  if (!account.paymentRequired) {

    return {
      valid: true,
      account: account,
      paymentRequired: false,
      paymentStatus: "not_required",
      nextStep: "registration"
    };

  }


  // Paid Account

  return {
    valid: true,
    account: account,
    paymentRequired: true,
    paymentStatus: "pending_payment",
    nextStep: "payment_verification"
  };

}


// =========================================================
// PUBLIC CONSTANTS
// =========================================================

export {
  AYNA_ACCOUNT_TYPES,
  AYNA_PAYMENT,
  SELECTED_ACCOUNT_KEY
};


// =========================================================
// LOAD MESSAGE
// =========================================================

console.log(
  "AYNA BOOK — Account Types Controller loaded successfully."
);