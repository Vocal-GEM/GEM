class ModerationService {
    preCheckContent(text) {
        // Simple mock implementation
        const blockedWords = ['badword', 'offensive'];
        const lowerText = text.toLowerCase();

        for (const word of blockedWords) {
            if (lowerText.includes(word)) {
                return { safe: false };
            }
        }

        return { safe: true };
    }
}

export default new ModerationService();
