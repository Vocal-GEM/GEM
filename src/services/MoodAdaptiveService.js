/**
 * MoodAdaptiveService.js
 * 
 * Adapts the application experience based on user's self-reported mood
 * and energy levels. Adjusts difficulty, feedback tone, and suggestions.
 */

const MOOD_CONFIGS = {
    'energetic': {
        difficultyMod: 1.1, // Slightly harder
        feedbackTone: 'challenging', // Push the user
        suggestedDuration: 20, // minutes
        uiTheme: 'vibrant'
    },
    'focused': {
        difficultyMod: 1.0,
        feedbackTone: 'technical', // Precise feedback
        suggestedDuration: 15,
        uiTheme: 'clean'
    },
    'relaxed': {
        difficultyMod: 0.9,
        feedbackTone: 'supportive',
        suggestedDuration: 10,
        uiTheme: 'calm'
    },
    'tired': {
        difficultyMod: 0.7, // Easier
        feedbackTone: 'gentle', // Very supportive
        suggestedDuration: 5,
        uiTheme: 'soothing'
    },
    'frustrated': {
        difficultyMod: 0.6, // Much easier to build confidence
        feedbackTone: 'encouraging', // Focus on wins
        suggestedDuration: 5,
        uiTheme: 'warm'
    }
};

/**
 * Get adaptation settings based on mood/energy
 * @param {String} mood - Current mood
 * @param {Number} energy - Energy level 1-10
 * @returns {Object} Adaptation settings
 */
export const getAdaptation = (mood, energy) => {
    const baseConfig = MOOD_CONFIGS[mood] || MOOD_CONFIGS['focused'];

    // Adjust based on specific energy level (1-10)
    const energyFactor = energy / 5; // 0.2 to 2.0

    return {
        ...baseConfig,
        difficultyMultiplier: baseConfig.difficultyMod * (0.8 + (energyFactor * 0.2)),
        sessionGoal: getGoalSuggestion(mood, energy),
        greeting: getGreeting(mood)
    };
};

const getGoalSuggestion = (mood, energy) => {
    if (energy < 4 || mood === 'tired') return 'Maintenance & Relaxation';
    if (mood === 'frustrated') return 'Fun & Confidence Building';
    if (energy > 7 && mood === 'energetic') return 'Breakthrough & Range Expansion';
    return 'Technique & Consistency';
};

const getGreeting = (mood) => {
    const greetings = {
        energetic: "Great energy! Let's make some progress today!",
        focused: "Ready to fine-tune your voice?",
        relaxed: "Let's have a nice, easy practice session.",
        tired: "We'll keep it light and easy today. Just a quick check-in.",
        frustrated: "It's okay to have off days. Let's just play and reset."
    };
    return greetings[mood] || "Welcome back!";
};

export default {
    getAdaptation,
    MOOD_CONFIGS
};
