import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';

// Mock QuadCoreAnalysisService
const mockAnalyze = vi.fn(() => ({
    scores: {
        texture: { score: 1, label: 'Soft', value: -60 },
        health: { status: 'Flow', label: 'Balanced', value: -12 },
        color: { percentage: 80, label: 'On Target', value: 2000 },
        mix: { percentage: 50, label: 'Mix', value: 1.0 }
    },
    feedback: { type: 'success', title: 'Great job', message: 'Keep it up' }
}));

const mockConstructor = vi.fn();

vi.mock('../../services/QuadCoreAnalysisService', () => {
    return {
        QuadCoreAnalysisService: class {
            constructor() {
                mockConstructor();
            }
            analyze = mockAnalyze;
        }
    };
});

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { LOW: 1 }
    }
}));

// Mock ProfileContext
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        activeProfile: 'fem',
        calibration: {}
    })
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Activity: () => <div data-testid="icon-activity" />,
    Info: () => <div data-testid="icon-info" />,
    Mic: () => <div data-testid="icon-mic" />,
    MicOff: () => <div data-testid="icon-mic-off" />,
    Wind: () => <div data-testid="icon-wind" />,
    Heart: () => <div data-testid="icon-heart" />,
    Sun: () => <div data-testid="icon-sun" />,
    Layers: () => <div data-testid="icon-layers" />,
    AlertTriangle: () => <div data-testid="icon-alert" />,
    CheckCircle: () => <div data-testid="icon-check" />,
    HelpCircle: () => <div data-testid="icon-help" />
}));

describe('VoiceQualityAnalysis', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { pitch: 200, volume: 0.1 } };
        mockConstructor.mockClear();
        mockAnalyze.mockClear();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('instantiates QuadCoreAnalysisService exactly once across renders', () => {
        const { rerender } = render(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={false}
                toggleAudio={() => {}}
                isAudioActive={true}
            />
        );

        // First render should trigger constructor
        expect(mockConstructor).toHaveBeenCalledTimes(1);

        // Re-render with same props
        rerender(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={false}
                toggleAudio={() => {}}
                isAudioActive={true}
            />
        );

        // Constructor should NOT be called again
        expect(mockConstructor).toHaveBeenCalledTimes(1);

        // Re-render with different props
        rerender(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={true}
                toggleAudio={() => {}}
                isAudioActive={false}
            />
        );

        // Constructor should STILL not be called again
        expect(mockConstructor).toHaveBeenCalledTimes(1);
    });

    it('renders the component correctly', () => {
        const { getByText, getAllByTestId } = render(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={false}
                toggleAudio={() => {}}
                isAudioActive={false}
            />
        );

        expect(getByText('Quad-Core Analyzer')).toBeDefined();
        expect(getByText('Texture')).toBeDefined();
        expect(getByText('Health')).toBeDefined();
        expect(getByText('Color')).toBeDefined();
        expect(getByText('Registration')).toBeDefined();
        // Two Activity icons: one in the header, one in the default "Listening..." banner
        expect(getAllByTestId('icon-activity')).toHaveLength(2);
    });
});
