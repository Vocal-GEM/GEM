/**
 * AdaptiveFeedback.js
 * Intelligent feedback controller that adjusts sensitivity based on user skill level
 */

export class AdaptiveFeedbackController {
    constructor() {
        this.skillLevel = 0.5; // 0 = beginner, 1 = advanced
        this.recentPerformance = [];
        this.maxPerformanceHistory = 20;

        // Load saved skill level
        this.loadSkillLevel();
    }

    /**
     * Update skill level based on recent performance
     * @param {Object} performance - { accuracy: 0-1, targetHitRate: 0-1, consistency: 0-1 }
     */
    updateSkillLevel(performance) {
        this.recentPerformance.push({
            ...performance,
            timestamp: Date.now()
        });

        // Keep only recent history
        if (this.recentPerformance.length > this.maxPerformanceHistory) {
            this.recentPerformance.shift();
        }

        // Calculate skill from recent accuracy
        const avgAccuracy = this.recentPerformance.reduce((sum, p) => sum + p.accuracy, 0)
            / this.recentPerformance.length;

        const avgTargetHitRate = this.recentPerformance.reduce((sum, p) => sum + (p.targetHitRate || 0), 0)
            / this.recentPerformance.length;

        const avgConsistency = this.recentPerformance.reduce((sum, p) => sum + (p.consistency || 0), 0)
            / this.recentPerformance.length;

        // Weighted skill calculation
        const calculatedSkill = (
            avgAccuracy * 0.5 +
            avgTargetHitRate * 0.3 +
            avgConsistency * 0.2
        );

        // Smooth skill level changes (exponential moving average)
        this.skillLevel = this.skillLevel * 0.9 + calculatedSkill * 0.1;

        // Clamp to valid range
        this.skillLevel = Math.max(0, Math.min(1, this.skillLevel));

        // Save to localStorage
        this.saveSkillLevel();
    }

    /**
     * Get adaptive thresholds based on current skill level
     * @param {number} userSensitivity - User's manual sensitivity setting (0-1)
     * @returns {Object} Threshold configuration
     */
    getThresholds(userSensitivity = 0.5) {
        // Beginners get wider acceptable ranges
        const baseRange = 20; // Hz for pitch
        const skillMultiplier = 1 + (1 - this.skillLevel); // 1.0 to 2.0
        const sensitivityMultiplier = 0.5 + userSensitivity; // 0.5 to 1.5

        const combinedMultiplier = skillMultiplier * sensitivityMultiplier;

        return {
            // Pitch tolerance in Hz
            pitchTolerance: baseRange * combinedMultiplier,

            // Resonance tolerance (0-1 scale)
            resonanceTolerance: 0.15 * combinedMultiplier,

            // Weight tolerance (0-1 scale)
            weightTolerance: 0.2 * combinedMultiplier,

            // Delay before showing feedback (ms)
            feedbackDelay: 500 + (1 - this.skillLevel) * 500, // 500-1000ms

            // How often to show feedback
            feedbackFrequency: this.skillLevel > 0.7 ? 'rare' :
                this.skillLevel > 0.4 ? 'moderate' : 'frequent',

            // Minimum time between feedback messages (ms)
            minFeedbackInterval: this.skillLevel > 0.7 ? 5000 :
                this.skillLevel > 0.4 ? 3000 : 2000,

            // Confidence threshold for showing feedback
            confidenceThreshold: Math.max(0.5, 0.7 - this.skillLevel * 0.2)
        };
    }

    /**
     * Determine if feedback should be shown based on skill level and recent feedback
     * @param {string} feedbackType - Type of feedback to show
     * @param {number} lastFeedbackTime - Timestamp of last feedback
     * @returns {boolean} Whether to show feedback
     */
    shouldShowFeedback(feedbackType, lastFeedbackTime = 0) {
        const thresholds = this.getThresholds();
        const timeSinceLastFeedback = Date.now() - lastFeedbackTime;

        // Always show critical feedback (strain warnings)
        if (feedbackType === 'strain' || feedbackType === 'warning') {
            return timeSinceLastFeedback > 1000; // Max once per second
        }

        // Respect minimum interval
        if (timeSinceLastFeedback < thresholds.minFeedbackInterval) {
            return false;
        }

        // Frequency-based decision
        if (thresholds.feedbackFrequency === 'rare') {
            return Math.random() < 0.3; // 30% chance
        } else if (thresholds.feedbackFrequency === 'moderate') {
            return Math.random() < 0.6; // 60% chance
        }

        return true; // Frequent mode - always show
    }

    /**
     * Get skill level description
     * @returns {string} Human-readable skill level
     */
    getSkillLevelDescription() {
        if (this.skillLevel < 0.3) return 'Beginner';
        if (this.skillLevel < 0.6) return 'Intermediate';
        if (this.skillLevel < 0.8) return 'Advanced';
        return 'Expert';
    }

    /**
     * Get recommended practice focus based on recent performance
     * @returns {Array<string>} Areas to focus on
     */
    getRecommendedFocus() {
        if (this.recentPerformance.length < 5) {
            return ['Complete more sessions to get personalized recommendations'];
        }

        const avgAccuracy = this.recentPerformance.reduce((sum, p) => sum + p.accuracy, 0)
            / this.recentPerformance.length;
        const avgConsistency = this.recentPerformance.reduce((sum, p) => sum + (p.consistency || 0), 0)
            / this.recentPerformance.length;

        const recommendations = [];

        if (avgAccuracy < 0.5) {
            recommendations.push('Focus on hitting target ranges more accurately');
        }

        if (avgConsistency < 0.5) {
            recommendations.push('Practice maintaining stable pitch and resonance');
        }

        if (this.skillLevel > 0.7 && avgAccuracy > 0.7) {
            recommendations.push('Try more challenging exercises or tighter targets');
        }

        return recommendations.length > 0 ? recommendations : ['Keep up the great work!'];
    }

    /**
     * Save skill level to localStorage
     */
    saveSkillLevel() {
        try {
            localStorage.setItem('adaptiveFeedback', JSON.stringify({
                skillLevel: this.skillLevel,
                lastUpdated: Date.now(),
                performanceHistory: this.recentPerformance.slice(-5) // Save last 5
            }));
        } catch (e) {
            console.warn('Failed to save skill level:', e);
        }
    }

    /**
     * Load skill level from localStorage
     */
    loadSkillLevel() {
        try {
            const saved = localStorage.getItem('adaptiveFeedback');
            if (saved) {
                const data = JSON.parse(saved);
                this.skillLevel = data.skillLevel || 0.5;
                this.recentPerformance = data.performanceHistory || [];
            }
        } catch (e) {
            console.warn('Failed to load skill level:', e);
        }
    }

    /**
     * Reset skill level (for testing or user request)
     */
    reset() {
        this.skillLevel = 0.5;
        this.recentPerformance = [];
        this.saveSkillLevel();
    }
}

// Singleton instance
let instance = null;

export const getAdaptiveFeedbackController = () => {
    if (!instance) {
        instance = new AdaptiveFeedbackController();
    }
    return instance;
};

export default AdaptiveFeedbackController;
