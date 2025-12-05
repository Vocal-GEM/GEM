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

        // Filter for valid voiced frames (pitch > 0)
        const voicedFrames = history.filter(h => h.pitch > 50 && h.pitch < 1000);

        if (voicedFrames.length === 0) {
            return {
                minF0: 0,
                maxF0: 0,
                avgF0: 0,
                rangeST: 0,
                avgSPL: 0
            };
        }

        // Pitch Stats
        const pitches = voicedFrames.map(f => f.pitch);
        const minF0 = Math.min(...pitches);
        const maxF0 = Math.max(...pitches);
        const avgF0 = pitches.reduce((a, b) => a + b, 0) / pitches.length;

        // Semitone Range
        const rangeST = 12 * Math.log2(maxF0 / minF0);

        // Intensity Stats (SPL)
        // Assuming volume is 0-1 RMS. Converting to approx dB SPL.
        // This is relative, not calibrated absolute SPL, but useful for comparison.
        // 0.00002 is standard reference pressure, but here we just use a baseline.
        // Let's assume 1.0 RMS = ~90dB (loud singing) for a web mic context.
        const volumes = history.map(h => Math.max(0.0001, h.volume)); // Avoid log(0)
        const dbValues = volumes.map(v => 20 * Math.log10(v) + 90); // Normalize so 1.0 = 90dB
        const avgSPL = dbValues.reduce((a, b) => a + b, 0) / dbValues.length;

        return {
            minF0: Math.round(minF0),
            maxF0: Math.round(maxF0),
            avgF0: Math.round(avgF0),
            rangeST: parseFloat(rangeST.toFixed(1)),
            avgSPL: Math.round(avgSPL)
        };
    }
}
