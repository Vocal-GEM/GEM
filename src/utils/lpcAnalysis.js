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
        this.numPoints = 512; // Fixed resolution for spectrum

        // Reusable Buffers
        this._preEmphasisBuffer = null;
        this._windowBuffer = null;
        this._autocorrBuffer = new Float32Array(this.order + 1);
        this._levinsonBuffers = {
            a: new Float32Array(this.order + 1),
            e: new Float32Array(this.order + 1),
            k_coeff: new Float32Array(this.order + 1),
            a_prev: new Float32Array(this.order + 1)
        };
        this._spectrumBuffer = new Float32Array(this.numPoints);

        // Precomputed Tables
        this._hammingWindow = null;
        this._cosTable = null;
        this._sinTable = null;

        this._initTrigTables();
    }

    _initBuffers(size) {
        if (!this._preEmphasisBuffer || this._preEmphasisBuffer.length !== size) {
            this._preEmphasisBuffer = new Float32Array(size);
            this._windowBuffer = new Float32Array(size);

            // Recompute Window
            this._hammingWindow = new Float32Array(size);
            for (let i = 0; i < size; i++) {
                this._hammingWindow[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (size - 1));
            }
        }
    }

    _initTrigTables() {
        // Precompute Cos/Sin for computeLPCSpectrum
        // Outer loop: numPoints (0 to 511)
        // Inner loop: order (1 to order) -> k
        // angle = -omega * k
        // omega = (Math.PI * i) / (numPoints - 1)

        this._cosTable = new Float32Array(this.numPoints * (this.order + 1));
        this._sinTable = new Float32Array(this.numPoints * (this.order + 1));

        for (let i = 0; i < this.numPoints; i++) {
            const omega = (Math.PI * i) / (this.numPoints - 1);
            for (let k = 1; k <= this.order; k++) { // We only need k=1 to order
                const angle = -omega * k;
                const idx = i * (this.order + 1) + k;
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

        // Ensure buffers match input size
        this._initBuffers(audioBuffer.length);

        // 1. Pre-emphasis
        const signal = this.applyPreEmphasis(audioBuffer);

        // 2. Windowing (Hamming)
        const windowed = this.applyWindow(signal);

        // 3. Autocorrelation
        this.computeAutocorrelation(windowed, this.order, this._autocorrBuffer);
        const r = this._autocorrBuffer;

        // 4. Levinson-Durbin Recursion
        const { a, error } = this.levinsonDurbin(r, this.order);

        // 5. Compute Spectral Envelope (Frequency Response of LPC filter)
        // We evaluate the filter H(z) = G / (1 - sum(a[k] * z^-k))
        // at various frequencies.
        const envelope = this.computeLPCSpectrum(a, error); // 512 points

        // 6. Find Formants (Roots of the polynomial or Peak picking from envelope)
        // Peak picking from envelope is simpler and often sufficient for visualization
        const formants = this.findPeaks(envelope, this.sampleRate);

        return {
            coefficients: a,
            envelope: envelope.slice(), // Return a copy to ensure immutability for React consumers
            formants
        };
    }

    applyPreEmphasis(signal, coeff = 0.97) {
        const output = this._preEmphasisBuffer;
        output[0] = signal[0];
        for (let i = 1; i < signal.length; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
        return output;
    }

    applyWindow(signal) {
        const output = this._windowBuffer;
        const window = this._hammingWindow;
        for (let i = 0; i < signal.length; i++) {
            // Hamming window
            output[i] = signal[i] * window[i];
        }
        return output;
    }

    computeAutocorrelation(signal, order, outputBuffer) {
        const N = signal.length;
        // outputBuffer is this._autocorrBuffer
        for (let k = 0; k <= order; k++) {
            let sum = 0;
            for (let i = 0; i < N - k; i++) {
                sum += signal[i] * signal[i + k];
            }
            outputBuffer[k] = sum;
        }
        return outputBuffer;
    }

    levinsonDurbin(R, order) {
        const { a, e: E, k_coeff, a_prev } = this._levinsonBuffers;

        // Initialization
        E[0] = R[0];
        a[0] = 1; // a[0] is always 1

        // Temporary arrays
        // const k_coeff = new Float32Array(order + 1);
        // const a_prev = new Float32Array(order + 1);

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
            // for (let j = 0; j <= i; j++) a_prev[j] = a[j];
            a_prev.set(a.subarray(0, i + 1));
        }

        // The coefficients 'a' correspond to 1, -a1, -a2... in standard DSP notation for IIR denominator
        // But Levinson returns 1, a1, a2... where H(z) = G / (1 + sum(ak * z^-k))
        // Usually we want the predictor coefficients.
        // Let's stick to the standard definition: A(z) = 1 + sum_{k=1}^p a_k z^{-k}

        return { a: a.subarray(1, order + 1), error: E[order] }; // Return coefficients a1...ap as subarray
    }

    computeLPCSpectrum(a, error) {
        const numPoints = this.numPoints;
        const magnitude = this._spectrumBuffer;
        const gain = Math.sqrt(error); // Gain G

        if (gain < 1e-10) {
            magnitude.fill(-100);
            return magnitude;
        }

        for (let i = 0; i < numPoints; i++) {
            // const omega = (Math.PI * i) / (numPoints - 1); // 0 to Pi

            let real = 1.0;
            let imag = 0.0;

            const tableBase = i * (this.order + 1);

            for (let k = 0; k < a.length; k++) {
                // const angle = -omega * (k + 1);
                // real += a[k] * Math.cos(angle);
                // imag += a[k] * Math.sin(angle);

                const idx = tableBase + k + 1;
                const cosVal = this._cosTable[idx];
                const sinVal = this._sinTable[idx];

                real += a[k] * cosVal;
                imag += a[k] * sinVal;
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
