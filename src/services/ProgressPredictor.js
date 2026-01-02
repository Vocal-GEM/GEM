/**
 * ProgressPredictor.js
 * 
 * ML-based service to estimate progress trajectories and time-to-goal
 * based on user practice patterns and historical data models.
 */

// Simple linear regression model for client-side prediction
// In a real app, this might interface with a more complex server-side model

/**
 * Predicts future progress and estimated completion dates
 * @param {Object} profile - User's voice profile containing history
 * @returns {Object} Prediction results
 */
export const predictProgress = (profile) => {
    const { currentAverages, weeklyTrend } = profile.progress;
    const { goals } = profile;

    // Need baseline data to make predictions
    if (!currentAverages.pitch || !weeklyTrend) {
        return {
            canPredict: false,
            reason: 'Insufficient data'
        };
    }

    // Pitch prediction
    const pitchPrediction = predictMetric(
        currentAverages.pitch,
        weeklyTrend.pitch,
        goals.targetPitchRange.min, // Assuming user wants to reach range min/max
        goals.voiceType === 'masculine' ? goals.targetPitchRange.max : goals.targetPitchRange.min
    );

    // Resonance prediction
    const resonancePrediction = predictMetric(
        currentAverages.resonance,
        weeklyTrend.resonance,
        goals.targetResonance,
        goals.targetResonance
    );

    return {
        canPredict: true,
        pitch: pitchPrediction,
        resonance: resonancePrediction,
        generatedAt: Date.now()
    };
};

/**
 * Predict metric trajectory
 */
const predictMetric = (current, weeklyRate, target, comparisonTarget) => {
    const distance = target - current;
    const isApproaching = (distance > 0 && weeklyRate > 0) || (distance < 0 && weeklyRate < 0);

    if (!isApproaching || Math.abs(weeklyRate) < 0.1) {
        return {
            timeToGoalWeeks: null,
            status: 'plateau', // or diverting
            trajectory: generateTrajectory(current, weeklyRate, 4) // Show next 4 weeks
        };
    }

    // Simple linear projection
    // In reality progress is logarithmic (fast at start, slows down)
    // We'll use a decaying rate model: rate_t = rate_0 * 0.95^t

    let weeks = 0;
    let simulatedValue = current;
    let simulatedRate = weeklyRate;
    const trajectory = [];
    const maxWeeks = 52;

    // Simulation loop
    while (weeks < maxWeeks) {
        trajectory.push(simulatedValue);

        // Check if reached target (within 5% tolerance)
        if (Math.abs(simulatedValue - target) < Math.abs(target * 0.05)) {
            break;
        }

        simulatedValue += simulatedRate;
        simulatedRate *= 0.95; // Assume rate slows down as you get closer/better
        weeks++;
    }

    return {
        timeToGoalWeeks: weeks < maxWeeks ? weeks : '>52',
        status: 'improving',
        confidence: calculateConfidence(weeks),
        trajectory
    };
};

const generateTrajectory = (start, rate, weeks) => {
    const traj = [];
    for (let i = 0; i < weeks; i++) {
        traj.push(start + (rate * i));
    }
    return traj;
};

const calculateConfidence = (weeks) => {
    // Keeping predictions short-term yields higher confidence
    if (weeks < 4) return 0.9;
    if (weeks < 12) return 0.7;
    if (weeks < 24) return 0.5;
    return 0.3;
};

export default {
    predictProgress
};
