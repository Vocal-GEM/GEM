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
        this.order = order; // Typically 10-12 for speech at 8-10kHz, maybe higher for 48kHz
        this.sampleRate = sampleRate;

        // Reusable buffers to minimize GC
        this._preEmphasisBuffer = null;
        this._windowBuffer = null;
        this._windowWeights = null;
        this._autocorrBuffer = new Float32Array(this.order + 1);

        // Levinson-Durbin reusable buffers
        this._ld_a = new Float32Array(this.order + 1);
        this._ld_E = new Float32Array(this.order + 1);
        this._ld_k = new Float32Array(this.order + 1);
        this._ld_a_prev = new Float32Array(this.order + 1);

        // Spectrum buffers and cached tables
        this._spectrumPoints = 512;
        this._spectrumBuffer = new Float32Array(this._spectrumPoints);
        this._cosTable = new Float32Array(this._spectrumPoints * this.order);
        this._sinTable = new Float32Array(this._spectrumPoints * this.order);
        this._initSpectrumTables();
    }

    _initSpectrumTables() {
        for (let i = 0; i < this._spectrumPoints; i++) {
            const omega = (Math.PI * i) / (this._spectrumPoints - 1);
            for (let k = 0; k < this.order; k++) {
                const angle = -omega * (k + 1);
                const idx = i * this.order + k;
                this._cosTable[idx] = Math.cos(angle);
                this._sinTable[idx] = Math.sin(angle);
            }
        }
    }

    /**
     * Calculate LPC coefficients and spectral envelope
     * @param {Float32Array} audioBuffer - Time domain audio data
     * @returns {Object} { coefficients, envelope, formants }
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

        // 5. Compute Spectral Envelope (Frequency Response of LPC filter)
        // We evaluate the filter H(z) = G / (1 - sum(a[k] * z^-k))
        // at various frequencies.
        // Returns a copy (.slice()) to ensure immutability for React consumers
        const envelope = this.computeLPCSpectrum(a, error, this._spectrumPoints).slice();

        // 6. Find Formants (Roots of the polynomial or Peak picking from envelope)
        // Peak picking from envelope is simpler and often sufficient for visualization
        const formants = this.findPeaks(envelope, this.sampleRate);

        return {
            coefficients: a,
            envelope,
            formants
        };
    }

    applyPreEmphasis(signal, coeff = 0.97) {
        const len = signal.length;
        if (!this._preEmphasisBuffer || this._preEmphasisBuffer.length !== len) {
            this._preEmphasisBuffer = new Float32Array(len);
        }
        const output = this._preEmphasisBuffer;

        output[0] = signal[0];
        for (let i = 1; i < len; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
        return output;
    }

    applyWindow(signal) {
        const N = signal.length;

        // Cache window weights if size matches
        if (!this._windowWeights || this._windowWeights.length !== N) {
            this._windowWeights = new Float32Array(N);
            this._windowBuffer = new Float32Array(N);
            for (let i = 0; i < N; i++) {
                // Hamming window
                this._windowWeights[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
            }
        }

        const output = this._windowBuffer;
        const weights = this._windowWeights;

        for (let i = 0; i < N; i++) {
            output[i] = signal[i] * weights[i];
        }
        return output;
    }

    computeAutocorrelation(signal, order) {
        // Use reusable buffer
        const R = this._autocorrBuffer;
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
        // Use reusable buffers
        const a = this._ld_a;
        const E = this._ld_E;
        const k_coeff = this._ld_k;
        const a_prev = this._ld_a_prev;

        // Initialization
        E[0] = R[0];
        a[0] = 1; // a[0] is always 1

        // IMPORTANT: Initialize a_prev[0] for the first iteration logic
        a_prev[0] = 1;

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

            a[i] = k; // a[i] in this iteration is just k

            for (let j = 1; j < i; j++) {
                a[j] = a_prev[j] - k * a_prev[i - j];
            }

            E[i] = E[i - 1] * (1 - k * k);

            // Update a_prev for next iteration
            for (let j = 0; j <= i; j++) a_prev[j] = a[j];
        }

        // The coefficients 'a' correspond to 1, -a1, -a2... in standard DSP notation for IIR denominator
        // But Levinson returns 1, a1, a2... where H(z) = G / (1 + sum(ak * z^-k))
        // Usually we want the predictor coefficients.
        // Let's stick to the standard definition: A(z) = 1 + sum_{k=1}^p a_k z^{-k}

        return { a: a.slice(1, order + 1), error: E[order] }; // Return copy of coefficients a1...ap
    }

    computeLPCSpectrum(a, error, numPoints) {
        // Check if cached tables need resize (rare case where numPoints changes)
        if (numPoints !== this._spectrumPoints) {
            this._spectrumPoints = numPoints;
            this._spectrumBuffer = new Float32Array(numPoints);
            this._cosTable = new Float32Array(numPoints * this.order);
            this._sinTable = new Float32Array(numPoints * this.order);
            this._initSpectrumTables();
        }

        const magnitude = this._spectrumBuffer;
        const gain = Math.sqrt(error); // Gain G

        if (gain < 1e-10) {
            magnitude.fill(-100); // Return low dB floor
            return magnitude;
        }

        const order = a.length; // Should match this.order

        for (let i = 0; i < numPoints; i++) {
            let real = 1.0;
            let imag = 0.0;

            const tableOffset = i * this.order;

            for (let k = 0; k < order; k++) {
                // Use precomputed trig tables
                real += a[k] * this._cosTable[tableOffset + k];
                imag += a[k] * this._sinTable[tableOffset + k];
            }

            const magA = Math.sqrt(real * real + imag * imag);
            magnitude[i] = 20 * Math.log10(gain / (magA + 1e-10)); // dB
        }

        return magnitude;
    }

    findPeaks(envelope, sampleRate) {
        const peaks = [];
        const numPoints = envelope.length;

        // Simple peak picking
        for (let i = 1; i < numPoints - 1; i++) {
            if (envelope[i] > envelope[i - 1] && envelope[i] > envelope[i + 1]) {
                // Convert index to frequency
                // Index 0 = 0Hz, Index numPoints-1 = Nyquist (sampleRate/2)
                const freq = (i / (numPoints - 1)) * (sampleRate / 2);

                // Filter out very low frequencies (below 200Hz usually not F1)
                if (freq > 200) {
                    peaks.push({ freq, amp: envelope[i] });
                }
            }
        }

        return peaks;
    }
}

export const lpcAnalyzer = new LPCAnalyzer();
