/**
 * PitchWorklet.js
 * AudioWorklet processor for ultra-low-latency pitch detection
 * Runs in dedicated audio thread for <50ms latency
 */

class PitchProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 1024;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
        this.sampleRate = 44100; // Will be updated from main thread

        // YIN algorithm parameters
        this.threshold = 0.1;
        this.minFreq = 80; // Hz
        this.maxFreq = 500; // Hz

        // Performance tracking
        this.processCount = 0;
        this.totalProcessTime = 0;

        // Listen for configuration updates
        this.port.onmessage = (event) => {
            if (event.data.type === 'config') {
                this.sampleRate = event.data.sampleRate || this.sampleRate;
                this.threshold = event.data.threshold || this.threshold;
                this.minFreq = event.data.minFreq || this.minFreq;
                this.maxFreq = event.data.maxFreq || this.maxFreq;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const inputChannel = input[0];

        // Fill buffer with incoming audio
        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex++] = inputChannel[i];

            // Process when buffer is full
            if (this.bufferIndex >= this.bufferSize) {
                const startTime = currentTime;

                // Detect pitch using YIN algorithm
                const result = this.detectPitchYIN(this.buffer);

                const processingTime = (currentTime - startTime) * 1000; // Convert to ms
                this.totalProcessTime += processingTime;
                this.processCount++;

                // Send result to main thread
                this.port.postMessage({
                    type: 'pitch',
                    pitch: result.pitch,
                    confidence: result.confidence,
                    timestamp: currentTime,
                    latency: processingTime,
                    avgLatency: this.totalProcessTime / this.processCount
                });

                // Reset buffer (overlap by 50% for smoother detection)
                const overlap = Math.floor(this.bufferSize / 2);
                for (let j = 0; j < overlap; j++) {
                    this.buffer[j] = this.buffer[this.bufferSize - overlap + j];
                }
                this.bufferIndex = overlap;
            }
        }

        return true;
    }

    /**
     * Fast YIN pitch detection algorithm
     * Optimized for real-time performance in audio thread
     */
    detectPitchYIN(buffer) {
        const bufferSize = buffer.length;
        const minPeriod = Math.floor(this.sampleRate / this.maxFreq);
        const maxPeriod = Math.floor(this.sampleRate / this.minFreq);

        // Step 1: Calculate difference function
        const yinBuffer = new Float32Array(maxPeriod);

        for (let tau = minPeriod; tau < maxPeriod; tau++) {
            let sum = 0;
            for (let i = 0; i < bufferSize - tau; i++) {
                const delta = buffer[i] - buffer[i + tau];
                sum += delta * delta;
            }
            yinBuffer[tau] = sum;
        }

        // Step 2: Cumulative mean normalized difference
        yinBuffer[0] = 1;
        let runningSum = 0;

        for (let tau = 1; tau < maxPeriod; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        // Step 3: Absolute threshold
        let tauEstimate = -1;
        let minValue = 1;

        for (let tau = minPeriod; tau < maxPeriod; tau++) {
            if (yinBuffer[tau] < this.threshold) {
                // Find local minimum
                while (tau + 1 < maxPeriod && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                tauEstimate = tau;
                minValue = yinBuffer[tau];
                break;
            }
        }

        // No pitch detected
        if (tauEstimate === -1) {
            return { pitch: null, confidence: 0 };
        }

        // Step 4: Parabolic interpolation for sub-sample accuracy
        let betterTau = tauEstimate;
        if (tauEstimate > 0 && tauEstimate < maxPeriod - 1) {
            const s0 = yinBuffer[tauEstimate - 1];
            const s1 = yinBuffer[tauEstimate];
            const s2 = yinBuffer[tauEstimate + 1];
            betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }

        const pitch = this.sampleRate / betterTau;
        const confidence = 1 - minValue;

        // Sanity check
        if (pitch < this.minFreq || pitch > this.maxFreq) {
            return { pitch: null, confidence: 0 };
        }

        return { pitch, confidence };
    }

    /**
     * Calculate RMS energy of buffer
     */
    calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }
}

registerProcessor('pitch-processor', PitchProcessor);
