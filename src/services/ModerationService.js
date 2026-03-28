
const ModerationService = {
    preCheckContent: (text) => {
        // Simple client-side check
        const badWords = ['hate', 'violence']; // Example blocklist
        const safe = !badWords.some(word => text.toLowerCase().includes(word));
        return { safe };
    }
};

export default ModerationService;
