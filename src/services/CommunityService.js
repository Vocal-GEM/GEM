const CommunityService = {
    getSuccessStories: async () => {
        // Mock implementation or real API call
        return { stories: [] };
    },
    submitSuccessStory: async (storyData) => {
        console.log('Submitting story:', storyData);
        return { success: true };
    }
};

export default CommunityService;
