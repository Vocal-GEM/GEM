import { describe, it, expect } from 'vitest';
import { DSICalculator } from '../utils/DSICalculator';

describe('Advanced Signal Analysis', () => {

    describe('DSICalculator', () => {
        it('should calculate DSI correctly for normal voice values', () => {
            // Example normal values: MPT=20s, F0High=400Hz, ILow=55dB, Jitter=0.5%
            // DSI = 0.13*20 + 0.0053*400 - 0.26*55 - 1.18*0.5 + 12.4
            // DSI = 2.6 + 2.12 - 14.3 - 0.59 + 12.4 = 2.23
            const params = {
                mpt: 20,
                f0High: 400,
                iLow: 55,
                jitter: 0.5
            };
            const result = DSICalculator.calculate(params);
            expect(result.score).toBeCloseTo(2.23, 1);
            expect(result.severity).toBe('Normal');
        });

        it('should detect severe dysphonia', () => {
            // Example severe values: MPT=5s, F0High=150Hz, ILow=70dB, Jitter=3%
            // DSI = 0.13*5 + 0.0053*150 - 0.26*70 - 1.18*3 + 12.4
            // DSI = 0.65 + 0.795 - 18.2 - 3.54 + 12.4 = -7.895
            const params = {
                mpt: 5,
                f0High: 150,
                iLow: 70,
                jitter: 3
            };
            const result = DSICalculator.calculate(params);
            expect(result.score).toBeLessThan(-5);
            expect(result.severity).toBe('Severe Dysphonia');
        });

        it('should handle missing or zero inputs gracefully', () => {
            const result = DSICalculator.calculate({});
            // DSI = 12.4 (base)
            expect(result.score).toBe(12.4);
        });
    });
});
