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

        let minF0 = Infinity;
        let maxF0 = -Infinity;
        let sumF0 = 0;
        let voicedCount = 0;
        let sumSPL = 0;

        for (let i = 0; i < history.length; i++) {
            const h = history[i];

            // Pitch stats
            if (h.pitch > 50 && h.pitch < 1000) {
                if (h.pitch < minF0) minF0 = h.pitch;
                if (h.pitch > maxF0) maxF0 = h.pitch;
                sumF0 += h.pitch;
                voicedCount++;
            }

            // Intensity Stats (SPL)
            const vol = Math.max(0.0001, h.volume || 0); // Avoid log(0)
            const db = 20 * Math.log10(vol) + 90; // Normalize so 1.0 = 90dB
            sumSPL += db;
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
        const avgSPL = sumSPL / history.length;
        const rangeST = 12 * Math.log2(maxF0 / minF0);

        return {
            minF0: Math.round(minF0),
            maxF0: Math.round(maxF0),
            avgF0: Math.round(avgF0),
            rangeST: parseFloat(rangeST.toFixed(1)),
            avgSPL: Math.round(avgSPL)
        };
    }
}
