/**
 * Test suite for Voice Plot 2D logic
 */
import { describe, it, expect } from 'vitest';
import { VoiceAnalyzer } from '../../utils/voiceAnalysis';

describe('Voice Plot 2D Logic', () => {
    const analyzer = new VoiceAnalyzer();

    describe('calculatePitchStatistics', () => {
        it('should return statistical zeros for empty input', () => {
            const stats = analyzer.calculatePitchStatistics([]);
            expect(stats.mean).toBe(0);
            expect(stats.stdev).toBe(0);
        });

        it('should calculate correct metrics for a constant pitch', () => {
            const series = [
                { frequency: 220, confidence: 1 },
                { frequency: 220, confidence: 1 },
                { frequency: 220, confidence: 1 }
            ];
            const stats = analyzer.calculatePitchStatistics(series);
            expect(stats.mean).toBe(220);
            expect(stats.stdev).toBe(0);
        });

        it('should calculate standard deviation correctly', () => {
            // 200, 220, 240 -> Mean 220
            // Diffs: -20, 0, 20
            // SqDiffs: 400, 0, 400 -> Avg 266.66
            // Sqrt(266.66) ~ 16.33
            const series = [
                { frequency: 200, confidence: 1 },
                { frequency: 220, confidence: 1 },
                { frequency: 240, confidence: 1 }
            ];
            const stats = analyzer.calculatePitchStatistics(series);
            expect(stats.mean).toBe(220);
            expect(stats.stdev).toBe(16); // Rounded
        });

        it('should ignore low confidence or null pitches', () => {
            const series = [
                { frequency: 220, confidence: 1 },
                { frequency: 500, confidence: 0.1 }, // Should ignore
                { frequency: null, confidence: 0 }    // Should ignore
            ];
            const stats = analyzer.calculatePitchStatistics(series);
            expect(stats.mean).toBe(220);
            expect(stats.stdev).toBe(0);
        });
    });
});
