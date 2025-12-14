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
 * Extract formants (F1 and F2) and vocal features using spectral peak detection
 * Research: F2 is more important than F1 for gender perception
 * @param {Float32Array} samples
 * @param {number} sampleRate
 * @param {number} pitch - Pitch in Hz (needed for H1-H2)
 * @returns {Object} { f1, f2, h1h2 }
 */
function extractFormants(samples, sampleRate, pitch) {
    const fftSize = 2048;
    const paddedSamples = new Float32Array(fftSize);
    for (let i = 0; i < Math.min(samples.length, fftSize); i++) {
        paddedSamples[i] = samples[i];
    }

    // Apply Hanning window
    for (let i = 0; i < fftSize; i++) {
        paddedSamples[i] *= 0.5 * (1 - Math.cos(2 * Math.PI * i / fftSize));
    }

    // Compute spectrum
    const spectrum = new Float32Array(fftSize / 2);
    for (let bin = 0; bin < fftSize / 2; bin++) {
        let re = 0, im = 0;
        for (let i = 0; i < fftSize; i++) {
            const angle = -2 * Math.PI * bin * i / fftSize;
            re += paddedSamples[i] * Math.cos(angle);
            im += paddedSamples[i] * Math.sin(angle);
        }
        spectrum[bin] = Math.sqrt(re * re + im * im);
    }

    const freqBinWidth = sampleRate / fftSize;

    // Extract F1 (200-1200 Hz)
    const f1MinBin = Math.floor(200 / freqBinWidth);
    const f1MaxBin = Math.floor(1200 / freqBinWidth);
    let f1 = 0, f1Mag = 0;
    for (let bin = f1MinBin; bin < f1MaxBin; bin++) {
        if (spectrum[bin] > f1Mag) {
            f1Mag = spectrum[bin];
            f1 = bin * freqBinWidth;
        }
    }

    // Extract F2 (1200-3500 Hz) - CRITICAL for gender perception
    const f2MinBin = Math.floor(1200 / freqBinWidth);
    const f2MaxBin = Math.floor(3500 / freqBinWidth);
    let f2 = 0, f2Mag = 0;
    for (let bin = f2MinBin; bin < f2MaxBin; bin++) {
        if (spectrum[bin] > f2Mag) {
            f2Mag = spectrum[bin];
            f2 = bin * freqBinWidth;
        }
    }

    // Extract H1-H2 (vocal weight) - Research: Garellek & Keating (2010)
    let h1h2 = 0;
    if (pitch > 50 && pitch < 500) {
        const h1Bin = Math.round(pitch / freqBinWidth);
        const h2Bin = Math.round((pitch * 2) / freqBinWidth);

        if (h1Bin < fftSize / 2 && h2Bin < fftSize / 2) {
            const h1Amplitude = 10 * Math.log10(spectrum[h1Bin] + 1e-10);
            const h2Amplitude = 10 * Math.log10(spectrum[h2Bin] + 1e-10);
            h1h2 = h1Amplitude - h2Amplitude;
        }
    }

    return { f1, f2, h1h2 };
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
        const formants = pitch > 0 ? extractFormants(windowData, sampleRate, pitch) : { f1: 0, f2: 0, h1h2: 0 };

        // Predict gender using enhanced multi-factor model
        const prediction = pitch > 0
            ? predictGenderPerception(pitch, formants.f1, null, {
                f2: formants.f2 > 1000 ? formants.f2 : undefined,
                h1h2: formants.h1h2
            })
            : {
                score: 0.5,
                label: '--',
                pitchContribution: 0.5,
                resonanceContribution: 0.5,
                vocalWeightContribution: 0.5
            };

        pitchTrace.push({
            time,
            pitch: pitch || null,
            f1: formants.f1 || null,
            f2: formants.f2 || null,
            h1h2: formants.h1h2 || null,
            genderScore: prediction.score,
            label: prediction.label,
            vocalWeightContribution: prediction.vocalWeightContribution
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

    // Calculate average formants and vocal weight
    const avgF1 = voicedPoints.length > 0
        ? voicedPoints.reduce((s, p) => s + (p.f1 || 0), 0) / voicedPoints.length
        : 0;
    const avgF2 = voicedPoints.length > 0
        ? voicedPoints.reduce((s, p) => s + (p.f2 || 0), 0) / voicedPoints.length
        : 0;
    const avgH1H2 = voicedPoints.length > 0
        ? voicedPoints.reduce((s, p) => s + (p.h1h2 || 0), 0) / voicedPoints.length
        : 0;
    const avgVocalWeight = voicedPoints.length > 0
        ? voicedPoints.reduce((s, p) => s + (p.vocalWeightContribution || 0.5), 0) / voicedPoints.length
        : 0.5;

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
            avgF2,
            avgH1H2,
            avgVocalWeight,
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
