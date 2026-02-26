import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SpectrumAnalyzer from './SpectrumAnalyzer';
import { renderCoordinator } from '../../services/RenderCoordinator';
import { lpcAnalyzer } from '../../utils/lpcAnalysis';
import React from 'react';

// Mock dependencies
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        unsubscribe: vi.fn(),
        PRIORITY: { MEDIUM: 1 }
    }
}));

vi.mock('../../utils/lpcAnalysis', () => ({
    lpcAnalyzer: {
        analyze: vi.fn(() => new Float32Array(512).fill(0))
    }
}));

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    canvas: { width: 500, height: 200 }
}));

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame);

describe('SpectrumAnalyzer', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { spectrum: new Float32Array(1024).fill(0.5) } };
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders successfully', () => {
        render(<SpectrumAnalyzer dataRef={dataRef} />);
        expect(screen.getByText('Formant Analysis')).toBeDefined();
    });

    it('subscribes to render loop', async () => {
        render(<SpectrumAnalyzer dataRef={dataRef} />);
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
});
