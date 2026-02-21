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

        // Internal buffers to avoid allocation in loop
        this._preEmphasisBuffer = null;
        this._windowBuffer = null;

        // Fixed size buffers for order-dependent calculations
        // We allocate these once as order rarely changes
        this._rBuffer = new Float32Array(order + 1);
        this._aBuffer = new Float32Array(order + 1);
        this._eBuffer = new Float32Array(order + 1);
        this._kBuffer = new Float32Array(order + 1);
        this._prevABuffer = new Float32Array(order + 1);

        // Spectrum optimization
        this._spectrumNumPoints = 0;
        this._spectrumOrder = 0;
        this._cosTable = null;
        this._sinTable = null;
        this._spectrumBuffer = null;
    }

    /**
     * Calculate LPC coefficients and spectral envelope
     * @param {Float32Array} audioBuffer - Time domain audio data
     * @returns {Object} { coefficients, envelope, formants }
     */
    analyze(audioBuffer) {
        if (!audioBuffer || audioBuffer.length === 0) return null;

        // Ensure buffers are large enough
        this._ensureBuffers(audioBuffer.length);

        // 1. Pre-emphasis
        // Writes to this._preEmphasisBuffer
        this.applyPreEmphasis(audioBuffer);
        const signal = this._preEmphasisBuffer;

        // 2. Windowing (Hamming)
        // Writes to this._windowBuffer
        this.applyWindow(signal, audioBuffer.length);
        const windowed = this._windowBuffer;

        // 3. Autocorrelation
        // Writes to this._rBuffer
        this.computeAutocorrelation(windowed, audioBuffer.length, this.order);

        // 4. Levinson-Durbin Recursion
        // Returns coefficients (copy) and error
        const { a, error } = this.levinsonDurbin(this._rBuffer, this.order);

        // 5. Compute Spectral Envelope (Frequency Response of LPC filter)
        // We evaluate the filter H(z) = G / (1 - sum(a[k] * z^-k))
        // at various frequencies.
        const envelope = this.computeLPCSpectrum(a, error, 512); // 512 points

        // 6. Find Formants (Roots of the polynomial or Peak picking from envelope)
        // Peak picking from envelope is simpler and often sufficient for visualization
        const formants = this.findPeaks(envelope, this.sampleRate);

        return {
            coefficients: a,
            envelope,
            formants
        };
    }

    _ensureBuffers(length) {
        if (!this._preEmphasisBuffer || this._preEmphasisBuffer.length < length) {
            this._preEmphasisBuffer = new Float32Array(length);
            this._windowBuffer = new Float32Array(length);
        }
    }

    applyPreEmphasis(signal, coeff = 0.97) {
        const output = this._preEmphasisBuffer;
        output[0] = signal[0];
        const len = signal.length;
        for (let i = 1; i < len; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
    }

    applyWindow(signal, length) {
        const output = this._windowBuffer;
        for (let i = 0; i < length; i++) {
            // Hamming window
            const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (length - 1));
            output[i] = signal[i] * w;
        }
    }

    computeAutocorrelation(signal, length, order) {
        const R = this._rBuffer;
        // Ensure R buffer is large enough if order changed (unlikely)
        if (R.length < order + 1) {
             this._rBuffer = new Float32Array(order + 1);
        }

        for (let k = 0; k <= order; k++) {
            let sum = 0;
            // Optimization: limit inner loop
            const limit = length - k;
            for (let i = 0; i < limit; i++) {
                sum += signal[i] * signal[i + k];
            }
            this._rBuffer[k] = sum;
        }
    }

    levinsonDurbin(R, order) {
        // Use internal buffers
        if (this._aBuffer.length < order + 1) {
            this._aBuffer = new Float32Array(order + 1);
            this._eBuffer = new Float32Array(order + 1);
            this._kBuffer = new Float32Array(order + 1);
            this._prevABuffer = new Float32Array(order + 1);
        }

        const a = this._aBuffer;
        const E = this._eBuffer;
        const k_coeff = this._kBuffer;
        const a_prev = this._prevABuffer;

        // Initialization
        E[0] = R[0];
        a[0] = 1; // a[0] is always 1

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

        // Return a copy of coefficients a1...ap
        return { a: a.slice(1, order + 1), error: E[order] };
    }

    computeLPCSpectrum(a, error, numPoints) {
        // Update buffers/tables if needed
        this._ensureSpectrumBuffers(numPoints, a.length);

        const magnitude = this._spectrumBuffer;
        const cosTable = this._cosTable;
        const sinTable = this._sinTable;

        const gain = Math.sqrt(error); // Gain G

        if (gain < 1e-10) {
            // Fill with low dB floor
            for (let i = 0; i < numPoints; i++) magnitude[i] = -100;
            return magnitude.slice(0, numPoints); // Return copy
        }

        const order = a.length;

        for (let i = 0; i < numPoints; i++) {
            let real = 1.0;
            let imag = 0.0;

            // Use precomputed tables
            // Index in table = i * order + k
            let tableOffset = i * order;

            for (let k = 0; k < order; k++) {
                // a[k] corresponds to k+1 in formula term because a is 0-indexed here
                // but represents a1...ap.
                // The angle was -omega * (k+1).

                const cosVal = cosTable[tableOffset + k];
                const sinVal = sinTable[tableOffset + k];

                real += a[k] * cosVal;
                imag += a[k] * sinVal;
            }

            const magA = Math.sqrt(real * real + imag * imag);
            magnitude[i] = 20 * Math.log10(gain / (magA + 1e-10)); // dB
        }

        // Return a copy to be safe as consumers might store it
        return magnitude.slice(0, numPoints);
    }

    _ensureSpectrumBuffers(numPoints, order) {
        // If dimensions changed, reallocate and recompute tables
        if (this._spectrumNumPoints !== numPoints || this._spectrumOrder !== order) {
            this._spectrumNumPoints = numPoints;
            this._spectrumOrder = order;

            // Allocate magnitude buffer
            if (!this._spectrumBuffer || this._spectrumBuffer.length < numPoints) {
                this._spectrumBuffer = new Float32Array(numPoints);
            }

            // Allocate and compute trig tables
            // Size: numPoints * order
            const size = numPoints * order;
            this._cosTable = new Float32Array(size);
            this._sinTable = new Float32Array(size);

            for (let i = 0; i < numPoints; i++) {
                const omega = (Math.PI * i) / (numPoints - 1); // 0 to Pi

                for (let k = 0; k < order; k++) {
                    const angle = -omega * (k + 1);
                    const idx = i * order + k;
                    this._cosTable[idx] = Math.cos(angle);
                    this._sinTable[idx] = Math.sin(angle);
                }
            }
        }
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
