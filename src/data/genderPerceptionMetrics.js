/**
 * Gender Perception Metrics
 * 
 * Reference data from da Cruz Martinho et al. (2024)
 * "Can acoustic measurements predict gender perception in the voice?"
 * 
 * Defines predictive measures by listener context (SLP/CG/TNB) and
 * target ranges for different gender presentations.
 */

/**
 * Predictive measures by listener context and speaker type
 * Based on Table 9 from the research paper
 */
export const PERCEPTION_PREDICTORS = {
    // Speech-Language Pathologists (clinical perspective)
    SLP: {
        cisgender: {
            vowel: ['f0_med', 'jitter'],
            speech: ['f0_med'],
            poem: ['f0_med', 'hnr']
        },
        transgender: {
            vowel: [],
            speech: ['f0_med'],
            poem: ['f0_med', 'f0_sd', 'sr', 'f0_min', 'emph', 'hnr', 'shimmer', 'f0_peakwidth']
        }
    },

    // Cisgender judges (general population perspective)
    CG: {
        cisgender: {
            vowel: [],
            speech: ['f0_med', 'hnr'],
            poem: ['f0_med', 'hnr', 'cvint', 'sr']
        },
        transgender: {
            vowel: [],
            speech: ['f0_med'],
            poem: ['f0_med', 'f0_sd', 'sr', 'f0_max', 'emph', 'hnr', 'shimmer']
        }
    },

    // Trans/Non-Binary judges (community perspective)
    TNB: {
        cisgender: {
            vowel: [],
            speech: ['f0_med'],
            poem: ['f0_med', 'hnr', 'cvint', 'f0_peakwidth']
        },
        transgender: {
            vowel: [],
            speech: ['f0_med', 'cpps', 'abi'],
            poem: ['f0_med', 'sr', 'emph', 'f0_sd', 'shimmer', 'hnr', 'jitter', 'f0_max']
        }
    }
};

/**
 * Measure weights for gender perception prediction
 * Derived from regression coefficients in the paper
 * Higher weight = more influence on perception
 */
export const PERCEPTION_WEIGHTS = {
    // Primary predictors (high influence)
    f0_med: 0.35,
    hnr: 0.20,

    // Secondary predictors (moderate influence)
    cpps: 0.12,
    abi: 0.10,
    shimmer: 0.08,
    jitter: 0.05,

    // Prosodic measures (context-dependent)
    sr: 0.05,      // Speech rate
    cvint: 0.05,   // Intensity variation
    f0_sd: 0.04,   // Pitch variability
    f0_peakwidth: 0.03,
    emph: 0.03     // Emphasis/spectral
};

/**
 * Reference ranges for different gender presentations
 * Based on Brazilian Portuguese speaker data from the paper
 */
export const GENDER_PRESENTATION_RANGES = {
    // Note: These are on a -50 to +50 scale where:
    // -50 = very masculine, 0 = neutral, +50 = very feminine

    feminine: {
        f0_med: { min: 180, max: 300, target: 220 },
        hnr: { min: 15, max: 25, target: 20 },
        abi: { min: 3, max: 6, target: 4 },  // More breathy
        shimmer: { min: 2, max: 5, target: 3 },
        jitter: { min: 0.5, max: 2, target: 1 },
        sr: { min: 3, max: 5, target: 4 },  // Syllables/sec
        cvint: { min: 10, max: 25, target: 15 }
    },

    androgynous: {
        f0_med: { min: 140, max: 200, target: 170 },
        hnr: { min: 12, max: 20, target: 16 },
        abi: { min: 2, max: 4, target: 3 },
        shimmer: { min: 2, max: 6, target: 4 },
        jitter: { min: 0.8, max: 2.5, target: 1.5 },
        sr: { min: 3, max: 5, target: 4 },
        cvint: { min: 8, max: 20, target: 12 }
    },

    masculine: {
        f0_med: { min: 80, max: 160, target: 120 },
        hnr: { min: 8, max: 16, target: 12 },
        abi: { min: 1, max: 3, target: 2 },  // Less breathy
        shimmer: { min: 3, max: 8, target: 5 },
        jitter: { min: 1, max: 3, target: 2 },
        sr: { min: 3, max: 5, target: 3.5 },
        cvint: { min: 5, max: 15, target: 10 }
    }
};

/**
 * Key finding from the paper: Breathiness correlation with femininity
 * Cisgender women exhibited greater breathiness (higher ABI)
 */
