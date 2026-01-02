/**
 * Pitch Smoother
 * Reduces pitch jitter using median filtering and detects octave errors
 */

export class PitchSmoother {
    /**
     * Create a new pitch smoother
     * @param {number} windowSize - Number of samples to keep in buffer (default 5)
     */
    constructor(windowSize = 5) {
        this.buffer = [];
        this.windowSize = windowSize;
    }

    /**
     * Process a raw pitch reading and return smoothed value
     * @param {number} rawPitch - Raw pitch in Hz (or null if no pitch detected)
     * @returns {number|null} Smoothed pitch in Hz (or null)
     */
    process(rawPitch) {
        // Pass through null values
        if (rawPitch === null || rawPitch <= 0) {
            return null;
        }

        // Add to buffer
        this.buffer.push(rawPitch);
        if (this.buffer.length > this.windowSize) {
            this.buffer.shift();
        }

        // Need at least 3 samples for meaningful median
        if (this.buffer.length < 3) {
            return rawPitch;
        }

        // Calculate median
        const sorted = [...this.buffer].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];

        // Detect octave errors
        // If current reading is ~2x or ~0.5x the median, it's likely an octave jump
        const ratio = rawPitch / median;

        if (ratio > 1.8 && ratio < 2.2) {
            // Likely octave too high, correct down
            return rawPitch / 2;
        } else if (ratio < 0.55 && ratio > 0.45) {
            // Likely octave too low, correct up
            return rawPitch * 2;
        } else if (ratio > 2.5 || ratio < 0.4) {
            // Too far from median, likely error - use median instead
            return median;
        }

        // Return median for stable reading
        return median;
    }

    /**
     * Get the current buffer for debugging
     * @returns {number[]} Current pitch buffer
     */
    getBuffer() {
        return [...this.buffer];
    }

    /**
     * Clear the buffer (useful when switching contexts)
     */
    reset() {
        this.buffer = [];
    }

    /**
     * Set window size
     * @param {number} size - New window size
     */
    setWindowSize(size) {
        this.windowSize = Math.max(3, Math.min(15, size)); // Clamp 3-15
        // Trim buffer if needed
        while (this.buffer.length > this.windowSize) {
            this.buffer.shift();
        }
    }

    /**
     * Get smoothing intensity as a percentage
     * @returns {number} 0-100 representing how much smoothing is applied
     */
    getSmoothingIntensity() {
        // Larger window = more smoothing
        return ((this.windowSize - 3) / 12) * 100; // 3=0%, 15=100%
    }
}

/**
 * Create a pitch smoother with preset intensity
 * @param {'low'|'medium'|'high'} intensity - Smoothing intensity
 * @returns {PitchSmoother} Configured smoother
 */
export const createPitchSmoother = (intensity = 'medium') => {
    const windowSizes = {
        low: 3,
        medium: 5,
        high: 9
    };

    return new PitchSmoother(windowSizes[intensity] || 5);
};
