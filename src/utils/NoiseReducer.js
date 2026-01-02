/**
 * Noise Reducer
 * 
 * Implements spectral subtraction for background noise compensation.
 * Captures a noise profile during silence and subtracts it from the signal.
 * 
 * @module NoiseReducer
 */

/**
 * Noise Reducer class using spectral subtraction
 */
export class NoiseReducer {
    /**
     * @param {number} fftSize - FFT size for spectral analysis (default 2048)
     */
    constructor(fftSize = 2048) {
        this.fftSize = fftSize;
        this.noiseProfile = null;
        this.alpha = 2.0; // Oversubtraction factor
        this.beta = 0.01; // Spectral floor (prevents musical noise)
        this.smoothingFactor = 0.9; // Temporal smoothing
        this.previousSpectrum = null;
    }

    /**
     * Capture noise profile during silence
     * Call this when the user is not speaking
     * @param {Float32Array} silentBuffer - Audio samples during silence
     */
    captureNoiseProfile(silentBuffer) {
        if (!silentBuffer || silentBuffer.length < this.fftSize) {
            console.warn('Buffer too small for noise profile capture');
            return;
        }

        // Compute average spectrum over multiple frames
        const numFrames = Math.floor(silentBuffer.length / this.fftSize);
        const avgSpectrum = new Float32Array(this.fftSize / 2);

        for (let i = 0; i < numFrames; i++) {
            const start = i * this.fftSize;
            const frame = silentBuffer.slice(start, start + this.fftSize);
            const spectrum = this.computePowerSpectrum(frame);

            for (let j = 0; j < avgSpectrum.length; j++) {
                avgSpectrum[j] += spectrum[j];
            }
        }

        // Average and apply oversubtraction factor
        for (let i = 0; i < avgSpectrum.length; i++) {
            avgSpectrum[i] = (avgSpectrum[i] / numFrames) * this.alpha;
        }

        this.noiseProfile = avgSpectrum;
        console.log('Noise profile captured');
    }

    /**
     * Apply noise reduction to audio buffer
     * @param {Float32Array} audioBuffer - Audio samples to clean
     * @returns {Float32Array} Cleaned audio
     */
    reduce(audioBuffer) {
        if (!this.noiseProfile) {
            console.warn('No noise profile captured. Returning original audio.');
            return audioBuffer;
        }

        if (audioBuffer.length < this.fftSize) {
            return audioBuffer;
        }

        const output = new Float32Array(audioBuffer.length);
        const hopSize = this.fftSize / 2; // 50% overlap

        for (let i = 0; i + this.fftSize <= audioBuffer.length; i += hopSize) {
            const frame = audioBuffer.slice(i, i + this.fftSize);
            const cleanedFrame = this.processFrame(frame);

            // Overlap-add
            for (let j = 0; j < cleanedFrame.length; j++) {
                if (i + j < output.length) {
                    output[i + j] += cleanedFrame[j];
                }
            }
        }

        // Normalize overlap-add
        const overlapFactor = this.fftSize / hopSize;
        for (let i = 0; i < output.length; i++) {
            output[i] /= overlapFactor;
        }

        return output;
    }

    /**
     * Process a single frame with spectral subtraction
     * @param {Float32Array} frame - Audio frame
     * @returns {Float32Array} Cleaned frame
     */
    processFrame(frame) {
        // Apply window
        const windowed = this.applyHannWindow(frame);

        // Compute FFT
        const { magnitude, phase } = this.computeFFT(windowed);

        // Spectral subtraction
        const cleanMagnitude = new Float32Array(magnitude.length);
        for (let i = 0; i < magnitude.length; i++) {
            // Subtract noise estimate
            let cleaned = magnitude[i] - this.noiseProfile[i];

            // Apply spectral floor to prevent negative values and musical noise
            const floor = magnitude[i] * this.beta;
            cleaned = Math.max(cleaned, floor);

            cleanMagnitude[i] = cleaned;
        }

        // Temporal smoothing to reduce artifacts
        if (this.previousSpectrum) {
            for (let i = 0; i < cleanMagnitude.length; i++) {
                cleanMagnitude[i] = this.smoothingFactor * this.previousSpectrum[i] +
                    (1 - this.smoothingFactor) * cleanMagnitude[i];
            }
        }
        this.previousSpectrum = cleanMagnitude.slice();

        // Reconstruct signal
        return this.inverseFFT(cleanMagnitude, phase);
    }

