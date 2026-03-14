/**
 * Signal Validator
 * Validates audio signal quality before analysis to prevent inaccurate readings
 */

/**
 * Validate audio signal quality
 * @param {Float32Array} audioBuffer - Audio samples
 * @param {number} sampleRate - Sample rate in Hz
 * @returns {Object} Validation result with issues and confidence score
 */
export const validateAudioSignal = (audioBuffer, sampleRate) => {
    const issues = [];

    // Calculate maxAmplitude, rms, and dcOffset in a single pass
    let maxAmplitude = 0;
    let sumSq = 0;
    let sum = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
        const s = audioBuffer[i];
        const absS = Math.abs(s);
        if (absS > maxAmplitude) maxAmplitude = absS;
        sumSq += s * s;
        sum += s;
    }
    const rms = Math.sqrt(sumSq / audioBuffer.length);
    const dcOffset = sum / audioBuffer.length;

    // Check for clipping
    if (maxAmplitude > 0.99) {
        issues.push({
            type: 'clipping',
            severity: 'high',
            message: 'Audio is clipping. Move away from microphone or reduce input gain.'
        });
    }

    // Check for silence
    if (rms < 0.001) {
        issues.push({
            type: 'silence',
            severity: 'high',
            message: 'No audio detected. Check microphone connection and permissions.'
        });
    }

    // Check for DC offset
    if (Math.abs(dcOffset) > 0.05) {
        issues.push({
            type: 'dc_offset',
            severity: 'medium',
            message: 'Audio has DC bias. This may affect analysis accuracy.'
        });
    }

    // Check for excessive noise (estimate SNR)
    const snr = estimateSNR(audioBuffer);
    if (snr < 10) {
        issues.push({
            type: 'low_snr',
            severity: 'medium',
            message: 'High background noise detected. Find a quieter environment for better results.'
        });
    }

    // Calculate confidence score (0-1)
    // Based on SNR: 5dB = 0, 35dB = 1
    const confidence = Math.max(0, Math.min(1, (snr - 5) / 30));

    return {
        isValid: issues.filter(i => i.severity === 'high').length === 0,
        issues,
        confidence,
        metrics: {
            maxAmplitude,
            rms,
            dcOffset,
            snr
        }
    };
};

/**
 * Estimate Signal-to-Noise Ratio
 * @param {Float32Array} audioBuffer - Audio samples
 * @returns {number} Estimated SNR in dB
 */
const estimateSNR = (audioBuffer) => {
    // Calculate RMS (signal power)
    let sumSq = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
        sumSq += audioBuffer[i] * audioBuffer[i];
    }
    const rms = Math.sqrt(sumSq / audioBuffer.length);

    // Estimate noise floor from quietest 10% of samples
    const sorted = new Float32Array(audioBuffer);
    for (let i = 0; i < sorted.length; i++) {
        sorted[i] = Math.abs(sorted[i]);
    }
    sorted.sort();

    const noiseFloorIndex = Math.floor(sorted.length * 0.1);
    const noiseFloorSamples = sorted.subarray(0, noiseFloorIndex);

    let noiseSumSq = 0;
    for (let i = 0; i < noiseFloorSamples.length; i++) {
        noiseSumSq += noiseFloorSamples[i] * noiseFloorSamples[i];
    }
    const noiseFloor = Math.sqrt(noiseSumSq / noiseFloorSamples.length);

    // Avoid division by zero
    if (noiseFloor < 0.00001) {
        // Very quiet noise floor, assume excellent SNR
        return 50;
    }

    // SNR in dB
    const snr = 20 * Math.log10(rms / noiseFloor);

    return Math.max(0, Math.min(60, snr)); // Clamp to reasonable range
};

/**
 * Check if signal has sufficient quality for analysis
 * @param {Float32Array} audioBuffer - Audio samples
 * @param {number} sampleRate - Sample rate in Hz
 * @returns {boolean} True if signal is good enough for analysis
 */
export const isSignalGoodForAnalysis = (audioBuffer, sampleRate) => {
    const validation = validateAudioSignal(audioBuffer, sampleRate);
    return validation.isValid && validation.confidence > 0.5;
};

/**
 * Get user-friendly message for signal quality
 * @param {Object} validation - Validation result from validateAudioSignal
 * @returns {string} User-friendly message
 */
export const getSignalQualityMessage = (validation) => {
    if (validation.confidence > 0.8) {
        return '✅ Excellent signal quality';
    } else if (validation.confidence > 0.6) {
        return '✓ Good signal quality';
    } else if (validation.confidence > 0.4) {
        return '⚠️ Fair signal quality - results may be less accurate';
    } else {
        return '❌ Poor signal quality - please check your setup';
    }
};
