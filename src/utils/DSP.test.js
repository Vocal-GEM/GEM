import { describe, it, expect } from 'vitest';
import { DSP } from './DSP';

describe('DSP Utility', () => {
    describe('calculateRMS', () => {
        it('should calculate RMS of a constant signal', () => {
            const buffer = new Float32Array([0.5, 0.5, 0.5, 0.5]);
            const rms = DSP.calculateRMS(buffer);
            expect(rms).toBeCloseTo(0.5);
        });

        it('should calculate RMS of a sine wave (approx)', () => {
            // RMS of sine wave with amplitude A is A / sqrt(2) ~= A * 0.707
            const buffer = new Float32Array(100);
            for (let i = 0; i < 100; i++) {
                buffer[i] = Math.sin(2 * Math.PI * i / 100);
            }
            const rms = DSP.calculateRMS(buffer);
            expect(rms).toBeCloseTo(0.707, 2);
        });

        it('should return 0 for silence', () => {
            const buffer = new Float32Array([0, 0, 0, 0]);
            expect(DSP.calculateRMS(buffer)).toBe(0);
        });
    });

    describe('calculateDB', () => {
        it('should calculate dB correctly', () => {
            // 20 * log10(1.0) = 0 dB
            expect(DSP.calculateDB(1.0)).toBe(0);
            // 20 * log10(0.1) = -20 dB
            expect(DSP.calculateDB(0.1)).toBeCloseTo(-20);
        });

        it('should handle silence', () => {
            expect(DSP.calculateDB(0)).toBe(-100);
            expect(DSP.calculateDB(-0.5)).toBe(-100);
        });

        it('should apply offset', () => {
            // 0 dB + 90 offset = 90 dB
            expect(DSP.calculateDB(1.0, 90)).toBe(90);
        });
    });
});
