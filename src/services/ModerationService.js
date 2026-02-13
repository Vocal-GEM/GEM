const ModerationService = {
    preCheckContent(content) {
        // Mock implementation - naive check
        const badWords = ['badword']; // Placeholder
        const hasBadWords = badWords.some(word => content.toLowerCase().includes(word));
        return { safe: !hasBadWords };
    }
};

export default ModerationService;
