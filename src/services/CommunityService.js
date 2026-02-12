
const CommunityService = {
    getSuccessStories: async () => {
        return { stories: [] };
    },
    submitSuccessStory: async (story) => {
        return { success: true };
    }
};

export default CommunityService;