export const BREATHINESS_GENDER_CORRELATION = {
    feminine: { abiRange: [3, 6], description: 'Higher breathiness associated with feminine perception' },
    masculine: { abiRange: [1, 3], description: 'Lower breathiness associated with masculine perception' },
    neutral: { abiRange: [2, 4], description: 'Moderate breathiness in androgynous range' }
};

/**
 * Calculate predicted gender perception score
 * @param {Object} metrics - Voice metrics from getComprehensiveMetrics()
 * @param {string} listenerContext - 'SLP', 'CG', or 'TNB'
 * @returns {Object} { score, level, interpretation }
 */
export const predictGenderPerception = (metrics, listenerContext = 'CG') => {
    const weights = PERCEPTION_WEIGHTS;
    const ranges = GENDER_PRESENTATION_RANGES;

    // Extract raw metrics
    const f0 = metrics.raw?.pitch?.mean || 150;
    const hnr = metrics.raw?.hnr || 15;
    const abi = metrics.indices?.abi?.score || 3;
    const shimmer = metrics.raw?.shimmer || 4;
    const jitter = metrics.raw?.jitter || 1.5;
    const cvint = metrics.prosody?.cvint?.cvint || 12;

    // Calculate weighted score for each dimension
    // Normalize each measure to 0-1 based on feminine/masculine ranges
    const f0Score = (f0 - ranges.masculine.f0_med.target) /
        (ranges.feminine.f0_med.target - ranges.masculine.f0_med.target);
    const hnrScore = (hnr - ranges.masculine.hnr.target) /
        (ranges.feminine.hnr.target - ranges.masculine.hnr.target);
    const abiScore = (abi - ranges.masculine.abi.target) /
        (ranges.feminine.abi.target - ranges.masculine.abi.target);
    const cvintScore = (cvint - ranges.masculine.cvint.target) /
        (ranges.feminine.cvint.target - ranges.masculine.cvint.target);

    // Context-specific weighting adjustments
    let contextMultiplier = 1.0;
    if (listenerContext === 'TNB') {
        // TNB judges use more measures beyond f0
        contextMultiplier = 0.85; // Reduce f0 dominance
    }

    // Weighted composite score
    const compositeScore =
        (f0Score * weights.f0_med * contextMultiplier) +
        (hnrScore * weights.hnr) +
        (abiScore * weights.abi) +
        (cvintScore * weights.cvint);

    // Convert to -50 to +50 scale
    const perceptionScore = Math.max(-50, Math.min(50, (compositeScore - 0.5) * 100));

    // Classify result
    let level, interpretation;
    if (perceptionScore < -30) {
        level = 'strongly_masculine';
        interpretation = 'Very likely to be perceived as masculine';
    } else if (perceptionScore < -10) {
        level = 'masculine';
        interpretation = 'Likely to be perceived as masculine';
    } else if (perceptionScore < 10) {
        level = 'androgynous';
        interpretation = 'Likely to be perceived as gender-neutral';
    } else if (perceptionScore < 30) {
        level = 'feminine';
        interpretation = 'Likely to be perceived as feminine';
    } else {
        level = 'strongly_feminine';
        interpretation = 'Very likely to be perceived as feminine';
    }

    return {
        score: Math.round(perceptionScore),
        level,
        interpretation,
        context: listenerContext,
        // Breakdown by dimension
        dimensions: {
            pitch: Math.round(f0Score * 100),
            breathiness: Math.round(abiScore * 100),
            hnr: Math.round(hnrScore * 100),
            expressiveness: Math.round(cvintScore * 100)
        }
    };
};

/**
 * Get relevant measures for a specific listener context
 * Different contexts prioritize different acoustic features
 * @param {string} context - 'SLP', 'CG', or 'TNB'
 * @param {string} taskType - 'vowel', 'speech', or 'poem'
 * @returns {Array} Array of measure names to prioritize
 */
export const getContextRelevantMeasures = (context, taskType = 'speech') => {
    const predictors = PERCEPTION_PREDICTORS[context];
    if (!predictors) return ['f0_med', 'hnr'];

    // Combine cisgender and transgender measures
    const cisMeasures = predictors.cisgender[taskType] || [];
    const transMeasures = predictors.transgender[taskType] || [];

    // Return unique measures
    return [...new Set([...cisMeasures, ...transMeasures])];
};

export default {
    PERCEPTION_PREDICTORS,
    PERCEPTION_WEIGHTS,
    GENDER_PRESENTATION_RANGES,
    BREATHINESS_GENDER_CORRELATION,
    predictGenderPerception,
    getContextRelevantMeasures
};
