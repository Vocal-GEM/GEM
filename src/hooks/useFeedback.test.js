import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFeedback } from './useFeedback';

describe('useFeedback', () => {
    let audioEngineRef;
    let dataRef;
    let mockTriggerVibration;
    let mockPlayFeedbackTone;

    beforeEach(() => {
        vi.useFakeTimers();
        mockTriggerVibration = vi.fn();
        mockPlayFeedbackTone = vi.fn();

        audioEngineRef = {
            current: {
                triggerVibration: mockTriggerVibration,
                playFeedbackTone: mockPlayFeedbackTone
            }
        };

        dataRef = {
            current: {
                pitch: 150,
                resonance: 200,
                weight: 100,
                isSilent: false
            }
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('initializes with correct default settings', () => {
        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef));

        expect(result.current.settings).toEqual({
            haptic: false,
            tone: false,
            condition: 'both'
        });
    });

    it('does not trigger feedback when both haptic and tone are disabled', () => {
        renderHook(() => useFeedback(audioEngineRef, dataRef));

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(mockTriggerVibration).not.toHaveBeenCalled();
        expect(mockPlayFeedbackTone).not.toHaveBeenCalled();
    });

    it('triggers haptic feedback when value exceeds maximum', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        // Enable haptic
        act(() => {
            result.current.setSettings({ haptic: true, tone: false, condition: 'both' });
        });

        // Set pitch above max
        dataRef.current.pitch = 250;

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockTriggerVibration).toHaveBeenCalledWith([30]);
    });

    it('triggers tone feedback when value is below minimum', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 },
            targetFreq: 190
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        // Enable tone
        act(() => {
            result.current.setSettings({ haptic: false, tone: true, condition: 'both' });
        });

        // Set pitch below min
        dataRef.current.pitch = 150;

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockPlayFeedbackTone).toHaveBeenCalledWith(190);
    });

    it('triggers both haptic and tone when both are enabled', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 },
            targetFreq: 190
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: true, condition: 'both' });
        });

        dataRef.current.pitch = 250;

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockTriggerVibration).toHaveBeenCalled();
        expect(mockPlayFeedbackTone).toHaveBeenCalled();
    });

    it('only triggers on "high" condition when configured', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: false, condition: 'high' });
        });

        // Set pitch below min (should not trigger)
        dataRef.current.pitch = 150;
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(mockTriggerVibration).not.toHaveBeenCalled();

        // Set pitch above max (should trigger)
        dataRef.current.pitch = 250;
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(mockTriggerVibration).toHaveBeenCalled();
    });

    it('only triggers on "low" condition when configured', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: false, condition: 'low' });
        });

        // Set pitch above max (should not trigger)
        dataRef.current.pitch = 250;
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(mockTriggerVibration).not.toHaveBeenCalled();

        // Set pitch below min (should trigger)
        dataRef.current.pitch = 150;
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(mockTriggerVibration).toHaveBeenCalled();
    });

    it('does not trigger when value is within range', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: true, condition: 'both' });
        });

        // Set pitch within range
        dataRef.current.pitch = 195;

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockTriggerVibration).not.toHaveBeenCalled();
        expect(mockPlayFeedbackTone).not.toHaveBeenCalled();
    });

    it('does not trigger when data is silent', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: true, condition: 'both' });
        });

        dataRef.current.pitch = 250;
        dataRef.current.isSilent = true;

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockTriggerVibration).not.toHaveBeenCalled();
        expect(mockPlayFeedbackTone).not.toHaveBeenCalled();
    });

    it('debounces feedback triggers (400ms)', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: false, condition: 'both' });
        });

        dataRef.current.pitch = 250;

        // First trigger
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(mockTriggerVibration).toHaveBeenCalledTimes(1);

        // Second trigger too soon (within 400ms)
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(mockTriggerVibration).toHaveBeenCalledTimes(1); // Still 1

        // Third trigger after debounce period
        act(() => {
            vi.advanceTimersByTime(300);
        });
        expect(mockTriggerVibration).toHaveBeenCalledTimes(2); // Now 2
    });

    it('uses default targetFreq (190) when not provided in config', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 230 }
            // No targetFreq - will use the default from the hook (190)
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: false, tone: true, condition: 'both' });
        });

        dataRef.current.pitch = 250;

        act(() => {
            vi.advanceTimersByTime(200);
        });

        // Should use default targetFreq = 190 (from hook's default parameter)
        expect(mockPlayFeedbackTone).toHaveBeenCalledWith(190);
    });

    it('works with different metrics (resonance)', () => {
        const config = {
            metric: 'resonance',
            target: { min: 100, max: 150 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: false, condition: 'both' });
        });

        dataRef.current.resonance = 200; // Above max

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockTriggerVibration).toHaveBeenCalled();
    });

    it('does not trigger when audioEngineRef is not available', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback({ current: null }, dataRef, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: true, condition: 'both' });
        });

        dataRef.current.pitch = 250;

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockTriggerVibration).not.toHaveBeenCalled();
        expect(mockPlayFeedbackTone).not.toHaveBeenCalled();
    });

    it('does not trigger when dataRef is not available', () => {
        const config = {
            metric: 'pitch',
            target: { min: 170, max: 220 }
        };

        const { result } = renderHook(() => useFeedback(audioEngineRef, { current: null }, config));

        act(() => {
            result.current.setSettings({ haptic: true, tone: true, condition: 'both' });
        });

        act(() => {
            vi.advanceTimersByTime(200);
        });

        expect(mockTriggerVibration).not.toHaveBeenCalled();
        expect(mockPlayFeedbackTone).not.toHaveBeenCalled();
    });
});
