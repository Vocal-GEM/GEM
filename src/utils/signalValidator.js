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
export const validateAudioSignal = (audioBuffer, _sampleRate) => {
    // Optimized: Single pass loop for computing metrics to reduce CPU overhead and garbage collection
    const len = audioBuffer.length;
    let maxAmplitude = 0;
    let sumSquares = 0;
    let sum = 0;

    const absBuffer = new Float32Array(len);

    for (let i = 0; i < len; i++) {
        const val = audioBuffer[i];
        let absVal = val;
        if (absVal < 0) absVal = -absVal;

        absBuffer[i] = absVal;

        if (absVal > maxAmplitude) maxAmplitude = absVal;
        sumSquares += val * val;
        sum += val;
    }

    const rms = Math.sqrt(sumSquares / len);
    const dcOffset = sum / len;

    // Optimized: Inline SNR estimation without massive array cloning
    absBuffer.sort();
    const noiseFloorIndex = Math.floor(len * 0.1);
    let nfSumSquares = 0;
    for (let i = 0; i < noiseFloorIndex; i++) {
        const val = absBuffer[i];
        nfSumSquares += val * val;
    }
    const noiseFloor = Math.sqrt(nfSumSquares / noiseFloorIndex);

    let snr = 50;
    if (noiseFloor >= 0.00001) {
        snr = 20 * Math.log10(rms / noiseFloor);
        if (snr < 0) snr = 0;
        else if (snr > 60) snr = 60;
    }

    const issues = [];
    if (maxAmplitude > 0.99) {
        issues.push({
            type: 'clipping',
            severity: 'high',
            message: 'Audio is clipping. Move away from microphone or reduce input gain.'
        });
    }

    if (rms < 0.001) {
        issues.push({
            type: 'silence',
            severity: 'high',
            message: 'No audio detected. Check microphone connection and permissions.'
        });
    }

    let absDcOffset = dcOffset;
    if (absDcOffset < 0) absDcOffset = -absDcOffset;
    if (absDcOffset > 0.05) {
        issues.push({
            type: 'dc_offset',
            severity: 'medium',
            message: 'Audio has DC bias. This may affect analysis accuracy.'
        });
    }

    if (snr < 10) {
        issues.push({
            type: 'low_snr',
            severity: 'medium',
            message: 'High background noise detected. Find a quieter environment for better results.'
        });
    }

    let confidence = (snr - 5) / 30;
    if (confidence < 0) confidence = 0;
    else if (confidence > 1) confidence = 1;

    let isValid = true;
    for (let i = 0; i < issues.length; i++) {
        if (issues[i].severity === 'high') {
            isValid = false;
            break;
        }
    }

    return { isValid, issues, confidence, metrics: {maxAmplitude, rms, dcOffset, snr}};
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
