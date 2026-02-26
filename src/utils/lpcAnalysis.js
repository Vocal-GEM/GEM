/* eslint-disable no-unused-vars */
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

        // Object pooling to reduce GC pressure
        this.buffers = {};

        // Precomputed trig tables
        this.trigTables = {
            cos: null,
            sin: null,
            order: 0,
            numPoints: 0
        };
    }

    /**
     * ensureBuffer - Get or create a reusable Float32Array
     */
    ensureBuffer(name, size) {
        if (!this.buffers[name] || this.buffers[name].length < size) {
            this.buffers[name] = new Float32Array(size);
        }
        return this.buffers[name];
    }

    /**
     * Calculate LPC coefficients and spectral envelope
     * @param {Float32Array} audioBuffer - Time domain audio data
     * @returns {Object} { coefficients, envelope, formants }
     */
    analyze(audioBuffer) {
        if (!audioBuffer || audioBuffer.length === 0) return null;

        const N = audioBuffer.length;

        // 1. Pre-emphasis
        const signal = this.applyPreEmphasis(audioBuffer);

        // 2. Windowing (Hamming)
        // Note: signal is reused buffer, so pass length explicitly or rely on N
        const windowed = this.applyWindow(signal, N);

        // 3. Autocorrelation
        const r = this.computeAutocorrelation(windowed, this.order, N);

        // 4. Levinson-Durbin Recursion
        const { a, error } = this.levinsonDurbin(r, this.order);

        // 5. Compute Spectral Envelope (Frequency Response of LPC filter)
        // We evaluate the filter H(z) = G / (1 - sum(a[k] * z^-k))
        // at various frequencies.
        const envelope = this.computeLPCSpectrum(a, error, 512); // 512 points

        // 6. Find Formants (Roots of the polynomial or Peak picking from envelope)
        // Peak picking from envelope is simpler and often sufficient for visualization
        const formants = this.findPeaks(envelope, this.sampleRate);

        return {
            coefficients: a, // This is a slice (new array), safe to return
            envelope,       // This is a slice (new array), safe to return
            formants
        };
    }

    applyPreEmphasis(signal, coeff = 0.97) {
        const N = signal.length;
        const output = this.ensureBuffer('signal', N);

        output[0] = signal[0];
        for (let i = 1; i < N; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
        return output; // Returns reusable buffer
    }

    applyWindow(signal, length) {
        const N = length || signal.length;
        const output = this.ensureBuffer('windowed', N);

        // Precompute window if length is stable?
        // For now, compute on fly but avoid allocation
        for (let i = 0; i < N; i++) {
            // Hamming window
            const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
            output[i] = signal[i] * w;
        }
        return output; // Returns reusable buffer
    }

    computeAutocorrelation(signal, order, length) {
        // Reuse buffer for R
        const R = this.ensureBuffer('autocorr', order + 1);
        const N = length || signal.length;

        for (let k = 0; k <= order; k++) {
            let sum = 0;
            for (let i = 0; i < N - k; i++) {
                sum += signal[i] * signal[i + k];
            }
            R[k] = sum;
        }
        return R; // Returns reusable buffer
    }

    levinsonDurbin(R, order) {
        // Reusable buffers
        const a = this.ensureBuffer('levinson_a', order + 1);
        const E = this.ensureBuffer('levinson_E', order + 1);
        const k_coeff = this.ensureBuffer('levinson_k', order + 1);
        const a_prev = this.ensureBuffer('levinson_prev', order + 1);

        // Initialization
        E[0] = R[0];
        a[0] = 1; // a[0] is always 1

        // Clear a_prev just in case, though it's overwritten
        a_prev.fill(0);

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

        // Return slice to ensure immutability for consumer
        return { a: a.slice(1, order + 1), error: E[order] };
    }

    ensureTrigTables(order, numPoints) {
        if (this.trigTables.order === order && this.trigTables.numPoints === numPoints) {
            return;
        }

        const size = numPoints * order;
        this.trigTables.cos = new Float32Array(size);
        this.trigTables.sin = new Float32Array(size);
        this.trigTables.order = order;
        this.trigTables.numPoints = numPoints;

        for (let i = 0; i < numPoints; i++) {
            const omega = (Math.PI * i) / (numPoints - 1);
            for (let k = 0; k < order; k++) {
                const angle = -omega * (k + 1);
                const idx = i * order + k;
                this.trigTables.cos[idx] = Math.cos(angle);
                this.trigTables.sin[idx] = Math.sin(angle);
            }
        }
    }

    computeLPCSpectrum(a, error, numPoints) {
        // Prepare tables
        this.ensureTrigTables(a.length, numPoints);

        const cosTable = this.trigTables.cos;
        const sinTable = this.trigTables.sin;
        const order = a.length;

        // Use a reusable buffer for calculation, but return a slice/copy
        // Actually, we can just create a new Float32Array to return since it's the output
        // and usually consumed immediately or stored.
        // Given existing usage returns a new array, we should probably stick to that
        // or return a slice of a reused buffer.
        // Let's optimize allocation by using a reused buffer but returning a slice.

        const magnitudeBuffer = this.ensureBuffer('magnitude', numPoints);

        const gain = Math.sqrt(error); // Gain G

        if (gain < 1e-10) {
             // Fill buffer with floor
             for(let i=0; i<numPoints; i++) magnitudeBuffer[i] = -100;
             return magnitudeBuffer.slice(0, numPoints);
        }

        for (let i = 0; i < numPoints; i++) {
            let real = 1.0;
            let imag = 0.0;

            const baseIdx = i * order;

            for (let k = 0; k < order; k++) {
                // const angle = -omega * (k + 1);
                // real += a[k] * Math.cos(angle);
                // imag += a[k] * Math.sin(angle);

                real += a[k] * cosTable[baseIdx + k];
                imag += a[k] * sinTable[baseIdx + k];
            }

            const magA = Math.sqrt(real * real + imag * imag);
            magnitudeBuffer[i] = 20 * Math.log10(gain / (magA + 1e-10)); // dB
        }

        return magnitudeBuffer.slice(0, numPoints);
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
