/**
 * Pitch Detection Utilities
 * Implements YIN algorithm for robust pitch tracking
 */

export const PitchDetector = {
    /**
     * Calculate pitch using YIN algorithm
     * @param {Float32Array} buffer - Audio data
     * @param {number} sampleRate - Sample rate
     * @param {number} adaptiveThreshold - Threshold for peak picking (default 0.15)
     * @returns {number} Pitch in Hz, or -1 if not found
     */
    calculateYIN(buffer, sampleRate, adaptiveThreshold = 0.15) {
        const bufferSize = buffer.length;
        const halfSize = Math.floor(bufferSize / 2);
        const yinBuffer = new Float32Array(halfSize);

        // Difference function
        for (let tau = 0; tau < halfSize; tau++) {
            for (let i = 0; i < halfSize; i++) {
                const delta = buffer[i] - buffer[i + tau];
                yinBuffer[tau] += delta * delta;
            }
        }

        // Cumulative mean normalized difference function
        yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < halfSize; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }

        // Absolute threshold
        let tau = 0;
        for (tau = 2; tau < halfSize; tau++) {
            if (yinBuffer[tau] < adaptiveThreshold) {
                while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                break;
            }
        }

        if (tau == halfSize || yinBuffer[tau] >= adaptiveThreshold) return -1;

        // Parabolic interpolation
        let betterTau = tau;
        if (tau > 0 && tau < halfSize - 1) {
            const s0 = yinBuffer[tau - 1];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[tau + 1];
            let adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
            betterTau += adjustment;
        }

        const pitch = sampleRate / betterTau;
        if (pitch < 50 || pitch > 800) return -1;
        return pitch;
    }
};
