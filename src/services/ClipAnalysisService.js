import { predictGenderPerception, getPerceptionColor } from './GenderPerceptionPredictor';

/**
 * ClipAnalysisService - Analyzes recorded audio clips for gender estimation
 * 
 * Inspired by Genderfluent's per-window analysis approach.
 */

/**
 * Extract pitch from audio samples using autocorrelation
 * @param {Float32Array} samples 
 * @param {number} sampleRate 
 * @returns {number} Estimated pitch in Hz (0 if unvoiced)
 */
function extractPitch(samples, sampleRate) {
    const minPeriod = Math.floor(sampleRate / 400); // Max pitch 400Hz
    const maxPeriod = Math.floor(sampleRate / 50);  // Min pitch 50Hz

    // Compute autocorrelation
    let bestPeriod = 0;
    let bestCorr = -1;

    for (let period = minPeriod; period < maxPeriod; period++) {
        let corr = 0;
        for (let i = 0; i < samples.length - period; i++) {
            corr += samples[i] * samples[i + period];
        }
        corr /= (samples.length - period);

        if (corr > bestCorr) {
            bestCorr = corr;
            bestPeriod = period;
        }
    }

    // Check if voiced (correlation threshold)
    const rms = Math.sqrt(samples.reduce((sum, s) => sum + s * s, 0) / samples.length);
    if (rms < 0.01 || bestCorr < 0.3) {
        return 0; // Unvoiced or silence
    }

    return sampleRate / bestPeriod;
}

/**
 * Estimate F1 using simple spectral peak detection
 * (Simplified version - for full LPC analysis, use FormantAnalyzer)
 * @param {Float32Array} samples 
 * @param {number} sampleRate 
 * @returns {number} Estimated F1 in Hz
 */
function estimateF1(samples, sampleRate) {
    // Simple FFT-based estimation
    const fftSize = 1024;
    const paddedSamples = new Float32Array(fftSize);
    for (let i = 0; i < Math.min(samples.length, fftSize); i++) {
        paddedSamples[i] = samples[i];
    }

    // Apply Hanning window
    for (let i = 0; i < fftSize; i++) {
        paddedSamples[i] *= 0.5 * (1 - Math.cos(2 * Math.PI * i / fftSize));
    }

    // Simple DFT for formant region (200-1200 Hz)
    const minBin = Math.floor(200 * fftSize / sampleRate);
    const maxBin = Math.floor(1200 * fftSize / sampleRate);

    let peakBin = minBin;
    let peakMag = 0;

    for (let bin = minBin; bin < maxBin; bin++) {
        let re = 0, im = 0;
        for (let i = 0; i < fftSize; i++) {
            const angle = -2 * Math.PI * bin * i / fftSize;
            re += paddedSamples[i] * Math.cos(angle);
            im += paddedSamples[i] * Math.sin(angle);
        }
        const mag = Math.sqrt(re * re + im * im);
        if (mag > peakMag) {
            peakMag = mag;
            peakBin = bin;
        }
    }

    return peakBin * sampleRate / fftSize;
}

