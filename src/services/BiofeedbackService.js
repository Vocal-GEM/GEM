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

    /**
     * Calculates a score for how close the current F2 (second formant) is to the target.
     * Research: F2 is critical for gender perception and vowel quality.
     * @param {number} currentF2 - The detected F2 in Hz.
     * @param {number} targetF2 - The target F2 in Hz.
     * @param {number} tolerance - The acceptable deviation in Hz (default 150).
     * @returns {object} { score: 0-100, status: 'perfect'|'good'|'high'|'low', diff }
     */
    static calculateF2Score(currentF2, targetF2, tolerance = 150) {
        if (!currentF2 || currentF2 <= 0) return { score: 0, status: 'no_input', diff: 0 };
        if (!targetF2 || targetF2 <= 0) return { score: 0, status: 'no_target', diff: 0 };

        const diff = currentF2 - targetF2;
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

        return { score: Math.round(score), status, diff: Math.round(diff) };
    }

    /**
     * Calculates a score for how close the current vocal weight is to the target.
     * Research: Vocal weight (H1-H2) is critical for voice quality control.
     * Useful for teaching breathy vs pressed phonation.
     * @param {number} currentWeight - The detected vocal weight (0-100 or H1-H2 in dB).
     * @param {number} targetWeight - The target vocal weight (0-100 or H1-H2 in dB).
     * @param {number} tolerance - The acceptable deviation (default 15 for 0-100 scale, or 1.5 dB for H1-H2).
     * @param {string} scale - 'weight' (0-100) or 'h1h2' (dB)
     * @returns {object} { score: 0-100, status: 'perfect'|'good'|'heavy'|'light', diff }
     */
    static calculateVocalWeightScore(currentWeight, targetWeight, tolerance = 15, scale = 'weight') {
        if (currentWeight === undefined || currentWeight === null) {
            return { score: 0, status: 'no_input', diff: 0 };
        }
        if (targetWeight === undefined || targetWeight === null) {
            return { score: 0, status: 'no_target', diff: 0 };
        }

        // Auto-detect scale if not specified
        if (scale === 'auto') {
            // H1-H2 is typically -5 to +12 dB, weight is 0-100
            scale = Math.abs(currentWeight) < 20 && Math.abs(targetWeight) < 20 ? 'h1h2' : 'weight';
        }

        const diff = currentWeight - targetWeight;
        const absDiff = Math.abs(diff);

        let score = 0;
        let status = 'good';

        if (absDiff <= tolerance) {
            score = 100;
            status = 'perfect';
        } else if (absDiff <= tolerance * 2) {
            // Linear falloff from 100 to 50
            score = 100 - ((absDiff - tolerance) / tolerance) * 50;
            status = diff > 0 ? 'light' : 'heavy'; // Positive = lighter/breathier
        } else {
            score = Math.max(0, 50 - ((absDiff - tolerance * 2) / tolerance) * 25);
            status = diff > 0 ? 'light' : 'heavy';
        }

        return {
            score: Math.round(score),
            status,
            diff: parseFloat(diff.toFixed(2))
        };
    }

    /**
     * Calculates a multi-dimensional score considering pitch, F2, and vocal weight together.
     * Useful for comprehensive voice training feedback.
     * @param {Object} current - Current voice parameters { pitch, f2, vocalWeight }
     * @param {Object} target - Target voice parameters { pitch, f2, vocalWeight }
     * @param {Object} weights - Importance weights { pitch: 0-1, f2: 0-1, vocalWeight: 0-1 } (default equal)
     * @returns {object} { totalScore: 0-100, breakdown: {pitch, f2, vocalWeight}, status }
     */
    static calculateMultiDimensionalScore(current, target, weights = { pitch: 0.33, f2: 0.33, vocalWeight: 0.34 }) {
        const breakdown = {};
        let weightedSum = 0;
        let totalWeight = 0;

        // Pitch scoring
        if (current.pitch && target.pitch) {
            const pitchResult = this.calculatePitchScore(current.pitch, target.pitch);
            breakdown.pitch = pitchResult;
            weightedSum += pitchResult.score * weights.pitch;
            totalWeight += weights.pitch;
        }

        // F2 scoring
        if (current.f2 && target.f2) {
            const f2Result = this.calculateF2Score(current.f2, target.f2);
            breakdown.f2 = f2Result;
            weightedSum += f2Result.score * weights.f2;
            totalWeight += weights.f2;
        }

        // Vocal weight scoring
        if (current.vocalWeight !== undefined && target.vocalWeight !== undefined) {
            const weightResult = this.calculateVocalWeightScore(current.vocalWeight, target.vocalWeight);
            breakdown.vocalWeight = weightResult;
            weightedSum += weightResult.score * weights.vocalWeight;
            totalWeight += weights.vocalWeight;
        }

        const totalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

        // Overall status based on total score
        let status = 'needs_work';
        if (totalScore >= 95) status = 'excellent';
        else if (totalScore >= 80) status = 'good';
        else if (totalScore >= 60) status = 'fair';

        return {
            totalScore,
            breakdown,
            status
        };
    }
}
