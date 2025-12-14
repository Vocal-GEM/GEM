/**
 * VoiceCalibrationService.js
 * Extracts and persists voice baseline metrics (pitch, formants, SPL) from audio recordings.
 * Used to enable personalized "vs baseline" comparisons in analysis tools.
 */

import { PitchDetector } from '../utils/PitchDetector';
import { FormantAnalyzer } from '../utils/FormantAnalyzer';
import { DSP } from '../utils/DSP';

const STORAGE_KEY = 'gem_voice_baseline';
const TARGET_SAMPLE_RATE = 16000;
const FRAME_SIZE = 2048;
const HOP_SIZE = 512;

class VoiceCalibrationServiceClass {
    constructor() {
        this.pitchDetector = null;
        this.formantAnalyzer = null;
    }

    /**
     * Initialize analyzers (lazy initialization)
     */
    _initAnalyzers() {
        if (!this.pitchDetector) {
            this.pitchDetector = new PitchDetector({ minConfidence: 0.5 });
        }
        if (!this.formantAnalyzer) {
            this.formantAnalyzer = new FormantAnalyzer();
        }
    }

    /**
     * Analyze an audio blob and extract baseline metrics
     * @param {Blob} audioBlob - The recorded audio blob
     * @returns {Promise<Object>} Baseline metrics object
     */
    async analyzeBaseline(audioBlob) {
        this._initAnalyzers();
        this.pitchDetector.reset();
        this.formantAnalyzer.reset();

        // Decode audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Get mono channel and resample if needed
        let rawData = audioBuffer.getChannelData(0);
        const originalSampleRate = audioBuffer.sampleRate;

        // Decimate to target sample rate for consistent analysis
        let samples;
        if (originalSampleRate > TARGET_SAMPLE_RATE) {
            samples = DSP.decimate(rawData, originalSampleRate, TARGET_SAMPLE_RATE);
        } else {
            samples = rawData;
        }
        const sampleRate = Math.min(originalSampleRate, TARGET_SAMPLE_RATE);

        // Close audio context
        audioContext.close();

        // Collect metrics frame-by-frame
        const pitchValues = [];
        const f1Values = [];
        const f2Values = [];
        const rmsValues = [];
        const confidenceValues = [];
        const h1h2Values = [];

        const numFrames = Math.floor((samples.length - FRAME_SIZE) / HOP_SIZE);

        for (let i = 0; i < numFrames; i++) {
            const startIdx = i * HOP_SIZE;
            const frame = samples.slice(startIdx, startIdx + FRAME_SIZE);

            // Calculate RMS for this frame
            const rms = DSP.calculateRMS(frame);

            // Skip silent frames
            if (rms < 0.01) continue;

            rmsValues.push(rms);

            // Apply window for analysis
            const windowedFrame = DSP.applyWindow(frame);

            // Pitch detection
            const { pitch, confidence } = this.pitchDetector.detect(windowedFrame, sampleRate);
            if (pitch > 0 && confidence > 0.5) {
                pitchValues.push(pitch);
                confidenceValues.push(confidence);
            }

            // Formant analysis
            const formants = this.formantAnalyzer.analyze(windowedFrame, sampleRate);
            if (formants.f1 > 0) f1Values.push(formants.f1);
            if (formants.f2 > 0) f2Values.push(formants.f2);

            // Vocal weight (H1-H2) analysis - Research: Garellek & Keating (2010)
            if (pitch > 50 && pitch < 500 && confidence > 0.5) {
                // Compute FFT for spectral analysis
                const freqData = DSP.computeFFT(windowedFrame);
                const h1h2 = DSP.calculateH1H2(freqData, pitch, sampleRate);
                if (h1h2 !== null && !isNaN(h1h2)) {
                    h1h2Values.push(h1h2);
                }
            }
        }

        // Calculate statistics
        const metrics = {
            pitch: this._calculateStats(pitchValues),
            formants: {
                f1: this._calculateStats(f1Values),
                f2: this._calculateStats(f2Values)
            },
            vocalWeight: {
                h1h2: this._calculateStats(h1h2Values)
            },
            spl: {
                meanRms: rmsValues.length > 0
                    ? rmsValues.reduce((a, b) => a + b, 0) / rmsValues.length
                    : 0,
                meanDb: rmsValues.length > 0
                    ? DSP.calculateDB(rmsValues.reduce((a, b) => a + b, 0) / rmsValues.length)
                    : -100
            },
            confidence: {
                mean: confidenceValues.length > 0
                    ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
                    : 0,
                sampleCount: pitchValues.length
            },
            analyzedAt: new Date().toISOString(),
            durationSeconds: audioBuffer.duration
        };

        return metrics;
    }

