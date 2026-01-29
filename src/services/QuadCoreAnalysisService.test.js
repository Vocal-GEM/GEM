import { describe, it, expect, beforeEach } from 'vitest';
import { QuadCoreAnalysisService } from './QuadCoreAnalysisService';

describe('QuadCoreAnalysisService', () => {
    let service;
    const mockData = {
        pitch: 200,
        volume: 0.1,
        tilt: -12,
        f2: 1500,
        f3Noise: -70,
        harmonicRatio: 1.5
    };
    const mockTargets = {
        targetF2: 2000
    };

    beforeEach(() => {
        service = new QuadCoreAnalysisService();
    });

    it('should initialize with empty history', () => {
        expect(service.volumeHistory).toEqual([]);
    });

    it('should update volumeHistory when analyze is called', () => {
        service.analyze(mockData, mockTargets);
        expect(service.volumeHistory).toHaveLength(1);
        expect(service.volumeHistory[0]).toBe(0.1);
    });

    it('should return analysis results by default', () => {
        const result = service.analyze(mockData, mockTargets);
        expect(result).not.toBeNull();
        expect(result.scores).toBeDefined();
        expect(result.feedback).toBeDefined();
    });

    it('should update history but return null when onlyUpdateHistory is true', () => {
        const result = service.analyze(mockData, mockTargets, true);

        // Should return null (performance optimization)
        expect(result).toBeNull();

        // But history SHOULD be updated
        expect(service.volumeHistory).toHaveLength(1);
        expect(service.volumeHistory[0]).toBe(0.1);
    });

    it('should respect volume threshold even with onlyUpdateHistory', () => {
        const silentData = { ...mockData, volume: 0.001 };
        const result = service.analyze(silentData, mockTargets, true);
        expect(result).toBeNull();
        // History should NOT be updated because of early return for silence
        expect(service.volumeHistory).toHaveLength(0);
    });
});
