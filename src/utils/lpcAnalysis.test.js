/* eslint-disable no-unused-vars */
import { describe, it, expect } from 'vitest';
import { LPCAnalyzer } from './lpcAnalysis';

describe('LPCAnalyzer', () => {
    it('should initialize with specific parameters', () => {
        const analyzer = new LPCAnalyzer(12, 48000);
        expect(analyzer.sampleRate).toBe(48000);
        expect(analyzer.order).toBe(12);
    });

    it('should analyze a buffer and return formants', () => {
        const sampleRate = 16000;
        const analyzer = new LPCAnalyzer(10, sampleRate); // Use reasonable order
        const buffer = new Float32Array(512); // Use larger buffer for better resolution

        // Generate a synthetic vowel-like signal (F1=500, F2=1500)
        // Simple sum of sines approximation
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            buffer[i] = Math.sin(2 * Math.PI * 500 * t) * 0.5 +
                        Math.sin(2 * Math.PI * 1500 * t) * 0.3;
        }

        const result = analyzer.analyze(buffer);

        expect(result).toHaveProperty('coefficients');
        expect(result).toHaveProperty('envelope');
        expect(result).toHaveProperty('formants');
        expect(Array.isArray(result.formants)).toBe(true);
        expect(result.coefficients.length).toBe(10);
    }, 15000);

    it('should handle silence gracefully', () => {
        const analyzer = new LPCAnalyzer(10, 16000);
        const buffer = new Float32Array(512).fill(0);
        const result = analyzer.analyze(buffer);

        // Should return low magnitude envelope
        expect(result).toBeDefined();
        expect(result.envelope[0]).toBeLessThan(-50); // Should be very low dB
    }, 10000);

    it('should reuse buffers on subsequent calls', () => {
        const analyzer = new LPCAnalyzer(10, 16000);
        const buffer1 = new Float32Array(512).fill(0.5);

        // First call
        const result1 = analyzer.analyze(buffer1);

        // Verify buffers were created
        expect(analyzer.buffers['signal']).toBeDefined();
        expect(analyzer.buffers['windowed']).toBeDefined();

        const signalBufferRef = analyzer.buffers['signal'];

        // Second call with same size
        const buffer2 = new Float32Array(512).fill(0.3);
        analyzer.analyze(buffer2);

        // Should be same buffer instance
        expect(analyzer.buffers['signal']).toBe(signalBufferRef);

        // Call with larger size
        const buffer3 = new Float32Array(1024).fill(0.1);
        analyzer.analyze(buffer3);

        // Should have reallocated or grown
        expect(analyzer.buffers['signal'].length).toBeGreaterThanOrEqual(1024);
        // Note: It might be a new instance
        expect(analyzer.buffers['signal']).not.toBe(signalBufferRef);
    });
});
