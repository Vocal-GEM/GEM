// Placeholder for CommunityService
const CommunityService = {
    getSuccessStories: async () => {
        return { stories: [] };
    },
    submitSuccessStory: async (data) => {
        console.log('Submitting story:', data);
        return { success: true };
    }
};

export default CommunityService;
