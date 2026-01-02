/**
 * Formant Tracker
 * 
 * Extracts individual formant frequencies (F1-F4) using Linear Predictive Coding (LPC).
 * Formants are resonant frequencies of the vocal tract that determine vowel quality.
 * 
 * F1 (300-800 Hz): Vowel openness (open vs. close)
 * F2 (800-2500 Hz): Vowel frontness/backness (front vs. back)
 * F3 (2500-3500 Hz): Brightness/resonance
 * F4 (3500+ Hz): Speaker characteristics
 * 
 * @module formantTracker
 */

/**
 * Formant Tracker class using LPC analysis
 */
export class FormantTracker {
    /**
     * @param {number} sampleRate - Audio sample rate
     * @param {number} lpcOrder - LPC order (default 12 for formant analysis)
     */
    constructor(sampleRate, lpcOrder = 12) {
        this.sampleRate = sampleRate;
        this.lpcOrder = lpcOrder;
        this.preEmphasisCoeff = 0.97;
    }

    /**
     * Extract formants from audio buffer
     * @param {Float32Array} audioBuffer - Audio samples
     * @returns {Object} { F1, F2, F3, F4, bandwidth } - Formant frequencies and bandwidths
     */
    extractFormants(audioBuffer) {
        if (!audioBuffer || audioBuffer.length === 0) {
            return { F1: null, F2: null, F3: null, F4: null };
        }

        // Step 1: Pre-emphasis filter to boost high frequencies
        const preEmph = this.preEmphasis(audioBuffer, this.preEmphasisCoeff);

        // Step 2: Apply window function
        const windowed = this.applyHammingWindow(preEmph);

        // Step 3: Compute autocorrelation
        const autocorr = this.computeAutocorrelation(windowed, this.lpcOrder);

        // Step 4: Solve for LPC coefficients using Levinson-Durbin
        const lpc = this.levinsonDurbin(autocorr, this.lpcOrder);

        // Step 5: Find roots of LPC polynomial
        const roots = this.findRoots(lpc.coefficients);

        // Step 6: Convert roots to formant frequencies
        const formants = this.rootsToFormants(roots);

        return formants;
    }

    /**
     * Pre-emphasis filter to boost high frequencies
     * @param {Float32Array} signal - Input signal
     * @param {number} alpha - Pre-emphasis coefficient (typically 0.95-0.97)
     * @returns {Float32Array} Filtered signal
     */
    preEmphasis(signal, alpha) {
        const output = new Float32Array(signal.length);
        output[0] = signal[0];

        for (let i = 1; i < signal.length; i++) {
            output[i] = signal[i] - alpha * signal[i - 1];
        }

        return output;
    }

    /**
     * Apply Hamming window to reduce spectral leakage
     * @param {Float32Array} signal - Input signal
     * @returns {Float32Array} Windowed signal
     */
    applyHammingWindow(signal) {
        const N = signal.length;
        const output = new Float32Array(N);

        for (let i = 0; i < N; i++) {
            const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
            output[i] = signal[i] * window;
        }

        return output;
    }

    /**
     * Compute autocorrelation coefficients
     * @param {Float32Array} signal - Input signal
     * @param {number} order - Number of coefficients to compute
     * @returns {Float32Array} Autocorrelation coefficients
     */
    computeAutocorrelation(signal, order) {
        const N = signal.length;
        const R = new Float32Array(order + 1);

        for (let k = 0; k <= order; k++) {
            let sum = 0;
            for (let n = 0; n < N - k; n++) {
                sum += signal[n] * signal[n + k];
            }
            R[k] = sum;
        }

        return R;
    }

    /**
     * Levinson-Durbin algorithm to solve for LPC coefficients
     * @param {Float32Array} R - Autocorrelation coefficients
     * @param {number} order - LPC order
     * @returns {Object} { coefficients, error }
     */
    levinsonDurbin(R, order) {
        const a = new Float32Array(order + 1);
        const k = new Float32Array(order);

        a[0] = 1.0;
        let E = R[0];

        for (let i = 1; i <= order; i++) {
            let lambda = 0;
            for (let j = 1; j < i; j++) {
                lambda += a[j] * R[i - j];
            }

            k[i - 1] = (R[i] - lambda) / E;

            const a_new = new Float32Array(order + 1);
            a_new[0] = 1.0;
            a_new[i] = k[i - 1];

            for (let j = 1; j < i; j++) {
                a_new[j] = a[j] - k[i - 1] * a[i - j];
            }

            for (let j = 0; j <= i; j++) {
                a[j] = a_new[j];
            }

            E = E * (1 - k[i - 1] * k[i - 1]);
        }

        return { coefficients: a, error: E };
    }

