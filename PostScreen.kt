
package com.aynabook.app

import android.content.Intent
import.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun PostScreen() {
    var postText by remember { mutableStateOf("") }
    var selectedMedia by remember { mutableStateOf<Uri?>(null) }
    var mediaType by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }

    val mediaPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            selectedMedia = uri
            message = "মিডিয়া নির্বাচন হয়েছে"
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(18.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "AYNA BOOK - নতুন পোস্ট",
            color = Color(0xFF071B49),
            fontSize = 22.sp
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = postText,
            onValueChange = { postText = it },
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp),
            label = { Text("আপনার গল্প লিখুন...") },
            placeholder = { Text("আজ আপনার পৃথিবীতে কী ঘটেছে?") }
        )

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = {
                mediaType = "image/*"
                mediaPicker.launch(arrayOf("image/*"))
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("📷 ছবি নির্বাচন করুন")
        }

        Button(
            onClick = {
                mediaType = "video/*"
                mediaPicker.launch(arrayOf("video/*"))
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("🎬 ভিডিও নির্বাচন করুন")
        }

        if (selectedMedia != null) {
            Text(
                text = "নির্বাচিত মিডিয়া: $mediaType",
                color = Color(0xFF071B49)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = {
                message = if (postText.isNotBlank() || selectedMedia != null) {
                    "পোস্ট প্রস্তুত। এখনো সার্ভারে প্রকাশ করা হয়নি।"
                } else {
                    "লেখা অথবা ছবি/ভিডিও নির্বাচন করুন।"
                }
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFFD700),
                contentColor = Color(0xFF071B49)
            )
        ) {
            Text("পোস্ট প্রস্তুত করুন")
        }

        if (message.isNotBlank()) {
            Spacer(modifier = Modifier.height(10.dp))
            Text(message, color = Color(0xFF071B49))
        }
    }
}
