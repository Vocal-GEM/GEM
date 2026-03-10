/**
 * ModerationService
 * Handles content moderation for community features.
 */

const ModerationService = {
    preCheckContent(text) {
        // Simple mock check
        const badWords = ['bad', 'offensive'];
        const containsBadWord = badWords.some(word => text.toLowerCase().includes(word));
        return { safe: !containsBadWord };
    }
};

export default ModerationService;
