/**
 * VVD Reference Data Tests
 * Tests for the Versatile Voice Dataset reference data module
 */

import { describe, it, expect } from 'vitest';
import {
    VVD_PITCH_THRESHOLDS,
    VVD_FORMANT_THRESHOLDS,
    VVD_HNR_THRESHOLDS,
    VVD_L1_CONFIGURATIONS,
    calculateL1Distance,
    getWeightLevelFromHNR,
    calculateProgressToGoal
} from './vvdReferenceData';

describe('VVD Reference Data', () => {
    describe('VVD_PITCH_THRESHOLDS', () => {
        it('should have valid pitch ranges', () => {
            expect(VVD_PITCH_THRESHOLDS.high.mean).toBeGreaterThan(VVD_PITCH_THRESHOLDS.medium.mean);
            expect(VVD_PITCH_THRESHOLDS.medium.mean).toBeGreaterThan(VVD_PITCH_THRESHOLDS.low.mean);
            expect(VVD_PITCH_THRESHOLDS.high.feminine_threshold).toBe(170);
        });
    });

    describe('VVD_HNR_THRESHOLDS', () => {
        it('should have inverted weight/HNR relationship', () => {
            // Low weight = high HNR (breathy)
            expect(VVD_HNR_THRESHOLDS.low.mean).toBeGreaterThan(VVD_HNR_THRESHOLDS.high.mean);
        });
    });

    describe('VVD_L1_CONFIGURATIONS', () => {
        it('should have 7 configurations (L1 0-6)', () => {
            expect(VVD_L1_CONFIGURATIONS).toHaveLength(7);
        });

        it('should have L1=0 as most feminine', () => {
            expect(VVD_L1_CONFIGURATIONS[0].l1).toBe(0);
            expect(VVD_L1_CONFIGURATIONS[0].label).toBe('Feminine');
        });

        it('should have L1=6 as most masculine', () => {
            expect(VVD_L1_CONFIGURATIONS[6].l1).toBe(6);
            expect(VVD_L1_CONFIGURATIONS[6].label).toBe('Masculine');
        });
    });

    describe('calculateL1Distance', () => {
        it('should return L1=0 for high pitch, high resonance, low weight', () => {
            const result = calculateL1Distance(260, 1850, 19);
            expect(result.l1Distance).toBe(0);
            expect(result.pitchLevel).toBe('high');
            expect(result.resonanceLevel).toBe('high');
            expect(result.weightLevel).toBe('low');
            expect(result.label).toBe('Feminine');
        });

        it('should return L1=6 for low pitch, low resonance, high weight', () => {
            const result = calculateL1Distance(115, 1650, 11);
            expect(result.l1Distance).toBe(6);
            expect(result.pitchLevel).toBe('low');
            expect(result.weightLevel).toBe('high');
            expect(result.label).toBe('Masculine');
        });

        it('should return L1=3 for medium values', () => {
            const result = calculateL1Distance(175, 1750, 15);
            expect(result.l1Distance).toBe(3);
            expect(result.label).toBe('Neutral');
        });

        it('should detect feminine threshold correctly', () => {
            const aboveThreshold = calculateL1Distance(180, 1850, 18);
            const belowThreshold = calculateL1Distance(160, 1850, 18);

            expect(aboveThreshold.isAboveFeminineThreshold).toBe(true);
            expect(belowThreshold.isAboveFeminineThreshold).toBe(false);
        });
    });

    describe('getWeightLevelFromHNR', () => {
        it('should classify high HNR as low weight', () => {
            const result = getWeightLevelFromHNR(19);
            expect(result.level).toBe('low');
            expect(result.description).toBe('Light/Breathy');
        });

        it('should classify low HNR as high weight', () => {
            const result = getWeightLevelFromHNR(11);
            expect(result.level).toBe('high');
            expect(result.description).toBe('Heavy/Pressed');
        });

        it('should handle null values', () => {
            const result = getWeightLevelFromHNR(null);
            expect(result.level).toBe('unknown');
        });

        it('should return normalized value between 0 and 1', () => {
            const result = getWeightLevelFromHNR(15);
            expect(result.normalized).toBeGreaterThanOrEqual(0);
            expect(result.normalized).toBeLessThanOrEqual(1);
        });
    });

    describe('calculateProgressToGoal', () => {
        it('should return 100% progress when at feminine goal', () => {
            const current = { pitch: 265, avgFormant: 1850, hnr: 18.5 };
            const goal = { voiceType: 'feminine' };

            const result = calculateProgressToGoal(current, goal);
            expect(result.overallProgress).toBe(100);
            expect(result.l1Distance).toBe(0);
            expect(result.targetL1).toBe(0);
        });

        it('should return lower progress when far from goal', () => {
            const current = { pitch: 120, avgFormant: 1650, hnr: 11 };
            const goal = { voiceType: 'feminine' };

            const result = calculateProgressToGoal(current, goal);
            expect(result.overallProgress).toBeLessThan(50);
            expect(result.l1Distance).toBe(6);
        });

        it('should handle androgynous goal (L1=3)', () => {
            const current = { pitch: 175, avgFormant: 1750, hnr: 15 };
            const goal = { voiceType: 'androgynous' };

            const result = calculateProgressToGoal(current, goal);
            expect(result.targetL1).toBe(3);
            expect(result.overallProgress).toBe(100);
        });
    });
});
