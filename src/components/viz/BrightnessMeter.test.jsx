import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BrightnessMeter from './BrightnessMeter';
import React from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe fn
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Override global mock for this test to include Smile
vi.mock('lucide-react', async () => {
    const React = await import('react');
    const createIcon = (name) => {
        const Comp = (props) => React.createElement('div', { ...props, 'data-testid': name });
        Comp.displayName = name;
        return Comp;
    };

    return {
        Sun: createIcon('Sun'),
        Moon: createIcon('Moon'),
        Info: createIcon('Info'),
        Smile: createIcon('Smile')
    };
});

describe('BrightnessMeter', () => {
    let dataRef;

    beforeEach(() => {
        dataRef = { current: { f2: 0 } };
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders successfully', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(screen.getByText('Brightness Meter')).toBeDefined();
    });

    it('subscribes to RenderCoordinator', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
        const [, , priority] = renderCoordinator.subscribe.mock.calls[0];
        expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
    });

    it('updates based on dataRef via coordinator callback', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        const callback = renderCoordinator.subscribe.mock.calls[0][1];
        dataRef.current.f2 = 2300; // Bright target
        act(() => {
            callback();
        });
        expect(screen.getByText('Bright ✓')).toBeDefined();
    });
});
