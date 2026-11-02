/**
 * AYNA BOOK — Global Online Connectivity & Real-time Network Engine
 * Founder: Mohammed Mahabub Alam
 * International Account ID: 01400751906
 */

class AynaConnectivityEngine {
    constructor() {
        this.isOnline = navigator.onLine;
        this.pingInterval = null;
        this.statusListeners = [];
        this.init();
    }

    init() {
        // নেটওয়ার্ক ইভেন্ট লিসেনার
        window.addEventListener('online', () => this.handleStatusChange(true));
        window.addEventListener('offline', () => this.handleStatusChange(false));

        // রিয়েল-টাইম পিং সার্ভিস চালু করা (প্রতি ১০ সেকেন্ড পর পর সার্ভার কানেকশন চেক)
        this.startHealthCheck();
        
        console.log(`[AYNA BOOK Engine] Connectivity Engine Initialized. Status: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
    }

    handleStatusChange(onlineStatus) {
        this.isOnline = onlineStatus;
        const statusText = onlineStatus ? "অনলাইন (Connected)" : "অফলাইন (Disconnected)";
        const statusColor = onlineStatus ? "#10b981" : "#ef4444";

        console.log(`[AYNA Connectivity] Network status changed: ${statusText}`);

        // UI নোটিফিকেশন আপডেট
        this.updateUIBadge(onlineStatus);

        // রেজিস্টার্ড লিসেনারদের আপডেট পাঠানো
        this.statusListeners.forEach(callback => callback(onlineStatus));
    }

    updateUIBadge(onlineStatus) {
        const badgeElem = document.getElementById('network-status-badge');
        if (badgeElem) {
            badgeElem.innerText = onlineStatus ? "🟢 ONLINE" : "🔴 OFFLINE";
            badgeElem.style.color = onlineStatus ? "#10b981" : "#ef4444";
        }
    }

    startHealthCheck() {
        // রিয়েল-টাইম ক্লাউড/Vercel কানেক্টিভিটি চেক
        this.pingInterval = setInterval(async () => {
            if (navigator.onLine) {
                try {
                    // হেড রিকোয়েস্টের মাধ্যমে সার্ভার কানেকশন নিশ্চিতকরণ
                    const response = await fetch('/index.html', { method: 'HEAD', cache: 'no-store' });
                    if (!response.ok && this.isOnline) {
                        this.handleStatusChange(false);
                    }
                } catch (error) {
                    if (this.isOnline) this.handleStatusChange(false);
                }
            }
        }, 10000);
    }

    // সাবস্ক্রিপশন সিস্টেম (অন্যান্য ফাইল থেকে ট্র্যাক করার জন্য)
    onStatusChange(callback) {
        if (typeof callback === 'function') {
            this.statusListeners.push(callback);
        }
    }
}

// গ্লোবাল ইন্সট্যান্স তৈরি
window.AynaNetwork = new AynaConnectivityEngine();