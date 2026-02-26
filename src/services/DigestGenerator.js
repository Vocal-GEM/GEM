/**
 * DigestGenerator.js
 * 
 * generates weekly summaries of user progress.
 * compiles statistics, highlights, and insights into a digestible format.
 */

import { TrendAnalyzer } from './TrendAnalyzer';

export class DigestGenerator {
    constructor() {
        this.trendAnalyzer = new TrendAnalyzer();
    }

    /**
     * generate a full weekly digest package
     * @param {string} userId 
     * @param {Object} weekData - collection of sessions and goals for the week
     * @returns {Object} digest object
     */
    generateWeeklyDigest(userId, weekData) {
        const { sessions, goals, previousWeekSessions } = weekData;

        return {
            period: this.getWeekLabel(new Date()),
            summary: this.generateSummary(sessions),
            highlights: this.extractHighlights(sessions, previousWeekSessions),
            challenges: this.identifyChallenges(sessions, goals),
            recommendations: this.generateRecommendations(sessions),
            comparison: this.compareToLastWeek(sessions, previousWeekSessions),
            streak: this.calculateStreak(sessions), // simplified, ideally comes from StreakService
            nextMilestone: this.getNextMilestone(sessions)
        };
    }

    getWeekLabel(date) {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay()); // Sunday
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }

    generateSummary(sessions) {
        const totalDuration = sessions.reduce((t, s) => t + (s.duration || 0), 0);

        // safe averages
        const validPitch = sessions.filter(s => s.avgPitch).map(s => s.avgPitch);
        const avgPitch = validPitch.length ? validPitch.reduce((a, b) => a + b, 0) / validPitch.length : 0;

        const validRes = sessions.filter(s => s.avgResonance).map(s => s.avgResonance);
        const avgResonance = validRes.length ? validRes.reduce((a, b) => a + b, 0) / validRes.length : 0;

        return {
            totalPracticeTimeSeconds: totalDuration,
            sessionsCompleted: sessions.length,
            averagePitch: Math.round(avgPitch),
            averageResonance: parseFloat(avgResonance.toFixed(2)),
            bestSessionDate: this.findBestSession(sessions)?.date,
            mostPracticedExercise: this.findMostPracticed(sessions)
        };
    }

    extractHighlights(sessions, prevSessions) {
        const highlights = [];

        if (sessions.length === 0) return highlights;

        // Check consistency
        const consistency = this.trendAnalyzer.analyzeConsistency(sessions);
        if (consistency > 80) {
            highlights.push({
                type: 'consistency',
                icon: '🎯',
                text: 'Super consistent practice this week!'
            });
        }

        // Check volume increase
        const currentVol = sessions.length;
        const prevVol = prevSessions ? prevSessions.length : 0;
        if (currentVol > prevVol + 2) {
            highlights.push({
                type: 'volume',
                icon: '🔥',
                text: `You did ${currentVol - prevVol} more sessions than last week!`
            });
        }

        // Personal bests (simplified logic)
        const maxPitch = Math.max(...sessions.map(s => s.maxPitch || 0));
        const prevMax = prevSessions ? Math.max(...prevSessions.map(s => s.maxPitch || 0)) : 0;
        if (maxPitch > prevMax && maxPitch > 0) {
            highlights.push({
                type: 'personal_best',
                icon: '🏆',
                text: `New highest pitch reached: ${Math.round(maxPitch)}Hz`
            });
        }

        return highlights;
    }

    identifyChallenges(sessions, goals) {
        const challenges = [];
        if (!goals) return challenges;

        // Check if missed targets consistently
        const missedPitch = sessions.filter(s => s.avgPitch && goals.targetPitchRange &&
            (s.avgPitch < goals.targetPitchRange.min || s.avgPitch > goals.targetPitchRange.max));

        if (missedPitch.length > sessions.length * 0.5) {
            challenges.push({
                type: 'pitch_accuracy',
                text: 'Pitch accuracy was a bit low this week.'
            });
        }

        return challenges;
    }

    generateRecommendations(sessions) {
        // Simple heuristic-based recommendations
        if (sessions.length < 3) {
            return ["Try to squeeze in one more short session next week."];
        }
        return ["Great consistency! Try adding 5 minutes to your warm-up."];
    }

    compareToLastWeek(current, previous) {
        const currAvg = current.reduce((a, s) => a + (s.avgPitch || 0), 0) / (current.length || 1);
        const prevAvg = previous && previous.length ? previous.reduce((a, s) => a + (s.avgPitch || 0), 0) / previous.length : 0;

        const change = prevAvg ? ((currAvg - prevAvg) / prevAvg) * 100 : 0;

        return {
            pitchChangePercent: parseFloat(change.toFixed(1)),
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
        };
    }

    calculateStreak(sessions) {
        // simplified
        return sessions.length > 0 ? sessions.length : 0;
    }

    getNextMilestone(sessions) {
        // mock milestone
        return {
            title: "100 Sessions Club",
            progress: 0.85,
            remaining: 15
        };
    }

    findBestSession(sessions) {
        // assume sessions have a qualityScore, or fallback
        return sessions.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))[0];
    }

    findMostPracticed(sessions) {
        const counts = {};
        sessions.forEach(s => {
            const type = s.exerciseType || 'Free Practice';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'None';
    }
}
