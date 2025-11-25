import { indexedDB, STORES } from './IndexedDBManager';

const LEVELS = [
    { level: 1, xp: 0, title: 'Novice' },
    { level: 2, xp: 100, title: 'Beginner' },
    { level: 3, xp: 300, title: 'Apprentice' },
    { level: 4, xp: 600, title: 'Practitioner' },
    { level: 5, xp: 1000, title: 'Intermediate' },
    { level: 6, xp: 1500, title: 'Skilled' },
    { level: 7, xp: 2100, title: 'Advanced' },
    { level: 8, xp: 2800, title: 'Expert' },
    { level: 9, xp: 3600, title: 'Master' },
    { level: 10, xp: 5000, title: 'Virtuoso' }
];

const ACHIEVEMENTS = [
    { id: 'first_step', title: 'First Step', description: 'Complete your first exercise', xp: 50, icon: '👣' },
    { id: 'streak_3', title: 'Consistency', description: 'Maintain a 3-day streak', xp: 100, icon: '🔥' },
    { id: 'streak_7', title: 'Dedication', description: 'Maintain a 7-day streak', xp: 300, icon: '📅' },
    { id: 'pitch_perfect', title: 'Pitch Perfect', description: 'Score 90% or higher in an exercise', xp: 150, icon: '🎯' },
    { id: 'twister_master', title: 'Tongue Tied', description: 'Complete 5 tongue twisters', xp: 200, icon: '👅' },
    { id: 'early_bird', title: 'Early Bird', description: 'Practice before 8 AM', xp: 50, icon: '🌅' },
    { id: 'night_owl', title: 'Night Owl', description: 'Practice after 10 PM', xp: 50, icon: '🦉' }
];

class GamificationService {
    constructor() {
        this.listeners = new Set();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(event) {
        this.listeners.forEach(cb => cb(event));
    }

    async getStats() {
        const stats = await indexedDB.getStats();
        return {
            xp: stats.xp || 0,
            level: this.getLevel(stats.xp || 0),
            streak: stats.streak || 0,
            lastPractice: stats.lastPractice,
            achievements: stats.achievements || []
        };
    }

    getLevel(xp) {
        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (xp >= LEVELS[i].xp) return LEVELS[i];
        }
        return LEVELS[0];
    }

    getNextLevel(xp) {
        const current = this.getLevel(xp);
        const next = LEVELS.find(l => l.level === current.level + 1);
        return next || current;
    }

    async awardXP(amount, reason) {
        const stats = await indexedDB.getStats();
        const oldXP = stats.xp || 0;
        const newXP = oldXP + amount;

        const oldLevel = this.getLevel(oldXP);
        const newLevel = this.getLevel(newXP);

        stats.xp = newXP;
        await indexedDB.saveStats(stats);

        this.notify({ type: 'XP_GAINED', amount, reason, total: newXP });

        if (newLevel.level > oldLevel.level) {
            this.notify({ type: 'LEVEL_UP', level: newLevel });
        }

        return newXP;
    }

    async updateStreak() {
        const stats = await indexedDB.getStats();
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastPractice = stats.lastPractice ? new Date(stats.lastPractice).toISOString().split('T')[0] : null;

        if (lastPractice === today) return; // Already practiced today

        let streak = stats.streak || 0;

        if (lastPractice) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastPractice === yesterdayStr) {
                streak++;
            } else {
                streak = 1; // Reset streak if missed a day
            }
        } else {
            streak = 1; // First day
        }

        stats.streak = streak;
        stats.lastPractice = now.toISOString();
        await indexedDB.saveStats(stats);

        this.notify({ type: 'STREAK_UPDATE', streak });

        // Check streak achievements
        if (streak === 3) await this.unlockAchievement('streak_3');
        if (streak === 7) await this.unlockAchievement('streak_7');
    }

    async unlockAchievement(id) {
        const stats = await indexedDB.getStats();
        const unlocked = stats.achievements || [];

        if (unlocked.includes(id)) return; // Already unlocked

        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return;

        unlocked.push(id);
        stats.achievements = unlocked;
        await indexedDB.saveStats(stats);

        // Award XP for achievement
        await this.awardXP(achievement.xp, `Achievement: ${achievement.title}`);

        this.notify({ type: 'ACHIEVEMENT_UNLOCKED', achievement });
    }

    async checkTimeBasedAchievements() {
        const hour = new Date().getHours();
        if (hour < 8) await this.unlockAchievement('early_bird');
        if (hour >= 22) await this.unlockAchievement('night_owl');
    }
}

export const gamificationService = new GamificationService();
export { LEVELS, ACHIEVEMENTS };
