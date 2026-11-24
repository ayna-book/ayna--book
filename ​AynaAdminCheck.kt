package com.aynabook.app.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

suspend fun isCurrentUserAdmin(
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    database: FirebaseDatabase = FirebaseDatabase.getInstance()
): Boolean {
    val uid = auth.currentUser?.uid ?: return false

    return suspendCancellableCoroutine { continuation ->
        val ref = database.getReference("admins").child(uid)
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (continuation.isActive) {
                    continuation.resume(snapshot.getValue(Boolean::class.java) == true)
                }
            }

            override fun onCancelled(error: DatabaseError) {
                if (continuation.isActive) {
                    continuation.resume(false)
                }
            }
        }

        ref.addListenerForSingleValueEvent(listener)
        continuation.invokeOnCancellation {
            ref.removeEventListener(listener)
        }
    }
}