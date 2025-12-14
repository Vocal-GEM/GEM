/**
 * GenderPerceptionPredictor
 * 
 * Combines F0 (pitch) and F1 (resonance) into a perception likelihood score.
 * Based on Source-Filter Theory: when pitch is in the ambiguous zone (135-175 Hz),
 * resonance (particularly F1) becomes the deciding factor for perception.
 */

// Sigmoid function for smooth transitions
const sigmoid = (x) => 1 / (1 + Math.exp(-x));

// Constants based on research
const PITCH_CROSSOVER = 157; // Hz - midpoint of overlap zone
const PITCH_SCALE = 25; // Hz - spread for sigmoid

const F1_CROSSOVER = 500; // Hz - approximate perception threshold
const F1_SCALE = 80; // Hz - spread for sigmoid

export const AMBIGUITY_ZONE = { min: 135, max: 175 }; // Hz

/**
 * Calculate perception score from pitch and resonance
 * @param {number} pitch - Fundamental frequency (F0) in Hz
 * @param {number} f1OrF2 - First or Second formant frequency in Hz (F2 preferred)
 * @param {number} rbi - Resonance Brightness Index (0-100), optional
 * @param {Object} options - Optional parameters for enhanced analysis
 * @param {number} options.f2 - Second formant (F2) in Hz (RECOMMENDED - most important for gender)
 * @param {number} options.vocalWeight - Vocal weight 0-100 (0=heavy/pressed, 100=light/breathy)
 * @param {number} options.h1h2 - H1-H2 measure in dB (alternative to vocalWeight)
 * @param {number} options.breathiness - F3 noise/breathiness 0-100
 * @returns {Object} Prediction result
 */
