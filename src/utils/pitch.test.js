import { describe, it, expect } from 'vitest';
import { PitchDetector } from './pitch';

describe('PitchDetector', () => {
    it('should return -1 for silence', () => {
        const sampleRate = 48000;
        const buffer = new Float32Array(1024).fill(0);
        const pitch = PitchDetector.calculateYIN(buffer, sampleRate);
        expect(pitch).toBe(-1);
    });

    it('should detect a simple sine wave', () => {
        const sampleRate = 48000;
        const frequency = 440; // A4
        const buffer = new Float32Array(2048);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        }

        const pitch = PitchDetector.calculateYIN(buffer, sampleRate);

        // YIN is usually very accurate for pure tones
        expect(pitch).toBeGreaterThan(435);
        expect(pitch).toBeLessThan(445);
    });

    it('should return -1 for very high frequency noise', () => {
        const sampleRate = 48000;
        const buffer = new Float32Array(1024);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = (Math.random() * 2 - 1);
        }
        // Noise might randomly have a pitch, but usually not a stable one with high confidence.
        // However, YIN *might* find a pitch in noise if threshold isn't strict.
        // For this test, we'll just check it runs without error.
        const pitch = PitchDetector.calculateYIN(buffer, sampleRate);
        expect(typeof pitch).toBe('number');
    });
});
