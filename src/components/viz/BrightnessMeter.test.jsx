import { render, screen, cleanup, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import BrightnessMeter from './BrightnessMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe fn
        PRIORITY: { MEDIUM: 2 }
    }
}));

// Mock lucide-react with top-level imports to avoid require()
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    const MockIcon = (name) => {
        const Icon = (props) => <div data-testid={name} {...props} />;
        Icon.displayName = name;
        return Icon;
    };

    return {
        ...actual,
        Sun: MockIcon('Sun'),
        Moon: MockIcon('Moon'),
        Info: MockIcon('Info'),
        Smile: MockIcon('Smile')
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
        // eslint-disable-next-line no-unused-vars
        const [_id, _callback, priority] = renderCoordinator.subscribe.mock.calls[0];
        expect(priority).toBe(renderCoordinator.PRIORITY.MEDIUM);
    });

    it('updates based on dataRef via coordinator callback', () => {
        render(<BrightnessMeter dataRef={dataRef} />);

        // Get the callback passed to subscribe
        // Signature: subscribe(id, callback, priority)
        const callback = renderCoordinator.subscribe.mock.calls[0][1];

        // Update data
        dataRef.current.f2 = 2300; // Bright target

        // Manually trigger callback (simulate render loop)
        act(() => {
            callback();
        });

        // The status label becomes "Bright ✓"
        expect(screen.getByText('Bright ✓')).toBeDefined();
    });
});