/**
 * Analyze an audio blob and return per-window gender estimation
 * @param {Blob} audioBlob - The recorded audio blob
 * @param {number} windowSizeMs - Window size in milliseconds (default 1000ms)
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeClip(audioBlob, windowSizeMs = 1000) {
    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Decode audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    await audioContext.close();

    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.getChannelData(0); // Mono
    const duration = samples.length / sampleRate;

    // Process in windows
    const windowSamples = Math.floor((windowSizeMs / 1000) * sampleRate);
    const stepSamples = Math.floor(windowSamples / 4); // 75% overlap for smooth trace

    const windows = [];
    const pitchTrace = [];

    for (let start = 0; start < samples.length - windowSamples; start += stepSamples) {
        const windowData = samples.slice(start, start + windowSamples);
        const time = start / sampleRate;

        // Extract features
        const pitch = extractPitch(windowData, sampleRate);
        const f1 = pitch > 0 ? estimateF1(windowData, sampleRate) : 0;

        // Predict gender
        const prediction = pitch > 0
            ? predictGenderPerception(pitch, f1, null)
            : { score: 0.5, label: '--', pitchContribution: 0.5, resonanceContribution: 0.5 };

        pitchTrace.push({
            time,
            pitch: pitch || null,
            f1: f1 || null,
            genderScore: prediction.score,
            label: prediction.label
        });

        // Aggregate into larger windows for the bar chart
        if (pitchTrace.length % 4 === 0 || start + stepSamples >= samples.length - windowSamples) {
            const lastFour = pitchTrace.slice(-4).filter(p => p.pitch !== null);
            if (lastFour.length > 0) {
                const avgScore = lastFour.reduce((s, p) => s + p.genderScore, 0) / lastFour.length;
                const avgPitch = lastFour.reduce((s, p) => s + p.pitch, 0) / lastFour.length;
                windows.push({
                    startTime: time - (stepSamples * 3 / sampleRate),
                    endTime: time,
                    genderScore: avgScore,
                    avgPitch
                });
            }
        }
    }

    // Calculate summary stats
    const voicedPoints = pitchTrace.filter(p => p.pitch !== null);
    const avgGenderScore = voicedPoints.length > 0
        ? voicedPoints.reduce((s, p) => s + p.genderScore, 0) / voicedPoints.length
        : 0.5;
    const avgPitch = voicedPoints.length > 0
        ? voicedPoints.reduce((s, p) => s + p.pitch, 0) / voicedPoints.length
        : 0;
    const pitchRange = voicedPoints.length > 0
        ? {
            min: Math.min(...voicedPoints.map(p => p.pitch)),
            max: Math.max(...voicedPoints.map(p => p.pitch))
        }
        : { min: 0, max: 0 };

    // Calculate gender stability (how consistent is the prediction)
    const genderVariance = voicedPoints.length > 1
        ? voicedPoints.reduce((s, p) => s + Math.pow(p.genderScore - avgGenderScore, 2), 0) / voicedPoints.length
        : 0;
    const genderStability = Math.max(0, 1 - Math.sqrt(genderVariance) * 2);

    // Calculate average F1
    const avgF1 = voicedPoints.length > 0
        ? voicedPoints.reduce((s, p) => s + (p.f1 || 0), 0) / voicedPoints.length
        : 0;

    return {
        duration,
        sampleRate,
        windows,
        pitchTrace,
        audioSamples: samples, // Include raw samples for ML analysis
        summary: {
            avgGenderScore,
            avgPitch,
            avgF1,
            pitchRange,
            genderStability,
            voicedPercentage: voicedPoints.length / pitchTrace.length,
            overallLabel: avgGenderScore < 0.3 ? 'Masculine' :
                avgGenderScore < 0.45 ? 'Masc-Leaning' :
                    avgGenderScore < 0.55 ? 'Ambiguous' :
                        avgGenderScore < 0.7 ? 'Fem-Leaning' : 'Feminine'
        }
    };
}

/**
 * Format analysis result for display
 * @param {Object} analysis 
 * @returns {Object} Formatted display data
 */
export function formatAnalysisForDisplay(analysis) {
    return {
        duration: `${analysis.duration.toFixed(1)}s`,
        avgPitch: `${Math.round(analysis.summary.avgPitch)} Hz`,
        pitchRange: `${Math.round(analysis.summary.pitchRange.min)}–${Math.round(analysis.summary.pitchRange.max)} Hz`,
        genderScore: Math.round(analysis.summary.avgGenderScore * 100),
        genderLabel: analysis.summary.overallLabel,
        genderColor: getPerceptionColor(analysis.summary.avgGenderScore, false),
        stability: Math.round(analysis.summary.genderStability * 100),
        voicedPercent: Math.round(analysis.summary.voicedPercentage * 100)
    };
}

export default {
    analyzeClip,
    formatAnalysisForDisplay
};
