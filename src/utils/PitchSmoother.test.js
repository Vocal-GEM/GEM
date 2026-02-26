import { describe, it, expect, beforeEach } from 'vitest';
import { PitchSmoother, createPitchSmoother } from './PitchSmoother';

describe('PitchSmoother', () => {
    let smoother;

    beforeEach(() => {
        smoother = new PitchSmoother(5);
    });

    describe('process', () => {
        it('should pass through null values', () => {
            expect(smoother.process(null)).toBe(null);
            expect(smoother.process(0)).toBe(null);
            expect(smoother.process(-1)).toBe(null);
        });

        it('should return raw pitch when buffer has less than 3 samples', () => {
            expect(smoother.process(200)).toBe(200);
            expect(smoother.process(205)).toBe(205);
        });

        it('should return median after buffer fills', () => {
            smoother.process(200);
            smoother.process(205);
            smoother.process(210);
            smoother.process(215);
            const result = smoother.process(220);

            // Median of [200, 205, 210, 215, 220] is 210
            expect(result).toBe(210);
        });

        it('should reject outliers using median', () => {
            smoother.process(200);
            smoother.process(202);
            smoother.process(198);
            smoother.process(201);
            const result = smoother.process(500); // Outlier

            // Should return median, not the outlier
            expect(result).toBeLessThan(250);
        });

        it('should detect and correct octave errors (too high)', () => {
            smoother.process(200);
            smoother.process(202);
            smoother.process(198);
            smoother.process(201);
            const result = smoother.process(400); // Octave too high (2x)

            // Should correct down by octave
            expect(result).toBe(200); // 400 / 2
        });

        it('should detect and correct octave errors (too low)', () => {
            smoother.process(400);
            smoother.process(402);
            smoother.process(398);
            smoother.process(401);
            const result = smoother.process(200); // Octave too low (0.5x)

            // Should correct up by octave
            expect(result).toBe(400); // 200 * 2
        });

        it('should use median for extreme outliers', () => {
            smoother.process(200);
            smoother.process(202);
            smoother.process(198);
            smoother.process(201);
            const result = smoother.process(1000); // Way too high

            // Should use median instead (median of [200, 202, 198, 201, 1000] is 201)
            expect(result).toBeCloseTo(201, 0);
        });
    });

    describe('buffer management', () => {
        it('should maintain buffer size', () => {
            for (let i = 0; i < 10; i++) {
                smoother.process(200 + i);
            }

            const buffer = smoother.getBuffer();
            expect(buffer.length).toBe(5); // Window size
        });

        it('should reset buffer', () => {
            smoother.process(200);
            smoother.process(205);
            smoother.reset();

            expect(smoother.getBuffer().length).toBe(0);
        });
    });

    describe('setWindowSize', () => {
        it('should change window size', () => {
            smoother.setWindowSize(7);

            for (let i = 0; i < 10; i++) {
                smoother.process(200 + i);
            }

            expect(smoother.getBuffer().length).toBe(7);
        });

        it('should clamp window size to valid range', () => {
            smoother.setWindowSize(1); // Too small
            expect(smoother.windowSize).toBe(3);

            smoother.setWindowSize(20); // Too large
            expect(smoother.windowSize).toBe(15);
        });

        it('should trim buffer when reducing size', () => {
            for (let i = 0; i < 10; i++) {
                smoother.process(200 + i);
            }

            smoother.setWindowSize(3);
            expect(smoother.getBuffer().length).toBeLessThanOrEqual(3);
        });
    });

    describe('getSmoothingIntensity', () => {
        it('should return 0% for minimum window', () => {
            smoother.setWindowSize(3);
            expect(smoother.getSmoothingIntensity()).toBe(0);
        });

        it('should return 100% for maximum window', () => {
            smoother.setWindowSize(15);
            expect(smoother.getSmoothingIntensity()).toBe(100);
        });

        it('should return ~50% for medium window', () => {
            smoother.setWindowSize(9);
            const intensity = smoother.getSmoothingIntensity();
            expect(intensity).toBeGreaterThan(40);
            expect(intensity).toBeLessThan(60);
        });
    });

    describe('createPitchSmoother', () => {
        it('should create smoother with low intensity', () => {
            const lowSmoother = createPitchSmoother('low');
            expect(lowSmoother.windowSize).toBe(3);
        });

        it('should create smoother with medium intensity', () => {
            const medSmoother = createPitchSmoother('medium');
            expect(medSmoother.windowSize).toBe(5);
        });

        it('should create smoother with high intensity', () => {
            const highSmoother = createPitchSmoother('high');
            expect(highSmoother.windowSize).toBe(9);
        });

        it('should default to medium', () => {
            const defaultSmoother = createPitchSmoother();
            expect(defaultSmoother.windowSize).toBe(5);
        });
    });
});
