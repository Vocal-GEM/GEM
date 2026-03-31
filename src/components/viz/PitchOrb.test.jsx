/* eslint-disable no-undef */
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
global.requestAnimationFrame = mockRequestAnimationFrame;

describe('PitchOrb', () => {
    let dataRef;
    let mockGetBoundingClientRect;

    beforeEach(() => {
        dataRef = { current: { pitch: 200 } };

        // Mock getBoundingClientRect to ensure it is NOT called
        mockGetBoundingClientRect = vi.fn(() => ({
            width: 300,
            height: 300,
            top: 0,
            left: 0,
            right: 300,
            bottom: 300,
        }));
        Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;

        // Mock ResizeObserver using a class so 'new' keyword works
        global.ResizeObserver = class ResizeObserver {
            constructor(callback) {
                this.callback = callback;
            }
            observe = vi.fn((element) => {
                // Trigger callback immediately to simulate size availability
                this.callback([{
                    contentRect: { width: 300, height: 300 }
                }]);
            });
            disconnect = vi.fn();
            unobserve = vi.fn();
        };

        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('should not call requestAnimationFrame recursively in the draw loop', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Wait for effect
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [id, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback
        callback();

        expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });

    it('should not call getBoundingClientRect in the draw loop (optimization check)', async () => {
        render(<PitchOrb dataRef={dataRef} />);

        // Wait for effect
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [id, callback] = renderCoordinator.subscribe.mock.calls[0];

        // Execute the callback
        callback();

        // If getBoundingClientRect is called, the optimization is missing
        expect(mockGetBoundingClientRect).not.toHaveBeenCalled();
    });
});
