package com.aynabook.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase

@Composable
fun PostScreen(
    authorName: String = "AYNA Member",
    aynaId: String = "2026-----10000001",
    onPostCreated: () -> Unit = {},
    onBack: () -> Unit = {}
) {
    val auth = remember { FirebaseAuth.getInstance() }
    val dbRef = remember {
        FirebaseDatabase.getInstance("https://ayna-book-default-rtdb.firebaseio.com").reference
    }

    var caption by remember { mutableStateOf("") }
    var resolvedAynaId by remember { mutableStateOf(aynaId) }
    var statusMessage by remember { mutableStateOf("") }
    var isPublishing by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val uid = auth.currentUser?.uid
        if (uid != null) {
            dbRef.child("users").child(uid).child("aynaId").get()
                .addOnSuccessListener { snap ->
                    val savedId = snap.getValue(String::class.java)
                    if (!savedId.isNullOrBlank()) {
                        resolvedAynaId = savedId
                    }
                }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF050505))
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "NEW AYNA POST",
                    color = Color(0xFFF7C948),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.5.sp
                )
                TextButton(onClick = onBack) {
                    Text(
                        text = "Back",
                        color = Color(0xFFC7C7C7),
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "AYNA ID: $resolvedAynaId",
                color = Color(0xFFF7C948),
                fontSize = 12.sp,
                fontFamily = FontFamily.Monospace
            )

            Spacer(modifier = Modifier.height(16.dp))

            // বর্গাকার সোনালি ফ্রেম প্রিভিউ
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .background(Color(0xFF101010), RoundedCornerShape(12.dp))
                    .border(2.dp, Color(0xFFD4AF37), RoundedCornerShape(12.dp))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "AB",
                        color = Color(0xFFF7C948),
                        fontSize = 44.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = caption.ifBlank { "Golden Frame Preview" },
                        color = if (caption.isBlank()) Color(0xFF888888) else Color(0xFFF5F5F5),
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = caption,
                onValueChange = { caption = it },
                label = { Text("Write a caption...") },
                minLines = 3,
                maxLines = 5,
                modifier = Modifier.fillMaxWidth()
            )

            if (statusMessage.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = statusMessage,
                    color = Color(0xFFF7C948),
                    fontSize = 13.sp
                )
            }
        }

        Button(
            onClick = {
                if (caption.isBlank()) {
                    statusMessage = "Please enter a caption before publishing."
                    return@Button
                }
                isPublishing = true
                statusMessage = "Publishing to AYNA BOOK..."

                val postsRef = dbRef.child("posts").push()
                val postId = postsRef.key ?: System.currentTimeMillis().toString()
                val senderName = auth.currentUser?.email?.substringBefore("@") ?: authorName

                val payload = AynaFeedPost(
                    id = postId,
                    authorName = senderName,
                    aynaId = resolvedAynaId,
                    caption = caption.trim()
                )

                postsRef.setValue(payload)
                    .addOnSuccessListener {
                        isPublishing = false
                        caption = ""
                        onPostCreated()
                    }
                    .addOnFailureListener { err ->
                        isPublishing = false
                        statusMessage = err.localizedMessage ?: "Failed to publish post."
                    }
            },
            enabled = !isPublishing,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF7C948)),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Text(
                text = if (isPublishing) "Publishing..." else "Publish Post",
                color = Color(0xFF050505),
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }
    }
}