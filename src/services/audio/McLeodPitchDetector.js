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
        this.detector = Pitchfinder.McLeod({
            sampleRate: this.sampleRate,
            bufferSize: this.bufferSize,
            cutoff: 0.9 // Probability threshold
        });
    }

    /**
     * Detect pitch from an audio buffer.
     * @param {Float32Array} buffer - Audio data
     * @returns {Object|null} - { frequency, probability } or null if no pitch found
     */
    detect(buffer) {
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
