const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// পোর্ট নির্ধারণ (Environment variable অথবা ডিফল্ট ৩০০০)
const PORT = process.env.PORT || 3000;

// স্ট্যাটিক ফাইল ফোল্ডার মিডলওয়্যার (HTML, CSS, JS ফাইলের জন্য)
app.use(express.static(path.join(__dirname)));

// রুট রাউট (হোম পেজ)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.io রিয়েল-টাইম কানেক্টিভিটি হ্যান্ডলিং
io.on('connection', (socket) => {
    console.log('একজন নতুন ব্যবহারকারী যুক্ত হয়েছেন (User Connected):', socket.id);

    // চ্যাট মেসেজ রিসিভ এবং ব্রডকাস্ট করা
    socket.on('chat_message', (data) => {
        console.log('মেসেজ প্রাপ্ত হয়েছে:', data);
        io.emit('chat_message', data); // সকল কানেক্টेड ইউজারের কাছে মেসেজ পাঠিয়ে দেওয়া
    });

    // অডিও/ভিডিও কল বা সিগন্যালিং ইভেন্ট
    socket.on('media_signal', (signalData) => {
        socket.broadcast.emit('media_signal', signalData);
    });

    // ইউজার ডিসকানেক্ট হলে
    socket.on('disconnect', () => {
        console.log('ব্যবহারকারী সংযোগ বিচ্ছিন্ন করেছেন:', socket.id);
    });
});

// সার্ভার স্টার্ট করা
server.listen(PORT, () => {
    console.log(`AYNA BOOK সার্ভার সফলভাবে চলছে: http://localhost:${PORT}`);
});