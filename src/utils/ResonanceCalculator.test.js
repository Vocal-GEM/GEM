import { describe, it, expect, beforeEach } from 'vitest';
import { ResonanceCalculator } from './ResonanceCalculator';

describe('ResonanceCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new ResonanceCalculator();
    });

    it('should return 0 for silence', () => {
        const spectrum = new Float32Array(256).fill(0);
        const result = calculator.calculate(spectrum, 8000);
        expect(result.resonance).toBe(0);
        expect(result.confidence).toBeLessThan(0.5);
    });

    it('should calculate centroid correctly for a simple peak', () => {
        const spectrum = new Float32Array(256).fill(0);
        // Peak at index 10
        spectrum[10] = 1.0;

        const nyquist = 8000;
        const expectedFreq = (10 / 256) * nyquist;

        const result = calculator.calculate(spectrum, nyquist);
        expect(result.resonance).toBeCloseTo(expectedFreq);
        expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should calculate weighted average (centroid)', () => {
        const spectrum = new Float32Array(256).fill(0);
        // Two equal peaks
        spectrum[10] = 1.0;
        spectrum[20] = 1.0;

        const nyquist = 8000;
        const freq1 = (10 / 256) * nyquist;
        const freq2 = (20 / 256) * nyquist;
        const expectedCentroid = (freq1 + freq2) / 2;

        const result = calculator.calculate(spectrum, nyquist);
        expect(result.resonance).toBeCloseTo(expectedCentroid);
    });
});
