/**
 * cppAnalysis.js
 * 
 * Cepstral Peak Prominence (CPP) Analysis
 * 
 * CPP is a robust measure of voice quality that quantifies the prominence
 * of the cepstral peak. It's more reliable than jitter/shimmer for continuous
 * speech and is widely used in clinical voice assessment.
 * 
 * Higher CPP = Clearer, more periodic voice
 * Lower CPP = Breathier, rougher voice
 * 
 * Normal values:
 * - Good voice quality: CPP > 10 dB
 * - Moderate breathiness: CPP 5-10 dB
 * - Significant breathiness/dysphonia: CPP < 5 dB
 */

export class CPPAnalyzer {
    constructor(sampleRate = 48000) {
        this.sampleRate = sampleRate;
        this.fftSize = 2048;
        this.hopSize = 512;
    }

    /**
     * Calculate CPP from audio buffer
     * @param {Float32Array} audioBuffer - Audio samples
     * @returns {number} CPP value in dB
     */
    calculateCPP(audioBuffer) {
        if (!audioBuffer || audioBuffer.length < this.fftSize) {
            return 0;
        }

        // Use middle portion of buffer for analysis
        const startIdx = Math.floor((audioBuffer.length - this.fftSize) / 2);
        const frame = audioBuffer.slice(startIdx, startIdx + this.fftSize);

        // Apply Hamming window
        const windowedFrame = this.applyHammingWindow(frame);

        // Get power spectrum
        const powerSpectrum = this.getPowerSpectrum(windowedFrame);

        // Calculate cepstrum (inverse FFT of log spectrum)
        const cepstrum = this.calculateCepstrum(powerSpectrum);

        // Find cepstral peak in quefrency range (2-20ms for voice)
        const minQuefrency = Math.floor(this.sampleRate / 500); // ~2ms
        const maxQuefrency = Math.floor(this.sampleRate / 50);  // ~20ms

        const cpp = this.findCepstralPeakProminence(cepstrum, minQuefrency, maxQuefrency);

        return cpp;
    }

    /**
     * Calculate CPP from real-time audio data
     * @param {Float32Array} audioData - Real-time audio samples
     * @returns {Object} { cpp, quality, interpretation }
     */
    analyzeRealTime(audioData) {
        const cpp = this.calculateCPP(audioData);

        let quality, interpretation, color;

        if (cpp > 10) {
            quality = 'excellent';
            interpretation = 'Clear, resonant voice';
            color = '#10b981'; // green
        } else if (cpp > 8) {
            quality = 'good';
            interpretation = 'Good voice quality';
            color = '#3b82f6'; // blue
        } else if (cpp > 6) {
            quality = 'fair';
            interpretation = 'Mild breathiness';
            color = '#f59e0b'; // amber
        } else if (cpp > 4) {
            quality = 'moderate';
            interpretation = 'Moderate breathiness';
            color = '#f97316'; // orange
        } else {
            quality = 'poor';
            interpretation = 'Significant breathiness/roughness';
            color = '#ef4444'; // red
        }

        return {
            cpp: parseFloat(cpp.toFixed(2)),
            quality,
            interpretation,
            color
        };
    }

    /**
     * Apply Hamming window to reduce spectral leakage
     */
    applyHammingWindow(frame) {
        const N = frame.length;
        const windowed = new Float32Array(N);

        for (let n = 0; n < N; n++) {
            const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
            windowed[n] = frame[n] * window;
        }

        return windowed;
    }

    /**
     * Calculate power spectrum using FFT
     */
    getPowerSpectrum(frame) {
        const N = frame.length;

        // Simple DFT for power spectrum (in production, use Web Audio API's AnalyserNode)
        // For now, we'll use a simplified approach
        const real = new Float32Array(N);
        const imag = new Float32Array(N);

        // Copy input to real part
        for (let i = 0; i < N; i++) {
            real[i] = frame[i];
            imag[i] = 0;
        }

        // Perform FFT (simplified - in production use FFT library or Web Audio API)
        this.fft(real, imag);

        // Calculate power spectrum
        const powerSpectrum = new Float32Array(N / 2);
        for (let k = 0; k < N / 2; k++) {
            powerSpectrum[k] = Math.sqrt(real[k] * real[k] + imag[k] * imag[k]);
        }

        return powerSpectrum;
    }

