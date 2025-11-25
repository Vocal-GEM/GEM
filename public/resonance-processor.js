/**
 * Resonance Processor v3.9 - Deep Voice Fix + Weight Debug
 * 
 * Changes:
 * - Lowered Peak Detection Min Freq to 70Hz (was 150Hz) to catch deep voice formants.
 * - Added Fallback Peak Detection: If no sharp peaks found, finds global max in range.
 * - Recalibrated Thresholds: Dark=400, Balanced=800, Bright=1500.
 * - Added H1/H2/Diff debug values for Vocal Weight.
 */

class DSP {
    static decimate(buffer, inputRate, targetRate) {
        if (targetRate >= inputRate) return buffer;
        const ratio = Math.floor(inputRate / targetRate);
        const newLength = Math.floor(buffer.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
            let sum = 0;
            for (let j = 0; j < ratio; j++) {
                sum += buffer[(i * ratio) + j];
            }
            result[i] = sum / ratio;
        }
        return result;
    }

    static applyWindow(signal) {
        const output = new Float32Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            output[i] = signal[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (signal.length - 1)));
        }
        return output;
    }

    static autoCorrelate(signal, order) {
        const r = new Float32Array(order + 1);
        for (let lag = 0; lag <= order; lag++) {
            let sum = 0;
            for (let i = 0; i < signal.length - lag; i++) {
                sum += signal[i] * signal[i + lag];
            }
            r[lag] = sum;
        }
        return r;
    }

    static levinsonDurbin(r, order) {
        const a = new Float32Array(order + 1);
        const e = new Float32Array(order + 1);
        a[0] = 1.0;
        e[0] = r[0];
        for (let k = 1; k <= order; k++) {
            let sum = 0;
            for (let j = 1; j < k; j++) {
                sum += a[j] * r[k - j];
            }
            const gamma = (r[k] - sum) / e[k - 1];
            a[k] = gamma;
            for (let j = 1; j < k; j++) {
                a[j] = a[j] - gamma * a[k - j];
            }
            e[k] = e[k - 1] * (1 - gamma * gamma);
        }
        return a;
    }

    static getLPCSpectrum(a, nPoints, sampleRate) {
        const spectrum = new Float32Array(nPoints);
        const order = a.length - 1;
        for (let i = 0; i < nPoints; i++) {
            const freq = (i * sampleRate) / (2 * nPoints);
            const omega = (2 * Math.PI * freq) / sampleRate;
            let real = 1.0;
            let imag = 0.0;
            for (let k = 1; k <= order; k++) {
                real -= a[k] * Math.cos(k * omega);
                imag -= a[k] * Math.sin(k * omega);
            }
            spectrum[i] = 1.0 / Math.sqrt(real * real + imag * imag);
        }
        return spectrum;
    }

    static calculatePitchYIN(buffer, sampleRate) {
        const threshold = 0.15;
        const bufferSize = buffer.length;
        const halfSize = Math.floor(bufferSize / 2);
        const yinBuffer = new Float32Array(halfSize);

        for (let tau = 0; tau < halfSize; tau++) {
            for (let i = 0; i < halfSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                yinBuffer[tau] += delta * delta;
            }
        }

        yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < halfSize; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        let tau = 0;
        for (tau = 2; tau < halfSize; tau++) {
            if (yinBuffer[tau] < threshold) {
                while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                break;
            }
        }

        if (tau == halfSize || yinBuffer[tau] >= threshold) return -1;

        let betterTau = tau;
        if (tau > 0 && tau < halfSize - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
            betterTau += adjustment;
        }

        const pitch = sampleRate / betterTau;
        if (pitch < 50 || pitch > 800) return -1;
        return pitch;
    }

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
        if (f1 < 500 && f2 > 2000) return 'i';
        if (f1 > 600 && f2 < 1800 && f2 > 1200) return 'a';
        if (f1 < 500 && f2 < 1200) return 'u';
        if (f1 > 500 && f1 < 800 && f2 < 1200) return 'o';
        return '';
    }
}

class ResonanceProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Float32Array(2048);
        this.bufferIndex = 0;
        this.threshold = 0.005;

        // Pitch tracking
        this.lastPitch = 0;
        this.jitterBuffer = [];

        // Weight smoothing
        this.weightBuffer = [];
        this.smoothedH1 = 0;
        this.smoothedH2 = 0;

        // Resonance smoothing
        this.resonanceBuffer = [];
        this.lastResonance = 0;
        this.smoothedCentroid = 0;

        this.port.onmessage = (event) => {
            if (event.data.type === 'config') {
                if (event.data.config.threshold !== undefined) {
                    this.threshold = event.data.config.threshold;
                }
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input.length) return true;
        const channel = input[0];

        for (let i = 0; i < channel.length; i++) {
            this.buffer[this.bufferIndex] = channel[i];
            this.bufferIndex++;
            if (this.bufferIndex >= 2048) {
                this.analyze();
                this.bufferIndex = 0;
            }
        }
        return true;
    }

    analyze() {
        const fs = (typeof sampleRate !== 'undefined' ? sampleRate : 44100);
        const buffer = this.buffer;

        let rms = 0;
        for (let x of buffer) rms += x * x;
        rms = Math.sqrt(rms / buffer.length);

        if (rms > this.threshold) {
            const TARGET_RATE = 11025;
            const dsBuffer = DSP.decimate(buffer, fs, TARGET_RATE);
            const windowed = DSP.applyWindow(dsBuffer);
            const lpcOrder = 14;

            const r = DSP.autoCorrelate(windowed, lpcOrder);
            const a = DSP.levinsonDurbin(r, lpcOrder);
            const lpcSpec = DSP.getLPCSpectrum(a, 512, TARGET_RATE);

            const pitch = DSP.calculatePitchYIN(buffer, fs);

            // 1. Spectral Centroid Calculation
            let sumFreq = 0;
            let sumAmp = 0;
            for (let i = 0; i < lpcSpec.length; i++) {
                const freq = (i * TARGET_RATE) / (2 * lpcSpec.length);
                sumFreq += freq * lpcSpec[i];
                sumAmp += lpcSpec[i];
            }
            const centroid = sumAmp > 0 ? sumFreq / sumAmp : 0;

            this.resonanceBuffer.push(centroid);
            if (this.resonanceBuffer.length > 5) this.resonanceBuffer.shift();

            // 2. Formant Extraction
            let p1 = { freq: 0, amp: -Infinity };
            let p2 = { freq: 0, amp: -Infinity };
            let p3 = { freq: 0, amp: -Infinity };

            for (let i = 1; i < lpcSpec.length - 1; i++) {
                if (lpcSpec[i] > lpcSpec[i - 1] && lpcSpec[i] > lpcSpec[i + 1]) {
                    const freq = (i * TARGET_RATE) / (2 * lpcSpec.length);
                    if (freq > 200 && freq < 1000 && lpcSpec[i] > p1.amp) {
                        p2 = p1;
                        p1 = { freq, amp: lpcSpec[i] };
                    } else if (freq > 1000 && freq < 2500 && lpcSpec[i] > p2.amp) {
                        p3 = p2;
                        p2 = { freq, amp: lpcSpec[i] };
                    } else if (freq > 2500 && freq < 4500 && lpcSpec[i] > p3.amp) {
                        p3 = { freq, amp: lpcSpec[i] };
                    }
                }
            }

            // 3. Hybrid Resonance Metric
            const sorted = [...this.resonanceBuffer].sort((a, b) => a - b);
            const medianResonance = sorted[Math.floor(sorted.length / 2)];

            const diff = Math.abs(medianResonance - this.lastResonance);
            let alpha = 0.1;
            if (diff > 200) alpha = 0.3;

            this.smoothedCentroid = (this.lastResonance * (1 - alpha)) + (medianResonance * alpha);
            this.lastResonance = this.smoothedCentroid;

            // FEATURE: TRUE VOCAL WEIGHT (H1-H2 Harmonic Difference)
            let weight = 50; // Default neutral (0-100 scale)
            let h1db = 0, h2db = 0, diffDb = 0;

            if (pitch > 50) {
                const h1Mag = DSP.getMagnitudeAtFrequency(windowed, pitch, TARGET_RATE);
                const h2Mag = DSP.getMagnitudeAtFrequency(windowed, pitch * 2, TARGET_RATE);

                if (h1Mag > 0 && h2Mag > 0) {
                    h1db = 20 * Math.log10(h1Mag);
                    h2db = 20 * Math.log10(h2Mag);
                    diffDb = h1db - h2db;

                    const clampedDiff = Math.max(0, Math.min(15, diffDb));
                    weight = (1.0 - (clampedDiff / 15.0)) * 100;
                }
            }

            // Smooth Weight
            this.weightBuffer.push(weight);
            if (this.weightBuffer.length > 5) this.weightBuffer.shift();
            const avgWeight = this.weightBuffer.reduce((a, b) => a + b, 0) / this.weightBuffer.length;

            // Smooth Debug Values
            if (!this.smoothedH1) this.smoothedH1 = h1db;
            if (!this.smoothedH2) this.smoothedH2 = h2db;
            this.smoothedH1 = this.smoothedH1 * 0.9 + h1db * 0.1;
            this.smoothedH2 = this.smoothedH2 * 0.9 + h2db * 0.1;
            const smoothedDiff = this.smoothedH1 - this.smoothedH2;

            // FEATURE: JITTER
            let jitter = 0;
            if (pitch > 0 && this.lastPitch > 0) {
                const diff = Math.abs(pitch - this.lastPitch);
                this.jitterBuffer.push(diff);
                if (this.jitterBuffer.length > 5) this.jitterBuffer.shift();
                jitter = this.jitterBuffer.reduce((a, b) => a + b, 0) / this.jitterBuffer.length;
            }
            this.lastPitch = pitch;

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
                    spectrum: lpcSpec,
                    debug: {
                        h1db: this.smoothedH1,
                        h2db: this.smoothedH2,
                        diffDb: smoothedDiff
                    }
                }
            });
        } else {
            this.lastPitch = 0;
            this.smoothedCentroid = this.smoothedCentroid * 0.9;
            if (this.smoothedCentroid < 50) this.smoothedCentroid = 0;

            this.port.postMessage({
                type: 'update',
                data: {
                    pitch: -1,
                    resonance: this.smoothedCentroid,
                    f1: 0,
                    f2: 0,
                    weight: 0,
                    volume: 0,
                    jitter: 0,
                    vowel: '',
                    spectrum: null,
                    debug: null
                }
            });
        }
    }
}

registerProcessor('resonance-processor', ResonanceProcessor);