import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchOrb from './PitchOrb';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        unsubscribe: vi.fn(),
        PRIORITY: { CRITICAL: 0 }
    }
}));

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    scale: vi.fn(),
    createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
    })),
    canvas: { width: 300, height: 300 }
}));

// Mock ResizeObserver
let resizeCallback = null;
globalThis.ResizeObserver = class ResizeObserver {
    constructor(cb) {
        resizeCallback = cb;
    }
    observe() {
        // Trigger immediately for initial size logic if needed
        if (resizeCallback) {
             resizeCallback([{ contentRect: { width: 300, height: 300 } }]);
        }
    }
    unobserve() {}
    disconnect() {}
};

describe('PitchOrb', () => {
    let dataRef;
    let getBoundingClientRectSpy;

    beforeEach(() => {
        dataRef = { current: { pitch: 200 } };
        // Spy on getBoundingClientRect
        getBoundingClientRectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
            width: 300,
            height: 300,
            top: 0,
            left: 0,
            right: 300,
            bottom: 300,
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('should NOT trigger layout thrashing (getBoundingClientRect) inside the animation loop', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Wait for effects
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [id, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Reset spy counts from initial render/setup
        getBoundingClientRectSpy.mockClear();

        // Run the animation loop once
        callback();

        // Expectation: getBoundingClientRect should NOT be called in the loop
        // (This fails if the optimization is missing)
        expect(getBoundingClientRectSpy).not.toHaveBeenCalled();
    });
});
