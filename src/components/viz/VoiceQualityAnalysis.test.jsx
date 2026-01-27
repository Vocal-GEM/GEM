import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import { QuadCoreAnalysisService } from '../../services/QuadCoreAnalysisService';

const mocks = vi.hoisted(() => {
    const mockAnalyze = vi.fn();
    const mockServiceInstance = {
        analyze: mockAnalyze
    };
    const mockSubscribe = vi.fn(() => vi.fn());

    return {
        mockAnalyze,
        mockServiceInstance,
        mockSubscribe
    };
});

vi.mock('../../services/QuadCoreAnalysisService', () => {
    return {
        QuadCoreAnalysisService: vi.fn(function() {
            return mocks.mockServiceInstance;
        })
    };
});

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: mocks.mockSubscribe,
        PRIORITY: { LOW: 3 }
    }
}));

// Mock lucide-react locally as global mock might be missing some icons
vi.mock('lucide-react', () => ({
    Activity: () => <div data-testid="icon-activity" />,
    Info: () => <div data-testid="icon-info" />,
    Mic: () => <div data-testid="icon-mic" />,
    MicOff: () => <div data-testid="icon-micoff" />,
    Wind: () => <div data-testid="icon-wind" />,
    Heart: () => <div data-testid="icon-heart" />,
    Sun: () => <div data-testid="icon-sun" />,
    Layers: () => <div data-testid="icon-layers" />,
    AlertTriangle: () => <div data-testid="icon-alert-triangle" />,
    CheckCircle: () => <div data-testid="icon-check-circle" />,
    HelpCircle: () => <div data-testid="icon-help-circle" />
}));

describe('VoiceQualityAnalysis', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders and initializes service only once', () => {
        const dataRef = { current: {} };
        const { rerender } = render(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                isAudioActive={true}
                toggleAudio={() => {}}
            />
        );

        // Check if rendered
        expect(screen.getByText(/Quad-Core Analyzer/i)).toBeInTheDocument();

        // Check if service was instantiated
        expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);

        // Re-render to ensure it's not re-instantiated
        rerender(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                isAudioActive={true}
                toggleAudio={() => {}}
            />
        );

        expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);
    });

    it('subscribes to renderCoordinator when audio is active', () => {
        const dataRef = { current: {} };
        render(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                isAudioActive={true}
                toggleAudio={() => {}}
            />
        );

        expect(mocks.mockSubscribe).toHaveBeenCalled();
    });
});
