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

    // Biquad Filter (Direct Form I)
    // Used for cleaning the signal before analysis (Bandpass)
    // FEATURE: Bandpass Filter (70Hz - 1500Hz) applied to pitch detection to remove rumble and hiss
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

        // Normalize
        b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;

        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

        for (let i = 0; i < input.length; i++) {
            const x0 = input[i];
            const y0 = (b0 * x0) + (b1 * x1) + (b2 * x2) - (a1 * y1) - (a2 * y2);
            output[i] = y0;
            // Shift states
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
        // FEATURE: CONFIDENCE THRESHOLD TUNING
        // Increased strictness to 0.15 (prevents tracking breath noise)
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

        // If no valley found below threshold, it's unpitched noise (breath, hiss)
        if (tau == halfSize || yinBuffer[tau] >= threshold) return -1;

        let betterTau = tau; if (tau > 0 && tau < halfSize - 1) { const s0 = yinBuffer[tau - 1]; const s1 = yinBuffer[tau]; const s2 = yinBuffer[tau + 1]; let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0)); betterTau += adjustment; }
        const pitch = sampleRate / betterTau; if (pitch < 60 || pitch > 600) return -1; return pitch;
    }
}

class ResonanceProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Float32Array(2048);
        this.bufferIndex = 0;
        this.smoothedCentroid = 0;
        this.threshold = 0.02; // Default noise gate

        this.port.onmessage = (e) => {
            if (e.data.type === 'config' && e.data.config.threshold !== undefined) {
                this.threshold = e.data.config.threshold;
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

        // FEATURE: NOISE GATE
        // Calculate RMS and ignore if too quiet
        let rms = 0; for (let x of buffer) rms += x * x; rms = Math.sqrt(rms / buffer.length);

        if (rms > this.threshold) {
            // Use High-Passed (but wide band) buffer for Resonance
            const TARGET_RATE = 11025;
            const dsBuffer = DSP.decimate(buffer, fs, TARGET_RATE);
            const preEmphasized = DSP.preEmphasis(dsBuffer);
            const windowed = DSP.applyWindow(preEmphasized);
            const lpcOrder = 14;

            const r = DSP.autoCorrelate(windowed, lpcOrder);
            const a = DSP.levinsonDurbin(r, lpcOrder);
            const lpcSpec = DSP.getLPCSpectrum(a, 512, TARGET_RATE);

            // Calculate Pitch (using original buffer for precision)
            const pitch = DSP.calculatePitchYIN(buffer, fs);

            // Calculate Resonance (Spectral Centroid of LPC)
            let sumFreq = 0, sumAmp = 0;
            for (let i = 0; i < lpcSpec.length; i++) {
                const freq = (i * TARGET_RATE) / (2 * lpcSpec.length);
                sumFreq += freq * lpcSpec[i];
                sumAmp += lpcSpec[i];
            }
            const centroid = sumAmp > 0 ? sumFreq / sumAmp : 0;

            // Smooth Centroid
            this.smoothedCentroid = (this.smoothedCentroid * 0.8) + (centroid * 0.2);

            // Formants (Simple Peak Picking from LPC)
            let p1 = { freq: 0, amp: -Infinity }, p2 = { freq: 0, amp: -Infinity };
            for (let i = 1; i < lpcSpec.length - 1; i++) {
                if (lpcSpec[i] > lpcSpec[i - 1] && lpcSpec[i] > lpcSpec[i + 1]) {
                    const freq = (i * TARGET_RATE) / (2 * lpcSpec.length);
                    if (freq > 200 && freq < 1000 && lpcSpec[i] > p1.amp) {
                        p2 = p1; p1 = { freq, amp: lpcSpec[i] };
                    } else if (freq > 1000 && freq < 3000 && lpcSpec[i] > p2.amp) {
                        p2 = { freq, amp: lpcSpec[i] };
                    }
                }
            }

            // Calculate Vocal Weight (RMS / Amplitude)
            // Adjusted gain to 3.0 to be less sensitive to loud mics
            const weight = Math.min(1, rms * 3.0);

            this.port.postMessage({ type: 'update', data: { pitch, resonance: this.smoothedCentroid, f1: p1.freq, f2: p2.freq, weight, spectrum: lpcSpec } });
        } else {
            this.port.postMessage({ type: 'update', data: { pitch: -1, resonance: 0, f1: 0, f2: 0, weight: 0, spectrum: null } });
        }
    }
}

registerProcessor('resonance-processor', ResonanceProcessor);