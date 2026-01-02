/**
 * LearningStyleDetector.js
 * 
 * Analyzes user interaction patterns to detect preferred learning styles:
 * - Visual: Prefers graphs, spectrograms, text instructions
 * - Auditory: Prefers listening to examples, audio cues
 * - Kinesthetic: Prefers hands-on practice, haptic feedback
 */

const INTERACTION_WEIGHTS = {
    // Visual interactions
    'view_spectrogram': { style: 'visual', weight: 1 },
    'expand_graph': { style: 'visual', weight: 2 },
    'read_instruction': { style: 'visual', weight: 1 },
    'watch_video': { style: 'visual', weight: 3 },

    // Auditory interactions
    'play_example': { style: 'auditory', weight: 2 },
    'replay_recording': { style: 'auditory', weight: 2 },
    'enable_audio_cues': { style: 'auditory', weight: 3 },
    'listen_mode': { style: 'auditory', weight: 3 },

    // Kinesthetic interactions
    'haptic_enabled': { style: 'kinesthetic', weight: 3 },
    'practice_mode': { style: 'kinesthetic', weight: 2 },
    'repeat_exercise': { style: 'kinesthetic', weight: 1 },
    'gesture_control': { style: 'kinesthetic', weight: 2 }
};

/**
 * Updates learning style profile based on a new interaction
 * @param {Object} currentProfile - Current learning style profile
 * @param {String} interactionType - Type of interaction
 * @returns {Object} Updated profile
 */
export const trackInteraction = (currentProfile, interactionType) => {
    const definition = INTERACTION_WEIGHTS[interactionType];
    if (!definition) return currentProfile;

    // Initialize if empty
    const scores = currentProfile.scores || { visual: 0, auditory: 0, kinesthetic: 0 };
    const totalInteractions = (currentProfile.totalInteractions || 0) + 1;
    const history = currentProfile.history || [];

    // Update score
    scores[definition.style] += definition.weight;

    // Keep history limited
    history.push({ type: interactionType, timestamp: Date.now() });
    if (history.length > 50) history.shift();

    // Determine dominant style
    const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

    // Calculate confidence (dominance over total)
    const totalScore = scores.visual + scores.auditory + scores.kinesthetic;
    const confidence = totalScore > 0 ? scores[dominant] / totalScore : 0;

    return {
        scores,
        dominantStyle: dominant,
        confidence, // 0.0 to 1.0
        totalInteractions,
        history
    };
};

/**
 * Get UI adaptation recommendations based on style
 * @param {String} style - detected learning style
 * @returns {Object} UI preferences
 */
export const getPreferencesForStyle = (style) => {
    switch (style) {
        case 'visual':
            return {
                showSpectrogram: true,
                showGraphs: true,
                audioCues: false,
                text detailed: true
            };
        case 'auditory':
            return {
                showSpectrogram: false,
                playStartTones: true,
                audioFeedback: true,
                bgMusic: true
            };
        case 'kinesthetic':
            return {
                hapticFeedback: true,
                interactiveWidgets: true,
                shortInstructions: true,
                quickStart: true
            };
        default:
            return {};
    }
};

export default {
    trackInteraction,
    getPreferencesForStyle
};
