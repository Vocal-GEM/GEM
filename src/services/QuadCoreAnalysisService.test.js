import { describe, it, expect } from 'vitest';
import { QuadCoreAnalysisService } from './QuadCoreAnalysisService';

describe('QuadCoreAnalysisService', () => {
    it('should initialize correctly', () => {
        const service = new QuadCoreAnalysisService();
        expect(service.history).toEqual([]);
        expect(service.volumeHistory).toEqual([]);
    });

    it('should analyze data and return scores', () => {
        const service = new QuadCoreAnalysisService();
        const data = {
            volume: 0.1,
            f3Noise: -60,
            tilt: -15,
            f2: 2000,
            harmonicRatio: 1.0
        };
        const targets = { targetF2: 2000 };

        const result = service.analyze(data, targets);
        expect(result).not.toBeNull();
        expect(result.scores).toBeDefined();
        expect(result.scores.texture).toBeDefined();
    });

    it('should respect onlyUpdateHistory flag', () => {
        const service = new QuadCoreAnalysisService();
        const data = {
            volume: 0.1,
            f3Noise: -60,
            tilt: -15,
            f2: 2000,
            harmonicRatio: 1.0
        };
        const targets = { targetF2: 2000 };

        // First call - normal
        const result1 = service.analyze(data, targets, false);
        expect(result1).not.toBeNull();
        expect(service.volumeHistory.length).toBe(1);

        // Second call - onlyUpdateHistory
        const result2 = service.analyze(data, targets, true);
        expect(result2).toBeNull();
        expect(service.volumeHistory.length).toBe(2);
    });

    it('should return null for low volume', () => {
        const service = new QuadCoreAnalysisService();
        const data = { volume: 0.005 };
        const result = service.analyze(data, {});
        expect(result).toBeNull();
    });
});
