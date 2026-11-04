
package com.aynabook.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private data class ChatMessage(
    val text: String,
    val isMine: Boolean
)

@Composable
fun MessagingScreen() {
    var messageText by remember { mutableStateOf("") }

    val messages = remember {
        mutableStateListOf<ChatMessage>()
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                Color.White,
                RoundedCornerShape(18.dp)
            )
            .padding(14.dp)
    ) {
        Text(
            text = "AYNA MESSAGING",
            color = Color(0xFF071B49),
            fontSize = 23.sp
        )

        Text(
            text = "Connect with your world",
            color = Color(0xFFFF4FA3),
            fontSize = 14.sp
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .height(300.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(messages) { message ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement =
                        if (message.isMine) Arrangement.End
                        else Arrangement.Start
                ) {
                    Surface(
                        color = if (message.isMine)
                            Color(0xFFFFE8A3)
                        else
                            Color(0xFFE8EDFA),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = message.text,
                            modifier = Modifier.padding(12.dp),
                            color = Color(0xFF071B49),
                            fontSize = 16.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = messageText,
            onValueChange = { messageText = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = {
                Text("আপনার মেসেজ লিখুন...")
            },
            label = {
                Text("Message")
            }
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = {
                if (messageText.isNotBlank()) {
                    messages.add(
                        ChatMessage(
                            text = messageText.trim(),
                            isMine = true
                        )
                    )
                    messageText = ""
                }
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF071B49)
            )
        ) {
            Text(
                text = "বার্তা পাঠান",
                color = Color.White,
                fontSize = 17.sp
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "এটি বর্তমানে স্থানীয় পরীক্ষামূলক চ্যাট।",
            color = Color.Gray,
            fontSize = 12.sp
        )
    }
}
