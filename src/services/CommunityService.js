
const CommunityService = {
    getSuccessStories: async () => {
        return { stories: [] };
    },
    submitSuccessStory: async (story) => {
        console.log("Mock submitting story:", story);
        return { success: true };
    }
};

export default CommunityService;
