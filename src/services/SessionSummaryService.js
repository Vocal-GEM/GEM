/**
 * SessionSummaryService.js
 * 
 * Generates AI-style post-session summaries based on practice data.
 * Analyzes patterns, identifies achievements, and provides actionable next steps.
 */

import { getReports, saveReport } from './SessionReportService';
import { getStreakData } from './StreakService';
import { VoiceCalibrationService } from './VoiceCalibrationService';
import LiveCoachingService from './LiveCoachingService';

const STORAGE_KEY = 'gem_session_summaries';

/**
 * Generate a comprehensive post-session summary
 * @param {Object} sessionData - Data collected during the session
 * @returns {Object} Summary object with insights and recommendations
 */
export const generateSessionSummary = (sessionData) => {
    const {
        durationMs = 0,
        exercisesCompleted = [],
        metricsHistory = [],
        feedbackGiven = 0
    } = sessionData;

    const durationMinutes = Math.round(durationMs / 60000);

    // Analyze metrics trends
    const metricsAnalysis = analyzeMetrics(metricsHistory);

    // Generate achievements
    const achievements = generateAchievements(sessionData, metricsAnalysis);

    // Generate coaching insights
    const insights = generateInsights(metricsAnalysis);

    // Generate recommendations
    const recommendations = generateRecommendations(metricsAnalysis);

    // Calculate overall session score
    const sessionScore = calculateSessionScore(sessionData, metricsAnalysis);

    const summary = {
        id: `session-${Date.now()}`,
        createdAt: new Date().toISOString(),
        duration: durationMinutes,
        exercisesCount: exercisesCompleted.length,
        score: sessionScore,
        achievements,
        insights,
        recommendations,
        metrics: {
            avgPitch: metricsAnalysis.avgPitch,
            pitchStability: metricsAnalysis.pitchStability,
            avgResonance: metricsAnalysis.avgResonance,
            timeInTarget: metricsAnalysis.timeInTarget
        }
    };

    // Save summary
    saveSummary(summary);

    return summary;
};

/**
 * Analyze metrics history for patterns
 */
const analyzeMetrics = (metricsHistory) => {
    if (!metricsHistory || metricsHistory.length === 0) {
        return {
            avgPitch: 0,
            pitchStability: 0,
            avgResonance: 50,
            avgWeight: 50,
            timeInTarget: 0,
            trend: 'neutral'
        };
    }

    const pitches = metricsHistory.filter(m => m.pitch > 0).map(m => m.pitch);
    const resonances = metricsHistory.filter(m => m.resonance).map(m => m.resonance);
    const weights = metricsHistory.filter(m => m.weight).map(m => m.weight);

    const avgPitch = pitches.length > 0
        ? Math.round(pitches.reduce((a, b) => a + b, 0) / pitches.length)
        : 0;

    const avgResonance = resonances.length > 0
        ? Math.round(resonances.reduce((a, b) => a + b, 0) / resonances.length)
        : 50;

    const avgWeight = weights.length > 0
        ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length)
        : 50;

    // Calculate pitch stability (inverse of variance)
    let pitchStability = 100;
    if (pitches.length > 5) {
        const mean = avgPitch;
        const variance = pitches.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / pitches.length;
        pitchStability = Math.max(0, Math.round(100 - Math.sqrt(variance)));
    }

    // Estimate time in target (rough calculation)
    const targetMin = 160, targetMax = 260;
    const inTarget = pitches.filter(p => p >= targetMin && p <= targetMax);
    const timeInTarget = pitches.length > 0
        ? Math.round((inTarget.length / pitches.length) * 100)
        : 0;

    // Determine trend based on first half vs second half
    let trend = 'stable';
    if (pitches.length >= 10) {
        const half = Math.floor(pitches.length / 2);
        const firstHalfAvg = pitches.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const secondHalfAvg = pitches.slice(half).reduce((a, b) => a + b, 0) / (pitches.length - half);

        if (secondHalfAvg > firstHalfAvg + 5) trend = 'improving';
        else if (secondHalfAvg < firstHalfAvg - 5) trend = 'declining';
    }

    return {
        avgPitch,
        pitchStability,
        avgResonance,
        avgWeight,
        timeInTarget,
        trend
    };
};

/**
 * Generate session achievements
 */
