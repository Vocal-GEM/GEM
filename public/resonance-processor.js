/**
 * Resonance Processor v6.0 - Synced with Main Thread DSP & Optimized
 */
/* global sampleRate */

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

    static calculatePitchYIN(buffer, sampleRate, adaptiveThreshold = 0.15) {
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
            if (yinBuffer[tau] < adaptiveThreshold) {
                while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                break;
            }
        }

        if (tau == halfSize || yinBuffer[tau] >= adaptiveThreshold) {
            return { pitch: -1, confidence: 0 };
        }

        let betterTau = tau;
        if (tau > 0 && tau < halfSize - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
            betterTau += adjustment;
        }

        const pitch = sampleRate / betterTau;
        const confidence = 1 - yinBuffer[tau];

        if (pitch < 50 || pitch > 800) {
            return { pitch: -1, confidence: 0 };
        }

        return { pitch, confidence };
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

    static computeAutocorrelation(signal, order) {
        const R = new Float32Array(order + 1);
        const N = signal.length;
        for (let k = 0; k <= order; k++) {
            let sum = 0;
            for (let i = 0; i < N - k; i++) {
                sum += signal[i] * signal[i + k];
            }
            R[k] = sum;
        }
        return R;
    }

    static levinsonDurbin(R, order) {
        const a = new Float32Array(order + 1);
        const E = new Float32Array(order + 1);

        E[0] = R[0];
        a[0] = 1;

        const a_prev = new Float32Array(order + 1);

        for (let i = 1; i <= order; i++) {
            let sum = 0;
            for (let j = 1; j < i; j++) {
                sum += a_prev[j] * R[i - j];
            }

            const k = (R[i] - sum) / E[i - 1];

            a[i] = k;
            for (let j = 1; j < i; j++) {
                a[j] = a_prev[j] - k * a_prev[i - j];
            }

            E[i] = E[i - 1] * (1 - k * k);

            for (let j = 0; j <= i; j++) a_prev[j] = a[j];
        }

        return { a: a.slice(1), error: E[order] };
    }

    static computeLPCSpectrum(a, error, numPoints) {
        const magnitude = new Float32Array(numPoints);
        const gain = Math.sqrt(error);

        for (let i = 0; i < numPoints; i++) {
            const omega = (Math.PI * i) / (numPoints - 1);
            let real = 1.0;
            let imag = 0.0;

            for (let k = 0; k < a.length; k++) {
                const angle = -omega * (k + 1);
                real += a[k] * Math.cos(angle);
                imag += a[k] * Math.sin(angle);
            }

            const magA = Math.sqrt(real * real + imag * imag);
            magnitude[i] = 20 * Math.log10(gain / (magA + 1e-10));
        }
        return magnitude;
    }

    static findPeaks(envelope, sampleRate) {
        const peaks = [];
        const numPoints = envelope.length;

        for (let i = 1; i < numPoints - 1; i++) {
            if (envelope[i] > envelope[i - 1] && envelope[i] > envelope[i + 1]) {
                const freq = (i / (numPoints - 1)) * (sampleRate / 2);
                if (freq > 200) {
                    peaks.push({ freq, amp: envelope[i] });
                }
            }
        }
        return peaks;
    }

    /**
     * Normalize F1 based on pitch to account for larynx height correlation
     * Higher pitches naturally correlate with higher F1 due to raised larynx
     * This correction allows fair comparison across different pitches
     *
     * Reference: Titze (1989), Sundberg (1987) - F1 shifts ~25Hz per semitone of pitch
     */
    static normalizeFoPitch(f1, pitch) {
        if (!f1 || f1 === 0 || !pitch || pitch <= 0) return f1;

        // Reference pitch (typical modal voice center)
        const refPitch = 150; // Hz

        // F1 shift per semitone is approximately 20-30 Hz
        // Using 25 Hz as middle ground
        const semitones = 12 * Math.log2(pitch / refPitch);
        const f1Shift = semitones * 25;

        // Subtract the pitch-induced shift to get "normalized" F1
        // This represents what F1 would be at the reference pitch
        const normalizedF1 = f1 - f1Shift;

        // Clamp to reasonable range
        return Math.max(200, Math.min(1200, normalizedF1));
    }

    /**
     * Calculate vowel-independent resonance metric
     * Uses F1/F0 ratio which is more stable across vowels than raw F1
     * Typical ranges:
     * - Dark/masculine: ratio 2.0-3.5
     * - Bright/feminine: ratio 3.5-6.0
     */
    static calculateResonanceRatio(f1, pitch) {
        if (!f1 || f1 === 0 || !pitch || pitch <= 0) return 0;
        return f1 / pitch;
    }

    /**
     * Validate formant estimate by checking if it's near a harmonic
     * Formants near harmonics are often tracking errors
     */
    static isNearHarmonic(freq, pitch, tolerance = 30) {
        if (!pitch || pitch <= 0) return false;
        for (let h = 1; h <= 10; h++) {
            const harmonic = pitch * h;
            if (Math.abs(freq - harmonic) < tolerance) {
                return true;
            }
        }
        return false;
    }

    static estimateVowel(f1, f2) {
        if (!f1 || !f2 || f1 === 0 || f2 === 0) return '';
        // Complete vowel space coverage based on typical formant ranges (IPA symbols)
        // Values based on acoustic phonetics research for adult speakers

        // Front vowels (high F2)
        // /i/ (heed): low F1, very high F2
        if (f1 < 450 && f2 > 2000) return 'i';
        // /ɪ/ (hid): low-mid F1, high F2
        if (f1 >= 350 && f1 < 550 && f2 > 1700 && f2 <= 2200) return 'ɪ';
        // /e/ (hey): mid-low F1, high F2
        if (f1 >= 400 && f1 < 600 && f2 > 1800 && f2 <= 2300) return 'e';
        // /ɛ/ (bed): mid F1, mid-high F2
        if (f1 >= 500 && f1 < 750 && f2 > 1400 && f2 <= 1900) return 'ɛ';
        // /æ/ (bat): high F1, mid F2
        if (f1 >= 650 && f1 < 900 && f2 > 1400 && f2 <= 1800) return 'æ';

        // Central vowels
        // /ʌ/ (but): mid-high F1, mid F2
        if (f1 >= 550 && f1 < 800 && f2 > 1000 && f2 <= 1400) return 'ʌ';
        // /ə/ (about): mid F1, mid F2 (schwa)
        if (f1 >= 400 && f1 < 600 && f2 > 1200 && f2 <= 1600) return 'ə';

        // Back vowels (low F2)
        // /ɑ/ or /a/ (father): high F1, mid-low F2
        if (f1 > 650 && f2 < 1400 && f2 > 900) return 'a';
        // /ɔ/ (caught): mid-high F1, low F2
        if (f1 >= 500 && f1 < 750 && f2 > 700 && f2 <= 1100) return 'ɔ';
        // /o/ (go): mid F1, low F2
        if (f1 >= 400 && f1 < 600 && f2 >= 700 && f2 < 1200) return 'o';
        // /ʊ/ (hood): low-mid F1, low-mid F2
        if (f1 >= 350 && f1 < 500 && f2 > 900 && f2 <= 1400) return 'ʊ';
        // /u/ (who): low F1, very low F2
        if (f1 < 450 && f2 < 1000) return 'u';

        return '';
    }
}

class ResonanceProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = new Float32Array(2048);
        this.bufferIndex = 0;
        this.threshold = 0.0001; // Initial threshold, will adapt

        // Adaptive Noise Gate
        this.backgroundNoiseBuffer = [];
        this.maxNoiseBufferSize = 50; // ~1 second of silence samples
        this.adaptiveThreshold = 0.0001;
        this.silenceFrameCount = 0;

        // Frame Overlap (50%)
        this.overlapBuffer = new Float32Array(1024);
        this.useOverlap = true;

        this.lastPitch = 0;
        this.lastValidPitch = 0; // For octave jump protection
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
        this.pitchConfidenceThreshold = 0.6;

        // Enhanced formant tracking state
        this.f1Buffer = []; // Multi-frame F1 buffer for median filtering
        this.f2Buffer = []; // Multi-frame F2 buffer for median filtering
        this.normalizedF1 = 0; // Pitch-normalized F1
        this.resonanceRatio = 0; // F1/F0 ratio for vowel-independent measurement
        this.formantConfidence = 0; // Confidence in formant estimates

        this.port.onmessage = (event) => {
            if (event.data.type === 'config') {
                if (event.data.config.threshold !== undefined) {
                    this.threshold = event.data.config.threshold;
                }
            }
        };
    }

    process(inputs, _outputs, _parameters) {
        const input = inputs[0];
        if (!input || !input.length) {
            return true;
        }
        const channel = input[0];

        for (let i = 0; i < channel.length; i++) {
            this.buffer[this.bufferIndex] = channel[i];
            this.bufferIndex++;

            // Frame overlap: analyze at 1024 samples (50% overlap)
            if (this.bufferIndex >= 1024 && this.useOverlap) {
                this.analyze();
                // Keep last 1024 samples for overlap
                this.overlapBuffer.set(this.buffer.slice(1024, 2048));
                this.buffer.set(this.overlapBuffer);
                this.bufferIndex = 1024;
            } else if (this.bufferIndex >= 2048) {
                // Fallback to non-overlap mode
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

        // Adaptive Noise Gate: Update background noise estimate during silence
        if (rms <= this.adaptiveThreshold) {
            this.silenceFrameCount++;
            if (this.silenceFrameCount > 3) { // After 3 silent frames, update background
                this.backgroundNoiseBuffer.push(rms);
                if (this.backgroundNoiseBuffer.length > this.maxNoiseBufferSize) {
                    this.backgroundNoiseBuffer.shift();
                }
                // Calculate adaptive threshold as median * 2.5
                if (this.backgroundNoiseBuffer.length > 10) {
                    const sorted = [...this.backgroundNoiseBuffer].sort((a, b) => a - b);
                    const median = sorted[Math.floor(sorted.length / 2)];
                    this.adaptiveThreshold = Math.max(0.0001, Math.min(0.02, median * 2.5));
                }
            }
        } else {
            this.silenceFrameCount = 0;
        }

        if (rms >= 0) { // Always process to keep state consistent
            const TARGET_RATE = 16000;
            const dsBuffer = DSP.decimate(buffer, fs, TARGET_RATE);

            const preEmphasized = new Float32Array(dsBuffer.length);
            preEmphasized[0] = dsBuffer[0];
            for (let i = 1; i < dsBuffer.length; i++) {
                preEmphasized[i] = dsBuffer[i] - 0.97 * dsBuffer[i - 1];
            }

            const windowed = DSP.applyWindow(preEmphasized);

            // Pitch Detection
            const dynamicThreshold = 0.15;
            const { pitch: rawPitch, confidence: pitchConfidence } = DSP.calculatePitchYIN(buffer, fs, dynamicThreshold);

            let pitch = rawPitch;

            // Octave Jump Protection
            if (pitch > 0 && pitchConfidence > this.pitchConfidenceThreshold) {
                if (this.lastValidPitch > 0) {
                    const ratio = pitch / this.lastValidPitch;
                    const isOctaveJump = (ratio > 1.8 && ratio < 2.2) || (ratio > 0.4 && ratio < 0.6);

                    if (isOctaveJump && pitchConfidence < 0.9) {
                        pitch = -1; // Reject jump
                    } else {
                        this.lastValidPitch = pitch;
                    }
                } else {
                    this.lastValidPitch = pitch;
                }
            } else {
                pitch = -1;
            }

            const spectrum = DSP.simpleFFT(windowed);

            // LPC Analysis for Formants (Only if loud enough)
            let p1 = { freq: 0, amp: -Infinity };
            let p2 = { freq: 0, amp: -Infinity };
            let vowel = '';
            let formantConfidence = 0;

            if (rms > this.adaptiveThreshold * 2) {
                // Adaptive LPC order: higher for cleaner signals
                // Rule of thumb: 2 + sampleRate/1000, but at least 10, at most 16
                const baseOrder = Math.round(2 + TARGET_RATE / 1000);
                const lpcOrder = Math.max(10, Math.min(16, baseOrder));

                const r = DSP.computeAutocorrelation(windowed, lpcOrder);
                const { a, error } = DSP.levinsonDurbin(r, lpcOrder);
                const lpcEnvelope = DSP.computeLPCSpectrum(a, error, 512);
                const formantCandidates = DSP.findPeaks(lpcEnvelope, TARGET_RATE);

                // Find best F1 candidate (200-1200 Hz), avoiding harmonics
                let f1Candidates = [];
                for (let candidate of formantCandidates) {
                    if (candidate.freq >= 200 && candidate.freq <= 1200) {
                        // Skip if too close to a pitch harmonic (tracking error)
                        if (pitch > 0 && DSP.isNearHarmonic(candidate.freq, pitch, 25)) {
                            continue;
                        }
                        f1Candidates.push(candidate);
                    }
                }
                // Sort by amplitude and take the strongest
                f1Candidates.sort((a, b) => b.amp - a.amp);
                if (f1Candidates.length > 0) {
                    p1 = f1Candidates[0];
                }

                // Find best F2 candidate (1200-3500 Hz)
                let f2Candidates = [];
                for (let candidate of formantCandidates) {
                    if (candidate.freq >= 1200 && candidate.freq <= 3500) {
                        if (pitch > 0 && DSP.isNearHarmonic(candidate.freq, pitch, 25)) {
                            continue;
                        }
                        f2Candidates.push(candidate);
                    }
                }
                f2Candidates.sort((a, b) => b.amp - a.amp);
                if (f2Candidates.length > 0) {
                    p2 = f2Candidates[0];
                }

                // Multi-frame median filtering for stability
                if (p1.freq > 0) {
                    this.f1Buffer.push(p1.freq);
                    if (this.f1Buffer.length > 5) this.f1Buffer.shift();
                }
                if (p2.freq > 0) {
                    this.f2Buffer.push(p2.freq);
                    if (this.f2Buffer.length > 5) this.f2Buffer.shift();
                }

                // Use median of buffer for more stable estimate
                if (this.f1Buffer.length >= 3) {
                    const sorted = [...this.f1Buffer].sort((a, b) => a - b);
                    p1.freq = sorted[Math.floor(sorted.length / 2)];
                }
                if (this.f2Buffer.length >= 3) {
                    const sorted = [...this.f2Buffer].sort((a, b) => a - b);
                    p2.freq = sorted[Math.floor(sorted.length / 2)];
                }

                // Calculate formant confidence based on:
                // 1. Number of candidates found
                // 2. Amplitude of selected formants
                // 3. Pitch confidence
                const candidateScore = Math.min(1, (f1Candidates.length + f2Candidates.length) / 4);
                const ampScore = p1.amp > -30 && p2.amp > -30 ? 1 : 0.5;
                const pitchScore = pitchConfidence > 0.7 ? 1 : 0.6;
                formantConfidence = candidateScore * ampScore * pitchScore;
            }

            // Resonance (Spectral Centroid)
            let weightedSum = 0;
            let totalMag = 0;
            for (let i = 0; i < spectrum.length; i++) {
                const freq = (i * TARGET_RATE) / (2 * spectrum.length);
                weightedSum += freq * spectrum[i];
                totalMag += spectrum[i];
            }
            const spectralCentroid = totalMag > 0 ? weightedSum / totalMag : 0;
            const resonanceConfidence = totalMag > 0.01 ? 0.8 : 0.3;

            const resonanceAlpha = 0.2;
            this.smoothedCentroid = (this.lastResonance * (1 - resonanceAlpha)) + (spectralCentroid * resonanceAlpha);
            this.lastResonance = this.smoothedCentroid;

            // Weight (Spectral Tilt)
            let weight = 50;
            if (pitch > 50) {
                const h1Mag = DSP.getMagnitudeAtFrequency(windowed, pitch, TARGET_RATE);
                const h2Mag = DSP.getMagnitudeAtFrequency(windowed, pitch * 2, TARGET_RATE);

                if (h1Mag > 0 && h2Mag > 0) {
                    const h1db = 20 * Math.log10(h1Mag);
                    const h2db = 20 * Math.log10(h2Mag);

                    this.smoothedH1 = this.smoothedH1 * 0.9 + h1db * 0.1;
                    this.smoothedH2 = this.smoothedH2 * 0.9 + h2db * 0.1;

                    const smoothH1H2 = this.smoothedH2 > 0 ? (this.smoothedH1 - this.smoothedH2) : 0;
                    weight = Math.max(0, Math.min(100, 50 + smoothH1H2 * 5));
                }
            }

            // Jitter
            let jitter = 0;
            if (pitch > 0 && this.lastPitch > 0) {
                const diff = Math.abs(pitch - this.lastPitch);
                this.jitterBuffer.push(diff);
                if (this.jitterBuffer.length > 5) this.jitterBuffer.shift();
                jitter = this.jitterBuffer.reduce((a, b) => a + b, 0) / this.jitterBuffer.length;
            }
            this.lastPitch = pitch;

            // Shimmer
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

            // Formant Smoothing
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

            // Calculate pitch-normalized F1 (removes pitch-F1 correlation)
            // This gives a more accurate measure of vocal tract size/resonance
            this.normalizedF1 = DSP.normalizeFoPitch(this.smoothedF1, pitch);

            // Calculate F1/F0 ratio (vowel-independent resonance metric)
            // Typical ranges: Dark 2.0-3.5, Bright 3.5-6.0
            this.resonanceRatio = DSP.calculateResonanceRatio(this.smoothedF1, pitch);

            // Combine formant confidence with pitch confidence for overall reliability score
            const combinedConfidence = formantConfidence * 0.6 + (pitchConfidence * 0.4);
            this.formantConfidence = this.formantConfidence * 0.8 + combinedConfidence * 0.2;

            vowel = DSP.estimateVowel(this.smoothedF1, this.smoothedF2);

            this.port.postMessage({
                type: 'update',
                data: {
                    pitch: pitch > 0 ? pitch : -1,
                    pitchConfidence,
                    resonance: this.smoothedCentroid,
                    resonanceConfidence: this.formantConfidence, // Use combined confidence
                    f1: this.smoothedF1,
                    f2: this.smoothedF2,
                    f1Normalized: this.normalizedF1, // Pitch-corrected F1
                    resonanceRatio: this.resonanceRatio, // F1/F0 ratio
                    weight,
                    volume: rms,
                    jitter,
                    shimmer,
                    vowel,
                    spectrum,
                    isSilent: rms < this.adaptiveThreshold
                },
                audioBuffer: dsBuffer // Send raw audio for streaming
            });
        } else {
            this.lastPitch = 0;
            this.smoothedCentroid = this.smoothedCentroid * 0.9;
            if (this.smoothedCentroid < 50) this.smoothedCentroid = 0;

            this.port.postMessage({
                type: 'update',
                data: {
                    pitch: -1,
                    pitchConfidence: 0,
                    resonance: this.smoothedCentroid,
                    resonanceConfidence: 0,
                    f1: 0,
                    f2: 0,
                    weight: 50,
                    volume: 0,
                    jitter: 0,
                    shimmer: 0,
                    vowel: '',
                    spectrum: null,
                    isSilent: true
                }
            });
        }
    }
}

registerProcessor('resonance-processor', ResonanceProcessor);
