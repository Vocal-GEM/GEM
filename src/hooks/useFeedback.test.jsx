import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFeedback } from './useFeedback';

describe('useFeedback', () => {
    let audioEngineMock;
    let dataRefMock;

    beforeEach(() => {
        vi.useFakeTimers();
        audioEngineMock = {
            current: {
                triggerVibration: vi.fn(),
                playFeedbackTone: vi.fn(),
            }
        };
        dataRefMock = {
            current: {
                pitch: 250, // High pitch
                isSilent: false,
            }
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should trigger feedback when enabled and condition is met', () => {
        const { result } = renderHook(() =>
            useFeedback(audioEngineMock, dataRefMock, {
                metric: 'pitch',
                target: { min: 100, max: 200 }, // Target is 100-200, current is 250 (High)
            })
        );

        // Enable haptic feedback
        act(() => {
            result.current.setSettings(prev => ({ ...prev, haptic: true, condition: 'high' }));
        });

        // Advance time by 110ms (interval is 100ms)
        act(() => {
            vi.advanceTimersByTime(110);
        });

        expect(audioEngineMock.current.triggerVibration).toHaveBeenCalled();
    });

    it('should NOT reset interval on re-render with new config object', () => {
        const { result, rerender } = renderHook(
            ({ config }) => useFeedback(audioEngineMock, dataRefMock, config),
            {
                initialProps: {
                    config: {
                        metric: 'pitch',
                        target: { min: 100, max: 200 },
                    }
                }
            }
        );

        // Enable haptic feedback
        act(() => {
            result.current.setSettings(prev => ({ ...prev, haptic: true, condition: 'high' }));
        });

        // Advance 50ms
        act(() => {
            vi.advanceTimersByTime(50);
        });

        // Re-render with NEW config object (same values)
        rerender({
            config: {
                metric: 'pitch',
                target: { min: 100, max: 200 },
            }
        });

        // Advance another 60ms (Total 110ms)
        // If interval was reset at 50ms, it would fire at 50+100=150ms.
        // If interval was NOT reset, it should fire at 100ms.
        act(() => {
            vi.advanceTimersByTime(60);
        });

        // Check if it fired
        expect(audioEngineMock.current.triggerVibration).toHaveBeenCalled();
    });
});
