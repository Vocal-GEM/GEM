import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import PitchVisualizer from './PitchVisualizer';
import React from 'react';

// Mock contexts
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        voiceProfiles: [{ id: 'fem', genderRange: { min: 200, max: 300 }, targetRange: { min: 200, max: 300 } }],
        activeProfile: 'fem'
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false,
        settings: { genderFeedbackMode: 'neutral', showNorms: true }
    })
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        audioEngineRef: { current: {} }
    })
}));

vi.mock('../../hooks/useFeedback', () => ({
    useFeedback: () => ({
        settings: {},
        setSettings: vi.fn()
    })
}));

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
        PRIORITY: { HIGH: 1 }
    }
}));

// Mock child components
vi.mock('../ui/FeedbackControls', () => ({ default: () => <div data-testid="feedback-controls" /> }));
vi.mock('./GenderTimeline', () => ({ default: () => <div data-testid="gender-timeline" /> }));
vi.mock('./FeedbackManager', () => ({ default: () => <div data-testid="feedback-manager" /> }));

// Mock Canvas
const mockContext = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    setLineDash: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    arc: vi.fn(),
    fill: vi.fn(),
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({ width: 800, height: 400, left: 0, top: 0 }));

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        RotateCcw: () => <div data-testid="icon-rotate" />,
        HelpCircle: () => <div data-testid="icon-help" />,
        AlertTriangle: () => <div data-testid="icon-alert" />,
        X: () => <div data-testid="icon-x" />,
        Sparkles: () => <div data-testid="icon-sparkles" />,
        BarChart2: () => <div data-testid="icon-bar" />,
    };
});

describe('PitchVisualizer', () => {
    it('renders without crashing', () => {
        const dataRef = {
            current: {
                pitch: 220,
                history: [200, 210, 220],
                clarity: 0.9,
                resonanceScore: 80,
                f1: 600,
                formants: { f1: 600, f2: 1200 }
            }
        };
        const targetRange = { min: 180, max: 250 };

        render(
            <PitchVisualizer
                dataRef={dataRef}
                targetRange={targetRange}
                userMode="slp"
                exercise={null}
                onScore={vi.fn()}
                settings={{}}
            />
        );

        expect(screen.getByText('Fundamental Frequency (F0)')).toBeDefined();
        expect(screen.getByTestId('feedback-controls')).toBeDefined();

        // Check if canvas context was requested
        // expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
    });
});
