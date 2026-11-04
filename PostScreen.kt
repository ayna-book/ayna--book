
package com.aynabook.app

import android.net.Uri
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

private val PostNavy = Color(0xFF071B49)
private val PostGold = Color(0xFFFFD700)
private val PostPink = Color(0xFFFF4FA3)

@Composable
fun PostScreen() {
    var postText by remember { mutableStateOf("") }
    var selectedMedia by remember { mutableStateOf<Uri?>(null) }
    var mediaLabel by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }

    val mediaPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            selectedMedia = uri
            mediaLabel = "মিডিয়া নির্বাচন করা হয়েছে"
            message = "আপনার মিডিয়া প্রস্তুত।"
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                color = Color.White,
                shape = RoundedCornerShape(20.dp)
            )
            .padding(18.dp)
    ) {
        Text(
            text = "AYNA BOOK",
            color = PostNavy,
            fontSize = 25.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "নতুন পোস্ট তৈরি করুন",
            color = PostPink,
            fontSize = 20.sp
        )

        Spacer(modifier = Modifier.height(14.dp))

        OutlinedTextField(
            value = postText,
            onValueChange = {
                postText = it
                message = ""
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(160.dp),
            label = {
                Text("আপনার গল্প লিখুন")
            },
            placeholder = {
                Text("আজ আপনার পৃথিবীতে কী ঘটেছে?")
            }
        )

        Spacer(modifier = Modifier.height(12.dp))

        Button(
            onClick = {
                mediaPicker.launch(arrayOf("image/*"))
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("📷 ছবি নির্বাচন করুন")
        }

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = {
                mediaPicker.launch(arrayOf("video/*"))
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("🎬 ভিডিও নির্বাচন করুন")
        }

        if (selectedMedia != null) {
            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = mediaLabel,
                color = PostNavy,
                fontSize = 15.sp
            )

            Text(
                text = selectedMedia.toString(),
                color = PostPink,
                fontSize = 11.sp
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                message = when {
                    postText.isBlank() && selectedMedia == null ->
                        "লেখা অথবা ছবি/ভিডিও নির্বাচন করুন।"

                    else ->
                        "পোস্ট প্রস্তুত হয়েছে। অনলাইনে প্রকাশের জন্য Firebase সংযোগ প্রয়োজন।"
                }
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = PostGold,
                contentColor = PostNavy
            )
        ) {
            Text(
                text = "পোস্ট প্রস্তুত করুন",
                fontSize = 17.sp
            )
        }

        if (message.isNotBlank()) {
            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = message,
                color = PostNavy,
                fontSize = 14.sp
            )
        }
    }
}
