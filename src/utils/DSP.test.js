import { describe, it, expect } from 'vitest';
import { DSP } from './DSP';

describe('DSP Utility - Voice Quality Metrics', () => {

    // 1. Jitter Tests
    describe('calculateJitter', () => {
        it('should return 0 for a constant pitch', () => {
            // Constant 100Hz = 0.01s period
            const periods = [0.01, 0.01, 0.01, 0.01, 0.01];
            expect(DSP.calculateJitter(periods)).toBe(0);
        });

        it('should detect variations (jitter)', () => {
            // Alternating periods: 0.01, 0.011, 0.01, 0.011
            // Mean = 0.0105
            // Diff sum = |0.001| + |0.001| + |0.001| = 0.003
            // Avg diff = 0.003 / 3 = 0.001
            // Jitter = 0.001 / 0.0105 ≈ 0.0952 (9.52%)
            const periods = [0.01, 0.011, 0.01, 0.011];
            const jitter = DSP.calculateJitter(periods);
            expect(jitter).toBeCloseTo(9.52, 2);
        });
    });

    // 2. Shimmer Tests
    describe('calculateShimmer', () => {
        it('should return 0 for constant amplitude', () => {
            const amps = [0.5, 0.5, 0.5, 0.5];
            expect(DSP.calculateShimmer(amps)).toBe(0);
        });

        it('should detect amplitude variations', () => {
            // 0.5, 0.4, 0.5, 0.4
            // Mean = 0.45
            // Diff sum = 0.1 + 0.1 + 0.1 = 0.3
            // Avg diff = 0.3 / 3 = 0.1
            // Shimmer = 0.1 / 0.45 ≈ 0.2222 (22.2%)
            const amps = [0.5, 0.4, 0.5, 0.4];
            const shimmer = DSP.calculateShimmer(amps);
            expect(shimmer).toBeCloseTo(22.22, 2);
        });
    });

    // 3. HNR Tests
    describe('calculateHNR', () => {
        it('should return 50dB if perfect harmonicity', () => {
            const autocorr = new Float32Array([1.0, 0.5, 1.0]); // Perfect peak at lag 2
            const result = DSP.calculateHNR(autocorr, 2);
            expect(result).toBe(50);
        });

        it('should calculate HNR correctly', () => {
            // Total power 1.0, Harmonic 0.9, Noise 0.1
            // HNR = 10 * log10(0.9 / 0.1) = 10 * log10(9) ≈ 9.54
            const autocorr = new Float32Array([1.0, 0, 0.9]);
            const result = DSP.calculateHNR(autocorr, 2);
            expect(result).toBeCloseTo(9.54, 2);
        });

        it('should handle zero noise (cap at 50)', () => {
            const autocorr = new Float32Array([1.0, 0, 1.0]);
            const result = DSP.calculateHNR(autocorr, 2);
            expect(result).toBe(50);
        });
    });
});
