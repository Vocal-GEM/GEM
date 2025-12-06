export class BiofeedbackService {
    /**
     * Calculates a score based on how close the current pitch is to the target.
     * @param {number} currentPitch - The detected pitch in Hz.
     * @param {number} targetPitch - The target pitch in Hz.
     * @param {number} tolerance - The acceptable deviation in semitones (default 0.5).
     * @returns {object} { score: 0-100, status: 'perfect'|'good'|'high'|'low' }
     */
    static calculatePitchScore(currentPitch, targetPitch, tolerance = 0.5) {
        if (!currentPitch || currentPitch <= 0) return { score: 0, status: 'no_input' };

        const currentSemi = 12 * Math.log2(currentPitch / 440) + 69;
        const targetSemi = 12 * Math.log2(targetPitch / 440) + 69;
        const diff = currentSemi - targetSemi;
        const absDiff = Math.abs(diff);

        let score = 0;
        let status = 'good';

        if (absDiff <= tolerance) {
            score = 100;
            status = 'perfect';
        } else if (absDiff <= tolerance * 2) {
            // Linear falloff from 100 to 50
            score = 100 - ((absDiff - tolerance) / tolerance) * 50;
            status = diff > 0 ? 'high' : 'low';
        } else {
            score = Math.max(0, 50 - ((absDiff - tolerance * 2) / tolerance) * 25);
            status = diff > 0 ? 'high' : 'low';
        }

        return { score: Math.round(score), status, diff };
    }

    /**
     * Compares a user's pitch curve against a target curve.
     * Assumes both curves are normalized in time (0 to 1).
     * @param {Array<{t: number, v: number}>} userCurve - User's pitch points.
     * @param {Array<{t: number, v: number}>} targetCurve - Target pitch points.
     * @returns {number} Score 0-100.
     */
    static calculateCurveScore(userCurve, targetCurve) {
        if (!userCurve || userCurve.length < 5) return 0;

        let totalError = 0;
        let matchCount = 0;

        // For each point in user curve, find closest point in target curve by time
        for (const uPoint of userCurve) {
            // Find target point with closest 't'
            // Since targetCurve is likely sorted by 't', we can optimize, but simple find is ok for small arrays
            const tPoint = targetCurve.reduce((prev, curr) =>
                Math.abs(curr.t - uPoint.t) < Math.abs(prev.t - uPoint.t) ? curr : prev
            );

            if (tPoint) {
                // Calculate difference in normalized pitch value (v)
                const error = Math.abs(uPoint.v - tPoint.v);
                totalError += error;
                matchCount++;
            }
        }

        if (matchCount === 0) return 0;

        const avgError = totalError / matchCount;
        // Map average error to score. 
        // If avgError is 0, score 100. 
        // If avgError is 0.2 (20% deviation), score might be 50.
        const score = Math.max(0, 100 - (avgError * 400));
        return Math.round(score);
    }
}