export function predictGenderPerception(pitch, f1OrF2, rbi = null, options = {}) {
    // Handle invalid inputs
    if (!pitch || pitch < 50 || pitch > 500) {
        return {
            score: 0.5,
            confidence: 0,
            isAmbiguous: true,
            pitchContribution: 0,
            resonanceContribution: 0,
            vocalWeightContribution: 0,
            breathinessContribution: 0,
            inAmbiguityZone: false
        };
    }

    // Determine if we have F2 (preferred) or F1
    const f2 = options.f2 || (f1OrF2 > 1200 ? f1OrF2 : null);
    const f1 = f1OrF2 < 1200 ? f1OrF2 : null;

    // Calculate pitch contribution (0 = Dark/Low, 1 = Bright/High)
    const pitchNormalized = sigmoid((pitch - PITCH_CROSSOVER) / PITCH_SCALE);

    // Calculate resonance contribution - F2 is MUCH more important than F1 for gender
    // Research: Higher F2 = more feminine (Gelfer & Schofield 2000, etc.)
    let resonanceNormalized = 0.5;
    const F2_CROSSOVER = 1800; // Hz - typical F2 threshold (male ~1200-1500, female ~2000-2500)
    const F2_SCALE = 300; // Hz

    if (f2 && f2 > 1000 && f2 < 3500) {
        // Use F2 (preferred - most important formant for gender)
        resonanceNormalized = sigmoid((f2 - F2_CROSSOVER) / F2_SCALE);
    } else if (f1 && f1 > 200 && f1 < 1200) {
        // Fall back to F1 if F2 not available
        resonanceNormalized = sigmoid((f1 - F1_CROSSOVER) / F1_SCALE);
    } else if (rbi !== null && rbi >= 0 && rbi <= 100) {
        // Final fallback to RBI
        resonanceNormalized = rbi / 100;
    }

    // Calculate vocal weight contribution
    // Research: Breathy/light voice = more feminine (Garellek & Keating 2010)
    let vocalWeightNormalized = 0.5;
    if (options.vocalWeight !== undefined) {
        // Direct vocal weight score (0-100)
        vocalWeightNormalized = Math.max(0, Math.min(1, options.vocalWeight / 100));
    } else if (options.h1h2 !== undefined) {
        // Convert H1-H2 to normalized score
        // H1-H2: Breathy ~10dB, Modal ~2dB, Pressed ~0dB
        // Map to 0-1: 0dB->0.0, 5dB->0.5, 10dB->1.0
        const h1h2Clamped = Math.max(0, Math.min(10, options.h1h2));
        vocalWeightNormalized = h1h2Clamped / 10;
    }

    // Calculate breathiness contribution
    // Slight breathiness can enhance feminine perception
    let breathinessNormalized = 0.5;
    if (options.breathiness !== undefined) {
        breathinessNormalized = Math.max(0, Math.min(1, options.breathiness / 100));
    }

    // Check if in ambiguity zone
    const inAmbiguityZone = pitch >= AMBIGUITY_ZONE.min && pitch <= AMBIGUITY_ZONE.max;

    // Research-based weight calculation
    // When pitch is ambiguous, formants and voice quality become critical
    let weights;
    if (inAmbiguityZone) {
        // In ambiguity zone: Resonance and vocal weight are most important
        weights = {
            pitch: 0.20,
            resonance: 0.40,  // F2 is critical
            vocalWeight: 0.30, // Light/breathy vs heavy/pressed
            breathiness: 0.10
        };
    } else if (pitch < AMBIGUITY_ZONE.min) {
        // Below ambiguity: Pitch dominates, but weight can help
        weights = {
            pitch: 0.50,
            resonance: 0.25,
            vocalWeight: 0.20,
            breathiness: 0.05
        };
    } else {
        // Above ambiguity: Pitch strong indicator
        weights = {
            pitch: 0.45,
            resonance: 0.30,
            vocalWeight: 0.20,
            breathiness: 0.05
        };
    }

    // Combined score
    let score = (pitchNormalized * weights.pitch) +
                (resonanceNormalized * weights.resonance) +
                (vocalWeightNormalized * weights.vocalWeight) +
                (breathinessNormalized * weights.breathiness);

    // Synergy bonus - when multiple factors agree, boost confidence
    const factors = [pitchNormalized, resonanceNormalized, vocalWeightNormalized, breathinessNormalized];
    const avgFactor = factors.reduce((a, b) => a + b) / factors.length;
    const agreement = 1 - (factors.reduce((sum, f) => sum + Math.abs(f - avgFactor), 0) / factors.length);

    if (agreement > 0.75) {
        const boost = (agreement - 0.75) * 0.2;
        if (score > 0.5) {
            score = Math.min(1, score + boost);
        } else {
            score = Math.max(0, score - boost);
        }
    }

    // Calculate confidence based on agreement and extremity
    const extremity = Math.abs(score - 0.5) * 2;
    const confidence = extremity * agreement;

    return {
        score: Math.round(score * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        isAmbiguous: score >= 0.4 && score <= 0.6,
        pitchContribution: Math.round(pitchNormalized * 100) / 100,
        resonanceContribution: Math.round(resonanceNormalized * 100) / 100,
        vocalWeightContribution: Math.round(vocalWeightNormalized * 100) / 100,
        breathinessContribution: Math.round(breathinessNormalized * 100) / 100,
        inAmbiguityZone,
        weights,
        factors: {
            usedF2: !!f2,
            usedF1: !!f1 && !f2,
            usedRBI: !f1 && !f2 && rbi !== null
        }
    };
}

/**
 * Get label for perception score based on mode
 * @param {number} score - 0 to 1
 * @param {string} mode - 'neutral' | 'default' (gendered) | 'off'
 * @returns {string} Label
 */
export function getPerceptionLabel(score, mode = 'neutral') {
    if (mode === 'off') return '';

    if (mode === 'default') {
        // Gendered Labels
        if (score < 0.2) return 'Masculine';
        if (score < 0.4) return 'Masc-Leaning';
        if (score < 0.6) return 'Ambiguous';
        if (score < 0.8) return 'Fem-Leaning';
        return 'Feminine';
    }

    // Neutral / Acoustic Labels
    if (score < 0.2) return 'Dark / Low';
    if (score < 0.4) return 'Dark-Leaning';
    if (score < 0.6) return 'Balanced';
    if (score < 0.8) return 'Bright-Leaning';
    return 'Bright / High';
}

/**
 * Get color for perception score
 * @param {number} score - 0 to 1
 * @param {boolean} colorBlindMode - Use colorblind-friendly palette
 * @returns {string} CSS color
 */
export function getPerceptionColor(score, colorBlindMode = false) {
    if (colorBlindMode) {
        // Teal to Purple gradient (colorblind-friendly)
        if (score < 0.3) return '#0d9488'; // Teal (Dark/Low)
        if (score < 0.5) return '#6366f1'; // Indigo
        if (score < 0.7) return '#8b5cf6'; // Violet
        return '#a855f7'; // Purple (Bright/High)
    }

    // Blue to Pink natural gradient makes semantic sense for "Warm/Bright" vs "Cool/Dark"
    // Using a Blue -> Purple -> Pink spectrum
    if (score < 0.25) return '#3b82f6'; // Blue (Dark/Low)
    if (score < 0.45) return '#6366f1'; // Indigo 
    if (score < 0.55) return '#a855f7'; // Purple (Balanced)
    if (score < 0.75) return '#d946ef'; // Fuchsia
    return '#ec4899'; // Pink (Bright/High)
}

/**
 * Get a brief explanation for the current perception state
 * @param {Object} prediction - Result from predictGenderPerception
 * @param {string} mode - 'neutral' | 'default'
 * @returns {string} Human-readable explanation
 */
export function getPerceptionExplanation(prediction, mode = 'neutral') {
    const {
        inAmbiguityZone,
        pitchContribution,
        resonanceContribution,
        vocalWeightContribution = 0.5,
        breathinessContribution = 0.5,
        score,
        factors = {}
    } = prediction;
    const label = getPerceptionLabel(score, mode);

    const terms = mode === 'default'
        ? { bright: 'feminine', dark: 'masculine', neutral: 'ambiguous', light: 'feminine', heavy: 'masculine' }
        : { bright: 'bright', dark: 'dark', neutral: 'balanced', light: 'light', heavy: 'heavy' };

    // In ambiguity zone: resonance and vocal weight are critical
    if (inAmbiguityZone) {
        const brightFactors = [];
        const darkFactors = [];

        if (resonanceContribution > 0.6) brightFactors.push(factors.usedF2 ? 'bright F2' : 'bright resonance');
        else if (resonanceContribution < 0.4) darkFactors.push(factors.usedF2 ? 'dark F2' : 'dark resonance');

        if (vocalWeightContribution > 0.6) brightFactors.push(`light vocal weight`);
        else if (vocalWeightContribution < 0.4) darkFactors.push(`heavy vocal weight`);

        if (brightFactors.length > 0) {
            return `Pitch is in the middle range, but ${brightFactors.join(' and ')} shift${brightFactors.length === 1 ? 's' : ''} perception ${terms.bright}.`;
        } else if (darkFactors.length > 0) {
            return `Pitch is in the middle range, but ${darkFactors.join(' and ')} shift${darkFactors.length === 1 ? 's' : ''} perception ${terms.dark}.`;
        } else {
            return `Pitch, resonance, and vocal weight are all in the ${terms.neutral} zone.`;
        }
    }

    // Check for strong agreement across factors
    const allBright = pitchContribution > 0.7 && resonanceContribution > 0.7 && vocalWeightContribution > 0.6;
    const allDark = pitchContribution < 0.3 && resonanceContribution < 0.3 && vocalWeightContribution < 0.4;

    if (allBright) {
        return `Strong ${terms.bright} cues from pitch, resonance, and vocal weight.`;
    } else if (allDark) {
        return `Strong ${terms.dark} cues from pitch, resonance, and vocal weight.`;
    }

    // Check for conflicts between factors
    const conflicts = [];
    if (Math.abs(pitchContribution - resonanceContribution) > 0.4) {
        const pTerm = pitchContribution > 0.5 ? terms.bright : terms.dark;
        const rTerm = resonanceContribution > 0.5 ? terms.bright : terms.dark;
        conflicts.push(`Pitch suggests ${pTerm}, but resonance suggests ${rTerm}`);
    }
    if (Math.abs(pitchContribution - vocalWeightContribution) > 0.4) {
        const pTerm = pitchContribution > 0.5 ? terms.bright : terms.dark;
        const wTerm = vocalWeightContribution > 0.5 ? terms.light : terms.heavy;
        conflicts.push(`Pitch is ${pTerm}, but vocal weight is ${wTerm}`);
    }

    if (conflicts.length > 0) {
        return conflicts[0] + '.';
    }

    return `Perception: ${label}`;
}

export default {
    predictGenderPerception,
    getPerceptionLabel,
    getPerceptionColor,
    getPerceptionExplanation,
    AMBIGUITY_ZONE,
    PITCH_CROSSOVER,
    F1_CROSSOVER
};
