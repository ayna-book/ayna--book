package com.aynabook.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.launch

private val PostNavyBg = Color(0xFF050A18)
private val PostCardBg = Color(0xFF0A1636)
private val PostGoldBright = Color(0xFFFFF6B3)
private val PostGoldBorder = Color(0xFFFFE64D)
private val PostCyan = Color(0xFF38F2FF)

@Composable
fun PostScreen(
    apiBaseUrl: String = "http://10.0.2.2:3000",
    database: FirebaseDatabase = FirebaseDatabase.getInstance(),
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    onPostPublished: () -> Unit = {}
) {
    val scope = rememberCoroutineScope()
    var postText by remember { mutableStateOf("") }
    var aiSummary by remember { mutableStateOf("") }
    var statusText by remember { mutableStateOf("") }
    var isAiBusy by remember { mutableStateOf(false) }
    var isPublishing by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PostNavyBg)
            .padding(16.dp)
    ) {
        Text(
            text = "✍️ নতুন পোস্ট — AYNA BOOK",
            color = PostGoldBright,
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = postText,
            onValueChange = { postText = it },
            enabled = !isPublishing,
            label = { Text("আপনার পোস্ট লিখুন...", color = PostGoldBright, fontSize = 17.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 19.sp),
            minLines = 4,
            maxLines = 8,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Button(
                enabled = !isAiBusy && !isPublishing && postText.isNotBlank(),
                onClick = {
                    scope.launch {
                        isAiBusy = true
                        statusText = "AI ক্যাপশন উন্নত করছে..."
                        try {
                            postText = askAynaModuleAI(
                                module = "post",
                                action = "polish_caption",
                                text = postText,
                                apiBaseUrl = apiBaseUrl,
                                auth = auth
                            )
                            statusText = "AI ক্যাপশন প্রস্তুত!"
                        } catch (e: Exception) {
                            statusText = "AI ত্রুটি: ${e.message ?: "ব্যর্থ"}"
                        } finally {
                            isAiBusy = false
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = PostCardBg,
                    contentColor = PostCyan
                ),
                border = BorderStroke(2.dp, PostCyan),
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = if (isAiBusy) "AI কাজ করছে..." else "✨ AI ক্যাপশন",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1
                )
            }

            Button(
                enabled = !isAiBusy && !isPublishing && postText.isNotBlank(),
                onClick = {
                    scope.launch {
                        isAiBusy = true
                        statusText = "AI সারসংক্ষেপ তৈরি করছে..."
                        try {
                            aiSummary = askAynaModuleAI(
                                module = "post",
                                action = "summarize_post",
                                text = postText,
                                apiBaseUrl = apiBaseUrl,
                                auth = auth
                            )
                            statusText = "AI সারসংক্ষেপ যুক্ত হয়েছে।"
                        } catch (e: Exception) {
                            statusText = "AI ত্রুটি: ${e.message ?: "ব্যর্থ"}"
                        } finally {
                            isAiBusy = false
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = PostCardBg,
                    contentColor = PostGoldBright
                ),
                border = BorderStroke(2.dp, PostGoldBorder),
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "📝 AI সারসংক্ষেপ",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1
                )
            }
        }

        if (aiSummary.isNotBlank()) {
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                colors = CardDefaults.cardColors(containerColor = PostCardBg),
                border = BorderStroke(2.dp, PostCyan),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(
                        text = "🤖 AI সারসংক্ষেপ",
                        color = PostCyan,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = aiSummary,
                        color = Color.White,
                        fontSize = 18.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Button(
            enabled = !isPublishing && postText.isNotBlank(),
            onClick = {
                val uid = auth.currentUser?.uid ?: return@Button
                isPublishing = true
                val newPostRef = database.getReference("posts").push()
                val payload = mapOf<String, Any>(
                    "authorUid" to uid,
                    "text" to postText.trim(),
                    "aiSummary" to aiSummary.trim(),
                    "createdAt" to System.currentTimeMillis()
                )
                newPostRef.setValue(payload)
                    .addOnSuccessListener {
                        postText = ""
                        aiSummary = ""
                        isPublishing = false
                        onPostPublished()
                    }
                    .addOnFailureListener { err ->
                        isPublishing = false
                        statusText = "পোস্ট প্রকাশ ব্যর্থ: ${err.message ?: "ত্রুটি"}"
                    }
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = PostGoldBorder,
                contentColor = PostNavyBg
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = if (isPublishing) "প্রকাশ হচ্ছে..." else "🚀 পোস্ট প্রকাশ করুন",
                fontSize = 19.sp,
                fontWeight = FontWeight.ExtraBold
            )
        }

        if (statusText.isNotBlank()) {
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = statusText,
                color = PostGoldBright,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}