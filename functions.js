const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const crypto = require("crypto");

initializeApp();

const db = getDatabase();

const validTiers = ["business", "vip", "vvip"];

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// শুধু Admin নতুন Access Code তৈরি করতে পারবেন
exports.createAccessCode = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth || request.auth.token.admin !== true) {
      throw new HttpsError("permission-denied", "Admin access required.");
    }

    const tier = String(request.data?.tier || "").toLowerCase();

    if (!validTiers.includes(tier)) {
      throw new HttpsError("invalid-argument", "Invalid account tier.");
    }

    const code = crypto.randomBytes(9).toString("hex").toUpperCase();
    const hash = hashCode(code);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await db.ref(`accessCodes/${tier}/${hash}`).set({
      createdBy: request.auth.uid,
      createdAt: Date.now(),
      expiresAt,
      used: false
    });

    return { code, tier, expiresAt };
  }
);

// ব্যবহারকারী Access Code Redeem করবেন
exports.redeemAccessCode = onCall(
  { region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Please log in.");
    }

    const tier = String(request.data?.tier || "").toLowerCase();
    const code = String(request.data?.code || "").trim().toUpperCase();

    if (!validTiers.includes(tier) || !/^[A-F0-9]{18}$/.test(code)) {
      throw new HttpsError("invalid-argument", "Invalid code or tier.");
    }

    const hash = hashCode(code);
    const codeRef = db.ref(`accessCodes/${tier}/${hash}`);

    const result = await codeRef.transaction((current) => {
      if (
        !current ||
        current.used === true ||
        current.expiresAt < Date.now()
      ) {
        return;
      }

      return {
        ...current,
        used: true,
        usedBy: request.auth.uid,
        usedAt: Date.now()
      };
    });

    if (!result.committed) {
      throw new HttpsError(
        "failed-precondition",
        "Code invalid, expired, or already used."
      );
    }

    await db.ref(`accountAccess/${request.auth.uid}/${tier}`).set({
      active: true,
      grantedAt: Date.now(),
      expiresAt: result.snapshot.val().expiresAt
    });

    return { success: true, tier };
  }
);