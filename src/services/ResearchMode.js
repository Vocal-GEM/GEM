/**
 * Research Mode Configuration
 * Handles environment-specific feature flags and data collection settings
 */

const ResearchMode = {
    isEnabled: import.meta.env.VITE_RESEARCH_MODE === 'true',
    participantId: null,
    sessionId: null,

    initialize(participantId) {
        if (!this.isEnabled) return;
        this.participantId = participantId;
        this.sessionId = crypto.randomUUID();
        console.log(`[Research] Session initialized: ${this.sessionId}`);
    },

    logEvent(eventType, data) {
        if (!this.isEnabled) return;

        const payload = {
            timestamp: new Date().toISOString(),
            participantId: this.participantId,
            sessionId: this.sessionId,
            type: eventType,
            data
        };

        // In production, this would send to a secure endpoint
        if (import.meta.env.DEV) {
            console.log('[Research Event]', payload);
        }
    }
};

export default ResearchMode;
