import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import PitchVisualizer from './PitchVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock Dependencies
vi.mock('../../context/ProfileContext', () => ({
    useProfile: vi.fn(() => ({
        voiceProfiles: [
            { id: 'fem', targetRange: { min: 170, max: 220 } },
            { id: 'masc', targetRange: { min: 90, max: 140 } }
        ],
        activeProfile: 'fem'
    }))
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: vi.fn(() => ({
        colorBlindMode: false,
        settings: {
            showNorms: true,
            genderFeedbackMode: 'neutral',
            homeNote: 200,
            feedback: { focusMode: false }
        }
    }))
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn(() => ({
        audioEngineRef: { current: {} }
    }))
}));

vi.mock('../../hooks/useFeedback', () => ({
    useFeedback: vi.fn(() => ({
        settings: {},
        setSettings: vi.fn()
    }))
}));

// Mock Child Components
vi.mock('../ui/FeedbackControls', () => ({
    default: () => <div data-testid="feedback-controls" />
}));

vi.mock('./GenderTimeline', () => ({
    default: () => <div data-testid="gender-timeline" />
}));

vi.mock('./FeedbackManager', () => ({
    default: () => <div data-testid="feedback-manager" />
}));

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { HIGH: 1 }
    }
}));

// Mock GenderPerceptionPredictor
vi.mock('../../services/GenderPerceptionPredictor', () => ({
    predictGenderPerception: vi.fn(() => ({ score: 0.5, label: 'Neutral' })),
    getPerceptionColor: vi.fn(() => '#ffffff'),
    AMBIGUITY_ZONE: { min: 150, max: 180 }
}));

// Mock Context Object - Stable reference
const mockContext = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    setLineDash: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    arc: vi.fn(),
};

const mockGetContext = vi.fn(() => mockContext);

HTMLCanvasElement.prototype.getContext = mockGetContext;

describe('PitchVisualizer', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                pitch: 200,
                history: [190, 195, 200, 205],
                clarity: 0.95,
                formants: { f1: 500, f2: 1500 },
                resonanceScore: 80
            }
        };
        // Mock getBoundingClientRect
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 800,
            height: 400,
            top: 0,
            left: 0,
            right: 800,
            bottom: 400,
        }));

        // Mock window.devicePixelRatio
        window.devicePixelRatio = 2;

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(
            <PitchVisualizer
                dataRef={dataRef}
                targetRange={{ min: 170, max: 220 }}
                userMode="user"
            />
        );
        expect(screen.getByText('Pitch')).toBeInTheDocument();
    });

    it('initializes and subscribes to render coordinator', () => {
        render(
            <PitchVisualizer
                dataRef={dataRef}
                targetRange={{ min: 170, max: 220 }}
                userMode="user"
            />
        );
        expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
            'pitch-visualizer',
            expect.any(Function),
            expect.any(Number)
        );
    });

    it('handles drawing loop execution', () => {
        render(
            <PitchVisualizer
                dataRef={dataRef}
                targetRange={{ min: 170, max: 220 }}
                userMode="user"
            />
        );

        // Get the loop callback
        const loopCallback = renderCoordinator.subscribe.mock.calls[0][1];

        // Execute the loop inside act
        act(() => {
            loopCallback();
        });

        // Verify canvas context calls on the STABLE mockContext
        expect(mockContext.clearRect).toHaveBeenCalled();
        expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('renders image resources correctly in useEffect', () => {
        // Spy on Image constructor if possible, or check if component renders.
        // Since we modified the refs to be initialized in useEffect,
        // we mainly check that no errors are thrown during mount.

        const { container } = render(
            <PitchVisualizer
                dataRef={dataRef}
                targetRange={{ min: 170, max: 220 }}
                userMode="user"
            />
        );
        expect(container).toBeDefined();
    });
});
