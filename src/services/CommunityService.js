import { getXPData } from './DailyChallengeService';

/**
 * CommunityService - Handles community features and sharing
 */

const STORAGE_KEY = 'gem_community';
const PROFILE_KEY = 'gem_public_profile';

/**
 * Get user's public profile settings
 */
export const getPublicProfile = () => {
    try {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('CommunityService: Failed to load profile', e);
    }
    return {
        displayName: 'Anonymous',
        shareProgress: false,
        showBadges: true,
        showLevel: true,
        bio: ''
    };
};

/**
 * Update public profile
 */
export const updatePublicProfile = (updates) => {
    const profile = getPublicProfile();
    const newProfile = { ...profile, ...updates };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    return newProfile;
};

/**
 * Get community data (local simulation)
 */
export const getCommunityData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('CommunityService: Failed to load', e);
    }
    return {
        sharedMilestones: [],
        challenges: [],
        leaderboard: []
    };
};

/**
 * Share a milestone to community
 */
export const shareMilestone = (milestone) => {
    const data = getCommunityData();
    const profile = getPublicProfile();

    if (!profile.shareProgress) {
        return { success: false, message: 'Sharing disabled in settings' };
    }

    const sharedMilestone = {
        id: `milestone_${Date.now()}`,
        userId: getAnonymousId(),
        displayName: profile.displayName,
        type: milestone.type,
        title: milestone.title,
        description: milestone.description,
        timestamp: new Date().toISOString()
    };

    data.sharedMilestones.unshift(sharedMilestone);
    if (data.sharedMilestones.length > 50) {
        data.sharedMilestones = data.sharedMilestones.slice(0, 50);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true, milestone: sharedMilestone };
};

/**
 * Get weekly challenges
 */
export const getWeeklyChallenges = () => {
    const weekNumber = getWeekNumber();

    // Simulated weekly challenges based on week number
    const challengePool = [
        { id: 'streak-7', title: '7-Day Streak', description: 'Practice every day for a week', xpReward: 200 },
        { id: 'pitch-master', title: 'Pitch Master', description: 'Complete 10 pitch exercises', xpReward: 150 },
        { id: 'journal-5', title: 'Voice Logger', description: 'Record 5 voice journal entries', xpReward: 100 },
        { id: 'resonance-pro', title: 'Resonance Pro', description: 'Complete 15 resonance exercises', xpReward: 175 },
        { id: 'variety', title: 'All-Rounder', description: 'Practice from 5 different categories', xpReward: 125 },
        { id: 'time-30', title: 'Dedicated', description: 'Practice for 30 minutes total', xpReward: 100 }
    ];

    // Select 2 challenges based on week
    const idx1 = weekNumber % challengePool.length;
    const idx2 = (weekNumber + 3) % challengePool.length;

    return [
        { ...challengePool[idx1], weekNumber },
        { ...challengePool[idx2], weekNumber }
    ];
};

/**
 * Get leaderboard (simulated)
 */
export const getLeaderboard = () => {
    // const { getXPData } = require('./DailyChallengeService'); // Removed: require is not defined in ESM
    const userData = getXPData();
    const profile = getPublicProfile();

    // Simulated other users
    const simulated = [
        { displayName: 'VocalStar', level: 12, xp: 7200, isYou: false },
        { displayName: 'PitchPerfect', level: 10, xp: 5000, isYou: false },
        { displayName: 'ResonanceQueen', level: 8, xp: 3200, isYou: false },
        { displayName: 'VoiceJourney', level: 6, xp: 1800, isYou: false },
        { displayName: 'ToneMaster', level: 5, xp: 1250, isYou: false }
    ];

    // Add current user
    const currentUser = {
        displayName: profile.displayName,
        level: userData.level,
        xp: userData.totalXP,
        isYou: true
    };

    const combined = [...simulated, currentUser];
    combined.sort((a, b) => b.xp - a.xp);

    return combined.map((user, idx) => ({ ...user, rank: idx + 1 }));
};

/**
 * Helpers
 */
const getAnonymousId = () => {
    let id = localStorage.getItem('gem_anonymous_id');
    if (!id) {
        id = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('gem_anonymous_id', id);
    }
    return id;
};

const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek);
};

export default {
    getPublicProfile,
    updatePublicProfile,
    getCommunityData,
    shareMilestone,
    getWeeklyChallenges,
    getLeaderboard
};
