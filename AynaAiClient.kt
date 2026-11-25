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

data class AynaAiTriageResult(
    val riskScore: Int,
    val suggestedDecision: String,
    val category: String,
    val summaryBn: String,
    val moderatorNote: String
)

private suspend fun getAuthToken(auth: FirebaseAuth): String {
    val user = auth.currentUser ?: throw IllegalStateException("অনুগ্রহ করে লগইন করুন।")
    return suspendCancellableCoroutine { cont ->
        user.getIdToken(false)
            .addOnSuccessListener { res ->
                val token = res.token
                if (!token.isNullOrBlank() && cont.isActive) cont.resume(token)
                else if (cont.isActive) cont.resumeWithException(IllegalStateException("Empty ID token"))
            }
            .addOnFailureListener { err ->
                if (cont.isActive) cont.resumeWithException(err)
            }
    }
}

private suspend fun postAuthorizedJson(
    path: String,
    payload: JSONObject,
    apiBaseUrl: String,
    auth: FirebaseAuth
): JSONObject = withContext(Dispatchers.IO) {
    val token = getAuthToken(auth)
    val base = apiBaseUrl.trim().trimEnd('/')
    val conn = (URL("$base$path").openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 20_000
        readTimeout = 20_000
        doOutput = true
        setRequestProperty("Content-Type", "application/json; charset=UTF-8")
        setRequestProperty("Authorization", "Bearer $token")
    }

    try {
        OutputStreamWriter(conn.outputStream, Charsets.UTF_8).use {
            it.write(payload.toString())
            it.flush()
        }
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        val text = stream?.let {
            BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use(BufferedReader::readText)
        }.orEmpty()
        val json = if (text.isNotBlank()) JSONObject(text) else JSONObject()
        if (code !in 200..299 || !json.optBoolean("ok", true)) {
            throw IllegalStateException(json.optString("error", "AI request failed ($code)"))
        }
        json
    } finally {
        conn.disconnect()
    }
}

// ১. পোস্ট, মেসেঞ্জার (@ayna), মার্কেটপ্লেস, ওয়ার্ল্ড লিডার্স ও ওয়েদার AI কল
suspend fun askAynaModuleAI(
    module: String,
    action: String = "assist",
    text: String,
    context: String = "",
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance()
): String {
    val payload = JSONObject().apply {
        put("module", module)
        put("action", action)
        put("text", text)
        put("context", context)
    }
    val res = postAuthorizedJson("/api/ai/assist", payload, apiBaseUrl, auth)
    return res.optString("reply", "")
}

// ২. মডারেশন স্ক্রিনে রিপোর্টের AI ঝুঁকি বিশ্লেষণ
suspend fun runReportAiTriage(
    postId: String,
    reportId: String,
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance()
): AynaAiTriageResult {
    val payload = JSONObject().apply {
        put("postId", postId)
        put("reportId", reportId)
    }
    val res = postAuthorizedJson("/api/admin/reports/ai-triage", payload, apiBaseUrl, auth)
    val t = res.getJSONObject("triage")
    return AynaAiTriageResult(
        riskScore = t.optInt("riskScore", 0),
        suggestedDecision = t.optString("suggestedDecision", "warned"),
        category = t.optString("category", "general"),
        summaryBn = t.optString("summaryBn", ""),
        moderatorNote = t.optString("moderatorNote", "")
    )
}