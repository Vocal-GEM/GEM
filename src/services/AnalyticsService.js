/**
 * Analytics Service for Vocal GEM
 * Handles tracking of user events, view changes, and feature usage.
 * Currently logs to console, but can be extended to send data to a backend or 3rd party service.
 */

class AnalyticsService {
    constructor() {
        this.initialized = false;
        this.events = [];
        this.MAX_EVENTS = 100;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.logEvent('app_init');
    }

    /**
     * Log a user event
     * @param {string} eventName - Name of the event (e.g., 'view_change', 'modal_open')
     * @param {object} properties - Additional data for the event
     */
    logEvent(eventName, properties = {}) {
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

        // TODO: Send to backend/PostHog/Mixpanel here
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
