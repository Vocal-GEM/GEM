/**
 * lpcAnalysis.js
 * 
 * Linear Predictive Coding (LPC) Analysis for Formant Tracking
 * 
 * LPC models the vocal tract as an all-pole filter. The spectral envelope
 * derived from LPC coefficients provides a smooth representation of the
 * vocal tract transfer function, making it ideal for identifying formants
 * (F1, F2, F3, etc.) independent of the harmonic structure.
 */

export class LPCAnalyzer {
    constructor(order = 12, sampleRate = 48000) {
        this.order = order; // Typically 10-12 for speech
        this.sampleRate = sampleRate;

        // Reusable buffers to minimize Garbage Collection
        this._bufferPreEmphasis = null;
        this._bufferWindow = null;
        this._bufferAutocorr = null;

        // Levinson-Durbin buffers
        this._levinsonBuffers = {
            a: null,
            E: null,
            k_coeff: null,
            a_prev: null
        };

        // Spectrum buffer
        this._bufferSpectrum = null;
    }

    /**
     * Calculate LPC coefficients and spectral envelope
     * @param {Float32Array} audioBuffer - Time domain audio data
     * @returns {Object} { coefficients, envelope, formants }
     * @warning The returned `coefficients` and `envelope` arrays are views into shared internal buffers.
     * Do not modify them or expect them to persist across subsequent calls to `analyze`.
     * Copy them if you need long-term storage (e.g., `new Float32Array(result.envelope)`).
     */
    analyze(audioBuffer) {
        if (!audioBuffer || audioBuffer.length === 0) return null;

        // 1. Pre-emphasis
        const signal = this.applyPreEmphasis(audioBuffer);

        // 2. Windowing (Hamming)
        const windowed = this.applyWindow(signal);

        // 3. Autocorrelation
        const r = this.computeAutocorrelation(windowed, this.order);

        // 4. Levinson-Durbin Recursion
        const { a, error } = this.levinsonDurbin(r, this.order);

        // 5. Compute Spectral Envelope
        const envelope = this.computeLPCSpectrum(a, error, 512); // 512 points

        // 6. Find Formants
        const formants = this.findPeaks(envelope, this.sampleRate);

        return {
            coefficients: a, // Subarray view (transient)
            envelope,       // Subarray view (transient)
            formants        // New array (small, safe to store)
        };
    }

    applyPreEmphasis(signal, coeff = 0.97) {
        const len = signal.length;
        if (!this._bufferPreEmphasis || this._bufferPreEmphasis.length < len) {
            this._bufferPreEmphasis = new Float32Array(len);
        }
        const output = this._bufferPreEmphasis.subarray(0, len);

        output[0] = signal[0];
        for (let i = 1; i < len; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
        return output;
    }

    applyWindow(signal) {
        const N = signal.length;
        if (!this._bufferWindow || this._bufferWindow.length < N) {
            this._bufferWindow = new Float32Array(N);
        }
        const output = this._bufferWindow.subarray(0, N);

        for (let i = 0; i < N; i++) {
            // Hamming window
            const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
            output[i] = signal[i] * w;
        }
        return output;
    }

    computeAutocorrelation(signal, order) {
        if (!this._bufferAutocorr || this._bufferAutocorr.length < order + 1) {
            this._bufferAutocorr = new Float32Array(order + 1);
        }
        const R = this._bufferAutocorr.subarray(0, order + 1);

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

    levinsonDurbin(R, order) {
        // Ensure buffers
        if (!this._levinsonBuffers.a || this._levinsonBuffers.a.length < order + 1) {
            this._levinsonBuffers.a = new Float32Array(order + 1);
            this._levinsonBuffers.E = new Float32Array(order + 1);
            this._levinsonBuffers.k_coeff = new Float32Array(order + 1);
            this._levinsonBuffers.a_prev = new Float32Array(order + 1);
        }

        const a = this._levinsonBuffers.a;
        const E = this._levinsonBuffers.E;
        const k_coeff = this._levinsonBuffers.k_coeff;
        const a_prev = this._levinsonBuffers.a_prev;

        // Initialization
        E[0] = R[0];
        a[0] = 1;

        for (let i = 1; i <= order; i++) {
            let sum = 0;
            for (let j = 1; j < i; j++) {
                sum += a_prev[j] * R[i - j];
            }

            if (Math.abs(E[i - 1]) < 1e-10) {
                k_coeff[i] = 0;
            } else {
                k_coeff[i] = (R[i] - sum) / E[i - 1];
            }
            const k = k_coeff[i];

            a[i] = k;

            for (let j = 1; j < i; j++) {
                a[j] = a_prev[j] - k * a_prev[i - j];
            }

            E[i] = E[i - 1] * (1 - k * k);

            // Update a_prev for next iteration
            for (let j = 0; j <= i; j++) a_prev[j] = a[j];
        }

        // Return view of coefficients (a1...ap)
        return { a: a.subarray(1, order + 1), error: E[order] };
    }

    computeLPCSpectrum(a, error, numPoints) {
        if (!this._bufferSpectrum || this._bufferSpectrum.length < numPoints) {
            this._bufferSpectrum = new Float32Array(numPoints);
        }
        const magnitude = this._bufferSpectrum.subarray(0, numPoints);

        const gain = Math.sqrt(error);

        if (gain < 1e-10) {
            magnitude.fill(-100);
            return magnitude;
        }

        for (let i = 0; i < numPoints; i++) {
            const omega = (Math.PI * i) / (numPoints - 1); // 0 to Pi

            let real = 1.0;
            let imag = 0.0;

            for (let k = 0; k < a.length; k++) {
                const angle = -omega * (k + 1);
                real += a[k] * Math.cos(angle);
                imag += a[k] * Math.sin(angle);
            }

            const magA = Math.sqrt(real * real + imag * imag);
            magnitude[i] = 20 * Math.log10(gain / (magA + 1e-10)); // dB
        }

        return magnitude;
    }

    findPeaks(envelope, sampleRate) {
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
}

export const lpcAnalyzer = new LPCAnalyzer();
