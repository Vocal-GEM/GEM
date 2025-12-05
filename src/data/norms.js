/**
 * Standardized Norms for Gender Affirming Voice Therapy (GAVT)
 * 
 * Ranges based on standard speech pathology literature for:
 * - Cisgender Male (Masculine)
 * - Cisgender Female (Feminine)
 * - Gender Neutral / Androgynous
 */

export const VOICE_NORMS = {
    feminine: {
        label: "Feminine",
        pitch: {
            min: 165,
            max: 255,
            avg: 210,
            description: "Typical feminine speaking range (165-255 Hz)"
        },
        resonance: {
            f1_target: 800, // Approx /a/ vowel higher target
            description: "Brighter, forward resonance (shorter vocal tract)"
        },
        intensity: {
            min: 60,
            max: 75,
            description: "Soft to moderate intensity"
        }
    },
    masculine: {
        label: "Masculine",
        pitch: {
            min: 85,
            max: 180,
            avg: 120,
            description: "Typical masculine speaking range (85-180 Hz)"
        },
        resonance: {
            f1_target: 600, // Approx /a/ vowel lower target
            description: "Darker, chest resonance (longer vocal tract)"
        },
        intensity: {
            min: 65,
            max: 80,
            description: "Moderate to loud intensity"
        }
    },
    androgynous: {
        label: "Androgynous",
        pitch: {
            min: 150,
            max: 185,
            avg: 165,
            description: "Gender neutral overlap range (150-185 Hz)"
        },
        resonance: {
            f1_target: 700,
            description: "Balanced resonance"
        },
        intensity: {
            min: 60,
            max: 78,
            description: "Flexible intensity"
        }
    }
};

export const getNormsForGoal = (goalId) => {
    if (goalId.includes('transfem') || goalId.includes('bright')) return VOICE_NORMS.feminine;
    if (goalId.includes('transmasc') || goalId.includes('dark')) return VOICE_NORMS.masculine;
    return VOICE_NORMS.androgynous;
};
