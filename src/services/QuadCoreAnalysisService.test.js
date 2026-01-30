import { describe, it, expect, beforeEach } from 'vitest';
import { QuadCoreAnalysisService } from './QuadCoreAnalysisService';

describe('QuadCoreAnalysisService', () => {
    let service;
    const mockData = {
        volume: 0.1,
        pitch: 200,
        tilt: -10,
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

    it('should initialize with default values', () => {
        expect(service.history).toEqual([]);
        expect(service.volumeHistory).toEqual([]);
        expect(service.isSpeaking).toBe(false);
    });

    it('should return null if volume is too low', () => {
        const result = service.analyze({ ...mockData, volume: 0.005 }, mockTargets);
        expect(result).toBeNull();
        expect(service.isSpeaking).toBe(false);
    });

    it('should return full analysis result by default', () => {
        const result = service.analyze(mockData, mockTargets);
        expect(result).not.toBeNull();
        expect(result.scores).toBeDefined();
        expect(result.feedback).toBeDefined();
        expect(service.volumeHistory.length).toBe(1);
    });

    it('should update volume history correctly', () => {
        service.analyze(mockData, mockTargets);
        expect(service.volumeHistory).toEqual([0.1]);

        service.analyze({ ...mockData, volume: 0.2 }, mockTargets);
        expect(service.volumeHistory).toEqual([0.1, 0.2]);
    });

    it('should return null when onlyUpdateHistory is true, but update internal state', () => {
        // First call normal to set initial state
        service.analyze(mockData, mockTargets);
        expect(service.volumeHistory.length).toBe(1);

        // Second call with onlyUpdateHistory=true
        const result = service.analyze({ ...mockData, volume: 0.2 }, mockTargets, true);

        // Should return null (no expensive object creation)
        expect(result).toBeNull();

        // But internal state should be updated
        expect(service.volumeHistory.length).toBe(2);
        expect(service.volumeHistory[1]).toBe(0.2);
    });
});
