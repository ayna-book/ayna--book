// =========================================================
// AYNA BOOK
// QUANTUM-SAFE SECURITY FOUNDATION
// File: quantum-security.js
//
// Purpose:
// - Web Crypto based security foundation
// - Strong random key generation
// - AES-GCM encryption/decryption
// - SHA-256 hashing
// - HMAC authentication
// - Secure random identifiers
// - Key export/import
// - PQC readiness
//
// IMPORTANT:
// This file does NOT claim to implement a quantum computer.
// Browser-native ML-KEM / ML-DSA support is not assumed.
// Post-Quantum Cryptography must be added through a
// vetted implementation/server-side service when available.
// =========================================================


// =========================================================
// GLOBAL CRYPTO CHECK
// =========================================================

function getCrypto() {

  if (
    typeof globalThis === "undefined" ||
    !globalThis.crypto ||
    !globalThis.crypto.subtle
  ) {
    throw new Error(
      "Secure Web Crypto API is not available."
    );
  }

  return globalThis.crypto;

}


// =========================================================
// RANDOM BYTES
// =========================================================

export function randomBytes(length = 32) {

  if (
    !Number.isInteger(length) ||
    length < 1 ||
    length > 4096
  ) {
    throw new RangeError(
      "Random byte length must be between 1 and 4096."
    );
  }

  const bytes = new Uint8Array(length);

  getCrypto().getRandomValues(bytes);

  return bytes;

}


// =========================================================
// HEX ENCODING
// =========================================================

export function bytesToHex(bytes) {

  return Array.from(bytes)
    .map(
      byte =>
        byte.toString(16).padStart(2, "0")
    )
    .join("");

}


// =========================================================
// HEX DECODING
// =========================================================

export function hexToBytes(hex) {

  if (
    typeof hex !== "string" ||
    hex.length % 2 !== 0 ||
    !/^[0-9a-f]+$/i.test(hex)
  ) {
    throw new Error(
      "Invalid hexadecimal value."
    );
  }

  const bytes = new Uint8Array(
    hex.length / 2
  );

  for (
    let i = 0;
    i < bytes.length;
    i++
  ) {
    bytes[i] = parseInt(
      hex.substring(i * 2, i * 2 + 2),
      16
    );
  }

  return bytes;

}


// =========================================================
// SECURE RANDOM ID
// =========================================================

export function createSecureId(
  byteLength = 32
) {

  return bytesToHex(
    randomBytes(byteLength)
  );

}


// =========================================================
// BASE64 ENCODING
// =========================================================

function bytesToBase64(bytes) {

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {

    binary += String.fromCharCode(
      ...bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      )
    );

  }

  return btoa(binary);

}


// =========================================================
// BASE64 DECODING
// =========================================================

function base64ToBytes(base64) {

  const binary = atob(base64);

  const bytes = new Uint8Array(
    binary.length
  );

  for (
    let i = 0;
    i < binary.length;
    i++
  ) {

    bytes[i] =
      binary.charCodeAt(i);

  }

  return bytes;

}


// =========================================================
// UTF-8 ENCODING
// =========================================================

function textToBytes(text) {

  return new TextEncoder().encode(
    String(text)
  );

}


// =========================================================
// UTF-8 DECODING
// =========================================================

function bytesToText(bytes) {

  return new TextDecoder().decode(
    bytes
  );

}


// =========================================================
// SHA-256 HASH
// =========================================================

export async function sha256(data) {

  const bytes =
    typeof data === "string"
      ? textToBytes(data)
      : data;

  const digest =
    await getCrypto().subtle.digest(
      "SHA-256",
      bytes
    );

  return bytesToHex(
    new Uint8Array(digest)
  );

}


// =========================================================
// HMAC KEY GENERATION
// =========================================================

export async function generateHmacKey() {

  return getCrypto().subtle.generateKey(
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    true,
    [
      "sign",
      "verify"
    ]
  );

}


// =========================================================
// HMAC SIGN
// =========================================================

