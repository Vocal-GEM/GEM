import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import VoiceQualityAnalysis from './VoiceQualityAnalysis';
import { useProfile } from '../../context/ProfileContext';
import { QuadCoreAnalysisService } from '../../services/QuadCoreAnalysisService';

// Mock dependencies
vi.mock('../../context/ProfileContext', () => ({
    useProfile: vi.fn(),
}));

vi.mock('../../services/QuadCoreAnalysisService', () => {
    return {
        QuadCoreAnalysisService: vi.fn().mockImplementation(function() {
            return {
                analyze: vi.fn().mockReturnValue({
                    scores: {
                        texture: { score: 1, label: 'Soft', value: -60 },
                        health: { status: 'Flow', label: 'Balanced', value: -12 },
                        color: { percentage: 80, label: 'Bright', value: 2100 },
                        mix: { percentage: 50, label: 'Mix', value: 1.0 },
                    },
                    feedback: { type: 'success', title: 'Good', message: 'Keep going' }
                }),
            };
        }),
    };
});

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn().mockImplementation((id, callback) => {
            // Simulate immediate callback for testing
            callback();
            return vi.fn();
        }),
        PRIORITY: { LOW: 1 }
    }
}));

// Mock Lucide icons locally to ensure all used icons are present
vi.mock('lucide-react', () => {
    const MockIcon = (name) => (props) => <div data-testid={`icon-${name}`} {...props} />;
    return {
        Activity: MockIcon('activity'),
        Info: MockIcon('info'),
        Mic: MockIcon('mic'),
        MicOff: MockIcon('mic-off'),
        Wind: MockIcon('wind'),
        Heart: MockIcon('heart'),
        Sun: MockIcon('sun'),
        Layers: MockIcon('layers'),
        AlertTriangle: MockIcon('alert-triangle'),
        CheckCircle: MockIcon('check-circle'),
        HelpCircle: MockIcon('help-circle'),
    };
});

describe('VoiceQualityAnalysis', () => {
    const mockDataRef = { current: { pitch: 200, volume: 0.1, tilt: -12, f2: 2000, f3Noise: -60, harmonicRatio: 1.0 } };
    const mockToggleAudio = vi.fn();

    beforeEach(() => {
        useProfile.mockReturnValue({
            activeProfile: 'fem',
            voiceProfiles: []
        });
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(
            <VoiceQualityAnalysis
                dataRef={mockDataRef}
                colorBlindMode={false}
                toggleAudio={mockToggleAudio}
                isAudioActive={false}
            />
        );
        expect(screen.getByText('Quad-Core Analyzer')).toBeInTheDocument();
        expect(screen.getByText('Start Analysis')).toBeInTheDocument();
    });

    it('initializes QuadCoreAnalysisService lazily', () => {
        render(
            <VoiceQualityAnalysis
                dataRef={mockDataRef}
                colorBlindMode={false}
                toggleAudio={mockToggleAudio}
                isAudioActive={false}
            />
        );
        // Should be instantiated once on render
        expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);
    });

    it('does not re-instantiate service on re-render', () => {
        const { rerender } = render(
            <VoiceQualityAnalysis
                dataRef={mockDataRef}
                colorBlindMode={false}
                toggleAudio={mockToggleAudio}
                isAudioActive={false}
            />
        );

        rerender(
            <VoiceQualityAnalysis
                dataRef={mockDataRef}
                colorBlindMode={true} // Change prop to force re-render
                toggleAudio={mockToggleAudio}
                isAudioActive={false}
            />
        );

        // Should still be 1
        expect(QuadCoreAnalysisService).toHaveBeenCalledTimes(1);
    });
});
