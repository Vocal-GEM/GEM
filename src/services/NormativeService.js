/**
 * Normative Service
 * Provides population norms for voice metrics based on demographics.
 * Uses local fallbacks when backend is unreachable.
 */

import { getLanguageConfig } from '../utils/languageAcoustics';

export class NormativeService {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get normative range for a metric
     * @param {string} metric - 'pitch', 'f1', 'f2', 'jitter', 'shimmer'
     * @param {Object} demographics - { age, gender, language }
     * @returns {Promise<Object>} Range { min, max, mean, percentile_10, percentile_90 }
     */
    async getNormativeRange(metric, demographics) {
        const cacheKey = `${metric}-${JSON.stringify(demographics)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // TODO: Replace with actual backend call
            // const response = await fetch(`/api/norms?metric=${metric}&...`);
            // const data = await response.json();

            const data = this.getMockNorms(metric, demographics);
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Failed to fetch norms:', error);
            return this.getMockNorms(metric, demographics); // Fallback
        }
    }

    /**
     * Calculate percentile for a user's value
     * @param {number} value - User's measured value
     * @param {string} metric - Metric name
     * @param {Object} demographics - User demographics
     * @returns {Promise<number>} Percentile (0-100)
     */
    async calculatePercentile(value, metric, demographics) {
        const norms = await this.getNormativeRange(metric, demographics);

        // Assume normal distribution for simplicity if no detailed percentiles
        if (!norms.std_dev) {
            return 50; // Fallback
        }

        const zScore = (value - norms.mean) / norms.std_dev;
        return this.zScoreToPercentile(zScore);
    }

    zScoreToPercentile(z) {
        // Approximation of CDF for standard normal distribution
        if (z < -6.5) return 0;
        if (z > 6.5) return 100;

        let factK = 1;
        let sum = 0;
        let term = 1;
        let k = 0;
        let loopStop = Math.exp(-23);

        while (Math.abs(term) > loopStop) {
            term = .3989422804 * Math.pow(-1, k) * Math.pow(z, 2 * k + 1) / (2 * k + 1) / Math.pow(2, k) / factK;
            sum += term;
            k++;
            factK *= k;
        }

        sum += 0.5;
        return Math.round(sum * 100);
    }

    getMockNorms(metric, { gender = 'cis_female', language = 'en' }) {
        const langConfig = getLanguageConfig(language);

        // Pitch norms
        if (metric === 'pitch') {
            let range;
            if (gender.includes('female')) range = langConfig.pitchRange.feminine;
            else if (gender.includes('male')) range = langConfig.pitchRange.masculine;
            else range = langConfig.pitchRange.androgynous;

            const stdDev = (range.max - range.min) / 4; // Approx

            return {
                mean: range.mean,
                std_dev: stdDev,
                min: range.min,
                max: range.max,
                percentile_10: range.mean - 1.28 * stdDev,
                percentile_90: range.mean + 1.28 * stdDev
            };
        }

        // Default fallback
        return { mean: 0, std_dev: 1 };
    }
}

export const normativeService = new NormativeService();
export default normativeService;
