/**
 * PhonetogramService
 * Manages the data for a Voice Range Profile (Phonetogram).
 * Buckets vocal intensity (dB) by pitch (semitones) to track the dynamic range.
 */
export class PhonetogramService {
    constructor() {
        // Map of MIDI note number -> { min: number, max: number, count: number, vocalWeight: [] }
        this.profile = new Map();
        this.minNote = 127;
        this.maxNote = 0;
        this.trackVocalWeight = false; // Optional feature
    }

    /**
     * Converts frequency to MIDI note number
     * @param {number} frequency - Pitch in Hz
     * @returns {number} MIDI note number
     */
    frequencyToMidi(frequency) {
        if (!frequency || frequency <= 0) return -1;
        return Math.round(69 + 12 * Math.log2(frequency / 440));
    }

    /**
     * Adds a data point to the profile
     * @param {number} frequency - Pitch in Hz
     * @param {number} db - Intensity in dB SPL
     * @param {Object} options - Optional parameters
     * @param {number} options.h1h2 - H1-H2 (vocal weight) in dB
     * @param {number} options.vocalWeight - Vocal weight 0-100
     */
    addDataPoint(frequency, db, options = {}) {
        if (!frequency || frequency <= 0 || !db || db < 0) return;

        const note = this.frequencyToMidi(frequency);
        if (note < 0 || note > 127) return;

        // Update range bounds
        if (note < this.minNote) this.minNote = note;
        if (note > this.maxNote) this.maxNote = note;

        const current = this.profile.get(note) || {
            min: 1000,
            max: -1000,
            count: 0,
            vocalWeightSum: 0,
            vocalWeightCount: 0
        };

        const updated = {
            min: Math.min(current.min, db),
            max: Math.max(current.max, db),
            count: current.count + 1,
            vocalWeightSum: current.vocalWeightSum,
            vocalWeightCount: current.vocalWeightCount
        };

        // Track vocal weight if enabled and provided
        if (this.trackVocalWeight && (options.h1h2 !== undefined || options.vocalWeight !== undefined)) {
            const weight = options.vocalWeight !== undefined
                ? options.vocalWeight
                : options.h1h2 !== undefined
                    ? Math.max(0, Math.min(100, (options.h1h2 / 10) * 100)) // Convert H1-H2 to 0-100 scale
                    : null;

            if (weight !== null) {
                updated.vocalWeightSum = current.vocalWeightSum + weight;
                updated.vocalWeightCount = current.vocalWeightCount + 1;
            }
        }

        this.profile.set(note, updated);
    }

    /**
     * Returns the profile data formatted for visualization
     * @returns {Array} Array of { note, freq, min, max, avgVocalWeight? } sorted by pitch
     */
    getProfileData() {
        const data = [];
        // Iterate from lowest to highest recorded note
        for (let i = this.minNote; i <= this.maxNote; i++) {
            if (this.profile.has(i)) {
                const stats = this.profile.get(i);
                const point = {
                    note: i,
                    frequency: 440 * Math.pow(2, (i - 69) / 12),
                    min: stats.min,
                    max: stats.max,
                    range: stats.max - stats.min
                };

                // Include average vocal weight if tracked
                if (this.trackVocalWeight && stats.vocalWeightCount > 0) {
                    point.avgVocalWeight = stats.vocalWeightSum / stats.vocalWeightCount;
                }

                data.push(point);
            }
        }
        return data;
    }

    /**
     * Clears all recorded data
     */
    clear() {
        this.profile.clear();
        this.minNote = 127;
        this.maxNote = 0;
    }

    /**
     * Enable or disable vocal weight tracking
     * @param {boolean} enabled
     */
    setVocalWeightTracking(enabled) {
        this.trackVocalWeight = enabled;
    }

    /**
     * Exports the raw profile map as a JSON-serializable object
     */
    export() {
        return {
            minNote: this.minNote,
            maxNote: this.maxNote,
            trackVocalWeight: this.trackVocalWeight,
            data: Object.fromEntries(this.profile)
        };
    }

    /**
     * Imports data from a saved object
     */
    import(data) {
        if (!data || !data.data) return;
        this.minNote = data.minNote;
        this.maxNote = data.maxNote;
        this.trackVocalWeight = data.trackVocalWeight || false;
        this.profile = new Map();

        Object.entries(data.data).forEach(([key, value]) => {
            this.profile.set(parseInt(key), value);
        });
    }
}

export const phonetogramService = new PhonetogramService();
