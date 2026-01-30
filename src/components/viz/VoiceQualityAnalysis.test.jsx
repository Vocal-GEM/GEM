import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import { QuadCoreAnalysisService } from '../../services/QuadCoreAnalysisService';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { ProfileProvider } from '../../context/ProfileContext';

// Mock dependencies
vi.mock('../../services/QuadCoreAnalysisService');
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { LOW: 3 }
    }
}));
vi.mock('../../context/ProfileContext', () => ({
    useProfile: vi.fn().mockReturnValue({}),
    ProfileProvider: ({ children }) => <div>{children}</div>
}));

describe('VoiceQualityAnalysis', () => {
    let mockAnalyze;

    beforeEach(() => {
        mockAnalyze = vi.fn().mockReturnValue({
            scores: {
                texture: { score: 1, label: 'Soft', value: -60 },
                health: { status: 'Flow', label: 'Balanced', value: -15 },
                color: { percentage: 80, label: 'Bright', value: 2000 },
                mix: { percentage: 50, label: 'Mix', value: 1.0 }
            },
            feedback: { type: 'success', message: 'Good job' }
        });

        QuadCoreAnalysisService.prototype.analyze = mockAnalyze;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        const dataRef = { current: { volume: 0.1 } };
        render(
            <ProfileProvider>
                <VoiceQualityAnalysis dataRef={dataRef} isAudioActive={false} />
            </ProfileProvider>
        );
        expect(screen.getByText('Quad-Core Analyzer')).toBeInTheDocument();
    });

    it('subscribes to RenderCoordinator when audio is active', () => {
        const dataRef = { current: { volume: 0.1 } };
        render(
            <ProfileProvider>
                <VoiceQualityAnalysis dataRef={dataRef} isAudioActive={true} />
            </ProfileProvider>
        );
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    it('throttles UI updates', () => {
        vi.useFakeTimers();
        const dataRef = { current: { volume: 0.1 } };

        let callback;
        renderCoordinator.subscribe.mockImplementation((id, cb) => {
            callback = cb;
            return vi.fn();
        });

        render(
            <ProfileProvider>
                <VoiceQualityAnalysis dataRef={dataRef} isAudioActive={true} />
            </ProfileProvider>
        );

        // First call - should trigger full analysis
        act(() => {
            callback();
        });

        // analyze called with onlyUpdateHistory = false (3rd arg) because it's the first run
        expect(mockAnalyze).toHaveBeenCalledWith(expect.anything(), expect.anything(), false);
        mockAnalyze.mockClear();

        // Immediate second call - should be throttled
        act(() => {
            callback();
        });

        // analyze called with onlyUpdateHistory = true
        expect(mockAnalyze).toHaveBeenCalledWith(expect.anything(), expect.anything(), true);
        mockAnalyze.mockClear();

        // Advance time by 150ms
        act(() => {
            vi.advanceTimersByTime(150);
            callback();
        });

        // Should be unthrottled now
        expect(mockAnalyze).toHaveBeenCalledWith(expect.anything(), expect.anything(), false);

        vi.useRealTimers();
    });
});
