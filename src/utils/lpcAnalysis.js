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

        // Optimization: Precomputed tables
        this._cosTable = null;
        this._sinTable = null;
        this._numPoints = 512;
        this._initTables(this._numPoints);

        // Optimization: Reusable buffers
        this._preEmphasisBuffer = null;
        this._windowBuffer = null;

        // Fixed size buffers based on order
        this._autocorrBuffer = new Float32Array(this.order + 1);
        this._levinsonA = new Float32Array(this.order + 1);
        this._levinsonE = new Float32Array(this.order + 1);
        this._levinsonK = new Float32Array(this.order + 1);
        this._levinsonAPrev = new Float32Array(this.order + 1);

        // Output buffer for spectrum
        this._spectrumBuffer = new Float32Array(this._numPoints);
    }

    _initTables(numPoints) {
        if (this._cosTable && this._cosTable.length === numPoints * this.order) return;

        this._numPoints = numPoints;
        this._cosTable = new Float32Array(numPoints * this.order);
        this._sinTable = new Float32Array(numPoints * this.order);

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
        // Uses internal _autocorrBuffer
        this.computeAutocorrelation(windowed, this.order);

        // 4. Levinson-Durbin Recursion
        // Uses internal buffers and returns error + reference to coefficients
        const error = this.levinsonDurbin(this._autocorrBuffer, this.order);

        // Get coefficients from internal buffer (excluding a[0] which is 1)
        // We use subarray to avoid allocation, but be careful if caller stores this
        const a = this._levinsonA.subarray(1, this.order + 1);

        // 5. Compute Spectral Envelope (Frequency Response of LPC filter)
        // We evaluate the filter H(z) = G / (1 - sum(a[k] * z^-k))
        // at various frequencies.
        const envelope = this.computeLPCSpectrum(a, error, 512); // 512 points

        // 6. Find Formants (Roots of the polynomial or Peak picking from envelope)
        // Peak picking from envelope is simpler and often sufficient for visualization
        const formants = this.findPeaks(envelope, this.sampleRate);

        return {
            coefficients: Array.from(a), // Return copy for safety
            envelope: envelope, // Returns internal buffer, usually safe for immediate render
            formants
        };
    }

    applyPreEmphasis(signal, coeff = 0.97) {
        if (!this._preEmphasisBuffer || this._preEmphasisBuffer.length < signal.length) {
            this._preEmphasisBuffer = new Float32Array(signal.length);
        }

        const output = this._preEmphasisBuffer.subarray(0, signal.length);
        output[0] = signal[0];
        for (let i = 1; i < signal.length; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
        return output;
    }

    applyWindow(signal) {
        const N = signal.length;
        if (!this._windowBuffer || this._windowBuffer.length < N) {
            this._windowBuffer = new Float32Array(N);
        }

        const output = this._windowBuffer.subarray(0, N);
        for (let i = 0; i < N; i++) {
            // Hamming window
            const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
            output[i] = signal[i] * w;
        }
        return output;
    }

    computeAutocorrelation(signal, order) {
        // Results stored in this._autocorrBuffer
        const R = this._autocorrBuffer;
        const N = signal.length;

        for (let k = 0; k <= order; k++) {
            let sum = 0;
            // Optimization: Unroll loop slightly or just trust JIT
            for (let i = 0; i < N - k; i++) {
                sum += signal[i] * signal[i + k];
            }
            R[k] = sum;
        }
        return R;
    }

    levinsonDurbin(R, order) {
        const a = this._levinsonA;
        const E = this._levinsonE;
        const k_coeff = this._levinsonK;
        const a_prev = this._levinsonAPrev;

        // Initialization
        E[0] = R[0];
        a[0] = 1; // a[0] is always 1

        // Zero out buffers just in case
        for(let i=1; i<=order; i++) {
            a[i] = 0;
            a_prev[i] = 0;
        }
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

        // Return error energy
        return E[order];
    }

    computeLPCSpectrum(a, error, numPoints) {
        // Initialize tables if needed (rare case where numPoints changes)
        if (numPoints !== this._numPoints) {
            this._initTables(numPoints);
            this._spectrumBuffer = new Float32Array(numPoints);
        }

        const magnitude = this._spectrumBuffer;
        const gain = Math.sqrt(error); // Gain G

        if (gain < 1e-10) {
            magnitude.fill(-100);
            return magnitude;
        }

        const cosTable = this._cosTable;
        const sinTable = this._sinTable;
        const order = this.order;

        for (let i = 0; i < numPoints; i++) {
            // const omega = (Math.PI * i) / (numPoints - 1); // 0 to Pi

            let real = 1.0;
            let imag = 0.0;

            for (let k = 0; k < a.length; k++) {
                // const angle = -omega * (k + 1);
                // real += a[k] * Math.cos(angle);
                // imag += a[k] * Math.sin(angle);

                // Use precomputed values
                // idx = i * order + k
                const idx = i * order + k;
                real += a[k] * cosTable[idx];
                imag += a[k] * sinTable[idx];
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
