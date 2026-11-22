// =========================================================
// AYNA BOOK — STEP 6
// FIREBASE AUTHENTICATION ACCOUNT CREATION
// =========================================================

export async function createAYNABookAccount({
  fullName,
  email,
  phone,
  password,
  photoURL
}) {
  if (!fullName || !email || !phone || !password || !photoURL) {
    throw new Error("সব তথ্য পূরণ করুন।");
  }

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

  const user = userCredential.user;

  await updateProfile(user, {
    displayName: fullName.trim(),
    photoURL
  });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName: fullName.trim(),
    email: user.email,
    phone: phone.trim(),
    photoURL,
    accountType: "personal",
    plan: "free",
    emailVerified: false,
    accountStatus: "pending_email_verification",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return user;
}