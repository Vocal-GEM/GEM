/**
 * VoiceNorms.js
 * Standardized acoustic norms for voice analysis based on gender targets.
 * Derived from literature (e.g., lingWAVES, voice science research).
 */

export const VoiceNorms = {
    FEMININE: {
        pitch: { min: 170, max: 250, target: 220, label: 'Feminine Range' },
        f1: { min: 450, target: 500, label: '> 450 Hz' },
        f2: { min: 1800, target: 2000, label: '> 1800 Hz' },
        jitter: { max: 1.0, label: '< 1.0 %' },
        shimmer: { max: 3.8, label: '< 3.8 %' },
        hnr: { min: 20, label: '> 20 dB' },
        cpps: { min: 14, label: '> 14 dB' }, // Sustained vowel
        sibilance: { minScore: 0.4, label: 'High freq energy' }
    },
    MASCULINE: {
        pitch: { min: 85, max: 155, target: 110, label: 'Masculine Range' },
        f1: { max: 400, target: 350, label: '< 400 Hz' },
        f2: { max: 1500, target: 1200, label: '< 1500 Hz' },
        jitter: { max: 1.0, label: '< 1.0 %' },
        shimmer: { max: 3.8, label: '< 3.8 %' },
        hnr: { min: 20, label: '> 20 dB' },
        cpps: { min: 14, label: '> 14 dB' },
        sibilance: { maxScore: 0.3, label: 'Balanced energy' }
    },
    ANDROGYNOUS: {
        pitch: { min: 155, max: 175, target: 165, label: 'Androgynous Range' },
        f1: { min: 400, max: 450, target: 425, label: '400-450 Hz' },
        f2: { min: 1500, max: 1800, target: 1650, label: '1500-1800 Hz' },
        jitter: { max: 1.0, label: '< 1.0 %' },
        shimmer: { max: 3.8, label: '< 3.8 %' },
        hnr: { min: 20, label: '> 20 dB' },
        cpps: { min: 14, label: '> 14 dB' },
        sibilance: { minScore: 0.3, maxScore: 0.4, label: 'Mid-range energy' }
    }
};

export const getTargetNorms = (genderMode) => {
    switch (genderMode?.toLowerCase()) {
        case 'masculine':
        case 'male':
            return VoiceNorms.MASCULINE;
        case 'androgynous':
        case 'neutral':
            return VoiceNorms.ANDROGYNOUS;
        case 'feminine':
        case 'female':
        default:
            return VoiceNorms.FEMININE;
    }
};
