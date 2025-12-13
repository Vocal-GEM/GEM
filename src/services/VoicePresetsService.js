/**
 * VoicePresetsService - Common voice targets and presets
 */

// Research-based voice characteristic ranges
export const VOICE_PRESETS = [
    {
        id: 'feminine-conversational',
        name: 'Feminine Conversational',
        description: 'Typical feminine speaking voice range',
        characteristics: {
            pitchRange: { min: 180, max: 250 },
            f2Target: 1800,
            resonance: 'forward',
            intonationPattern: 'varied'
        },
        tips: [
            'Focus on forward resonance',
            'Use rising intonation at phrase ends',
            'Lighter vocal weight'
        ]
    },
    {
        id: 'feminine-bright',
        name: 'Feminine Bright',
        description: 'Higher, brighter feminine voice',
        characteristics: {
            pitchRange: { min: 220, max: 280 },
            f2Target: 2000,
            resonance: 'very-forward',
            intonationPattern: 'expressive'
        },
        tips: [
            'Think "smiling" while speaking',
            'More space in mouth',
            'Light breathiness can help'
        ]
    },
    {
        id: 'androgynous',
        name: 'Androgynous',
        description: 'Gender-neutral vocal range',
        characteristics: {
            pitchRange: { min: 150, max: 200 },
            f2Target: 1600,
            resonance: 'neutral',
            intonationPattern: 'moderate'
        },
        tips: [
            'Balance between chest and head resonance',
            'Moderate pitch variation',
            'Neutral vowel positioning'
        ]
    },
    {
        id: 'masculine-soft',
        name: 'Masculine Soft',
        description: 'Softer masculine voice',
        characteristics: {
            pitchRange: { min: 100, max: 150 },
            f2Target: 1400,
            resonance: 'back',
            intonationPattern: 'steady'
        },
        tips: [
            'Lower larynx position',
            'Back resonance focus',
            'Heavier vocal weight'
        ]
    }
];

/**
 * Get preset by ID
 */
export const getPreset = (id) => {
    return VOICE_PRESETS.find(p => p.id === id);
};

/**
 * Get user's selected preset
 */
export const getUserPreset = () => {
    const stored = localStorage.getItem('gem_voice_preset');
    if (stored) {
        return getPreset(stored) || VOICE_PRESETS[0];
    }
    return null;
};

/**
 * Set user's selected preset
 */
export const setUserPreset = (presetId) => {
    localStorage.setItem('gem_voice_preset', presetId);
    return getPreset(presetId);
};

/**
 * Check if voice matches preset targets
 */
export const checkVoiceAgainstPreset = (voiceData, preset) => {
    if (!voiceData || !preset) return null;

    const { pitch, f2 } = voiceData;
    const { characteristics } = preset;

    const pitchInRange = pitch >= characteristics.pitchRange.min &&
        pitch <= characteristics.pitchRange.max;

    const f2Accuracy = f2 ?
        100 - Math.min(100, Math.abs(f2 - characteristics.f2Target) / 10) :
        null;

    return {
        pitchInRange,
        pitchDelta: pitch - ((characteristics.pitchRange.min + characteristics.pitchRange.max) / 2),
        f2Accuracy,
        overallMatch: pitchInRange ? (f2Accuracy ? (50 + f2Accuracy / 2) : 50) : 0
    };
};

export default {
    VOICE_PRESETS,
    getPreset,
    getUserPreset,
    setUserPreset,
    checkVoiceAgainstPreset
};
