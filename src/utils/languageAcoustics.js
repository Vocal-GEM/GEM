/**
 * Language Acoustics Configuration
 * Defines acoustic norms and phonetic characteristics for different languages
 * to adapt voice analysis algorithm expectations.
 */

export const LANGUAGE_CONFIGS = {
    en: {
        name: 'English',
        isTonal: false,
        stressTimed: true,
        pitchRange: {
            feminine: { min: 165, max: 255, mean: 210 },
            masculine: { min: 85, max: 155, mean: 120 },
            androgynous: { min: 145, max: 185, mean: 165 }
        },
        formants: {
            // General formant scaling factors relative to standard tube model
            scaleFactor: 1.0,
            vowelSpace: 'central' // English vowels are relatively centralized
        },
        phonemes: {
            // Key phonemes for analysis
            openVowel: 'Ah', // /a/
            frontVowel: 'Ee', // /i/
            backVowel: 'Oo'   // /u/
        }
    },

    zh: {
        name: 'Mandarin Chinese',
        isTonal: true,
        tonalSystem: {
            tones: 4,
            // Pitch contours for tones (normalized 1-5 scale)
            contours: {
                1: [5, 5], // High level
                2: [3, 5], // Rising
                3: [2, 1, 4], // Dipping
                4: [5, 1]  // Falling
            }
        },
        stressTimed: false, // Syllable-timed
        pitchRange: {
            // Mandarin speakers often use wider pitch range for tones
            feminine: { min: 160, max: 280, mean: 220 },
            masculine: { min: 80, max: 180, mean: 130 },
            androgynous: { min: 140, max: 200, mean: 170 }
        },
        formants: {
            scaleFactor: 0.95, // Slightly higher formants on average (smaller vocal tract stats)
            vowelSpace: 'peripheral'
        },
        phonemes: {
            openVowel: 'A',
            frontVowel: 'Yi',
            backVowel: 'Wu'
        }
    },

    es: {
        name: 'Spanish',
        isTonal: false,
        stressTimed: false, // Syllable-timed
        pitchRange: {
            feminine: { min: 170, max: 250, mean: 210 },
            masculine: { min: 90, max: 160, mean: 125 },
            androgynous: { min: 150, max: 190, mean: 170 }
        },
        formants: {
            scaleFactor: 1.0,
            vowelSpace: 'peripheral' // 5 vowel system, distinct
        },
        phonemes: {
            openVowel: 'A',
            frontVowel: 'I',
            backVowel: 'U'
        }
    },

    ja: {
        name: 'Japanese',
        isTonal: false,
        pitchAccent: true, // Pitch accent system
        stressTimed: false, // Mora-timed
        pitchRange: {
            // Japanese female speakers often use higher pitch in polite speech
            feminine: { min: 190, max: 290, mean: 240 },
            masculine: { min: 90, max: 160, mean: 125 },
            androgynous: { min: 160, max: 200, mean: 180 }
        },
        formants: {
            scaleFactor: 0.95,
            vowelSpace: 'central'
        },
        phonemes: {
            openVowel: 'A',
            frontVowel: 'I',
            backVowel: 'U'
        }
    },

    fr: {
        name: 'French',
        isTonal: false,
        stressTimed: false, // Syllable-timed
        pitchRange: {
            feminine: { min: 170, max: 250, mean: 210 },
            masculine: { min: 90, max: 160, mean: 125 },
            androgynous: { min: 150, max: 190, mean: 170 }
        },
        formants: {
            scaleFactor: 1.0,
            vowelSpace: 'peripheral'
        },
        phonemes: {
            openVowel: 'A',
            frontVowel: 'I',
            backVowel: 'Ou'
        }
    }
};

/**
 * Get acoustic configuration for a specific language
 * @param {string} languageCode - ISO code (e.g., 'en', 'zh')
 * @returns {Object} Configuration object
 */
export const getLanguageConfig = (languageCode = 'en') => {
    // Handle full locale codes like 'en-US'
    const primaryCode = languageCode.split('-')[0].toLowerCase();
    return LANGUAGE_CONFIGS[primaryCode] || LANGUAGE_CONFIGS['en'];
};

/**
 * Adjust simplified target based on language norms
 * @param {number} targetPitch - Base target pitch
 * @param {string} languageCode - ISO code
 * @returns {number} Adjusted target
 */
export const adjustTargetForLanguage = (targetPitch, languageCode) => {
    const config = getLanguageConfig(languageCode);

    if (config.name === 'Japanese' && targetPitch > 180) {
        // polite speech adjustment
        return targetPitch * 1.05;
    }

    return targetPitch;
};

export default LANGUAGE_CONFIGS;
