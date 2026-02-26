/**
 * StreakService - Tracks daily practice streaks
 * 
 * A streak is maintained by practicing at least once per day.
 * Missing a day breaks the streak, but a "Rest Day" can be used to preserve it.
 */

const STORAGE_KEY = 'gem_practice_streak';

/**
 * Get the stored streak data
 * @returns {{ currentStreak: number, lastPracticeDate: string | null, longestStreak: number, restDaysUsed: number }}
 */
export const getStreakData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('StreakService: Failed to parse streak data', e);
    }
    return {
        currentStreak: 0,
        lastPracticeDate: null,
        longestStreak: 0,
        restDaysUsed: 0
    };
};

/**
 * Save streak data to localStorage
 */
const saveStreakData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('StreakService: Failed to save streak data', e);
    }
};

/**
 * Get today's date as YYYY-MM-DD string
 */
const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

/**
 * Check the current streak status
 * @returns {{ isActive: boolean, currentStreak: number, longestStreak: number, needsPracticeToday: boolean }}
 */
export const checkStreakStatus = () => {
    const data = getStreakData();
    const today = getToday();
    const yesterday = getYesterday();

    // Already practiced today
    if (data.lastPracticeDate === today) {
        return {
            isActive: true,
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
            needsPracticeToday: false
        };
    }

    // Practiced yesterday - streak is still alive but needs today's practice
    if (data.lastPracticeDate === yesterday) {
        return {
            isActive: true,
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
            needsPracticeToday: true
        };
    }

    // Streak is broken (missed more than 1 day)
    return {
        isActive: false,
        currentStreak: 0,
        longestStreak: data.longestStreak,
        needsPracticeToday: true
    };
};

/**
 * Record a practice session - updates the streak
 * @returns {{ currentStreak: number, longestStreak: number, isNewRecord: boolean }}
 */
export const recordPractice = () => {
    const data = getStreakData();
    const today = getToday();
    const yesterday = getYesterday();

    // Already practiced today - no change
    if (data.lastPracticeDate === today) {
        return {
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
            isNewRecord: false
        };
    }

    let newStreak = 1;
    let isNewRecord = false;

    // Continuing the streak from yesterday
    if (data.lastPracticeDate === yesterday) {
        newStreak = data.currentStreak + 1;
    }

    // Check for new record
    const newLongest = Math.max(data.longestStreak, newStreak);
    if (newLongest > data.longestStreak) {
        isNewRecord = true;
    }

    const updatedData = {
        ...data,
        currentStreak: newStreak,
        lastPracticeDate: today,
        longestStreak: newLongest
    };

    saveStreakData(updatedData);

    return {
        currentStreak: newStreak,
        longestStreak: newLongest,
        isNewRecord
    };
};

/**
 * Get a motivational message based on streak status
 */
export const getStreakMessage = (streak) => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Day 1 - Great start!";
    if (streak < 7) return `${streak} days - Keep going!`;
    if (streak < 14) return `${streak} days - One week strong! 💪`;
    if (streak < 30) return `${streak} days - You're on fire! 🔥`;
    if (streak < 100) return `${streak} days - Incredible consistency! ⭐`;
    return `${streak} days - LEGENDARY! 👑`;
};

export default {
    getStreakData,
    checkStreakStatus,
    recordPractice,
    getStreakMessage
};
