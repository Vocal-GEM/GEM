// Achievement definitions used in AchievementShowcase
export const ACHIEVEMENTS = [
    { id: 'first-session', title: 'First Steps', description: 'Complete your first practice session', icon: '🎤', xp: 50 },
    { id: 'streak-3', title: 'On a Roll', description: 'Maintain a 3-day streak', icon: '🔥', xp: 100 },
    { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', xp: 200 },
    { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏆', xp: 500 },
    { id: 'sessions-10', title: 'Dedicated', description: 'Complete 10 practice sessions', icon: '⭐', xp: 150 },
    { id: 'sessions-50', title: 'Committed', description: 'Complete 50 practice sessions', icon: '💎', xp: 300 },
    { id: 'level-5', title: 'Rising Star', description: 'Reach level 5', icon: '🌟', xp: 200 },
    { id: 'level-10', title: 'Voice Pro', description: 'Reach level 10', icon: '👑', xp: 400 },
    { id: 'journal-5', title: 'Documenter', description: 'Record 5 voice journal entries', icon: '📝', xp: 100 },
    { id: 'explore-all', title: 'Explorer', description: 'Try all exercise categories', icon: '🧭', xp: 150 }
];

/**
 * Get user's unlocked achievements from local storage
 */
export const getUnlockedAchievements = () => {
    try {
        const stored = localStorage.getItem('gem_achievements');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};
