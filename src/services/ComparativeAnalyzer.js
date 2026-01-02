/**
 * ComparativeAnalyzer.js
 * 
 * compares user stats against anonymized aggregate data.
 * allows users to see where they stand relative to 'average' or specific cohorts.
 */

export class ComparativeAnalyzer {

    constructor() {
        // In a real app, this would fetch from an aggregated backend endpoint
        this.mockAggregateData = {
            pitch: { mean: 180, stdDev: 30 },
            resonance: { mean: 0.6, stdDev: 0.15 },
            practiceCount: { mean: 12, stdDev: 5 } // sessions per month
        };
    }

    /**
     * compare user metric to the population
     * @param {string} metricName 
     * @param {number} userValue 
     * @returns {Object} comparison
     */
    compareToAverage(metricName, userValue) {
        const stats = this.mockAggregateData[metricName];
        if (!stats) return null;

        const zScore = (userValue - stats.mean) / stats.stdDev;
        const percentile = this.calculatePercentile(zScore);
        const diffPercent = ((userValue - stats.mean) / stats.mean) * 100;

        return {
            metric: metricName,
            userValue,
            averageValue: stats.mean,
            percentile: Math.round(percentile),
            differencePercent: Math.round(diffPercent),
            analysis: this.getAnalysisText(metricName, diffPercent)
        };
    }

    // Approximation of standard normal CDF
    calculatePercentile(z) {
        // constants for estimation
        const p = 0.2316419;
        const b1 = 0.319381530;
        const b2 = -0.356563782;
        const b3 = 1.781477937;
        const b4 = -1.821255978;
        const b5 = 1.330274429;

        const t = 1 / (1 + p * Math.abs(z));
        const t2 = t * t;
        const t3 = t2 * t;
        const t4 = t3 * t;
        const t5 = t4 * t;

        const cdf = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) *
            (b1 * t + b2 * t2 + b3 * t3 + b4 * t4 + b5 * t5);

        return (z >= 0 ? cdf : 1 - cdf) * 100;
    }

    getAnalysisText(metric, diff) {
        if (Math.abs(diff) < 10) return "You are right around average for this metric.";
        if (diff > 0) return `You are ${diff.toFixed(0)}% higher than the community average.`;
        return `You are ${Math.abs(diff).toFixed(0)}% lower than the community average.`;
    }
}
