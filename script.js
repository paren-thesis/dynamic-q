/**
 * Dynamic QR Code Generator - Church display
 * SYNC WITH: lib/dynamicQR.ts in Altar app
 * Purpose: Rotating QR every 10s proves member is physically present (prevents photo replay).
 */
const QR_VALIDITY_MS = 10000; // 10 seconds - must match lib/dynamicQR.ts DYNAMIC_QR_VALIDITY_MS

class DynamicQRGenerator {
    constructor() {
        this.qrCode = null;
        this.interval = null;
        this.countdownInterval = null;
        this.secondsLeft = 10;
    }

    // Generate QR code data based on current time
    generateQRData() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        const qrData = {
            timestamp,
            code: `DYNAMIC-${year}${month}${day}-${hours}${minutes}${seconds}`,
            valid_until: new Date(now.getTime() + QR_VALIDITY_MS).toISOString(),
            type: 'dynamic_qr'
        };

        return JSON.stringify(qrData);
    }

    // Update QR code display
    updateQRCode() {
        const qrData = this.generateQRData();
        const timestampDisplay = document.getElementById('timestamp');
        
        // Parse and display timestamp
        try {
            const parsed = JSON.parse(qrData);
            timestampDisplay.innerHTML = `Current Time: ${parsed.timestamp}<br>QR Code: ${parsed.code}`;
        } catch (e) {
            timestampDisplay.innerHTML = `Current Time: ${new Date().toLocaleTimeString()}`;
        }
        
        // Clear previous QR code
        document.getElementById('qrcode').innerHTML = '';
        
        // Create new QR code
        this.qrCode = new QRCode(document.getElementById('qrcode'), {
            text: qrData,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    // Update countdown display
    updateCountdown() {
        const countdownDisplay = document.getElementById('countdown');
        countdownDisplay.innerHTML = `Next update in: ${this.secondsLeft} seconds`;
        
        if (this.secondsLeft <= 0) {
            this.secondsLeft = 10;
        }
    }

    // Start countdown timer
    startCountdown() {
        this.countdownInterval = setInterval(() => {
            this.secondsLeft--;
            this.updateCountdown();
        }, 1000);
    }

    // Start the dynamic QR generator
    start() {
        // Initial generation
        this.updateQRCode();
        this.secondsLeft = 10;
        this.updateCountdown();
        
        // Set interval for QR code updates - must match QR_VALIDITY_MS
        this.interval = setInterval(() => {
            this.updateQRCode();
            this.secondsLeft = 10;
        }, 10000);
        
        // Start countdown
        this.startCountdown();
        
        // Update button states
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    }

    // Stop the dynamic QR generator
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // Update button states
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        
        // Reset display
        document.getElementById('countdown').innerHTML = 'Generator stopped';
    }
}

// Initialize generator
const generator = new DynamicQRGenerator();

// Start function
function startGenerator() {
    generator.start();
}

// Stop function
function stopGenerator() {
    generator.stop();
}

// Optional: Auto-start on page load
window.onload = function() {
    // Uncomment the line below if you want auto-start
    // startGenerator();
};