    /**
     * Find roots of LPC polynomial using Durand-Kerner method
     * @param {Float32Array} coefficients - LPC coefficients
     * @returns {Array} Array of complex roots { real, imag }
     */
    findRoots(coefficients) {
        const order = coefficients.length - 1;
        const roots = [];

        // Initialize roots on unit circle
        for (let i = 0; i < order; i++) {
            const angle = (2 * Math.PI * i) / order;
            roots.push({
                real: Math.cos(angle),
                imag: Math.sin(angle)
            });
        }

        // Durand-Kerner iterations
        const maxIter = 50;
        const tolerance = 1e-6;

        for (let iter = 0; iter < maxIter; iter++) {
            let maxChange = 0;

            for (let i = 0; i < order; i++) {
                // Evaluate polynomial at current root
                const p = this.evaluatePolynomial(coefficients, roots[i]);

                // Compute denominator (product of differences)
                let denomReal = 1, denomImag = 0;
                for (let j = 0; j < order; j++) {
                    if (i !== j) {
                        const diffReal = roots[i].real - roots[j].real;
                        const diffImag = roots[i].imag - roots[j].imag;

                        const tempReal = denomReal * diffReal - denomImag * diffImag;
                        const tempImag = denomReal * diffImag + denomImag * diffReal;
                        denomReal = tempReal;
                        denomImag = tempImag;
                    }
                }

                // Divide p by denominator
                const denomMag = denomReal * denomReal + denomImag * denomImag;
                const deltaReal = (p.real * denomReal + p.imag * denomImag) / denomMag;
                const deltaImag = (p.imag * denomReal - p.real * denomImag) / denomMag;

                // Update root
                roots[i].real -= deltaReal;
                roots[i].imag -= deltaImag;

                const change = Math.sqrt(deltaReal * deltaReal + deltaImag * deltaImag);
                maxChange = Math.max(maxChange, change);
            }

            if (maxChange < tolerance) break;
        }

        return roots;
    }

    /**
     * Evaluate polynomial at a complex point
     * @param {Float32Array} coeffs - Polynomial coefficients
     * @param {Object} z - Complex number { real, imag }
     * @returns {Object} Result { real, imag }
     */
    evaluatePolynomial(coeffs, z) {
        let real = coeffs[0];
        let imag = 0;

        for (let i = 1; i < coeffs.length; i++) {
            const tempReal = real * z.real - imag * z.imag + coeffs[i];
            const tempImag = real * z.imag + imag * z.real;
            real = tempReal;
            imag = tempImag;
        }

        return { real, imag };
    }

    /**
     * Convert polynomial roots to formant frequencies
     * @param {Array} roots - Complex roots
     * @returns {Object} { F1, F2, F3, F4 }
     */
    rootsToFormants(roots) {
        const formantCandidates = [];

        for (const root of roots) {
            // Only consider roots in upper half-plane (positive imaginary part)
            if (root.imag > 0) {
                // Convert to frequency and bandwidth
                const angle = Math.atan2(root.imag, root.real);
                const frequency = angle * this.sampleRate / (2 * Math.PI);

                const magnitude = Math.sqrt(root.real * root.real + root.imag * root.imag);
                const bandwidth = -Math.log(magnitude) * this.sampleRate / Math.PI;

                // Filter valid formants
                if (frequency > 90 && frequency < 5000 && bandwidth < 500 && bandwidth > 0) {
                    formantCandidates.push({ frequency, bandwidth });
                }
            }
        }

        // Sort by frequency
        formantCandidates.sort((a, b) => a.frequency - b.frequency);

        // Assign to formants
        return {
            F1: formantCandidates[0]?.frequency || null,
            F2: formantCandidates[1]?.frequency || null,
            F3: formantCandidates[2]?.frequency || null,
            F4: formantCandidates[3]?.frequency || null,
            bandwidths: formantCandidates.map(f => f.bandwidth)
        };
    }

    /**
     * Batch process formants over time
     * @param {Float32Array} buffer - Audio data
     * @param {number} frameSize - Frame size
     * @param {number} hopSize - Hop size
     * @returns {Array} Array of formant measurements with timestamps
     */
    extractFormantsBatch(buffer, frameSize = 2048, hopSize = 512) {
        const results = [];

        for (let i = 0; i + frameSize <= buffer.length; i += hopSize) {
            const frame = buffer.slice(i, i + frameSize);
            const formants = this.extractFormants(frame);
            results.push({
                ...formants,
                time: i / this.sampleRate
            });
        }

        return results;
    }
}

// Export singleton instance
export const formantTracker = new FormantTracker(48000);

export default FormantTracker;
