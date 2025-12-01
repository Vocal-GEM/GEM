/**
 * Analytics Service for Vocal GEM
 * Handles tracking of user events, view changes, and feature usage.
 * Currently logs to console, but can be extended to send data to a backend or 3rd party service.
 */

class AnalyticsService {
    constructor() {
        this.initialized = false;
        this.enabled = false;
        this.events = [];
        this.MAX_EVENTS = 100;
    }

    init(enabled = false) {
        if (this.initialized) {
            this.setEnabled(enabled);
            return;
        }
        this.initialized = true;
        this.enabled = enabled;
        if (enabled) this.logEvent('app_init');
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled && !this.events.find(e => e.name === 'analytics_enabled')) {
            this.logEvent('analytics_enabled');
        }
    }

    /**
     * Log a user event
     * @param {string} eventName - Name of the event (e.g., 'view_change', 'modal_open')
     * @param {object} properties - Additional data for the event
     */
    logEvent(eventName, properties = {}) {
        if (!this.enabled) return;

        const event = {
            name: eventName,
            properties,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };

        // Add to local buffer
        this.events.unshift(event);
        if (this.events.length > this.MAX_EVENTS) {
            this.events.pop();
        }

        // Console log for dev visibility (could be gated by debug mode)
        console.groupCollapsed(`[Analytics] ${eventName}`);
        console.log('Properties:', properties);
        console.log('Timestamp:', event.date);
        console.groupEnd();
    }

    /**
     * Get buffered events
     */
    getEvents() {
        return this.events;
    }

    /**
     * Calculate basic funnel stats
     */
    getFunnelStats() {
        const starts = this.events.filter(e => e.name === 'tutorial_start').length;
        const completes = this.events.filter(e => e.name === 'tutorial_complete').length;
        return {
            tutorialStart: starts,
            tutorialComplete: completes,
            conversionRate: starts > 0 ? Math.round((completes / starts) * 100) : 0
        };
    }

    /**
     * Track view navigation
     * @param {string} viewName - The new view name
     */
    trackView(viewName) {
        this.logEvent('view_change', { view: viewName });
    }

    /**
     * Track modal usage
     * @param {string} modalName - The modal being opened
     */
    trackModalOpen(modalName) {
        this.logEvent('modal_open', { modal: modalName });
    }

    /**
     * Track feature usage
     * @param {string} feature - The feature being used (e.g., 'pitch_graph', 'recording_start')
     */
    trackFeature(feature, details = {}) {
        this.logEvent('feature_use', { feature, ...details });
    }
}

export const analyticsService = new AnalyticsService();
