/**
 * FlowStateDetector.js
 * Detects when a user is in "the zone" (consistent high performance)
 * and adjusts the experience to be less intrusive.
 */

export class FlowStateDetector {
    constructor() {
        this.historySize = 60; // ~3 seconds at 20fps
        this.accuracyHistory = [];
        this.consistencyHistory = []; // Standard deviations

        this.isFlowState = false;
        this.flowStartTime = 0;
        this.lastCheckTime = 0;

        // Thresholds for flow state
        this.highAccuracyThreshold = 0.85; // 85% accuracy
        this.highConsistencyThreshold = 0.90; // Low variance
        this.minDurationForFlow = 5000; // 5 seconds to enter flow
    }

    /**
     * Update detector with new performance data
     * @param {Object} metrics - { accuracy, timestamp }
     */
    update(metrics) {
        const now = metrics.timestamp || Date.now();

        // Add to history
        this.accuracyHistory.push({
            value: metrics.accuracy,
            time: now
        });

        // Trim history
        if (this.accuracyHistory.length > this.historySize) {
            this.accuracyHistory.shift();
        }

        // Check flow state periodically (every 500ms)
        if (now - this.lastCheckTime > 500) {
            this.checkFlowState(now);
            this.lastCheckTime = now;
        }

        return this.isFlowState;
    }

    /**
     * Calculate flow state status
     */
    checkFlowState(now) {
        if (this.accuracyHistory.length < 20) {
            this.isFlowState = false;
            return;
        }

        // Calculate average accuracy
        const avgAccuracy = this.accuracyHistory.reduce((sum, item) => sum + item.value, 0)
            / this.accuracyHistory.length;

        // Calculate consistency (1 - variance)
        // Simplify variance calculation for performance
        let variance = 0;
        for (const item of this.accuracyHistory) {
            variance += Math.pow(item.value - avgAccuracy, 2);
        }
        variance /= this.accuracyHistory.length;
        const consistency = 1 - Math.sqrt(variance); // simplified

        const isHighPerformance = avgAccuracy > this.highAccuracyThreshold &&
            consistency > this.highConsistencyThreshold;

        if (isHighPerformance) {
            if (this.flowStartTime === 0) {
                this.flowStartTime = now;
            } else if (now - this.flowStartTime > this.minDurationForFlow) {
                this.isFlowState = true;
            }
        } else {
            this.flowStartTime = 0;
            this.isFlowState = false;
        }
    }

    /**
     * Reset detector
     */
    reset() {
        this.accuracyHistory = [];
        this.isFlowState = false;
        this.flowStartTime = 0;
    }

    /**
     * Get current stats
     */
    getStats() {
        return {
            isFlowState: this.isFlowState,
            duration: this.isFlowState ? Date.now() - this.flowStartTime : 0,
            confidence: this.isFlowState ?
                Math.min(1, (Date.now() - this.flowStartTime - this.minDurationForFlow) / 10000) : 0
        };
    }
}

export default FlowStateDetector;
