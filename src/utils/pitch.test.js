import { describe, it, expect } from 'vitest';
import { PitchDetector } from './pitch';

describe('PitchDetector', () => {
    it('should return -1 pitch and 0 confidence for silence', () => {
        const sampleRate = 48000;
        const buffer = new Float32Array(1024).fill(0);
        const result = PitchDetector.calculateYIN(buffer, sampleRate);
        expect(result.pitch).toBe(-1);
        expect(result.confidence).toBe(0);
    });

    it('should detect a simple sine wave with high confidence', () => {
        const sampleRate = 48000;
        const frequency = 440; // A4
        const buffer = new Float32Array(2048);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        }

        const result = PitchDetector.calculateYIN(buffer, sampleRate);

        // YIN is usually very accurate for pure tones
        expect(result.pitch).toBeGreaterThan(435);
        expect(result.pitch).toBeLessThan(445);
        expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should return low confidence or no pitch for noise', () => {
        const sampleRate = 48000;
        const buffer = new Float32Array(1024);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = (Math.random() * 2 - 1);
        }

        const result = PitchDetector.calculateYIN(buffer, sampleRate);
        // Either no pitch found, or very low confidence
        if (result.pitch !== -1) {
            expect(result.confidence).toBeLessThan(0.6);
        }
    });
});