export async function hmacSign(
  key,
  data
) {

  const bytes =
    typeof data === "string"
      ? textToBytes(data)
      : data;

  const signature =
    await getCrypto().subtle.sign(
      "HMAC",
      key,
      bytes
    );

  return bytesToBase64(
    new Uint8Array(signature)
  );

}


// =========================================================
// HMAC VERIFY
// =========================================================

export async function hmacVerify(
  key,
  data,
  signatureBase64
) {

  const bytes =
    typeof data === "string"
      ? textToBytes(data)
      : data;

  const signature =
    base64ToBytes(signatureBase64);

  return getCrypto().subtle.verify(
    "HMAC",
    key,
    signature,
    bytes
  );

}


// =========================================================
// AES-256-GCM KEY GENERATION
// =========================================================

export async function generateEncryptionKey() {

  return getCrypto().subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    [
      "encrypt",
      "decrypt"
    ]
  );

}


// =========================================================
// AES-GCM ENCRYPTION
// =========================================================

export async function encryptText(
  key,
  plaintext,
  additionalData = ""
) {

  const iv =
    randomBytes(12);

  const encrypted =
    await getCrypto().subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData:
          textToBytes(additionalData)
      },
      key,
      textToBytes(plaintext)
    );

  return {

    algorithm:
      "AES-256-GCM",

    iv:
      bytesToBase64(iv),

    ciphertext:
      bytesToBase64(
        new Uint8Array(encrypted)
      )

  };

}


// =========================================================
// AES-GCM DECRYPTION
// =========================================================

export async function decryptText(
  key,
  encryptedData,
  additionalData = ""
) {

  if (
    !encryptedData ||
    encryptedData.algorithm !==
      "AES-256-GCM"
  ) {
    throw new Error(
      "Unsupported encryption format."
    );
  }

  const iv =
    base64ToBytes(
      encryptedData.iv
    );

  const ciphertext =
    base64ToBytes(
      encryptedData.ciphertext
    );

  const decrypted =
    await getCrypto().subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData:
          textToBytes(additionalData)
      },
      key,
      ciphertext
    );

  return bytesToText(
    new Uint8Array(decrypted)
  );

}


// =========================================================
// EXPORT AES KEY
// =========================================================

export async function exportKey(key) {

  const raw =
    await getCrypto().subtle.exportKey(
      "raw",
      key
    );

  return bytesToBase64(
    new Uint8Array(raw)
  );

}


// =========================================================
// IMPORT AES KEY
// =========================================================

export async function importEncryptionKey(
  base64Key
) {

  const raw =
    base64ToBytes(base64Key);

  return getCrypto().subtle.importKey(
    "raw",
    raw,
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    [
      "encrypt",
      "decrypt"
    ]
  );

}


// =========================================================
// DEVICE SECURITY ID
// =========================================================
//
// This is NOT a replacement for Firebase UID.
// It is only a locally generated security identifier.
// =========================================================

const DEVICE_ID_STORAGE_KEY =
  "ayna_book_device_security_id";


export function getDeviceSecurityId() {

  try {

    const existing =
      localStorage.getItem(
        DEVICE_ID_STORAGE_KEY
      );

    if (existing) {
      return existing;
    }

    const id =
      createSecureId(32);

    localStorage.setItem(
      DEVICE_ID_STORAGE_KEY,
      id
    );

    return id;

  } catch (error) {

    console.warn(
      "Unable to persist device security ID.",
      error
    );

    return createSecureId(32);

  }

}


// =========================================================
// SECURITY NONCE
// =========================================================

export function createSecurityNonce() {

  return bytesToBase64(
    randomBytes(32)
  );

}


// =========================================================
// PASSWORDS MUST NEVER BE STORED HERE
// =========================================================
//
// This module intentionally does NOT:
// - store Firebase passwords
// - hash Firebase passwords for login
// - replace Firebase Authentication
// - store authentication tokens
//
// Firebase Authentication remains responsible for
// password authentication.
// =========================================================


// =========================================================
// POST-QUANTUM CRYPTOGRAPHY CAPABILITY
// =========================================================

