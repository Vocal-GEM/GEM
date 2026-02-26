/**
 * coachHistory.js
 * 
 * Utility for tracking coach feedback history and analyzing progress trends.
 * Integrates with historyService to store and retrieve coach assessments.
 */

import { historyService } from './historyService';

export const coachHistory = {
    /**
     * Save coach feedback to history
     * @param {Object} feedback - Coach feedback object
     * @param {Object} sessionData - Associated session data
     */
    saveFeedback: async (feedback, sessionData) => {
        try {
            // Store feedback metadata with the session
            const sessionWithFeedback = {
                ...sessionData,
                coachFeedback: {
                    summary: feedback.summary,
                    focusArea: feedback.focusArea.title,
                    priority: feedback.focusArea.priority,
                    scores: {
                        pitch: feedback.details.pitch.score,
                        resonance: feedback.details.resonance.score,
                        stability: feedback.details.stability.score,
                        voiceQuality: feedback.details.voiceQuality.score
                    },
                    timestamp: Date.now()
                }
            };

            await historyService.saveSession(sessionWithFeedback);
            return true;
        } catch (error) {
            console.error('Failed to save coach feedback:', error);
            return false;
        }
    },

    /**
     * Get recent feedback history
     * @param {number} limit - Number of recent sessions to retrieve
     * @returns {Array} Array of feedback objects
     */
    getRecentFeedback: async (limit = 10) => {
        try {
            const sessions = await historyService.getAllSessions();
            return sessions
                .filter(s => s.coachFeedback)
                .slice(0, limit)
                .map(s => s.coachFeedback);
        } catch (error) {
            console.error('Failed to get recent feedback:', error);
            return [];
        }
    },

    /**
     * Calculate progress trends from feedback history
     * @param {number} sessionCount - Number of sessions to analyze
     * @returns {Object} Trend analysis
     */
    analyzeTrends: async (sessionCount = 5) => {
        try {
            const recentFeedback = await coachHistory.getRecentFeedback(sessionCount);

            if (recentFeedback.length < 2) {
                return {
                    hasEnoughData: false,
                    message: "Record more sessions to see progress trends"
                };
            }

            // Calculate average scores for each metric
            const metrics = ['pitch', 'resonance', 'stability', 'voiceQuality'];
            const trends = {};

            metrics.forEach(metric => {
                const scores = recentFeedback.map(f => f.scores[metric]).filter(s => s > 0);
                if (scores.length >= 2) {
                    const recent = scores.slice(0, Math.ceil(scores.length / 2));
                    const older = scores.slice(Math.ceil(scores.length / 2));

                    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

                    const change = recentAvg - olderAvg;
                    const percentChange = (change / olderAvg) * 100;

                    trends[metric] = {
                        current: recentAvg,
                        previous: olderAvg,
                        change: change,
                        percentChange: percentChange,
                        trend: change > 0.5 ? 'improving' : (change < -0.5 ? 'declining' : 'stable')
                    };
                }
            });

            // Identify most improved and needs work
            const sortedByImprovement = Object.entries(trends)
                .sort((a, b) => b[1].change - a[1].change);

            return {
                hasEnoughData: true,
                trends,
                mostImproved: sortedByImprovement[0] ? sortedByImprovement[0][0] : null,
                needsWork: sortedByImprovement[sortedByImprovement.length - 1] ?
                    sortedByImprovement[sortedByImprovement.length - 1][0] : null,
                overallTrend: calculateOverallTrend(trends)
            };
        } catch (error) {
            console.error('Failed to analyze trends:', error);
            return { hasEnoughData: false, error: error.message };
        }
    },

    /**
     * Compare current session with previous session
     * @param {Object} currentFeedback - Current session feedback
     * @returns {Object} Comparison results
     */
    compareWithPrevious: async (currentFeedback) => {
        try {
            const recentFeedback = await coachHistory.getRecentFeedback(2);

            if (recentFeedback.length < 2) {
                return {
                    hasComparison: false,
                    message: "No previous session to compare with"
                };
            }

            const previous = recentFeedback[1]; // Second most recent
            const current = currentFeedback;

            const comparisons = {};
            const metrics = ['pitch', 'resonance', 'stability', 'voiceQuality'];

            metrics.forEach(metric => {
                const currentScore = current.details[metric].score;
                const previousScore = previous.scores[metric];
                const diff = currentScore - previousScore;

                comparisons[metric] = {
                    current: currentScore,
                    previous: previousScore,
                    change: diff,
                    improved: diff > 0
                };
            });

            const improvementCount = Object.values(comparisons).filter(c => c.improved).length;
            const overallImprovement = improvementCount > metrics.length / 2;

            return {
                hasComparison: true,
                comparisons,
                overallImprovement,
                improvementCount,
                message: overallImprovement ?
                    "Great progress! You've improved in multiple areas." :
                    "Keep practicing! Consistency is key to improvement."
            };
        } catch (error) {
            console.error('Failed to compare with previous:', error);
            return { hasComparison: false, error: error.message };
        }
    }
};

// Helper function to calculate overall trend
const calculateOverallTrend = (trends) => {
    const trendValues = Object.values(trends);
    if (trendValues.length === 0) return 'unknown';

    const improvingCount = trendValues.filter(t => t.trend === 'improving').length;
    const decliningCount = trendValues.filter(t => t.trend === 'declining').length;

    if (improvingCount > decliningCount) return 'improving';
    if (decliningCount > improvingCount) return 'declining';
    return 'stable';
};
