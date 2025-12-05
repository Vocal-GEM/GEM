import { describe, it, expect } from 'vitest';
import { SessionAnalyzer } from '../utils/SessionAnalyzer';
import { getNormsForGoal, VOICE_NORMS } from '../data/norms';

describe('GAVT Enhancements', () => {

    describe('SessionAnalyzer', () => {
        it('should calculate correct stats for a simple pitch sequence', () => {
            const history = [
                { pitch: 100, volume: 0.1 },
                { pitch: 200, volume: 0.1 },
                { pitch: 150, volume: 0.1 }
            ];
            const stats = SessionAnalyzer.analyze(history);

            expect(stats.minF0).toBe(100);
            expect(stats.maxF0).toBe(200);
            expect(stats.avgF0).toBe(150);
            expect(stats.rangeST).toBeCloseTo(12, 1); // Octave = 12 semitones
        });

        it('should ignore unvoiced frames (pitch=0 or -1)', () => {
            const history = [
                { pitch: 100, volume: 0.1 },
                { pitch: 0, volume: 0.01 },
                { pitch: -1, volume: 0.01 },
                { pitch: 100, volume: 0.1 }
            ];
            const stats = SessionAnalyzer.analyze(history);
            expect(stats.avgF0).toBe(100);
        });

        it('should calculate approximate SPL correctly', () => {
            // 1.0 RMS = 90dB baseline
            // 0.1 RMS = 20*log10(0.1) + 90 = -20 + 90 = 70dB
            const history = [{ pitch: 100, volume: 0.1 }];
            const stats = SessionAnalyzer.analyze(history);
            expect(stats.avgSPL).toBe(70);
        });
    });

    describe('Norms Data', () => {
        it('should return feminine norms for transfem goal', () => {
            const norms = getNormsForGoal('transfem_soft');
            expect(norms).toBe(VOICE_NORMS.feminine);
            expect(norms.pitch.min).toBe(165);
        });

        it('should return masculine norms for transmasc goal', () => {
            const norms = getNormsForGoal('transmasc_dark');
            expect(norms).toBe(VOICE_NORMS.masculine);
            expect(norms.pitch.min).toBe(85);
        });

        it('should default to androgynous for unknown goals', () => {
            const norms = getNormsForGoal('unknown_goal');
            expect(norms).toBe(VOICE_NORMS.androgynous);
        });
    });

    describe('HNR Calculation', () => {
        it('should calculate HNR from confidence correctly', () => {
            // Formula: 10 * log10(conf / (1-conf))
            // If conf = 0.99
            // 0.99 / 0.01 = 99
            // log10(99) ~= 1.995
            // 10 * 1.995 = 19.95 dB
            const conf = 0.99;
            const hnr = 10 * Math.log10(conf / (1 - conf));
            expect(hnr).toBeCloseTo(19.95, 1);
        });
    });
});
