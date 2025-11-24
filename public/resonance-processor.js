class DSP {
    static decimate(buffer, inputRate, targetRate) {
        if (targetRate >= inputRate) return buffer;
        const ratio = Math.floor(inputRate / targetRate);
        const newLength = Math.floor(buffer.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
            let sum = 0; for (let j = 0; j < ratio; j++) { sum += buffer[(i * ratio) + j]; }
            result[i] = sum / ratio;
        }
        return result;
    }

    static biquadFilter(input, type, freq, sampleRate, Q = 0.707) {
        const output = new Float32Array(input.length);
        const omega = 2 * Math.PI * freq / sampleRate;
        const alpha = Math.sin(omega) / (2 * Q);
        const cos = Math.cos(omega);

        let a0, a1, a2, b0, b1, b2;

        if (type === 'lowpass') {
            b0 = (1 - cos) / 2;
            b1 = 1 - cos;
            b2 = (1 - cos) / 2;
            a0 = 1 + alpha;
            a1 = -2 * cos;
            a2 = 1 - alpha;
        } else if (type === 'highpass') {
            b0 = (1 + cos) / 2;
            b1 = -(1 + cos);
            b2 = (1 + cos) / 2;
            a0 = 1 + alpha;
            a1 = -2 * cos;
            a2 = 1 - alpha;
        } else {
            return input;
        }

        b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;

        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

        for (let i = 0; i < input.length; i++) {
            const x0 = input[i];
            const y0 = (b0 * x0) + (b1 * x1) + (b2 * x2) - (a1 * y1) - (a2 * y2);
            output[i] = y0;
            x2 = x1; x1 = x0;
            y2 = y1; y1 = y0;
        }
        return output;
    }

    static preEmphasis(signal) { const output = new Float32Array(signal.length); output[0] = signal[0]; for (let i = 1; i < signal.length; i++) output[i] = signal[i] - 0.97 * signal[i - 1]; return output; }
    static applyWindow(signal) { const output = new Float32Array(signal.length); for (let i = 0; i < signal.length; i++) output[i] = signal[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (signal.length - 1))); return output; }
    static autoCorrelate(signal, order) { const r = new Float32Array(order + 1); for (let lag = 0; lag <= order; lag++) { let sum = 0; for (let i = 0; i < signal.length - lag; i++) sum += signal[i] * signal[i + lag]; r[lag] = sum; } return r; }
    static levinsonDurbin(r, order) { const a = new Float32Array(order + 1); const e = new Float32Array(order + 1); a[0] = 1.0; e[0] = r[0]; for (let k = 1; k <= order; k++) { let sum = 0; for (let j = 1; j < k; j++) sum += a[j] * r[k - j]; const gamma = (r[k] - sum) / e[k - 1]; a[k] = gamma; for (let j = 1; j < k; j++) a[j] = a[j] - gamma * a[k - j]; e[k] = e[k - 1] * (1 - gamma * gamma); } return a; }
    static getLPCSpectrum(a, nPoints, sampleRate) { const spectrum = new Float32Array(nPoints); const order = a.length - 1; for (let i = 0; i < nPoints; i++) { const freq = (i * sampleRate) / (2 * nPoints); const omega = (2 * Math.PI * freq) / sampleRate; let real = 1.0; let imag = 0.0; for (let k = 1; k <= order; k++) { real -= a[k] * Math.cos(k * omega); imag -= a[k] * Math.sin(k * omega); } spectrum[i] = 1.0 / Math.sqrt(real * real + imag * imag); } return spectrum; }

    static calculatePitchYIN(buffer, sampleRate) {
        const threshold = 0.15;
        const bufferSize = buffer.length; const halfSize = Math.floor(bufferSize / 2);
        const yinBuffer = new Float32Array(halfSize);
        for (let tau = 0; tau < halfSize; tau++) { for (let i = 0; i < halfSize; i++) { const delta = buffer[i] - buffer[i + tau]; yinBuffer[tau] += delta * delta; } }
        yinBuffer[0] = 1; let runningSum = 0;
        for (let tau = 1; tau < halfSize; tau++) { runningSum += yinBuffer[tau]; yinBuffer[tau] *= tau / runningSum; }

        let tau = 0;
        for (tau = 2; tau < halfSize; tau++) {
            if (yinBuffer[tau] < threshold) {
                while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) { tau++; }
                break;
            }
        }

        if (tau == halfSize || yinBuffer[tau] >= threshold) return -1;

        let betterTau = tau; if (tau > 0 && tau < halfSize - 1) { const s0 = yinBuffer[tau - 1]; const s1 = yinBuffer[tau]; const s2 = yinBuffer[tau + 1]; let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0)); betterTau += adjustment; }
        const pitch = sampleRate / betterTau; if (pitch < 50 || pitch > 800) return -1; return pitch; // Expanded range for better detection
    }

    // FEATURE: SPECTRAL TILT (True Vocal Weight)
    // Measures the slope of the spectrum. Steeper slope = Thinner/Breathier. Flatter slope = Heavier/Pressed.
    // We approximate this by comparing energy in low freq (0-1kHz) vs high freq (1k-4kHz)
    static calculateSpectralTilt(spectrum, sampleRate) {
        const binWidth = (sampleRate / 2) / spectrum.length;
        let lowEnergy = 0;
        let highEnergy = 0;

        for (let i = 0; i < spectrum.length; i++) {
            const freq = i * binWidth;
            if (freq < 1000) lowEnergy += spectrum[i];
            else if (freq < 4000) highEnergy += spectrum[i];
        }

        // Avoid divide by zero
        if (highEnergy === 0) return 0;

        // Ratio of Low to High. 
        // High Ratio = Lots of Low Energy (Thin/Breathy or just Dark)
        // Low Ratio = Lots of High Energy (Bright/Pressed)
        // We normalize this to a 0-1 "Weight" scale where 1 is Heavy/Pressed.

        const ratio = lowEnergy / highEnergy;
        return ratio;
    }

    // Targeted DFT to get magnitude of a specific frequency component
    // This is much more efficient than a full FFT when we only need a few frequencies (H1, H2)
    static getMagnitudeAtFrequency(buffer, freq, sampleRate) {
        const omega = 2 * Math.PI * freq / sampleRate;
        let real = 0;
        let imag = 0;
        for (let i = 0; i < buffer.length; i++) {
            real += buffer[i] * Math.cos(omega * i);
            imag -= buffer[i] * Math.sin(omega * i);
        }
        return Math.sqrt(real * real + imag * imag);
    }

    static estimateVowel(f1, f2) {
        // Simple Vowel Space Mapping (Average Female Values)
        // i (beet): F1 300, F2 2500
        // a (bat): F1 800, F2 1700
        // u (boot): F1 350, F2 800
        // o (boat): F1 500, F2 1000

        if (f1 < 500 && f2 > 2000) return 'i'; // ee
        if (f1 > 600 && f2 < 1800 && f2 > 1200) return 'a'; // ah/ae
        if (f1 < 500 && f2 < 1200) return 'u'; // oo
        if (f1 > 500 && f1 < 800 && f2 < 1200) return 'o'; // oh
        return '';
    }
}

class ResonanceProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Float32Array(2048);
        this.bufferIndex = 0;
        this.smoothedCentroid = 0;
        this.threshold = 0.005; // Lowered from 0.02 for better sensitivity

        // Jitter State
        this.lastPitch = 0;
        this.jitterBuffer = [];

        // Smoothing Buffers
        this.resonanceBuffer = []; // For median filtering
        this.lastResonance = 0;

        // Weight Smoothing
        this.weightBuffer = [];

        // Message Handler for Config
        this.port.onmessage = (event) => {
            if (event.data.type === 'config') {
                if (event.data.config.threshold !== undefined) {
                    this.threshold = event.data.config.threshold;
                }
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]; if (!input || !input.length) return true; const channel = input[0];
        for (let i = 0; i < channel.length; i++) { this.buffer[this.bufferIndex] = channel[i]; this.bufferIndex++; if (this.bufferIndex >= 2048) { this.analyze(); this.bufferIndex = 0; } } return true;
    }

    analyze() {
        const fs = (typeof sampleRate !== 'undefined' ? sampleRate : 44100);
        const buffer = this.buffer;

        let rms = 0; for (let x of buffer) rms += x * x; rms = Math.sqrt(rms / buffer.length);

        if (rms > this.threshold) {
            const TARGET_RATE = 11025;
            const dsBuffer = DSP.decimate(buffer, fs, TARGET_RATE);
            const preEmphasized = DSP.preEmphasis(dsBuffer);
            const windowed = DSP.applyWindow(preEmphasized);
            const lpcOrder = 14;

            const r = DSP.autoCorrelate(windowed, lpcOrder);
            const a = DSP.levinsonDurbin(r, lpcOrder);
            const lpcSpec = DSP.getLPCSpectrum(a, 512, TARGET_RATE);

            const pitch = DSP.calculatePitchYIN(buffer, fs);

            // 1. Spectral Centroid Calculation
            let sumFreq = 0, sumAmp = 0;
            for (let i = 0; i < lpcSpec.length; i++) {
                const freq = (i * TARGET_RATE) / (2 * lpcSpec.length);
                sumFreq += freq * lpcSpec[i];
                sumAmp += lpcSpec[i];
            }
            const centroid = sumAmp > 0 ? sumFreq / sumAmp : 0;

            // 2. Formant Extraction
            let p1 = { freq: 0, amp: -Infinity }, p2 = { freq: 0, amp: -Infinity }, p3 = { freq: 0, amp: -Infinity };
            // Find up to 3 peaks
            for (let i = 1; i < lpcSpec.length - 1; i++) {
                if (lpcSpec[i] > lpcSpec[i - 1] && lpcSpec[i] > lpcSpec[i + 1]) {
                    const freq = (i * TARGET_RATE) / (2 * lpcSpec.length);
                    // Simple logic to assign to F1/F2/F3 buckets
                    if (freq > 200 && freq < 1000 && lpcSpec[i] > p1.amp) {
                        p2 = p1; p1 = { freq, amp: lpcSpec[i] };
                    } else if (freq > 1000 && freq < 2500 && lpcSpec[i] > p2.amp) {
                        p3 = p2; p2 = { freq, amp: lpcSpec[i] };
                    } else if (freq > 2500 && freq < 4500 && lpcSpec[i] > p3.amp) {
                        p3 = { freq, amp: lpcSpec[i] };
                    }
                }
            }

            // 3. Hybrid Resonance Metric
            const sorted = [...this.resonanceBuffer].sort((a, b) => a - b);
            const medianResonance = sorted[Math.floor(sorted.length / 2)];

            // Step B: Adaptive EMA (Exponential Moving Average)
            // If change is large, react faster. If change is small, smooth more.
            const diff = Math.abs(medianResonance - this.lastResonance);
            let alpha = 0.1; // Default slow smoothing
            if (diff > 200) alpha = 0.3; // Fast reaction for big shifts

            this.smoothedCentroid = (this.lastResonance * (1 - alpha)) + (medianResonance * alpha);
            this.lastResonance = this.smoothedCentroid;


            // FEATURE: TRUE VOCAL WEIGHT (H1-H2 Harmonic Difference)
            // H1 = Amplitude of Fundamental (Pitch)
            // H2 = Amplitude of Second Harmonic (2 * Pitch)
            // H1-H2 > 10dB => Breathy (Light)
            // H1-H2 < 3dB => Pressed (Heavy)

            let weight = 0.5; // Default neutral

            if (pitch > 50) {
                // Use the windowed buffer for cleaner spectral analysis
                const h1Mag = DSP.getMagnitudeAtFrequency(windowed, pitch, TARGET_RATE);
                const h2Mag = DSP.getMagnitudeAtFrequency(windowed, pitch * 2, TARGET_RATE);

                if (h1Mag > 0 && h2Mag > 0) {
                    const h1db = 20 * Math.log10(h1Mag);
                    const h2db = 20 * Math.log10(h2Mag);
                    const diffDb = h1db - h2db;

                    // Map dB difference to 0-1 Weight
                    // < 0dB (H2 > H1) -> Very Pressed (1.0)
                    // 10dB (H1 >> H2) -> Very Breathy (0.0)

                    // Clamp between 0 and 15 for mapping
                    const clampedDiff = Math.max(0, Math.min(15, diffDb));

                    // Invert: High Diff = Low Weight. Low Diff = High Weight.
                    // 0dB diff -> 1.0 weight
                    // 15dB diff -> 0.0 weight
                    weight = 1.0 - (clampedDiff / 15.0);
                }
            }

            // Smooth Weight
            this.weightBuffer.push(weight);
            if (this.weightBuffer.length > 5) this.weightBuffer.shift();
            const avgWeight = this.weightBuffer.reduce((a, b) => a + b, 0) / this.weightBuffer.length;


            // FEATURE: JITTER (Pitch Stability)
            let jitter = 0;
            if (pitch > 0 && this.lastPitch > 0) {
                const diff = Math.abs(pitch - this.lastPitch);
                this.jitterBuffer.push(diff);
                if (this.jitterBuffer.length > 5) this.jitterBuffer.shift();
                const avgJitter = this.jitterBuffer.reduce((a, b) => a + b, 0) / this.jitterBuffer.length;
                jitter = avgJitter;
            }
            this.lastPitch = pitch;

            // FEATURE: VOWEL DETECTION
            const vowel = DSP.estimateVowel(p1.freq, p2.freq);

            this.port.postMessage({
                type: 'update',
                data: {
                    pitch,
                    resonance: this.smoothedCentroid,
                    f1: p1.freq,
                    f2: p2.freq,
                    weight: avgWeight,
                    volume: rms,
                    jitter,
                    vowel,
                    spectrum: lpcSpec
                }
            });
        } else {
            this.lastPitch = 0;
            // Decay resonance slowly to 0 instead of hard reset to avoid visual flash
            this.smoothedCentroid = this.smoothedCentroid * 0.9;
            if (this.smoothedCentroid < 50) this.smoothedCentroid = 0;

            this.port.postMessage({ type: 'update', data: { pitch: -1, resonance: this.smoothedCentroid, f1: 0, f2: 0, weight: 0, volume: 0, jitter: 0, vowel: '', spectrum: null } });
        }
    }
}

registerProcessor('resonance-processor', ResonanceProcessor);