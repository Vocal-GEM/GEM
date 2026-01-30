import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BrightnessMeter from './BrightnessMeter';
import React from 'react';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn().mockReturnValue(vi.fn()), // Returns unsubscribe fn
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Override global mock for this test to include Smile
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const React = await import('react');

    const createIcon = (name) => {
        const Icon = (props) => React.createElement('div', { ...props, 'data-testid': name });
        Icon.displayName = name;
        return Icon;
    };

    return {
        ...actual,
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
        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders successfully', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(screen.getByText('Brightness Meter')).toBeDefined();
    });

    it('subscribes to RenderCoordinator', () => {
        render(<BrightnessMeter dataRef={dataRef} />);

        // Check if subscribe was called
        expect(renderCoordinator.subscribe).toHaveBeenCalled();

        // subscribe(id, callback, priority)
        // Verify priority argument (3rd arg) matches MEDIUM
        const calls = renderCoordinator.subscribe.mock.calls;
        expect(calls.length).toBeGreaterThan(0);

        const priorityArg = calls[0][2];
        expect(priorityArg).toBe(renderCoordinator.PRIORITY.MEDIUM);
    });

    it('updates based on dataRef via coordinator callback', () => {
        render(<BrightnessMeter dataRef={dataRef} />);

        // Get the callback passed to subscribe
        const calls = renderCoordinator.subscribe.mock.calls;
        // Assuming calls[0] is the subscription we care about.
        // If subscribe is called multiple times (e.g. strict mode or other hooks),
        // we might need to find the right one, but typically it's the first one here.
        const callback = calls[0][1];

        // Update data
        dataRef.current.f2 = 2300; // Bright target

        // Manually trigger callback (simulate render loop)
        act(() => {
            if (typeof callback === 'function') {
                callback();
            }
        });

        // The status label becomes "Bright ✓"
        expect(screen.getByText('Bright ✓')).toBeDefined();
    });
});
