// Mock Community Service
export const getSuccessStories = async () => ({
    stories: [
        {
            id: 1,
            title: "My 6-month journey",
            story: "It was hard but worth it.",
            timeline_months: 6,
            voice_goal: "feminine",
            upvotes: 12,
            before_audio: "mock_url_before",
            after_audio: "mock_url_after",
            created_at: new Date().toISOString()
        }
    ]
});

export const submitSuccessStory = async (data) => {
    console.log("Submitting story:", data);
    return { success: true, id: Date.now() };
};

export const voteStory = async (id) => {
    console.log("Upvoted:", id);
    return { success: true, new_count: 13 };
};

const CommunityService = {
    getSuccessStories,
    submitSuccessStory,
    voteStory
};

export default CommunityService;
