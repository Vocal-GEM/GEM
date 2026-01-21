import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchVisualizer from './PitchVisualizer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        unsubscribe: vi.fn(),
        PRIORITY: { HIGH: 1 }
    }
}));

// Mock Contexts
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        voiceProfiles: [],
        activeProfile: 'neutral'
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false,
        settings: {}
    })
}));

vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        audioEngineRef: { current: null }
    })
}));

vi.mock('../../hooks/useFeedback', () => ({
    useFeedback: () => ({
        settings: {},
        setSettings: vi.fn()
    })
}));

// Mock Canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    setLineDash: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    canvas: { width: 300, height: 300 }
}));

describe('PitchVisualizer', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { pitch: 200, history: [190, 200] } };
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('subscribes to RenderCoordinator on mount', () => {
        render(<PitchVisualizer dataRef={dataRef} targetRange={{min: 100, max: 300}} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalledWith(
            'pitch-visualizer',
            expect.any(Function),
            renderCoordinator.PRIORITY.HIGH
        );
    });

    it('does not crash during render loop execution', () => {
        render(<PitchVisualizer dataRef={dataRef} targetRange={{min: 100, max: 300}} />);
        const callback = renderCoordinator.subscribe.mock.calls[0][1];

        // Run loop multiple times
        callback();
        callback();

        // Should not throw
    });
});
