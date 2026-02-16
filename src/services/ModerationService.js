/**
 * ModerationService.js (Mock)
 *
 * Provides basic content safety checks.
 */

class ModerationService {
    /**
     * Check if text content is safe
     * @param {string} text - Content to check
     * @returns {Object} { safe: boolean, flagged: boolean }
     */
    preCheckContent(text) {
        if (!text) return { safe: true, flagged: false };

        const flaggedWords = ['hate', 'kill', 'attack'];
        const lowerText = text.toLowerCase();

        const hasFlagged = flaggedWords.some(word => lowerText.includes(word));

        return {
            safe: !hasFlagged,
            flagged: hasFlagged,
            reason: hasFlagged ? 'Content contains flagged words' : null
        };
    }
}

export default new ModerationService();
