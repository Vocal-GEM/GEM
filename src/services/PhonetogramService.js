/**
 * PhonetogramService
 * Manages the data for a Voice Range Profile (Phonetogram).
 * Buckets vocal intensity (dB) by pitch (semitones) to track the dynamic range.
 */
export class PhonetogramService {
    constructor() {
        // Map of MIDI note number -> { min: number, max: number, count: number }
        this.profile = new Map();
        this.minNote = 127;
        this.maxNote = 0;
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
     */
    addDataPoint(frequency, db) {
        if (!frequency || frequency <= 0 || !db || db < 0) return;

        const note = this.frequencyToMidi(frequency);
        if (note < 0 || note > 127) return;

        // Update range bounds
        if (note < this.minNote) this.minNote = note;
        if (note > this.maxNote) this.maxNote = note;

        const current = this.profile.get(note) || { min: 1000, max: -1000, count: 0 };

        this.profile.set(note, {
            min: Math.min(current.min, db),
            max: Math.max(current.max, db),
            count: current.count + 1
        });
    }

    /**
     * Returns the profile data formatted for visualization
     * @returns {Array} Array of { note, freq, min, max } sorted by pitch
     */
    getProfileData() {
        const data = [];
        // Iterate from lowest to highest recorded note
        for (let i = this.minNote; i <= this.maxNote; i++) {
            if (this.profile.has(i)) {
                const stats = this.profile.get(i);
                data.push({
                    note: i,
                    frequency: 440 * Math.pow(2, (i - 69) / 12),
                    min: stats.min,
                    max: stats.max,
                    range: stats.max - stats.min
                });
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
     * Exports the raw profile map as a JSON-serializable object
     */
    export() {
        return {
            minNote: this.minNote,
            maxNote: this.maxNote,
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
        this.profile = new Map();

        Object.entries(data.data).forEach(([key, value]) => {
            this.profile.set(parseInt(key), value);
        });
    }
}

export const phonetogramService = new PhonetogramService();
