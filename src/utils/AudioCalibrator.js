/**
 * AudioCalibrator.js
 * Handles microphone calibration for accurate SPL (dB) measurements.
 * Stores calibration offset in localStorage.
 */

const STORAGE_KEY = 'gem_audio_calibration_offset';

export class AudioCalibrator {
    constructor() {
        this.dbOffset = this.loadCalibration();
    }

    /**
     * Load calibration offset from storage
     */
    loadCalibration() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? parseFloat(stored) : 0;
    }

    /**
     * Save calibration offset to storage
     */
    saveCalibration(offset) {
        this.dbOffset = offset;
        localStorage.setItem(STORAGE_KEY, offset.toString());
    }

    /**
     * Calibrate based on a reference sound level
     * @param {number} referenceDb - The known dB SPL of the reference sound
     * @param {number} inputRms - The RMS amplitude of the input signal (0-1)
     */
    calibrate(referenceDb, inputRms) {
        if (inputRms <= 0) return;

        // Calculate raw dBFS (decibels relative to full scale)
        // 20 * log10(rms)
        // e.g., RMS 0.1 -> -20 dBFS
        const rawDb = 20 * Math.log10(inputRms);

        // Offset needed to make rawDb match referenceDb
        // referenceDb = rawDb + offset
        // offset = referenceDb - rawDb
        const offset = referenceDb - rawDb;

        this.saveCalibration(offset);
        return offset;
    }

    /**
     * Convert RMS to calibrated dB SPL
     * @param {number} rms - Input RMS amplitude
     */
    getDbSpl(rms) {
        if (rms <= 0) return 0; // Or some noise floor like 30dB
        const rawDb = 20 * Math.log10(rms);
        return rawDb + this.dbOffset;
    }

    /**
     * Get current offset
     */
    getOffset() {
        return this.dbOffset;
    }

    /**
     * Reset calibration
     */
    reset() {
        this.saveCalibration(0);
    }
}

// Singleton instance
export const audioCalibrator = new AudioCalibrator();
