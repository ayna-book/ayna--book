package com.aynabook.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase

private val PostNavyBg = Color(0xFF050A18)
private val PostGoldBright = Color(0xFFFFF6B3)
private val PostGoldBorder = Color(0xFFFFE64D)

@Composable
fun PostScreen(
    database: FirebaseDatabase = FirebaseDatabase.getInstance(),
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    onPostPublished: () -> Unit = {}
) {
    val user = auth.currentUser
    var postText by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf("") }
    var isPublishing by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PostNavyBg)
            .padding(16.dp)
    ) {
        Text(
            text = "নতুন পোস্ট তৈরি করুন",
            color = PostGoldBright,
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = postText,
            onValueChange = { postText = it },
            placeholder = { Text("আপনার ভাবনা বা ঘোষণা লিখুন...", color = Color.LightGray, fontSize = 18.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 22.sp),
            minLines = 5,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(14.dp))

        Button(
            enabled = !isPublishing && postText.trim().isNotEmpty() && user != null,
            onClick = {
                val uid = user?.uid ?: return@Button
                val cleanText = postText.trim()
                isPublishing = true
                statusMessage = ""

                val newPostRef = database.getReference("posts").push()
                val postData = mapOf(
                    "id" to (newPostRef.key ?: ""),
                    "uid" to uid,
                    "authorName" to (user.displayName ?: user.email ?: "AYNA Member"),
                    "text" to cleanText,
                    "createdAt" to System.currentTimeMillis()
                )

                newPostRef.setValue(postData)
                    .addOnSuccessListener {
                        isPublishing = false
                        postText = ""
                        statusMessage = "পোস্ট সফলভাবে প্রকাশিত হয়েছে"
                        onPostPublished()
                    }
                    .addOnFailureListener { err ->
                        isPublishing = false
                        statusMessage = err.localizedMessage ?: "পোস্ট প্রকাশ করা যায়নি"
                    }
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = PostGoldBorder,
                contentColor = PostNavyBg
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = if (isPublishing) "প্রকাশ হচ্ছে..." else "পোস্ট প্রকাশ করুন",
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold
            )
        }

        if (statusMessage.isNotEmpty()) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = statusMessage,
                color = PostGoldBright,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}