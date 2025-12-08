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
 * @param {number} f1 - First formant frequency in Hz
 * @param {number} rbi - Resonance Brightness Index (0-100), optional
 * @returns {Object} Prediction result
 */
export function predictGenderPerception(pitch, f1, rbi = null) {
    // Handle invalid inputs
    if (!pitch || pitch < 50 || pitch > 500) {
        return {
            score: 0.5,
            confidence: 0,
            isAmbiguous: true,
            pitchContribution: 0,
            resonanceContribution: 0,
            inAmbiguityZone: false
        };
    }

    // Calculate pitch contribution (0 = Dark/Low, 1 = Bright/High)
    const pitchNormalized = sigmoid((pitch - PITCH_CROSSOVER) / PITCH_SCALE);

    // Calculate resonance contribution from F1 (if available)
    let resonanceNormalized = 0.5;
    if (f1 && f1 > 200 && f1 < 1200) {
        resonanceNormalized = sigmoid((f1 - F1_CROSSOVER) / F1_SCALE);
    } else if (rbi !== null && rbi >= 0 && rbi <= 100) {
        // Fallback to RBI if F1 is not available
        resonanceNormalized = rbi / 100;
    }

    // Check if in ambiguity zone
    const inAmbiguityZone = pitch >= AMBIGUITY_ZONE.min && pitch <= AMBIGUITY_ZONE.max;

    // Weight calculation
    let pitchWeight, resonanceWeight;
    if (inAmbiguityZone) {
        pitchWeight = 0.3;
        resonanceWeight = 0.7;
    } else if (pitch < AMBIGUITY_ZONE.min) {
        pitchWeight = 0.6;
        resonanceWeight = 0.4;
    } else {
        pitchWeight = 0.55;
        resonanceWeight = 0.45;
    }

    // Combined score
    let score = (pitchNormalized * pitchWeight) + (resonanceNormalized * resonanceWeight);

    // Synergy bonus
    const agreement = 1 - Math.abs(pitchNormalized - resonanceNormalized);
    if (agreement > 0.7) {
        const boost = (agreement - 0.7) * 0.15;
        if (score > 0.5) {
            score = Math.min(1, score + boost);
        } else {
            score = Math.max(0, score - boost);
        }
    }

    // Calculate confidence
    const extremity = Math.abs(score - 0.5) * 2;
    const confidence = extremity * agreement;

    return {
        score: Math.round(score * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        isAmbiguous: score >= 0.4 && score <= 0.6,
        pitchContribution: Math.round(pitchNormalized * 100) / 100,
        resonanceContribution: Math.round(resonanceNormalized * 100) / 100,
        inAmbiguityZone,
        weights: { pitch: pitchWeight, resonance: resonanceWeight }
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
    const { inAmbiguityZone, pitchContribution, resonanceContribution, score } = prediction;
    const label = getPerceptionLabel(score, mode);

    const terms = mode === 'default'
        ? { bright: 'feminine', dark: 'masculine', neutral: 'ambiguous' }
        : { bright: 'bright', dark: 'dark', neutral: 'balanced' };

    if (inAmbiguityZone) {
        if (resonanceContribution > 0.6) {
            return `Pitch is in the middle range, but your bright resonance shifts perception ${terms.bright}.`;
        } else if (resonanceContribution < 0.4) {
            return `Pitch is in the middle range, but your dark resonance shifts perception ${terms.dark}.`;
        } else {
            return `Both pitch and resonance are in the ${terms.neutral} zone.`;
        }
    }

    if (pitchContribution > 0.7 && resonanceContribution > 0.7) {
        return `Strong ${terms.bright} cues from both pitch and resonance.`;
    } else if (pitchContribution < 0.3 && resonanceContribution < 0.3) {
        return `Strong ${terms.dark} cues from both pitch and resonance.`;
    } else if (Math.abs(pitchContribution - resonanceContribution) > 0.4) {
        const pTerm = pitchContribution > 0.5 ? terms.bright : terms.dark;
        const rTerm = resonanceContribution > 0.5 ? terms.bright : terms.dark;
        return `Pitch suggests ${pTerm}, but resonance suggests ${rTerm}.`;
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
