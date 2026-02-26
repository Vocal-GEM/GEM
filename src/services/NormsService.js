/**
 * NormsService
 * Provides standardized vocal norms for different gender identities.
 * Ranges are based on general speech pathology targets.
 */

export const GENDER_IDENTITIES = {
    MASCULINE: 'masculine',
    FEMININE: 'feminine',
    ANDROGYNOUS: 'androgynous'
};

export const NORMS = {
    [GENDER_IDENTITIES.MASCULINE]: {
        pitch: { min: 85, max: 180, label: 'Masculine Range (85-180Hz)' },
        resonance: { min: 80, max: 120, label: 'Darker Resonance' } // Arbitrary scale for now
    },
    [GENDER_IDENTITIES.FEMININE]: {
        pitch: { min: 165, max: 255, label: 'Feminine Range (165-255Hz)' },
        resonance: { min: 140, max: 180, label: 'Brighter Resonance' }
    },
    [GENDER_IDENTITIES.ANDROGYNOUS]: {
        pitch: { min: 135, max: 185, label: 'Androgynous Range (135-185Hz)' },
        resonance: { min: 110, max: 150, label: 'Neutral Resonance' }
    }
};

export class NormsService {
    /**
     * Returns the target ranges for a given gender identity.
     * @param {string} genderId - 'masculine', 'feminine', or 'androgynous'
     * @returns {object|null} The norms object or null if invalid
     */
    static getNorms(genderId) {
        return NORMS[genderId] || null;
    }

    /**
     * Checks if a value is within the target range.
     * @param {number} value - The value to check (e.g., pitch in Hz)
     * @param {string} genderId - The target gender identity
     * @param {string} metric - 'pitch' or 'resonance'
     * @returns {boolean} True if within range
     */
    static isInRange(value, genderId, metric = 'pitch') {
        const norms = this.getNorms(genderId);
        if (!norms || !norms[metric]) return false;

        const { min, max } = norms[metric];
        return value >= min && value <= max;
    }

    /**
     * Returns a status string based on where the value falls relative to the range.
     * @param {number} value 
     * @param {string} genderId 
     * @param {string} metric 
     * @returns {string} 'low', 'high', 'target', or 'unknown'
     */
    static getRangeStatus(value, genderId, metric = 'pitch') {
        const norms = this.getNorms(genderId);
        if (!norms || !norms[metric]) return 'unknown';

        const { min, max } = norms[metric];
        if (value < min) return 'low';
        if (value > max) return 'high';
        return 'target';
    }
}
