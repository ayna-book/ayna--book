package com.aynabook.app.utility

import android.content.Context
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

class AynaColdAiSync(context: Context) {
    private val queueBackupFile = File(context.filesDir, "ayna_cold_reports.json")
    private val chatBackupFile = File(context.filesDir, "ayna_cold_messages.json")

    fun saveReportsColdBackup(reportsJsonArray: JSONArray) {
        val wrapper = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("reports", reportsJsonArray)
        }
        queueBackupFile.writeText(wrapper.toString(2), Charsets.UTF_8)
    }

    fun loadReportsColdBackup(): JSONArray {
        if (!queueBackupFile.exists()) return JSONArray()
        return try {
            JSONObject(queueBackupFile.readText(Charsets.UTF_8)).optJSONArray("reports") ?: JSONArray()
        } catch (_: Exception) {
            JSONArray()
        }
    }

    fun saveMessagesColdBackup(messagesJsonArray: JSONArray) {
        val wrapper = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("messages", messagesJsonArray)
        }
        chatBackupFile.writeText(wrapper.toString(2), Charsets.UTF_8)
    }

    fun loadMessagesColdBackup(): JSONArray {
        if (!chatBackupFile.exists()) return JSONArray()
        return try {
            JSONObject(chatBackupFile.readText(Charsets.UTF_8)).optJSONArray("messages") ?: JSONArray()
        } catch (_: Exception) {
            JSONArray()
        }
    }

    suspend fun summarizeColdReportsWithAI(
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance()
    ): String {
        val reports = loadReportsColdBackup()
        if (reports.length() == 0) return "কোল্ড ব্যাকআপে কোনো রিপোর্ট সংরক্ষিত নেই।"

        val sampleLines = buildString {
            val limit = minOf(reports.length(), 15)
            for (i in 0 until limit) {
                val r = reports.optJSONObject(i) ?: continue
                append("- Post: ${r.optString("postId")}, Status: ${r.optString("status")}, Reason: ${r.optString("reason")}\n")
            }
        }

        val fallback = "কোল্ড ব্যাকআপে ${reports.length()}টি রিপোর্ট রয়েছে। প্রথমে Pending ও উচ্চ ঝুঁকির রিপোর্টগুলো যাচাই করুন।"
        return try {
            askAynaModuleAI(
                module = "general",
                action = "cold_reports_triage_summary",
                text = "Summarize these backed-up moderation reports in Bengali and highlight urgent items:\n$sampleLines",
                context = "Concise Bengali moderator briefing without markdown.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().ifBlank { fallback }
        } catch (_: Exception) {
            fallback
        }
    }

    suspend fun summarizeColdMessagesWithAI(
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance()
    ): String {
        val msgs = loadMessagesColdBackup()
        if (msgs.length() == 0) return "কোল্ড ব্যাকআপে কোনো চ্যাট মেসেজ নেই।"

        val transcript = buildString {
            val start = maxOf(0, msgs.length() - 20)
            for (i in start until msgs.length()) {
                val m = msgs.optJSONObject(i) ?: continue
                append("${m.optString("senderName", "User")}: ${m.optString("text", "")}\n")
            }
        }

        val fallback = "কোল্ড ব্যাকআপে ${msgs.length()}টি সাম্প্রতিক মেসেজ সংরক্ষিত আছে।"
        return try {
            askAynaModuleAI(
                module = "messenger",
                action = "cold_chat_catchup",
                text = "Summarize this backed-up AYNA MESSENGER chat in concise Bengali:\n$transcript",
                context = "Give key points and any action items in Bengali.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().ifBlank { fallback }
        } catch (_: Exception) {
            fallback
        }
    }
}