export function getPQCStatus() {

  return {

    ready:
      false,

    provider:
      null,

    algorithms: {

      KEM:
        "ML-KEM",

      signature:
        "ML-DSA"

    },

    message:
      "Post-Quantum Cryptography requires a vetted PQC implementation or server-side provider. Browser-native support is not assumed."

  };

}


// =========================================================
// PQC PROVIDER INTERFACE
// =========================================================
//
// Future implementation can register a verified
// ML-KEM / ML-DSA provider here.
//
// Do NOT insert homemade quantum algorithms.
// =========================================================

let pqcProvider = null;


export function registerPQCProvider(
  provider
) {

  if (
    !provider ||
    typeof provider !== "object"
  ) {
    throw new TypeError(
      "Invalid PQC provider."
    );
  }

  if (
    typeof provider.generateKeyPair !==
    "function" ||

    typeof provider.encapsulate !==
    "function" ||

    typeof provider.decapsulate !==
    "function"
  ) {

    throw new TypeError(
      "PQC provider does not implement the required KEM interface."
    );

  }

  pqcProvider =
    provider;

}


export function hasPQCProvider() {

  return Boolean(
    pqcProvider
  );

}


export async function generatePQCKeyPair() {

  if (!pqcProvider) {

    throw new Error(
      "No trusted PQC provider is registered."
    );

  }

  return pqcProvider.generateKeyPair();

}


export async function pqcEncapsulate(
  publicKey
) {

  if (!pqcProvider) {

    throw new Error(
      "No trusted PQC provider is registered."
    );

  }

  return pqcProvider.encapsulate(
    publicKey
  );

}


export async function pqcDecapsulate(
  privateKey,
  ciphertext
) {

  if (!pqcProvider) {

    throw new Error(
      "No trusted PQC provider is registered."
    );

  }

  return pqcProvider.decapsulate(
    privateKey,
    ciphertext
  );

}


// =========================================================
// SECURITY CAPABILITIES
// =========================================================

export function getSecurityCapabilities() {

  return {

    webCrypto:
      Boolean(
        globalThis.crypto?.subtle
      ),

    random:
      Boolean(
        globalThis.crypto?.getRandomValues
      ),

    aes256gcm:
      true,

    sha256:
      true,

    hmacSha256:
      true,

    postQuantum:
      hasPQCProvider(),

    pqcAlgorithms: [
      "ML-KEM",
      "ML-DSA"
    ]

  };

}


// =========================================================
// SECURITY SELF TEST
// =========================================================

export async function runSecuritySelfTest() {

  const result = {

    webCrypto: false,

    random: false,

    hash: false,

    hmac: false,

    encryption: false,

    pqc: false

  };


  try {

    const crypto =
      getCrypto();

    result.webCrypto =
      Boolean(
        crypto.subtle
      );

    randomBytes(32);

    result.random =
      true;


    const hash =
      await sha256(
        "AYNA BOOK"
      );

    result.hash =
      typeof hash === "string" &&
      hash.length === 64;


    const hmacKey =
      await generateHmacKey();

    const signature =
      await hmacSign(
        hmacKey,
        "AYNA BOOK"
      );

    result.hmac =
      await hmacVerify(
        hmacKey,
        "AYNA BOOK",
        signature
      );


    const encryptionKey =
      await generateEncryptionKey();

    const encrypted =
      await encryptText(
        encryptionKey,
        "AYNA BOOK",
        "AYNA-BOOK"
      );

    const decrypted =
      await decryptText(
        encryptionKey,
        encrypted,
        "AYNA-BOOK"
      );

    result.encryption =
      decrypted === "AYNA BOOK";


    result.pqc =
      hasPQCProvider();


    return {

      success:
        result.webCrypto &&
        result.random &&
        result.hash &&
        result.hmac &&
        result.encryption,

      ...result

    };

  } catch (error) {

    console.error(
      "AYNA BOOK security self-test failed:",
      error
    );

    return {

      success: false,

      ...result,

      error:
        error?.message ||
        "Security self-test failed."

    };

  }

}


// =========================================================
// END OF QUANTUM-SAFE SECURITY FOUNDATION
// AYNA BOOK
// =========================================================