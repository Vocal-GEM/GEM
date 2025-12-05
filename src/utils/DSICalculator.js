/**
 * DSICalculator.js
 * 
 * Calculates the Dysphonia Severity Index (DSI), a multiparametric approach
 * to objectively quantify voice quality.
 * 
 * Formula: DSI = 0.13 * MPT + 0.0053 * F0_High - 0.26 * I_Low - 1.18 * Jitter + 12.4
 * 
 * Reference: Wuyts et al. (2000)
 */

export class DSICalculator {
    /**
     * Calculate DSI Score
     * @param {Object} params
     * @param {number} params.mpt - Maximum Phonation Time (seconds)
     * @param {number} params.f0High - Highest Frequency (Hz)
     * @param {number} params.iLow - Lowest Intensity (dB SPL)
     * @param {number} params.jitter - Jitter (%)
     * @returns {Object} { score: number, severity: string }
     */
    static calculate({ mpt, f0High, iLow, jitter }) {
        // Validate inputs to prevent NaN
        const _mpt = Math.max(0, mpt || 0);
        const _f0High = Math.max(0, f0High || 0);
        const _iLow = Math.max(0, iLow || 0);
        const _jitter = Math.max(0, jitter || 0);

        const dsi = (0.13 * _mpt) + (0.0053 * _f0High) - (0.26 * _iLow) - (1.18 * _jitter) + 12.4;

        // Interpret Score
        // +5 is perceptually normal
        // -5 is severely dysphonic
        let severity = 'Normal';
        if (dsi < 1.6) severity = 'Mild Dysphonia';
        if (dsi < -2.2) severity = 'Moderate Dysphonia';
        if (dsi < -5) severity = 'Severe Dysphonia';

        return {
            score: parseFloat(dsi.toFixed(2)),
            severity
        };
    }
}
