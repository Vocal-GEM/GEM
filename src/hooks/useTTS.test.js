import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTTS } from './useTTS';

describe('useTTS', () => {
    let mockSpeechSynthesis;
    let mockUtterance;

    beforeEach(() => {
        mockUtterance = {
            voice: null,
            rate: 1,
            pitch: 1,
            volume: 1,
            onstart: null,
            onend: null,
            onerror: null
        };

        global.SpeechSynthesisUtterance = vi.fn(function() { return mockUtterance; });

        mockSpeechSynthesis = {
            getVoices: vi.fn().mockReturnValue([
                { name: 'Google US English', lang: 'en-US', default: true },
                { name: 'Google UK English Male', lang: 'en-GB', default: false },
                { name: 'Microsoft Zira', lang: 'en-US', default: false }
            ]),
            speak: vi.fn(),
            cancel: vi.fn(),
            onvoiceschanged: null
        };

        global.window.speechSynthesis = mockSpeechSynthesis;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with supported status', () => {
        const { result } = renderHook(() => useTTS());
        expect(result.current.supported).toBe(true);
    });

    it('should load voices', () => {
        const { result } = renderHook(() => useTTS());
        expect(result.current.voices).toHaveLength(3);
    });

    it('should select best voice for gender', () => {
        const { result } = renderHook(() => useTTS());

        const femVoice = result.current.getBestVoice('fem');
        expect(femVoice.name).toContain('Zira'); // Should match 'zira' keyword

        const mascVoice = result.current.getBestVoice('masc');
        expect(mascVoice.name).toContain('Male'); // Should match 'male' keyword
    });

    it('should speak text', () => {
        const { result } = renderHook(() => useTTS());

        act(() => {
            result.current.speak('Hello');
        });

        expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
        expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('Hello');
    });

    it('should cancel speech', () => {
        const { result } = renderHook(() => useTTS());

        act(() => {
            result.current.cancel();
        });

        expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });
});
