/**
 * Pitch Ensemble - Multi-Algorithm Consensus Voting
 * 
 * Combines multiple pitch detection algorithms (YIN, Autocorrelation, McLeod)
 * to produce more accurate and reliable pitch estimates through consensus voting.
 * 
 * @module pitchEnsemble
 */

import { detectPitchYIN } from './pitchYIN.js';
import { detectPitchAutocorr } from './pitchAutocorr.js';
import { detectPitchMcLeod } from './pitchMcLeod.js';

/**
 * Detect pitch using ensemble of algorithms with consensus voting
 * @param {Float32Array} buffer - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {Object} options - Configuration options
 * @param {number} options.minFreq - Minimum frequency (default 50 Hz)
 * @param {number} options.maxFreq - Maximum frequency (default 800 Hz)
 * @param {number} options.tolerance - Consensus tolerance as fraction (default 0.05 = 5%)
 * @param {boolean} options.useYIN - Enable YIN algorithm (default true)
 * @param {boolean} options.useAutocorr - Enable Autocorrelation (default true)
 * @param {boolean} options.useMcLeod - Enable McLeod (default true)
 * @returns {Object} { pitch, confidence, algorithms, details }
 */
export function detectPitchEnsemble(buffer, sampleRate, options = {}) {
    const {
        minFreq = 50,
        maxFreq = 800,
        tolerance = 0.05,
        useYIN = true,
        useAutocorr = true,
        useMcLeod = true
    } = options;

    if (!buffer || buffer.length === 0) {
        return {
            pitch: null,
            confidence: 0,
            algorithms: [],
            details: []
        };
    }

    // Run all enabled algorithms
    const results = [];

    if (useYIN) {
        const yinResult = detectPitchYIN(buffer, sampleRate);
        if (yinResult.pitch !== null) {
            results.push({
                algorithm: 'yin',
                pitch: yinResult.pitch,
                confidence: yinResult.confidence
            });
        }
    }

    if (useAutocorr) {
        const autocorrResult = detectPitchAutocorr(buffer, sampleRate, minFreq, maxFreq);
        if (autocorrResult.pitch !== null) {
            results.push({
                algorithm: 'autocorr',
                pitch: autocorrResult.pitch,
                confidence: autocorrResult.confidence
            });
        }
    }

    if (useMcLeod) {
        const mcleodResult = detectPitchMcLeod(buffer, sampleRate, minFreq, maxFreq);
        if (mcleodResult.pitch !== null) {
            results.push({
                algorithm: 'mcleod',
                pitch: mcleodResult.pitch,
                confidence: mcleodResult.confidence
            });
        }
    }

    // No algorithms returned valid results
    if (results.length === 0) {
        return {
            pitch: null,
            confidence: 0,
            algorithms: [],
            details: []
        };
    }

    // Single algorithm result - return it directly
    if (results.length === 1) {
        return {
            pitch: results[0].pitch,
            confidence: results[0].confidence,
            algorithms: [results[0].algorithm],
            details: results
        };
    }

    // Multiple algorithms - find consensus cluster
    const cluster = findConsensusCluster(results, tolerance);

    if (cluster.length === 0) {
        // No consensus - return the most confident result
        results.sort((a, b) => b.confidence - a.confidence);
        return {
            pitch: results[0].pitch,
            confidence: results[0].confidence * 0.7, // Reduce confidence due to disagreement
            algorithms: [results[0].algorithm],
            details: results,
            warning: 'No consensus between algorithms'
        };
    }

    // Calculate weighted average of agreeing algorithms
    const totalConfidence = cluster.reduce((sum, r) => sum + r.confidence, 0);
    const weightedPitch = cluster.reduce((sum, r) => sum + r.pitch * r.confidence, 0) / totalConfidence;

    // Consensus confidence is the average confidence of agreeing algorithms
    // multiplied by the fraction of algorithms that agree
    const consensusConfidence = (totalConfidence / cluster.length) * (cluster.length / results.length);

    return {
        pitch: weightedPitch,
        confidence: Math.min(1, consensusConfidence),
        algorithms: cluster.map(r => r.algorithm),
        details: results,
        clusterSize: cluster.length,
        totalAlgorithms: results.length
    };
}

/**
 * Find the largest cluster of agreeing pitch estimates
 * @param {Array} results - Array of { algorithm, pitch, confidence } objects
 * @param {number} tolerance - Tolerance as fraction (e.g., 0.05 = 5%)
 * @returns {Array} Largest cluster of agreeing results
 */
function findConsensusCluster(results, tolerance) {
    let bestCluster = [];

    for (const result of results) {
        // Find all results that agree with this one
        const cluster = results.filter(r => {
            const ratio = Math.abs(r.pitch - result.pitch) / result.pitch;
            return ratio < tolerance;
        });

        // Keep track of the largest cluster
        if (cluster.length > bestCluster.length) {
            bestCluster = cluster;
        }
    }

    return bestCluster;
}

/**
 * Batch process multiple frames with ensemble detection
 * @param {Float32Array} buffer - Audio data
 * @param {number} sampleRate - Sample rate in Hz
 * @param {number} frameSize - Size of each frame
 * @param {number} hopSize - Hop size between frames
 * @param {Object} options - Ensemble options
 * @returns {Array} Array of ensemble results with time stamps
 */
export function detectPitchEnsembleBatch(buffer, sampleRate, frameSize = 2048, hopSize = 512, options = {}) {
    const results = [];

    for (let i = 0; i + frameSize <= buffer.length; i += hopSize) {
        const frame = buffer.slice(i, i + frameSize);
        const result = detectPitchEnsemble(frame, sampleRate, options);
        results.push({
            ...result,
            time: i / sampleRate
        });
    }

    return results;
}

/**
 * Get statistics about ensemble performance
 * @param {Array} batchResults - Results from detectPitchEnsembleBatch
 * @returns {Object} Statistics about algorithm agreement
 */
export function getEnsembleStats(batchResults) {
    const stats = {
        totalFrames: batchResults.length,
        framesWithPitch: 0,
        fullConsensus: 0,
        partialConsensus: 0,
        noConsensus: 0,
        averageConfidence: 0,
        algorithmUsage: {
            yin: 0,
            autocorr: 0,
            mcleod: 0
        }
    };

    let confidenceSum = 0;

    for (const result of batchResults) {
        if (result.pitch !== null) {
            stats.framesWithPitch++;
            confidenceSum += result.confidence;

            const numAlgorithms = result.totalAlgorithms || result.algorithms.length;
            const numAgreeing = result.clusterSize || result.algorithms.length;

            if (numAgreeing === numAlgorithms && numAlgorithms > 1) {
                stats.fullConsensus++;
            } else if (numAgreeing > 1) {
                stats.partialConsensus++;
            } else {
                stats.noConsensus++;
            }

            // Count algorithm usage
            for (const algo of result.algorithms) {
                if (stats.algorithmUsage[algo] !== undefined) {
                    stats.algorithmUsage[algo]++;
                }
            }
        }
    }

    stats.averageConfidence = stats.framesWithPitch > 0
        ? confidenceSum / stats.framesWithPitch
        : 0;

    return stats;
}

export default {
    detectPitchEnsemble,
    detectPitchEnsembleBatch,
    getEnsembleStats
};
