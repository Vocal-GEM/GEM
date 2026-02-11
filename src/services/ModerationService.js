// Placeholder for ModerationService
const ModerationService = {
    preCheckContent: ({ title, content }) => {
        // Simple client-side check
        const flagged = ['bad', 'hate'].some(word =>
            (title + ' ' + content).toLowerCase().includes(word)
        );
        return { safe: !flagged };
    }
};

export default ModerationService;
