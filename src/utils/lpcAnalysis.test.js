import { describe, it, expect } from 'vitest';
import { LPCAnalyzer } from './lpcAnalysis';

describe('LPCAnalyzer', () => {
    it('should initialize with default parameters', () => {
        const analyzer = new LPCAnalyzer(48000);
        expect(analyzer.sampleRate).toBe(48000);
        expect(analyzer.order).toBeGreaterThan(0);
    });

    it('should analyze a buffer and return formants', () => {
        const sampleRate = 48000;
        const analyzer = new LPCAnalyzer(sampleRate);
        const buffer = new Float32Array(1024);

        // Generate a synthetic vowel-like signal (source-filter model approximation)
        // Use a pulse train (rich in harmonics) filtered by formants, or just sum of sines with more noise
        for (let i = 0; i < buffer.length; i++) {
            // Fundamental frequency 100Hz
            let source = 0;
            const f0 = 100;
            for (let k = 1; k * f0 < sampleRate / 2; k++) {
                source += Math.sin(2 * Math.PI * k * f0 * i / sampleRate);
            }

            // Simple formant shaping (not true filtering, but adds energy at formants)
            // This is still a bit artificial for LPC but better than pure sines
            buffer[i] =
                0.5 * Math.sin(2 * Math.PI * 700 * i / sampleRate) +
                0.3 * Math.sin(2 * Math.PI * 1200 * i / sampleRate) +
                0.1 * (Math.random() * 2 - 1); // More noise for spectral fullness
        }

        const result = analyzer.analyze(buffer);

        expect(result).toHaveProperty('coefficients');
        expect(result).toHaveProperty('formants');
        expect(Array.isArray(result.formants)).toBe(true);
    }, 1000);

    it('should handle silence gracefully', () => {
        const analyzer = new LPCAnalyzer(48000);
        const buffer = new Float32Array(1024).fill(0);
        const result = analyzer.analyze(buffer);

        // Should probably return empty formants or zeros, but definitely not crash
        expect(result).toBeDefined();
    }, 10000);
});
