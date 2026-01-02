/**
 * ModerationService - Content safety and reporting
 */

const BAD_WORDS = ['hate', 'kill', 'die', 'attack', 'abuse', 'harass', 'stupid', 'idiot']; // Basic list

const API_BASE = '/api/community';

export class ModerationService {

    /**
     * Check text for obvious violations before submission
     * @param {string} text 
     * @returns {Object} { safe: boolean, flagged: Array }
     */
    preCheckContent(text) {
        if (!text) return { safe: true, flagged: [] };

        const lowerText = text.toLowerCase();
        const flagged = BAD_WORDS.filter(word => lowerText.includes(word));

        return {
            safe: flagged.length === 0,
            flagged
        };
    }

    /**
     * Report content for moderation
     */
    async reportContent(contentType, contentId, reason) {
        try {
            const response = await fetch(`${API_BASE}/flag-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_type: contentType,
                    content_id: contentId,
                    reason
                })
            });

            if (!response.ok) throw new Error('Report failed');
            return await response.json();
        } catch (error) {
            console.error('Failed to report content:', error);
            throw error;
        }
    }
}

export default new ModerationService();
