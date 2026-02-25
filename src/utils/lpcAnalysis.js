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

        // Buffers
        this._bufferSize = 0;
        this._preEmphasisBuffer = null;
        this._windowBuffer = null;
        this._hammingWindow = null;
        this._autocorrBuffer = new Float32Array(order + 1);

        // Levinson-Durbin buffers
        this._a = new Float32Array(order + 1);
        this._E = new Float32Array(order + 1);
        this._k_coeff = new Float32Array(order + 1);
        this._a_prev = new Float32Array(order + 1);

        // Spectrum tables
        this._numPoints = 0;
        this._cosTable = null; // Float32Array, size numPoints * order
        this._sinTable = null; // Float32Array, size numPoints * order
        this._spectrumBuffer = null; // Float32Array, size numPoints
    }

    /**
     * Ensure internal buffers are sized correctly for input length
     */
    ensureBuffers(size) {
        if (this._bufferSize !== size) {
            this._bufferSize = size;
            this._preEmphasisBuffer = new Float32Array(size);
            this._windowBuffer = new Float32Array(size);
            this._hammingWindow = new Float32Array(size);

            // Precompute Hamming window
            for (let i = 0; i < size; i++) {
                this._hammingWindow[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (size - 1));
            }
        }
    }

    /**
     * Ensure trig tables are sized correctly for spectrum resolution
     */
    ensureTables(numPoints) {
        if (this._numPoints !== numPoints) {
            this._numPoints = numPoints;
            const totalSize = numPoints * this.order;
            this._cosTable = new Float32Array(totalSize);
            this._sinTable = new Float32Array(totalSize);
            this._spectrumBuffer = new Float32Array(numPoints);

            // Precompute tables
            // angle = -omega * (k + 1) where omega = PI * i / (numPoints - 1)
            for (let i = 0; i < numPoints; i++) {
                const omega = (Math.PI * i) / (numPoints - 1);
                for (let k = 0; k < this.order; k++) {
                    const angle = -omega * (k + 1);
                    const idx = i * this.order + k;
                    this._cosTable[idx] = Math.cos(angle);
                    this._sinTable[idx] = Math.sin(angle);
                }
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

        this.ensureBuffers(audioBuffer.length);

        // 1. Pre-emphasis
        this.applyPreEmphasis(audioBuffer);

        // 2. Windowing (Hamming)
        this.applyWindow(this._preEmphasisBuffer);

        // 3. Autocorrelation
        this.computeAutocorrelation(this._windowBuffer);

        // 4. Levinson-Durbin Recursion
        const { a, error } = this.levinsonDurbin(this._autocorrBuffer);

        // 5. Compute Spectral Envelope (Frequency Response of LPC filter)
        // We evaluate the filter H(z) = G / (1 - sum(a[k] * z^-k))
        // at various frequencies.
        const numPoints = 512;
        this.ensureTables(numPoints);
        const envelope = this.computeLPCSpectrum(a, error); // 512 points

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
        const output = this._preEmphasisBuffer;
        output[0] = signal[0];
        const len = signal.length;
        for (let i = 1; i < len; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
    }

    applyWindow(signal) {
        const output = this._windowBuffer;
        const window = this._hammingWindow;
        const len = signal.length;
        for (let i = 0; i < len; i++) {
            output[i] = signal[i] * window[i];
        }
    }

    computeAutocorrelation(signal) {
        const R = this._autocorrBuffer;
        const N = signal.length;
        const order = this.order;

        for (let k = 0; k <= order; k++) {
            let sum = 0;
            const limit = N - k;
            for (let i = 0; i < limit; i++) {
                sum += signal[i] * signal[i + k];
            }
            R[k] = sum;
        }
    }

    levinsonDurbin(R) {
        const a = this._a;
        const E = this._E;
        const k_coeff = this._k_coeff;
        const a_prev = this._a_prev;
        const order = this.order;

        // Initialization
        E[0] = R[0];
        a[0] = 1; // a[0] is always 1

        // Prepare a_prev for first iteration
        a_prev[0] = 1;
        for(let i=1; i<=order; i++) a_prev[i] = 0;

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

        // Return copy of coefficients to avoid mutation issues
        const coeffs = new Float32Array(order);
        for(let i=0; i<order; i++) coeffs[i] = a[i+1];

        return { a: coeffs, error: E[order] }; // Return coefficients a1...ap
    }

    computeLPCSpectrum(a, error) {
        // Evaluate magnitude response of 1/A(z)
        // A(z) = 1 + a1*z^-1 + ... + ap*z^-p
        // z = e^(j*omega)

        const magnitude = this._spectrumBuffer;
        const gain = Math.sqrt(error); // Gain G
        const numPoints = this._numPoints;
        const cosTable = this._cosTable;
        const sinTable = this._sinTable;
        const order = this.order;

        if (gain < 1e-10) {
            magnitude.fill(-100); // Return low dB floor
            return magnitude;
        }

        for (let i = 0; i < numPoints; i++) {
            let real = 1.0;
            let imag = 0.0;
            const offset = i * order;

            for (let k = 0; k < order; k++) {
                real += a[k] * cosTable[offset + k];
                imag += a[k] * sinTable[offset + k];
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
