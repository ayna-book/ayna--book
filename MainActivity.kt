package com.ayna.app

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.FirebaseApp

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // ফায়ারবেস ইনিশিয়ালাইজেশন
        FirebaseApp.initializeApp(this)
        
        // এখানে অ্যাপের অন্যান্য লজিক বা নেভিগেশন যুক্ত করতে পারেন
    }
}