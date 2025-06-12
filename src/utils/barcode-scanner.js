/**
 * Barcode Scanner Utility
 * Provides functionality to scan barcodes with camera
 */
class BarcodeScanner {
    constructor() {
        this.isScanningSupported = 'BarcodeDetector' in window;
        this.detector = null;
        this.videoElement = null;
        this.stream = null;
        this.isScanning = false;
    }
    
    /**
     * Initialize the barcode detector
     */
    async init() {
        if (this.isScanningSupported) {
            try {
                // Check if BarcodeDetector is supported with specific formats
                const supportedFormats = await BarcodeDetector.getSupportedFormats();
                
                // Prefer product formats like EAN, UPC, etc.
                const formats = supportedFormats.filter(format => 
                    ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_39', 'code_128', 'qr_code'].includes(format)
                );
                
                this.detector = new BarcodeDetector({ formats });
                return true;
            } catch (error) {
                console.error('Error initializing BarcodeDetector:', error);
                this.isScanningSupported = false;
                return false;
            }
        } else {
            console.warn('BarcodeDetector API not supported in this browser');
            // Could load a third-party library like QuaggaJS or ZXing here
            return false;
        }
    }
    
    /**
     * Create and setup scanning UI
     * @param {string} containerId - Container element ID to add scanner UI
     * @param {Function} onScanCallback - Callback function when barcode is detected
     */
    async setupScanner(containerId, onScanCallback) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with ID "${containerId}" not found`);
        }
        
        // Create scanner UI
        container.innerHTML = `
            <div class="barcode-scanner-container">
                <div class="video-container">
                    <video id="scanner-video" autoplay playsinline></video>
                    <div class="scan-region-highlight"></div>
                </div>
                <div class="scanner-controls mt-3">
                    <button id="start-scanner-btn" class="btn btn-primary">
                        <i class="fas fa-camera"></i> Start Camera
                    </button>
                    <button id="stop-scanner-btn" class="btn btn-danger" style="display: none;">
                        <i class="fas fa-stop"></i> Stop Scanning
                    </button>
                    <p id="scanner-status" class="text-muted mt-2"></p>
                </div>
            </div>
        `;
        
        // Add scanning styles
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .barcode-scanner-container {
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
            }
            .video-container {
                position: relative;
                width: 100%;
                max-width: 100%;
                overflow: hidden;
                border-radius: 8px;
                border: 2px solid #007bff;
            }
            #scanner-video {
                width: 100%;
                height: auto;
                background: #000;
            }
            .scan-region-highlight {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 70%;
                height: 30%;
                transform: translate(-50%, -50%);
                border: 2px solid rgba(255, 255, 255, 0.5);
                border-radius: 4px;
                box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.3);
                pointer-events: none;
            }
            #scanner-status {
                font-style: italic;
            }
        `;
        document.head.appendChild(styleElement);
        
        // Get UI elements
        this.videoElement = document.getElementById('scanner-video');
        const startButton = document.getElementById('start-scanner-btn');
        const stopButton = document.getElementById('stop-scanner-btn');
        const statusElement = document.getElementById('scanner-status');
        
        // Add event listeners
        startButton.addEventListener('click', async () => {
            try {
                startButton.style.display = 'none';
                statusElement.textContent = 'Requesting camera access...';
                
                await this.startScanning();
                
                stopButton.style.display = 'inline-block';
                statusElement.textContent = 'Scanning for barcodes...';
                
                // Start detection loop
                this.isScanning = true;
                this.detectBarcodes(onScanCallback);
            } catch (error) {
                console.error('Error starting scanner:', error);
                startButton.style.display = 'inline-block';
                statusElement.textContent = 'Error accessing camera: ' + error.message;
            }
        });
        
        stopButton.addEventListener('click', () => {
            this.stopScanning();
            startButton.style.display = 'inline-block';
            stopButton.style.display = 'none';
            statusElement.textContent = 'Scanning stopped';
        });
        
        // Initialize the detector
        await this.init();
        
        if (!this.isScanningSupported) {
            statusElement.textContent = 'Barcode scanning not supported in this browser';
        } else {
            statusElement.textContent = 'Click "Start Camera" to begin scanning';
        }
    }
    
    /**
     * Start the camera and stream
     */
    async startScanning() {
        if (!this.isScanningSupported) {
            throw new Error('Barcode scanning not supported in this browser');
        }
        
        // Get camera access
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Prefer back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 } 
                } 
            });
            
            this.videoElement.srcObject = this.stream;
            
            // Wait for video to start playing
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    resolve();
                };
            });
            
            return true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }
    
    /**
     * Stop scanning and release camera
     */
    stopScanning() {
        this.isScanning = false;
        
        // Stop all tracks in the stream
        if (this.stream) {
            const tracks = this.stream.getTracks();
            tracks.forEach(track => track.stop());
            this.stream = null;
        }
        
        // Clear video source
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }
    
    /**
     * Detect barcodes from video feed
     * @param {Function} onDetected - Callback when barcode detected
     */
    async detectBarcodes(onDetected) {
        if (!this.isScanning || !this.detector || !this.videoElement) {
            return;
        }
        
        try {
            // Detect barcodes in the current video frame
            const barcodes = await this.detector.detect(this.videoElement);
            
            if (barcodes.length > 0) {
                // Get the first detected barcode
                const barcode = barcodes[0];
                
                // Call the callback with the detected barcode
                onDetected({
                    text: barcode.rawValue,
                    format: barcode.format
                });
                
                // Pause scanning
                this.isScanning = false;
                
                // Add visual feedback
                const statusElement = document.getElementById('scanner-status');
                statusElement.textContent = `Detected: ${barcode.rawValue} (${barcode.format})`;
                
                // Update button states
                document.getElementById('start-scanner-btn').style.display = 'inline-block';
                document.getElementById('stop-scanner-btn').style.display = 'none';
                
                // Stop the camera
                this.stopScanning();
                
                return;
            }
            
            // Continue scanning
            requestAnimationFrame(() => this.detectBarcodes(onDetected));
        } catch (error) {
            console.error('Error detecting barcodes:', error);
            
            // Continue scanning despite error
            requestAnimationFrame(() => this.detectBarcodes(onDetected));
        }
    }
}

// Create global barcode scanner instance
const barcodeScanner = new BarcodeScanner();