    /**
     * Calculate cepstrum (inverse FFT of log spectrum)
     */
    calculateCepstrum(powerSpectrum) {
        const N = powerSpectrum.length;

        // Take logarithm of power spectrum
        const logSpectrum = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            // Add small epsilon to avoid log(0)
            logSpectrum[i] = Math.log(powerSpectrum[i] + 1e-10);
        }

        // Perform inverse FFT
        const cepstrum = new Float32Array(N);
        const imag = new Float32Array(N);

        // Copy log spectrum
        for (let i = 0; i < N; i++) {
            cepstrum[i] = logSpectrum[i];
            imag[i] = 0;
        }

        // Inverse FFT
        this.ifft(cepstrum, imag);

        return cepstrum;
    }

    /**
     * Find cepstral peak prominence
     */
    findCepstralPeakProminence(cepstrum, minQuefrency, maxQuefrency) {
        // Find peak in quefrency range
        let peakValue = -Infinity;
        let peakIndex = minQuefrency;

        for (let i = minQuefrency; i < maxQuefrency && i < cepstrum.length; i++) {
            if (cepstrum[i] > peakValue) {
                peakValue = cepstrum[i];
                peakIndex = i;
            }
        }

        // Calculate regression line (simplified - use mean of surrounding values)
        const regressionValue = this.calculateRegressionLine(cepstrum, peakIndex);

        // CPP is the difference between peak and regression line
        const cpp = peakValue - regressionValue;

        // Convert to dB scale (approximate)
        return Math.max(0, cpp * 20); // Scale to typical CPP range
    }

    /**
     * Calculate regression line value at peak
     * (Simplified - uses local average)
     */
    calculateRegressionLine(cepstrum, peakIndex) {
        const windowSize = 10;
        const start = Math.max(0, peakIndex - windowSize);
        const end = Math.min(cepstrum.length, peakIndex + windowSize);

        let sum = 0;
        let count = 0;

        for (let i = start; i < end; i++) {
            if (i !== peakIndex) {
                sum += cepstrum[i];
                count++;
            }
        }

        return count > 0 ? sum / count : 0;
    }

    /**
     * Simplified FFT implementation (Cooley-Tukey algorithm)
     * In production, use a proper FFT library or Web Audio API
     */
    fft(real, imag) {
        const n = real.length;
        if (n <= 1) return;

        // Bit-reversal permutation
        let j = 0;
        for (let i = 0; i < n - 1; i++) {
            if (i < j) {
                [real[i], real[j]] = [real[j], real[i]];
                [imag[i], imag[j]] = [imag[j], imag[i]];
            }
            let k = n / 2;
            while (k <= j) {
                j -= k;
                k /= 2;
            }
            j += k;
        }

        // Cooley-Tukey FFT
        for (let len = 2; len <= n; len *= 2) {
            const angle = -2 * Math.PI / len;
            const wlen_real = Math.cos(angle);
            const wlen_imag = Math.sin(angle);

            for (let i = 0; i < n; i += len) {
                let w_real = 1;
                let w_imag = 0;

                for (let j = 0; j < len / 2; j++) {
                    const u_real = real[i + j];
                    const u_imag = imag[i + j];
                    const v_real = real[i + j + len / 2] * w_real - imag[i + j + len / 2] * w_imag;
                    const v_imag = real[i + j + len / 2] * w_imag + imag[i + j + len / 2] * w_real;

                    real[i + j] = u_real + v_real;
                    imag[i + j] = u_imag + v_imag;
                    real[i + j + len / 2] = u_real - v_real;
                    imag[i + j + len / 2] = u_imag - v_imag;

                    const temp_real = w_real * wlen_real - w_imag * wlen_imag;
                    w_imag = w_real * wlen_imag + w_imag * wlen_real;
                    w_real = temp_real;
                }
            }
        }
    }

    /**
     * Inverse FFT
     */
    ifft(real, imag) {
        const n = real.length;

        // Conjugate
        for (let i = 0; i < n; i++) {
            imag[i] = -imag[i];
        }

        // Forward FFT
        this.fft(real, imag);

        // Conjugate and scale
        for (let i = 0; i < n; i++) {
            real[i] /= n;
            imag[i] = -imag[i] / n;
        }
    }
}

// Export singleton instance
export const cppAnalyzer = new CPPAnalyzer();
