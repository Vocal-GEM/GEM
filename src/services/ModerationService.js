// Mock ModerationService
const ModerationService = {
    preCheckContent: (text) => {
        const flaggedWords = ['bad', 'flagged'];
        const safe = !flaggedWords.some(word => text.toLowerCase().includes(word));
        return { safe };
    }
};

export default ModerationService;
