import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { QuadCoreAnalysisService } from '../../services/QuadCoreAnalysisService';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { LOW: 3 }
    }
}));

vi.mock('../../services/QuadCoreAnalysisService', () => {
    // Define the mock implementation
    const analyzeMock = vi.fn().mockReturnValue({
        scores: {
            texture: { score: 0, label: 'Clear', value: -70 },
            health: { status: 'Flow', label: 'Balanced', value: -12 },
            color: { percentage: 80, label: 'On Target', value: 2000 },
            mix: { percentage: 50, label: 'Mix', value: 1.0 }
        },
        feedback: { type: 'neutral', message: 'Listening...' }
    });

    return {
        QuadCoreAnalysisService: vi.fn(function() {
            this.analyze = analyzeMock;
        })
    };
});

// Mock lucide-react locally to ensure MicOff is available
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const React = require('react');
    const createIcon = (name) => {
        const Icon = (props) => React.createElement('svg', { ...props, 'data-testid': `icon-${name}` });
        Icon.displayName = `Icon${name}`;
        return Icon;
    };

    return {
        ...actual,
        Activity: createIcon('activity'),
        Info: createIcon('info'),
        Mic: createIcon('mic'),
        MicOff: createIcon('mic-off'),
        Wind: createIcon('wind'),
        Heart: createIcon('heart'),
        Sun: createIcon('sun'),
        Layers: createIcon('layers'),
        AlertTriangle: createIcon('alert-triangle'),
        CheckCircle: createIcon('check-circle'),
        HelpCircle: createIcon('help-circle')
    };
});

describe('VoiceQualityAnalysis', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('instantiates QuadCoreAnalysisService only once', () => {
        const dataRef = { current: {} };
        const { rerender } = render(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={false}
                toggleAudio={() => {}}
                isAudioActive={false}
            />
        );

        expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);

        // Rerender with different props
        rerender(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={true}
                toggleAudio={() => {}}
                isAudioActive={false}
            />
        );

        expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);
    });

    it('subscribes to renderCoordinator when audio is active', () => {
        const dataRef = { current: {} };
        render(
            <VoiceQualityAnalysis
                dataRef={dataRef}
                colorBlindMode={false}
                toggleAudio={() => {}}
                isAudioActive={true}
            />
        );

        expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
            expect.stringContaining('VoiceQualityAnalysis-'),
            expect.any(Function),
            renderCoordinator.PRIORITY.LOW
        );
    });
});
