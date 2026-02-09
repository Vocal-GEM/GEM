// Placeholder service to satisfy import resolution in tests
const CommunityService = {
    getSuccessStories: async () => ({ stories: [] }),
    submitSuccessStory: async () => ({ success: true })
};

export default CommunityService;
