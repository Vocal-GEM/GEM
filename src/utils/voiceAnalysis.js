/**
 * Voice Analysis Utilities
 * Client-side voice analysis using Web Audio API
 * Provides pitch tracking, formant estimation, and voice quality metrics
 */

export class VoiceAnalyzer {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Analyze audio buffer and extract comprehensive metrics
     * @param {AudioBuffer} audioBuffer - The audio to analyze
     * @param {number} startTime - Optional start time in seconds
     * @param {number} endTime - Optional end time in seconds
     * @returns {Object} Voice metrics
     */
    analyzeBuffer(audioBuffer, startTime = 0, endTime = null) {
        const sampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0);

        // Extract segment if times provided
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = endTime ? Math.floor(endTime * sampleRate) : channelData.length;
        const segment = channelData.slice(startSample, endSample);

        return {
            pitch: this.extractPitch(segment, sampleRate),
            pitchSeries: this.extractPitchSeries(segment, sampleRate),
            formants: this.estimateFormants(segment, sampleRate),
            intensity: this.calculateIntensity(segment),
            spectral: this.calculateSpectralFeatures(segment, sampleRate),
            jitter: this.estimateJitter(segment, sampleRate),
            hnr: this.estimateHNR(segment, sampleRate)
        };
    }

    /**
     * Extract pitch series for visualization
     */
    extractPitchSeries(samples, sampleRate, windowSizeSec = 0.05) {
        const windowSize = Math.floor(sampleRate * windowSizeSec);
        const series = [];

        for (let i = 0; i < samples.length - windowSize; i += windowSize) {
            const window = samples.slice(i, i + windowSize);
            const pitch = this.extractPitch(window, sampleRate);
            series.push({
                time: i / sampleRate,
                frequency: pitch ? pitch.mean : null,
                confidence: pitch ? pitch.confidence : 0
            });
        }
        return series;
    }

    /**
     * Extract pitch using autocorrelation (YIN-like algorithm)
     */
    extractPitch(samples, sampleRate) {
        const minPeriod = Math.floor(sampleRate / 600); // Max 600 Hz
        const maxPeriod = Math.floor(sampleRate / 75);  // Min 75 Hz

        // Autocorrelation
        const correlations = new Array(maxPeriod).fill(0);
        for (let lag = minPeriod; lag < maxPeriod; lag++) {
            let sum = 0;
            for (let i = 0; i < samples.length - lag; i++) {
                sum += samples[i] * samples[i + lag];
            }
            correlations[lag] = sum;
        }

        // Find peak
        let maxCorr = -Infinity;
        let bestLag = 0;
        for (let lag = minPeriod; lag < maxPeriod; lag++) {
            if (correlations[lag] > maxCorr) {
                maxCorr = correlations[lag];
                bestLag = lag;
            }
        }

        if (maxCorr < 0.3) return null; // Low confidence

        const frequency = sampleRate / bestLag;
        return {
            mean: frequency,
            confidence: maxCorr
        };
    }

    /**
     * Estimate formants using LPC (simplified)
     */
    estimateFormants(samples, sampleRate) {
        // Pre-emphasis filter
        const preEmphasized = new Float32Array(samples.length);
        preEmphasized[0] = samples[0];
        for (let i = 1; i < samples.length; i++) {
            preEmphasized[i] = samples[i] - 0.97 * samples[i - 1];
        }

        // Simplified formant estimation using spectral peaks
        const fftSize = 2048;
        const fft = this.performFFT(preEmphasized.slice(0, fftSize));
        const spectrum = fft.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));

        // Find peaks in spectrum
        const peaks = this.findSpectralPeaks(spectrum, sampleRate, fftSize);

        return {
            f1: peaks[0] || null,
            f2: peaks[1] || null,
            f3: peaks[2] || null
        };
    }

    /**
     * Calculate RMS intensity
     */
    calculateIntensity(samples) {
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
            sum += samples[i] * samples[i];
        }
        const rms = Math.sqrt(sum / samples.length);
        const db = 20 * Math.log10(rms + 1e-10);

        return {
            rms: rms,
            db: db
        };
    }

    /**
     * Calculate spectral features
     */
    calculateSpectralFeatures(samples, sampleRate) {
        const fftSize = 2048;
        const fft = this.performFFT(samples.slice(0, fftSize));
        const spectrum = fft.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));

        // Spectral centroid
        let weightedSum = 0;
        let totalSum = 0;
        for (let i = 0; i < spectrum.length / 2; i++) {
            const freq = (i * sampleRate) / fftSize;
            weightedSum += freq * spectrum[i];
            totalSum += spectrum[i];
        }
        const centroid = totalSum > 0 ? weightedSum / totalSum : 0;

        // Spectral rolloff (95% of energy)
        let cumulativeSum = 0;
        const threshold = totalSum * 0.95;
        let rolloff = 0;
        for (let i = 0; i < spectrum.length / 2; i++) {
            cumulativeSum += spectrum[i];
            if (cumulativeSum >= threshold) {
                rolloff = (i * sampleRate) / fftSize;
                break;
            }
        }

        return {
            centroid: centroid,
            rolloff: rolloff
        };
    }

    /**
     * Estimate jitter (pitch variation)
     */
    estimateJitter(samples, sampleRate) {
        // Simplified: measure pitch variation over short windows
        const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
        const pitches = [];

        for (let i = 0; i < samples.length - windowSize; i += windowSize / 2) {
            const window = samples.slice(i, i + windowSize);
            const pitch = this.extractPitch(window, sampleRate);
            if (pitch && pitch.confidence > 0.5) {
                pitches.push(pitch.mean);
            }
        }

        if (pitches.length < 2) return null;

        // Calculate period variation
        const periods = pitches.map(f => 1 / f);
        let sumDiff = 0;
        for (let i = 1; i < periods.length; i++) {
            sumDiff += Math.abs(periods[i] - periods[i - 1]);
        }
        const avgPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;
        const jitter = (sumDiff / (periods.length - 1)) / avgPeriod * 100;

        return jitter;
    }

    /**
     * Estimate Harmonics-to-Noise Ratio
     */
    estimateHNR(samples, sampleRate) {
        const autocorr = this.autocorrelate(samples);

        // Find first peak (fundamental period)
        let maxCorr = -Infinity;
        let peakIndex = 0;
        const minLag = Math.floor(sampleRate / 600);
        const maxLag = Math.floor(sampleRate / 75);

        for (let i = minLag; i < Math.min(maxLag, autocorr.length); i++) {
            if (autocorr[i] > maxCorr) {
                maxCorr = autocorr[i];
                peakIndex = i;
            }
        }

        if (maxCorr <= 0) return null;

        // HNR approximation
        const hnrLinear = maxCorr / Math.abs(autocorr[0]);
        const hnrDb = 10 * Math.log10(hnrLinear + 1e-10);

        return hnrDb;
    }

    /**
     * Autocorrelation helper
     */
    autocorrelate(samples) {
        const result = new Float32Array(samples.length);
        for (let lag = 0; lag < samples.length; lag++) {
            let sum = 0;
            for (let i = 0; i < samples.length - lag; i++) {
                sum += samples[i] * samples[i + lag];
            }
            result[lag] = sum;
        }
        return result;
    }

    /**
     * Simple FFT implementation (Cooley-Tukey)
     */
    performFFT(samples) {
        const n = samples.length;
        if (n <= 1) return samples.map(s => ({ real: s, imag: 0 }));

        // Ensure power of 2
        const powerOf2 = Math.pow(2, Math.ceil(Math.log2(n)));
        const padded = new Float32Array(powerOf2);
        padded.set(samples);

        return this.fftRecursive(Array.from(padded).map(s => ({ real: s, imag: 0 })));
    }

    fftRecursive(x) {
        const n = x.length;
        if (n <= 1) return x;

        const even = this.fftRecursive(x.filter((_, i) => i % 2 === 0));
        const odd = this.fftRecursive(x.filter((_, i) => i % 2 === 1));

        const result = new Array(n);
        for (let k = 0; k < n / 2; k++) {
            const angle = -2 * Math.PI * k / n;
            const t = {
                real: Math.cos(angle) * odd[k].real - Math.sin(angle) * odd[k].imag,
                imag: Math.cos(angle) * odd[k].imag + Math.sin(angle) * odd[k].real
            };
            result[k] = {
                real: even[k].real + t.real,
                imag: even[k].imag + t.imag
            };
            result[k + n / 2] = {
                real: even[k].real - t.real,
                imag: even[k].imag - t.imag
            };
        }
        return result;
    }

    /**
     * Find spectral peaks for formant estimation
     */
    findSpectralPeaks(spectrum, sampleRate, fftSize, numPeaks = 3) {
        const peaks = [];
        const minDistance = Math.floor(fftSize * 200 / sampleRate); // Min 200 Hz apart

        for (let i = 1; i < spectrum.length / 2 - 1; i++) {
            if (spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1]) {
                const freq = (i * sampleRate) / fftSize;
                if (freq > 200 && freq < 5000) { // Voice range
                    peaks.push({ freq, magnitude: spectrum[i] });
                }
            }
        }

        // Sort by magnitude and take top peaks
        peaks.sort((a, b) => b.magnitude - a.magnitude);
        return peaks.slice(0, numPeaks).map(p => p.freq).sort((a, b) => a - b);
    }
}


