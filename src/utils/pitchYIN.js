/**
 * YIN Pitch Detection Algorithm
 * 
 * Implementation of the YIN algorithm for robust pitch tracking.
 * Based on: "YIN, a fundamental frequency estimator for speech and music"
 * by Alain de Cheveigné and Hideki Kawahara (2002)
 * 
 * @module pitchYIN
 */

/**
 * Detect pitch using the YIN algorithm
 * @param {Float32Array} buffer - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} threshold - Threshold for peak picking (default 0.15)
 * @returns {Object} { pitch: number|null, confidence: number } - Pitch in Hz and confidence (0-1)
 */
export function detectPitchYIN(buffer, sampleRate, threshold = 0.15) {
    if (!buffer || buffer.length === 0) {
        return { pitch: null, confidence: 0 };
    }

    const bufferSize = buffer.length;
    const halfSize = Math.floor(bufferSize / 2);

    // Step 1: Difference function
    const yinBuffer = new Float32Array(halfSize);
    for (let tau = 0; tau < halfSize; tau++) {
        for (let i = 0; i < halfSize; i++) {
            const delta = buffer[i] - buffer[i + tau];
            yinBuffer[tau] += delta * delta;
        }
    }

    // Step 2: Cumulative mean normalized difference function
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < halfSize; tau++) {
        runningSum += yinBuffer[tau];
        yinBuffer[tau] *= tau / runningSum;
    }

    // Step 3: Absolute threshold
    let tau = -1;
    for (let t = 2; t < halfSize; t++) {
        if (yinBuffer[t] < threshold) {
            // Find local minimum
            while (t + 1 < halfSize && yinBuffer[t + 1] < yinBuffer[t]) {
                t++;
            }
            tau = t;
            break;
        }
    }

    // No valid pitch found
    if (tau === -1 || tau >= halfSize || yinBuffer[tau] >= threshold) {
        return { pitch: null, confidence: 0 };
    }

    // Step 4: Parabolic interpolation for better accuracy
    let betterTau = tau;
    if (tau > 0 && tau < halfSize - 1) {
        const s0 = yinBuffer[tau - 1];
        const s1 = yinBuffer[tau];
        const s2 = yinBuffer[tau + 1];
        const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        betterTau = tau + adjustment;
    }

    // Calculate pitch
    const pitch = sampleRate / betterTau;

    // Validate pitch range (human voice typically 50-800 Hz)
    if (pitch < 50 || pitch > 800) {
        return { pitch: null, confidence: 0 };
    }

    // Confidence is inversely related to the normalized difference
    // Lower difference = higher confidence
    const confidence = Math.max(0, Math.min(1, 1 - yinBuffer[tau]));

    return { pitch, confidence };
}

/**
 * Batch process multiple frames for pitch tracking
 * @param {Float32Array} buffer - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} frameSize - Size of each frame
 * @param {number} hopSize - Hop size between frames
 * @param {number} threshold - YIN threshold
 * @returns {Array} Array of { pitch, confidence, time } objects
 */
export function detectPitchYINBatch(buffer, sampleRate, frameSize = 2048, hopSize = 512, threshold = 0.15) {
    const results = [];

    for (let i = 0; i + frameSize <= buffer.length; i += hopSize) {
        const frame = buffer.slice(i, i + frameSize);
        const result = detectPitchYIN(frame, sampleRate, threshold);
        results.push({
            ...result,
            time: i / sampleRate
        });
    }

    return results;
}

export default { detectPitchYIN, detectPitchYINBatch };
