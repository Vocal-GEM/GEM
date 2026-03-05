import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PitchOrb from './PitchOrb';
import { renderCoordinator } from '../../services/RenderCoordinator';

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

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn((cb) => cb());
globalThis.requestAnimationFrame = mockRequestAnimationFrame;

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe(element) {
        this.callback([{ target: element, contentRect: { width: 300, height: 300 } }]);
    }
    unobserve() {}
    disconnect() {}
};

describe('PitchOrb', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { pitch: 200 } };
        // Keep getBoundingClientRect mock for ResizeObserver initial call
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

    it('should not call requestAnimationFrame recursively in the draw loop', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Wait for potential dynamic import resolution
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback
        callback();

        // Verify mockRAF is called during initial render to update dimensions via ResizeObserver
        // But not in the draw loop
        const mockRAFCount = mockRequestAnimationFrame.mock.calls.length;

        callback();

        // Ensure requestAnimationFrame wasn't called AGAIN in the draw loop itself
        expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(mockRAFCount);
    });
});
