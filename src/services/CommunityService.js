// Mock implementation of CommunityService
export const CommunityService = {
    getSuccessStories: async () => {
        return { stories: [] };
    },
    submitSuccessStory: async () => {
        return { success: true };
    }
};

export default CommunityService;
