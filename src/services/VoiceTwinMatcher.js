/**
 * VoiceTwinMatcher.js
 * 
 * Finds "Voice Twins" - other users with similar starting points and goals.
 * Used for inspiration and community building.
 * 
 * Note: Real implementation would require backend similarity search.
 * This mocks the logic for the frontend.
 */

// Mock database of "public" profiles
const MOCK_COMMUNITY_PROFILES = [
    {
        id: 'user_123',
        nickname: 'Sarah_Sings',
        baseline: { pitch: 135, resonance: 0.4 },
        current: { pitch: 195, resonance: 0.75 },
        goal: { pitch: 210, resonance: 0.8 },
        monthsPracticing: 8,
        avatar: '👩‍🎤'
    },
    {
        id: 'user_456',
        nickname: 'VoiceVoyager',
        baseline: { pitch: 150, resonance: 0.5 },
        current: { pitch: 175, resonance: 0.6 },
        goal: { pitch: 180, resonance: 0.65 },
        monthsPracticing: 3,
        avatar: '🧗'
    },
    {
        id: 'user_789',
        nickname: 'Echo_Location',
        baseline: { pitch: 110, resonance: 0.3 },
        current: { pitch: 125, resonance: 0.35 },
        goal: { pitch: 160, resonance: 0.6 },
        monthsPracticing: 1,
        avatar: '🦇'
    },
    {
        id: 'user_101',
        nickname: 'Resonance_Rex',
        baseline: { pitch: 140, resonance: 0.45 },
        current: { pitch: 165, resonance: 0.55 },
        goal: { pitch: 175, resonance: 0.7 },
        monthsPracticing: 5,
        avatar: '🦖'
    }
];

/**
 * Find similar profiles (Voice Twins)
 * @param {Object} userProfile - Current user's profile
 * @returns {Array} List of matches with similarity scores
 */
export const findMatches = (userProfile) => {
    const { baseline, goals } = userProfile;
    const startPitch = baseline?.pitchRange?.habitual || 140;

    // Return mock matches sorted by similarity
    return MOCK_COMMUNITY_PROFILES
        .map(bgUser => ({
            ...bgUser,
            matchScore: calculateSimilarity(startPitch, goals, bgUser)
        }))
        .filter(m => m.matchScore > 0.6) // Only good matches
        .sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Calculate similarity score (0.0 - 1.0)
 */
const calculateSimilarity = (userStartPitch, userGoals, stranger) => {
    let score = 0;

    // 1. Starting Point Similarity (40%)
    const pitchDiff = Math.abs(userStartPitch - stranger.baseline.pitch);
    if (pitchDiff < 5) score += 0.4;
    else if (pitchDiff < 15) score += 0.3;
    else if (pitchDiff < 30) score += 0.1;

    // 2. Goal Similarity (30%)
    // Simple check: are they basically aiming for same range?
    const strangerGoalMid = stranger.goal.pitch;
    const userGoalMid = (userGoals.targetPitchRange.min + userGoals.targetPitchRange.max) / 2;

    if (Math.abs(strangerGoalMid - userGoalMid) < 20) score += 0.3;
    else if (Math.abs(strangerGoalMid - userGoalMid) < 40) score += 0.15;

    // 3. Experience bonus (optional)
    // We might value people slightly ahead of us

    return score;
};

export default {
    findMatches
};
