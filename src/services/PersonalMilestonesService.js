/**
 * PersonalMilestonesService.js
 * 
 * Generates and tracks personal milestones based on the user's starting point
 * (baseline) rather than generic global targets.
 */

/**
 * Generate milestones appropriate for the user's profile
 * @param {Object} profile - User voice profile
 * @returns {Array} List of milestone objects
 */
export const generateMilestones = (profile) => {
    const { baseline, goals } = profile;
    const milestones = [];

    // PITCH MILESTONES
    if (baseline.pitchRange.habitual && goals.targetPitchRange.min) {
        const start = baseline.pitchRange.habitual;
        const target = (goals.targetPitchRange.min + goals.targetPitchRange.max) / 2;
        const diff = target - start;
        const direction = diff > 0 ? 'Raise' : 'Lower';

        // 10Hz increments
        const step = 10 * Math.sign(diff);
        const steps = Math.floor(Math.abs(diff) / 10);

        for (let i = 1; i <= steps; i++) {
            const value = start + (step * i);
            milestones.push({
                id: `pitch_${Math.round(value)}`,
                category: 'pitch',
                title: `${direction} Pitch to ${Math.round(value)} Hz`,
                targetValue: value,
                condition: (metrics) => {
                    if (direction === 'Raise') return metrics.avgPitch >= value;
                    return metrics.avgPitch <= value;
                },
                reward: '🏆',
                description: `Sustain an average pitch of ${Math.round(value)} Hz for a full session.`
            });
        }
    }

    // RESONANCE MILESTONES
    if (baseline.resonanceRange.habitual !== null) {
        const start = baseline.resonanceRange.habitual;
        const target = goals.targetResonance;

        // Only if significnat difference
        if (Math.abs(target - start) > 0.1) {
            milestones.push({
                id: 'res_first_step',
                category: 'resonance',
                title: 'First Resonance Shift',
                targetValue: start + (target - start) * 0.25,
                condition: (metrics) => {
                    const progress = Math.abs(metrics.avgResonance - start) / Math.abs(target - start);
                    return progress >= 0.25;
                },
                reward: '🌟'
            });

            milestones.push({
                id: 'res_halfway',
                category: 'resonance',
                title: 'Halfway to Resonance Goal',
                targetValue: start + (target - start) * 0.5,
                condition: (metrics) => {
                    const progress = Math.abs(metrics.avgResonance - start) / Math.abs(target - start);
                    return progress >= 0.5;
                },
                reward: '🌟🌟'
            });
        }
    }

    // CONSISTENCY MILESTONES
    milestones.push({
        id: 'streak_3',
        category: 'consistency',
        title: '3-Day Streak',
        condition: (metrics) => metrics.streak >= 3,
        reward: '🔥'
    });

    milestones.push({
        id: 'streak_7',
        category: 'consistency',
        title: 'Variables Week',
        condition: (metrics) => metrics.streak >= 7,
        reward: '🔥🔥'
    });

    return milestones;
};

/**
 * Check for newly unlocked milestones
 * @param {Array} currentMilestones - List of milestone definitions
 * @param {Array} completedIds - List of already completed milestone IDs
 * @param {Object} metrics - Current session metrics
 * @returns {Array} List of newly completed milestones
 */
export const checkMilestones = (currentMilestones, completedIds, metrics) => {
    const newUnlocks = [];

    currentMilestones.forEach(ms => {
        if (completedIds.includes(ms.id)) return;

        if (ms.condition(metrics)) {
            newUnlocks.push(ms);
        }
    });

    return newUnlocks;
};

export default {
    generateMilestones,
    checkMilestones
};
