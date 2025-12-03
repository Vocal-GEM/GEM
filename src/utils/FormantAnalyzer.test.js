import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormantAnalyzer } from './FormantAnalyzer';
import { DSP } from './DSP';

// Mock DSP methods to isolate FormantAnalyzer logic
vi.mock('./DSP', () => ({
    DSP: {
        computeAutocorrelation: vi.fn(),
        levinsonDurbin: vi.fn(() => ({ a: [], error: 0 })),
        computeLPCSpectrum: vi.fn(),
        findPeaks: vi.fn(),
        estimateVowel: vi.fn()
    }
}));

describe('FormantAnalyzer', () => {
    let analyzer;

    beforeEach(() => {
        analyzer = new FormantAnalyzer();
        vi.clearAllMocks();
    });

    it('should initialize with zero formants', () => {
        expect(analyzer.smoothedF1).toBe(0);
        expect(analyzer.smoothedF2).toBe(0);
    });

    it('should analyze formants and update smoothed values', () => {
        // Mock DSP returns
        DSP.findPeaks.mockReturnValue([
            { freq: 500, amp: 10 }, // F1 candidate
            { freq: 1500, amp: 8 }  // F2 candidate
        ]);
        DSP.estimateVowel.mockReturnValue('a');

        const buffer = new Float32Array(128);
        const result = analyzer.analyze(buffer, 16000);

        expect(result.f1).toBe(500);
        expect(result.f2).toBe(1500);
        expect(result.vowel).toBe('a');
        expect(analyzer.smoothedF1).toBe(500);
    });

    it('should smooth formant values over time', () => {
        // First call
        DSP.findPeaks.mockReturnValue([{ freq: 500, amp: 10 }, { freq: 1500, amp: 8 }]);
        analyzer.analyze(new Float32Array(128), 16000);

        // Second call with slight change
        DSP.findPeaks.mockReturnValue([{ freq: 520, amp: 10 }, { freq: 1520, amp: 8 }]);
        const result = analyzer.analyze(new Float32Array(128), 16000);

        // Should be between 500 and 520 (smoothing)
        expect(result.f1).toBeGreaterThan(500);
        expect(result.f1).toBeLessThan(520);
    });

    it('should reset smoothed values', () => {
        analyzer.smoothedF1 = 500;
        analyzer.smoothedF2 = 1500;
        analyzer.reset();
        expect(analyzer.smoothedF1).toBe(0);
        expect(analyzer.smoothedF2).toBe(0);
    });
});
