/**
 * ModerationService.js
 *
 * Client-side moderation checks before submission.
 */

const FLAGGED_WORDS = ['spam', 'abuse', 'hate']; // Simple example list

export const ModerationService = {
    /**
     * Pre-check content for prohibited terms
     * @param {string} text - The content to check
     * @returns {Object} { safe: boolean, flagged: string[] }
     */
    preCheckContent(text) {
        if (!text) return { safe: true, flagged: [] };

        const lowerText = text.toLowerCase();
        const flagged = FLAGGED_WORDS.filter(word => lowerText.includes(word));

        return {
            safe: flagged.length === 0,
            flagged
        };
    }
};

export default ModerationService;
