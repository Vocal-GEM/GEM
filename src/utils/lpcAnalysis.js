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

    applyPreEmphasis(signal, coeff = 0.97) {
        const output = new Float32Array(signal.length);
        output[0] = signal[0];
        for (let i = 1; i < signal.length; i++) {
            output[i] = signal[i] - coeff * signal[i - 1];
        }
        return output;
    }

    applyWindow(signal) {
        const N = signal.length;
        const output = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            // Hamming window
            const w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
            output[i] = signal[i] * w;
        }
        return output;
    }

    computeAutocorrelation(signal, order) {
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

    levinsonDurbin(R, order) {
        const a = new Float32Array(order + 1);
        const E = new Float32Array(order + 1);

        // Initialization
        E[0] = R[0];
        a[0] = 1; // a[0] is always 1

        // Temporary arrays
        const k_coeff = new Float32Array(order + 1);
        const a_prev = new Float32Array(order + 1);

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

        return { a: a.slice(1), error: E[order] }; // Return coefficients a1...ap
    }

    computeLPCSpectrum(a, error, numPoints) {
        // Evaluate magnitude response of 1/A(z)
        // A(z) = 1 + a1*z^-1 + ... + ap*z^-p
        // z = e^(j*omega)

        const magnitude = new Float32Array(numPoints);
        const gain = Math.sqrt(error); // Gain G

        if (gain < 1e-10) {
            return new Float32Array(numPoints).fill(-100); // Return low dB floor
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
