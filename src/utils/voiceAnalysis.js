/**
 * Voice Analysis Utilities
 * Client-side voice analysis using Web Audio API
 * Provides pitch tracking, formant estimation, and voice quality metrics
 */

import { PitchDetector } from './pitch';
import { lpcAnalyzer } from './lpcAnalysis';

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

        const duration = segment.length / sampleRate;
        const frameResults = this.analyzeFrame(segment, sampleRate);

        return {
            ...frameResults,
            speechRate: this.calculateSpeechRate(segment, sampleRate, duration),
            duration: duration
        };
    }

    /**
     * Analyze a raw frame of audio data
     * @param {Float32Array} frame - Raw audio data
     * @param {number} sampleRate - Sample rate
     * @returns {Object} Voice metrics
     */
    analyzeFrame(frame, sampleRate) {
        const formants = this.estimateFormants(frame, sampleRate);
        const pitch = this.extractPitch(frame, sampleRate);

        return {
            pitch: pitch,
            pitchSeries: this.extractPitchSeries(frame, sampleRate),
            formants: formants,
            avgFormantFreq: this.calculateAverageFormantFreq(formants),
            intensity: this.calculateIntensity(frame),
            spectral: this.calculateSpectralFeatures(frame, sampleRate),
            jitter: this.estimateJitter(frame, sampleRate),
            shimmer: this.estimateShimmer(frame, sampleRate),
            hnr: this.estimateHNR(frame, sampleRate),
            cpps: this.calculateCPPS(frame, sampleRate),
            sibilance: this.calculateSibilance(frame, sampleRate),
            spi: this.calculateSPI(this.calculateSpectralFeatures(frame, sampleRate).spectrum, sampleRate),
            spectralSlope: this.calculateSpectralSlope(this.calculateSpectralFeatures(frame, sampleRate).spectrum, sampleRate),
            formantMismatch: pitch ? this.detectFormantMismatch(pitch.mean, formants.f2) : false,
            clarity: pitch ? pitch.confidence : (this.calculateSibilance(frame, sampleRate).score > 0.3 ? 0.8 : 0) // Combined voiced/unvoiced confidence
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

            // Calculate volume (dB) for this window
            let sum = 0;
            for (let j = 0; j < window.length; j++) {
                sum += window[j] * window[j];
            }
            const rms = Math.sqrt(sum / window.length);
            const db = 20 * Math.log10(rms + 1e-10);

            series.push({
                time: i / sampleRate,
                frequency: pitch ? pitch.mean : null,
                confidence: pitch ? pitch.confidence : 0,
                volume: db // Add volume in dB
            });
        }
        return series;
    }

    /**
     * Extract pitch using YIN algorithm (via shared utility)
     */
    extractPitch(samples, sampleRate) {
        const pitch = PitchDetector.calculateYIN(samples, sampleRate);

        if (pitch === -1) return null;

        return {
            mean: pitch,
            confidence: 1.0 // YIN is generally high confidence if it returns a value
        };
    }

    /**
     * Estimate formants using LPC
     */
    estimateFormants(samples, sampleRate) {
        // Use the shared LPC analyzer
        // Note: LPCAnalyzer expects a Float32Array
        const result = lpcAnalyzer.analyze(samples);

        if (!result || !result.formants) {
            return { f1: null, f2: null, f3: null };
        }

        return {
            f1: result.formants[0] || null,
            f2: result.formants[1] || null,
            f3: result.formants[2] || null
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
            rolloff: rolloff,
            spectrum: spectrum
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
     * Calculate sibilance features (specifically for /s/ vs /sh/ distinction)
     * Focuses on energy in 4kHz-8kHz range vs lower frequencies
     */
    calculateSibilance(samples, sampleRate) {
        const fftSize = 2048;
        const fft = this.performFFT(samples.slice(0, fftSize));
        const spectrum = fft.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));

        // Calculate energy in specific bands
        let energyLow = 0;   // 0 - 3kHz
        let energyHigh = 0;  // 4kHz - 8kHz
        let totalEnergy = 0;

        // Spectral centroid specifically for high frequencies
        let highFreqWeightedSum = 0;
        let highFreqTotalSum = 0;

        for (let i = 0; i < spectrum.length / 2; i++) {
            const freq = (i * sampleRate) / fftSize;
            const magnitude = spectrum[i];

            totalEnergy += magnitude;

            if (freq < 3000) {
                energyLow += magnitude;
            } else if (freq >= 4000 && freq <= 8000) {
                energyHigh += magnitude;
                highFreqWeightedSum += freq * magnitude;
                highFreqTotalSum += magnitude;
            }
        }

        const highFreqCentroid = highFreqTotalSum > 0 ? highFreqWeightedSum / highFreqTotalSum : 0;

        return {
            score: totalEnergy > 0 ? energyHigh / totalEnergy : 0, // Ratio of high freq energy
            centroid: highFreqCentroid,
            isSibilant: this.detectSibilant(samples, sampleRate) // Helper check
        };
    }

    /**
     * Detect if segment is likely a sibilant based on Zero Crossing Rate and Energy
     */
    detectSibilant(samples, sampleRate) {
        // 1. Zero Crossing Rate (ZCR)
        let zeroCrossings = 0;
        for (let i = 1; i < samples.length; i++) {
            if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) {
                zeroCrossings++;
            }
        }
        const zcr = zeroCrossings / samples.length;

        // 2. RMS Energy
        let sumSq = 0;
        for (let i = 0; i < samples.length; i++) {
            sumSq += samples[i] * samples[i];
        }
        const rms = Math.sqrt(sumSq / samples.length);

        // Thresholds (tuned for speech)
        // High ZCR usually indicates unvoiced fricatives
        return zcr > 0.15 && rms > 0.01;
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
    /**
     * Estimate Shimmer (Amplitude perturbation)
     * Measures cycle-to-cycle variation in amplitude
     */
    estimateShimmer(samples, sampleRate) {
        // We need pitch periods to measure cycle-to-cycle amplitude
        // Simplified: Find peaks (approximate cycles) and measure their heights
        const peaks = [];
        const minDistance = Math.floor(sampleRate / 600); // Min period

        for (let i = 1; i < samples.length - 1; i++) {
            if (samples[i] > samples[i - 1] && samples[i] > samples[i + 1]) {
                // Check if it's a significant peak (above zero and spaced out)
                if (samples[i] > 0.01) {
                    if (peaks.length === 0 || (i - peaks[peaks.length - 1].index) > minDistance) {
                        peaks.push({ index: i, amp: samples[i] });
                    } else if (samples[i] > peaks[peaks.length - 1].amp) {
                        // Update if we found a higher peak in the same window
                        peaks[peaks.length - 1] = { index: i, amp: samples[i] };
                    }
                }
            }
        }

        if (peaks.length < 3) return null;

        let sumDiff = 0;
        let sumAmp = 0;

        for (let i = 1; i < peaks.length; i++) {
            const diff = Math.abs(peaks[i].amp - peaks[i - 1].amp);
            sumDiff += diff;
            sumAmp += peaks[i].amp;
        }

        const avgAmp = sumAmp / (peaks.length - 1); // Exclude first for sumAmp to match loop? No, use all involved
        // Actually standard formula: sum(|A_i - A_{i+1}|) / (N-1) / (sum(A_i)/N)
        // Let's use simple relative shimmer

        if (avgAmp === 0) return 0;

        // Shimmer (dB) = 20 * log10(avgAmp / (avgAmp - avgDiff)) ?? 
        // Standard Shimmer (local, %) = (Average Absolute Difference / Average Amplitude) * 100
        const shimmerPct = (sumDiff / (peaks.length - 1)) / avgAmp * 100;

        // Convert to dB: 20 * log10(A_i / A_{i+1}) averaged... 
        // Let's stick to percentage as requested in user doc (Shimmer %)

        return shimmerPct;
    }

    /**
     * Calculate Cepstral Peak Prominence (Smoothed) - CPPS
     * A measure of breathiness/periodicity. Higher is better/clearer.
     */
    calculateCPPS(samples, sampleRate) {
        // 1. Calculate Log Magnitude Spectrum
        const fftSize = 2048;
        const fft = this.performFFT(samples.slice(0, fftSize));
        const logSpectrum = fft.map(c => Math.log(Math.sqrt(c.real * c.real + c.imag * c.imag) + 1e-10));

        // 2. Calculate Cepstrum (IFFT of Log Spectrum)
        // Since input is real and symmetric, we can just do FFT again (Real Cepstrum)
        const cepstrumComplex = this.performFFT(logSpectrum);
        const cepstrum = cepstrumComplex.map(c => c.real); // Real part of Cepstrum

        // 3. Find peak in valid pitch range (quefrency)
        // Pitch 75Hz - 600Hz
        // Quefrency = sampleRate / frequency
        const minQuef = Math.floor(sampleRate / 600);
        const maxQuef = Math.floor(sampleRate / 75);

        let maxPeak = -Infinity;
        let peakIndex = 0;

        for (let i = minQuef; i < Math.min(maxQuef, cepstrum.length / 2); i++) {
            if (cepstrum[i] > maxPeak) {
                maxPeak = cepstrum[i];
                peakIndex = i;
            }
        }

        // 4. Calculate Prominence (Peak minus regression line/average)
        // Simplified: Peak minus local average
        let sumSurround = 0;
        let count = 0;
        const window = 10;
        for (let i = peakIndex - window; i <= peakIndex + window; i++) {
            if (i >= 0 && i < cepstrum.length && i !== peakIndex) {
                sumSurround += cepstrum[i];
                count++;
            }
        }
        const avgSurround = count > 0 ? sumSurround / count : 0;

        const cpps = maxPeak - avgSurround;
        return Math.max(0, cpps); // Ensure non-negative
    }

    /**
     * Calculate Speech Rate (Syllables per second)
     * Uses amplitude envelope peak detection
     */
    calculateSpeechRate(samples, sampleRate, duration) {
        if (!duration || duration < 0.5) return 0; // Need some time

        // 1. Get Amplitude Envelope (Smoothed RMS)
        const windowSize = Math.floor(sampleRate * 0.05); // 50ms
        const envelope = [];

        for (let i = 0; i < samples.length; i += windowSize) {
            let sum = 0;
            for (let j = 0; j < windowSize && (i + j) < samples.length; j++) {
                sum += samples[i + j] * samples[i + j];
            }
            envelope.push(Math.sqrt(sum / windowSize));
        }

        // 2. Count Peaks (Syllables)
        let peaks = 0;
        const threshold = 0.02; // Silence threshold
        let inPeak = false;

        for (let i = 1; i < envelope.length - 1; i++) {
            if (envelope[i] > threshold) {
                if (envelope[i] > envelope[i - 1] && envelope[i] > envelope[i + 1]) {
                    // Local max
                    if (!inPeak) {
                        peaks++;
                        inPeak = true;
                    }
                } else if (envelope[i] < threshold * 1.5) {
                    // Dip between syllables
                    inPeak = false;
                }
            } else {
                inPeak = false;
            }
        }

        return peaks / duration;
    }

    /**
     * Calculate Average Formant Frequency
     */
    calculateAverageFormantFreq(formants) {
        let sum = 0;
        let count = 0;
        if (formants.f1) { sum += formants.f1; count++; }
        if (formants.f2) { sum += formants.f2; count++; }
        if (formants.f3) { sum += formants.f3; count++; }

        return count > 0 ? sum / count : 0;
    }

    /**
     * Detect Formant Mismatch (High Pitch + Low Resonance)
     */
    detectFormantMismatch(pitch, f2) {
        if (!pitch || !f2) return false;
        // Example: Pitch > 180Hz (Fem) but F2 < 1500Hz (Masc/Dark)
        return (pitch > 180 && f2 < 1500);
    }

    calculateSPI(spectrum, sampleRate) {
        // Soft Phonation Index: Ratio of low freq energy to high freq energy
        // Low: 70-1600 Hz, High: 1600-4500 Hz
        if (!spectrum || spectrum.length === 0) return 0;

        const binWidth = sampleRate / (2 * spectrum.length);
        let lowEnergy = 0;
        let highEnergy = 0;

        for (let i = 0; i < spectrum.length; i++) {
            const freq = i * binWidth;
            const energy = spectrum[i] * spectrum[i]; // Power

            if (freq >= 70 && freq <= 1600) {
                lowEnergy += energy;
            } else if (freq > 1600 && freq <= 4500) {
                highEnergy += energy;
            }
        }

        if (highEnergy === 0) return 0;
        return lowEnergy / highEnergy;
    }

    calculateSpectralSlope(spectrum, sampleRate) {
        // Spectral Slope: Linear regression of log-magnitude spectrum
        // Returns slope in dB/octave or similar
        if (!spectrum || spectrum.length === 0) return 0;

        const binWidth = sampleRate / (2 * spectrum.length);
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        let n = 0;

        for (let i = 1; i < spectrum.length; i++) { // Skip DC
            const freq = i * binWidth;
            if (freq > 8000) break; // Analyze up to 8kHz

            const logFreq = Math.log10(freq);
            const db = 20 * Math.log10(spectrum[i] + 1e-10);

            sumX += logFreq;
            sumY += db;
            sumXY += logFreq * db;
            sumXX += logFreq * logFreq;
            n++;
        }

        if (n === 0) return 0;

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope; // dB per decade (roughly)
    }
}


