/**
 * AchievementsService - Unlockable badges and milestones
 */

const STORAGE_KEY = 'gem_achievements';

// Achievement definitions
export const ACHIEVEMENTS = {
    // Streak-based
    streak_3: {
        id: 'streak_3',
        title: 'Warming Up',
        description: 'Maintain a 3-day practice streak',
        icon: '🔥',
        category: 'streak'
    },
    streak_7: {
        id: 'streak_7',
        title: 'One Week Wonder',
        description: 'Maintain a 7-day practice streak',
        icon: '🌟',
        category: 'streak'
    },
    streak_30: {
        id: 'streak_30',
        title: 'Dedicated Practitioner',
        description: 'Maintain a 30-day practice streak',
        icon: '👑',
        category: 'streak'
    },
    // Module-based
    module_1_complete: {
        id: 'module_1_complete',
        title: 'Foundation Builder',
        description: 'Complete Module 1: Foundations',
        icon: '🏗️',
        category: 'progress'
    },
    module_3_complete: {
        id: 'module_3_complete',
        title: 'Resonance Master',
        description: 'Complete Module 3: Resonance',
        icon: '🔔',
        category: 'progress'
    },
    journey_complete: {
        id: 'journey_complete',
        title: 'Graduate',
        description: 'Complete the entire Green Light Protocol',
        icon: '🎓',
        category: 'progress'
    },
    // Activity-based
    first_recording: {
        id: 'first_recording',
        title: 'Voice Captured',
        description: 'Make your first voice recording',
        icon: '🎤',
        category: 'activity'
    },
    analysis_10: {
        id: 'analysis_10',
        title: 'Data Driven',
        description: 'Complete 10 voice analysis sessions',
        icon: '📊',
        category: 'activity'
    },
    gym_explorer: {
        id: 'gym_explorer',
        title: 'Gym Explorer',
        description: 'Try exercises from all Gym categories',
        icon: '💪',
        category: 'activity'
    }
};

/**
 * Get all unlocked achievement IDs
 */
export const getUnlockedAchievements = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('AchievementsService: Failed to load', e);
    }
    return [];
};

/**
 * Check if a specific achievement is unlocked
 */
export const isUnlocked = (achievementId) => {
    const unlocked = getUnlockedAchievements();
    return unlocked.includes(achievementId);
};

/**
 * Unlock an achievement
 * @returns {{ achievement: object, isNew: boolean }}
 */
export const unlock = (achievementId) => {
    if (!ACHIEVEMENTS[achievementId]) {
        console.warn('AchievementsService: Unknown achievement', achievementId);
        return { achievement: null, isNew: false };
    }

    const unlocked = getUnlockedAchievements();

    if (unlocked.includes(achievementId)) {
        return { achievement: ACHIEVEMENTS[achievementId], isNew: false };
    }

    // New unlock!
    const newUnlocked = [...unlocked, achievementId];
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnlocked));
    } catch (e) {
        console.error('AchievementsService: Failed to save', e);
    }

    return { achievement: ACHIEVEMENTS[achievementId], isNew: true };
};

/**
 * Get all achievements with unlock status
 */
export const getAllAchievements = () => {
    const unlocked = getUnlockedAchievements();
    return Object.values(ACHIEVEMENTS).map(a => ({
        ...a,
        unlocked: unlocked.includes(a.id)
    }));
};

/**
 * Check streak-based achievements
 */
export const checkStreakAchievements = (currentStreak) => {
    const newAchievements = [];

    if (currentStreak >= 3 && !isUnlocked('streak_3')) {
        const result = unlock('streak_3');
        if (result.isNew) newAchievements.push(result.achievement);
    }
    if (currentStreak >= 7 && !isUnlocked('streak_7')) {
        const result = unlock('streak_7');
        if (result.isNew) newAchievements.push(result.achievement);
    }
    if (currentStreak >= 30 && !isUnlocked('streak_30')) {
        const result = unlock('streak_30');
        if (result.isNew) newAchievements.push(result.achievement);
    }

    return newAchievements;
};

export default {
    ACHIEVEMENTS,
    getUnlockedAchievements,
    isUnlocked,
    unlock,
    getAllAchievements,
    checkStreakAchievements
};
