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

// Mock Hooks
vi.mock('../../context/ProfileContext', () => ({
    useProfile: () => ({
        activeProfile: 'neutral',
        voiceProfiles: [{ id: 'fem', genderRange: { min: 100, max: 200 } }, { id: 'masc', genderRange: { min: 50, max: 150 } }]
    })
}));

vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false,
        showNorms: true,
        genderFeedbackMode: 'neutral',
        homeNote: 110,
        settings: {
            showNorms: true,
            genderFeedbackMode: 'neutral',
            homeNote: 110
        }
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

vi.mock('../ui/FeedbackControls', () => ({
    default: () => <div data-testid="feedback-controls" />
}));

vi.mock('./GenderTimeline', () => ({
    default: () => <div data-testid="gender-timeline" />
}));

vi.mock('./FeedbackManager', () => ({
    default: () => <div data-testid="feedback-manager" />
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe(element) {
        // Immediately trigger resize to set dimensions
        this.callback([{ contentRect: { width: 800, height: 600 } }]);
    }
    unobserve() {}
    disconnect() {}
};

// Mock Image
global.Image = class {
    constructor() {
        this.src = '';
        this.complete = true;
    }
};

// Mock Canvas getContext
const mockCtx = {
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
    getImageData: vi.fn(),
    putImageData: vi.fn(),
    drawImage: vi.fn(), // Mock drawImage
    canvas: { width: 800, height: 600 } // Ensure width/height exist
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);
HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600
}));

describe('PitchVisualizer Performance', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                pitch: 200,
                history: new Array(100).fill(200), // Simulate stable pitch history
                clarity: 0.9,
                f1: 0,
                resonanceScore: 50
            }
        };
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('measures draw calls in the render loop', async () => {
        const targetRange = { min: 100, max: 200 };

        render(<PitchVisualizer
            dataRef={dataRef}
            targetRange={targetRange}
            userMode="practice"
        />);

        // Wait for potential effects
        await new Promise(resolve => setTimeout(resolve, 0));

        // Get the subscription callback
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const callback = renderCoordinator.subscribe.mock.calls[0][1];

        // Reset mocks before measuring
        mockCtx.stroke.mockClear();
        mockCtx.beginPath.mockClear();
        mockCtx.moveTo.mockClear();

        // Execute one frame
        callback();

        // Calculate expected grid lines
        // Default zoom: min=50, max=350. Range=300. Step=50.
        // Lines at: 50, 100, 150, 200, 250, 300. (6 lines)
        // Plus Target Zone lines (2 dashed lines)
        // Plus Crossover line (1 dashed line)
        // Plus Home Note line (1 dashed line if enabled)
        // Plus Trace segments (batched by color, so ~1-2 calls if pitch is stable)

        // Total expected stroke calls (unoptimized):
        // 6 grid lines + 2 target lines + 1 crossover + 1 home note + 1 trace = ~11 calls.

        // Optimized expectation:
        // 1 grid batch + 2 target + 1 crossover + 1 home + 1 trace = ~6 calls.

        console.log(`Stroke calls: ${mockCtx.stroke.mock.calls.length}`);

        // Assert that we are capturing calls
        expect(mockCtx.stroke).toHaveBeenCalled();
    });
});