    /**
     * Compute power spectrum of a frame
     * @param {Float32Array} frame - Audio frame
     * @returns {Float32Array} Power spectrum
     */
    computePowerSpectrum(frame) {
        const windowed = this.applyHannWindow(frame);
        const { magnitude } = this.computeFFT(windowed);
        return magnitude;
    }

    /**
     * Apply Hann window
     * @param {Float32Array} signal - Input signal
     * @returns {Float32Array} Windowed signal
     */
    applyHannWindow(signal) {
        const N = signal.length;
        const output = new Float32Array(N);

        for (let i = 0; i < N; i++) {
            const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
            output[i] = signal[i] * window;
        }

        return output;
    }

    /**
     * Compute FFT (magnitude and phase)
     * @param {Float32Array} signal - Input signal
     * @returns {Object} { magnitude, phase }
     */
    computeFFT(signal) {
        const N = signal.length;
        const real = new Float32Array(signal);
        const imag = new Float32Array(N);

        this.fft(real, imag);

        const magnitude = new Float32Array(N / 2);
        const phase = new Float32Array(N / 2);

        for (let i = 0; i < N / 2; i++) {
            magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
            phase[i] = Math.atan2(imag[i], real[i]);
        }

        return { magnitude, phase };
    }

    /**
     * Inverse FFT to reconstruct signal
     * @param {Float32Array} magnitude - Magnitude spectrum
     * @param {Float32Array} phase - Phase spectrum
     * @returns {Float32Array} Time-domain signal
     */
    inverseFFT(magnitude, phase) {
        const N = this.fftSize;
        const real = new Float32Array(N);
        const imag = new Float32Array(N);

        // Reconstruct complex spectrum
        for (let i = 0; i < N / 2; i++) {
            real[i] = magnitude[i] * Math.cos(phase[i]);
            imag[i] = magnitude[i] * Math.sin(phase[i]);
        }

        // Mirror for negative frequencies
        for (let i = N / 2; i < N; i++) {
            real[i] = real[N - i];
            imag[i] = -imag[N - i];
        }

        this.ifft(real, imag);

        return real;
    }

    /**
     * FFT implementation (Cooley-Tukey algorithm)
     * @param {Float32Array} real - Real part (input/output)
     * @param {Float32Array} imag - Imaginary part (input/output)
     */
    fft(real, imag) {
        const N = real.length;

        // Bit-reversal permutation
        let j = 0;
        for (let i = 0; i < N - 1; i++) {
            if (i < j) {
                [real[i], real[j]] = [real[j], real[i]];
                [imag[i], imag[j]] = [imag[j], imag[i]];
            }
            let k = N / 2;
            while (k <= j) {
                j -= k;
                k /= 2;
            }
            j += k;
        }

        // Cooley-Tukey FFT
        for (let size = 2; size <= N; size *= 2) {
            const halfSize = size / 2;
            const step = 2 * Math.PI / size;

            for (let i = 0; i < N; i += size) {
                for (let j = 0; j < halfSize; j++) {
                    const angle = -step * j;
                    const wReal = Math.cos(angle);
                    const wImag = Math.sin(angle);

                    const tReal = wReal * real[i + j + halfSize] - wImag * imag[i + j + halfSize];
                    const tImag = wReal * imag[i + j + halfSize] + wImag * real[i + j + halfSize];

                    real[i + j + halfSize] = real[i + j] - tReal;
                    imag[i + j + halfSize] = imag[i + j] - tImag;
                    real[i + j] += tReal;
                    imag[i + j] += tImag;
                }
            }
        }
    }

    /**
     * Inverse FFT
     * @param {Float32Array} real - Real part (input/output)
     * @param {Float32Array} imag - Imaginary part (input/output)
     */
    ifft(real, imag) {
        const N = real.length;

        // Conjugate
        for (let i = 0; i < N; i++) {
            imag[i] = -imag[i];
        }

        // Forward FFT
        this.fft(real, imag);

        // Conjugate and scale
        for (let i = 0; i < N; i++) {
            real[i] /= N;
            imag[i] = -imag[i] / N;
        }
    }

    /**
     * Reset noise profile
     */
    reset() {
        this.noiseProfile = null;
        this.previousSpectrum = null;
    }

    /**
     * Set parameters
     * @param {Object} params - Parameters to set
     */
    setParameters(params) {
        if (params.alpha !== undefined) this.alpha = params.alpha;
        if (params.beta !== undefined) this.beta = params.beta;
        if (params.smoothingFactor !== undefined) this.smoothingFactor = params.smoothingFactor;
    }
}

// Export singleton instance
export const noiseReducer = new NoiseReducer();

export default NoiseReducer;
