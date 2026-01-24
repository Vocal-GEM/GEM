/**
 * VVD Reference Data
 * 
 * Empirically validated acoustic thresholds from the Versatile Voice Dataset (VVD).
 * Based on analysis of 42 recordings from 3 trans-feminine voice teachers.
 * 
 * Reference: Berkeley Speech Group VVD (2024)
 * @module vvdReferenceData
 */

/**
 * Pitch (F0) statistics by level from VVD dataset
 * All values in Hz
 */
export const VVD_PITCH_THRESHOLDS = {
    high: {
        min: 185,
        max: 290,
        mean: 265,
        feminine_threshold: 170 // Clinically validated threshold
    },
    medium: {
        min: 135,
        max: 215,
        mean: 175
    },
    low: {
        min: 113,
        max: 155,
        mean: 128
    }
};

/**
 * Formant statistics by resonance level from VVD dataset
 * All values in Hz
 */
export const VVD_FORMANT_THRESHOLDS = {
    high: {
        f1: { min: 538, max: 741, mean: 620 },
        f2: { min: 1782, max: 1948, mean: 1850 },
        f3: { min: 2870, max: 3105, mean: 2980 },
        avgFormant: { min: 1770, max: 1930, mean: 1850 }
    },
    medium: {
        f1: { min: 480, max: 735, mean: 590 },
        f2: { min: 1695, max: 2000, mean: 1840 },
        f3: { min: 2757, max: 3145, mean: 2920 },
        avgFormant: { min: 1660, max: 1930, mean: 1800 }
    },
    low: {
        f1: { min: 494, max: 742, mean: 610 },
        f2: { min: 1718, max: 2103, mean: 1840 },
        f3: { min: 2727, max: 3061, mean: 2860 },
        avgFormant: { min: 1666, max: 1976, mean: 1780 }
    }
};

/**
 * HNR (Harmonics-to-Noise Ratio) statistics by weight level from VVD dataset
 * All values in dB
 * Higher HNR = lighter/breathier weight
 * Lower HNR = heavier/pressed weight
 */
export const VVD_HNR_THRESHOLDS = {
    low: {  // Light weight (feminine)
        min: 17,
        max: 20,
        mean: 18.5
    },
    medium: {
        min: 13,
        max: 18,
        mean: 15.5
    },
    high: {  // Heavy weight (masculine)
        min: 10,
        max: 14,
        mean: 12
    }
};

/**
 * L1 Distance configurations from VVD
 * Maps pitch/resonance/weight combinations to L1 distances (0-6)
 * L1=0 is most feminine, L1=6 is most masculine
 */
export const VVD_L1_CONFIGURATIONS = [
    { l1: 0, pitch: 'high', resonance: 'high', weight: 'low', label: 'Feminine' },
    { l1: 1, pitch: 'high', resonance: 'medium', weight: 'low', label: 'Bright Feminine' },
    { l1: 2, pitch: 'medium', resonance: 'medium', weight: 'low', label: 'Light Androgynous' },
    { l1: 3, pitch: 'medium', resonance: 'medium', weight: 'medium', label: 'Neutral' },
    { l1: 4, pitch: 'low', resonance: 'medium', weight: 'medium', label: 'Dark Androgynous' },
    { l1: 5, pitch: 'low', resonance: 'low', weight: 'medium', label: 'Light Masculine' },
    { l1: 6, pitch: 'low', resonance: 'low', weight: 'high', label: 'Masculine' }
];

/**
 * Speaker variation coefficients from VVD (coefficient of variation %)
 * Useful for setting personalized tolerance ranges
 */
export const VVD_SPEAKER_VARIATION = {
    pitch: 0.08,      // ~8% CV for F0 within same configuration
    formants: 0.06,   // ~6% CV for formants
    hnr: 0.15         // ~15% CV for HNR (most variable)
};

/**
 * Calculate L1 distance from acoustic measurements
 * @param {number} pitch - F0 in Hz
 * @param {number} avgFormant - Average formant frequency in Hz
 * @param {number} hnr - HNR in dB
 * @returns {Object} { l1Distance, pitchLevel, resonanceLevel, weightLevel, label }
 */
