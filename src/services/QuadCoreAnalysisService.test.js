import { describe, it, expect, beforeEach } from 'vitest';
import { QuadCoreAnalysisService } from './QuadCoreAnalysisService';

describe('QuadCoreAnalysisService', () => {
    let service;

    beforeEach(() => {
        service = new QuadCoreAnalysisService();
    });

    it('initializes with empty history', () => {
        expect(service.volumeHistory).toEqual([]);
        expect(service.isSpeaking).toBe(false);
    });

    it('returns null for low volume', () => {
        const result = service.analyze({ volume: 0.001 }, {});
        expect(result).toBeNull();
    });

    it('returns analysis results for speaking volume', () => {
        const input = {
            volume: 0.1,
            f3Noise: -55,
            tilt: -12,
            f2: 1500,
            harmonicRatio: 1.5
        };
        const targets = { targetF2: 2000 };

        const result = service.analyze(input, targets);

        expect(result).not.toBeNull();
        expect(result.scores).toBeDefined();
        expect(result.scores.texture).toBeDefined();
        expect(result.scores.health).toBeDefined();
        expect(result.scores.color).toBeDefined();
        expect(result.scores.mix).toBeDefined();
    });

    it('tracks volume history', () => {
         const input = {
            volume: 0.1,
            f3Noise: -55,
            tilt: -12,
            f2: 1500,
            harmonicRatio: 1.5
        };
        service.analyze(input, {});
        expect(service.volumeHistory.length).toBe(1);
        expect(service.volumeHistory[0]).toBe(0.1);

        // Fill history
        for(let i=0; i<15; i++) {
             service.analyze(input, {});
        }
        // Should be capped at 10
        expect(service.volumeHistory.length).toBe(10);
    });

    it('updates history but returns null when computeScores is false', () => {
         const input = {
            volume: 0.1,
            f3Noise: -55,
            tilt: -12,
            f2: 1500,
            harmonicRatio: 1.5
        };
        // Initial state
        expect(service.volumeHistory.length).toBe(0);

        // Call with computeScores = false
        const result = service.analyze(input, {}, false);

        // Should return null
        expect(result).toBeNull();

        // But history should be updated
        expect(service.volumeHistory.length).toBe(1);
        expect(service.volumeHistory[0]).toBe(0.1);
    });
});
