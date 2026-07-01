/**
 * SessionAnalyzer.js
 * 
 * Utility for calculating statistical metrics from a session's audio data history.
 */

export class SessionAnalyzer {
    /**
     * Calculate statistics from an array of pitch/volume data points.
     * @param {Array} history - Array of objects { pitch, volume, timestamp } or similar
     * @returns {Object} Stats object { minF0, maxF0, avgF0, rangeST, avgSPL }
     */
    static analyze(history) {
        if (!history || history.length === 0) return null;

        let voicedCount = 0;
        let sumF0 = 0;
        let minF0 = Infinity;
        let maxF0 = -Infinity;
        let sumSPL = 0;

        for (let i = 0; i < history.length; i++) {
            const h = history[i];

            // Pitch Stats
            if (h.pitch > 50 && h.pitch < 1000) {
                voicedCount++;
                sumF0 += h.pitch;
                if (h.pitch < minF0) minF0 = h.pitch;
                if (h.pitch > maxF0) maxF0 = h.pitch;
            }

            // Intensity Stats (SPL)
            // Assuming volume is 0-1 RMS. Converting to approx dB SPL.
            // This is relative, not calibrated absolute SPL, but useful for comparison.
            // 0.00002 is standard reference pressure, but here we just use a baseline.
            // Let's assume 1.0 RMS = ~90dB (loud singing) for a web mic context.
            const vol = Math.max(0.0001, h.volume);
            sumSPL += 20 * Math.log10(vol) + 90;
        }

        if (voicedCount === 0) {
            return {
                minF0: 0,
                maxF0: 0,
                avgF0: 0,
                rangeST: 0,
                avgSPL: 0
            };
        }

        const avgF0 = sumF0 / voicedCount;
        const rangeST = 12 * Math.log2(maxF0 / minF0);
        const avgSPL = sumSPL / history.length;

        return {
            minF0: Math.round(minF0),
            maxF0: Math.round(maxF0),
            avgF0: Math.round(avgF0),
            rangeST: parseFloat(rangeST.toFixed(1)),
            avgSPL: Math.round(avgSPL)
        };
    }
}
