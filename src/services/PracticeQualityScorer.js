/**
 * PracticeQualityScorer.js
 * 
 * assesses the quality of practice sessions beyond simple metrics like duration.
 * considers focus, consistency, goal alignment, and improvement velocity.
 */

export class PracticeQualityScorer {
    /**
     * score a completed session
     * @param {Object} sessionData 
     * @param {Object} userGoals 
     * @returns {Object} quality analysis
     */
    scoreSession(sessionData, userGoals) {
        const effectiveness = this.calculateEffectiveness(sessionData, userGoals);
        const consistency = this.calculateConsistency(sessionData);
        const focus = this.calculateFocus(sessionData); // estimated from interaction patterns

        // weighted average for total score
        const totalScore = Math.round(
            (effectiveness * 0.5) +
            (consistency * 0.3) +
            (focus * 0.2)
        );

        return {
            qualityScore: totalScore, // 0-100
            components: {
                effectiveness,
                consistency,
                focus
            },
            feedback: this.generateFeedback(totalScore, effectiveness, consistency)
        };
    }

    calculateEffectiveness(session, goals) {
        // did the user hit their targets?
        if (!session.metrics) return 0;

        let score = 0;
        let checks = 0;

        // Pitch check
        if (goals.targetPitchRange) {
            checks++;
            const avgPitch = session.metrics.avgPitch;
            if (avgPitch >= goals.targetPitchRange.min && avgPitch <= goals.targetPitchRange.max) {
                score += 100;
            } else {
                // partial credit based on distance
                const center = (goals.targetPitchRange.min + goals.targetPitchRange.max) / 2;
                const dist = Math.abs(avgPitch - center);
                const maxDist = center * 0.5; // arbitrary falloff
                score += Math.max(0, 100 - (dist / maxDist) * 100);
            }
        }

        // Resonance check
        if (goals.targetResonance !== undefined && session.metrics.avgResonance !== undefined) {
            checks++;
            const dist = Math.abs(session.metrics.avgResonance - goals.targetResonance);
            score += Math.max(0, 100 * (1 - dist * 2)); // 0.5 diff = 0 score
        }

        if (checks === 0) return 50; // neutral if no measurable goals
        return Math.round(score / checks);
    }

    calculateConsistency(session) {
        // how stable were the metrics during the session?
        // low standard deviation = high consistency
        // we'll assume the session object might possess stdDev stats, or we calculate approximations

        // if we don't have detailed frame data, we might rely on a 'stability' metric computed elsewhere
        if (session.metrics && session.metrics.stability) {
            return session.metrics.stability * 100;
        }

        // fallback: simple assumption or randomized for mock
        return 75;
    }

    calculateFocus(session) {
        // check for interruptions, rapid switching of tools, etc.
        // simpler: intensity * duration check
        // if session < 2 mins, focus probably low. if > 10 mins, focus likely higher.

        const durationMins = (session.duration || 0) / 60;
        if (durationMins < 2) return 30;
        if (durationMins < 5) return 60;
        return 90;
    }

    generateFeedback(total, effectiveness, consistency) {
        if (total > 85) return "Outstanding session! High quality focus and execution.";
        if (total > 70) return "Good work. You stayed consistent and hit most targets.";
        if (effectiveness < 50) return "Try to focus more on hitting your pitch targets next time.";
        if (consistency < 50) return "You were a bit shaky today. Try to holder steadier tones.";
        return "Keep practicing. Consistency comes with time.";
    }

    identifyHighQualitySessions(history) {
        // return top 10% of sessions
        if (!history.length) return [];

        const scored = history.map(h => ({
            ...h,
            scores: this.scoreSession(h, h.goalsAtTime || {})
        }));

        return scored
            .sort((a, b) => b.scores.qualityScore - a.scores.qualityScore)
            .slice(0, Math.ceil(history.length * 0.1));
    }
}
