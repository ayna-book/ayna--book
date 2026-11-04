
package com.aynabook.app

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth

private val AuthNavy = Color(0xFF071B49)
private val AuthGold = Color(0xFFFFD700)
private val AuthPink = Color(0xFFFF4FA3)

@Composable
fun AuthScreen(
    onLoginSuccess: () -> Unit
) {
    val auth = remember { FirebaseAuth.getInstance() }

    var isRegister by remember { mutableStateOf(true) }
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = "AYNA BOOK",
            color = AuthGold,
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = if (isRegister) "নতুন অ্যাকাউন্ট তৈরি করুন"
            else "আপনার অ্যাকাউন্টে প্রবেশ করুন",
            color = Color.White,
            fontSize = 20.sp
        )

        Spacer(modifier = Modifier.height(18.dp))

        if (isRegister) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("আপনার নাম") },
                singleLine = true
            )
        }

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("ইমেইল ঠিকানা") },
            singleLine = true
        )

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("পাসওয়ার্ড") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true
        )

        if (isRegister) {
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("পাসওয়ার্ড নিশ্চিত করুন") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                val cleanEmail = email.trim()

                if (cleanEmail.isBlank() || password.isBlank()) {
                    message = "ইমেইল ও পাসওয়ার্ড লিখুন।"
                } else if (isRegister && name.isBlank()) {
                    message = "আপনার নাম লিখুন।"
                } else if (password.length < 6) {
                    message = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
                } else if (isRegister && password != confirmPassword) {
                    message = "দুটি পাসওয়ার্ড মিলছে না।"
                } else {
                    loading = true
                    message = "অনুগ্রহ করে অপেক্ষা করুন..."

                    val task = if (isRegister) {
                        auth.createUserWithEmailAndPassword(
                            cleanEmail,
                            password
                        )
                    } else {
                        auth.signInWithEmailAndPassword(
                            cleanEmail,
                            password
                        )
                    }

                    task.addOnCompleteListener { result ->
                        loading = false

                        if (result.isSuccessful) {
                            onLoginSuccess()
                        } else {
                            message = result.exception?.localizedMessage
                                ?: "অ্যাকাউন্টে প্রবেশ করা যায়নি।"
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !loading,
            colors = ButtonDefaults.buttonColors(
                containerColor = AuthGold,
                contentColor = AuthNavy
            )
        ) {
            Text(
                text = if (loading) "অপেক্ষা করুন..."
                else if (isRegister) "অ্যাকাউন্ট তৈরি করুন"
                else "লগইন করুন",
                fontSize = 17.sp
            )
        }

        TextButton(
            onClick = {
                isRegister = !isRegister
                message = ""
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = if (isRegister)
                    "আগে অ্যাকাউন্ট আছে? লগইন করুন"
                else
                    "নতুন ব্যবহারকারী? অ্যাকাউন্ট খুলুন",
                color = AuthPink
            )
        }

        if (message.isNotBlank()) {
            Text(
                text = message,
                color = Color.White,
                fontSize = 14.sp
            )
        }
    }
}
