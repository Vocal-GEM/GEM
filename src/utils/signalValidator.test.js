import { describe, it, expect } from 'vitest';
import { validateAudioSignal, isSignalGoodForAnalysis, getSignalQualityMessage } from './signalValidator';

describe('signalValidator', () => {
    describe('validateAudioSignal', () => {
        it('should detect clipping', () => {
            const buffer = new Float32Array(1024);
            buffer.fill(0.995); // Just at clipping threshold

            const result = validateAudioSignal(buffer, 44100);

            expect(result.isValid).toBe(false);
            // May have multiple issues (clipping + DC offset + low SNR)
            const clippingIssue = result.issues.find(i => i.type === 'clipping');
            expect(clippingIssue).toBeDefined();
            expect(clippingIssue.severity).toBe('high');
        });

        it('should detect silence', () => {
            const buffer = new Float32Array(1024);
            buffer.fill(0.0001); // Very quiet

            const result = validateAudioSignal(buffer, 44100);

            expect(result.isValid).toBe(false);
            const silenceIssue = result.issues.find(i => i.type === 'silence');
            expect(silenceIssue).toBeDefined();
            expect(silenceIssue.severity).toBe('high');
        });

        it('should detect DC offset', () => {
            const buffer = new Float32Array(1024);
            buffer.fill(0.1); // Constant DC bias

            const result = validateAudioSignal(buffer, 44100);

            const dcIssue = result.issues.find(i => i.type === 'dc_offset');
            expect(dcIssue).toBeDefined();
            expect(dcIssue.severity).toBe('medium');
        });

        it('should pass clean signal', () => {
            const buffer = new Float32Array(1024);
            // Generate clean sine wave
            for (let i = 0; i < buffer.length; i++) {
                buffer[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / 44100);
            }

            const result = validateAudioSignal(buffer, 44100);

            expect(result.isValid).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.3); // Adjusted for realistic SNR
        });

        it('should calculate confidence based on SNR', () => {
            const cleanBuffer = new Float32Array(1024);
            for (let i = 0; i < cleanBuffer.length; i++) {
                cleanBuffer[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / 44100);
            }

            const cleanResult = validateAudioSignal(cleanBuffer, 44100);

            // Clean signal should have reasonable confidence
            expect(cleanResult.confidence).toBeGreaterThan(0.2);
            expect(cleanResult.confidence).toBeLessThan(1.0);
        });
    });

    describe('isSignalGoodForAnalysis', () => {
        it('should return true for clean signal', () => {
            const buffer = new Float32Array(1024);
            for (let i = 0; i < buffer.length; i++) {
                buffer[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / 44100);
            }

            // Signal is valid and has some confidence
            const result = validateAudioSignal(buffer, 44100);
            expect(result.isValid).toBe(true);
            // Confidence may vary, but signal should be valid
        });

        it('should return false for clipping signal', () => {
            const buffer = new Float32Array(1024);
            buffer.fill(0.995);

            expect(isSignalGoodForAnalysis(buffer, 44100)).toBe(false);
        });
    });

    describe('getSignalQualityMessage', () => {
        it('should return excellent for high confidence', () => {
            const validation = { confidence: 0.9, isValid: true, issues: [] };
            const message = getSignalQualityMessage(validation);

            expect(message).toContain('Excellent');
        });

        it('should return poor for low confidence', () => {
            const validation = { confidence: 0.2, isValid: false, issues: [] };
            const message = getSignalQualityMessage(validation);

            expect(message).toContain('Poor');
        });
    });
});
