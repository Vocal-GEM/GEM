import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SpectrumAnalyzer from './SpectrumAnalyzer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { HIGH: 1 }
    }
}));

// Mock LPC Analyzer
vi.mock('../../utils/lpcAnalyzer', () => ({
    lpcAnalyzer: {
        calculateLPC: vi.fn(() => ({
            response: new Float32Array(128).fill(-50)
        }))
    }
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
globalThis.requestAnimationFrame = mockRequestAnimationFrame;

// Mock Canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
    })),
    canvas: { width: 800, height: 400 }
}));

describe('SpectrumAnalyzer', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { spectrum: new Uint8Array(1024).fill(0) } };
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            width: 800,
            height: 400,
            top: 0,
            left: 0
        }));
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders successfully', () => {
        const { getByText } = render(<SpectrumAnalyzer dataRef={dataRef} />);
        expect(getByText('Spectrum Analysis')).toBeInTheDocument();
    });

    it('subscribes to RenderCoordinator', async () => {
        render(<SpectrumAnalyzer dataRef={dataRef} />);
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
});
