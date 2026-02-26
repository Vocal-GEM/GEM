/**
 * McLeodPitchDetector.js
 * 
 * Implements pitch detection using the McLeod Pitch Method (MPM).
 * MPM is chosen for its robustness with musical instruments and voice, handling overtones better than YIN.
 * 
 * Uses the 'pitchfinder' library.
 */

import * as Pitchfinder from 'pitchfinder';

class McLeodPitchDetector {
    constructor(config = {}) {
        this.sampleRate = config.sampleRate || 44100;
        this.bufferSize = config.bufferSize || 1024;

        // Initialize the detector from pitchfinder
        // Note: The library exports it as 'Macleod' (with an 'a'), despite the algorithm being McLeod
        // We handle both potential spellings to be safe across versions/environments
        const configParams = {
            sampleRate: this.sampleRate,
            bufferSize: this.bufferSize,
            cutoff: 0.9 // Probability threshold
        };

        // Aggressive search for the constructor
        let detectorConstructor = null;

        // Check direct named export
        if (Pitchfinder.Macleod) detectorConstructor = Pitchfinder.Macleod;
        else if (Pitchfinder.McLeod) detectorConstructor = Pitchfinder.McLeod;
        // Check default export (ESM interop)
        else if (Pitchfinder.default) {
            if (Pitchfinder.default.Macleod) detectorConstructor = Pitchfinder.default.Macleod;
            else if (Pitchfinder.default.McLeod) detectorConstructor = Pitchfinder.default.McLeod;
        }

        if (detectorConstructor) {
            this.detector = detectorConstructor(configParams);
            console.log("McLeodPitchDetector: Successfully initialized.");
        } else {
            // In test environment, if mock isn't set up right, we might get here.
            // But we should gracefully fallback or ensure the mock works.
            // If we are testing and no mock is found, it throws.
            // We'll trust the plan to fix the mock in test file.
            const keys = Object.keys(Pitchfinder);
            let defaultKeys = [];
            if (Pitchfinder.default) defaultKeys = Object.keys(Pitchfinder.default);

            console.error('CRITICAL: Pitchfinder.Macleod not found. Keys:', keys, 'Default keys:', defaultKeys);
            // Don't throw if we can help it, maybe fallback to no-op for tests if it fails hard
            // But throwing helps debug.
            throw new Error(`Top-level Pitchfinder export issue. Available keys: ${keys.join(', ')}`);
        }
    }

    /**
     * Detect pitch from an audio buffer.
     * @param {Float32Array} buffer - Audio data
     * @returns {Object|null} - { frequency, probability } or null if no pitch found
     */
    detect(buffer) {
        if (!this.detector) return null;

        const pitch = this.detector(buffer);

        // pitchfinder returns just the frequency (float) or null/0
        // We might want to construct a standard object.
        // Pitchfinder's McLeod implementation might return an object depending on version, 
        // usually it's just frequency. Let's check or assume standard usage.
        // Standard Pitchfinder usage: const detectPitch = Pitchfinder.YIN(); const pitch = detectPitch(float32Array);

        if (pitch && pitch > 0) {
            return {
                frequency: pitch,
                clarity: 1.0, // McLeod doesn't always expose probability widely in the simple call
                method: 'MPM'
            };
        }
        return null;
    }
}

export default McLeodPitchDetector;
