import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import FeedbackManager from './FeedbackManager';
import { useSettings } from '../../context/SettingsContext';
import { getAdaptiveFeedbackController } from '../../services/AdaptiveFeedback';

// Mocks
vi.mock('../../context/SettingsContext', () => ({
    useSettings: vi.fn(),
}));

vi.mock('../../services/AdaptiveFeedback', () => ({
    getAdaptiveFeedbackController: vi.fn(),
}));

vi.mock('../../utils/FlowStateDetector', () => {
    return {
        default: class MockFlowStateDetector {
            update() {}
            getStats() { return { isFlowState: false }; }
        }
    };
});

vi.mock('../ui/CelebrationAnimations', () => ({
    default: () => null,
}));

// Mock DriftAlert to track renders
const driftAlertRenderSpy = vi.fn();
vi.mock('../ui/DriftAlert', () => ({
    default: (props) => {
        driftAlertRenderSpy(props);
        return <div data-testid="drift-alert" />;
    }
}));

// Mock HapticFeedback
vi.mock('../../services/HapticFeedback', () => ({
    default: {
        play: vi.fn()
    }
}));

describe('FeedbackManager Performance', () => {
    let dataRef;

    beforeEach(() => {
        vi.useFakeTimers();
        driftAlertRenderSpy.mockClear();
        dataRef = { current: { pitch: 200 } };
        useSettings.mockReturnValue({
            settings: { feedback: { sensitivity: 0.5 } }
        });
        getAdaptiveFeedbackController.mockReturnValue({
            getThresholds: () => ({ feedbackDelay: 100 })
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('renders minimal times with optimized implementation', () => {
        const { unmount } = render(
            <FeedbackManager
                dataRef={dataRef}
                targetRange={{ min: 190, max: 210 }}
                active={true}
            />
        );

        // Initial render
        expect(driftAlertRenderSpy).toHaveBeenCalledTimes(1);

        // Advance time 500ms (5 ticks)
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Simulate pitch changing slightly (but still in range)
        dataRef.current.pitch = 201;
        act(() => { vi.advanceTimersByTime(100); });

        dataRef.current.pitch = 202;
        act(() => { vi.advanceTimersByTime(100); });

        dataRef.current.pitch = 203;
        act(() => { vi.advanceTimersByTime(100); });

        // Should NOT render more times because pitch is within range and no state changed
        expect(driftAlertRenderSpy).toHaveBeenCalledTimes(1);

        unmount();
    });

    it('renders when drift is detected', () => {
        const { unmount } = render(
            <FeedbackManager
                dataRef={dataRef}
                targetRange={{ min: 190, max: 210 }}
                active={true}
            />
        );

        driftAlertRenderSpy.mockClear();

        // Simulate pitch out of range (tolerance is 20, target is 200, so > 220 is required)
        dataRef.current.pitch = 225; // High

        // Advance time to trigger drift (threshold 100ms mocked)
        // Need to advance enough time:
        // T+100ms: Detects outside, sets startTime
        // T+200ms: duration (100ms) not exceeded yet (diff=100)
        // T+300ms: duration exceeded (diff=200 > 100) -> State update -> Render
        act(() => {
            vi.advanceTimersByTime(400);
        });

        // Should have re-rendered to show alert
        expect(driftAlertRenderSpy).toHaveBeenCalled();
        const lastCall = driftAlertRenderSpy.mock.lastCall[0];
        expect(lastCall.forceActive).toBe(true);
        expect(lastCall.forceDirection).toBe('high');

        unmount();
    });
});
