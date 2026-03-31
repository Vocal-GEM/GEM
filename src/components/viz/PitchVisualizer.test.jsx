import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchVisualizer from './PitchVisualizer';
import React from 'react';

// Mock Dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        unsubscribe: vi.fn(),
        PRIORITY: { HIGH: 1 }
    }
}));

vi.mock('../../services/NormsService', () => ({
    NormsService: {
        getNorms: vi.fn(() => ({ pitch: { min: 100, max: 200, label: 'Test Norm' } }))
    }
}));

vi.mock('../../services/GenderPerceptionPredictor', () => ({
    predictGenderPerception: vi.fn(() => ({ score: 0.5, label: 'Neutral' })),
    getPerceptionColor: vi.fn(() => '#000000'),
    AMBIGUITY_ZONE: { min: 160, max: 180 }
}));

vi.mock('../../hooks/useFeedback', () => ({
    useFeedback: vi.fn(() => ({
        settings: {},
        setSettings: vi.fn()
    }))
}));

// Mock Contexts
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        voiceProfiles: [{ id: 'fem', targetRange: { min: 170, max: 220 } }],
        activeProfile: 'fem'
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false,
        settings: { showNorms: true }
    })
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        audioEngineRef: { current: {} }
    })
}));

// Mock Components
vi.mock('../ui/FeedbackControls', () => ({ default: () => <div data-testid="feedback-controls" /> }));
vi.mock('./GenderTimeline', () => ({ default: () => <div data-testid="gender-timeline" /> }));
vi.mock('./FeedbackManager', () => ({ default: () => <div data-testid="feedback-manager" /> }));
vi.mock('lucide-react', () => ({
    RotateCcw: () => <div />,
    HelpCircle: () => <div />,
    AlertTriangle: () => <div />,
    X: () => <div />,
    Sparkles: () => <div />,
    BarChart2: () => <div />
}));

// Mock Canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    fillRect: vi.fn(),
    scale: vi.fn(),
    setLineDash: vi.fn(),
    drawImage: vi.fn(),
    canvas: { width: 300, height: 300 }
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('PitchVisualizer', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                pitch: 200,
                history: [190, 195, 200],
                clarity: 0.9,
                resonanceScore: 80,
                formants: { f1: 600, f2: 1200 }
            }
        };
        // Add getBoundingClientRect mock
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 300,
            height: 300,
            top: 0,
            left: 0,
            right: 300,
            bottom: 300,
        }));
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
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
        expect(document.querySelector('canvas')).toBeTruthy();
    });
});
