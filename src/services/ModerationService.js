// Service for content moderation

const ModerationService = {
    preCheckContent: (content) => {
        // Mock implementation
        const flaggedWords = ['hate', 'violence'];
        const lowerContent = content.toLowerCase();

        for (const word of flaggedWords) {
            if (lowerContent.includes(word)) {
                return { safe: false, reason: `Contains flagged word: ${word}` };
            }
        }

        return { safe: true };
    },

    reportContent: async (contentId, reason) => {
        return { success: true };
    }
};

export default ModerationService;
