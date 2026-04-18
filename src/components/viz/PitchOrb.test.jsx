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
    save: vi.fn(),
    restore: vi.fn(),
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
        // Mock ResizeObserver
        globalThis.ResizeObserver = class {
            constructor(callback) {
                this.callback = callback;
            }
            observe(element) {
                // Instantly trigger the callback with mock dimensions to simulate layout
                this.callback([{
                    contentRect: { width: 300, height: 300 }
                }]);
            }
            unobserve() {}
            disconnect() {}
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
    });
});
