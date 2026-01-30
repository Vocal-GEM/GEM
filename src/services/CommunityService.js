
// CommunityService.js
// Mock service for community features

const getSuccessStories = async () => {
    return {
        stories: [
            {
                id: 1,
                title: "Finding My Voice",
                story: "After 6 months of practice, I finally feel confident on the phone!",
                voice_goal: "feminine",
                timeline_months: 6,
                upvotes: 24,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: "Resonance Breakthrough",
                story: "The resonance orb visualization really helped me understand bright vs dark sound.",
                voice_goal: "androgynous",
                timeline_months: 3,
                upvotes: 15,
                created_at: new Date().toISOString()
            }
        ]
    };
};

const submitSuccessStory = async (storyData) => {
    console.log("Submitting story:", storyData);
    return { success: true, id: Date.now() };
};

export default {
    getSuccessStories,
    submitSuccessStory
};
