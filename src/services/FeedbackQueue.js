/**
 * FeedbackQueue.js
 * Priority-based feedback queue to prevent overwhelming users
 */

export class FeedbackQueue {
    constructor() {
        this.queue = [];
        this.lastFeedbackTime = 0;
        this.minInterval = 3000; // Minimum 3 seconds between feedback
        this.maxQueueSize = 5;

        // Priority levels
        this.priorities = {
            critical: 100,  // Strain warnings, errors
            high: 75,       // Significant deviations
            medium: 50,     // Minor corrections
            low: 25,        // Tips and suggestions
            info: 10        // General information
        };
    }

    /**
     * Add feedback to queue
     * @param {Object} feedback - { type, message, priority, data }
     */
    add(feedback) {
        const item = {
            ...feedback,
            id: this.generateId(),
            timestamp: Date.now(),
            priority: this.priorities[feedback.priority] || this.priorities.medium,
            shown: false
        };

        // Always show critical feedback immediately
        if (feedback.priority === 'critical') {
            this.queue.unshift(item);
            return item.id;
        }

        // Check for duplicates
        const duplicate = this.queue.find(f =>
            f.type === feedback.type &&
            f.message === feedback.message &&
            !f.shown
        );

        if (duplicate) {
            // Update timestamp of duplicate instead of adding new
            duplicate.timestamp = Date.now();
            return duplicate.id;
        }

        // Add to queue
        this.queue.push(item);

        // Sort by priority (highest first)
        this.queue.sort((a, b) => b.priority - a.priority);

        // Trim queue if too large
        if (this.queue.length > this.maxQueueSize) {
            this.queue = this.queue.slice(0, this.maxQueueSize);
        }

        return item.id;
    }

    /**
     * Get next feedback to show
     * @param {boolean} respectInterval - Whether to respect minimum interval
     * @returns {Object|null} Next feedback item or null
     */
    getNext(respectInterval = true) {
        if (this.queue.length === 0) return null;

        const now = Date.now();

        // Check if enough time has passed since last feedback
        if (respectInterval && now - this.lastFeedbackTime < this.minInterval) {
            // Unless it's critical
            const critical = this.queue.find(f => f.priority >= this.priorities.critical && !f.shown);
            if (!critical) return null;

            this.lastFeedbackTime = now;
            critical.shown = true;
            return critical;
        }

        // Get highest priority unshown feedback
        const next = this.queue.find(f => !f.shown);
        if (!next) return null;

        this.lastFeedbackTime = now;
        next.shown = true;

        return next;
    }

    /**
     * Peek at next feedback without marking as shown
     */
    peek() {
        return this.queue.find(f => !f.shown) || null;
    }

    /**
     * Remove feedback by ID
     */
    remove(id) {
        this.queue = this.queue.filter(f => f.id !== id);
    }

    /**
     * Clear all feedback
     */
    clear() {
        this.queue = [];
    }

    /**
     * Clear shown feedback older than specified time
     * @param {number} maxAge - Maximum age in milliseconds
     */
    clearOld(maxAge = 30000) {
        const now = Date.now();
        this.queue = this.queue.filter(f =>
            !f.shown || (now - f.timestamp) < maxAge
        );
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            total: this.queue.length,
            unshown: this.queue.filter(f => !f.shown).length,
            critical: this.queue.filter(f => f.priority >= this.priorities.critical).length,
            canShow: Date.now() - this.lastFeedbackTime >= this.minInterval
        };
    }

    /**
     * Set minimum interval between feedback
     */
    setMinInterval(interval) {
        this.minInterval = Math.max(1000, interval);
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Filter feedback by type
     */
    getByType(type) {
        return this.queue.filter(f => f.type === type);
    }

    /**
     * Get all unshown feedback
     */
    getUnshown() {
        return this.queue.filter(f => !f.shown);
    }
}

/**
 * FocusMode - Filter feedback to single metric
 */
export class FocusMode {
    constructor() {
        this.enabled = false;
        this.focusMetric = null; // 'pitch', 'resonance', 'weight', etc.
        this.allowedTypes = [];
    }

    /**
     * Enable focus mode for specific metric
     */
    enable(metric) {
        this.enabled = true;
        this.focusMetric = metric;

        // Define which feedback types are allowed for each metric
        const metricTypes = {
            pitch: ['pitch', 'pitch_low', 'pitch_high', 'pitch_drift', 'strain'],
            resonance: ['resonance', 'resonance_dark', 'resonance_bright', 'resonance_drift', 'strain'],
            weight: ['weight', 'weight_light', 'weight_heavy', 'weight_drift', 'strain'],
            all: ['strain', 'critical'] // Always show critical feedback
        };

        this.allowedTypes = metricTypes[metric] || metricTypes.all;
    }

    /**
     * Disable focus mode
     */
    disable() {
        this.enabled = false;
        this.focusMetric = null;
        this.allowedTypes = [];
    }

    /**
     * Check if feedback should be shown in focus mode
     */
    shouldShow(feedback) {
        if (!this.enabled) return true;

        // Always show critical feedback
        if (feedback.priority === 'critical') return true;

        // Check if feedback type is allowed
        return this.allowedTypes.includes(feedback.type);
    }

    /**
     * Get focus mode status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            metric: this.focusMetric,
            allowedTypes: this.allowedTypes
        };
    }

    /**
     * Toggle focus mode
     */
    toggle(metric) {
        if (this.enabled && this.focusMetric === metric) {
            this.disable();
        } else {
            this.enable(metric);
        }
    }
}

// Singleton instances
let queueInstance = null;
let focusModeInstance = null;

export const getFeedbackQueue = () => {
    if (!queueInstance) {
        queueInstance = new FeedbackQueue();
    }
    return queueInstance;
};

export const getFocusMode = () => {
    if (!focusModeInstance) {
        focusModeInstance = new FocusMode();
    }
    return focusModeInstance;
};

export default FeedbackQueue;
