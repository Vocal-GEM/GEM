
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import BrightnessMeter from './BrightnessMeter';
import { renderCoordinator } from '../../services/RenderCoordinator';

// Mock the RenderCoordinator
vi.mock('../../services/RenderCoordinator', () => ({
    renderCoordinator: {
        subscribe: vi.fn(() => vi.fn()),
        PRIORITY: { MEDIUM: 1 }
    }
}));

// Override global mock for this test to include Smile
vi.mock('lucide-react', async () => {
    const React = await import('react');
    const createIcon = (name) => (props) => React.createElement('div', { ...props, 'data-testid': name });

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
        dataRef = { current: { f2: 1500 } };
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders with initial neutral state', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(screen.getByText('Brightness Meter')).toBeDefined();
        expect(screen.getByText('Neutral')).toBeDefined();
    });

    it('subscribes to renderCoordinator on mount', () => {
        render(<BrightnessMeter dataRef={dataRef} />);
        expect(renderCoordinator.subscribe).toHaveBeenCalled();
    });

    it('cleans up subscription on unmount', () => {
        const unsubscribe = vi.fn();
        renderCoordinator.subscribe.mockReturnValue(unsubscribe);

        const { unmount } = render(<BrightnessMeter dataRef={dataRef} />);
        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