    /**
     * Calculate statistical summary for an array of values
     */
    _calculateStats(values) {
        if (values.length === 0) {
            return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
        }

        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const median = DSP.median(values);

        // Standard deviation
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(avgSquaredDiff);

        return { min, max, mean, median, stdDev };
    }

    /**
     * Save baseline metrics to localStorage
     * @param {Object} metrics - The baseline metrics object
     */
    saveBaseline(metrics) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
            console.log('[VoiceCalibration] Baseline saved:', metrics);
            return true;
        } catch (e) {
            console.error('[VoiceCalibration] Failed to save baseline:', e);
            return false;
        }
    }

    /**
     * Get stored baseline metrics
     * @returns {Object|null} Stored metrics or null if none exists
     */
    getBaseline() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('[VoiceCalibration] Failed to load baseline:', e);
            return null;
        }
    }

    /**
     * Check if a baseline exists
     * @returns {boolean}
     */
    hasBaseline() {
        return this.getBaseline() !== null;
    }

    /**
     * Clear stored baseline
     */
    clearBaseline() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('[VoiceCalibration] Baseline cleared');
    }

    /**
     * Compare current metrics to baseline
     * @param {Object} current - Current metrics (same structure as baseline)
     * @returns {Object} Comparison results with deltas
     */
    compareToBaseline(current) {
        const baseline = this.getBaseline();
        if (!baseline) {
            return { hasBaseline: false };
        }

        const pitchDelta = current.pitch?.mean - baseline.pitch?.mean || 0;
        const f1Delta = current.formants?.f1?.mean - baseline.formants?.f1?.mean || 0;
        const f2Delta = current.formants?.f2?.mean - baseline.formants?.f2?.mean || 0;
        const h1h2Delta = current.vocalWeight?.h1h2?.mean - baseline.vocalWeight?.h1h2?.mean || 0;

        return {
            hasBaseline: true,
            baseline,
            deltas: {
                pitch: {
                    absolute: pitchDelta,
                    semitones: pitchDelta !== 0 && baseline.pitch?.mean > 0
                        ? 12 * Math.log2((baseline.pitch.mean + pitchDelta) / baseline.pitch.mean)
                        : 0
                },
                f1: f1Delta,
                f2: f2Delta,
                h1h2: h1h2Delta
            },
            percentChange: {
                pitch: baseline.pitch?.mean > 0 ? (pitchDelta / baseline.pitch.mean) * 100 : 0,
                f1: baseline.formants?.f1?.mean > 0 ? (f1Delta / baseline.formants.f1.mean) * 100 : 0,
                f2: baseline.formants?.f2?.mean > 0 ? (f2Delta / baseline.formants.f2.mean) * 100 : 0
            },
            vocalWeightChange: {
                absolute: h1h2Delta,
                interpretation: h1h2Delta > 1 ? 'lighter/breathier' :
                    h1h2Delta < -1 ? 'heavier/pressed' : 'similar'
            }
        };
    }

    /**
     * Get a human-readable summary of the baseline
     * @returns {Object} Summary with formatted strings
     */
    getBaselineSummary() {
        const baseline = this.getBaseline();
        if (!baseline) return null;

        const h1h2Mean = baseline.vocalWeight?.h1h2?.mean || 0;
        const h1h2Label = h1h2Mean > 6 ? 'Breathy/Light' :
            h1h2Mean < 2 ? 'Pressed/Heavy' : 'Modal';

        return {
            pitch: `${Math.round(baseline.pitch?.mean || 0)} Hz (${Math.round(baseline.pitch?.min || 0)}-${Math.round(baseline.pitch?.max || 0)})`,
            f1: `${Math.round(baseline.formants?.f1?.mean || 0)} Hz`,
            f2: `${Math.round(baseline.formants?.f2?.mean || 0)} Hz`,
            vocalWeight: `${h1h2Mean.toFixed(1)} dB (${h1h2Label})`,
            date: baseline.analyzedAt
                ? new Date(baseline.analyzedAt).toLocaleDateString()
                : 'Unknown',
            duration: baseline.durationSeconds
                ? `${Math.round(baseline.durationSeconds)}s`
                : 'Unknown'
        };
    }
}

// Singleton export
export const VoiceCalibrationService = new VoiceCalibrationServiceClass();
