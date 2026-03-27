import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import SpectrumAnalyzer from './SpectrumAnalyzer';

// Mock Dependencies
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: {
            spectrogramColorScheme: 'viridis'
        }
    })
}));

vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { HIGH: 1 }
    }
}));

// Mock LPC Analyzer
vi.mock('../../utils/lpcAnalyzer', () => ({
    LPCAnalyzer: class {
        calculateFormants() { return [500, 1500, 2500]; }
    }
}));

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('SpectrumAnalyzer', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                spectrum: new Float32Array(512).fill(-50), // Mock dB values
                sampleRate: 44100
            }
        };
    });

    it('renders canvas element', () => {
        const { container } = render(<SpectrumAnalyzer dataRef={dataRef} />);
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeDefined();
    });

    it('subscribes to render loop', async () => {
        const { renderCoordinator } = await import('../../services/RenderCoordinator');
        render(<SpectrumAnalyzer dataRef={dataRef} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
});
