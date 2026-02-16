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
// Use globalThis instead of global to satisfy linter
globalThis.requestAnimationFrame = mockRequestAnimationFrame;

describe('PitchOrb', () => {
    let dataRef;
    let getBoundingClientRectMock;

    beforeEach(() => {
        dataRef = { current: { pitch: 200 } };

        // Mock getBoundingClientRect
        getBoundingClientRectMock = vi.fn(() => ({
            width: 300,
            height: 300,
            top: 0,
            left: 0,
            right: 300,
            bottom: 300,
        }));
        Element.prototype.getBoundingClientRect = getBoundingClientRectMock;

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
        // eslint-disable-next-line no-unused-vars
        const [_id, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback
        callback();

        // Should not call rAF
        expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    it('should NOT call getBoundingClientRect inside the render loop (optimized behavior)', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Wait for potential dynamic import resolution
        await new Promise(resolve => setTimeout(resolve, 0));

        // Initial render triggers getBoundingClientRect inside handleResize
        // verify it was called once for initialization
        expect(getBoundingClientRectMock).toHaveBeenCalled();

        // Reset the mock to check if it's called AGAIN during loop
        getBoundingClientRectMock.mockClear();

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        // eslint-disable-next-line no-unused-vars
        const [_id, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback (simulate one frame)
        callback();

        // It should NOT call getBoundingClientRect in the optimized implementation
        expect(getBoundingClientRectMock).not.toHaveBeenCalled();
    });
});
