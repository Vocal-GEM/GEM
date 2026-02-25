
import { describe, it, expect } from 'vitest';
import { LPCAnalyzer } from './lpcAnalysis';

describe('LPCAnalyzer', () => {
    it('analyzes a sine wave correctly', () => {
        const analyzer = new LPCAnalyzer();
        const bufferSize = 1024;
        const input = new Float32Array(bufferSize);
        // 1000Hz sine wave at 48kHz
        for (let i = 0; i < bufferSize; i++) {
            input[i] = Math.sin(2 * Math.PI * 1000 * i / 48000);
        }

        const result = analyzer.analyze(input);

        expect(result).toBeDefined();
        expect(result.coefficients).toBeDefined();
        expect(result.coefficients.length).toBe(12);
        expect(result.envelope).toBeInstanceOf(Float32Array);
        expect(result.envelope.length).toBe(512); // Default numPoints
        expect(result.formants).toBeDefined();

        // Check if envelope has values
        let hasValues = false;
        for(let i=0; i<result.envelope.length; i++) {
            if (result.envelope[i] !== 0 && result.envelope[i] !== -100) {
                hasValues = true;
                break;
            }
        }
        expect(hasValues).toBe(true);
    });

    it('handles silence', () => {
        const analyzer = new LPCAnalyzer();
        const input = new Float32Array(1024).fill(0);
        const result = analyzer.analyze(input);

        expect(result).toBeDefined();
        // Should return low dB floor
        expect(result.envelope[0]).toBeLessThan(-90);
    });

    it('reuses buffers correctly on subsequent calls', () => {
        const analyzer = new LPCAnalyzer();
        const input1 = new Float32Array(1024).fill(0.5);
        // const result1 = analyzer.analyze(input1); // Unused
        analyzer.analyze(input1);

        const input2 = new Float32Array(1024).fill(-0.5);
        const result2 = analyzer.analyze(input2);

        // Verify result2 is valid
        expect(result2.envelope.length).toBe(512);
    });
});