export const calculateL1Distance = (pitch, avgFormant, hnr) => {
    // Classify pitch level
    let pitchLevel = 'medium';
    if (pitch >= VVD_PITCH_THRESHOLDS.high.min) {
        pitchLevel = 'high';
    } else if (pitch < VVD_PITCH_THRESHOLDS.medium.min) {
        pitchLevel = 'low';
    }

    // Classify resonance level based on average formant
    let resonanceLevel = 'medium';
    if (avgFormant >= VVD_FORMANT_THRESHOLDS.high.avgFormant.min) {
        resonanceLevel = 'high';
    } else if (avgFormant < VVD_FORMANT_THRESHOLDS.medium.avgFormant.min) {
        resonanceLevel = 'low';
    }

    // Classify weight level based on HNR (inverted: higher HNR = lower weight)
    let weightLevel = 'medium';
    if (hnr >= VVD_HNR_THRESHOLDS.low.min) {
        weightLevel = 'low';  // Light weight
    } else if (hnr < VVD_HNR_THRESHOLDS.medium.min) {
        weightLevel = 'high'; // Heavy weight
    }

    // Calculate L1 distance
    const levelMap = { high: 0, medium: 1, low: 2 };
    const pitchDist = Math.abs(levelMap[pitchLevel] - 0);      // Distance from high
    const resonanceDist = Math.abs(levelMap[resonanceLevel] - 0); // Distance from high
    const weightDist = Math.abs(levelMap[weightLevel] - 2);    // Distance from low

    const l1Distance = pitchDist + resonanceDist + weightDist;

    // Find matching configuration
    const config = VVD_L1_CONFIGURATIONS.find(c => c.l1 === l1Distance)
        || VVD_L1_CONFIGURATIONS[Math.min(l1Distance, 6)];

    return {
        l1Distance,
        pitchLevel,
        resonanceLevel,
        weightLevel,
        label: config.label,
        isAboveFeminineThreshold: pitch >= VVD_PITCH_THRESHOLDS.high.feminine_threshold
    };
};

/**
 * Get weight level from HNR value
 * @param {number} hnr - HNR in dB
 * @returns {Object} { level, description, normalized }
 */
export const getWeightLevelFromHNR = (hnr) => {
    if (hnr === null || hnr === undefined) {
        return { level: 'unknown', description: 'Not measured', normalized: 0.5 };
    }

    // Normalize HNR to 0-1 scale (10 dB = 0, 20 dB = 1)
    const normalized = Math.max(0, Math.min(1, (hnr - 10) / 10));

    if (hnr >= VVD_HNR_THRESHOLDS.low.min) {
        return { level: 'low', description: 'Light/Breathy', normalized };
    } else if (hnr >= VVD_HNR_THRESHOLDS.medium.min) {
        return { level: 'medium', description: 'Balanced', normalized };
    } else {
        return { level: 'high', description: 'Heavy/Pressed', normalized };
    }
};

/**
 * Calculate progress towards goal configuration
 * @param {Object} current - { pitch, avgFormant, hnr }
 * @param {Object} goal - { voiceType: 'feminine' | 'masculine' | 'androgynous' }
 * @returns {Object} { overallProgress, pitchProgress, resonanceProgress, weightProgress }
 */
export const calculateProgressToGoal = (current, goal) => {
    const targetL1 = goal.voiceType === 'feminine' ? 0
        : goal.voiceType === 'masculine' ? 6 : 3;

    const { l1Distance } = calculateL1Distance(
        current.pitch,
        current.avgFormant,
        current.hnr
    );

    // Calculate how close we are to target (0-1, 1 = at goal)
    const maxDistance = 6;
    const distanceFromGoal = Math.abs(l1Distance - targetL1);
    const overallProgress = 1 - (distanceFromGoal / maxDistance);

    // Individual dimension progress
    const targetPitch = goal.voiceType === 'feminine'
        ? VVD_PITCH_THRESHOLDS.high.mean : VVD_PITCH_THRESHOLDS.low.mean;
    const pitchProgress = goal.voiceType === 'feminine'
        ? Math.min(1, current.pitch / targetPitch)
        : Math.min(1, targetPitch / current.pitch);

    const targetHNR = goal.voiceType === 'feminine'
        ? VVD_HNR_THRESHOLDS.low.mean : VVD_HNR_THRESHOLDS.high.mean;
    const weightProgress = goal.voiceType === 'feminine'
        ? Math.min(1, current.hnr / targetHNR)
        : Math.min(1, targetHNR / current.hnr);

    return {
        overallProgress: Math.round(overallProgress * 100),
        l1Distance,
        targetL1,
        pitchProgress: Math.round(pitchProgress * 100),
        weightProgress: Math.round(weightProgress * 100)
    };
};

export default {
    VVD_PITCH_THRESHOLDS,
    VVD_FORMANT_THRESHOLDS,
    VVD_HNR_THRESHOLDS,
    VVD_L1_CONFIGURATIONS,
    VVD_SPEAKER_VARIATION,
    calculateL1Distance,
    getWeightLevelFromHNR,
    calculateProgressToGoal
};
