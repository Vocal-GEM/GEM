/**
 * TechniqueRecognizer.js
 * 
 * Identifies specific vocal techniques from audio analysis.
 * Detects sirens, SOVTEs, twang, sustained tones, and other exercises.
 */

/**
 * Analyze pitch contour to detect siren patterns
 * @param {number[]} pitchHistory - Array of pitch values over time
 * @returns {Object} Detection result with confidence
 */
const detectSiren = (pitchHistory) => {
    if (pitchHistory.length < 10) {
        return { detected: false, confidence: 0, type: null };
    }

    // Calculate pitch deltas (rate of change)
    const deltas = [];
    for (let i = 1; i < pitchHistory.length; i++) {
        if (pitchHistory[i] > 0 && pitchHistory[i - 1] > 0) {
            deltas.push(pitchHistory[i] - pitchHistory[i - 1]);
        }
    }

    if (deltas.length < 5) {
        return { detected: false, confidence: 0, type: null };
    }

    // Sirens have consistent directional movement
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const isAscending = avgDelta > 2; // Consistently rising
    const isDescending = avgDelta < -2; // Consistently falling

    // Check for smoothness (low variance in deltas)
    const deltaVariance = deltas.reduce((sum, d) => sum + Math.pow(d - avgDelta, 2), 0) / deltas.length;
    const smoothness = Math.max(0, 1 - deltaVariance / 100);

    // Calculate pitch range covered
    const validPitches = pitchHistory.filter(p => p > 0);
    const pitchRange = Math.max(...validPitches) - Math.min(...validPitches);

    if ((isAscending || isDescending) && smoothness > 0.6 && pitchRange > 50) {
        return {
            detected: true,
            confidence: Math.min(0.95, smoothness * 0.8 + (pitchRange / 200) * 0.2),
            type: isAscending ? 'siren-ascending' : 'siren-descending',
            metrics: {
                pitchRange,
                smoothness,
                avgRate: Math.abs(avgDelta)
            }
        };
    }

    return { detected: false, confidence: 0, type: null };
};

/**
 * Detect SOVTE (Semi-Occluded Vocal Tract Exercise) patterns
 * SOVTEs show periodic amplitude modulation (lip trills, tongue trills)
 * @param {Float32Array} audioBuffer - Raw audio samples
 * @param {number} sampleRate - Audio sample rate
 * @returns {Object} Detection result
 */
const detectSOVTE = (audioBuffer, sampleRate) => {
    if (!audioBuffer || audioBuffer.length < sampleRate) {
        return { detected: false, confidence: 0, type: null };
    }

    // Calculate amplitude envelope
    const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
    const envelope = [];

    for (let i = 0; i < audioBuffer.length - windowSize; i += windowSize) {
        const window = audioBuffer.slice(i, i + windowSize);
        const rms = Math.sqrt(window.reduce((sum, s) => sum + s * s, 0) / windowSize);
        envelope.push(rms);
    }

    if (envelope.length < 10) {
        return { detected: false, confidence: 0, type: null };
    }

    // Detect periodic modulation (trills typically 10-30 Hz)
    const modulationRate = detectModulationRate(envelope, sampleRate / windowSize);

    if (modulationRate > 8 && modulationRate < 35) {
        const confidence = Math.min(0.9, 0.5 + (Math.abs(modulationRate - 20) < 10 ? 0.4 : 0.2));

        return {
            detected: true,
            confidence,
            type: modulationRate > 20 ? 'lip-trill' : 'tongue-trill',
            metrics: {
                modulationRate: modulationRate.toFixed(1),
                regularity: 0.75 // Placeholder - could calculate from FFT
            }
        };
    }

    return { detected: false, confidence: 0, type: null };
};

/**
 * Detect modulation rate in amplitude envelope
 * @param {number[]} envelope - Amplitude envelope
 * @param {number} sampleRate - Envelope sample rate
 * @returns {number} Modulation rate in Hz
 */
const detectModulationRate = (envelope, sampleRate) => {
    // Simple autocorrelation to find periodicity
    const maxLag = Math.floor(sampleRate / 5); // Look for periods up to 200ms
    let maxCorr = 0;
    let bestLag = 0;

    for (let lag = Math.floor(sampleRate / 35); lag < maxLag; lag++) {
        let corr = 0;
        for (let i = 0; i < envelope.length - lag; i++) {
            corr += envelope[i] * envelope[i + lag];
        }
        if (corr > maxCorr) {
            maxCorr = corr;
            bestLag = lag;
        }
    }

    return bestLag > 0 ? sampleRate / bestLag : 0;
};

/**
 * Detect twang (high formant concentration)
 * @param {Object} formants - Formant frequencies { F1, F2, F3, F4 }
 * @returns {Object} Detection result
 */
const detectTwang = (formants) => {
    if (!formants || !formants.F3 || !formants.F4) {
        return { detected: false, confidence: 0, type: null };
    }

    // Twang is characterized by F3 and F4 clustering close together
    const f3f4Distance = Math.abs(formants.F4 - formants.F3);

    // Also check for elevated F3 (typically > 3000 Hz for twang)
    const f3Elevated = formants.F3 > 2800;

    if (f3f4Distance < 800 && f3Elevated) {
        const confidence = Math.min(0.9, 0.6 + (1 - f3f4Distance / 1600) * 0.3);

        return {
            detected: true,
            confidence,
            type: 'twang',
            metrics: {
                f3f4Distance,
                f3: formants.F3,
                f4: formants.F4
            }
        };
    }

    return { detected: false, confidence: 0, type: null };
};

