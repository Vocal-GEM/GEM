/**
 * CommunityService.js
 *
 * Handles interactions with the community API endpoints.
 */

const BASE_URL = '/api/community';

export const CommunityService = {
    /**
     * Fetch success stories with optional filtering
     * @param {Object} params - Query parameters (limit, tag, sort)
     */
    async getSuccessStories(params = {}) {
        // Mock data for frontend development if backend is not available
        if (import.meta.env.VITE_USE_MOCK_API === 'true') {
            return {
                stories: [
                    {
                        id: 1,
                        title: "Finding My Voice at 40",
                        story: "I never thought I could change my resonance...",
                        voice_goal: "feminine",
                        timeline_months: 8,
                        upvotes: 24,
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        title: "Confidence Booster",
                        story: "The pitch visualizer helped me stay consistent.",
                        voice_goal: "androgynous",
                        timeline_months: 3,
                        upvotes: 15,
                        created_at: new Date().toISOString()
                    }
                ]
            };
        }

        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/stories?${query}`);

        if (!response.ok) {
            throw new Error('Failed to fetch stories');
        }

        return response.json();
    },

    /**
     * Submit a new success story
     * @param {Object} storyData - { title, story, voice_goal, timeline_months, ... }
     */
    async submitSuccessStory(storyData) {
        const response = await fetch(`${BASE_URL}/stories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(storyData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Submission failed');
        }

        return response.json();
    },

    /**
     * Upvote a story
     * @param {number} storyId
     */
    async upvoteStory(storyId) {
        const response = await fetch(`${BASE_URL}/stories/${storyId}/upvote`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to upvote');
        }

        return response.json();
    }
};

export default CommunityService;
