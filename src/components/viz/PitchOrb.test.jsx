import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import PitchOrb from './PitchOrb';

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        colorBlindMode: false,
        settings: {
            pitchRange: { min: 100, max: 300 }
        }
    })
}));

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { HIGH: 1 }
    }
}));

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('PitchOrb', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = {
            current: {
                pitch: 220,
                clarity: 0.95,
                volume: -20
            }
        };
    });

    it('renders without crashing', () => {
        const { container } = render(<PitchOrb dataRef={dataRef} />);
        expect(container.firstChild).toBeDefined();
    });

    it('subscribes to RenderCoordinator', async () => {
        const { renderCoordinator } = await import('../../services/RenderCoordinator');
        render(<PitchOrb dataRef={dataRef} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });
});
