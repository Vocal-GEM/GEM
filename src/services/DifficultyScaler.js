/**
 * DifficultyScaler.js
 * 
 * Adaptive system to scale exercise difficulty based on user performance.
 * Ensures users are always in the "flow channel" - not too easy, not too hard.
 */

// Difficulty levels and their modifiers
const DIFFICULTY_LEVELS = {
    1: { name: 'Beginner', validationWindow: 1000, tolerance: 0.20, complexity: 1 },
    2: { name: 'Easy', validationWindow: 800, tolerance: 0.15, complexity: 1 },
    3: { name: 'Normal', validationWindow: 600, tolerance: 0.10, complexity: 2 },
    4: { name: 'Hard', validationWindow: 400, tolerance: 0.08, complexity: 2 },
    5: { name: 'Expert', validationWindow: 200, tolerance: 0.05, complexity: 3 }
};

/**
 * Calculates the appropriate difficulty for a specific exercise
 * @param {Object} userProfile - User's voice profile
 * @param {String} exerciseId - ID of the exercise
 * @returns {Object} Difficulty configuration
 */
export const getExerciseDifficulty = (userProfile, exerciseId) => {
    // Check if we have specific history for this exercise
    const exerciseHistory = userProfile.exerciseHistory?.[exerciseId];

    let levelIndex = 1; // Default to Beginner

    if (exerciseHistory) {
        // Calculate level based on past performance
        levelIndex = exerciseHistory.currentLevel || 1;

        // Check if ready for promotion/demotion based on recent trend
        const recentScores = exerciseHistory.recentScores || [];
        if (recentScores.length >= 5) {
            const avgScore = recentScores.slice(-5).reduce((a, b) => a + b, 0) / 5;

            if (avgScore > 0.9 && levelIndex < 5) {
                levelIndex++; // Promote
            } else if (avgScore < 0.6 && levelIndex > 1) {
                levelIndex--; // Demote
            }
        }
    } else {
        // Fallback to overall skill level
        const overallLevel = userProfile.skillAssessment?.overallLevel || 'beginner';
        if (overallLevel === 'intermediate') levelIndex = 2;
        if (overallLevel === 'advanced') levelIndex = 3;
    }

    return {
        level: levelIndex,
        ...DIFFICULTY_LEVELS[levelIndex]
    };
};

/**
 * Update user history with new result and return scaling decision
 * @param {Object} history - Current exercise history
 * @param {Number} score - Performance score (0.0 - 1.0)
 * @returns {Object} Updated history and feedback
 */
export const updateDifficulty = (history, score) => {
    const newHistory = { ...history };
    const currentLevel = newHistory.currentLevel || 1;
    const recentScores = [...(newHistory.recentScores || []), score];

    // Keep last 10 scores
    if (recentScores.length > 10) recentScores.shift();
    newHistory.recentScores = recentScores;

    let feedback = null;
    let nextLevel = currentLevel;

    // Check for immediate scaling needs
    const last3 = recentScores.slice(-3);
    const avgLast3 = last3.length === 3 ? last3.reduce((a, b) => a + b, 0) / 3 : score;

    if (avgLast3 > 0.95 && currentLevel < 5) {
        nextLevel++;
        feedback = 'Excellent work! Increasing difficulty for next time.';
        // Reset recent scores for new level to establish new baseline
        newHistory.recentScores = [];
    } else if (avgLast3 < 0.5 && currentLevel > 1) {
        nextLevel--;
        feedback = 'Let\'s slow it down a bit to focus on accuracy.';
        newHistory.recentScores = [];
    }

    newHistory.currentLevel = nextLevel;
    newHistory.lastPlayed = Date.now();

    return {
        updatedHistory: newHistory,
        feedback
    };
};

export default {
    getExerciseDifficulty,
    updateDifficulty,
    DIFFICULTY_LEVELS
};
