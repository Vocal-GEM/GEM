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
const mockContext = {
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
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext);

globalThis.ResizeObserver = class ResizeObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe(element) {
        // Immediately trigger the callback with mock dimensions to simulate layout
        this.callback([{
            contentRect: { width: 300, height: 300 }
        }]);
    }
    unobserve() {}
    disconnect() {}
};

describe('PitchOrb', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { pitch: 200 } };
        // Spy on getBoundingClientRect to allow assertions
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
            width: 300,
            height: 300,
            top: 0,
            left: 0,
            right: 300,
            bottom: 300,
        });
        vi.clearAllMocks();

        // Reset the mockContext's spies
        for(let key in mockContext) {
            if (typeof mockContext[key] === 'function' && mockContext[key].mockClear) {
                mockContext[key].mockClear();
            }
        }
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('should not call getBoundingClientRect recursively in the draw loop', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Wait for potential dynamic import resolution
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback
        callback();

        // Ensure we actually drew something (proving early return wasn't hit)
        expect(mockContext.clearRect).toHaveBeenCalled();

        // Ensure getBoundingClientRect was NOT called during the draw loop
        // It might be called during initial render by other hooks, but shouldn't be called by the draw callback
        const getBoundingClientRectCalls = Element.prototype.getBoundingClientRect.mock.calls.length;

        callback();
        callback();

        expect(Element.prototype.getBoundingClientRect.mock.calls.length).toBe(getBoundingClientRectCalls);
    });
});
