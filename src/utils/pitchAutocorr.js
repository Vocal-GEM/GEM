/**
 * Autocorrelation-based Pitch Detection
 * 
 * Uses autocorrelation to find the fundamental period of the signal.
 * More robust to noise than simple zero-crossing, but may have octave errors.
 * 
 * @module pitchAutocorr
 */

/**
 * Detect pitch using autocorrelation method
 * @param {Float32Array} buffer - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} minFreq - Minimum frequency to detect (default 50 Hz)
 * @param {number} maxFreq - Maximum frequency to detect (default 800 Hz)
 * @returns {Object} { pitch: number|null, confidence: number } - Pitch in Hz and confidence (0-1)
 */
export function detectPitchAutocorr(buffer, sampleRate, minFreq = 50, maxFreq = 800) {
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

    // Compute autocorrelation
    const autocorr = new Float32Array(maxLag + 1);

    for (let lag = 0; lag <= maxLag; lag++) {
        let sum = 0;
        for (let i = 0; i < bufferSize - lag; i++) {
            sum += buffer[i] * buffer[i + lag];
        }
        autocorr[lag] = sum;
    }

    // Normalize by the zero-lag autocorrelation
    const r0 = autocorr[0];
    if (r0 === 0) {
        return { pitch: null, confidence: 0 };
    }

    for (let lag = 0; lag <= maxLag; lag++) {
        autocorr[lag] /= r0;
    }

    // Find the first peak after the minimum lag
    let peakLag = -1;
    let peakValue = -Infinity;

    // Start search after minimum lag to avoid finding the zero-lag peak
    for (let lag = minLag; lag <= maxLag - 1; lag++) {
        // Look for local maximum
        if (autocorr[lag] > autocorr[lag - 1] &&
            autocorr[lag] > autocorr[lag + 1] &&
            autocorr[lag] > peakValue) {
            peakValue = autocorr[lag];
            peakLag = lag;
        }
    }

    // No valid peak found
    if (peakLag === -1 || peakValue < 0.3) {
        return { pitch: null, confidence: 0 };
    }

    // Parabolic interpolation for sub-sample accuracy
    let betterLag = peakLag;
    if (peakLag > 0 && peakLag < maxLag) {
        const alpha = autocorr[peakLag - 1];
        const beta = autocorr[peakLag];
        const gamma = autocorr[peakLag + 1];
        const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
        betterLag = peakLag + p;
    }

    // Calculate pitch
    const pitch = sampleRate / betterLag;

    // Validate pitch range
    if (pitch < minFreq || pitch > maxFreq) {
        return { pitch: null, confidence: 0 };
    }

    // Confidence based on peak height
    // Higher autocorrelation peak = more periodic signal = higher confidence
    const confidence = Math.max(0, Math.min(1, peakValue));

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
 * @returns {Array} Array of { pitch, confidence, time } objects
 */
export function detectPitchAutocorrBatch(buffer, sampleRate, frameSize = 2048, hopSize = 512, minFreq = 50, maxFreq = 800) {
    const results = [];

    for (let i = 0; i + frameSize <= buffer.length; i += hopSize) {
        const frame = buffer.slice(i, i + frameSize);
        const result = detectPitchAutocorr(frame, sampleRate, minFreq, maxFreq);
        results.push({
            ...result,
            time: i / sampleRate
        });
    }

    return results;
}

export default { detectPitchAutocorr, detectPitchAutocorrBatch };
