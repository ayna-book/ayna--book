rules_version = '2';

service cloud.firestore {

  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return signedIn()
        && request.auth.uid == uid;
    }

    function verifiedEmail() {
      return signedIn()
        && request.auth.token.email_verified == true;
    }


    // =======================================================
    // USERS
    // =======================================================

    match /users/{uid} {

      // User can read only own profile.
      allow read: if isOwner(uid);


      // =====================================================
      // REGISTRATION
      // =====================================================

      allow create: if isOwner(uid)

        && request.resource.data.uid == uid

        && request.resource.data.email
             == request.auth.token.email

        && request.resource.data.accountType
             == "personal"

        && request.resource.data.plan
             == "free"

        && request.resource.data.accountStatus
             == "pending_email_verification"

        && request.resource.data.emailVerified
             == false

        && request.resource.data.fullName is string

        && request.resource.data.fullName.size() >= 2

        && request.resource.data.fullName.size() <= 80

        && request.resource.data.phone is string

        && request.resource.data.photoURL is string

        && request.resource.data.createdAt is timestamp

        && request.resource.data.updatedAt is timestamp

        && request.resource.data.keys().hasOnly([
          "uid",
          "fullName",
          "email",
          "phone",
          "photoURL",
          "accountType",
          "plan",
          "accountStatus",
          "emailVerified",
          "createdAt",
          "updatedAt"
        ]);


      // =====================================================
      // EMAIL VERIFICATION
      // =====================================================

      allow update: if isOwner(uid)

        && verifiedEmail()

        // Must currently be pending.
        && resource.data.accountStatus
             == "pending_email_verification"

        // Only verification fields may change.
        && request.resource.data.diff(resource.data)
             .affectedKeys()
             .hasOnly([
               "emailVerified",
               "accountStatus",
               "updatedAt"
             ])

        // New state must be active.
        && request.resource.data.emailVerified == true

        && request.resource.data.accountStatus
             == "active"

        && request.resource.data.updatedAt
             is timestamp;


      // No client-side account deletion.
      allow delete: if false;
    }


    // =======================================================
    // DEFAULT DENY
    // =======================================================

    match /{document=**} {
      allow read, write: if false;
    }
  }
}