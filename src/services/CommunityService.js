/**
 * CommunityService.js (Frontend Mock/Stub)
 *
 * Handles interaction with community features including:
 * - Success stories
 * - Shared clips
 * - Group challenges
 * - Mentorship connections
 */

// Mock data store for offline/demo mode
const LOCAL_STORE = {
    stories: [],
    challenges: []
};

const API_URL = import.meta.env.VITE_API_URL || '';

class CommunityService {
    /**
     * Fetch community success stories
     * @param {Object} filters - { voice_goal, limit }
     */
    async getSuccessStories(filters = {}) {
        try {
            if (!API_URL) return this._getMockStories(filters);

            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`${API_URL}/api/community/success-stories?${query}`);

            if (!res.ok) throw new Error('Failed to fetch stories');
            return await res.json();
        } catch (e) {
            console.warn('Using local stories due to error:', e);
            return this._getMockStories(filters);
        }
    }

    /**
     * Submit a new success story
     * @param {Object} storyData
     */
    async submitSuccessStory(storyData) {
        try {
            if (!API_URL) {
                // Simulate success locally
                const newStory = {
                    id: Date.now(),
                    ...storyData,
                    upvotes: 0,
                    created_at: new Date().toISOString()
                };
                LOCAL_STORE.stories.unshift(newStory);
                return { success: true, story: newStory };
            }

            const res = await fetch(`${API_URL}/api/community/success-stories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storyData)
            });

            if (!res.ok) throw new Error('Submission failed');
            return await res.json();
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    // --- Helpers ---

    _getMockStories(filters) {
        let stories = LOCAL_STORE.stories.length > 0 ? LOCAL_STORE.stories : [];
        if (filters.voice_goal) {
            stories = stories.filter(s => s.voice_goal === filters.voice_goal);
        }
        return { stories };
    }
}

export default new CommunityService();
