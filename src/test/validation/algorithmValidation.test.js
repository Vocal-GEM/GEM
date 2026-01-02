
import { describe, it, expect, beforeAll } from 'vitest';
import { PitchEnsemble } from '../../utils/pitchEnsemble';
import { FormantTracker } from '../../utils/formantTracker';
import praatReferences from './praatReferences.json';

// Helper to synthesize audio for testing (since we don't have the actual WAV files in repo)
const synthesizeAudio = (praatValues, duration = 1.0, sampleRate = 44100) => {
    const numSamples = Math.floor(duration * sampleRate);
    const buffer = new Float32Array(numSamples);
    const dt = 1 / sampleRate;

    const f0 = praatValues.meanPitch;

    // Synthesize a complex tone with harmonics and formants
    for (let i = 0; i < numSamples; i++) {
        const t = i * dt;
        let sample = 0;

        // Source: glottal pulse approximation (sawtooth-like)
        for (let k = 1; k <= 20; k++) {
            if (k * f0 > sampleRate / 2) break;
            const amp = 1 / k; // Spectral tilt -6dB/octave roughly
            sample += amp * Math.sin(2 * Math.PI * k * f0 * t);
        }

        // Simple jitter simulation
        if (praatValues.jitter) {
            // Advanced jitter simulation would go here
        }

        // Apply formant filtering (simplified additive synthesis for formants here for robustness)
        // Real implementation would use biquad filters on source
        // Here we just boost harmonics near formants
        if (praatValues.f1) {
            const f1 = praatValues.f1;
            sample += 0.5 * Math.sin(2 * Math.PI * f1 * t);
        }
        if (praatValues.f2) {
            const f2 = praatValues.f2;
            sample += 0.3 * Math.sin(2 * Math.PI * f2 * t);
        }

        buffer[i] = sample;
    }

    // Normalize
    const maxAmp = Math.max(...buffer.map(Math.abs));
    if (maxAmp > 0) {
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] /= maxAmp;
        }
    }

    return buffer;
};

describe('Algorithm Validation against PRAAT', () => {
    let pitchEnsemble;
    let formantTracker;

    beforeAll(() => {
        pitchEnsemble = new PitchEnsemble();
        formantTracker = new FormantTracker(44100);
    });

    praatReferences.forEach(ref => {
        it(`accurately estimates pitch for ${ref.description}`, () => {
            const audioBuffer = synthesizeAudio(ref.praatValues, 0.5);
            const result = pitchEnsemble.detectPitch(audioBuffer, 44100);

            expect(result).not.toBeNull();
            expect(result.pitch).not.toBeNull();

            // Allow 5% deviation due to synthesis vs real recording differences
            const error = Math.abs(result.pitch - ref.praatValues.meanPitch);
            const percentError = (error / ref.praatValues.meanPitch) * 100;

            expect(percentError).toBeLessThan(5);
        });

        if (ref.praatValues.f1 && ref.praatValues.f2) {
            it(`accurately estimates formants for ${ref.description}`, () => {
                const audioBuffer = synthesizeAudio(ref.praatValues, 0.5);
                const formants = formantTracker.extractFormants(audioBuffer);

                expect(formants.F1).not.toBeNull();
                expect(formants.F2).not.toBeNull();

                // Formant estimation is tricky on synthetic simple waves, allow 15%
                const f1Error = Math.abs(formants.F1 - ref.praatValues.f1) / ref.praatValues.f1;
                const f2Error = Math.abs(formants.F2 - ref.praatValues.f2) / ref.praatValues.f2;

                expect(f1Error * 100).toBeLessThan(15);
                expect(f2Error * 100).toBeLessThan(15);
            });
        }
    });

    it('handles diverse voice types correctly', () => {
        // Check range logic
        const lowPitch = synthesizeAudio({ meanPitch: 100 });
        const highPitch = synthesizeAudio({ meanPitch: 250 });

        const lowResult = pitchEnsemble.detectPitch(lowPitch, 44100);
        const highResult = pitchEnsemble.detectPitch(highPitch, 44100);

        expect(lowResult.pitch).toBeLessThan(150);
        expect(highResult.pitch).toBeGreaterThan(200);
    });
});