/**
 * Detect sustained tone vs speech patterns
 * @param {number[]} pitchHistory - Recent pitch values
 * @returns {Object} Detection result
 */
const detectSustainedTone = (pitchHistory) => {
    if (pitchHistory.length < 20) {
        return { detected: false, confidence: 0, type: null };
    }

    const validPitches = pitchHistory.filter(p => p > 0);
    if (validPitches.length < 15) {
        return { detected: false, confidence: 0, type: null };
    }

    // Calculate pitch stability
    const mean = validPitches.reduce((a, b) => a + b, 0) / validPitches.length;
    const variance = validPitches.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / validPitches.length;
    const stdDev = Math.sqrt(variance);

    // Sustained tones have very low variance (< 5 Hz std dev)
    const isSustained = stdDev < 8;
    const stability = Math.max(0, 1 - stdDev / 20);

    if (isSustained && stability > 0.7) {
        return {
            detected: true,
            confidence: Math.min(0.95, stability),
            type: 'sustained-tone',
            metrics: {
                stability: stability.toFixed(2),
                avgPitch: mean.toFixed(1),
                variance: variance.toFixed(1)
            }
        };
    }

    return { detected: false, confidence: 0, type: null };
};

/**
 * Main technique recognition function
 * Analyzes audio and pitch data to identify the technique being practiced
 * @param {Object} analysisData - Audio analysis data
 * @returns {Object} Detected technique with confidence and feedback
 */
export const recognizeTechnique = (analysisData) => {
    const {
        pitchHistory = [],
        audioBuffer = null,
        sampleRate = 44100,
        formants = null,
        currentExercise = null
    } = analysisData;

    const results = [];

    // Run all detectors
    const sirenResult = detectSiren(pitchHistory);
    if (sirenResult.detected) results.push(sirenResult);

    if (audioBuffer) {
        const sovteResult = detectSOVTE(audioBuffer, sampleRate);
        if (sovteResult.detected) results.push(sovteResult);
    }

    if (formants) {
        const twangResult = detectTwang(formants);
        if (twangResult.detected) results.push(twangResult);
    }

    const sustainedResult = detectSustainedTone(pitchHistory);
    if (sustainedResult.detected) results.push(sustainedResult);

    // Return highest confidence result
    if (results.length === 0) {
        return {
            technique: 'unknown',
            confidence: 0,
            feedback: 'Continue practicing - technique not yet detected.',
            metrics: {}
        };
    }

    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);
    const best = results[0];

    return {
        technique: best.type,
        confidence: best.confidence,
        feedback: generateFeedback(best),
        metrics: best.metrics || {},
        alternativeDetections: results.slice(1)
    };
};

/**
 * Generate feedback message based on detected technique
 * @param {Object} detection - Detection result
 * @returns {string} Feedback message
 */
const generateFeedback = (detection) => {
    const feedbackMap = {
        'siren-ascending': `Great ascending siren! You covered ${detection.metrics?.pitchRange?.toFixed(0) || 'a good'} Hz range with ${(detection.metrics?.smoothness * 100)?.toFixed(0) || 'good'}% smoothness.`,
        'siren-descending': `Nice descending siren! Smooth glide with ${(detection.metrics?.smoothness * 100)?.toFixed(0) || 'good'}% consistency.`,
        'lip-trill': `Good lip trill! Modulation rate: ${detection.metrics?.modulationRate || 'steady'} Hz. Keep it relaxed.`,
        'tongue-trill': `Nice tongue trill! Keep the airflow steady and consistent.`,
        'twang': `Excellent twang! F3 and F4 are clustering nicely (${detection.metrics?.f3f4Distance?.toFixed(0) || 'close'} Hz apart).`,
        'sustained-tone': `Perfect sustained tone! Stability: ${(detection.metrics?.stability * 100)?.toFixed(0) || 'high'}%. Great pitch control at ${detection.metrics?.avgPitch || 'target'} Hz.`
    };

    return feedbackMap[detection.type] || 'Good technique! Keep practicing.';
};

/**
 * Get technique-specific coaching tips
 * @param {string} technique - Detected technique type
 * @returns {string[]} Array of coaching tips
 */
export const getTechniqueTips = (technique) => {
    const tipsMap = {
        'siren-ascending': [
            'Start from a comfortable low pitch',
            'Keep the glide smooth and continuous',
            'Don\'t push too high - stay comfortable',
            'Imagine sliding up a smooth ramp'
        ],
        'siren-descending': [
            'Start from a comfortable high pitch',
            'Let gravity help you descend',
            'Keep the sound connected throughout',
            'Relax as you come down'
        ],
        'lip-trill': [
            'Keep your lips relaxed and loose',
            'Use steady, consistent airflow',
            'Don\'t force it - let it bubble naturally',
            'This exercise releases tension'
        ],
        'tongue-trill': [
            'Relax your tongue',
            'Think "R" rolling sound',
            'Keep airflow steady',
            'This helps with vocal fold closure'
        ],
        'twang': [
            'Think of a "bratty" or "nasal" quality',
            'Imagine a cartoon character voice',
            'Feel the sound in your nose and face',
            'This brightens your resonance'
        ],
        'sustained-tone': [
            'Focus on keeping pitch steady',
            'Use consistent breath support',
            'Relax your throat',
            'This builds vocal control'
        ]
    };

    return tipsMap[technique] || ['Keep practicing!', 'Focus on consistency', 'Listen to your body'];
};

export default {
    recognizeTechnique,
    getTechniqueTips,
    detectSiren,
    detectSOVTE,
    detectTwang,
    detectSustainedTone
};
