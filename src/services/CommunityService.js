// Mock CommunityService
const CommunityService = {
    getSuccessStories: async () => ({ stories: [] }),
    submitSuccessStory: async (data) => { console.log('Submitted', data); return { success: true }; },
    upvoteStory: async (id) => { console.log('Upvoted', id); return { success: true }; }
};

export default CommunityService;
