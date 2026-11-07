<?php
// ড্যাশবোর্ড ব্যাকএন্ড লজিক ও সেশন হ্যান্ডলিং
session_start();
// ডাটাবেস কানেকশন এবং ইউজারের তথ্য ফেচ করার কোড এখানে থাকবে
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>ড্যাশবোর্ড - AYNA BOOK</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background: #0b132b; color: #fff; font-family: sans-serif; padding: 20px; }
        .dashboard-card { max-width: 600px; margin: 0 auto; background: #1c2541; padding: 30px; border-radius: 15px; border: 1px solid #3a506b; }
        .profile-header { text-align: center; margin-bottom: 20px; }
        .profile-header img { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #ff007f; object-fit: cover; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #3a506b; }
        .info-label { color: #8d99ae; font-weight: bold; }
    </style>
</head>
<body>

<div class="dashboard-card">
    <div class="profile-header">
        <!-- ইউজারের প্রোফাইল ছবি -->
        <img src="uploads/default-avatar.png" alt="Profile Picture">
        <h2>ইউজার ড্যাশবোর্ড</h2>
    </div>
    
    <div class="info-row">
        <span class="info-label">নাম:</span>
        <span>মোঃ রহিম উদ্দিন</span>
    </div>
    <div class="info-row">
        <span class="info-label">ফোন নম্বর:</span>
        <span>০১৭০০০০০০০০</span>
    </div>
    <div class="info-row">
        <span class="info-label">জিমেইল:</span>
        <span>rahim@gmail.com</span>
    </div>
    <div class="info-row">
        <span class="info-label">অ্যাকাউন্ট স্ট্যাটাস:</span>
        <span style="color: #2ec4b6;">সক্রিয় (Active - কোয়ান্টাম সিগন্যাল প্রস্তুত)</span>
    </div>
</div>

</body>
</html>