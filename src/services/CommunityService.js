
const CommunityService = {
    getSuccessStories: async () => ({ stories: [] }),
    submitSuccessStory: async () => ({ success: true }),
    getSharedVoices: async () => ({ voices: [] }),
    shareVoice: async () => ({ success: true })
};

export default CommunityService;
