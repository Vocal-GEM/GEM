import { describe, it, expect } from 'vitest';
import { CPPAnalyzer } from './cppAnalysis';

describe('CPPAnalyzer', () => {
    it('should initialize with default parameters', () => {
        const analyzer = new CPPAnalyzer();
        expect(analyzer.sampleRate).toBe(48000);
        expect(analyzer.fftSize).toBe(2048);
    });

    it('should return 0 CPP for silence', () => {
        const analyzer = new CPPAnalyzer();
        const buffer = new Float32Array(2048).fill(0);
        const cpp = analyzer.calculateCPP(buffer);
        expect(cpp).toBe(0);
    });

    it('should detect high CPP for a periodic signal', () => {
        const analyzer = new CPPAnalyzer();
        const buffer = new Float32Array(2048);
        const frequency = 200; // 200 Hz

        // Generate a rich periodic signal (sawtooth-like)
        for (let i = 0; i < buffer.length; i++) {
            let sample = 0;
            for (let k = 1; k <= 5; k++) {
                sample += (1 / k) * Math.sin(2 * Math.PI * k * frequency * i / analyzer.sampleRate);
            }
            buffer[i] = sample;
        }

        const cpp = analyzer.calculateCPP(buffer);

        // Periodic signals should have a distinct cepstral peak
        expect(cpp).toBeGreaterThan(5);
    });

    it('should analyze real-time data and return quality metrics', () => {
        const analyzer = new CPPAnalyzer();
        const buffer = new Float32Array(2048);
        // Generate periodic signal
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.sin(2 * Math.PI * 200 * i / analyzer.sampleRate);
        }

        const result = analyzer.analyzeRealTime(buffer);

        expect(result).toHaveProperty('cpp');
        expect(result).toHaveProperty('quality');
        expect(result).toHaveProperty('interpretation');
        expect(result).toHaveProperty('color');
        expect(result.cpp).toBeGreaterThan(0);
    });
});
