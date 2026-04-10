class CommunityService {
    async getSuccessStories() {
        return { stories: [] };
    }

    async submitSuccessStory(data) {
        return { success: true };
    }
}

export default new CommunityService();
