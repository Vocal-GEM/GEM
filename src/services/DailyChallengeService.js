/**
 * DailyChallengeService - Generates and tracks daily practice challenges
 */

const STORAGE_KEY = 'gem_daily_challenges';
const XP_KEY = 'gem_user_xp';

// Challenge templates
const CHALLENGE_TYPES = [
    {
        id: 'pitch-hold',
        title: 'Pitch Steady',
        description: 'Hold a comfortable pitch for 10 seconds',
        xp: 25,
        category: 'pitch'
    },
    {
        id: 'resonance-focus',
        title: 'Forward Focus',
        description: 'Complete 3 resonance exercises',
        xp: 30,
        category: 'resonance'
    },
    {
        id: 'breathing-session',
        title: 'Breath Master',
        description: 'Complete a breathing warm-up routine',
        xp: 20,
        category: 'breathing'
    },
    {
        id: 'practice-streak',
        title: 'Consistency King',
        description: 'Practice for at least 10 minutes today',
        xp: 35,
        category: 'general'
    },
    {
        id: 'journal-entry',
        title: 'Voice Journaler',
        description: 'Record a voice journal entry',
        xp: 25,
        category: 'journal'
    },
    {
        id: 'monologue-read',
        title: 'Performance Ready',
        description: 'Read a monologue from Performance Plaza',
        xp: 30,
        category: 'performance'
    },
    {
        id: 'sovte-session',
        title: 'SOVTE Explorer',
        description: 'Complete 2 SOVTE exercises',
        xp: 25,
        category: 'sovte'
    },
    {
        id: 'relaxation-break',
        title: 'Tension Release',
        description: 'Complete a relaxation exercise',
        xp: 20,
        category: 'relaxation'
    },
    {
        id: 'tonal-practice',
        title: 'Tone Sculptor',
        description: 'Practice a Tone Temple exercise',
        xp: 30,
        category: 'tonal'
    },
    {
        id: 'variety-day',
        title: 'All-Rounder',
        description: 'Practice exercises from 3 different categories',
        xp: 50,
        category: 'variety'
    }
];

/**
 * Get stored challenge data
 */
const getChallengeData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('DailyChallengeService: Failed to load', e);
    }
    return { date: null, challenges: [], completedToday: [] };
};

/**
 * Save challenge data
 */
const saveChallengeData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('DailyChallengeService: Failed to save', e);
    }
};

/**
 * Get today's date string (YYYY-MM-DD)
 */
const getTodayString = () => new Date().toISOString().split('T')[0];

/**
 * Generate daily challenges (3 per day)
 */
const generateChallenges = () => {
    const shuffled = [...CHALLENGE_TYPES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(c => ({
        ...c,
        generatedAt: new Date().toISOString()
    }));
};

/**
 * Get today's challenges (generates new if needed)
 */
export const getTodayChallenges = () => {
    const data = getChallengeData();
    const today = getTodayString();

    if (data.date !== today) {
        // New day - generate new challenges
        const newChallenges = generateChallenges();
        const newData = {
            date: today,
            challenges: newChallenges,
            completedToday: []
        };
        saveChallengeData(newData);
        return { challenges: newChallenges, completed: [] };
    }

    return { challenges: data.challenges, completed: data.completedToday };
};

/**
 * Complete a challenge
 */
export const completeChallenge = (challengeId) => {
    const data = getChallengeData();
    const today = getTodayString();

    if (data.date !== today) {
        return { success: false, message: 'Challenge expired' };
    }

    if (data.completedToday.includes(challengeId)) {
        return { success: false, message: 'Already completed' };
    }

    const challenge = data.challenges.find(c => c.id === challengeId);
    if (!challenge) {
        return { success: false, message: 'Challenge not found' };
    }

    data.completedToday.push(challengeId);
    saveChallengeData(data);

    // Award XP
    addXP(challenge.xp, `Daily Challenge: ${challenge.title}`);

    return {
        success: true,
        xpEarned: challenge.xp,
        allCompleted: data.completedToday.length === data.challenges.length
    };
};

/**
 * Check if all today's challenges are complete
 */
export const areAllChallengesComplete = () => {
    const { challenges, completed } = getTodayChallenges();
    return completed.length === challenges.length && challenges.length > 0;
};

// ===== XP System =====

/**
 * Get user's XP data
 */
export const getXPData = () => {
    try {
        const stored = localStorage.getItem(XP_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('XP: Failed to load', e);
    }
    return { totalXP: 0, level: 1, history: [] };
};

/**
 * Save XP data
 */
const saveXPData = (data) => {
    try {
        localStorage.setItem(XP_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('XP: Failed to save', e);
    }
};

/**
 * Add XP and check for level up
 */
export const addXP = (amount, reason = 'Practice') => {
    const data = getXPData();
    data.totalXP += amount;

    // Add to history (keep last 50)
    data.history.unshift({
        amount,
        reason,
        timestamp: new Date().toISOString()
    });
    if (data.history.length > 50) {
        data.history = data.history.slice(0, 50);
    }

    // Calculate level (100 XP per level, with scaling)
    const oldLevel = data.level;
    data.level = Math.floor(Math.sqrt(data.totalXP / 50)) + 1;

    saveXPData(data);

    return {
        newTotal: data.totalXP,
        level: data.level,
        leveledUp: data.level > oldLevel
    };
};

/**
 * Get XP needed for next level
 */
export const getXPForNextLevel = () => {
    const data = getXPData();
    const currentLevel = data.level;
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 50;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 50;

    return {
        current: data.totalXP - xpForCurrentLevel,
        needed: xpForNextLevel - xpForCurrentLevel,
        level: currentLevel,
        totalXP: data.totalXP
    };
};

export default {
    getTodayChallenges,
    completeChallenge,
    areAllChallengesComplete,
    getXPData,
    addXP,
    getXPForNextLevel,
    CHALLENGE_TYPES
};
