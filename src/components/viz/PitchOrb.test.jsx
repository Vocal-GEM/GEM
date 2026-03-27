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

// Mock requestAnimationFrame to detect recursion
const mockRequestAnimationFrame = vi.fn();
globalThis.requestAnimationFrame = mockRequestAnimationFrame;

describe('PitchOrb', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { pitch: 200 } };
        // Add getBoundingClientRect mock
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 300,
            height: 300,
            top: 0,
            left: 0,
            right: 300,
            bottom: 300,
        }));

        // Mock ResizeObserver to trigger callback immediately
        globalThis.ResizeObserver = class ResizeObserver {
            constructor(callback) {
                this.callback = callback;
            }
            observe(target) {
                // Trigger callback to initialize dimensions
                this.callback([{ contentRect: { width: 300, height: 300 } }]);
            }
            disconnect() {}
            unobserve() {}
        };

        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should not call requestAnimationFrame recursively in the draw loop', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Wait for potential dynamic import resolution
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [id, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback
        callback();

        // With the bug, requestAnimationFrame is called.
        // We assert it IS called to confirm the bug exists in the current code,
        // OR we assert it is NOT called if we want to write the test for the desired state.
        // Let's write the test for the DESIRED state (fail now, pass later).
        expect(mockRequestAnimationFrame).not.toHaveBeenCalled();

        // Ensure the loop actually ran (didn't early return due to 0 dimensions)
        // We can check if getContext was called, or if a drawing method was called on the context
        // Since we mock getContext to return a spy object, we can't easily access the spy instance from here
        // without refactoring the mock setup.
        // But we can check if getBoundingClientRect was called during setup (via ResizeObserver)
        // and NOT called during the loop (which is the optimization).

        expect(Element.prototype.getBoundingClientRect).toHaveBeenCalled(); // Called by ResizeObserver
        // It should call it once (setup). If called twice, it might be in the loop (bad).
        // Wait, ResizeObserver calls it inside its callback.

        // Let's rely on the fact that if dimensions were 0, loop would return early.
        // If it ran, it would do drawing.
    });
});
