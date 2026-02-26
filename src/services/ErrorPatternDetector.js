/**
 * ErrorPatternDetector.js
 * 
 * Recognizes common mistakes and provides targeted corrections.
 * Tracks error patterns over time to identify user-specific weaknesses.
 */

const ERROR_TYPES = {
    PITCH_DROP: 'pitch_drop',
    PITCH_INSTABILITY: 'pitch_instability',
    RESONANCE_INCONSISTENCY: 'resonance_inconsistency',
    STRAIN_DETECTED: 'strain_detected',
    BREATH_SUPPORT: 'breath_support',
    EXCESSIVE_BREATHINESS: 'excessive_breathiness',
    VOCAL_FRY: 'vocal_fry'
};

const ERROR_STORAGE_KEY = 'vocal_gem_error_patterns';
const MAX_SESSIONS_STORED = 20;

/**
 * Load error history from localStorage
 * @returns {Array} Array of past error sessions
 */
const loadErrorHistory = () => {
    try {
        const stored = localStorage.getItem(ERROR_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load error history:', e);
        return [];
    }
};

/**
 * Save error history to localStorage
 * @param {Array} history - Error history to save
 */
const saveErrorHistory = (history) => {
    try {
        // Keep only last MAX_SESSIONS_STORED sessions
        const trimmed = history.slice(-MAX_SESSIONS_STORED);
        localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.error('Failed to save error history:', e);
    }
};

/**
 * Detect pitch drop pattern
 * @param {number[]} pitchHistory - Recent pitch values
 * @param {Object} target - Target pitch range
 * @returns {Object|null} Error detection result
 */
const detectPitchDrop = (pitchHistory, target = { min: 160, max: 260 }) => {
    if (pitchHistory.length < 10) return null;

    const validPitches = pitchHistory.filter(p => p > 0);
    if (validPitches.length < 5) return null;

    // Check if pitch is consistently dropping over time
    const firstHalf = validPitches.slice(0, Math.floor(validPitches.length / 2));
    const secondHalf = validPitches.slice(Math.floor(validPitches.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const drop = avgFirst - avgSecond;

    if (drop > 15) { // Significant drop
        return {
            type: ERROR_TYPES.PITCH_DROP,
            severity: drop > 30 ? 'high' : 'medium',
            details: {
                dropAmount: drop.toFixed(1),
                startPitch: avgFirst.toFixed(1),
                endPitch: avgSecond.toFixed(1)
            },
            correction: 'Your pitch is dropping over time. Focus on maintaining consistent breath support and think "up" as you speak.',
            exercise: 'pitch-stability-drill'
        };
    }

    return null;
};

/**
 * Detect pitch instability
 * @param {number[]} pitchHistory - Recent pitch values
 * @returns {Object|null} Error detection result
 */
const detectPitchInstability = (pitchHistory) => {
    if (pitchHistory.length < 15) return null;

    const validPitches = pitchHistory.filter(p => p > 0);
    if (validPitches.length < 10) return null;

    // Calculate variance
    const mean = validPitches.reduce((a, b) => a + b, 0) / validPitches.length;
    const variance = validPitches.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / validPitches.length;
    const stdDev = Math.sqrt(variance);

    // High variance indicates instability
    if (stdDev > 25) {
        return {
            type: ERROR_TYPES.PITCH_INSTABILITY,
            severity: stdDev > 40 ? 'high' : 'medium',
            details: {
                variance: variance.toFixed(1),
                stdDev: stdDev.toFixed(1),
                avgPitch: mean.toFixed(1)
            },
            correction: 'Your pitch is jumping around. Practice sustained tones to build stability, and focus on consistent breath support.',
            exercise: 'sustained-tone-practice'
        };
    }

    return null;
};

/**
 * Detect resonance inconsistency
 * @param {number[]} resonanceHistory - Recent resonance values (0-100)
 * @returns {Object|null} Error detection result
 */
const detectResonanceInconsistency = (resonanceHistory) => {
    if (resonanceHistory.length < 10) return null;

    const validValues = resonanceHistory.filter(r => r !== null && r !== undefined);
    if (validValues.length < 5) return null;

    // Calculate variance
    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const variance = validValues.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / validValues.length;
    const stdDev = Math.sqrt(variance);

    // High variance indicates inconsistency
    if (stdDev > 15) {
        return {
            type: ERROR_TYPES.RESONANCE_INCONSISTENCY,
            severity: stdDev > 25 ? 'high' : 'medium',
            details: {
                variance: variance.toFixed(1),
                stdDev: stdDev.toFixed(1),
                avgResonance: mean.toFixed(1)
            },
            correction: 'Your resonance is inconsistent. Practice maintaining the same "bright" placement throughout your speech.',
            exercise: 'resonance-consistency-drill'
        };
    }

    return null;
};

/**
 * Detect strain indicators
 * @param {Object} metrics - Current voice metrics
 * @returns {Object|null} Error detection result
 */
const detectStrain = (metrics) => {
    const { tilt, jitter, shimmer } = metrics;

    // Strain indicators:
    // - Spectral tilt > -4 dB (pressed phonation)
    // - High jitter (> 1.5%)
    // - High shimmer (> 4%)

    const strainIndicators = [];

    if (tilt !== undefined && tilt > -4) {
        strainIndicators.push('pressed phonation');
    }

    if (jitter !== undefined && jitter > 1.5) {
        strainIndicators.push('pitch instability');
    }

    if (shimmer !== undefined && shimmer > 4) {
        strainIndicators.push('amplitude instability');
    }

    if (strainIndicators.length >= 2) {
        return {
            type: ERROR_TYPES.STRAIN_DETECTED,
            severity: 'high',
            details: {
                indicators: strainIndicators,
                tilt: tilt?.toFixed(2),
                jitter: jitter?.toFixed(2),
                shimmer: shimmer?.toFixed(2)
            },
            correction: '⚠️ Vocal strain detected! Take a break, do some gentle humming, and ease off the effort. Strain can lead to vocal fatigue.',
            exercise: 'gentle-warm-up'
        };
    }

    return null;
};

/**
 * Detect breath support issues
 * @param {number[]} pitchHistory - Recent pitch values
 * @param {number[]} amplitudeHistory - Recent amplitude values
 * @returns {Object|null} Error detection result
 */
const detectBreathSupport = (pitchHistory, amplitudeHistory) => {
    if (pitchHistory.length < 10 || amplitudeHistory.length < 10) return null;

    // Breath support issues show as:
    // 1. Pitch drops at end of phrases
    // 2. Amplitude drops at end of phrases

    const pitchDrop = pitchHistory[0] - pitchHistory[pitchHistory.length - 1];
    const ampDrop = amplitudeHistory[0] - amplitudeHistory[amplitudeHistory.length - 1];

    if (pitchDrop > 20 && ampDrop > 0.2) {
        return {
            type: ERROR_TYPES.BREATH_SUPPORT,
            severity: 'medium',
            details: {
                pitchDrop: pitchDrop.toFixed(1),
                amplitudeDrop: ampDrop.toFixed(2)
            },
            correction: 'Your pitch and volume are dropping at the end of phrases. Practice breathing exercises and engage your core for better support.',
            exercise: 'breath-support-training'
        };
    }

    return null;
};

/**
 * Detect excessive breathiness
 * @param {Object} metrics - Voice metrics
 * @returns {Object|null} Error detection result
 */
const detectBreathiness = (metrics) => {
    const { hnr, cpp } = metrics; // Harmonics-to-Noise Ratio, Cepstral Peak Prominence

    // Low HNR (< 10 dB) indicates breathiness
    // Low CPP (< 8 dB) also indicates breathiness

    if ((hnr !== undefined && hnr < 10) || (cpp !== undefined && cpp < 8)) {
        return {
            type: ERROR_TYPES.EXCESSIVE_BREATHINESS,
            severity: 'medium',
            details: {
                hnr: hnr?.toFixed(2),
                cpp: cpp?.toFixed(2)
            },
            correction: 'Your voice sounds breathy. Practice gentle vocal fold closure exercises like "ng" humming or straw phonation.',
            exercise: 'vocal-fold-closure'
        };
    }

    return null;
};

/**
 * Detect vocal fry
 * @param {number} pitch - Current pitch
 * @param {Object} metrics - Voice metrics
 * @returns {Object|null} Error detection result
 */
const detectVocalFry = (pitch, metrics) => {
    const { jitter } = metrics;

    // Vocal fry: very low pitch (< 80 Hz) with high jitter
    if (pitch > 0 && pitch < 80 && jitter > 2) {
        return {
            type: ERROR_TYPES.VOCAL_FRY,
            severity: 'low',
            details: {
                pitch: pitch.toFixed(1),
                jitter: jitter?.toFixed(2)
            },
            correction: 'Vocal fry detected. Increase breath support and pitch slightly to avoid creaky voice.',
            exercise: 'pitch-lift-exercise'
        };
    }

    return null;
};

/**
 * Analyze current session for errors
 * @param {Object} sessionData - Current session data
 * @returns {Object[]} Array of detected errors
 */
export const analyzeSession = (sessionData) => {
    const {
        pitchHistory = [],
        resonanceHistory = [],
        amplitudeHistory = [],
        currentMetrics = {}
    } = sessionData;

    const errors = [];

    // Run all detectors
    const pitchDropError = detectPitchDrop(pitchHistory);
    if (pitchDropError) errors.push(pitchDropError);

    const instabilityError = detectPitchInstability(pitchHistory);
    if (instabilityError) errors.push(instabilityError);

    const resonanceError = detectResonanceInconsistency(resonanceHistory);
    if (resonanceError) errors.push(resonanceError);

    const strainError = detectStrain(currentMetrics);
    if (strainError) errors.push(strainError);

    const breathError = detectBreathSupport(pitchHistory, amplitudeHistory);
    if (breathError) errors.push(breathError);

    const breathinessError = detectBreathiness(currentMetrics);
    if (breathinessError) errors.push(breathinessError);

    const fryError = detectVocalFry(pitchHistory[pitchHistory.length - 1], currentMetrics);
    if (fryError) errors.push(fryError);

    return errors;
};

/**
 * Record errors from a session
 * @param {Object[]} errors - Detected errors
 */
export const recordSessionErrors = (errors) => {
    const history = loadErrorHistory();

    const sessionRecord = {
        timestamp: Date.now(),
        errors: errors.map(e => ({
            type: e.type,
            severity: e.severity,
            details: e.details
        }))
    };

    history.push(sessionRecord);
    saveErrorHistory(history);
};

/**
 * Get error pattern statistics
 * @returns {Object} Error statistics and recommendations
 */
export const getErrorPatternStats = () => {
    const history = loadErrorHistory();

    if (history.length === 0) {
        return {
            totalSessions: 0,
            errorFrequency: {},
            topErrors: [],
            recommendations: []
        };
    }

    // Count error frequencies
    const errorCounts = {};
    let totalErrors = 0;

    history.forEach(session => {
        session.errors.forEach(error => {
            errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
            totalErrors++;
        });
    });

    // Sort by frequency
    const topErrors = Object.entries(errorCounts)
        .map(([type, count]) => ({
            type,
            count,
            percentage: ((count / totalErrors) * 100).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

    // Generate recommendations
    const recommendations = generateRecommendations(topErrors);

    return {
        totalSessions: history.length,
        totalErrors,
        errorFrequency: errorCounts,
        topErrors,
        recommendations,
        recentTrend: analyzeRecentTrend(history)
    };
};

/**
 * Generate recommendations based on error patterns
 * @param {Object[]} topErrors - Most frequent errors
 * @returns {Object[]} Recommendations
 */
const generateRecommendations = (topErrors) => {
    const recommendationMap = {
        [ERROR_TYPES.PITCH_DROP]: {
            title: 'Focus on Pitch Stability',
            message: 'You frequently experience pitch drops. Work on breath support and core engagement.',
            exercises: ['breath-support-training', 'sustained-tone-practice'],
            priority: 'high'
        },
        [ERROR_TYPES.PITCH_INSTABILITY]: {
            title: 'Build Pitch Control',
            message: 'Your pitch tends to be unstable. Practice sustained tones and slow pitch glides.',
            exercises: ['sustained-tone-practice', 'pitch-stability-drill'],
            priority: 'high'
        },
        [ERROR_TYPES.RESONANCE_INCONSISTENCY]: {
            title: 'Improve Resonance Consistency',
            message: 'Your resonance varies too much. Focus on maintaining forward placement.',
            exercises: ['resonance-consistency-drill', 'brightness-training'],
            priority: 'medium'
        },
        [ERROR_TYPES.STRAIN_DETECTED]: {
            title: 'Reduce Vocal Strain',
            message: '⚠️ You\'re showing signs of strain. Take more breaks and use gentler exercises.',
            exercises: ['gentle-warm-up', 'sovte-exercises'],
            priority: 'critical'
        },
        [ERROR_TYPES.BREATH_SUPPORT]: {
            title: 'Strengthen Breath Support',
            message: 'Work on breathing exercises to maintain pitch and volume throughout phrases.',
            exercises: ['breath-support-training', 'diaphragm-exercises'],
            priority: 'high'
        },
        [ERROR_TYPES.EXCESSIVE_BREATHINESS]: {
            title: 'Improve Vocal Fold Closure',
            message: 'Your voice is too breathy. Practice gentle closure exercises.',
            exercises: ['vocal-fold-closure', 'ng-humming'],
            priority: 'medium'
        },
        [ERROR_TYPES.VOCAL_FRY]: {
            title: 'Eliminate Vocal Fry',
            message: 'Avoid creaky voice by maintaining breath support and pitch.',
            exercises: ['pitch-lift-exercise', 'breath-support-training'],
            priority: 'low'
        }
    };

    return topErrors
        .map(error => recommendationMap[error.type])
        .filter(rec => rec !== undefined);
};

/**
 * Analyze recent trend (improving or worsening)
 * @param {Object[]} history - Error history
 * @returns {Object} Trend analysis
 */
const analyzeRecentTrend = (history) => {
    if (history.length < 4) {
        return { trend: 'insufficient_data', message: 'Keep practicing to see trends!' };
    }

    const recentSessions = history.slice(-5);
    const olderSessions = history.slice(-10, -5);

    const recentErrorCount = recentSessions.reduce((sum, s) => sum + s.errors.length, 0);
    const olderErrorCount = olderSessions.reduce((sum, s) => sum + s.errors.length, 0);

    const recentAvg = recentErrorCount / recentSessions.length;
    const olderAvg = olderErrorCount / Math.max(1, olderSessions.length);

    if (recentAvg < olderAvg * 0.7) {
        return {
            trend: 'improving',
            message: '📈 Great progress! Your error rate is decreasing.',
            improvement: ((olderAvg - recentAvg) / olderAvg * 100).toFixed(0)
        };
    } else if (recentAvg > olderAvg * 1.3) {
        return {
            trend: 'worsening',
            message: '⚠️ Error rate increasing. Consider taking a rest day or reviewing fundamentals.',
            change: ((recentAvg - olderAvg) / olderAvg * 100).toFixed(0)
        };
    } else {
        return {
            trend: 'stable',
            message: 'Your error rate is stable. Keep up the consistent practice!'
        };
    }
};

/**
 * Get targeted correction for specific error
 * @param {string} errorType - Type of error
 * @returns {Object} Detailed correction guidance
 */
export const getTargetedCorrection = (errorType) => {
    const corrections = {
        [ERROR_TYPES.PITCH_DROP]: {
            immediate: 'Reset your posture and take a deep breath. Think "up" as you speak.',
            practice: 'Practice sustaining a single pitch for 10 seconds, focusing on steady breath support.',
            longTerm: 'Build core strength and practice diaphragmatic breathing daily.'
        },
        [ERROR_TYPES.PITCH_INSTABILITY]: {
            immediate: 'Slow down and focus on one pitch at a time.',
            practice: 'Practice pitch matching with a tuner or piano.',
            longTerm: 'Regular sustained tone exercises will build pitch control over time.'
        },
        [ERROR_TYPES.RESONANCE_INCONSISTENCY]: {
            immediate: 'Smile slightly and think of the sound coming forward in your face.',
            practice: 'Practice "ng" humming while maintaining the same placement.',
            longTerm: 'Consistent resonance comes from muscle memory - practice daily.'
        },
        [ERROR_TYPES.STRAIN_DETECTED]: {
            immediate: '⚠️ STOP and rest! Do gentle lip trills to release tension.',
            practice: 'Use SOVTEs (straw phonation, lip trills) to practice without strain.',
            longTerm: 'Never push through strain. Build strength gradually with gentle exercises.'
        }
    };

    return corrections[errorType] || {
        immediate: 'Take a moment to reset and refocus.',
        practice: 'Practice this exercise slowly and mindfully.',
        longTerm: 'Consistency is key - keep practicing!'
    };
};

export default {
    analyzeSession,
    recordSessionErrors,
    getErrorPatternStats,
    getTargetedCorrection,
    ERROR_TYPES
};
