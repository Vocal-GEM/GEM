import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LTASPlot from './LTASPlot';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        unsubscribe: vi.fn(),
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Mock AudioContext
const mockDataRef = { current: { spectrum: new Float32Array(1024).fill(0) } };
vi.mock('../../context/AudioContext', () => ({
    useAudio: () => ({
        dataRef: mockDataRef
    })
}));

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    canvas: { width: 600, height: 300 }
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = vi.fn();

describe('LTASPlot', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('subscribes to renderCoordinator and does not use internal RAF loop', () => {
        render(<LTASPlot />);

        // Should subscribe to RenderCoordinator
        expect(renderCoordinator.subscribe).toHaveBeenCalled();

        // Get the callback
        const [id, callback] = renderCoordinator.subscribe.mock.calls[0];
        expect(typeof callback).toBe('function');

        // Execute the callback to ensure it doesn't trigger recursion
        callback();

        // Should NOT call requestAnimationFrame
        expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
    });
});
