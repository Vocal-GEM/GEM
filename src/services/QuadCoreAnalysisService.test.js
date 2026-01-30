import { describe, it, expect, beforeEach } from 'vitest';
import { QuadCoreAnalysisService } from './QuadCoreAnalysisService';

describe('QuadCoreAnalysisService', () => {
    let service;

    beforeEach(() => {
        service = new QuadCoreAnalysisService();
    });

    it('should initialize with default state', () => {
        expect(service.history).toEqual([]);
        expect(service.volumeHistory).toEqual([]);
        expect(service.isSpeaking).toBe(false);
    });

    it('should return null for silence or low volume', () => {
        const result = service.analyze({ volume: 0.005 }, {});
        expect(result).toBeNull();
        expect(service.isSpeaking).toBe(false);
    });

    it('should detect onset and set isSpeaking to true', () => {
        // First frame above threshold
        const result = service.analyze({ volume: 0.05, f3Noise: -70, tilt: -15, f2: 1500, harmonicRatio: 1.0 }, { targetF2: 2000 });

        expect(service.isSpeaking).toBe(true);
        expect(service.lastOnset).toBeGreaterThan(0);
        expect(result).not.toBeNull();
        expect(result.scores).toBeDefined();
    });

    it('should track volume history', () => {
        service.analyze({ volume: 0.1, f3Noise: -70, tilt: -15, f2: 1500, harmonicRatio: 1.0 }, {});
        service.analyze({ volume: 0.2, f3Noise: -70, tilt: -15, f2: 1500, harmonicRatio: 1.0 }, {});

        expect(service.volumeHistory.length).toBe(2);
        expect(service.volumeHistory).toEqual([0.1, 0.2]);
    });

    it('should maintain max 10 items in volume history', () => {
        for (let i = 0; i < 15; i++) {
            service.analyze({ volume: 0.1, f3Noise: -70, tilt: -15, f2: 1500, harmonicRatio: 1.0 }, {});
        }
        expect(service.volumeHistory.length).toBe(10);
    });

    it('should support onlyUpdateHistory flag (optimization)', () => {
        // Initial state
        expect(service.volumeHistory.length).toBe(0);

        // Call with optimization flag
        const result = service.analyze(
            { volume: 0.3, f3Noise: -70, tilt: -15, f2: 1500, harmonicRatio: 1.0 },
            {},
            { onlyUpdateHistory: true }
        );

        // Expect null result (computation skipped)
        expect(result).toBeNull();

        // But expect history to be updated
        expect(service.volumeHistory.length).toBe(1);
        expect(service.volumeHistory[0]).toBe(0.3);
    });
});
