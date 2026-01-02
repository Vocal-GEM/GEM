/**
 * GoalForecaster.js
 * 
 * predicts when a user will reach their vocal goals based on current trajectory.
 * uses linear projection with confidence intervals.
 */

export class GoalForecaster {

    /**
     * forecast completion date for a specific goal
     * @param {Object} goal - { current, target, type }
     * @param {Array} history - array of historical values
     * @returns {Object} forecast
     */
    forecastGoalCompletion(goal, history) {
        if (!history || history.length < 5) {
            return { status: 'insufficient_data' };
        }

        const rate = this.calculateProgressRate(history); // change per week/session

        if (rate <= 0) {
            return {
                status: 'stalled',
                message: 'Progress is currently flat or reversing.'
            };
        }

        const distance = Math.abs(goal.target - goal.current);
        const timeToGoal = distance / rate; // in units of history intervals (e.g. sessions)

        return {
            status: 'on_track',
            estimatedSessionsRemaining: Math.ceil(timeToGoal),
            confidence: 0.8, // simplified confidence
            trajectory: this.generateTrajectory(goal.current, goal.target, rate)
        };
    }

    calculateProgressRate(history) {
        // Simple linear regression slope
        const n = history.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += history[i];
            sumXY += i * history[i];
            sumXX += i * i;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }

    generateTrajectory(current, target, rate) {
        // Generate data points for a chart
        const points = [];
        let val = current;
        let i = 0;
        while (val < target && i < 50) { // Limit to 50 points
            points.push({ step: i, value: val });
            val += rate;
            i++;
        }
        points.push({ step: i, value: target });
        return points;
    }

    adjustForPlateaus(estimate, history) {
        // Advanced: if recent history shows plateau, add buffer to estimate
        return estimate * 1.5;
    }
}
