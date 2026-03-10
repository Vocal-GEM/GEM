
/**
 * WaveformService - Efficient audio waveform generation
 *
 * Features:
 * - Singleton AudioContext to prevent resource exhaustion
 * - Concurrency control (queue) to prevent UI thread freezing
 * - Caching to avoid re-decoding unchanged audio
 */

let audioContext = null;
const decodeQueue = [];
let activeDecodes = 0;
const MAX_CONCURRENT_DECODES = 2;
const cache = new Map(); // id -> waveform data

/**
 * Get or create the shared AudioContext
 * Lazy initialization
 */
const getAudioContext = () => {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }
    return audioContext;
};

/**
 * Process the next item in the decode queue
 */
const processQueue = async () => {
    if (decodeQueue.length === 0 || activeDecodes >= MAX_CONCURRENT_DECODES) return;

    const { blob, id, resolve } = decodeQueue.shift();
    activeDecodes++;

    try {
        const ctx = getAudioContext();
        if (!ctx) {
            throw new Error('AudioContext not supported');
        }

        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);

        // Downsample to 100 points
        const samples = 100;
        const blockSize = Math.floor(channelData.length / samples);
        const dataPoints = [];

        for (let i = 0; i < samples; i++) {
            let sum = 0;
            // Use a simpler sampling for speed on large files
            // Taking max amplitude in the block (peak detection) gives better visuals than average
            // But let's stick to the original logic (average of abs) for consistency,
            // or switch to Root Mean Square (RMS) which is more accurate for "loudness".
            // The original used sum of abs / blocksize.
            for (let j = 0; j < blockSize; j++) {
                sum += Math.abs(channelData[i * blockSize + j]);
            }
            dataPoints.push(sum / blockSize);
        }

        // Normalize
        const max = Math.max(...dataPoints);
        const normalized = dataPoints.map(d => max === 0 ? 0 : d / max);

        if (id) cache.set(id, normalized);
        resolve(normalized);
    } catch (err) {
        console.error('Waveform generation failed:', err);
        // Return empty flat line on error
        resolve(new Array(100).fill(0));
    } finally {
        activeDecodes--;
        // Schedule next processing on next tick to yield to UI
        setTimeout(processQueue, 0);
    }
};

/**
 * Get waveform data for an audio blob
 * @param {Blob} blob - The audio file
 * @param {string} id - Optional recording ID for caching
 * @returns {Promise<number[]>} Array of 100 normalized float values (0-1)
 */
export const getWaveform = (blob, id = null) => {
    if (id && cache.has(id)) {
        return Promise.resolve(cache.get(id));
    }

    return new Promise((resolve, reject) => {
        decodeQueue.push({ blob, id, resolve, reject });
        processQueue();
    });
};

export default {
    getWaveform
};
