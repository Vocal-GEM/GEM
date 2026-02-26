import { describe, it, expect } from 'vitest';
import { LPCAnalyzer } from './lpcAnalysis';

describe('LPCAnalyzer', () => {
    it('should initialize with default parameters', () => {
        // Pass order as first arg, sampleRate as second
        const analyzer = new LPCAnalyzer(12, 48000);
        expect(analyzer.sampleRate).toBe(48000);
        expect(analyzer.order).toBe(12);
    });

    it('should analyze a buffer and return formants', () => {
        const sampleRate = 16000;
        const analyzer = new LPCAnalyzer(12, sampleRate); // Use reasonable order
        const buffer = new Float32Array(512); // Larger buffer for better resolution

        // Generate a synthetic vowel-like signal (schwa /ə/ with F1=500, F2=1500)
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            buffer[i] = Math.sin(2 * Math.PI * 500 * t) * 0.5 +
                        Math.sin(2 * Math.PI * 1500 * t) * 0.3;
        }

        const result = analyzer.analyze(buffer);

        expect(result).toHaveProperty('coefficients');
        expect(result).toHaveProperty('formants');
        expect(Array.isArray(result.formants)).toBe(true);
        // Basic check to see if we got something
        expect(result.coefficients.length).toBeGreaterThan(0);
    }, 15000);

    it('should handle silence gracefully', () => {
        const analyzer = new LPCAnalyzer(12, 16000);
        const buffer = new Float32Array(128).fill(0);
        const result = analyzer.analyze(buffer);

        // Should probably return empty formants or zeros, but definitely not crash
        expect(result).toBeDefined();
    }, 10000);
});
