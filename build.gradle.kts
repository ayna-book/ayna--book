plugins {
    id("com.android.application")
    // Google Services Gradle Plugin যোগ করুন
    id("com.google.gms.google-services")
}

dependencies {
    // Firebase BoM (Bill of Materials) আমদানি করুন
    implementation(platform("com.google.firebase:firebase-bom:32.8.0"))
    
    // ফায়ারবেস অথেন্টিকেশন ও রিয়েলটাইম ডাটাবেস লাইব্রেরি
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-database-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
}