import { DSP } from './DSP';

export class PitchDetector {
    constructor(config = {}) {
        this.minConfidence = config.minConfidence || 0.6;
        this.lastValidPitch = 0;
    }

    detect(buffer, sampleRate) {
        const dynamicThreshold = 0.15;
        const { pitch: rawPitch, confidence } = DSP.calculatePitchYIN(buffer, sampleRate, dynamicThreshold);

        let pitch = rawPitch;

        // Confidence Check
        if (pitch > 0 && confidence > this.minConfidence) {
            // Octave Jump Protection
            if (this.lastValidPitch > 0) {
                const ratio = pitch / this.lastValidPitch;
                // Check if pitch jumps ~2x (octave up) or ~0.5x (octave down) suddenly
                const isOctaveJump = (ratio > 1.8 && ratio < 2.2) || (ratio > 0.4 && ratio < 0.6);

                if (isOctaveJump && confidence < 0.9) {
                    // Likely an octave error, ignore this frame's pitch
                    // We return -1 to indicate "keep previous" or "invalid", 
                    // but AudioEngine logic was "pitch = -1".
                    // Let's return -1 for now to match behavior.
                    return { pitch: -1, confidence };
                }
            }

            this.lastValidPitch = pitch;
            return { pitch, confidence };
        }

        return { pitch: -1, confidence };
    }

    reset() {
        this.lastValidPitch = 0;
    }
}
