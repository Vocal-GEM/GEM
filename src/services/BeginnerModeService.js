/**
 * BeginnerModeService.js
 * 
 * Manages beginner-friendly experience with simplified UI and guided flows.
 * Includes progressive feature unlocking based on XP and achievements.
 */

import { getXPData } from './XPService';
import { getStreakData } from './StreakService';
import { getReports } from './SessionReportService';

const STORAGE_KEY = 'gem_beginner_mode';

// Feature unlock milestones
const UNLOCK_MILESTONES = {
    basicTools: { xp: 0, level: 1, label: 'Basic Tools', description: 'Dashboard, Practice, Settings' },
    voiceCheck: { xp: 50, level: 2, label: 'Voice Check', description: 'Quick 5-second voice check' },
    curriculum: { xp: 150, level: 3, label: 'Adaptive Curriculum', description: 'Personalized 4-week plans' },
    microSessions: { xp: 250, level: 4, label: 'Micro Sessions', description: '5-10 min quick practice' },
    advancedAnalytics: { xp: 400, level: 5, label: 'Advanced Analytics', description: 'Detailed charts and trends' },
    spacedRepetition: { xp: 600, level: 6, label: 'Spaced Repetition', description: 'Optimal review scheduling' },
    goalTracking: { xp: 800, level: 7, label: 'Goal Tracking', description: 'Set and track voice goals' },
    liveCoaching: { xp: 1000, level: 8, label: 'Live Coaching', description: 'Real-time feedback overlay' },
    expertTools: { xp: 1500, level: 10, label: 'Expert Tools', description: 'Full feature access' }
};

// Beginner tips shown in simplified mode
const BEGINNER_TIPS = [
    {
        id: 'start',
        title: 'Welcome! 👋',
        message: 'Start with the 5-Minute Warmup to get ready for practice.',
        trigger: 'first_visit'
    },
    {
        id: 'pitch',
        title: 'About Pitch 🎵',
        message: 'Pitch is measured in Hertz (Hz). Higher numbers = higher voice.',
        trigger: 'practice_start'
    },
    {
        id: 'resonance',
        title: 'Forward Resonance ✨',
        message: 'Think of your voice buzzing at the front of your face, not in your chest.',
        trigger: 'resonance_exercise'
    },
    {
        id: 'rest',
        title: 'Take Breaks 💧',
        message: 'Voice training works best in short sessions. Rest when needed!',
        trigger: 'long_session'
    },
    {
        id: 'streak',
        title: 'Consistency Wins 🔥',
        message: '5 minutes daily beats 1 hour weekly. Build your streak!',
        trigger: 'first_streak'
    }
];

/**
 * Get beginner mode settings
 */
export const getSettings = () => {
    const defaults = {
        enabled: true,
        simplifiedUI: true,
        showTips: true,
        dismissedTips: [],
        completedTutorials: [],
        onboardingComplete: false
    };

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
        return defaults;
    }
};

/**
 * Save beginner mode settings
 */
export const saveSettings = (settings) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save beginner settings:', e);
    }
};

/**
 * Check if beginner mode should be enabled
 */
export const shouldEnableBeginnerMode = () => {
    const xp = getXPData();
    const reports = getReports();
    const settings = getSettings();

    // Auto-disable beginner mode after level 5 or 20+ sessions
    if (xp.level >= 5 || reports.length >= 20) {
        if (settings.enabled) {
            saveSettings({ ...settings, enabled: false });
        }
        return false;
    }

    return settings.enabled;
};

/**
 * Get unlocked features based on XP
 */
export const getUnlockedFeatures = () => {
    const xp = getXPData();
    const unlocked = [];
    const locked = [];

    Object.entries(UNLOCK_MILESTONES).forEach(([id, milestone]) => {
        if (xp.totalXP >= milestone.xp) {
            unlocked.push({ id, ...milestone, unlocked: true });
        } else {
            locked.push({
                id,
                ...milestone,
                unlocked: false,
                xpNeeded: milestone.xp - xp.totalXP
            });
        }
    });

    return { unlocked, locked };
};

/**
 * Check if a specific feature is unlocked
 */
export const isFeatureUnlocked = (featureId) => {
    const xp = getXPData();
    const milestone = UNLOCK_MILESTONES[featureId];

    if (!milestone) return true; // Unknown features are accessible
    return xp.totalXP >= milestone.xp;
};

/**
 * Get the next feature to unlock
 */
export const getNextUnlock = () => {
    const { locked } = getUnlockedFeatures();
    return locked.length > 0 ? locked[0] : null;
};

/**
 * Get beginner tip for context
 */
export const getTip = (trigger) => {
    const settings = getSettings();
    if (!settings.showTips) return null;

    const tip = BEGINNER_TIPS.find(t =>
        t.trigger === trigger && !settings.dismissedTips.includes(t.id)
    );

    return tip || null;
};

/**
 * Dismiss a tip permanently
 */
export const dismissTip = (tipId) => {
    const settings = getSettings();
    if (!settings.dismissedTips.includes(tipId)) {
        settings.dismissedTips.push(tipId);
        saveSettings(settings);
    }
};

/**
 * Mark tutorial as complete
 */
export const completeTutorial = (tutorialId) => {
    const settings = getSettings();
    if (!settings.completedTutorials.includes(tutorialId)) {
        settings.completedTutorials.push(tutorialId);
        saveSettings(settings);
    }
};

/**
 * Toggle beginner mode
 */
export const toggleBeginnerMode = (enabled) => {
    const settings = getSettings();
    settings.enabled = enabled;
    saveSettings(settings);
};

/**
 * Get all unlock milestones
 */
export const getMilestones = () => UNLOCK_MILESTONES;

export default {
    getSettings,
    saveSettings,
    shouldEnableBeginnerMode,
    getUnlockedFeatures,
    isFeatureUnlocked,
    getNextUnlock,
    getTip,
    dismissTip,
    completeTutorial,
    toggleBeginnerMode,
    getMilestones
};
