package com.aynabook.app.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.aynabook.app.MainActivity
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.security.MessageDigest

class AynaFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        syncTokenForCurrentUser(
            token = token,
            auth = FirebaseAuth.getInstance(),
            database = FirebaseDatabase.getInstance()
        )
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title
            ?: remoteMessage.data["title"]
            ?: "AYNA BOOK"
        val body = remoteMessage.notification?.body
            ?: remoteMessage.data["body"]
            ?: return

        showAynaNotification(
            context = this,
            title = title,
            body = body,
            route = remoteMessage.data["route"] ?: "feed",
            postId = remoteMessage.data["postId"] ?: ""
        )
    }

    companion object {
        const val CHANNEL_ID = "ayna_book_alerts"
        private const val CHANNEL_NAME = "AYNA BOOK Notifications"

        fun tokenKeyFor(token: String): String {
            val digest = MessageDigest.getInstance("SHA-256")
                .digest(token.trim().toByteArray(Charsets.UTF_8))
            return digest.joinToString("") { "%02x".format(it) }.take(24)
        }

        fun syncTokenForCurrentUser(
            token: String,
            auth: FirebaseAuth = FirebaseAuth.getInstance(),
            database: FirebaseDatabase = FirebaseDatabase.getInstance()
        ) {
            val cleanToken = token.trim()
            val uid = auth.currentUser?.uid ?: return
            if (cleanToken.isEmpty()) return

            val key = tokenKeyFor(cleanToken)
            val payload = mapOf<String, Any>(
                "token" to cleanToken,
                "platform" to "android",
                "updatedAt" to System.currentTimeMillis()
            )

            database.getReference("fcmTokens")
                .child(uid)
                .child(key)
                .setValue(payload)
        }

        fun registerCurrentDeviceToken(
            auth: FirebaseAuth = FirebaseAuth.getInstance(),
            database: FirebaseDatabase = FirebaseDatabase.getInstance(),
            messaging: FirebaseMessaging = FirebaseMessaging.getInstance()
        ) {
            if (auth.currentUser?.uid == null) return

            messaging.token.addOnSuccessListener { token ->
                if (!token.isNullOrBlank()) {
                    syncTokenForCurrentUser(
                        token = token,
                        auth = auth,
                        database = database
                    )
                }
            }
        }

        fun showAynaNotification(
            context: Context,
            title: String,
            body: String,
            route: String = "feed",
            postId: String = ""
        ) {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "AYNA BOOK moderation, feed, and message alerts"
                }
                manager.createNotificationChannel(channel)
            }

            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("ayna_route", route)
                putExtra("ayna_post_id", postId)
            }

            val pendingIntent = PendingIntent.getActivity(
                context,
                (route + postId).hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .build()

            manager.notify((System.currentTimeMillis() % Int.MAX_VALUE).toInt(), notification)
        }
    }
}