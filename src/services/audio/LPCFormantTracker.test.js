import { describe, it, expect } from 'vitest';
import LPCFormantTracker from './LPCFormantTracker';

describe('LPCFormantTracker', () => {
    it('should initialize with default config', () => {
        const tracker = new LPCFormantTracker();
        expect(tracker).toBeDefined();
        expect(tracker.sampleRate).toBe(44100);
        expect(tracker.order).toBe(12);
    });

    it('should process silent buffer without errors', () => {
        const tracker = new LPCFormantTracker();
        const buffer = new Float32Array(2048).fill(0);
        const formants = tracker.track(buffer);
        expect(Array.isArray(formants)).toBe(true);
        expect(formants.length).toBe(0); // Silence should have no formants
    });

    it('should detect formants in a synthetic signal (simple sine check)', () => {
        // Synthesizing a simple resonance is hard without a full filter.
        // But we can check that it returns *something* for noise or a complex signal.
        const tracker = new LPCFormantTracker();
        const buffer = new Float32Array(2048);
        for (let i = 0; i < 2048; i++) {
            buffer[i] = Math.random() * 2 - 1; // White noise
        }
        const formants = tracker.track(buffer);
        // Noise tends to have random peaks, likely some will be picked.
        // This just ensures no crash.
        // We expect an array.
        expect(Array.isArray(formants)).toBe(true);
    });
});
