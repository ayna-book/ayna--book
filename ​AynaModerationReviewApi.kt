package com.aynabook.app.data

import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

data class ModerationReviewResult(
    val ok: Boolean,
    val postId: String,
    val reportId: String,
    val decision: String,
    val reviewedAt: Long,
    val authorFcmSent: Int,
    val reporterFcmSent: Int
)

private suspend fun fetchFirebaseIdToken(
    auth: FirebaseAuth,
    forceRefresh: Boolean = false
): String {
    val user = auth.currentUser
        ?: throw IllegalStateException("Please sign in first to review reports.")

    return suspendCancellableCoroutine { continuation ->
        user.getIdToken(forceRefresh)
            .addOnSuccessListener { tokenResult ->
                val token = tokenResult.token
                if (!token.isNullOrBlank()) {
                    if (continuation.isActive) continuation.resume(token)
                } else {
                    if (continuation.isActive) {
                        continuation.resumeWithException(
                            IllegalStateException("Received empty Firebase ID token.")
                        )
                    }
                }
            }
            .addOnFailureListener { error ->
                if (continuation.isActive) {
                    continuation.resumeWithException(error)
                }
            }
    }
}

suspend fun submitModerationReview(
    postId: String,
    reportId: String,
    decision: String,
    note: String = "",
    notifyReporter: Boolean = false,
    apiBaseUrl: String = "http://localhost:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance()
): ModerationReviewResult = withContext(Dispatchers.IO) {
    val cleanPostId = postId.trim()
    val cleanReportId = reportId.trim()
    val cleanDecision = decision.trim().lowercase()
    val cleanNote = note.trim().take(500)

    require(cleanPostId.isNotEmpty()) { "postId is required." }
    require(cleanReportId.isNotEmpty()) { "reportId is required." }
    require(cleanDecision in setOf("dismissed", "warned", "removed")) {
        "decision must be one of: dismissed, warned, removed."
    }

    val idToken = fetchFirebaseIdToken(auth = auth, forceRefresh = false)
    val baseUrl = apiBaseUrl.trim().trimEnd('/')
    val endpoint = URL("$baseUrl/api/admin/reports/review")

    val payloadJson = JSONObject().apply {
        put("postId", cleanPostId)
        put("reportId", cleanReportId)
        put("decision", cleanDecision)
        put("note", cleanNote)
        put("notifyReporter", notifyReporter)
    }

    val connection = (endpoint.openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 15_000
        readTimeout = 15_000
        doOutput = true
        setRequestProperty("Content-Type", "application/json; charset=UTF-8")
        setRequestProperty("Authorization", "Bearer $idToken")
    }

    try {
        OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
            writer.write(payloadJson.toString())
            writer.flush()
        }

        val statusCode = connection.responseCode
        val stream = if (statusCode in 200..299) {
            connection.inputStream
        } else {
            connection.errorStream
        }

        val responseText = if (stream != null) {
            BufferedReader(InputStreamReader(stream, Charsets.UTF_8)).use { it.readText() }
        } else {
            ""
        }

        val responseJson = if (responseText.isNotBlank()) {
            JSONObject(responseText)
        } else {
            JSONObject()
        }

        if (statusCode !in 200..299 || responseJson.optBoolean("ok", true) == false) {
            val serverError = responseJson.optString("error").ifBlank {
                "Moderation review failed with HTTP $statusCode"
            }
            throw IllegalStateException(serverError)
        }

        val notifications = responseJson.optJSONObject("notifications")
        val authorSent = notifications?.optJSONObject("author")?.optInt("sentCount", 0) ?: 0
        val reporterSent = notifications?.optJSONObject("reporter")?.optInt("sentCount", 0) ?: 0

        ModerationReviewResult(
            ok = responseJson.optBoolean("ok", true),
            postId = responseJson.optString("postId", cleanPostId),
            reportId = responseJson.optString("reportId", cleanReportId),
            decision = responseJson.optString("decision", cleanDecision),
            reviewedAt = responseJson.optLong("reviewedAt", 0L),
            authorFcmSent = authorSent,
            reporterFcmSent = reporterSent
        )
    } finally {
        connection.disconnect()
    }
}