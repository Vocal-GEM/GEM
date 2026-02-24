import { describe, it, expect } from 'vitest';
import { LPCAnalyzer } from './lpcAnalysis';

describe('LPCAnalyzer', () => {
    it('should initialize with default parameters', () => {
        const analyzer = new LPCAnalyzer();
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

    it('should produce consistent results on subsequent calls with same input', () => {
        const sampleRate = 16000;
        const analyzer = new LPCAnalyzer(10, sampleRate);
        const buffer = new Float32Array(512);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) + 0.5 * Math.sin(2 * Math.PI * 880 * i / sampleRate);
        }

        const result1 = analyzer.analyze(buffer);
        // Deep copy result1 to ensure no mutation if implementation changes (e.g. returning cached objects)
        // Since current implementation returns new objects, simple assignment is fine for now,
        // but explicit copy is safer for future proofing the test against the optimization we are about to make.
        const result1Copy = {
            coefficients: Float32Array.from(result1.coefficients),
            envelope: Float32Array.from(result1.envelope),
            formants: JSON.parse(JSON.stringify(result1.formants))
        };

        const result2 = analyzer.analyze(buffer);

        expect(result2.coefficients).toEqual(result1Copy.coefficients);
        expect(result2.envelope).toEqual(result1Copy.envelope);
        expect(result2.formants).toEqual(result1Copy.formants);
    });

    it('should handle changing buffer sizes correctly', () => {
        const sampleRate = 16000;
        const analyzer = new LPCAnalyzer(10, sampleRate);

        // First call with size 512
        const buffer1 = new Float32Array(512).fill(0.1);
        const result1 = analyzer.analyze(buffer1);
        expect(result1).toBeDefined();

        // Second call with size 256 (smaller)
        const buffer2 = new Float32Array(256).fill(0.1);
        const result2 = analyzer.analyze(buffer2);
        expect(result2).toBeDefined();

        // Third call with size 1024 (larger)
        const buffer3 = new Float32Array(1024).fill(0.1);
        const result3 = analyzer.analyze(buffer3);
        expect(result3).toBeDefined();
    });
});
