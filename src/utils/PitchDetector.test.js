import { describe, it, expect, beforeEach } from 'vitest';
import { PitchDetector } from './PitchDetector';

describe('PitchDetector', () => {
    let detector;

    beforeEach(() => {
        detector = new PitchDetector();
    });

    it('should initialize with default config', () => {
        expect(detector.minConfidence).toBe(0.6);
        expect(detector.lastValidPitch).toBe(0);
    });

    it('should return -1 for silence', () => {
        const buffer = new Float32Array(2048).fill(0);
        const result = detector.detect(buffer, 44100);
        expect(result.pitch).toBe(-1);
    });

    it('should detect a simple sine wave (440Hz)', () => {
        const sampleRate = 44100;
        const buffer = new Float32Array(2048);
        const freq = 440;

        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.sin(2 * Math.PI * freq * i / sampleRate);
        }

        const result = detector.detect(buffer, sampleRate);

        // YIN is usually very accurate for pure sine waves
        expect(result.pitch).toBeCloseTo(440, 0);
        expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('should reject low confidence signals', () => {
        // Create a noisy signal
        const buffer = new Float32Array(2048);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = (Math.random() * 2 - 1) * 0.1;
        }

        const result = detector.detect(buffer, 44100);
        expect(result.pitch).toBe(-1);
    });
});
