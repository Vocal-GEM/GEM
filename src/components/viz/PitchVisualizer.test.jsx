import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchVisualizer from './PitchVisualizer';
import React from 'react';

// Mock Hooks
vi.mock('../../context/ProfileContext', () => ({
    useProfile: vi.fn(() => ({
        voiceProfiles: [
            { id: 'fem', targetRange: { min: 180, max: 250 } },
            { id: 'masc', targetRange: { min: 80, max: 140 } }
        ],
        activeProfile: 'fem'
    }))
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: vi.fn(() => ({
        colorBlindMode: false,
        settings: {
            spectrogramColorScheme: 'magma',
            genderFeedbackMode: 'neutral',
            homeNote: 200,
            feedback: { focusMode: false }
        }
    }))
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: vi.fn(() => ({
        audioEngineRef: { current: {} },
        dataRef: { current: { history: [], pitch: 0, formants: { f1: 0, f2: 0 } } }
    }))
}));

vi.mock('../../hooks/useFeedback', () => ({
    useFeedback: vi.fn(() => ({
        settings: {},
        setSettings: vi.fn()
    }))
}));

// Mock Services
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        unsubscribe: vi.fn(),
        PRIORITY: { HIGH: 1 }
    }
}));

vi.mock('../../services/NormsService', () => ({
    NormsService: {
        getNorms: vi.fn(() => ({ pitch: { min: 100, max: 200, label: 'Test' } }))
    }
}));

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    scale: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    drawImage: vi.fn(),
    setLineDash: vi.fn(),
    canvas: { width: 300, height: 300 }
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor(callback) {}
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

describe('PitchVisualizer', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { history: [], pitch: 0, formants: { f1: 0, f2: 0 } } };
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        const targetRange = { min: 180, max: 250 };
        const userMode = 'practice';

        render(
            <PitchVisualizer
                dataRef={dataRef}
                targetRange={targetRange}
                userMode={userMode}
                onScore={vi.fn()}
            />
        );

        // Expect it to render (if it doesn't throw)
        expect(document.body).toBeTruthy();
    });
});
