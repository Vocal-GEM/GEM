
// ModerationService.js
// Frontend-side moderation checks (pre-submission)

const ModerationService = {
    /**
     * Check content for flagged keywords locally
     * @param {string} text - Content to check
     * @returns {Object} { safe: boolean, flagged: string[] }
     */
    preCheckContent(text) {
        if (!text) return { safe: true, flagged: [] };

        const lower = text.toLowerCase();
        const flaggedKeywords = ['hate', 'kill', 'die', 'attack', 'abuse']; // Basic list matching backend

        const found = flaggedKeywords.filter(word => lower.includes(word));

        return {
            safe: found.length === 0,
            flagged: found
        };
    }
};

export default ModerationService;
