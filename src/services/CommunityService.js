
// CommunityService.js
// Service for interacting with community features (Success Stories, Challenges, etc.)

const API_URL = import.meta.env.VITE_API_URL || '';

const CommunityService = {
    /**
     * Get approved success stories
     * @param {Object} filters - Optional filters
     * @returns {Promise<Object>} List of stories
     */
    async getSuccessStories(filters = {}) {
        try {
            const query = new URLSearchParams(filters).toString();
            const response = await fetch(`${API_URL}/api/community/success-stories?${query}`);

            if (!response.ok) {
                // If backend is not available or returns error, throw to let UI handle fallback/mock
                throw new Error('Failed to fetch stories');
            }

            return await response.json();
        } catch (error) {
            console.error('CommunityService: Error fetching stories', error);
            // Return empty list or throw depending on UI needs.
            // Here we throw so UI falls back to mocks if needed.
            throw error;
        }
    },

    /**
     * Submit a success story
     * @param {Object} data - Story data
     * @returns {Promise<Object>} Submission result
     */
    async submitSuccessStory(data) {
        try {
            const response = await fetch(`${API_URL}/api/community/success-stories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to submit story');
            }

            return await response.json();
        } catch (error) {
            console.error('CommunityService: Error submitting story', error);
            throw error;
        }
    }
};

export default CommunityService;
