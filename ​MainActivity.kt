package com.aynabook.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import com.aynabook.app.ui.AuthScreen
import com.aynabook.app.ui.AynaSplashScreen
import com.google.firebase.auth.FirebaseAuth

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val auth = FirebaseAuth.getInstance()

        setContent {
            var currentScreen by remember { mutableStateOf("splash") }

            when (currentScreen) {
                "splash" -> AynaSplashScreen(
                    onInitializePlatform = {
                        // Firebase state check দ্রুত সম্পন্ন হবে
                        auth.currentUser
                    },
                    onFinished = {
                        currentScreen = if (auth.currentUser != null) "home" else "auth"
                    }
                )
                "auth" -> AuthScreen(
                    onAuthSuccess = { currentScreen = "home" }
                )
                "home" -> {
                    // পরের ধাপে HomeFeedScreen কল হবে
                    AuthScreen(onAuthSuccess = {})
                }
            }
        }
    }
}