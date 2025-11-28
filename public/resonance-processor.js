/**
 * Resonance Processor v5.3 - FFT-Based Formant Detection with Smoothing & Shimmer
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

    static simpleFFT(signal) {
        const N = signal.length;
        const spectrum = new Float32Array(N / 2);

        for (let k = 0; k < N / 2; k++) {
            let real = 0;
            let imag = 0;
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += signal[n] * Math.cos(angle);
                imag += signal[n] * Math.sin(angle);
            }
            spectrum[k] = Math.sqrt(real * real + imag * imag);
        }
        return spectrum;
    }

    static estimateVowel(f1, f2) {
        if (!f1 || !f2 || f1 === 0 || f2 === 0) return '';
        if (f1 < 550 && f2 > 1900) return 'i';
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

        this.lastPitch = 0;
        this.jitterBuffer = [];
        this.weightBuffer = [];
        this.smoothedH1 = 0;
        this.smoothedH2 = 0;
        this.resonanceBuffer = [];
        this.lastResonance = 0;
        this.smoothedCentroid = 0;
        this.smoothedF1 = 0;
        this.smoothedF2 = 0;
        this.shimmerBuffer = [];
        this.lastAmp = 0;

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

            const preEmphasized = new Float32Array(dsBuffer.length);
            preEmphasized[0] = dsBuffer[0];
            for (let i = 1; i < dsBuffer.length; i++) {
                preEmphasized[i] = dsBuffer[i] - 0.97 * dsBuffer[i - 1];
            }

            const windowed = DSP.applyWindow(preEmphasized);
            const pitch = DSP.calculatePitchYIN(buffer, fs);
            const spectrum = DSP.simpleFFT(windowed);

            let formantCandidates = [];
            let maxAmp = 0;
            for (let i = 0; i < spectrum.length; i++) {
                if (spectrum[i] > maxAmp) maxAmp = spectrum[i];
            }

            const magnitudeThreshold = maxAmp * 0.15;

            for (let i = 2; i < spectrum.length - 2; i++) {
                if (spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1] &&
                    spectrum[i] > spectrum[i - 2] && spectrum[i] > spectrum[i + 2]) {
                    const freq = (i * TARGET_RATE) / (2 * spectrum.length);
                    if (freq > 150 && freq < 4000 && spectrum[i] > magnitudeThreshold) {
                        formantCandidates.push({ freq, amp: spectrum[i] });
                    }
                }
            }

            formantCandidates.sort((a, b) => b.amp - a.amp);

            let p1 = { freq: 0, amp: 0 };
            let p2 = { freq: 0, amp: 0 };

            for (let candidate of formantCandidates) {
                if (candidate.freq >= 200 && candidate.freq <= 1200) {
                    p1 = candidate;
                    break;
                }
            }

            for (let candidate of formantCandidates) {
                if (candidate.freq >= 1200 && candidate.freq <= 3500 && candidate !== p1) {
                    p2 = candidate;
                    break;
                }
            }

            let weightedSum = 0;
            let totalMag = 0;
            for (let i = 0; i < spectrum.length; i++) {
                const freq = (i * TARGET_RATE) / (2 * spectrum.length);
                weightedSum += freq * spectrum[i];
                totalMag += spectrum[i];
            }
            const spectralCentroid = totalMag > 0 ? weightedSum / totalMag : 0;

            const resonanceAlpha = 0.2;
            this.smoothedCentroid = (this.lastResonance * (1 - resonanceAlpha)) + (spectralCentroid * resonanceAlpha);
            this.lastResonance = this.smoothedCentroid;

            let weight = 50;
            let h1db = 0, h2db = 0, diffDb = 0;

            if (pitch > 50) {
                const h1Mag = DSP.getMagnitudeAtFrequency(windowed, pitch, TARGET_RATE);
                const h2Mag = DSP.getMagnitudeAtFrequency(windowed, pitch * 2, TARGET_RATE);

                if (h1Mag > 0 && h2Mag > 0) {
                    h1db = 20 * Math.log10(h1Mag);
                    h2db = 20 * Math.log10(h2Mag);
                    diffDb = h1db - h2db;

                    const clampedDiff = Math.max(-5, Math.min(15, diffDb));
                    weight = (1.0 - ((clampedDiff + 5) / 20.0)) * 100;
                }
            }

            this.weightBuffer.push(weight);
            if (this.weightBuffer.length > 5) this.weightBuffer.shift();
            const avgWeight = this.weightBuffer.reduce((a, b) => a + b, 0) / this.weightBuffer.length;

            if (!this.smoothedH1) this.smoothedH1 = h1db;
            if (!this.smoothedH2) this.smoothedH2 = h2db;
            this.smoothedH1 = this.smoothedH1 * 0.9 + h1db * 0.1;
            this.smoothedH2 = this.smoothedH2 * 0.9 + h2db * 0.1;
            const smoothedDiff = this.smoothedH1 - this.smoothedH2;

            let jitter = 0;
            if (pitch > 0 && this.lastPitch > 0) {
                const diff = Math.abs(pitch - this.lastPitch);
                this.jitterBuffer.push(diff);
                if (this.jitterBuffer.length > 5) this.jitterBuffer.shift();
                jitter = this.jitterBuffer.reduce((a, b) => a + b, 0) / this.jitterBuffer.length;
            }
            this.lastPitch = pitch;

            let shimmer = 0;
            if (rms > 0 && this.lastAmp > 0) {
                const diff = Math.abs(rms - this.lastAmp);
                const avg = (rms + this.lastAmp) / 2;
                const localShimmer = (diff / avg) * 100;

                this.shimmerBuffer.push(localShimmer);
                if (this.shimmerBuffer.length > 5) this.shimmerBuffer.shift();
                shimmer = this.shimmerBuffer.reduce((a, b) => a + b, 0) / this.shimmerBuffer.length;
            }
            this.lastAmp = rms;

            if (!this.smoothedF1) this.smoothedF1 = p1.freq;
            if (!this.smoothedF2) this.smoothedF2 = p2.freq;

            if (p1.freq > 0) {
                const diff = Math.abs(p1.freq - this.smoothedF1);
                const alpha = diff > 100 ? 0.3 : 0.1;
                this.smoothedF1 = this.smoothedF1 * (1 - alpha) + p1.freq * alpha;
            }

            if (p2.freq > 0) {
                const diff = Math.abs(p2.freq - this.smoothedF2);
                const alpha = diff > 150 ? 0.3 : 0.1;
                this.smoothedF2 = this.smoothedF2 * (1 - alpha) + p2.freq * alpha;
            }

            const vowel = DSP.estimateVowel(this.smoothedF1, this.smoothedF2);

            let tilt = 0;
            if (spectrum && spectrum.length > 0) {
                let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
                let n = 0;
                const binWidth = TARGET_RATE / (2 * spectrum.length);

                for (let i = 1; i < spectrum.length; i++) {
                    const freq = i * binWidth;
                    if (freq < 100) continue;
                    if (freq > 5000) break;

                    const logFreq = Math.log10(freq);
                    const db = 20 * Math.log10(spectrum[i] + 1e-10);

                    sumX += logFreq;
                    sumY += db;
                    sumXY += logFreq * db;
                    sumXX += logFreq * logFreq;
                    n++;
                }

                if (n > 0) {
                    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                    tilt = slope * 0.301;
                }
            }

            this.port.postMessage({
                type: 'update',
                data: {
                    pitch,
                    resonance: this.smoothedCentroid,
                    f1: this.smoothedF1,
                    f2: this.smoothedF2,
                    weight: avgWeight,
                    volume: rms,
                    jitter,
                    shimmer,
                    tilt,
                    vowel,
                    spectrum: spectrum,
                    debug: {
                        h1db: this.smoothedH1,
                        h2db: this.smoothedH2,
                        diffDb: smoothedDiff,
                        hasValidF2: p2.freq > 0
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
                    shimmer: 0,
                    tilt: 0,
                    vowel: '',
                    spectrum: null,
                    debug: null
                }
            });
        }
    }
}

registerProcessor('resonance-processor', ResonanceProcessor);