/**
 * McLeod Pitch Method (MPM)
 * 
 * Implementation of the McLeod Pitch Method using Normalized Square Difference Function (NSDF).
 * Based on: "A Smarter Way to Find Pitch" by Philip McLeod and Geoff Wyvill (2005)
 * 
 * More accurate than autocorrelation and less prone to octave errors.
 * 
 * @module pitchMcLeod
 */

/**
 * Detect pitch using McLeod Pitch Method
 * @param {Float32Array} buffer - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} minFreq - Minimum frequency to detect (default 50 Hz)
 * @param {number} maxFreq - Maximum frequency to detect (default 800 Hz)
 * @param {number} threshold - NSDF threshold (default 0.93)
 * @returns {Object} { pitch: number|null, confidence: number } - Pitch in Hz and confidence (0-1)
 */
export function detectPitchMcLeod(buffer, sampleRate, minFreq = 50, maxFreq = 800, threshold = 0.93) {
    if (!buffer || buffer.length === 0) {
        return { pitch: null, confidence: 0 };
    }

    const bufferSize = buffer.length;

    // Calculate lag range based on frequency range
    const minLag = Math.floor(sampleRate / maxFreq);
    const maxLag = Math.floor(sampleRate / minFreq);

    // Ensure we have enough samples
    if (maxLag >= bufferSize / 2) {
        return { pitch: null, confidence: 0 };
    }

    // Compute autocorrelation (r)
    const r = new Float32Array(maxLag + 1);
    for (let tau = 0; tau <= maxLag; tau++) {
        for (let i = 0; i < bufferSize - tau; i++) {
            r[tau] += buffer[i] * buffer[i + tau];
        }
    }

    // Compute mean square (m)
    const m = new Float32Array(maxLag + 1);
    for (let tau = 0; tau <= maxLag; tau++) {
        let sum1 = 0, sum2 = 0;
        for (let i = 0; i < bufferSize - tau; i++) {
            sum1 += buffer[i] * buffer[i];
            sum2 += buffer[i + tau] * buffer[i + tau];
        }
        m[tau] = sum1 + sum2;
    }

    // Compute Normalized Square Difference Function (NSDF)
    const nsdf = new Float32Array(maxLag + 1);
    for (let tau = 0; tau <= maxLag; tau++) {
        if (m[tau] === 0) {
            nsdf[tau] = 0;
        } else {
            nsdf[tau] = (2 * r[tau]) / m[tau];
        }
    }

    // Find peaks in NSDF
    const peaks = [];
    for (let tau = minLag; tau < maxLag - 1; tau++) {
        // Check if this is a local maximum above threshold
        if (nsdf[tau] > threshold &&
            nsdf[tau] > nsdf[tau - 1] &&
            nsdf[tau] >= nsdf[tau + 1]) {

            // Parabolic interpolation for better accuracy
            let betterTau = tau;
            if (tau > 0 && tau < maxLag) {
                const alpha = nsdf[tau - 1];
                const beta = nsdf[tau];
                const gamma = nsdf[tau + 1];
                const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
                betterTau = tau + p;
            }

            peaks.push({
                lag: betterTau,
                value: nsdf[tau]
            });
        }
    }

    // No valid peaks found
    if (peaks.length === 0) {
        return { pitch: null, confidence: 0 };
    }

    // Choose the highest peak (most periodic)
    peaks.sort((a, b) => b.value - a.value);
    const bestPeak = peaks[0];

    // Calculate pitch
    const pitch = sampleRate / bestPeak.lag;

    // Validate pitch range
    if (pitch < minFreq || pitch > maxFreq) {
        return { pitch: null, confidence: 0 };
    }

    // Confidence is the NSDF value at the peak
    const confidence = Math.max(0, Math.min(1, bestPeak.value));

    return { pitch, confidence };
}

/**
 * Batch process multiple frames for pitch tracking
 * @param {Float32Array} buffer - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} frameSize - Size of each frame
 * @param {number} hopSize - Hop size between frames
 * @param {number} minFreq - Minimum frequency
 * @param {number} maxFreq - Maximum frequency
 * @param {number} threshold - NSDF threshold
 * @returns {Array} Array of { pitch, confidence, time } objects
 */
export function detectPitchMcLeodBatch(buffer, sampleRate, frameSize = 2048, hopSize = 512, minFreq = 50, maxFreq = 800, threshold = 0.93) {
    const results = [];

    for (let i = 0; i + frameSize <= buffer.length; i += hopSize) {
        const frame = buffer.slice(i, i + frameSize);
        const result = detectPitchMcLeod(frame, sampleRate, minFreq, maxFreq, threshold);
        results.push({
            ...result,
            time: i / sampleRate
        });
    }

    return results;
}

export default { detectPitchMcLeod, detectPitchMcLeodBatch };
