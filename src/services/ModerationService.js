const ModerationService = {
    preCheckContent: (text) => {
        // Simple mock moderation
        const safe = !text.toLowerCase().includes('bad');
        return { safe };
    }
};

export default ModerationService;
