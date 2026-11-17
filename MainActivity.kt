package com.ayna.app

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseApp

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FirebaseApp.initializeApp(this)

        val webView = WebView(this)
        setContentView(webView)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true // লোকাল সেশন স্টোরেজ সক্রিয় রাখতে
        webView.webViewClient = WebViewClient()

        // আপনার গিটহাব পেজেস বা লাইভ ওয়েব লিংক এখানে বসান
        webView.loadUrl("https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/")
    }
}