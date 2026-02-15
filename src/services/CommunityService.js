
// Mock CommunityService
const CommunityService = {
    getSuccessStories: async () => ({
        stories: [
            {
                id: 1,
                title: "Mock Story",
                story: "This is a mock story.",
                voice_goal: "feminine",
                timeline_months: 6,
                upvotes: 10,
                before_audio: "mock_url",
                after_audio: "mock_url",
                created_at: new Date().toISOString()
            }
        ]
    }),
    submitSuccessStory: async (data) => {
        return { success: true, id: 123 };
    }
};

export default CommunityService;
