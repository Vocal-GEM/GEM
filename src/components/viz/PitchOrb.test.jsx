import { render, cleanup, act } from '@testing-library/react';
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
const contextMock = {
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
    canvas: { width: 0, height: 0 }
};

HTMLCanvasElement.prototype.getContext = vi.fn(() => contextMock);

// Mock ResizeObserver
const observeMock = vi.fn();
const disconnectMock = vi.fn();
const unobserveMock = vi.fn();
let lastObserverCallback = null;

class MockResizeObserver {
    constructor(callback) {
        lastObserverCallback = callback;
    }
    observe = observeMock;
    disconnect = disconnectMock;
    unobserve = unobserveMock;
}

global.ResizeObserver = MockResizeObserver;

describe('PitchOrb', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { pitch: 200 } };
        vi.clearAllMocks();
        contextMock.canvas.width = 0;
        contextMock.canvas.height = 0;
        lastObserverCallback = null;
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should subscribe to renderCoordinator and handle resize', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Verify ResizeObserver was instantiated and observe called
        expect(observeMock).toHaveBeenCalled();

        // Trigger Resize
        expect(lastObserverCallback).toBeInstanceOf(Function);
        act(() => {
            lastObserverCallback([{
                contentRect: { width: 300, height: 300 }
            }]);
        });

        // Verify that dimensions were updated (indirectly via loop or verify contextMock interactions if possible)
        // Since we cannot easily check the internal state or DOM element properties (as they are mocked/detached),
        // we check if drawing happens with correct dimensions.

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [id, loopCallback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the draw loop callback
        loopCallback();

        // Check if clearRect was called with correct dimensions
        expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, 300, 300);
    });
});
