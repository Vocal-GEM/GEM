/**
 * FatiguePredictor.js
 * 
 * models and predicts vocal fatigue based on session patterns and intensity.
 * helps users avoid overtraining and injury.
 */

export class FatiguePredictor {
    constructor() {
        // arbitrary units for fatigue calculation
        this.FATIGUE_CONSTANTS = {
            DECAY_RATE_PER_HOUR: 5, // recovery rate
            INTENSITY_MULTIPLIER: 1.5,
            MAX_DAILY_LOAD: 100, // arbitrary max load units
            WARNING_THRESHOLD: 70
        };
    }

    /**
     * predicts current fatigue level based on recent history
     * @param {Array} sessionHistory - recent sessions with duration and intensity
     * @returns {Object} fatigue assessment
     */
    predictFatigue(sessionHistory) {
        // calculate accumulated fatigue load
        const load = this.calculateAccumulatedFastigue(sessionHistory);

        const riskLevel = load > 90 ? 'critical' :
            load > 70 ? 'high' :
                load > 40 ? 'moderate' : 'low';

        return {
            currentLoad: Math.round(load),
            riskLevel,
            recommendation: this.getRecommendation(riskLevel),
            nextOptimalSession: this.calculateRecoveryTime(load)
        };
    }

    /**
     * simplified fatigue model:
     * Load = sum(duration * intensity) decayed by time passed
     */
    calculateAccumulatedFastigue(history) {
        let currentLoad = 0;
        const now = Date.now();

        // sort descending by date (newest first)
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

        // only look back 48 hours
        const cutoff = now - (48 * 60 * 60 * 1000);
        const recent = sorted.filter(s => new Date(s.date).getTime() > cutoff);

        for (const session of recent) {
            const sessionTime = new Date(session.date).getTime();
            const hoursAgo = (now - sessionTime) / (1000 * 60 * 60);

            // Calculate session load (duration in mins * intensity 1-10)
            const duration = session.duration / 60; // minutes
            const intensity = session.intensity || 5; // default medium intensity
            const sessionLoad = duration * intensity * 0.2; // scaling factor

            // Apply decay
            // Using a simple linear decay for this model, could use exponential
            const decayedLoad = Math.max(0, sessionLoad - (hoursAgo * this.FATIGUE_CONSTANTS.DECAY_RATE_PER_HOUR));

            currentLoad += decayedLoad;
        }

        return Math.min(100, currentLoad);
    }

    getRecommendation(riskLevel) {
        switch (riskLevel) {
            case 'critical':
                return "Complete vocal rest recommended for at least 24 hours.";
            case 'high':
                return "Keep sessions very short (<10 mins) and low intensity. Hydrate well.";
            case 'moderate':
                return "Proceed with caution. Avoid pushing range extremes today.";
            case 'low':
                return "You are fresh! profound opportunity for intense practice.";
            default:
                return "Listen to your body.";
        }
    }

    calculateRecoveryTime(currentLoad) {
        if (currentLoad < 20) return "Ready now";

        const hoursToRecover = (currentLoad - 20) / this.FATIGUE_CONSTANTS.DECAY_RATE_PER_HOUR;

        if (hoursToRecover <= 0) return "Ready now";

        const readyTime = new Date(Date.now() + hoursToRecover * 60 * 60 * 1000);
        return readyTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * suggest optimal session length based on user profile and current fatigue
     */
    getOptimalSessionLength(userProfile, currentFatigue = 0) {
        const experienceMap = {
            'beginner': 15, // minutes
            'intermediate': 30,
            'advanced': 45
        };

        const baseLength = experienceMap[userProfile.experienceLevel] || 20;

        // reduce recommended length if already fatigued
        const factor = Math.max(0, 1 - (currentFatigue / 100));

        return Math.round(baseLength * factor);
    }

    analyzeFatigueIndicators(metrics) {
        // real-time analysis of audio metrics for signs of fatigue
        // e.g., increasing jitter/shimmer, decreasing MPT (max phonation time)
        // this would be called during a live session

        const indicators = [];

        if (metrics.jitter > 1.5) indicators.push('High Jitter (instability)');
        if (metrics.shimmer > 5) indicators.push('High Shimmer (breathiness/strain)');

        return {
            showingFatigue: indicators.length > 0,
            indicators
        };
    }
}
