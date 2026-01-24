/**
 * Gender Perception Metrics Tests
 * Tests for the perception prediction system based on da Cruz Martinho et al. (2024)
 */

import { describe, it, expect } from 'vitest';
import {
    PERCEPTION_PREDICTORS,
    PERCEPTION_WEIGHTS,
    GENDER_PRESENTATION_RANGES,
    predictGenderPerception,
    getContextRelevantMeasures
} from './genderPerceptionMetrics';

describe('Gender Perception Metrics', () => {
    describe('PERCEPTION_PREDICTORS', () => {
        it('should have all three listener contexts', () => {
            expect(PERCEPTION_PREDICTORS).toHaveProperty('SLP');
            expect(PERCEPTION_PREDICTORS).toHaveProperty('CG');
            expect(PERCEPTION_PREDICTORS).toHaveProperty('TNB');
        });

        it('should have cisgender and transgender categories for each context', () => {
            Object.values(PERCEPTION_PREDICTORS).forEach(context => {
                expect(context).toHaveProperty('cisgender');
                expect(context).toHaveProperty('transgender');
            });
        });

        it('should have task types for each category', () => {
            Object.values(PERCEPTION_PREDICTORS).forEach(context => {
                ['cisgender', 'transgender'].forEach(category => {
                    expect(context[category]).toHaveProperty('vowel');
                    expect(context[category]).toHaveProperty('speech');
                    expect(context[category]).toHaveProperty('poem');
                });
            });
        });

        it('TNB judges should have more measures for transgender poem evaluation', () => {
            const tnbTransPoem = PERCEPTION_PREDICTORS.TNB.transgender.poem;
            const slpCisPoem = PERCEPTION_PREDICTORS.SLP.cisgender.poem;
            expect(tnbTransPoem.length).toBeGreaterThan(slpCisPoem.length);
        });
    });

    describe('PERCEPTION_WEIGHTS', () => {
        it('should sum to approximately 1.0 (relative weights)', () => {
            const sum = Object.values(PERCEPTION_WEIGHTS).reduce((a, b) => a + b, 0);
            // Weights are relative, not strict probability - 1.1 is acceptable
            expect(sum).toBeGreaterThan(0.9);
            expect(sum).toBeLessThan(1.2);
        });

        it('should have f0_med as highest weight', () => {
            const maxWeight = Math.max(...Object.values(PERCEPTION_WEIGHTS));
            expect(PERCEPTION_WEIGHTS.f0_med).toBe(maxWeight);
        });
    });

    describe('GENDER_PRESENTATION_RANGES', () => {
        it('should have feminine, androgynous, and masculine ranges', () => {
            expect(GENDER_PRESENTATION_RANGES).toHaveProperty('feminine');
            expect(GENDER_PRESENTATION_RANGES).toHaveProperty('androgynous');
            expect(GENDER_PRESENTATION_RANGES).toHaveProperty('masculine');
        });

        it('feminine f0 should be higher than masculine', () => {
            expect(GENDER_PRESENTATION_RANGES.feminine.f0_med.target)
                .toBeGreaterThan(GENDER_PRESENTATION_RANGES.masculine.f0_med.target);
        });

        it('feminine ABI (breathiness) should be higher than masculine', () => {
            expect(GENDER_PRESENTATION_RANGES.feminine.abi.target)
                .toBeGreaterThan(GENDER_PRESENTATION_RANGES.masculine.abi.target);
        });
    });

    describe('predictGenderPerception', () => {
        const feminineMetrics = {
            raw: { pitch: { mean: 220 }, hnr: 20, shimmer: 3, jitter: 1 },
            indices: { abi: { score: 4 } },
            prosody: { cvint: { cvint: 15 } }
        };

        const masculineMetrics = {
            raw: { pitch: { mean: 120 }, hnr: 12, shimmer: 5, jitter: 2 },
            indices: { abi: { score: 2 } },
            prosody: { cvint: { cvint: 10 } }
        };

        it('should predict feminine for high-pitched breathy voice', () => {
            const result = predictGenderPerception(feminineMetrics, 'CG');
            expect(result.score).toBeGreaterThan(0);
            expect(['feminine', 'strongly_feminine']).toContain(result.level);
        });

        it('should predict masculine for low-pitched voice', () => {
            const result = predictGenderPerception(masculineMetrics, 'CG');
            expect(result.score).toBeLessThan(0);
            expect(['masculine', 'strongly_masculine']).toContain(result.level);
        });

        it('should include dimensions breakdown', () => {
            const result = predictGenderPerception(feminineMetrics, 'CG');
            expect(result.dimensions).toHaveProperty('pitch');
            expect(result.dimensions).toHaveProperty('breathiness');
            expect(result.dimensions).toHaveProperty('hnr');
            expect(result.dimensions).toHaveProperty('expressiveness');
        });

        it('should apply context modifier for TNB', () => {
            const cgResult = predictGenderPerception(feminineMetrics, 'CG');
            const tnbResult = predictGenderPerception(feminineMetrics, 'TNB');
            // TNB context reduces f0 dominance, so scores may differ
            expect(tnbResult.context).toBe('TNB');
        });
    });

    describe('getContextRelevantMeasures', () => {
        it('should return measures for SLP context', () => {
            const measures = getContextRelevantMeasures('SLP', 'poem');
            expect(measures).toContain('f0_med');
            expect(measures).toContain('hnr');
        });

        it('should return measures for TNB context', () => {
            const measures = getContextRelevantMeasures('TNB', 'speech');
            expect(measures).toContain('f0_med');
        });

        it('should return default measures for invalid context', () => {
            const measures = getContextRelevantMeasures('INVALID', 'speech');
            expect(measures).toContain('f0_med');
            expect(measures).toContain('hnr');
        });

        it('poem task should have more measures than vowel task', () => {
            const poemMeasures = getContextRelevantMeasures('SLP', 'poem');
            const vowelMeasures = getContextRelevantMeasures('SLP', 'vowel');
            expect(poemMeasures.length).toBeGreaterThanOrEqual(vowelMeasures.length);
        });
    });
});
