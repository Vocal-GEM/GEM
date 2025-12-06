import { describe, it, expect } from 'vitest';
import { BiofeedbackService } from '../services/BiofeedbackService';

describe('BiofeedbackService', () => {
    describe('calculatePitchScore', () => {
        it('should return perfect score for exact match', () => {
            const result = BiofeedbackService.calculatePitchScore(440, 440);
            expect(result.score).toBe(100);
            expect(result.status).toBe('perfect');
        });

        it('should return perfect score within tolerance', () => {
            const target = 440;
            const current = 442; // Very close
            const result = BiofeedbackService.calculatePitchScore(current, target, 0.5);
            expect(result.score).toBe(100);
            expect(result.status).toBe('perfect');
        });

        it('should return lower score for larger deviation', () => {
            const target = 440;
            const current = 460; // Significantly higher
            const result = BiofeedbackService.calculatePitchScore(current, target, 0.5);
            expect(result.score).toBeLessThan(100);
            expect(result.status).toBe('high');
        });

        it('should handle no input', () => {
            const result = BiofeedbackService.calculatePitchScore(0, 440);
            expect(result.score).toBe(0);
            expect(result.status).toBe('no_input');
        });
    });

    describe('calculateCurveScore', () => {
        it('should return 100 for identical curves', () => {
            const curve = [
                { t: 0, v: 0.5 }, { t: 0.2, v: 0.6 }, { t: 0.4, v: 0.7 },
                { t: 0.6, v: 0.8 }, { t: 0.8, v: 0.9 }, { t: 1.0, v: 1.0 }
            ];
            const score = BiofeedbackService.calculateCurveScore(curve, curve);
            expect(score).toBe(100);
        });

        it('should return 0 for empty user curve', () => {
            const score = BiofeedbackService.calculateCurveScore([], [{ t: 0, v: 0.5 }]);
            expect(score).toBe(0);
        });

        it('should return lower score for different curves', () => {
            const target = [
                { t: 0, v: 0.5 }, { t: 0.2, v: 0.5 }, { t: 0.4, v: 0.5 },
                { t: 0.6, v: 0.5 }, { t: 0.8, v: 0.5 }, { t: 1.0, v: 0.5 }
            ];
            const user = [
                { t: 0, v: 0.6 }, { t: 0.2, v: 0.6 }, { t: 0.4, v: 0.6 },
                { t: 0.6, v: 0.6 }, { t: 0.8, v: 0.6 }, { t: 1.0, v: 0.6 }
            ];
            const score = BiofeedbackService.calculateCurveScore(user, target);
            expect(score).toBeLessThan(100);
            expect(score).toBeGreaterThanOrEqual(0); // Should get some points for existing
        });
    });
});
