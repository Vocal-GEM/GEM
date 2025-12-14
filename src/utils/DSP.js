/**
 * DSP Utility Library
 * Ported from resonance-processor.js for main-thread fallback
 */

export class DSP {
    static decimate(buffer, inputRate, targetRate) {
        if (targetRate >= inputRate) return buffer;
        const ratio = Math.floor(inputRate / targetRate);
        const newLength = Math.floor(buffer.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
            let sum = 0;
            for (let j = 0; j < ratio; j++) {
                sum += buffer[(i * ratio) + j];
            }
            result[i] = sum / ratio;
        }
        return result;
    }

    static applyWindow(signal) {
        const output = new Float32Array(signal.length);
        for (let i = 0; i < signal.length; i++) {
            output[i] = signal[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (signal.length - 1)));
        }
        return output;
    }

    static calculatePitchYIN(buffer, sampleRate, adaptiveThreshold = 0.15) {
        const bufferSize = buffer.length;
        const halfSize = Math.floor(bufferSize / 2);
        const yinBuffer = new Float32Array(halfSize);

        for (let tau = 0; tau < halfSize; tau++) {
            for (let i = 0; i < halfSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                yinBuffer[tau] += delta * delta;
            }
        }

        yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < halfSize; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        let tau = 0;
        for (tau = 2; tau < halfSize; tau++) {
            if (yinBuffer[tau] < adaptiveThreshold) {
                while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                break;
            }
        }

        if (tau == halfSize || yinBuffer[tau] >= adaptiveThreshold) {
            return { pitch: -1, confidence: 0 };
        }

        let betterTau = tau;
        if (tau > 0 && tau < halfSize - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
            betterTau += adjustment;
        }

        const pitch = sampleRate / betterTau;
        const confidence = 1 - yinBuffer[tau];

        if (pitch < 50 || pitch > 800) {
            return { pitch: -1, confidence: 0 };
        }

        return { pitch, confidence };
    }

    static getMagnitudeAtFrequency(buffer, freq, sampleRate) {
        const omega = 2 * Math.PI * freq / sampleRate;
        let real = 0;
        let imag = 0;
        for (let i = 0; i < buffer.length; i++) {
            real += buffer[i] * Math.cos(omega * i);
            imag -= buffer[i] * Math.sin(omega * i);
        }
        return Math.sqrt(real * real + imag * imag);
    }

    static simpleFFT(signal) {
        const N = signal.length;
        const spectrum = new Float32Array(N / 2);

        for (let k = 0; k < N / 2; k++) {
            let real = 0;
            let imag = 0;
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += signal[n] * Math.cos(angle);
                imag += signal[n] * Math.sin(angle);
            }
            spectrum[k] = Math.sqrt(real * real + imag * imag);
        }
        return spectrum;
    }

    static computeAutocorrelation(signal, order) {
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

    static levinsonDurbin(R, order) {
        const a = new Float32Array(order + 1);
        const E = new Float32Array(order + 1);

        E[0] = R[0];
        a[0] = 1;

        const a_prev = new Float32Array(order + 1);

        for (let i = 1; i <= order; i++) {
            let sum = 0;
            for (let j = 1; j < i; j++) {
                sum += a_prev[j] * R[i - j];
            }

            const k = (R[i] - sum) / E[i - 1];

            a[i] = k;
            for (let j = 1; j < i; j++) {
                a[j] = a_prev[j] - k * a_prev[i - j];
            }

            E[i] = E[i - 1] * (1 - k * k);

            for (let j = 0; j <= i; j++) a_prev[j] = a[j];
        }

        return { a: a.slice(1), error: E[order] };
    }

    static computeLPCSpectrum(a, error, numPoints) {
        const magnitude = new Float32Array(numPoints);
        const gain = Math.sqrt(error);

        for (let i = 0; i < numPoints; i++) {
            const omega = (Math.PI * i) / (numPoints - 1);
            let real = 1.0;
            let imag = 0.0;

            for (let k = 0; k < a.length; k++) {
                const angle = -omega * (k + 1);
                real += a[k] * Math.cos(angle);
                imag += a[k] * Math.sin(angle);
            }

            const magA = Math.sqrt(real * real + imag * imag);
            magnitude[i] = 20 * Math.log10(gain / (magA + 1e-10));
        }
        return magnitude;
    }

    static findPeaks(envelope, sampleRate) {
        const peaks = [];
        const numPoints = envelope.length;

        for (let i = 1; i < numPoints - 1; i++) {
            if (envelope[i] > envelope[i - 1] && envelope[i] > envelope[i + 1]) {
                const freq = (i / (numPoints - 1)) * (sampleRate / 2);
                if (freq > 200) {
                    peaks.push({ freq, amp: envelope[i] });
                }
            }
        }
        return peaks;
    }

    static estimateVowel(f1, f2) {
        if (!f1 || !f2 || f1 === 0 || f2 === 0) return '';
        if (f1 < 550 && f2 > 1900) return 'i';
        if (f1 > 600 && f2 < 1800 && f2 > 1200) return 'a';
        if (f1 < 500 && f2 < 1200) return 'u';
        if (f1 > 500 && f1 < 800 && f2 < 1200) return 'o';
        return '';
    }

    static median(values) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const half = Math.floor(sorted.length / 2);
        if (sorted.length % 2) return sorted[half];
        return (sorted[half - 1] + sorted[half]) / 2.0;
    }

    static hzToSemitones(hz) {
        return 12 * Math.log2(hz / 440) + 69;
    }

    static calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    static calculateDB(rms, offset = 0) {
        if (rms <= 0) return -100; // Silence floor
        const db = 20 * Math.log10(rms);
        return db + offset;
    }

    /**
     * Calculate Jitter (Frequency Perturbation)
     * Measures cycle-to-cycle variation in pitch periods.
     * @param {number[]} pitchPeriods Array of pitch periods (1/F0) in seconds
     * @returns {number} Jitter percentage (0.0 to 100.0)
     */
    static calculateJitter(pitchPeriods) {
        if (pitchPeriods.length < 2) return 0;

        let sumDiff = 0;
        let sumPeriod = 0;

        for (let i = 0; i < pitchPeriods.length; i++) {
            sumPeriod += pitchPeriods[i];
            if (i > 0) {
                sumDiff += Math.abs(pitchPeriods[i] - pitchPeriods[i - 1]);
            }
        }

        const avgPeriod = sumPeriod / pitchPeriods.length;
        if (avgPeriod === 0) return 0;

        const avgDiff = sumDiff / (pitchPeriods.length - 1);
        const jitter = avgDiff / avgPeriod;
        return jitter * 100; // Return as percentage
    }

    /**
     * Calculate Shimmer (Amplitude Perturbation)
     * Measures cycle-to-cycle variation in amplitude.
     * @param {number[]} amplitudes Array of peak amplitudes
     * @returns {number} Shimmer percentage (0.0 to 100.0)
     */
    static calculateShimmer(amplitudes) {
        if (amplitudes.length < 2) return 0;

        let sumDiff = 0;
        let sumAmp = 0;

        for (let i = 0; i < amplitudes.length; i++) {
            sumAmp += amplitudes[i];
            if (i > 0) {
                sumDiff += Math.abs(amplitudes[i] - amplitudes[i - 1]);
            }
        }

        const avgAmp = sumAmp / amplitudes.length;
        if (avgAmp === 0) return 0;

        const avgDiff = sumDiff / (amplitudes.length - 1);
        const shimmer = avgDiff / avgAmp;
        return shimmer * 100; // Return as percentage
    }

    /**
     * Calculate Harmonics-to-Noise Ratio (HNR)
     * Uses autocorrelation peak to estimate signal periodicity vs noise.
     * @param {Float32Array} autocorrelation Autocorrelation buffer
     * @param {number} periodLag Index of the first major peak (corresponding to pitch period)
     * @returns {number} HNR in dB
     */
    static calculateHNR(autocorrelation, periodLag) {
        if (!autocorrelation || periodLag <= 0 || periodLag >= autocorrelation.length) return 0;

        const totalPower = autocorrelation[0];
        const harmonicPower = autocorrelation[periodLag];

        // Safety check to prevent log of negative or zero
        if (totalPower <= 0 || harmonicPower <= 0 || harmonicPower >= totalPower) return 50; // Cap at 50dB if perfect

        const noisePower = totalPower - harmonicPower;
        if (noisePower <= 0) return 50;

        const hnr = 10 * Math.log10(harmonicPower / noisePower);
        return hnr;
    }

    /**
     * Calculate Harmonic to Fundamental Ratio
     * Used for Registration detection (M1 vs M2)
     * M1 (Chest) = Harmonic Dominance
     * M2 (Falsetto) = Fundamental Dominance
     * @param {Float32Array} freqData - FFT magnitude data in dB
     * @param {number} pitch - Fundamental frequency (Hz)
     * @param {number} sampleRate - Audio sample rate
     * @returns {number} Ratio of Harmonic Energy to Fundamental Energy
     */
    static calculateHarmonicRatio(freqData, pitch, sampleRate) {
        if (!pitch || pitch < 50) return 0;

        const fftSize = freqData.length * 2;
        const binSize = sampleRate / fftSize;

        // Helper to get linear energy from dB at a frequency
        const getEnergyAtFreq = (f) => {
            const bin = Math.round(f / binSize);
            if (bin < 0 || bin >= freqData.length) return 0;
            // Handle surrounding bins for spectral leakage
            let energy = 0;
            for (let i = -1; i <= 1; i++) {
                if (bin + i >= 0 && bin + i < freqData.length) {
                    energy += Math.pow(10, freqData[bin + i] / 10);
                }
            }
            return energy;
        };

        const f0Energy = getEnergyAtFreq(pitch);
        let harmonicEnergy = 0;

        // Sum first 5 harmonics (or up to Nyquist)
        for (let h = 2; h <= 6; h++) {
            const hFreq = pitch * h;
            if (hFreq > sampleRate / 2) break;
            harmonicEnergy += getEnergyAtFreq(hFreq);
        }

        if (f0Energy === 0) return 0;
        return harmonicEnergy / f0Energy;
    }

    /**
     * Calculate Energy in a specific Frequency Band
     * Used for F3 Noise detection (Breathiness)
     * @param {Float32Array} freqData - FFT magnitude data in dB
     * @param {number} startFreq - Start frequency (Hz)
     * @param {number} endFreq - End frequency (Hz)
     * @param {number} sampleRate - Audio sample rate
     * @returns {number} Average energy in dB
     */
    static calculateSpectralBalance(freqData, startFreq, endFreq, sampleRate) {
        const fftSize = freqData.length * 2;
        const binSize = sampleRate / fftSize;

        const startBin = Math.floor(startFreq / binSize);
        const endBin = Math.min(Math.ceil(endFreq / binSize), freqData.length - 1);

        if (startBin >= endBin) return -100;

        let totalEnergy = 0;
        let count = 0;

        for (let i = startBin; i <= endBin; i++) {
            totalEnergy += Math.pow(10, freqData[i] / 10);
            count++;
        }

        if (count === 0 || totalEnergy === 0) return -100;
        return 10 * Math.log10(totalEnergy / count);
    }

    /**
     * Calculate H1-H2 (Vocal Weight Indicator)
     * Difference between first harmonic (F0) and second harmonic (2*F0) amplitudes.
     * Higher H1-H2 = Breathy/Light phonation (more energy in fundamental)
     * Lower H1-H2 = Pressed/Heavy phonation (more energy in harmonics)
     *
     * Research values (Garellek & Keating 2010):
     * - Breathy: +6 to +12 dB
     * - Modal: 0 to +4 dB
     * - Pressed: -3 to +2 dB
     *
     * @param {Float32Array} freqData - FFT magnitude data in dB
     * @param {number} pitch - Fundamental frequency (Hz)
     * @param {number} sampleRate - Audio sample rate
     * @returns {number} H1-H2 difference in dB
     */
    static calculateH1H2(freqData, pitch, sampleRate) {
        if (!pitch || pitch < 50) return 0;

        const fftSize = freqData.length * 2;
        const binSize = sampleRate / fftSize;

        // Helper to get amplitude in dB at a specific frequency
        const getAmplitudeAtFreq = (f) => {
            const bin = Math.round(f / binSize);
            if (bin < 0 || bin >= freqData.length) return -100;

            // Average surrounding bins to handle spectral leakage
            let maxDb = -100;
            for (let i = -1; i <= 1; i++) {
                if (bin + i >= 0 && bin + i < freqData.length) {
                    maxDb = Math.max(maxDb, freqData[bin + i]);
                }
            }
            return maxDb;
        };

        const H1 = getAmplitudeAtFreq(pitch);      // First harmonic (F0)
        const H2 = getAmplitudeAtFreq(pitch * 2);  // Second harmonic (2*F0)

        return H1 - H2;
    }

    /**
     * Calculate H1-A1 (Alternative vocal weight measure)
     * Difference between first harmonic and first formant peak amplitude.
     * @param {Float32Array} freqData - FFT magnitude data in dB
     * @param {number} pitch - Fundamental frequency (Hz)
     * @param {number} sampleRate - Audio sample rate
     * @returns {number} H1-A1 difference in dB
     */
    static calculateH1A1(freqData, pitch, sampleRate) {
        if (!pitch || pitch < 50) return 0;

        const fftSize = freqData.length * 2;
        const binSize = sampleRate / fftSize;

        const getAmplitudeAtFreq = (f) => {
            const bin = Math.round(f / binSize);
            if (bin < 0 || bin >= freqData.length) return -100;
            let maxDb = -100;
            for (let i = -1; i <= 1; i++) {
                if (bin + i >= 0 && bin + i < freqData.length) {
                    maxDb = Math.max(maxDb, freqData[bin + i]);
                }
            }
            return maxDb;
        };

        const H1 = getAmplitudeAtFreq(pitch);

        // Find A1 (peak in F1 region, typically 300-1000 Hz)
        const f1StartBin = Math.floor(300 / binSize);
        const f1EndBin = Math.min(Math.floor(1000 / binSize), freqData.length - 1);

        let A1 = -100;
        for (let i = f1StartBin; i <= f1EndBin; i++) {
            A1 = Math.max(A1, freqData[i]);
        }

        return H1 - A1;
    }

    /**
     * Calculate Spectral Centroid
     * The "center of mass" of the spectrum.
     * Higher centroid = brighter, lighter sound
     * Lower centroid = darker, heavier sound
     *
     * @param {Float32Array} freqData - FFT magnitude data in dB
     * @param {number} sampleRate - Audio sample rate
     * @returns {number} Spectral centroid in Hz
     */
    static calculateSpectralCentroid(freqData, sampleRate) {
        const fftSize = freqData.length * 2;
        const binSize = sampleRate / fftSize;

        let weightedSum = 0;
        let totalMagnitude = 0;

        // Only analyze up to 8kHz (relevant for voice)
        const maxBin = Math.min(Math.floor(8000 / binSize), freqData.length - 1);

        for (let i = 1; i < maxBin; i++) {
            // Convert dB to linear magnitude
            const magnitude = Math.pow(10, freqData[i] / 20);
            const frequency = i * binSize;

            weightedSum += frequency * magnitude;
            totalMagnitude += magnitude;
        }

        if (totalMagnitude === 0) return 0;
        return weightedSum / totalMagnitude;
    }

    /**
     * Calculate Improved Vocal Weight
     * Multi-factor approach based on phonetics research.
     * Combines H1-H2, spectral centroid, and spectral tilt.
     *
     * @param {Float32Array} freqData - FFT magnitude data in dB
     * @param {number} pitch - Fundamental frequency (Hz)
     * @param {number} sampleRate - Audio sample rate
     * @returns {Object} { weight: 0-100, h1h2: dB, centroid: Hz, label: string }
     */
    static calculateVocalWeight(freqData, pitch, sampleRate) {
        if (!pitch || pitch < 50) {
            return { weight: 50, h1h2: 0, centroid: 0, label: 'Unknown' };
        }

        // Calculate H1-H2 (primary measure)
        const h1h2 = this.calculateH1H2(freqData, pitch, sampleRate);

        // Calculate spectral centroid (supporting measure)
        const centroid = this.calculateSpectralCentroid(freqData, sampleRate);

        // Calculate spectral tilt (0-4kHz comparison)
        const fftSize = freqData.length * 2;
        const binSize = sampleRate / fftSize;
        const bin1k = Math.floor(1000 / binSize);
        const bin4k = Math.floor(4000 / binSize);

        let sumLow = 0, sumHigh = 0;
        for (let i = 1; i < bin1k; i++) {
            sumLow += Math.pow(10, freqData[i] / 10);
        }
        for (let i = bin1k; i < bin4k; i++) {
            sumHigh += Math.pow(10, freqData[i] / 10);
        }

        const dbLow = 10 * Math.log10(sumLow + 1e-10);
        const dbHigh = 10 * Math.log10(sumHigh + 1e-10);
        const spectralTilt = (dbHigh - dbLow) / 2.0;

        // Weight calculation based on H1-H2 (primary factor, 70% weight)
        // Research: Breathy ~9.5dB, Modal ~2dB, Pressed ~0dB
        // Map to 0-100 scale: 0 = Heavy/Pressed, 100 = Light/Breathy
        let h1h2Weight = 0;
        if (h1h2 <= 0) {
            h1h2Weight = 0; // Very pressed/heavy
        } else if (h1h2 >= 10) {
            h1h2Weight = 100; // Very breathy/light
        } else {
            // Linear mapping: 0dB -> 0, 10dB -> 100
            h1h2Weight = h1h2 * 10;
        }

        // Centroid contribution (20% weight)
        // Typical range: 300-1500 Hz for voice
        // Higher centroid = lighter
        let centroidWeight = 50;
        if (centroid > 0) {
            centroidWeight = Math.min(100, Math.max(0, (centroid - 300) / 12));
        }

        // Spectral tilt contribution (10% weight)
        // Negative tilt = heavy, positive = light
        let tiltWeight = 50 - (spectralTilt * 3);
        tiltWeight = Math.min(100, Math.max(0, tiltWeight));

        // Combine factors
        const weight = (h1h2Weight * 0.70) + (centroidWeight * 0.20) + (tiltWeight * 0.10);

        // Determine label
        let label = 'Balanced';
        if (weight < 25) label = 'Very Heavy/Pressed';
        else if (weight < 40) label = 'Heavy';
        else if (weight < 60) label = 'Balanced';
        else if (weight < 75) label = 'Light';
        else label = 'Very Light/Breathy';

        return {
            weight: Math.round(weight),
            h1h2: parseFloat(h1h2.toFixed(2)),
            centroid: Math.round(centroid),
            spectralTilt: parseFloat(spectralTilt.toFixed(2)),
            label
        };
    }
}