const generateAchievements = (sessionData, analysis) => {
    const achievements = [];
    const { durationMs, exercisesCompleted = [] } = sessionData;
    const durationMinutes = Math.round(durationMs / 60000);

    if (durationMinutes >= 5) {
        achievements.push({ icon: '⏱️', text: `${durationMinutes} minutes of practice!` });
    }

    if (exercisesCompleted.length >= 3) {
        achievements.push({ icon: '🏋️', text: `Completed ${exercisesCompleted.length} exercises` });
    }

    if (analysis.timeInTarget >= 80) {
        achievements.push({ icon: '🎯', text: 'Great target accuracy!' });
    }

    if (analysis.pitchStability >= 80) {
        achievements.push({ icon: '📊', text: 'Excellent pitch stability!' });
    }

    if (analysis.avgResonance >= 60) {
        achievements.push({ icon: '✨', text: 'Strong forward resonance!' });
    }

    if (analysis.trend === 'improving') {
        achievements.push({ icon: '📈', text: 'You improved during the session!' });
    }

    // Always have at least one positive
    if (achievements.length === 0) {
        achievements.push({ icon: '💪', text: 'You showed up and practiced!' });
    }

    return achievements;
};

/**
 * Generate coaching insights based on session data
 */
const generateInsights = (analysis) => {
    const insights = [];

    if (analysis.avgPitch > 0) {
        const pitchRange = analysis.avgPitch < 160 ? 'lower' :
            analysis.avgPitch > 260 ? 'higher' : 'target';

        if (pitchRange === 'lower') {
            insights.push({
                area: 'Pitch',
                observation: `Your average pitch was ${analysis.avgPitch} Hz, which is on the lower side.`,
                suggestion: 'Try starting your next session with pitch glides to find your higher range.'
            });
        } else if (pitchRange === 'target') {
            insights.push({
                area: 'Pitch',
                observation: `Your average pitch of ${analysis.avgPitch} Hz is in a good range!`,
                suggestion: 'Focus on maintaining this consistently throughout sentences.'
            });
        }
    }

    if (analysis.pitchStability < 60) {
        insights.push({
            area: 'Consistency',
            observation: 'Your pitch varied quite a bit during the session.',
            suggestion: 'Try sustained vowel exercises to build muscle memory.'
        });
    }

    if (analysis.avgResonance < 45) {
        insights.push({
            area: 'Resonance',
            observation: 'Your resonance trended toward a darker placement.',
            suggestion: 'Practice "ng" humming to feel the forward resonance sensation.'
        });
    }

    if (analysis.avgWeight > 65) {
        insights.push({
            area: 'Vocal Weight',
            observation: 'Your voice had more weight/heaviness than ideal.',
            suggestion: 'Try lip trills or straw phonation to find a lighter, breathier quality.'
        });
    }

    return insights;
};

/**
 * Generate actionable recommendations
 */
const generateRecommendations = (analysis) => {
    const recommendations = [];

    // Priority based on metrics
    if (analysis.pitchStability < 70) {
        recommendations.push({
            priority: 'high',
            exercise: 'Sustained Vowel Hold',
            reason: 'Builds pitch muscle memory',
            duration: '3 minutes'
        });
    }

    if (analysis.avgResonance < 50) {
        recommendations.push({
            priority: 'high',
            exercise: 'Forward Focus Drill',
            reason: 'Develops forward placement',
            duration: '5 minutes'
        });
    }

    if (analysis.timeInTarget < 60) {
        recommendations.push({
            priority: 'medium',
            exercise: 'Pitch Glides',
            reason: 'Improves pitch accuracy',
            duration: '5 minutes'
        });
    }

    // Always recommend continued practice
    recommendations.push({
        priority: 'medium',
        exercise: 'Quick Voice Check',
        reason: 'Track progress over time',
        duration: '1 minute'
    });

    return recommendations.slice(0, 3); // Max 3 recommendations
};

/**
 * Calculate overall session score (0-100)
 */
const calculateSessionScore = (sessionData, analysis) => {
    let score = 50; // Base score

    // Duration bonus
    const minutes = Math.round(sessionData.durationMs / 60000);
    score += Math.min(15, minutes * 1.5);

    // Metrics bonuses
    if (analysis.timeInTarget >= 70) score += 15;
    else if (analysis.timeInTarget >= 50) score += 10;

    if (analysis.pitchStability >= 70) score += 10;
    if (analysis.avgResonance >= 55) score += 10;

    // Trend bonus
    if (analysis.trend === 'improving') score += 5;

    return Math.min(100, Math.round(score));
};

// Storage helpers
const saveSummary = (summary) => {
    try {
        const existing = getSummaries();
        existing.unshift(summary);
        // Keep last 30 summaries
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 30)));
    } catch (e) {
        console.error('Failed to save summary:', e);
    }
};

export const getSummaries = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

export const getLatestSummary = () => {
    const summaries = getSummaries();
    return summaries.length > 0 ? summaries[0] : null;
};

export default {
    generateSessionSummary,
    getSummaries,
    getLatestSummary
};
