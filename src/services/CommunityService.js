import { getXPData } from './DailyChallengeService';

const API_BASE = '/api/community';

/**
 * CommunityService - Handles community features and sharing
 */

const STORAGE_KEY = 'gem_community';
const PROFILE_KEY = 'gem_public_profile';

/**
 * Share a voice sample anonymously
 * @param {Blob} audioBlob - Recorded audio
 * @param {Object} metadata - Context and settings
 */
export const shareVoiceAnonymously = async (audioBlob, metadata) => {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        formData.append('context', metadata.context || '');
        formData.append('expiration_days', metadata.expirationDays || 7);

        const response = await fetch(`${API_BASE}/share-voice`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
    } catch (error) {
        console.error('Failed to share voice:', error);
        throw error;
    }
};

/**
 * Get community benchmarks
 */
export const getCommunityBenchmarks = async (voiceType, experienceLevel) => {
    try {
        const params = new URLSearchParams({
            voice_goal: voiceType,
            experience_level: experienceLevel
        });

        const response = await fetch(`${API_BASE}/benchmarks?${params}`);
        if (!response.ok) throw new Error('Failed to fetch benchmarks');
        return await response.json();
    } catch (error) {
        console.error('Benchmark fetch failed:', error);
        // Fallback to simulated data
        return getSimulatedBenchmarks(voiceType);
    }
};

/**
 * Get success stories
 */
export const getSuccessStories = async (filters = {}) => {
    try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE}/success-stories?${params}`);
        if (!response.ok) throw new Error('Failed to fetch stories');
        return await response.json();
    } catch (error) {
        console.error('Story fetch failed:', error);
        return { stories: [] };
    }
};

/**
 * Submit a success story
 */
export const submitSuccessStory = async (storyData) => {
    try {
        const response = await fetch(`${API_BASE}/success-stories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(storyData)
        });

        if (!response.ok) throw new Error('Submission failed');
        return await response.json();
    } catch (error) {
        console.error('Story submission failed:', error);
        throw error;
    }
};

/**
 * Join a group challenge
 */
export const joinGroupChallenge = async (challengeId) => {
    try {
        const response = await fetch(`${API_BASE}/challenges/group/${challengeId}/join`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Join failed');
        return await response.json();
    } catch (error) {
        console.error('Failed to join challenge:', error);
        throw error;
    }
};

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

/* --- Privacy & Local Helpers --- */

const getSimulatedBenchmarks = (voiceType) => {
    // Fallback data when offline
    return {
        benchmarks: {
            avg_pitch: { value: voiceType === 'feminine' ? 210 : 110, sample_size: 100 },
            avg_resonance: { value: 0.65, sample_size: 100 }
        }
    };
};

export const getLeaderboard = async () => {
    try {
        // Try to fetch real leaderboard if endpoint existed
        // For now, use the simulated one or implement backend endpoint
        return getSimulatedLeaderboard();
    } catch (e) {
        return getSimulatedLeaderboard();
    }
};

const getSimulatedLeaderboard = () => {
    const userData = getXPData();
    const profile = getPublicProfile();

    const simulated = [
        { displayName: 'VocalStar', level: 12, xp: 7200, isYou: false },
        { displayName: 'PitchPerfect', level: 10, xp: 5000, isYou: false },
        { displayName: 'ResonanceQueen', level: 8, xp: 3200, isYou: false },
        { displayName: 'VoiceJourney', level: 6, xp: 1800, isYou: false },
        { displayName: 'ToneMaster', level: 5, xp: 1250, isYou: false }
    ];

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

const getSimulatedChallenges = () => {
    // Keep existing simulated logic
    const weekNumber = getWeekNumber();
    const challengePool = [
        { id: 'streak-7', title: '7-Day Streak', description: 'Practice every day for a week', xpReward: 200 },
        { id: 'pitch-master', title: 'Pitch Master', description: 'Complete 10 pitch exercises', xpReward: 150 },
        { id: 'journal-5', title: 'Voice Logger', description: 'Record 5 voice journal entries', xpReward: 100 },
        { id: 'resonance-pro', title: 'Resonance Pro', description: 'Complete 15 resonance exercises', xpReward: 175 },
    ];

    // Select 2
    const idx1 = weekNumber % challengePool.length;
    const idx2 = (weekNumber + 3) % challengePool.length;

    return [
        { ...challengePool[idx1], weekNumber },
        { ...challengePool[idx2], weekNumber }
    ];
};

export const getWeeklyChallenges = async () => {
    try {
        const response = await fetch(`${API_BASE}/challenges/group`);
        if (response.ok) {
            const data = await response.json();
            // Transform if necessary to match UI expectation
            // Or merge with local challenges
            return [...getSimulatedChallenges(), ...data.challenges];
        }
        return getSimulatedChallenges();
    } catch (e) {
        return getSimulatedChallenges();
    }
}

const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek);
};

export default {
    shareVoiceAnonymously,
    getCommunityBenchmarks,
    getSuccessStories,
    submitSuccessStory,
    joinGroupChallenge,
    getPublicProfile,
    updatePublicProfile,
    getLeaderboard,
    getWeeklyChallenges
};
