import { describe, it, expect } from 'vitest';
import { LPCAnalyzer } from './lpcAnalysis';

describe('LPCAnalyzer', () => {
    it('should initialize with default parameters', () => {
        const analyzer = new LPCAnalyzer(48000);
        expect(analyzer.sampleRate).toBe(48000);
        expect(analyzer.order).toBeGreaterThan(0);
    });

    it('should analyze a buffer and return formants', () => {
        const sampleRate = 16000;
        const analyzer = new LPCAnalyzer(2, sampleRate);
        const buffer = new Float32Array(128);

        // Generate a synthetic vowel-like signal
        // Generate a simple sine wave for performance
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
        }

        const result = analyzer.analyze(buffer);

        expect(result).toHaveProperty('coefficients');
        expect(result).toHaveProperty('formants');
        expect(Array.isArray(result.formants)).toBe(true);
    }, 15000);

    it('should handle silence gracefully', () => {
        const analyzer = new LPCAnalyzer(2, 16000);
        const buffer = new Float32Array(128).fill(0);
        const result = analyzer.analyze(buffer);

        // Should probably return empty formants or zeros, but definitely not crash
        expect(result).toBeDefined();
    }, 10000);
});
